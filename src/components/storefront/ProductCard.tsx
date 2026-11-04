'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Check } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

// --- Shared types (importable by any page/component) ---

export interface ProductVariantData {
  id: string;
  sku: string;
  packSize: string;
  tradePrice: number | string;
  mrpPrice: number | string;
  sellingPrice: number | string;
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

  const handleInstantOrder = (e: React.MouseEvent) => {
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

    const msg = encodeURIComponent(
      `আসসালামু আলাইকুম, আমি সরাসরি ${product.nameEn} (${currentVariant.packSize}, মূল্য: ৳${sellingPrice}) অর্ডার করতে চাই।`
    );
    window.open(`https://wa.me/8801711234567?text=${msg}`, '_blank');
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
    <article className="group flex flex-col justify-between bg-white rounded-xl border border-slate-200/90 hover:border-emerald-500/40 p-4 shadow-2xs hover:shadow-md transition-all duration-200">
      <div>
        {/* Badges & Status */}
        {/* <div className="flex items-center justify-between gap-2 mb-3">
          <span className="px-2 py-0.5 rounded bg-[#ECFDF5] text-[#047857] text-[11px] font-bold border border-emerald-100">
            {tagBadgeText}
          </span>
          
        </div> */}

        {/* Product Image */}
        <Link
          href={`/products/${product.slug || product.id}`}
          className="relative h-44 w-full bg-slate-50/80 rounded-lg p-2.5 flex items-center justify-center overflow-hidden mb-3 border border-slate-100 block group/img"
        >
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

          {/* Species Badges */}
          {/* {product.speciesTags && product.speciesTags.length > 0 && (
            <div className="absolute bottom-1.5 right-1.5 flex flex-wrap gap-1 z-10">
              {product.speciesTags.slice(0, 2).map((species, i) => (
                <span
                  key={i}
                  className="bg-white/95 backdrop-blur-xs px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-700 shadow-2xs border border-slate-200/60"
                >
                  {formatSpecies(species)}
                </span>
              ))}
            </div>
          )} */}
        </Link>

        {/* Title Block */}
        <Link href={`/products/${product.slug || product.id}`} className="block group/title">
        <div className='flex justify-between items-center'>
<h3 className="font-bold text-base text-slate-900 leading-snug group-hover/title:text-emerald-800 transition-colors">
            {product.nameEn}
          </h3>

            <span className="px-2 py-0.5 rounded bg-[#DCFCE7] text-[#166534] text-[11px] font-bold">
            {product.inStock !== false ? 'ইন-স্টক' : 'স্টক শেষ'}
          </span>
        </div>
          
        
        </Link>

        {/* Pack Size Selector */}
        <div className="mt-3">
          <label className="block text-[11px] font-bold text-slate-600 mb-1">
            {variants.length > 1 ? 'প্যাক সাইজ নির্বাচন:' : 'প্যাক সাইজ:'}
          </label>
          <div className="flex items-center justify-between gap-1.5 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              {variants.map((variant, idx) => {
                const isSelected = idx === selectedVariantIndex;
                return (
                  <button
                    key={variant.id || idx}
                    type="button"
                    onClick={() => setSelectedVariantIndex(idx)}
                    className={`px-2.5 py-1 text-xs font-bold rounded transition-all ${
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
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50">
                {currentVariant.packagingInfo}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Pricing & CTAs */}
      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
        {/* Price Row */}
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-[#047857] font-mono tracking-tight">
              ৳{toBengaliNumber(sellingPrice)}
            </span>
            {mrp > sellingPrice && (
              <span className="text-xs line-through text-slate-400 font-mono">
                ৳{toBengaliNumber(mrp)}
              </span>
            )}
          </div>
          {mrp > sellingPrice ? (
            <span className="text-[10px] font-extrabold text-red-700 bg-red-100 border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <span>{toBengaliNumber(Math.round(((mrp - sellingPrice) / mrp) * 100))}% ছাড়</span>
            </span>
          ) : (
            <span className="text-[10px] font-bold text-[#a05600] bg-[#ffdcc3] px-2 py-0.5 rounded">
              সেরা অফার
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            className={`w-full py-2 rounded text-xs font-bold transition-all flex items-center justify-center gap-1.5 border shadow-2xs ${
              addedAnimation
                ? 'bg-emerald-700 text-white border-emerald-700'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>যোগ হয়েছে!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5 stroke-[2]" />
                <span>কার্টে দিন</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleInstantOrder}
            className="w-full py-2 bg-[#d97706] hover:bg-[#b45309] text-white text-xs font-bold rounded transition-colors flex items-center justify-center shadow-xs"
          >
            অর্ডার করুন
          </button>
        </div>
      </div>
    </article>
  );
}