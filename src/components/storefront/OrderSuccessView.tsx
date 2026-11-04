'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getApiUrl } from '@/lib/api-client';
import {
  CheckCircle2,
  Copy,
  Check,
  Phone,
  MessageSquare,
  Clock,
  ArrowRight,
  FileText,
} from 'lucide-react';

export default function OrderSuccessView({ orderNumber }: { orderNumber: string }) {
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      if (!orderNumber) return;
      try {
        const res = await fetch(getApiUrl(`/api/orders/${orderNumber}`));
        const data = await res.json();
        if (data.success && data.order) {
          setOrder(data.order);
        }
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadOrder();
  }, [orderNumber]);

  const handleCopy = () => {
    if (orderNumber) {
      navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#005d42] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50 min-h-screen py-8 sm:py-14">
      <div className="max-w-3xl mx-auto px-4 space-y-6">
        {/* Celebratory Success Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 text-center shadow-sm relative overflow-hidden">
          <div className="w-20 h-20 rounded-full bg-emerald-100/90 text-[#005d42] flex items-center justify-center mx-auto mb-4 border-4 border-emerald-50 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            অর্ডার সফলভাবে গ্রহণ করা হয়েছে!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
            ধন্যবাদ! আপনার অর্ডারটি রিসার্চ এগ্রো ভেট সেন্ট্রাল সিস্টেমে নিবন্ধিত হয়েছে। কোনো অগ্রিম পেমেন্টের প্রয়োজন নেই।
          </p>

          {/* Order ID Pill with Copy Button */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mt-5 rounded-2xl bg-emerald-50 border border-emerald-200/80 shadow-2xs">
            <span className="text-xs text-emerald-800 font-semibold">অর্ডার আইডি:</span>
            <span className="font-mono font-black text-base text-[#005d42] tracking-wider">
              {orderNumber}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="p-1 text-emerald-700 hover:text-emerald-900 rounded-lg hover:bg-emerald-200/60 transition-colors ml-1 cursor-pointer"
              title="অর্ডার নম্বর কপি করুন"
            >
              {copied ? (
                <Check className="w-4 h-4 text-[#005d42]" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Tele-Confirmation Timeline Card */}
        {/* <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Clock className="w-5 h-5 text-[#005d42]" />
            <h2 className="font-bold text-slate-900 text-sm sm:text-base">
              পরবর্তী ধাপসমূহ (Next Steps)
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#005d42] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                ✓
              </span>
              <div>
                <h4 className="font-bold text-slate-900">১. অর্ডার গ্রহণ সম্পন্ন</h4>
                <p className="text-slate-500 mt-0.5">আপনার অর্ডারের তথ্য সেন্ট্রাল ডিসপ্যাচ কিউতে যুক্ত হয়েছে।</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 animate-pulse">
                ২
              </span>
              <div>
                <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
                  <span>২. টেলি-কনফার্মেশন ও ডোজ পরামর্শ</span>
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-200/80 text-amber-900">
                    প্রক্রিয়াধীন
                  </span>
                </h4>
                <p className="text-slate-600 mt-0.5 leading-relaxed">
                  আমাদের ভেটেরিনারি এক্সপার্ট টিম শীঘ্রই আপনার প্রদত্ত নম্বরে ফোন করে ডোজ, মেয়াদ ও কুরিয়ার ডেলিভারি পয়েন্ট নিশ্চিত করবেন।
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 opacity-80">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                ৩
              </span>
              <div>
                <h4 className="font-bold text-slate-700">৩. নিরাপদ থার্মাল প্যাকিং ও ডিসপ্যাচ</h4>
                <p className="text-slate-500 mt-0.5">তাপরোধী বিশেষ বক্সে আইস-প্যাক সহ কুরিয়ারে বুকিং দেওয়া হবে।</p>
              </div>
            </div>

            <div className="flex items-start gap-3 opacity-80">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                ৪
              </span>
              <div>
                <h4 className="font-bold text-slate-700">৪. ক্যাশ অন ডেলিভারি গ্রহণ</h4>
                <p className="text-slate-500 mt-0.5">পণ্য হাতে পেয়ে যাচাই করে মূল্য পরিশোধ করুন।</p>
              </div>
            </div>
          </div>
        </div> */}

        {/* Customer Snapshot & Items Receipt (If Order Loaded) */}
        {order && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#005d42]" />
                <h2 className="font-bold text-slate-900 text-sm sm:text-base">
                  অর্ডারের সারসংক্ষেপ
                </h2>
              </div>
              <span className="inline-block px-3 py-1 rounded-xl text-xs font-black text-[#005d42] bg-emerald-50 border border-emerald-200 font-mono">
                মোট প্রদেয়: ৳{order.grandTotal.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">গ্রাহক:</span>
                <p className="font-bold text-slate-900 text-sm">{order.customerName}</p>
                <p className="font-mono text-slate-600 mt-0.5">{order.customerPhone}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">ডেলিভারি ঠিকানা:</span>
                <p className="text-slate-800 font-medium">{order.address}</p>
                <p className="text-slate-500">{order.upazila}, {order.district}</p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-100 rounded-xl overflow-hidden">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">ওষুধের নাম</th>
                    <th className="py-2.5 px-3">প্যাক সাইজ</th>
                    <th className="py-2.5 px-3 text-center">পরিমাণ</th>
                    <th className="py-2.5 px-3 text-right">মোট টাকা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {item.nameEn}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{item.packSize}</td>
                      <td className="py-2.5 px-3 text-center font-bold font-mono">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono">
                        ৳{item.lineTotal.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financials Breakdown */}
            <div className="space-y-1.5 text-xs text-right pt-2 border-t border-slate-100 max-w-xs ml-auto">
              <div className="flex justify-between text-slate-600">
                <span>সাবটোটাল:</span>
                <span className="font-bold font-mono">৳{order.subtotal.toLocaleString()}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-[#005d42] font-semibold">
                  <span>ছাড়:</span>
                  <span className="font-bold font-mono">-৳{order.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>ডেলিভারি চার্জ:</span>
                <span className="font-bold font-mono">৳{order.shippingFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-black text-slate-900 text-sm pt-1 border-t border-slate-200">
                <span>ক্যাশ অন ডেলিভারি কালেকশন:</span>
                <span className="text-[#005d42] font-mono">৳{order.grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Contact & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href="tel:01711234567"
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <Phone className="w-4 h-4 text-[#005d42]" />
              <span>কল হেল্পলাইন (০১৭১১-২৩৪৫৬৭)</span>
            </a>

            <a
              href={`https://wa.me/8801711234567?text=${encodeURIComponent(
                `আসসালামু আলাইকুম Research Agro Vet, আমার অর্ডার #${orderNumber} সংক্রান্ত বিষয়ে যোগাযোগ করছি।`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803d] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <MessageSquare className="w-4 h-4" />
              <span>হোয়াটসঅ্যাপ</span>
            </a>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Link
              href="/products"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#005d42] hover:bg-[#004e37] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <span>আরও কেনাকাটা করুন</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

