'use client';

import React from 'react';
import { BadgePercent } from 'lucide-react';
import ProductCard from './ProductCard';
import type { ProductCardData } from './ProductCard';
import { toBengaliNumber } from '@/lib/formatters';

// Keep the old name as an alias so any existing imports still work
export type FeaturedProductData = ProductCardData;
export type { ProductVariantData } from './ProductCard';
export { toBengaliNumber } from './ProductCard';

// Placeholder array so STITCH_FALLBACK_PRODUCTS reference doesn't break
const STITCH_FALLBACK_PRODUCTS: ProductCardData[] = [];

import { calculateVariantPricing, UniversalDiscountConfig } from '@/lib/pricing';

interface FeaturedProductsProps {
  initialProducts?: any[];
  universalDiscount?: UniversalDiscountConfig;
}

export default function FeaturedProducts({
  initialProducts = [],
  universalDiscount,
}: FeaturedProductsProps) {
  // Merge database products with Stitch mockup if database has fewer items
  const displayProducts: ProductCardData[] =
    initialProducts && initialProducts.length > 0
      ? initialProducts.map((p, idx) => ({
          id: p.id || `db-prod-${idx}`,
          slug: p.slug || '',
          nameEn: p.nameEn,
          nameBn: p.nameBn || null,
          tagBadge: p.dlsLicenseNo ? 'DLS অনুমোদিত' : undefined,
          inStock: p.status === 'ACTIVE',
          thumbnail:
            p.thumbnail &&
            !p.thumbnail.includes('placeholder') &&
            (p.thumbnail.startsWith('http') || p.thumbnail.includes('re-milk-plus') || p.thumbnail.includes('re-db-plus'))
              ? p.thumbnail
              : STITCH_FALLBACK_PRODUCTS[idx % (STITCH_FALLBACK_PRODUCTS.length || 1)]?.thumbnail,
          speciesTags: p.speciesTags || ['CATTLE_BUFFALO', 'POULTRY'],
          indication: p.indication || 'উন্নত স্বাস্থ্য ও উৎপাদন বৃদ্ধি সহায়ক',
          variants:
            p.variants && p.variants.length > 0
              ? p.variants.map((v: any) => {
                  const pricing = calculateVariantPricing(
                    Number(v.mrpPrice || v.sellingPrice || 0),
                    Number(v.sellingPrice),
                    universalDiscount
                  );
                  return {
                    id: v.id,
                    sku: v.sku,
                    packSize: v.packSize,
                    tradePrice: Number(v.tradePrice || 0),
                    mrpPrice: pricing.mrpPrice,
                    sellingPrice: pricing.sellingPrice,
                    discountPercent: pricing.discountPercent,
                    discountType: pricing.discountType,
                    inStock: v.inStock !== false,
                    packagingInfo: v.packagingInfo || null,
                    unitsPerBox: v.unitsPerBox || null,
                  };
                })
              : [],
        }))
      : STITCH_FALLBACK_PRODUCTS;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-12" id="featured-catalog">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-8">
        <div>
          
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            জনপ্রিয় ভেটেরিনারি ঔষধসমূহ
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {universalDiscount?.enabled && universalDiscount.percent > 0 ? (
            <span className="px-3 py-1 bg-[#ffdcc3] text-[#2f1500] rounded-md text-xs font-bold flex items-center gap-1.5 shadow-2xs border border-amber-200/80">
              <BadgePercent className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{toBengaliNumber(universalDiscount.percent)}% সার্বজনীন ছাড় এক্টিভ</span>
            </span>
          ) : (
            <span className="px-3 py-1 bg-emerald-50 text-emerald-900 rounded-md text-xs font-bold flex items-center gap-1.5 shadow-2xs border border-emerald-200/80">
              <BadgePercent className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>সেরা মূল্যের নিশ্চয়তা</span>
            </span>
          )}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayProducts.slice(0, 8).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
