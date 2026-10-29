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
    include: { variants: { orderBy: { sellingPrice: 'asc' } }, category: true },
    take: limit,
    orderBy: { createdAt: 'desc' },
  });

  if (products.length > 0) return products;

  // Fallback to top active products if none are flagged as featured
  return prisma.product.findMany({
    where: { status: 'ACTIVE' },
    include: { variants: { orderBy: { sellingPrice: 'asc' } }, category: true },
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getProducts(params: ProductFilterParams = {}) {
  const { category, species, search, featured, limit = 20, page = 1 } = params;
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = {
    status: 'ACTIVE',
    ...(featured !== undefined && { isFeatured: featured }),
    ...(species && { speciesTags: { has: species } }),
    ...(category && {
      OR: [{ categoryId: category }, { category: { slug: category } }],
    }),
    ...(search && {
      OR: [
        { nameEn: { contains: search, mode: 'insensitive' } },
        { nameBn: { contains: search } },
        { composition: { contains: search, mode: 'insensitive' } },
        { searchKeywords: { has: search.toLowerCase() } },
      ],
    }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { variants: { orderBy: { sellingPrice: 'asc' } }, category: true },
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
