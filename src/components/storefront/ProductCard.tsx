'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Check } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

function FlameIcon({ className = 'w-2.5 h-2.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

function SparklesIcon({ className = 'w-2.5 h-2.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" />
    </svg>
  );
}

// --- Shared types (importable by any page/component) ---

export interface ProductVariantData {
  id: string;
  sku: string;
  packSize: string;
  tradePrice: number | string;
  mrpPrice: number | string;
  sellingPrice: number | string;
  discountPercent?: number;
  discountType?: 'INDIVIDUAL' | 'UNIVERSAL' | 'NONE';
  inStock?: boolean;
  packagingInfo?: string | null;
  unitsPerBox?: number | null;
}

export interface ProductCardData {
  id: string;
  slug?: string;
  nameEn: string;
  nameBn?: string | null;
  tagBadge?: string;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  inStock?: boolean;
  thumbnail?: string;
  imageUrl?: string;
  speciesTags?: string[];
  indication?: string | null;
  variants: ProductVariantData[];
}

// --- Helpers ---

export function toBengaliNumber(val: number | string | undefined | null): string {
  if (val === undefined || val === null || val === '') return '০';
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(val).replace(/\d/g, (d) => bnDigits[parseInt(d, 10)]);
}

function formatSpecies(tag: string) {
  // Strip any emoji characters if present
  const clean = tag.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
  switch (clean) {
    case 'CATTLE_BUFFALO':
    case 'গরু ও মহিষ':
    case 'গরু':
      return 'গরু ও মহিষ';
    case 'POULTRY':
    case 'পোল্ট্রি ও হাঁস':
    case 'পোল্ট্রি':
      return 'পোল্ট্রি';
    case 'GOAT_SHEEP':
    case 'ছাগল ও ভেড়া':
    case 'ছাগল':
      return 'ছাগল';
    case 'AQUA':
    case 'মৎস্য ও চিংড়ি':
    case 'মৎস্য':
      return 'মৎস্য';
    default:
      return clean;
  }
}

// --- Component ---

export interface ProductCardProps {
  product: ProductCardData;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const { addItem, openCartDrawer } = useCartStore();

  const variants = product.variants && product.variants.length > 0 ? product.variants : [];
  const currentVariant = variants[selectedVariantIndex] || variants[0];

  const mrp = currentVariant ? Number(currentVariant.mrpPrice || 0) : 0;
  const sellingPrice = currentVariant ? Number(currentVariant.sellingPrice || 0) : 0;

  const hasDiscount = mrp > 0 && sellingPrice < mrp;
  const rawDiscount = hasDiscount ? ((mrp - sellingPrice) / mrp) * 100 : 0;
  const discountPct =
    currentVariant?.discountPercent !== undefined && currentVariant.discountPercent > 0
      ? currentVariant.discountPercent
      : Math.round(rawDiscount);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentVariant) return;

    addItem({
      variantId: currentVariant.id,
      productId: product.id,
      nameEn: product.nameEn,
      nameBn: product.nameBn,
      packSize: currentVariant.packSize,
      sku: currentVariant.sku,
      tradePrice: Number(currentVariant.tradePrice || currentVariant.sellingPrice),
      mrpPrice: mrp,
      sellingPrice: sellingPrice,
      quantity: 1,
      image: product.thumbnail || product.imageUrl,
    });

    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const tagBadgeText =
    product.tagBadge ||
    (product.nameEn.toLowerCase().includes('zinc')
      ? 'DLS অনুমোদিত'
      : product.nameEn.toLowerCase().includes('milk')
      ? 'মিল্ক বুস্টার'
      : product.nameEn.toLowerCase().includes('live')
      ? 'লিভার প্রটেক্টর'
      : 'রুচি ও হজম');

  return (
    <article className="group flex flex-col justify-between bg-white rounded-xl border border-slate-200/90 hover:border-emerald-500/40 p-2.5 sm:p-4 shadow-2xs hover:shadow-md transition-all duration-200">
      <div>
        {/* Product Image with Featured / Bestseller Badge */}
        <Link
          href={`/products/${product.slug || product.id}`}
          className="relative h-32 sm:h-44 w-full bg-slate-50/80 rounded-lg p-2 sm:p-2.5 flex items-center justify-center overflow-hidden mb-2 sm:mb-3 border border-slate-100 block group/img"
        >
          {/* Over-the-image Badge: Bestseller / Featured (Top Left) */}
          {product.isBestSeller ? (
            <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10 px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-xs flex items-center gap-0.5 sm:gap-1">
              <span>Bestseller</span>
            </span>
          ) : product.isFeatured ? (
            <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10 px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-emerald-700 text-white shadow-xs flex items-center gap-0.5 sm:gap-1">
              <span>Featured</span>
            </span>
          ) : null}

          {/* Over-the-image Stock Badge: Mobile Only (Top Right) */}
          <span
            className={`sm:hidden absolute top-1.5 right-1.5 z-10 px-1.5 py-0.5 rounded text-[9px] font-bold shadow-2xs ${
              product.inStock !== false
                ? 'bg-[#DCFCE7] text-[#166534]'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {product.inStock !== false ? 'ইন-স্টক' : 'স্টক শেষ'}
          </span>

          {(product.thumbnail || product.imageUrl) && (
            <img
              src={(product.thumbnail || product.imageUrl)!}
              alt={product.nameEn}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.style.display = 'none';
              }}
              className="h-full w-auto object-contain mix-blend-multiply group-hover/img:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          )}
        </Link>

        {/* Title Block */}
        <Link href={`/products/${product.slug || product.id}`} className="block group/title">
          <div className="flex items-center justify-between gap-1">
            <h3 className="font-bold text-xs sm:text-base text-slate-900 leading-snug group-hover/title:text-emerald-800 transition-colors line-clamp-1 sm:line-clamp-none">
              {product.nameEn}
            </h3>

            {/* Desktop / Tablet Stock Badge: Kept in title row */}
            <span
              className={`hidden sm:inline-block px-2 py-0.5 rounded text-[11px] font-bold shrink-0 ${
                product.inStock !== false
                  ? 'bg-[#DCFCE7] text-[#166534]'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {product.inStock !== false ? 'ইন-স্টক' : 'স্টক শেষ'}
            </span>
          </div>
        </Link>

        {/* Pack Size Selector */}
        <div className="mt-2 sm:mt-3">
          <label className="block text-[10px] sm:text-[11px] font-bold text-slate-600 mb-1">
            {variants.length > 1 ? 'প্যাক সাইজ:' : 'প্যাক সাইজ:'}
          </label>
          <div className="flex items-center justify-between gap-1 sm:gap-1.5 flex-wrap">
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
              {variants.map((variant, idx) => {
                const isSelected = idx === selectedVariantIndex;
                return (
                  <button
                    key={variant.id || idx}
                    type="button"
                    onClick={() => setSelectedVariantIndex(idx)}
                    className={`px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#047857] text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {variant.packSize}
                  </button>
                );
              })}
            </div>

            {/* Packaging Note Badge */}
            {currentVariant?.packagingInfo && (
              <span className="text-[9px] sm:text-[11px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/50">
                {currentVariant.packagingInfo}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Pricing & CTAs */}
      <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-100 space-y-2 sm:space-y-2.5">
        {/* Price Row */}
        <div className="flex items-baseline justify-between gap-1 flex-wrap">
          <div className="flex items-baseline gap-1 sm:gap-2">
            <span className="text-base sm:text-xl font-extrabold text-[#047857] font-mono tracking-tight">
              ৳{toBengaliNumber(sellingPrice)}
            </span>
            {mrp > sellingPrice && (
              <span className="text-[10px] sm:text-xs line-through text-slate-400 font-mono">
                ৳{toBengaliNumber(mrp)}
              </span>
            )}
          </div>
          {mrp > sellingPrice ? (
            <span className="text-[10px] sm:text-[13px] font-extrabold text-red-700 bg-red-100 border border-red-200 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <span>{toBengaliNumber(discountPct)}% ছাড়</span>
            </span>
          ) : (
            <span className="text-[9px] sm:text-[10px] font-bold text-[#a05600] bg-[#ffdcc3] px-1.5 py-0.5 rounded">
              সেরা অফার
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            className={`w-full py-1.5 sm:py-2 rounded text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 border shadow-2xs cursor-pointer ${
              addedAnimation
                ? 'bg-emerald-700 text-white border-emerald-700'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">যোগ হয়েছে!</span>
                <span className="sm:hidden">যুক্ত!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5 stroke-[2]" />
                <span className="hidden sm:inline">কার্টে দিন</span>
                <span className="sm:hidden">কার্ট</span>
              </>
            )}
          </button>

          <Link
            href={`/products/${product.slug || product.id}`}
            className="w-full py-1.5 sm:py-2 bg-[#d97706] hover:bg-[#b45309] text-white text-[11px] sm:text-xs font-bold rounded transition-colors flex items-center justify-center shadow-xs text-center"
          >
            অর্ডার করুন
          </Link>
        </div>
      </div>
    </article>
  );
}