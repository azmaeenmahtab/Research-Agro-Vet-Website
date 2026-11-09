'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useCartStore } from '@/store/useCartStore';
import { toBengaliNumber } from '@/lib/formatters';
import ProductCard, { ProductCardData } from './ProductCard';
import ProductReviewsSection, { ProductReviewItem } from './ProductReviewsSection';
import {
  Check,
  ShoppingCart,
  Zap,
  MessageCircle,
  Phone,
  Calculator,
  ShieldCheck,
  Truck,
  RotateCcw,
  PhoneCall,
  Package,
  Layers,
  FileText,
  AlertCircle,
  Pill,
  Star,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface ProductDetailsViewProps {
  product: {
    id: string;
    slug: string;
    nameEn: string;
    nameBn?: string | null;
    formFactor: string;
    dlsLicenseNo?: string | null;
    bangladeshPatentNo?: string | null;
    thumbnail: string;
    images?: string[];
    shortDescription?: string | null;
    composition?: string | null;
    indication?: string | null;
    dosageAndAdministration?: string | null;
    withdrawalPeriod?: string | null;
    contraindications?: string | null;
    storageInstructions?: string | null;
    speciesTags?: string[];
    category?: {
      nameEn: string;
      nameBn?: string | null;
      slug: string;
    } | null;
    variants: Array<{
      id: string;
      sku: string;
      packSize: string;
      tradePrice: number;
      mrpPrice: number;
      sellingPrice: number;
      discountPercent?: number;
      savingsPerUnit?: number;
      discountType?: 'INDIVIDUAL' | 'UNIVERSAL' | 'NONE';
      hasDiscount?: boolean;
      inStock: boolean;
      packagingInfo?: string | null;
      unitsPerBox?: number | null;
    }>;
    reviews?: ProductReviewItem[];
  };
  relatedProducts?: ProductCardData[];
  universalDiscount?: any;
}

export default function ProductDetailsView({
  product,
  relatedProducts = [],
  universalDiscount,
}: ProductDetailsViewProps) {
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'indication' | 'dosage' | 'composition' | 'safety'>('indication');
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [selectedImage, setSelectedImage] = useState(product.thumbnail || '/images/placeholder-medicine.webp');

  // Dosage calculator state
  const [calcAnimal, setCalcAnimal] = useState<'cattle' | 'goat' | 'poultry'>('cattle');
  const [calcWeight, setCalcWeight] = useState(200);

  const { addItem, openCartDrawer } = useCartStore();

  const variants = product.variants && product.variants.length > 0 ? product.variants : [];
  const currentVariant = variants[selectedVariantIdx] || variants[0];

  const mrp = currentVariant ? Number(currentVariant.mrpPrice || 0) : 0;
  const sellingPrice = currentVariant ? Number(currentVariant.sellingPrice || mrp) : 0;
  const hasDiscount = currentVariant?.hasDiscount ?? (mrp > 0 && sellingPrice < mrp);
  const discountPct = currentVariant?.discountPercent ?? (hasDiscount ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0);
  const savingsPerUnit = currentVariant?.savingsPerUnit ?? (hasDiscount ? mrp - sellingPrice : 0);
  const discountType = currentVariant?.discountType || (hasDiscount ? 'INDIVIDUAL' : 'NONE');
  const subtotal = sellingPrice * quantity;

  const reviews = product.reviews || [];
  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? Number((reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / totalReviews).toFixed(1))
      : 0;

  // Add to cart handler
  const handleAddToCart = () => {
    if (!currentVariant) return;

    addItem({
      variantId: currentVariant.id,
      productId: product.id,
      nameEn: product.nameEn,
      nameBn: product.nameBn,
      packSize: currentVariant.packSize,
      sku: currentVariant.sku,
      tradePrice: Number(currentVariant.tradePrice || sellingPrice),
      mrpPrice: mrp,
      sellingPrice: sellingPrice,
      quantity,
      image: product.thumbnail,
    });

    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  // Instant buy handler
  const handleInstantBuy = () => {
    handleAddToCart();
    openCartDrawer();
  };

  // WhatsApp order link
  const whatsappMsg = encodeURIComponent(
    `আসসালামু আলাইকুম, আমি Research Agro Vet থেকে ${product.nameEn} (${currentVariant?.packSize || ''}, পরিমাণ: ${quantity} টি, সর্বমোট: ৳${subtotal}) অর্ডার করতে চাই।`
  );
  const whatsappUrl = `https://wa.me/8801716019731?text=${whatsappMsg}`;

  // Quick Carton setter
  const handleSetFullBox = () => {
    if (currentVariant?.unitsPerBox) {
      setQuantity(currentVariant.unitsPerBox);
    }
  };

  // Dose calculation logic
  const calculateDose = () => {
    if (calcAnimal === 'cattle') {
      const ml = Math.round(calcWeight * 0.25);
      return `${toBengaliNumber(Math.max(10, ml))} - ${toBengaliNumber(Math.max(15, ml + 10))} মিলি দৈনিক`;
    } else if (calcAnimal === 'goat') {
      const ml = Math.round(calcWeight * 0.4);
      return `${toBengaliNumber(Math.max(5, ml))} - ${toBengaliNumber(Math.max(8, ml + 5))} মিলি দৈনিক`;
    } else {
      return `প্রতি ১০০০ পাখির জন্য ${toBengaliNumber(100)} - ${toBengaliNumber(150)} মিলি পানিতে মিশিয়ে`;
    }
  };

  // Deduplicate product images so the same picture never appears twice
  const rawImages = [
    product.thumbnail,
    ...(Array.isArray(product.images) ? product.images : []),
  ].filter(Boolean) as string[];

  const imagesList = Array.from(new Set(rawImages));
  const currentImgIndex = Math.max(0, imagesList.indexOf(selectedImage));

  const handlePrevImage = () => {
    if (imagesList.length <= 1) return;
    const prevIdx = currentImgIndex <= 0 ? imagesList.length - 1 : currentImgIndex - 1;
    setSelectedImage(imagesList[prevIdx]);
  };

  const handleNextImage = () => {
    if (imagesList.length <= 1) return;
    const nextIdx = currentImgIndex >= imagesList.length - 1 ? 0 : currentImgIndex + 1;
    setSelectedImage(imagesList[nextIdx]);
  };

  return (
    <div className="sm:space-y-8 space-y-5">
      {/* Product Primary 2-Column Presentation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Media Stage & Hotline (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Visual Box */}
          <div className="relative aspect-square w-full bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex items-center justify-center overflow-hidden group">
            {/* Regulatory Badge */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
              <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200 flex items-center gap-1 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                অনুমোদিত
              </span>
            </div>

            {/* Navigation Arrows (if multiple unique pictures exist) */}
            {imagesList.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePrevImage();
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 hover:bg-white border border-slate-200/90 shadow-md flex items-center justify-center text-slate-700 hover:text-[#005d42] transition-all z-20 cursor-pointer active:scale-95"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNextImage();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 hover:bg-white border border-slate-200/90 shadow-md flex items-center justify-center text-slate-700 hover:text-[#005d42] transition-all z-20 cursor-pointer active:scale-95"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full bg-slate-900/60 backdrop-blur-xs text-white text-[10px] font-mono font-bold z-10">
                  {currentImgIndex + 1} / {imagesList.length}
                </span>
              </>
            )}

            {/* Product Image */}
            <div className="w-full h-full flex items-center justify-center p-4">
              <img
                src={selectedImage}
                alt={product.nameEn}
                className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Gallery Thumbnails (only if multiple unique pictures exist) */}
          {imagesList.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {imagesList.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 rounded-xl bg-white border p-1 shrink-0 transition-all cursor-pointer ${
                    selectedImage === img
                      ? 'border-[#005d42] ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-contain mix-blend-multiply" />
                </button>
              ))}
            </div>
          )}

          
        </div>

        {/* Right Column: Taxonomy, Pricing, Pack Sizes & CTAs (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Title & Taxonomy Block */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            {/* <div className="flex flex-wrap items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                {product.category?.nameBn || product.category?.nameEn || 'ভেটেরিনারি ফিড প্রিমিক্স'}
              </span>
              
            </div> */}

            <div>
              <div className='flex justify-between items-center'>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                  {product.nameEn}
                </h1>
              </div>

              {/* Star Rating & Reviews anchor link */}
              <div className="flex items-center gap-2 pt-1.5 pb-0.5">
                <a
                  href="#reviews-section"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-emerald-800 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          totalReviews > 0 && s <= Math.round(avgRating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  {totalReviews > 0 ? (
                    <>
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        {toBengaliNumber(avgRating)}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className=" decoration-slate-300 group-hover:decoration-emerald-700 text-slate-600">
                        {toBengaliNumber(totalReviews)} টি
                      </span>
                    </>
                  ) : (
                    <span className="text-slate-500 hover:underline">
                    </span>
                  )}
                </a>
              </div>
              
              {product.shortDescription && (
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{product.shortDescription}</p>
              )}
            </div>

            {/* Species Target Badges */}
            {product.speciesTags && product.speciesTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-xs font-bold text-slate-700 mr-1">উপযোগী প্রাণী:</span>
                {product.speciesTags.map((spec, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200/60"
                  >
                    {spec === 'CATTLE_BUFFALO'
                      ? 'গরু ও মহিষ'
                      : spec === 'POULTRY'
                      ? 'পোল্ট্রি ও হাঁস'
                      : spec === 'GOAT_SHEEP'
                      ? 'ছাগল ও ভেড়া'
                      : spec === 'AQUA'
                      ? 'মৎস্য ও চিংড়ি'
                      : spec}
                  </span>
                ))}
              </div>
            )}

            {/* Dynamic Price Box */}
            <div className="bg-slate-50 border border-slate-200/90 px-3.5 py-2.5 sm:p-4 rounded-xl flex items-center justify-between gap-3 mt-3">
              <div className="min-w-0">
                <div className="flex items-baseline gap-2 sm:gap-2.5 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black text-[#047857] font-mono tracking-tight">
                    ৳{toBengaliNumber(sellingPrice)}
                  </span>
                  {mrp > sellingPrice && (
                    <span className="text-xs sm:text-sm text-slate-400 line-through font-mono">
                      ৳{toBengaliNumber(mrp)}
                    </span>
                  )}
                  {hasDiscount ? (
                    <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 text-xs sm:text-sm font-extrabold flex items-center gap-1">
                      <span>{toBengaliNumber(discountPct)}% ছাড়</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-[#005d42] text-xs font-bold border border-emerald-200">
                      Best Deal
                    </span>
                  )}
                </div>
                {/* {savingsPerUnit > 0 && (
                  <p className="text-xs font-bold text-emerald-800 mt-1">
                    🎉 প্রতিটি ফাইলে সাশ্রয়: ৳{toBengaliNumber(savingsPerUnit)}
                  </p>
                )} */}
              </div>

              <div className="shrink-0 text-right sm:border-l sm:border-slate-200 sm:pl-4">
                {/* Mobile screen: slim single-line "Home Delivery" */}
                <div className="sm:hidden flex items-center justify-end gap-1 text-xs font-bold text-slate-800 whitespace-nowrap">
                  <Truck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Home Delivery</span>
                </div>

                {/* Desktop & tablet screen: full delivery note */}
                <div className="hidden sm:block">
                  <span className="text-xs text-slate-500 font-medium block">সারাদেশে ডেলিভারি</span>
                  <span className="text-xs font-bold text-slate-800 flex items-center justify-end gap-1 mt-0.5 whitespace-nowrap">
                    <Truck className="w-3.5 h-3.5 text-emerald-700" />
                    ২৪-৪৮ ঘণ্টায় হোম ডেলিভারি
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pack Size & Quantity Block */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            {/* Pack Size Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-emerald-700" />
                  প্যাক সাইজ নির্বাচন করুন:
                </label>
                {currentVariant && (
                  <span className="text-xs font-bold text-emerald-800">
                    {currentVariant.packSize}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {variants.map((v, idx) => {
                  const isSelected = idx === selectedVariantIdx;
                  const vMrp = Number(v.mrpPrice || 0);
                  const vPrice = Number(v.sellingPrice || vMrp);

                  return (
                    <button
                      key={v.id || idx}
                      type="button"
                      onClick={() => setSelectedVariantIdx(idx)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{v.packSize}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />}
                      </div>
                      <span className="text-xs font-mono font-bold text-[#047857] block mt-1">
                        ৳{toBengaliNumber(vPrice)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Carton Master Info - Only show when packaging info or unitsPerBox actually exists */}
            {Boolean(currentVariant?.packagingInfo || currentVariant?.unitsPerBox) && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-slate-500" />
                  <span>
                    {currentVariant?.packagingInfo ||
                      `১ কার্টনে ${toBengaliNumber(currentVariant?.unitsPerBox || 0)} টি থাকে`}
                  </span>
                </span>
                {Boolean(currentVariant?.unitsPerBox) && (
                  <button
                    type="button"
                    onClick={handleSetFullBox}
                    className="font-bold text-emerald-800 hover:text-emerald-900 underline cursor-pointer"
                  >
                    সম্পূর্ণ কার্টন যোগ করুন ({toBengaliNumber(currentVariant?.unitsPerBox || 0)} টি)
                  </button>
                )}
              </div>
            )}

            {/* Quantity Stepper & Running Subtotal */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700">পরিমাণ:</span>
                <div className="inline-flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-sm font-mono font-bold text-slate-900">
                    {toBengaliNumber(quantity)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-9 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 block">মোট প্রদেয় মূল্য:</span>
                <span className="text-2xl font-black text-[#047857] font-mono">
                  ৳{toBengaliNumber(subtotal)}
                </span>
              </div>
            </div>

            {/* 3 High-Conversion CTA Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              {/* Button 1: Add to Cart */}
              <button
                type="button"
                onClick={handleAddToCart}
                className={`py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs border cursor-pointer ${
                  addedAnimation
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-200'
                }`}
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>যোগ হয়েছে!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>কার্টে যোগ করুন</span>
                  </>
                )}
              </button>

              {/* Button 2: Buy Now */}
              <button
                type="button"
                onClick={handleInstantBuy}
                className="py-3 px-3 rounded-xl font-bold text-xs bg-[#d97706] hover:bg-[#b45309] text-white flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>অর্ডার করুন</span>
              </button>

              {/* Button 3: WhatsApp Order */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-3 rounded-xl font-bold text-xs bg-[#16A34A] hover:bg-[#15803D] text-white flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>হোয়াটসঅ্যাপে অর্ডার</span>
              </a>
            </div>

            {/* Micro Assurances */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-[10px] text-slate-500 font-medium">
              <span className="flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                ১০০% আসল ফর্মুলেশন
              </span>
              <span className="flex items-center justify-center gap-1">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                ক্যাশ অন ডেলিভারি
              </span>
              <span className="flex items-center justify-center gap-1">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                ফোনে যাচাই ও নিশ্চয়তা
              </span>
            </div>
          </div>
        </div>
      </div>

      

      {/* Clinical Reference Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
        {/* Tabs Headers */}
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('indication')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'indication'
                ? 'border-emerald-600 text-emerald-800 font-extrabold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            <span>১. ব্যবহার ক্ষেত্র (Indication)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dosage')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'dosage'
                ? 'border-emerald-600 text-emerald-800 font-extrabold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>২. মাত্রা ও প্রয়োগবিধি (Dosage)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('composition')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'composition'
                ? 'border-emerald-600 text-emerald-800 font-extrabold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>৩. উপাদান (Composition)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('safety')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'safety'
                ? 'border-emerald-600 text-emerald-800 font-extrabold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>৪. সতর্কতা ও সংরক্ষণ (Safety)</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="pt-2 text-sm text-slate-700 leading-relaxed min-h-[120px]">
          {activeTab === 'indication' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">রোগ ও প্রয়োগ ক্ষেত্র:</h4>
              <p className="whitespace-pre-line text-slate-600 text-xs sm:text-sm">
                {product.indication || 'গবাদিপশু ও হাঁস-মুরগির পুষ্টি চাহিদা পূরণ ও উৎপাদন বৃদ্ধিতে সহায়ক।'}
              </p>
            </div>
          )}

          {activeTab === 'dosage' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">প্রয়োগ মাত্রা ও নিয়ম:</h4>
              <p className="whitespace-pre-line text-slate-600 text-xs sm:text-sm">
                {product.dosageAndAdministration ||
                  'পশুর ওজন ও বয়স অনুযায়ী খাবার পানিতে মিশিয়ে অথবা চিকিৎসকের পরামর্শ অনুযায়ী সেব্য।'}
              </p>
            </div>
          )}

          {activeTab === 'composition' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">সক্রিয় উপাদানসমূহ:</h4>
              <p className="whitespace-pre-line text-slate-600 text-xs sm:text-sm font-mono bg-slate-50 p-4 rounded-xl border border-slate-200">
                {product.composition || 'উপাদান তথ্যের জন্য বোতল অথবা প্যাকেটের গায়ে সংযুক্ত লেবেল দেখুন।'}
              </p>
            </div>
          )}

          {activeTab === 'safety' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">সংরক্ষণ ও প্রত্যাহার কাল:</h4>
              <div className="space-y-2 text-xs sm:text-sm text-slate-600">
                <p>
                  <strong>সংরক্ষণ:</strong> {product.storageInstructions || 'আলো থেকে দূরে, ঠান্ডা ও শুষ্ক স্থানে সংরক্ষণ করুন।'}
                </p>
                {product.withdrawalPeriod && (
                  <p>
                    <strong>উইথড্রয়াল পিরিয়ড:</strong> {product.withdrawalPeriod}
                  </p>
                )}
                {product.contraindications && (
                  <p>
                    <strong>পার্শ্বপ্রতিক্রিয়া:</strong> {product.contraindications}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Smart Veterinary Dosage Calculator Module */}
      
      {/* <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-1.5 text-emerald-800 text-xs font-bold">
              <Calculator className="w-4 h-4" />
              <span>স্মার্ট ভেটেরিনারি ডোজ ক্যালকুলেটর</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              প্রাণীর ওজন অনুযায়ী সঠিক প্রয়োগমাত্রা নির্ধারণ
            </h3>
            <p className="text-xs text-slate-500">
              সঠিক মাত্রায় প্রয়োগ নিশ্চিত করলে পণ্যের কার্যকারিতা বজায় থাকে এবং অপচয় রোধ হয়।
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto">
            <select
              value={calcAnimal}
              onChange={(e) => setCalcAnimal(e.target.value as any)}
              className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none focus:border-emerald-600"
            >
              <option value="cattle">গরু ও মহিষ (বড়)</option>
              <option value="goat">ছাগল ও ভেড়া (ছোট)</option>
              <option value="poultry">পোল্ট্রি ও লেয়ার</option>
            </select>

            {calcAnimal !== 'poultry' && (
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 h-10">
                <input
                  type="number"
                  min="10"
                  max="800"
                  value={calcWeight}
                  onChange={(e) => setCalcWeight(Number(e.target.value) || 0)}
                  className="w-16 bg-transparent text-xs font-mono font-bold text-slate-900 outline-none text-center"
                />
                <span className="text-xs text-slate-500 font-bold">কেজি</span>
              </div>
            )}

            <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-lg text-center min-w-[150px]">
              <span className="text-[10px] text-emerald-800 font-bold block">প্রয়োজনীয় ডোজ</span>
              <span className="text-xs font-bold text-[#047857]">{calculateDose()}</span>
            </div>
          </div>
        </div>
      </div> */}

      {/* Product Reviews Section */}
      <ProductReviewsSection
        productId={product.id}
        productName={product.nameEn}
        initialReviews={reviews}
      />

      {/* Related Products Grid */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">সংশ্লিষ্ট অন্যান্য পণ্যসমূহ</h3>
              <p className="text-xs text-slate-500">খামারীদের সর্বাধিক ব্যবহৃত অন্যান্য প্রয়োজনীয় ফিড প্রিমিক্স পণ্য</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {relatedProducts.slice(0, 4).map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
