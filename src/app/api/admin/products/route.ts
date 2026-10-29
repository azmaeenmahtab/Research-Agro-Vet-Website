import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProductFormFactor, ProductStatus } from '@prisma/client';

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
      where.OR = [{ categoryId: category }, { category: { slug: category } }];
    }

    if (search) {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { nameEn: { contains: search, mode: 'insensitive' } },
            { nameBn: { contains: search } },
            { slug: { contains: search, mode: 'insensitive' } },
            { dlsLicenseNo: { contains: search, mode: 'insensitive' } },
            { bangladeshPatentNo: { contains: search, mode: 'insensitive' } },
            { composition: { contains: search, mode: 'insensitive' } },
            { indication: { contains: search, mode: 'insensitive' } },
            { variants: { some: { sku: { contains: search, mode: 'insensitive' } } } },
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
              select: { id: true, nameEn: true, slug: true },
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
          select: { id: true, nameEn: true, slug: true },
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
      variants = [],
    } = body;

    if (!nameEn || nameEn.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Product English name is required' },
        { status: 400 }
      );
    }

    const finalSlug = (customSlug ? slugify(customSlug) : slugify(nameEn)) || `prod-${Date.now()}`;

    // Ensure slug uniqueness
    let existingWithSlug = await prisma.product.findUnique({ where: { slug: finalSlug } });
    let resolvedSlug = finalSlug;
    if (existingWithSlug) {
      resolvedSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    // Default at least one variant if none provided
    const variantsData =
      Array.isArray(variants) && variants.length > 0
        ? variants.map((v: any, index: number) => ({
            sku: v.sku?.trim() || `${resolvedSlug.toUpperCase().slice(0, 4)}-${index + 1}-${Date.now().toString().slice(-3)}`,
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
          }))
        : [
            {
              sku: `${resolvedSlug.toUpperCase().slice(0, 4)}-DEF-1`,
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

    const newProduct = await prisma.product.create({
      data: {
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
        categoryId: categoryId || null,
        variants: {
          create: variantsData,
        },
      },
      include: {
        variants: true,
        category: true,
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
