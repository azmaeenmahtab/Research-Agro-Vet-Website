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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

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
      variants,
    } = body;

    // Verify product exists
    const existing = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    // Check slug collision
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

    // Run database transaction to safely update product and variants
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update Product Details
      const prod = await tx.product.update({
        where: { id },
        data: {
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
          ...(categoryId !== undefined && { categoryId: categoryId || null }),
        },
      });

      // 2. Update Variants if provided
      if (Array.isArray(variants)) {
        const existingVariantIds = existing.variants.map((v) => v.id);
        const incomingVariantIds = variants.filter((v: any) => v.id).map((v: any) => v.id);

        // Delete removed variants
        const toDeleteIds = existingVariantIds.filter((id) => !incomingVariantIds.includes(id));
        if (toDeleteIds.length > 0) {
          await tx.productVariant.deleteMany({
            where: { id: { in: toDeleteIds } },
          });
        }

        // Upsert variants
        for (let idx = 0; idx < variants.length; idx++) {
          const v = variants[idx];
          const variantData = {
            sku: v.sku?.trim() || `${finalSlug.toUpperCase().slice(0, 4)}-${idx + 1}-${Date.now().toString().slice(-3)}`,
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
        },
      });
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if product exists
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    // Delete product (cascades to variants)
    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete product' },
      { status: 500 }
    );
  }
}
