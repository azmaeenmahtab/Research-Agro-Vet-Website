'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  Phone,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  AlertCircle,
  ExternalLink,
  Calendar,
  ShoppingBag,
  ShieldAlert,
  ChevronRight,
  ArrowRight,
  RotateCcw,
  XCircle,
  Loader2,
  HelpCircle,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/storefront/HeroSection';

interface OrderItem {
  id: string;
  productId: string;
  productNameEn: string;
  productNameBn: string;
  packSize: string;
  quantity: number;
  unitSellingPrice: number;
  lineTotal: number;
  thumbnail: string;
  formFactor: string | null;
}

interface TrackedOrder {
  id: string;
  orderNumber: string;
  orderType: string;
  orderStatus: 'PENDING' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerAltPhone?: string | null;
  district: string;
  upazila: string;
  address: string;
  orderNote?: string | null;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  courierProvider?: string | null;
  consignmentId?: string | null;
  trackingCode?: string | null;
  trackingUrl?: string | null;
  courierStatus?: string | null;
  dispatchedAt?: string | null;
  deliveredAt?: string | null;
  items: OrderItem[];
}

const SUPPORT_PHONE = '01716019731';
const SUPPORT_PHONE_DISPLAY = '০১৭১৬-০১৯৭৩১';

const ORDER_STEPS = [
  { key: 'PENDING', label: 'অর্ডার গৃহীত', desc: 'অর্ডারটি সিস্টেমে লিপিবদ্ধ হয়েছে' },
  { key: 'CONFIRMED', label: 'যাচাই ও নিশ্চিত', desc: 'ফোনে কথা বলে অর্ডার নিশ্চিত করা হয়েছে' },
  { key: 'PACKED', label: 'প্যাকেজিং সম্পন্ন', desc: 'ফার্মাসিউটিক্যাল প্যাকেজিং প্রস্তুত' },
  { key: 'SHIPPED', label: 'কুরিয়ারে ইন-ট্রানজিট', desc: 'আপনার গন্তব্যে পাঠানো হয়েছে' },
  { key: 'DELIVERED', label: 'ডেলিভারি সম্পন্ন', desc: 'গ্রাহক পণ্য গ্রহণ করেছেন' },
];

function getStatusStepIndex(status: string): number {
  switch (status) {
    case 'PENDING':
      return 0;
    case 'CONFIRMED':
      return 1;
    case 'PACKED':
      return 2;
    case 'SHIPPED':
      return 3;
    case 'DELIVERED':
      return 4;
    default:
      return 0;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'PENDING':
      return {
        label: 'অপেক্ষমাণ (যাচাই চলছে)',
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        dot: 'bg-amber-500',
      };
    case 'CONFIRMED':
      return {
        label: 'নিশ্চিতকৃত',
        bg: 'bg-blue-50 text-blue-800 border-blue-200',
        dot: 'bg-blue-500',
      };
    case 'PACKED':
      return {
        label: 'প্যাকেজিং সম্পন্ন',
        bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        dot: 'bg-indigo-500',
      };
    case 'SHIPPED':
      return {
        label: 'কুরিয়ারে ট্রানজিটে আছে',
        bg: 'bg-purple-50 text-purple-800 border-purple-200',
        dot: 'bg-purple-500',
      };
    case 'DELIVERED':
      return {
        label: 'ডেলিভারি সম্পন্ন',
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dot: 'bg-emerald-600',
      };
    case 'CANCELLED':
      return {
        label: 'বাতিলকৃত',
        bg: 'bg-rose-50 text-rose-800 border-rose-200',
        dot: 'bg-rose-500',
      };
    case 'RETURNED':
      return {
        label: 'ফেরত',
        bg: 'bg-slate-100 text-slate-800 border-slate-300',
        dot: 'bg-slate-500',
      };
    default:
      return {
        label: status,
        bg: 'bg-slate-100 text-slate-800 border-slate-200',
        dot: 'bg-slate-400',
      };
  }
}

function formatBengaliDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<TrackedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Initialize from URL or localStorage
  useEffect(() => {
    const paramPhone = searchParams.get('phone') || searchParams.get('query') || searchParams.get('order');
    if (paramPhone) {
      setSearchQuery(paramPhone);
      executeSearch(paramPhone);
    } else {
      try {
        const savedPhone = localStorage.getItem('rav_track_phone');
        if (savedPhone) {
          setSearchQuery(savedPhone);
        }
      } catch {}
    }
  }, [searchParams]);

  const executeSearch = async (queryToSearch: string) => {
    const q = queryToSearch.trim();
    if (!q) {
      setErrorMessage('অনুগ্রহ করে আপনার মোবাইল নম্বর বা অর্ডার নম্বরটি লিখুন।');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/orders/track?query=${encodeURIComponent(q)}`);
      const data = await res.json();

      if (data.success) {
        setOrders(data.orders || []);
        // Save valid search query in localStorage for convenience
        try {
          localStorage.setItem('rav_track_phone', q);
        } catch {}
      } else {
        setOrders([]);
        setErrorMessage(data.message || 'অর্ডার তথ্য খুঁজে পাওয়া যায়নি।');
      }
    } catch (err: any) {
      setOrders([]);
      setErrorMessage('সার্ভারের সাথে সংযোগ স্থাপন করা সম্ভব হয়নি। কিছু সময় পর পুনরায় চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.replace(`/track-order?query=${encodeURIComponent(searchQuery.trim())}`);
    executeSearch(searchQuery);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 text-center space-y-3">
          
          <h1 className="text-xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            আপনার অর্ডারের বর্তমান অবস্থা জানুন
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            অর্ডারের সময় যে মোবাইল নম্বর দিয়েছিলেন তা লিখুন। আপনার নম্বরে যুক্ত সকল অর্ডারের লাইভ ডেলিভারি স্ট্যাটাস ও বিস্তারিত তথ্য দেখতে পাবেন।
          </p>

          {/* Search Box Form */}
          <div className="pt-4 max-w-xl mx-auto">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="মোবাইল নম্বর (e.g. 01716019731) বা অর্ডার নং"
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-xs"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>খোঁজা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>অর্ডার খুঁজুন</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-6 sm:pt-8 space-y-6">

        {/* STRICT POLICY & DIRECT CANCELLATION NOTICE BANNER */}
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldAlert className="w-5 h-5 text-amber-700" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-extrabold text-amber-950">
                  অর্ডার বাতিল ও রিফান্ড সংক্রান্ত অফিসিয়াল নীতিমালা
                </h4>
                <p className="text-[11px] sm:text-xs text-amber-900/90 leading-relaxed">
                  আমাদের ভেটেরিনারি খাদ্য প্রি-মিক্স পণ্যসমূহ কোল্ড-চেইন ও তাপমাত্রা সংবেদনশীল হওয়ায় কুরিয়ারে বুকিংয়ের পর কোনো পণ্য <strong>ফেরত বা পরিবর্তনযোগ্য নয়</strong>। যদি কোনো অর্ডার বাতিল বা ঠিকানা সংশোধন করার প্রয়োজন হয়, পার্সেল বুকিংয়ের পূর্বেই অবিলম্বে নিচের হেল্পলাইনে ফোন করুন।
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto pt-2 md:pt-0">
              <a
                href={`tel:${SUPPORT_PHONE}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>কল: {SUPPORT_PHONE_DISPLAY}</span>
              </a>

              <a
                href={`https://wa.me/88${SUPPORT_PHONE}?text=${encodeURIComponent('আসসালামু আলাইকুম, আমি আমার অর্ডার সংক্রান্ত বিষয়ে যোগাযোগ করছি।')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* LOADING SPINNER */}
        {isLoading && (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-700 mx-auto" />
            <p className="text-sm font-semibold text-slate-600">
              অর্ডারের বিস্তারিত তথ্য সার্ভার থেকে লোড করা হচ্ছে...
            </p>
          </div>
        )}

        {/* ERROR OR NOT FOUND STATE */}
        {!isLoading && hasSearched && orders.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <HelpCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-slate-900">
                কোনো অর্ডার খুঁজে পাওয়া যায়নি
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {errorMessage || 'প্রদত্ত মোবাইল নম্বরে কোনো সক্রিয় বা পূর্ববর্তী অর্ডার রেকর্ড পাওয়া যায়নি। নম্বরটি সঠিকভাবে দিয়েছেন কিনা তা যাচাই করুন।'}
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <a
                href={`tel:${SUPPORT_PHONE}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-700" />
                <span>হেল্পলাইন: {SUPPORT_PHONE_DISPLAY}</span>
              </a>
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                <span>পণ্য ক্যাটালগ দেখুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* INITIAL STATE (BEFORE SEARCH) */}
        {!isLoading && !hasSearched && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-black text-xs border border-emerald-100">
                ১
              </div>
              <h4 className="font-bold text-slate-900 text-sm">মোবাইল নম্বর লিখুন</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                অর্ডার সম্পন্ন করার সময় ব্যবহৃত ১১ ডিজিটের মোবাইল নম্বরটি উপরের সার্চ বক্সে লিখুন।
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-black text-xs border border-emerald-100">
                ২
              </div>
              <h4 className="font-bold text-slate-900 text-sm">লাইভ কুরিয়ার স্ট্যাটাস</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                অর্ডার নিশ্চিতকরণ, প্যাকেজিং ও কুরিয়ার ট্রানজিটের রিয়েল-টাইম তথ্য ও ট্র্যাকিং কোড দেখুন।
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-black text-xs border border-emerald-100">
                ৩
              </div>
              <h4 className="font-bold text-slate-900 text-sm">সরাসরি সহায়তা</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                অর্ডারের যেকোনো প্রয়োজনে আমাদের ভেটেরিনারি ও ডেলিভারি হেল্পলাইনে সরাসরি কল করুন।
              </p>
            </div>
          </div>
        )}

        {/* ORDER RESULTS LIST */}
        {!isLoading && orders.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs sm:text-sm font-bold text-slate-700">
                প্রাপ্ত অর্ডারের সংখ্যা: <span className="text-emerald-700 font-extrabold">{orders.length} টি</span>
              </p>
              
            </div>

            {orders.map((order) => {
              const badge = getStatusBadge(order.orderStatus);
              const currentStepIdx = getStatusStepIndex(order.orderStatus);
              const isCancelled = order.orderStatus === 'CANCELLED';

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden divide-y divide-slate-100"
                >
                  {/* ORDER CARD HEADER */}
                  <div className="p-4 sm:p-6 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight font-mono">
                          #{order.orderNumber}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          <span>{badge.label}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>অর্ডারের তারিখ: {formatBengaliDate(order.createdAt)}</span>
                        </span>
                      </div>
                    </div>

                    {/* DIRECT CALL BUTTON IN HEADER AS REQUESTED */}
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={`tel:${SUPPORT_PHONE}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-colors cursor-pointer"
                        title="অর্ডার বাতিল বা পরিবর্তনের জন্য কল করুন"
                      >
                        <Phone className="w-3.5 h-3.5 text-amber-700" />
                        <span>কল: {SUPPORT_PHONE_DISPLAY}</span>
                      </a>
                    </div>
                  </div>

                  {/* VISUAL STATUS STEPPER (TIMELINE) */}
                  <div className="p-4 sm:p-6">
                    {isCancelled ? (
                      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 text-rose-800">
                        <XCircle className="w-5 h-5 shrink-0 text-rose-600" />
                        <div className="text-xs sm:text-sm">
                          <p className="font-bold">এই অর্ডারটি বাতিল করা হয়েছে।</p>
                          <p className="text-xs text-rose-700 mt-0.5">
                            কোনো তথ্য বা সহায়তার জন্য আমাদের হেল্পলাইনে ({SUPPORT_PHONE_DISPLAY}) যোগাযোগ করুন।
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        
                        {/* Progress Stepper Line */}
                        <div className="grid grid-cols-5 gap-1 sm:gap-2 text-center">
                          {ORDER_STEPS.map((step, idx) => {
                            const isCompleted = idx <= currentStepIdx;
                            const isCurrent = idx === currentStepIdx;

                            return (
                              <div key={step.key} className="flex flex-col items-center">
                                {/* Step Circle Indicator */}
                                <div
                                  className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all mb-1.5 ${
                                    isCompleted
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                                  } ${isCurrent ? 'ring-4 ring-emerald-500/20' : ''}`}
                                >
                                  {isCompleted ? (
                                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                  ) : (
                                    <span>{idx + 1}</span>
                                  )}
                                </div>

                                <p
                                  className={`text-[11px] sm:text-xs font-bold leading-tight ${
                                    isCompleted ? 'text-slate-900' : 'text-slate-400'
                                  }`}
                                >
                                  {step.label}
                                </p>
                                <p className="hidden md:block text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                                  {step.desc}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    
                  </div>

                  

                  {/* DELIVERY ADDRESS, COURIER INFO, PRODUCTS & FINANCIAL SUMMARY */}
                  <div className="p-4 sm:p-6 bg-slate-50/40 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-start">
                    {/* LEFT COLUMN: Delivery Address & Ordered Items */}
                    <div className="space-y-5">
                      {/* Delivery Address */}
                      <div className="space-y-2 text-xs">
                        <span className="font-bold text-slate-400 uppercase tracking-wider block">
                          ডেলিভারি ঠিকানা
                        </span>
                        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
                          <p className="font-extrabold text-slate-900 text-sm">
                            {order.customerName}
                          </p>
                          <p className="text-slate-600 font-mono text-xs">
                            {order.customerPhone}
                          </p>
                          <p className="text-slate-600 pt-1 leading-relaxed">
                            {order.address}, {order.upazila}, {order.district}
                          </p>
                          {order.orderNote && (
                            <p className="text-[11px] text-slate-500 italic pt-1.5 border-t border-slate-100 mt-2">
                              গ্রাহকের নোট: &ldquo;{order.orderNote}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Ordered Items List */}
                      <div className="space-y-2 text-xs">
                        <span className="font-bold text-slate-400 uppercase tracking-wider block">
                          অর্ডারকৃত পণ্যসমূহ ({order.items.length} টি)
                        </span>

                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="relative w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center p-1">
                                  <Image
                                    src={item.thumbnail}
                                    alt={item.productNameEn}
                                    fill
                                    unoptimized
                                    className="object-contain"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                    {item.productNameBn || item.productNameEn}
                                  </p>
                                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                                    <span>প্যাক: {item.packSize}</span>
                                    {item.formFactor && <span>• {item.formFactor}</span>}
                                  </div>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <p className="text-xs sm:text-sm font-extrabold text-slate-900 font-mono">
                                  ৳{item.lineTotal.toLocaleString()}
                                </p>
                                <p className="text-[11px] text-slate-400 font-mono">
                                  {item.quantity} টি × ৳{item.unitSellingPrice}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: Courier Details & Financial Summary */}
                    <div className="space-y-5">
                      {/* Courier Details */}
                      <div className="space-y-2 text-xs">
                        <span className="font-bold text-slate-400 uppercase tracking-wider block">
                          কুরিয়ার ও ট্র্যাকিং
                        </span>
                        <div className="p-3.5 sm:p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 shadow-2xs flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                              <Truck className="w-4.5 h-4.5" />
                            </div>
                            <div className="min-w-0 space-y-1">
                              <p className="font-extrabold text-purple-950 truncate">
                                কুরিয়ার: {order.courierProvider || 'স্টিডফাস্ট / কুরিয়ার সার্ভিস'}
                              </p>
                              <p className="text-purple-800 text-[11px] font-mono mt-0.5">
                                কোড: <span className="font-bold">{order.trackingCode || order.consignmentId || 'Processing'}</span>
                              </p>
                            </div>
                          </div>

                          {order.trackingUrl && (
                            <a
                              href={order.trackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs shrink-0 cursor-pointer"
                            >
                              <span>ট্র্যাক করুন</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Financial Summary */}
                      <div className="space-y-2 text-xs">
                        <span className="font-bold text-slate-400 uppercase tracking-wider block">
                          পেমেন্ট ও বিলিং বিবরণ
                        </span>
                        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
                          <div className="flex justify-between text-slate-600">
                            <span>পণ্য উপমোট (Subtotal):</span>
                            <span className="font-semibold font-mono">৳{order.subtotal.toLocaleString()}</span>
                          </div>
                          {order.discountAmount > 0 && (
                            <div className="flex justify-between text-emerald-700 font-medium">
                              <span>বিশেষ ছাড় (Discount):</span>
                              <span className="font-mono">- ৳{order.discountAmount.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-slate-600">
                            <span>হোম ডেলিভারি চার্জ:</span>
                            <span className="font-semibold font-mono">
                              {order.shippingFee === 0 ? 'Free' : `৳${order.shippingFee.toLocaleString()}`}
                            </span>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-sm font-black text-slate-900">
                            <span>সর্বমোট মূল্য:</span>
                            <span className="text-emerald-700 text-base font-mono">
                              ৳{order.grandTotal.toLocaleString()}
                            </span>
                          </div>

                          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
                            <span>পেমেন্ট মাধ্যম:</span>
                            <span className="font-bold text-slate-800">
                              {order.paymentMethod === 'COD' ? 'ক্যাশ অন ডেলিভারি (পণ্য পেয়ে মূল্য পরিশোধ)' : order.paymentMethod}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] font-bold text-amber-800 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/60 mt-1">
                            <span>কুরিয়ারে প্রদেয় টাকা:</span>
                            <span className="text-sm font-mono">৳{order.dueAmount.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM ACTION BAR (DIRECT CALL FOR CANCELLATION) */}
                  <div className="p-4 sm:p-5 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs text-slate-500 text-center sm:text-left">
                      অর্ডার সংক্রান্ত কোনো জিজ্ঞাসা থাকলে আমাদের হেল্পলাইন খোলা আছে সকাল ৮টা থেকে রাত ১০টা।
                    </div>

                    <a
                      href={`tel:${SUPPORT_PHONE}`}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>সরাসরি কল করুন: {SUPPORT_PHONE_DISPLAY}</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}

