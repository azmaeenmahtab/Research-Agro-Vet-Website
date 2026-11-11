import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateVariantPricing, getUniversalDiscountConfig } from '@/lib/pricing';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface SyncItemRequest {
  variantId: string;
  quantity?: number;
}

/**
 * POST /api/cart/sync
 * Real-time cart validation and price synchronizer.
 * Takes user's local cart variantIds, validates them against current DB inventory,
 * checks product ACTIVE status, and computes live pricing against current discount rules.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawItems: SyncItemRequest[] = Array.isArray(body?.items) ? body.items : [];

    if (rawItems.length === 0) {
      const universalDiscount = await getUniversalDiscountConfig();
      return NextResponse.json({
        success: true,
        items: [],
        universalDiscount,
        hasChanges: false,
      });
    }

    // 1. Fetch live Universal Discount from SiteSettings
    const universalDiscount = await getUniversalDiscountConfig();

    // 2. Fetch all requested variants with current DB product info
    const variantIds = rawItems.map((i) => i.variantId).filter(Boolean);
    const dbVariants = await prisma.productVariant.findMany({
      where: {
        id: { in: variantIds },
      },
      include: {
        product: {
          select: {
            id: true,
            nameEn: true,
            nameBn: true,
            status: true,
            thumbnail: true,
            images: true,
          },
        },
      },
    });

    const dbVariantMap = new Map(dbVariants.map((v) => [v.id, v]));

    // 3. Map through requested items and build verified real-time items
    let hasChanges = false;
    const syncedItems = rawItems.map((item) => {
      const variant = dbVariantMap.get(item.variantId);
      const requestedQty = Math.max(1, Number(item.quantity) || 1);

      // If variant was deleted or not found in DB
      if (!variant) {
        hasChanges = true;
        return {
          variantId: item.variantId,
          productId: '',
          nameEn: 'পণ্যটি পাওয়া যায়নি',
          nameBn: null,
          packSize: '',
          sku: '',
          tradePrice: 0,
          mrpPrice: 0,
          sellingPrice: 0,
          quantity: requestedQty,
          inStock: false,
          isAvailable: false,
          statusMessage: 'পণ্যটি ডাটাবেজে পাওয়া যায়নি',
          hasDiscount: false,
          discountPercent: 0,
          discountType: 'NONE',
        };
      }

      const product = variant.product;
      const isProductActive = product.status === 'ACTIVE';
      const isStockAvailable = variant.inStock !== false && (variant.stockQuantity === null || variant.stockQuantity === undefined || variant.stockQuantity > 0);
      const isAvailable = isProductActive && isStockAvailable;

      let statusMessage: string | null = null;
      if (!isProductActive) {
        statusMessage = 'পণ্যটি বর্তমানে বন্ধ রয়েছে (Archived)';
      } else if (!isStockAvailable) {
        statusMessage = 'স্টক শেষ (Out of Stock)';
      }

      // Calculate live pricing with individual dominance & current universal discount
      const pricing = calculateVariantPricing(
        Number(variant.mrpPrice || variant.sellingPrice || 0),
        Number(variant.sellingPrice),
        universalDiscount
      );

      return {
        variantId: variant.id,
        productId: product.id,
        nameEn: product.nameEn,
        nameBn: product.nameBn || null,
        packSize: variant.packSize,
        sku: variant.sku,
        tradePrice: Number(variant.tradePrice || pricing.sellingPrice),
        mrpPrice: pricing.mrpPrice,
        sellingPrice: pricing.sellingPrice,
        quantity: requestedQty,
        image: product.thumbnail || (Array.isArray(product.images) && product.images[0] as string) || '/images/placeholder-medicine.webp',
        minWholesaleQty: variant.minWholesaleQty || null,
        inStock: isStockAvailable,
        isAvailable: isProductActive,
        isPurchasable: isAvailable,
        statusMessage,
        hasDiscount: pricing.hasDiscount,
        discountPercent: pricing.discountPercent,
        savingsPerUnit: pricing.savingsPerUnit,
        discountType: pricing.discountType,
      };
    });

    return NextResponse.json(
      {
        success: true,
        items: syncedItems,
        universalDiscount,
        hasChanges,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('Error synchronizing cart items:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'কার্ট সিনক্রোনাইজ করতে সমস্যা হয়েছে',
      },
      { status: 500 }
    );
  }
}
