import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProductFormFactor, ProductStatus } from '@prisma/client';
import { generateStandardSku } from '@/lib/sku-generator';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('q')?.trim() || '';
    const category = searchParams.get('category')?.trim() || '';
    const status = searchParams.get('status')?.trim() || '';

    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (category && category !== 'ALL') {
      where.OR = [
        { categoryId: category },
        { category: { slug: category } },
        { categories: { some: { OR: [{ id: category }, { slug: category }] } } },
      ];
    }

    if (search) {
      const tokens = search.split(/[\s\-_,.]+/).map((t) => t.trim()).filter(Boolean);
      const alphanumericOnly = search.replace(/[^a-zA-Z0-9]/g, '');

      // Tokenized conditions: allows searching "re cal", "re-amino", "paraffin 250", "recal"
      const tokenConditions = tokens.map((token) => {
        const variants = [token];
        if (token.startsWith('re') && token.length > 3) {
          variants.push(`re-${token.slice(2)}`);
          variants.push(`re ${token.slice(2)}`);
        }
        if (token.startsWith('ad') && token.length > 3) {
          variants.push(`ad-${token.slice(2)}`);
          variants.push(`ad ${token.slice(2)}`);
        }

        const matchRules = variants.flatMap((v) => [
          { nameEn: { contains: v, mode: 'insensitive' as const } },
          { nameBn: { contains: v } },
          { slug: { contains: v, mode: 'insensitive' as const } },
          { dlsLicenseNo: { contains: v, mode: 'insensitive' as const } },
          { bangladeshPatentNo: { contains: v, mode: 'insensitive' as const } },
          { composition: { contains: v, mode: 'insensitive' as const } },
          { indication: { contains: v, mode: 'insensitive' as const } },
          { searchKeywords: { has: v.toLowerCase() } },
          { variants: { some: { sku: { contains: v, mode: 'insensitive' as const } } } },
          { variants: { some: { packSize: { contains: v, mode: 'insensitive' as const } } } },
          { variants: { some: { packagingInfo: { contains: v, mode: 'insensitive' as const } } } },
        ]);

        return { OR: matchRules };
      });

      // Direct & continuous alphanumeric matches (e.g. "recal", "adplus", "reamino")
      const directConditions: any[] = [
        { nameEn: { contains: search, mode: 'insensitive' } },
        { nameBn: { contains: search } },
        { slug: { contains: search, mode: 'insensitive' } },
        { variants: { some: { sku: { contains: search, mode: 'insensitive' } } } },
        { variants: { some: { packSize: { contains: search, mode: 'insensitive' } } } },
      ];

      if (alphanumericOnly && alphanumericOnly.length >= 2) {
        directConditions.push(
          { slug: { contains: alphanumericOnly, mode: 'insensitive' } },
          { variants: { some: { sku: { contains: alphanumericOnly, mode: 'insensitive' } } } }
        );
      }

      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            ...(tokens.length > 0 ? [{ AND: tokenConditions }] : []),
            ...directConditions,
          ],
        },
      ];
    }

    const [products, totalCount, activeVariantsCount, outOfStockCount, categories] =
      await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            variants: {
              orderBy: { sortOrder: 'asc' },
            },
            category: {
              select: { id: true, nameEn: true, nameBn: true, slug: true },
            },
            categories: {
              select: { id: true, nameEn: true, nameBn: true, slug: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.product.count(),
        prisma.productVariant.count({
          where: { inStock: true },
        }),
        prisma.productVariant.count({
          where: { inStock: false },
        }),
        prisma.category.findMany({
          where: { isActive: true },
          select: { id: true, nameEn: true, nameBn: true, slug: true },
          orderBy: { sortOrder: 'asc' },
        }),
      ]);

    // Calculate average gross profit margin % between TP and Selling Price
    let totalMarginSum = 0;
    let marginVariantCount = 0;

    for (const p of products) {
      for (const v of p.variants) {
        const selling = Number(v.sellingPrice);
        const tp = Number(v.tradePrice);
        if (selling > 0 && tp > 0) {
          totalMarginSum += ((selling - tp) / selling) * 100;
          marginVariantCount++;
        }
      }
    }

    const averageMarginPercentage =
      marginVariantCount > 0 ? Math.round((totalMarginSum / marginVariantCount) * 10) / 10 : 0;

    return NextResponse.json({
      success: true,
      products,
      categories,
      stats: {
        totalProducts: totalCount,
        activeVariants: activeVariantsCount,
        outOfStockVariants: outOfStockCount,
        averageMarginPercentage,
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin products:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      nameEn,
      nameBn,
      slug: customSlug,
      formFactor = 'POWDER',
      speciesTags = [],
      dlsLicenseNo,
      bangladeshPatentNo,
      manufacturer,
      thumbnail = '/images/placeholder-medicine.webp',
      images = [],
      shortDescription,
      composition,
      indication,
      dosageAndAdministration,
      withdrawalPeriod,
      contraindications,
      storageInstructions = 'Store below 30°C in a dry place protected from light.',
      searchKeywords = [],
      isFeatured = false,
      isBestSeller = false,
      status = 'ACTIVE',
      metaTitle,
      metaDescription,
      categoryId,
      categoryIds,
      variants = [],
    } = body;

    const rawCategoryIds: string[] = Array.isArray(categoryIds)
      ? categoryIds.filter(Boolean)
      : categoryId
      ? [categoryId]
      : [];
    const primaryCategoryId = rawCategoryIds[0] || categoryId || null;

    if (!nameEn || nameEn.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Product English name is required' },
        { status: 400 }
      );
    }

    const finalSlug = (customSlug ? slugify(customSlug) : slugify(nameEn)) || `prod-${Date.now()}`;

    // Ensure slug uniqueness even if duplicate name or slug exists
    let resolvedSlug = finalSlug;
    let existingWithSlug = await prisma.product.findUnique({ where: { slug: resolvedSlug } });
    let slugCounter = 1;
    while (existingWithSlug) {
      resolvedSlug = `${finalSlug}-${slugCounter++}`;
      existingWithSlug = await prisma.product.findUnique({ where: { slug: resolvedSlug } });
    }

    // Determine next sequential 3-digit legacyCatalogId for standardized SKU formatting
    const maxProduct = await prisma.product.findFirst({
      where: { legacyCatalogId: { not: null } },
      orderBy: { legacyCatalogId: 'desc' },
      select: { legacyCatalogId: true },
    });
    const nextCatalogId = (maxProduct?.legacyCatalogId ?? 33) + 1;

    // Default at least one variant if none provided
    const incomingVariants =
      Array.isArray(variants) && variants.length > 0
        ? variants
        : [
            {
              sku: '',
              packSize: 'Standard',
              weightGrams: 100,
              tradePrice: 0,
              mrpPrice: 0,
              sellingPrice: 0,
              stockQuantity: 100,
              inStock: true,
              isDefault: true,
              sortOrder: 0,
            },
          ];

    // Ensure each variant SKU is guaranteed globally unique in the database
    const usedSkusInBatch = new Set<string>();
    const variantsData = [];

    for (let index = 0; index < incomingVariants.length; index++) {
      const v = incomingVariants[index];
      const baseSku = generateStandardSku(nextCatalogId, formFactor, v.packSize || 'Standard Pack');

      let finalSku = baseSku;
      let skuCounter = 2;
      // Deduplicate against both the current batch and PostgreSQL database
      while (
        usedSkusInBatch.has(finalSku) ||
        (await prisma.productVariant.findUnique({ where: { sku: finalSku } }))
      ) {
        finalSku = `${baseSku}-${skuCounter++}`;
      }
      usedSkusInBatch.add(finalSku);

      variantsData.push({
        sku: finalSku,
        packSize: v.packSize?.trim() || 'Standard Pack',
        weightGrams: Number(v.weightGrams) || 100,
        packagingInfo: v.packagingInfo || null,
        unitsPerBox: v.unitsPerBox ? Number(v.unitsPerBox) : null,
        tradePrice: Number(v.tradePrice) || 0,
        mrpPrice: Number(v.mrpPrice) || 0,
        sellingPrice: Number(v.sellingPrice) || Number(v.mrpPrice) || 0,
        minWholesaleQty: v.minWholesaleQty ? Number(v.minWholesaleQty) : null,
        minWholesaleAmount: v.minWholesaleAmount ? Number(v.minWholesaleAmount) : null,
        stockQuantity: Number(v.stockQuantity) || 100,
        inStock: v.inStock ?? true,
        isDefault: index === 0,
        sortOrder: index,
      });
    }

    const newProduct = await prisma.product.create({
      data: {
        legacyCatalogId: nextCatalogId,
        nameEn: nameEn.trim(),
        nameBn: nameBn?.trim() || null,
        slug: resolvedSlug,
        formFactor: formFactor as ProductFormFactor,
        speciesTags,
        dlsLicenseNo: dlsLicenseNo?.trim() || null,
        bangladeshPatentNo: bangladeshPatentNo?.trim() || null,
        manufacturer: manufacturer?.trim() || null,
        thumbnail,
        images,
        shortDescription: shortDescription?.trim() || null,
        composition: composition?.trim() || null,
        indication: indication?.trim() || null,
        dosageAndAdministration: dosageAndAdministration?.trim() || null,
        withdrawalPeriod: withdrawalPeriod?.trim() || null,
        contraindications: contraindications?.trim() || null,
        storageInstructions: storageInstructions?.trim() || null,
        searchKeywords: Array.isArray(searchKeywords) ? searchKeywords : [],
        isFeatured: Boolean(isFeatured),
        isBestSeller: Boolean(isBestSeller),
        status: status as ProductStatus,
        metaTitle: metaTitle?.trim() || null,
        metaDescription: metaDescription?.trim() || null,
        categoryId: primaryCategoryId,
        categories:
          rawCategoryIds.length > 0
            ? {
                connect: rawCategoryIds.map((id) => ({ id })),
              }
            : undefined,
        variants: {
          create: variantsData,
        },
      },
      include: {
        variants: true,
        category: true,
        categories: true,
      },
    });

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}
