'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import ProductCard, { ProductCardData } from './ProductCard';
import { calculateVariantPricing, UniversalDiscountConfig } from '@/lib/pricing';

interface MoreProductsSectionProps {
  products: any[];
  universalDiscount?: UniversalDiscountConfig;
}

export default function MoreProductsSection({
  products = [],
  universalDiscount,
}: MoreProductsSectionProps) {
  if (!products || products.length === 0) return null;

  const displayProducts: ProductCardData[] = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    nameEn: p.nameEn,
    nameBn: p.nameBn || null,
    tagBadge: p.dlsLicenseNo ? 'DLS অনুমোদিত' : undefined,
    isFeatured: Boolean(p.isFeatured),
    isBestSeller: Boolean(p.isBestSeller),
    inStock: p.status === 'ACTIVE',
    thumbnail: p.thumbnail,
    imageUrl: p.thumbnail,
    speciesTags: p.speciesTags || [],
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
              hasDiscount: pricing.hasDiscount,
              inStock: v.inStock !== false,
              packagingInfo: v.packagingInfo || null,
              unitsPerBox: v.unitsPerBox || null,
            };
          })
        : [],
  }));

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-8 sm:py-14 border-t border-slate-200/80">
      {/* Header */}
      <div className="flex flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8">
        <div>
          
          <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            আরও প্রিমিক্সসমূহ
          </h2>
          
        </div>

        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <span>সকল পণ্য দেখুন</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Product Grid: 14 Products (2 columns on mobile, 4 columns on desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {displayProducts.slice(0, 14).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Bottom CTA to View All Products */}
      <div className="mt-8 sm:mt-12 text-center">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm transition-all shadow-sm hover:shadow-md active:scale-[0.99] cursor-pointer"
        >
          <span>সকল প্রিমিক্স ও সাপ্লিমেন্ট ক্যাটালগ দেখুন</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}

