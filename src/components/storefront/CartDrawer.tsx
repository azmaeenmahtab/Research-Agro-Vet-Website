'use client';

import Link from 'next/link';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

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
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 bg-emerald-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <h2 className="font-bold text-sm">শপিং কার্ট ({count} টি আইটেম)</h2>
            </div>
            <button
              onClick={closeCartDrawer}
              className="p-1 hover:bg-emerald-700 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
                <ShoppingBag className="w-12 h-12 stroke-[1.5] mb-2" />
                <p className="text-sm font-medium">আপনার কার্ট বর্তমানে খালি রয়েছে</p>
                <button
                  onClick={closeCartDrawer}
                  className="mt-3 text-xs text-emerald-700 font-bold hover:underline"
                >
                  পণ্য দেখতে ক্লিক করুন
                </button>
              </div>
            ) : (
              items.map((item) => {
                const unitPrice = buyerMode === 'WHOLESALE' ? item.tradePrice : item.sellingPrice;
                return (
                  <div
                    key={item.variantId}
                    className="flex gap-3 p-2.5 rounded-lg border border-slate-200 bg-slate-50/50"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{item.nameEn}</h4>
                      {item.nameBn && <p className="text-[11px] text-slate-500 truncate">{item.nameBn}</p>}
                      <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-semibold mt-0.5">
                        <span className="text-slate-600">প্যাক সাইজ: {item.packSize}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-emerald-700 font-bold">৳{unitPrice}</span>
                        {item.mrpPrice > unitPrice && (
                          <>
                            <span className="line-through text-slate-400 text-[10px]">
                              ৳{item.mrpPrice}
                            </span>
                            <span className="text-[10px] text-red-600 font-bold bg-red-50 px-1 rounded border border-red-200">
                              {Math.round(((item.mrpPrice - unitPrice) / item.mrpPrice) * 100)}% ছাড়
                            </span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity controls */}
                        <div className="flex items-center border border-slate-200 rounded bg-white">
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="p-1 hover:bg-slate-100 text-slate-600"
                            aria-label="পরিমাণ কমান"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            className="p-1 hover:bg-slate-100 text-slate-600"
                            aria-label="পরিমাণ বাড়ান"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-bold text-slate-900">
                          ৳{(unitPrice * item.quantity).toLocaleString('bn-BD')}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="text-slate-400 hover:text-red-500 p-1 self-start"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="flex justify-between text-sm font-bold text-slate-900">
                <span>সর্বমোট:</span>
                <span className="text-emerald-700">৳{subtotal.toLocaleString('bn-BD')}</span>
              </div>
              <p className="text-[11px] text-slate-500">ডেলিভারি চার্জ চেকআউটে ঠিকানা অনুযায়ী যুক্ত হবে।</p>
              <Link
                href="/checkout"
                onClick={closeCartDrawer}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <span>অর্ডার সম্পন্ন করুন / চেকআউট</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
