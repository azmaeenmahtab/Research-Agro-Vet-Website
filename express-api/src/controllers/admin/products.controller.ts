import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { ProductFormFactor, ProductStatus } from '@prisma/client';
import { generateStandardSku } from '../../lib/sku-generator';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// GET /api/admin/products
export async function getAdminProducts(req: Request, res: Response) {
  try {
    const search = ((req.query.q as string) || '').trim();
    const category = ((req.query.category as string) || '').trim();
    const status = ((req.query.status as string) || '').trim();

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
          { nameEn: { contains: v } },
          { nameBn: { contains: v } },
          { slug: { contains: v } },
          { dlsLicenseNo: { contains: v } },
          { bangladeshPatentNo: { contains: v } },
          { composition: { contains: v } },
          { indication: { contains: v } },
          { searchKeywords: { array_contains: v.toLowerCase() } },
          { variants: { some: { sku: { contains: v } } } },
          { variants: { some: { packSize: { contains: v } } } },
          { variants: { some: { packagingInfo: { contains: v } } } },
        ]);

        return { OR: matchRules };
      });

      const directConditions: any[] = [
        { nameEn: { contains: search } },
        { nameBn: { contains: search } },
        { slug: { contains: search } },
        { variants: { some: { sku: { contains: search } } } },
        { variants: { some: { packSize: { contains: search } } } },
      ];

      if (alphanumericOnly && alphanumericOnly.length >= 2) {
        directConditions.push(
          { slug: { contains: alphanumericOnly } },
          { variants: { some: { sku: { contains: alphanumericOnly } } } }
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

    return res.json({
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
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch products',
    });
  }
}

// POST /api/admin/products
export async function createAdminProduct(req: Request, res: Response) {
  try {
    const body = req.body;
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
      return res.status(400).json({
        success: false,
        message: 'Product English name is required',
      });
    }

    const finalSlug = (customSlug ? slugify(customSlug) : slugify(nameEn)) || `prod-${Date.now()}`;

    let resolvedSlug = finalSlug;
    let existingWithSlug = await prisma.product.findUnique({ where: { slug: resolvedSlug } });
    let slugCounter = 1;
    while (existingWithSlug) {
      resolvedSlug = `${finalSlug}-${slugCounter++}`;
      existingWithSlug = await prisma.product.findUnique({ where: { slug: resolvedSlug } });
    }

    const maxProduct = await prisma.product.findFirst({
      where: { legacyCatalogId: { not: null } },
      orderBy: { legacyCatalogId: 'desc' },
      select: { legacyCatalogId: true },
    });
    const nextCatalogId = (maxProduct?.legacyCatalogId ?? 33) + 1;

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

    const usedSkusInBatch = new Set<string>();
    const variantsData = [];

    for (let index = 0; index < incomingVariants.length; index++) {
      const v = incomingVariants[index];
      const baseSku = generateStandardSku(nextCatalogId, formFactor, v.packSize || 'Standard Pack');

      let finalSku = baseSku;
      let skuCounter = 2;
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

    return res.json({ success: true, product: newProduct });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create product',
    });
  }
}

// GET /api/admin/products/:id
export async function getAdminProductById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: {
          orderBy: { sortOrder: 'asc' },
        },
        category: true,
      },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.json({ success: true, product });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch product',
    });
  }
}

