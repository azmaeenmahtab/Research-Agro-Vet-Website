import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export interface ProductFilterParams {
  category?: string;
  species?: string;
  search?: string;
  featured?: boolean;
  limit?: number;
  page?: number;
}

export async function getFeaturedProducts(limit = 8) {
  const products = await prisma.product.findMany({
    where: { status: 'ACTIVE', isFeatured: true },
    include: { variants: { orderBy: { sellingPrice: 'asc' } }, category: true, categories: true },
    take: limit,
    orderBy: { createdAt: 'desc' },
  });

  if (products.length > 0) return products;

  // Fallback to top active products if none are flagged as featured
  return prisma.product.findMany({
    where: { status: 'ACTIVE' },
    include: { variants: { orderBy: { sellingPrice: 'asc' } }, category: true, categories: true },
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
}

export function buildProductSearchWhere(search: string): Prisma.ProductWhereInput {
  const raw = search.trim();
  if (!raw) return {};

  const rawLower = raw.toLowerCase();
  const tokens = rawLower.split(/[\s\-_,./\\]+/).filter(Boolean);
  const alphanumericOnly = rawLower.replace(/[^a-z0-9]/g, '');

  // For each token, generate common veterinary product variations
  const tokenConditions = tokens.map((token) => {
    const variants = new Set<string>();
    variants.add(token);

    // If token starts with "re" (e.g. "recal", "refat", "rezinc", "rebovi", "rezyme")
    if (token.startsWith('re') && token.length >= 4) {
      const rest = token.slice(2);
      variants.add(`re-${rest}`);
      variants.add(`re - ${rest}`);
      variants.add(`re ${rest}`);
      if (rest.length >= 3) {
        variants.add(rest);
      }
    }

    // If token has "plus" inside (e.g. "adplusd", "zincplus", "fatplus", "calplus")
    if (token.includes('plus') && token !== 'plus') {
      const [before, after] = token.split('plus');
      if (before && after) {
        variants.add(`${before} plus ${after}`);
        variants.add(`${before}-${after}`);
      } else if (before) {
        variants.add(`${before} plus`);
        variants.add(`${before}-plus`);
        variants.add(before);
      } else if (after) {
        variants.add(`plus ${after}`);
      }
    }

    // Common abbreviations & shorthand
    if (token === 'pp') variants.add('p.p');
    if (token === 'ms') variants.add('m.s');
    if (token === 'ad') variants.add('a.d');
    if (token === 'ad3e' || token === 'ad3') {
      variants.add('ad3');
      variants.add('ad3 e');
      variants.add('ad3-e');
      variants.add('ad-3');
    }

    const variantList = Array.from(variants);

    const matchRules: Prisma.ProductWhereInput[] = variantList.flatMap((v) => [
      { nameEn: { contains: v, mode: 'insensitive' as Prisma.QueryMode } },
      { nameBn: { contains: v } },
      { slug: { contains: v, mode: 'insensitive' as Prisma.QueryMode } },
      { composition: { contains: v, mode: 'insensitive' as Prisma.QueryMode } },
      { indication: { contains: v, mode: 'insensitive' as Prisma.QueryMode } },
      { searchKeywords: { has: v.toLowerCase() } },
      { variants: { some: { sku: { contains: v, mode: 'insensitive' as Prisma.QueryMode } } } },
      { variants: { some: { packSize: { contains: v, mode: 'insensitive' as Prisma.QueryMode } } } },
      { category: { nameEn: { contains: v, mode: 'insensitive' as Prisma.QueryMode } } },
      { category: { nameBn: { contains: v } } },
      { categories: { some: { nameEn: { contains: v, mode: 'insensitive' as Prisma.QueryMode } } } },
      { categories: { some: { nameBn: { contains: v } } } },
    ]);

    return { OR: matchRules };
  });

  // Direct multi-word queries & permutations
  const directVariants = new Set<string>();
  directVariants.add(raw);
  directVariants.add(rawLower);

  // If raw has hyphens, add version without hyphens and with spaces
  if (raw.includes('-')) {
    directVariants.add(raw.replace(/-/g, ' '));
    directVariants.add(raw.replace(/\s*-\s*/g, ' - '));
    directVariants.add(raw.replace(/-/g, ''));
  }
  // If raw has spaces, add version with hyphens and without spaces
  if (raw.includes(' ')) {
    directVariants.add(raw.replace(/\s+/g, '-'));
    directVariants.add(raw.replace(/\s+/g, ' - '));
    directVariants.add(raw.replace(/\s+/g, ''));
  }

  // Handle merged "plus" in direct query (e.g. "adplusd" -> "ad plus d")
  if (rawLower.includes('plus')) {
    const expanded = rawLower.replace(/([a-z0-9]+)plus([a-z0-9]+)/gi, '$1 plus $2');
    if (expanded !== rawLower) {
      directVariants.add(expanded);
      directVariants.add(expanded.replace(/\s+/g, '-'));
    }
  }

  const directConditions: Prisma.ProductWhereInput[] = Array.from(directVariants).flatMap((v) => [
    { nameEn: { contains: v, mode: 'insensitive' as Prisma.QueryMode } },
    { nameBn: { contains: v } },
    { slug: { contains: v, mode: 'insensitive' as Prisma.QueryMode } },
    { composition: { contains: v, mode: 'insensitive' as Prisma.QueryMode } },
    { indication: { contains: v, mode: 'insensitive' as Prisma.QueryMode } },
    { searchKeywords: { has: v.toLowerCase() } },
  ]);

  if (alphanumericOnly && alphanumericOnly.length >= 2) {
    directConditions.push(
      { slug: { contains: alphanumericOnly, mode: 'insensitive' as Prisma.QueryMode } },
      { variants: { some: { sku: { contains: alphanumericOnly, mode: 'insensitive' as Prisma.QueryMode } } } }
    );
  }

  return {
    OR: [
      ...(tokens.length > 0 ? [{ AND: tokenConditions }] : []),
      ...directConditions,
    ],
  };
}

function calculateSearchRelevance(product: any, query: string): number {
  const q = query.toLowerCase().trim();
  const qStripped = q.replace(/[^a-z0-9]/g, '');
  const tokens = q.split(/[\s\-_,./\\]+/).filter(Boolean);
  const nameEn = (product.nameEn || '').toLowerCase();
  const nameBn = (product.nameBn || '').toLowerCase();
  const nameEnStripped = nameEn.replace(/[^a-z0-9]/g, '');
  const slug = (product.slug || '').toLowerCase();
  const slugStripped = slug.replace(/[^a-z0-9]/g, '');
  const keywords: string[] = product.searchKeywords || [];
  const comp = (product.composition || '').toLowerCase();
  const ind = (product.indication || '').toLowerCase();

  let score = 0;

  // Exact full name match (including normalized alphanumeric)
  if (nameEn === q || nameBn === q || (qStripped && nameEnStripped === qStripped)) score += 3000;

  // Stripped normalized name starts with or contains query (e.g. "refat" -> "re-fat-plus")
  if (qStripped && qStripped.length >= 2) {
    if (nameEnStripped.startsWith(qStripped)) score += 2000;
    else if (nameEnStripped.includes(qStripped)) score += 1200;

    if (slugStripped.startsWith(qStripped)) score += 1000;
    else if (slugStripped.includes(qStripped)) score += 600;
  }

  // Name starts with query
  if (nameEn.startsWith(q)) score += 1000;

  // Name contains full query
  if (nameEn.includes(q) || nameBn.includes(q)) score += 500;

  // Slug contains full query
  if (slug.includes(q)) score += 300;

  // Name contains all tokens
  if (tokens.length > 1 && tokens.every((t) => nameEn.includes(t))) score += 250;

  // Name contains any token
  tokens.forEach((t) => {
    if (nameEn.includes(t)) score += 60;
  });

  // Keywords match
  if (keywords.some((k) => k.toLowerCase() === q || (qStripped && k.toLowerCase().replace(/[^a-z0-9]/g, '') === qStripped))) score += 150;
  if (keywords.some((k) => tokens.some((t) => k.toLowerCase().includes(t)))) score += 50;

  // Composition / Indication match
  if (comp.includes(q)) score += 40;
  if (ind.includes(q)) score += 30;

  return score;
}

export async function getProducts(params: ProductFilterParams = {}) {
  const { category, species, search, featured, limit = 20, page = 1 } = params;
  const skip = (page - 1) * limit;

  const searchWhere = search ? buildProductSearchWhere(search) : {};

  const where: Prisma.ProductWhereInput = {
    status: 'ACTIVE',
    ...(featured !== undefined && { isFeatured: featured }),
    ...(species && { speciesTags: { has: species } }),
    ...(category && {
      OR: [
        { categoryId: category },
        { category: { slug: category } },
        { categories: { some: { OR: [{ id: category }, { slug: category }] } } },
      ],
    }),
    ...searchWhere,
  };

  if (search) {
    // When searching, fetch matches to rank them by relevance
    const [matchingProducts, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { variants: { orderBy: { sellingPrice: 'asc' } }, category: true, categories: true },
      }),
      prisma.product.count({ where }),
    ]);

    // Sort by search relevance score descending, then by newest
    const rankedProducts = matchingProducts
      .map((p) => ({ product: p, score: calculateSearchRelevance(p, search) }))
      .sort((a, b) => b.score - a.score || b.product.createdAt.getTime() - a.product.createdAt.getTime())
      .map((item) => item.product);

    // Apply pagination to ranked products
    const paginated = rankedProducts.slice(skip, skip + limit);

    return { products: paginated, total, page, totalPages: Math.ceil(total / limit) };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { variants: { orderBy: { sellingPrice: 'asc' } }, category: true, categories: true },
      take: limit,
      skip,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getProductBySlug(slugOrId: string) {
  const include = {
    variants: { orderBy: { sellingPrice: 'asc' as const } },
    category: true,
    categories: true,
    reviews: {
      where: { status: 'APPROVED' as const },
      orderBy: { createdAt: 'desc' as const },
    },
  };

  const bySlug = await prisma.product.findUnique({
    where: { slug: slugOrId },
    include,
  });
  if (bySlug) return bySlug;

  return prisma.product.findUnique({
    where: { id: slugOrId },
    include,
  });
}

export async function toggleProductFeatured(id: string, isFeatured: boolean) {
  return prisma.product.update({
    where: { id },
    data: { isFeatured },
  });
}
