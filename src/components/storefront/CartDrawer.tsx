'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { toBengaliNumber } from '@/lib/formatters';

export default function CartDrawer() {
  const {
    items,
    buyerMode,
    isCartDrawerOpen,
    isSyncing,
    closeCartDrawer,
    updateQuantity,
    removeItem,
    getCartSubtotal,
    getItemCount,
  } = useCartStore();

  const subtotal = getCartSubtotal();
  const count = getItemCount();
  const hasBlockedItems = items.some(
    (i) => i.isPurchasable === false || i.inStock === false || i.isAvailable === false
  );

  return (
    <AnimatePresence>
      {isCartDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop with Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={closeCartDrawer}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
          />

          {/* Drawer Slide-in from Right with Spring Zero-Overshoot */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 300, bounce: 0 }}
            className="absolute inset-y-0 right-0 w-[86%] sm:w-full max-w-sm sm:max-w-md bg-white shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-[#005d42] text-white flex items-center justify-between shadow-sm shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-emerald-100" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="font-extrabold text-sm sm:text-base leading-tight">শপিং কার্ট</h2>
                    {isSyncing && (
                      <span className="inline-flex items-center gap-1 text-[9px] text-emerald-200 bg-white/10 px-1.5 py-0.5 rounded animate-pulse">
                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                        যাচাই...
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-emerald-100/90 font-medium">
                    {toBengaliNumber(count)} টি আইটেম যুক্ত রয়েছে
                  </span>
                </div>
              </div>
              <button
                onClick={closeCartDrawer}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/90 hover:text-white cursor-pointer"
                aria-label="কার্ট বন্ধ করুন"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 sm:space-y-3 bg-slate-50/50">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
                  <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <ShoppingBag className="w-7 h-7 text-slate-300 stroke-[1.5]" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-700">আপনার কার্ট খালি</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-[220px]">
                    পছন্দের পণ্য কার্টে যুক্ত করে দ্রুত অর্ডার সম্পন্ন করুন।
                  </p>
                  <button
                    onClick={closeCartDrawer}
                    className="mt-4 px-4 py-2 rounded-xl text-xs text-white font-bold bg-[#005d42] hover:bg-emerald-800 transition-colors shadow-2xs cursor-pointer"
                  >
                    পণ্য তালিকা দেখুন
                  </button>
                </div>
              ) : (
                items.map((item) => {
                  const unitPrice = buyerMode === 'WHOLESALE' ? item.tradePrice : item.sellingPrice;
                  const lineTotal = unitPrice * item.quantity;
                  const hasDiscount = Boolean(item.hasDiscount) && item.mrpPrice > unitPrice;
                  const discountPercent =
                    item.discountPercent ||
                    (hasDiscount ? Math.round(((item.mrpPrice - unitPrice) / item.mrpPrice) * 100) : 0);
                  const isBlocked =
                    item.isPurchasable === false || item.inStock === false || item.isAvailable === false;

                  return (
                    <div
                      key={item.variantId}
                      className={`flex gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl border bg-white transition-all shadow-2xs ${
                        isBlocked ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200/90 hover:border-emerald-300'
                      }`}
                    >
                      {/* Thumbnail Image: Compact on Mobile */}
                      <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-lg bg-slate-50 p-1 border border-slate-100 shrink-0 flex items-center justify-center overflow-hidden relative">
                        <img
                          src={item.image || '/images/placeholder-medicine.webp'}
                          alt={item.nameEn}
                          className={`w-full h-full object-contain mix-blend-multiply ${
                            isBlocked ? 'opacity-50 grayscale' : ''
                          }`}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/images/placeholder-medicine.webp';
                          }}
                        />
                        {isBlocked && (
                          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center">
                            <span className="text-[9px] font-black text-white bg-rose-600 px-1 py-0.5 rounded shadow">
                              স্টক শেষ
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Details Column */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          {/* Title & Delete */}
                          <div className="flex items-start justify-between gap-1.5">
                            <div className="min-w-0">
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug truncate">
                                {item.nameEn}
                              </h4>
                              {item.nameBn && (
                                <p className="text-[11px] text-slate-500 truncate font-medium">
                                  {item.nameBn}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => removeItem(item.variantId)}
                              className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-md transition-colors shrink-0 cursor-pointer"
                              title="মুছে ফেলুন"
                              aria-label={`${item.nameEn} মুছে ফেলুন`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Status Alert Badge */}
                          {isBlocked && (
                            <div className="mt-0.5 inline-flex items-center gap-1 text-[9px] font-bold text-rose-700 bg-rose-100/80 px-1.5 py-0.5 rounded">
                              <AlertCircle className="w-2.5 h-2.5 shrink-0" />
                              <span>{item.statusMessage || 'অনুপলব্ধ'}</span>
                            </div>
                          )}

                          {/* Pack Size & Unit Price */}
                          <div className="flex items-center gap-1.5 flex-wrap mt-1">
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200/70">
                              {item.packSize}
                            </span>
                            <span className="text-xs sm:text-sm font-extrabold text-[#005d42] font-mono">
                              ৳{unitPrice.toLocaleString()}
                            </span>
                            {hasDiscount && !isBlocked && (
                              <>
                                <span className="line-through text-slate-400 text-[10px] font-mono">
                                  ৳{item.mrpPrice.toLocaleString()}
                                </span>
                                <span className="text-[9px] font-bold text-rose-700 bg-rose-50 px-1 py-0.5 rounded border border-rose-200">
                                  {toBengaliNumber(discountPercent)}%
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Quantity Stepper & Line Total */}
                        <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-slate-100">
                          {/* Stepper Controls */}
                          <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden shadow-2xs">
                            <button
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                              className="w-6.5 h-6.5 flex items-center justify-center hover:bg-slate-200/80 text-slate-700 transition-colors active:scale-95 cursor-pointer"
                              aria-label="পরিমাণ কমান"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center text-xs font-bold font-mono text-slate-900 select-none">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                              disabled={isBlocked}
                              className="w-6.5 h-6.5 flex items-center justify-center hover:bg-slate-200/80 text-slate-700 transition-colors active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                              aria-label="পরিমাণ বাড়ান"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Line Total */}
                          <div className="text-right">
                            <span className="text-xs sm:text-sm font-black text-slate-900 font-mono">
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

            {/* Footer Summary & Checkout CTA */}
            {items.length > 0 && (
              <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-white space-y-2.5 sm:space-y-3 shadow-lg shrink-0">
                {/* Subtotal */}
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-700 block">
                      মোট মূল্য (Subtotal):
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      ডেলিভারি চার্জ চেকআউটে যুক্ত হবে
                    </span>
                  </div>
                  <span className="text-lg sm:text-2xl font-black text-[#005d42] font-mono tracking-tight">
                    ৳{subtotal.toLocaleString()}
                  </span>
                </div>

                {/* Checkout CTA */}
                {hasBlockedItems ? (
                  <div className="space-y-2">
                    <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>স্টক শেষ বা অনুপলব্ধ পণ্যটি মুছে দিন।</span>
                    </div>
                    <button
                      type="button"
                      disabled
                      className="w-full py-2.5 sm:py-3 bg-slate-200 text-slate-500 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                      <span>অনুপলব্ধ পণ্য সরিয়ে নিন</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/checkout"
                    onClick={closeCartDrawer}
                    className="w-full py-2.5 sm:py-3 bg-[#005d42] hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-[0.99] cursor-pointer"
                  >
                    <span>চেকআউট করুন</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
