'use client';

import Link from 'next/link';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { toBengaliNumber } from '@/lib/formatters';

export default function CartDrawer() {
  const {
    items,
    buyerMode,
    isCartDrawerOpen,
    closeCartDrawer,
    updateQuantity,
    removeItem,
    getCartSubtotal,
    getItemCount,
  } = useCartStore();

  if (!isCartDrawerOpen) return null;

  const subtotal = getCartSubtotal();
  const count = getItemCount();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCartDrawer}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="px-5 py-4 bg-[#005d42] text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-emerald-100" />
              </div>
              <div>
                <h2 className="font-extrabold text-base sm:text-lg leading-tight">শপিং কার্ট</h2>
                <span className="text-xs text-emerald-100/90 font-medium">
                  {toBengaliNumber(count)} টি আইটেম যুক্ত রয়েছে
                </span>
              </div>
            </div>
            <button
              onClick={closeCartDrawer}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/90 hover:text-white"
              aria-label="কার্ট বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-slate-50/50">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-16">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-10 h-10 text-slate-300 stroke-[1.5]" />
                </div>
                <h3 className="text-base font-bold text-slate-700">আপনার কার্ট বর্তমানে খালি</h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xs">
                  পছন্দের পণ্য কার্টে যুক্ত করে দ্রুত ও সহজে অর্ডার সম্পন্ন করুন।
                </p>
                <button
                  onClick={closeCartDrawer}
                  className="mt-5 px-5 py-2.5 rounded-xl text-xs sm:text-sm text-white font-bold bg-[#005d42] hover:bg-emerald-800 transition-colors shadow-sm"
                >
                  পণ্য তালিকা দেখুন
                </button>
              </div>
            ) : (
              items.map((item) => {
                const unitPrice = buyerMode === 'WHOLESALE' ? item.tradePrice : item.sellingPrice;
                const lineTotal = unitPrice * item.quantity;
                const hasDiscount = item.mrpPrice > unitPrice;
                const discountPercent = hasDiscount
                  ? Math.round(((item.mrpPrice - unitPrice) / item.mrpPrice) * 100)
                  : 0;

                return (
                  <div
                    key={item.variantId}
                    className="flex gap-3.5 p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-emerald-300 transition-all shadow-2xs"
                  >
                    {/* Thumbnail Image */}
                    <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl bg-slate-50 p-2 border border-slate-100 shrink-0 flex items-center justify-center overflow-hidden">
                      <img
                        src={item.image || '/images/placeholder-medicine.webp'}
                        alt={item.nameEn}
                        className="w-full h-full object-contain mix-blend-multiply"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/images/placeholder-medicine.webp';
                        }}
                      />
                    </div>

                    {/* Details Column */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        {/* Title & Delete */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug truncate">
                              {item.nameEn}
                            </h4>
                            {item.nameBn && (
                              <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
                                {item.nameBn}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => removeItem(item.variantId)}
                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors shrink-0"
                            title="মুছে ফেলুন"
                            aria-label={`${item.nameEn} মুছে ফেলুন`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Pack Size & Unit Price */}
                        <div className="flex items-center gap-2 flex-wrap mt-1.5">
                          <span className="inline-block px-2 py-0.5 rounded-md text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200/70">
                            {item.packSize}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-sm sm:text-base font-extrabold text-[#005d42] font-mono">
                            ৳{unitPrice.toLocaleString()}
                          </span>
                          {hasDiscount && (
                            <>
                              <span className="line-through text-slate-400 text-xs font-mono">
                                ৳{item.mrpPrice.toLocaleString()}
                              </span>
                              <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                {toBengaliNumber(discountPercent)}% ছাড়
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Quantity Stepper & Line Total */}
                      <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100">
                        {/* Stepper Controls */}
                        <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden shadow-2xs">
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-slate-200/80 text-slate-700 transition-colors active:scale-95"
                            aria-label="পরিমাণ কমান"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-9 text-center text-sm font-bold font-mono text-slate-900 select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-slate-200/80 text-slate-700 transition-colors active:scale-95"
                            aria-label="পরিমাণ বাড়ান"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Line Total */}
                        <div className="text-right">
                          <span className="text-sm sm:text-base font-black text-slate-900 font-mono">
                            ৳{lineTotal.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-white space-y-4 shadow-lg">
              {/* Subtotal */}
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-sm sm:text-base font-bold text-slate-700 block">
                    মোট পণ্যের মূল্য (Subtotal):
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    ডেলিভারি চার্জ চেকআউটে ঠিকানার ভিত্তিতে যুক্ত হবে
                  </span>
                </div>
                <span className="text-2xl sm:text-3xl font-black text-[#005d42] font-mono tracking-tight">
                  ৳{subtotal.toLocaleString()}
                </span>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                onClick={closeCartDrawer}
                className="w-full py-3.5 sm:py-4 bg-[#005d42] hover:bg-emerald-800 text-white rounded-xl text-sm sm:text-base font-extrabold flex items-center justify-center gap-2.5 transition-all shadow-md hover:shadow-lg active:scale-[0.99]"
              >
                <span>অর্ডার সম্পন্ন করুন / চেকআউট</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