// PUT /api/admin/products/:id
export async function updateAdminProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const body = req.body;

    const {
      nameEn,
      nameBn,
      slug,
      formFactor,
      speciesTags,
      dlsLicenseNo,
      bangladeshPatentNo,
      manufacturer,
      thumbnail,
      images,
      shortDescription,
      composition,
      indication,
      dosageAndAdministration,
      withdrawalPeriod,
      contraindications,
      storageInstructions,
      searchKeywords,
      isFeatured,
      isBestSeller,
      status,
      metaTitle,
      metaDescription,
      categoryId,
      categoryIds,
      variants,
    } = body;

    const rawCategoryIds: string[] | undefined = Array.isArray(categoryIds)
      ? categoryIds.filter(Boolean)
      : categoryId !== undefined
      ? (categoryId ? [categoryId] : [])
      : undefined;
    const primaryCategoryId =
      rawCategoryIds !== undefined
        ? (rawCategoryIds[0] || null)
        : categoryId !== undefined
        ? (categoryId || null)
        : undefined;

    const existing = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let finalSlug = existing.slug;
    if (slug && slug !== existing.slug) {
      finalSlug = slugify(slug);
      const duplicate = await prisma.product.findFirst({
        where: { slug: finalSlug, NOT: { id } },
      });
      if (duplicate) {
        finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
      }
    }

    let effectiveCatalogId = existing.legacyCatalogId;
    if (!effectiveCatalogId) {
      const maxProduct = await prisma.product.findFirst({
        where: { legacyCatalogId: { not: null } },
        orderBy: { legacyCatalogId: 'desc' },
        select: { legacyCatalogId: true },
      });
      effectiveCatalogId = (maxProduct?.legacyCatalogId ?? 33) + 1;
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          legacyCatalogId: effectiveCatalogId,
          ...(nameEn !== undefined && { nameEn: nameEn.trim() }),
          ...(nameBn !== undefined && { nameBn: nameBn?.trim() || null }),
          ...(finalSlug && { slug: finalSlug }),
          ...(formFactor && { formFactor: formFactor as ProductFormFactor }),
          ...(speciesTags !== undefined && { speciesTags }),
          ...(dlsLicenseNo !== undefined && { dlsLicenseNo: dlsLicenseNo?.trim() || null }),
          ...(bangladeshPatentNo !== undefined && {
            bangladeshPatentNo: bangladeshPatentNo?.trim() || null,
          }),
          ...(manufacturer !== undefined && { manufacturer: manufacturer?.trim() || null }),
          ...(thumbnail !== undefined && { thumbnail }),
          ...(images !== undefined && { images }),
          ...(shortDescription !== undefined && {
            shortDescription: shortDescription?.trim() || null,
          }),
          ...(composition !== undefined && { composition: composition?.trim() || null }),
          ...(indication !== undefined && { indication: indication?.trim() || null }),
          ...(dosageAndAdministration !== undefined && {
            dosageAndAdministration: dosageAndAdministration?.trim() || null,
          }),
          ...(withdrawalPeriod !== undefined && {
            withdrawalPeriod: withdrawalPeriod?.trim() || null,
          }),
          ...(contraindications !== undefined && {
            contraindications: contraindications?.trim() || null,
          }),
          ...(storageInstructions !== undefined && {
            storageInstructions: storageInstructions?.trim() || null,
          }),
          ...(searchKeywords !== undefined && { searchKeywords }),
          ...(isFeatured !== undefined && { isFeatured: Boolean(isFeatured) }),
          ...(isBestSeller !== undefined && { isBestSeller: Boolean(isBestSeller) }),
          ...(status !== undefined && { status: status as ProductStatus }),
          ...(metaTitle !== undefined && { metaTitle: metaTitle?.trim() || null }),
          ...(metaDescription !== undefined && { metaDescription: metaDescription?.trim() || null }),
          ...(primaryCategoryId !== undefined && { categoryId: primaryCategoryId }),
          ...(rawCategoryIds !== undefined && {
            categories: {
              set: rawCategoryIds.map((cId) => ({ id: cId })),
            },
          }),
        },
      });

      if (Array.isArray(variants)) {
        const existingVariantIds = existing.variants.map((v) => v.id);
        const incomingVariantIds = variants.filter((v: any) => v.id).map((v: any) => v.id);

        const toDeleteIds = existingVariantIds.filter((id) => !incomingVariantIds.includes(id));
        if (toDeleteIds.length > 0) {
          await tx.productVariant.deleteMany({
            where: { id: { in: toDeleteIds } },
          });
        }

        const usedSkusInBatch = new Set<string>();

        for (let idx = 0; idx < variants.length; idx++) {
          const v = variants[idx];
          const targetForm = formFactor || existing.formFactor;
          const baseSku = generateStandardSku(
            effectiveCatalogId,
            targetForm,
            v.packSize || 'Standard Pack'
          );

          let finalSku = baseSku;
          let skuCounter = 2;
          while (
            usedSkusInBatch.has(finalSku) ||
            (await tx.productVariant.findFirst({
              where: {
                sku: finalSku,
                NOT: v.id ? { id: v.id } : undefined,
              },
            }))
          ) {
            finalSku = `${baseSku}-${skuCounter++}`;
          }
          usedSkusInBatch.add(finalSku);

          const variantData = {
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
            stockQuantity: Number(v.stockQuantity) || 0,
            inStock: v.inStock ?? true,
            isDefault: v.isDefault ?? idx === 0,
            sortOrder: idx,
          };

          if (v.id && existingVariantIds.includes(v.id)) {
            await tx.productVariant.update({
              where: { id: v.id },
              data: variantData,
            });
          } else {
            await tx.productVariant.create({
              data: {
                ...variantData,
                productId: id,
              },
            });
          }
        }
      }

      return tx.product.findUnique({
        where: { id },
        include: {
          variants: { orderBy: { sortOrder: 'asc' } },
          category: true,
          categories: true,
        },
      });
    });

    return res.json({ success: true, product: updated });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update product',
    });
  }
}

// DELETE /api/admin/products/:id
export async function deleteAdminProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await prisma.product.delete({ where: { id } });

    return res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete product',
    });
  }
}

// PATCH /api/admin/products/:id/clinical
export async function updateAdminProductClinical(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const body = req.body;

    const {
      composition,
      indication,
      dosageAndAdministration,
      withdrawalPeriod,
      contraindications,
      storageInstructions,
      searchKeywords,
    } = body;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(composition !== undefined && { composition: composition?.trim() || null }),
        ...(indication !== undefined && { indication: indication?.trim() || null }),
        ...(dosageAndAdministration !== undefined && {
          dosageAndAdministration: dosageAndAdministration?.trim() || null,
        }),
        ...(withdrawalPeriod !== undefined && {
          withdrawalPeriod: withdrawalPeriod?.trim() || null,
        }),
        ...(contraindications !== undefined && {
          contraindications: contraindications?.trim() || null,
        }),
        ...(storageInstructions !== undefined && {
          storageInstructions: storageInstructions?.trim() || null,
        }),
        ...(searchKeywords !== undefined && {
          searchKeywords: Array.isArray(searchKeywords) ? searchKeywords : [],
        }),
      },
      select: {
        id: true,
        nameEn: true,
        composition: true,
        indication: true,
        dosageAndAdministration: true,
        withdrawalPeriod: true,
        contraindications: true,
        storageInstructions: true,
        searchKeywords: true,
        updatedAt: true,
      },
    });

    return res.json({ success: true, product: updated });
  } catch (error: any) {
    console.error('Error updating clinical reference data:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update clinical details',
    });
  }
}

