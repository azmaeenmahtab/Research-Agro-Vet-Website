import { prisma } from '@/lib/prisma';

export interface UniversalDiscountConfig {
  enabled: boolean;
  percent: number;
  label: string;
}

export interface VariantPricingResult {
  mrpPrice: number;
  sellingPrice: number;
  discountPercent: number;
  savingsPerUnit: number;
  discountType: 'INDIVIDUAL' | 'UNIVERSAL' | 'NONE';
  hasDiscount: boolean;
}

/**
 * Centrally fetches the live storewide Universal Discount configuration from SiteSettings.
 */
export async function getUniversalDiscountConfig(): Promise<UniversalDiscountConfig> {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'default' },
      select: {
        enableGeneralDiscount: true,
        generalRetailDiscountPercent: true,
      },
    });

    const percent = Number(settings?.generalRetailDiscountPercent) || 0;
    const enabled = Boolean(settings?.enableGeneralDiscount) && percent > 0;
    const label = `Website ${percent}% Universal Discount`;

    return { enabled, percent, label };
  } catch (err) {
    console.error('Failed to get universal discount config:', err);
    return { enabled: false, percent: 0, label: '' };
  }
}

/**
 * Calculates pricing for a product variant maintaining Individual Discount Dominance:
 * 1. Individual Discount Dominates (if variant.sellingPrice < variant.mrpPrice)
 * 2. Universal Storewide Discount (if no individual promo & universal is active)
 * 3. None (if no individual promo & universal is inactive/0%)
 */
export function calculateVariantPricing(
  mrp: number | string | null | undefined,
  dbSellingPrice: number | string | null | undefined,
  universal?: UniversalDiscountConfig | null
): VariantPricingResult {
  const mrpPrice = Number(mrp) || 0;
  const rawSelling = Number(dbSellingPrice) || mrpPrice;

  // 1. Individual Discount Dominance
  if (mrpPrice > 0 && rawSelling < mrpPrice) {
    const discountPercent = Math.round(((mrpPrice - rawSelling) / mrpPrice) * 100);
    return {
      mrpPrice,
      sellingPrice: rawSelling,
      discountPercent,
      savingsPerUnit: mrpPrice - rawSelling,
      discountType: 'INDIVIDUAL',
      hasDiscount: true,
    };
  }

  // 2. Universal Discount Fallback
  const isUniversalActive = Boolean(universal?.enabled) && Number(universal?.percent) > 0;
  if (mrpPrice > 0 && isUniversalActive) {
    const percent = Number(universal!.percent);
    const effectiveSelling = Math.round(mrpPrice * (1 - percent / 100));
    return {
      mrpPrice,
      sellingPrice: effectiveSelling,
      discountPercent: percent,
      savingsPerUnit: mrpPrice - effectiveSelling,
      discountType: 'UNIVERSAL',
      hasDiscount: true,
    };
  }

  // 3. No discount (Standard MRP)
  return {
    mrpPrice,
    sellingPrice: mrpPrice,
    discountPercent: 0,
    savingsPerUnit: 0,
    discountType: 'NONE',
    hasDiscount: false,
  };
}
