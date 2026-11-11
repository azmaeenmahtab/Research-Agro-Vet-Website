'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/lib/api-client';
import {
  ShieldCheck,
  Truck,
  Phone,
  CheckCircle2,
  Lock,
  ArrowLeft,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  Check,
  Snowflake,
  BadgeCheck,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { BANGLADESH_DISTRICTS } from '@/constants/districts';

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    buyerMode,
    updateQuantity,
    removeItem,
    clearCart,
    getCartSubtotal,
    customerDraft,
    setCustomerDraft,
    syncWithServer,
  } = useCartStore();

  const [mounted, setMounted] = useState(false);

  // Form States
  const [customerPhone, setCustomerPhone] = useState(customerDraft.phone || '');
  const [customerName, setCustomerName] = useState(customerDraft.name || '');
  const [customerAltPhone, setCustomerAltPhone] = useState('');
  const [district, setDistrict] = useState(customerDraft.district || 'Dhaka');
  const [upazila, setUpazila] = useState(customerDraft.upazila || '');
  const [address, setAddress] = useState(customerDraft.address || '');
  const [orderNote, setOrderNote] = useState('');

  // Recognition / VIP Customer states
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [recognizedCustomer, setRecognizedCustomer] = useState<{
    name: string;
    farmName?: string;
    hasDiscount: boolean;
    discountPct: number;
    orderCount: number;
  } | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dynamic Universal Discount (starts with false / 0% until verified from server)
  const [universalDiscount, setUniversalDiscount] = useState<{
    enabled: boolean;
    percent: number;
    label: string;
  }>({ enabled: false, percent: 0, label: '' });

  useEffect(() => {
    // 1. Sync real-time inventory and pricing for cart items immediately
    syncWithServer();

    // 2. Fetch live universal discount configuration
    fetch(getApiUrl('/api/discounts/universal'))
      .then((res) => res.json())
      .then((res) => {
        if (res?.data) {
          setUniversalDiscount(res.data);
        }
      })
      .catch(() => {});
  }, [syncWithServer]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync draft to cart store
  useEffect(() => {
    if (mounted) {
      setCustomerDraft({
        phone: customerPhone,
        name: customerName,
        district,
        upazila,
        address,
      });
    }
  }, [customerPhone, customerName, district, upazila, address, mounted, setCustomerDraft]);

  // Real-time lookup for returning farmer profile
  const handlePhoneChange = async (val: string) => {
    const raw = val.replace(/[^0-9]/g, '');
    setCustomerPhone(raw);
    setErrorMessage(null);

    if (raw.length === 11 && raw.startsWith('01')) {
      setIsLookingUp(true);
      try {
        const res = await fetch(getApiUrl(`/api/orders/lookup?phone=${raw}`));
        const data = await res.json();
        if (data.found && data.customer) {
          const c = data.customer;
          if (!customerName) setCustomerName(c.name || '');
          if (!district) setDistrict(c.district || 'Dhaka');
          if (!upazila) setUpazila(c.upazila || '');
          if (!address) setAddress(c.address || '');

          setRecognizedCustomer({
            name: c.name,
            farmName: c.businessOrFarmName,
            hasDiscount: c.hasCustomDiscount,
            discountPct: c.discountValue || 0,
            orderCount: c.totalOrdersCount || 1,
          });
        } else {
          setRecognizedCustomer(null);
        }
      } catch (err) {
        console.error('Customer lookup failed:', err);
      } finally {
        setIsLookingUp(false);
      }
    } else {
      setRecognizedCustomer(null);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#005d42] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Financial calculations
  // Baseline MRP subtotal (or TP for wholesale)
  const baselineSubtotal = items.reduce((sum, item) => {
    const baseUnit = buyerMode === 'WHOLESALE' ? item.tradePrice : (item.mrpPrice || item.sellingPrice);
    return sum + baseUnit * item.quantity;
  }, 0);

  // Calculate items payable total with Individual Dominance & Universal Fallback:
  let individualDiscountSum = 0;
  let universalDiscountSum = 0;
  let hasIndividualDiscount = false;

  const universalRate =
    !recognizedCustomer?.hasDiscount &&
    buyerMode !== 'WHOLESALE' &&
    universalDiscount.enabled &&
    universalDiscount.percent > 0
      ? universalDiscount.percent / 100
      : 0;

  items.forEach((item) => {
    if (buyerMode === 'WHOLESALE') return;
    const mrp = Number(item.mrpPrice) || Number(item.sellingPrice) || 0;
    const dbSelling = Number(item.sellingPrice) || mrp;
    // Check if item has individual promo (discountType === 'INDIVIDUAL' or DB selling price < mrp without universal discount)
    const hasItemIndividualPromo =
      item.discountType === 'INDIVIDUAL' ||
      (mrp > 0 && dbSelling < mrp && item.discountType !== 'UNIVERSAL');

    if (hasItemIndividualPromo) {
      hasIndividualDiscount = true;
      individualDiscountSum += (mrp - dbSelling) * item.quantity;
    } else if (universalRate > 0) {
      const discountedUnit = Math.round(mrp * (1 - universalRate));
      universalDiscountSum += (mrp - discountedUnit) * item.quantity;
    }
  });

  let discountAmount = 0;
  let discountLabel = '';

  if (recognizedCustomer?.hasDiscount && recognizedCustomer.discountPct > 0) {
    discountAmount = Math.round((baselineSubtotal * recognizedCustomer.discountPct) / 100);
    discountLabel = `VIP Discount (${recognizedCustomer.discountPct}%)`;
  } else if (buyerMode !== 'WHOLESALE') {
    if (hasIndividualDiscount && universalDiscountSum > 0) {
      discountAmount = individualDiscountSum + universalDiscountSum;
      discountLabel = `প্রমোশনাল + ${universalDiscount.percent}% সার্বজনীন ছাড়`;
    } else if (hasIndividualDiscount) {
      discountAmount = individualDiscountSum;
      discountLabel = 'প্রমোশনাল ছাড় (Individual Promo)';
    } else if (universalDiscountSum > 0) {
      discountAmount = universalDiscountSum;
      discountLabel = `সার্বজনীন ছাড় (${universalDiscount.percent}%)`;
    }
  }

  const isDhaka = district.toLowerCase().includes('dhaka') || district === 'ঢাকা';
  const shippingFee = items.length === 0 ? 0 : isDhaka ? 70 : 130;
  const grandTotal = Math.max(0, baselineSubtotal - discountAmount + shippingFee);

  const hasUnpurchasableItem = items.some(
    (i) => i.isPurchasable === false || i.inStock === false || i.isAvailable === false
  );

  // Form submission handler
  const handlePlaceOrder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    if (hasUnpurchasableItem) {
      setErrorMessage('আপনার কার্টে স্টক শেষ বা অনুপলব্ধ পণ্য রয়েছে। অর্ডার সম্পন্ন করতে অনুগ্রহ করে সেই পণ্যটি কার্ট থেকে মুছে ফেলুন।');
      return;
    }

    // Validation
    const clean = customerPhone.replace(/[^0-9]/g, '');
    if (!clean || clean.length !== 11 || !clean.startsWith('01')) {
      setErrorMessage('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রদান করুন (যেমন: 017XXXXXXXX)');
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার অথবা ফার্মের নাম প্রদান করুন।');
      return;
    }

    if (!district) {
      setErrorMessage('অনুগ্রহ করে আপনার জেলা নির্বাচন করুন।');
      return;
    }

    if (!upazila.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার উপজেলা / থানার নাম প্রদান করুন।');
      return;
    }

    if (!address.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার সম্পূর্ণ ডেলিভারি ঠিকানা বা বাজার/গ্রামের নাম প্রদান করুন।');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('আপনার কার্ট খালি রয়েছে, অনুগ্রহ করে অন্তত একটি পণ্য যুক্ত করুন।');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(getApiUrl('/api/orders'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: clean,
          customerAltPhone: customerAltPhone.trim() || undefined,
          district: district.trim(),
          upazila: upazila.trim(),
          address: address.trim(),
          orderNote: orderNote.trim() || undefined,
          buyerMode,
          items: items.map((i) => ({
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'অর্ডার সাবমিট করতে সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।');
      }

      // Order created successfully!
      clearCart();
      router.push(`/order-success/${data.orderNumber}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong. Please check your network and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp instant order message generator
  const itemsText = items.map((i) => `• ${i.nameEn} (${i.packSize}) x ${i.quantity}`).join('\n');
  const waMessage = `আসসালামু আলাইকুম Research Agro Vet Ltd, আমি সরাসরি ফোন অর্ডারে কনফার্ম করতে চাই:\n\n${itemsText}\n\nনাম: ${customerName || '(খামারি)'}\nফোন: ${customerPhone || ''}\nঠিকানা: ${address ? `${address}, ${upazila}, ${district}` : district}\nসর্বমোট মূল্য: ৳${grandTotal.toLocaleString()}`;

  // If cart is completely empty
  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
          <ShoppingBag className="w-10 h-10 text-[#005d42]" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">আপনার শপিং কার্ট বর্তমানে খালি রয়েছে</h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
          অর্ডার সম্পন্ন করার জন্য আপনার প্রয়োজনীয় ভেটেরিনারি ফিড প্রিমিক্স পণ্য কার্টে যুক্ত করুন।
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#005d42] hover:bg-[#004e37] text-white font-bold text-sm shadow-xs transition-colors"
        >
          <span>পণ্যের তালিকা দেখুন</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50 min-h-screen py-6 sm:py-10">
      {/* Top Security & Breadcrumb Strip */}
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pb-3 border-b border-slate-200">
          <Link
            href="/products"
            className="flex items-center gap-1.5 text-slate-700 hover:text-[#005d42] font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>আরও পণ্য কিনুন</span>
          </Link>

          <div className="flex items-center gap-4 text-emerald-800 font-medium">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-[#005d42]" />
              <span>DLS ও ড্রাগ লাইসেন্স অনুমোদিত</span>
            </span>
            <span className="hidden sm:flex items-center gap-1 text-slate-600">
              <Truck className="w-4 h-4 text-slate-400" />
              <span>সারা দেশে ক্যাশ অন ডেলিভারি</span>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Title & Fast Order Banner */}
        {/* <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs mb-6 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#005d42] font-bold text-[11px] uppercase tracking-wide border border-emerald-200 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>১-স্টেপ দ্রুততম অর্ডার প্রক্রিয়া (1-Step Phone Checkout)</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                অর্ডার কনফার্মেশন ও ডেলিভারি তথ্য
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#005d42] shrink-0" />
                <span>কোনো অগ্রিম পেমেন্ট নেই! পণ্য হাতে পেয়ে ক্যাশ অন ডেলিভারিতে মূল্য পরিশোধ করুন।</span>
              </p>
            </div>

            <div className="flex items-center gap-3 bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 shrink-0">
              <div className="w-10 h-10 rounded-lg bg-[#005d42] text-white flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <span className="text-[11px] text-emerald-800 font-semibold block leading-tight">
                  অর্ডার সহায়তা হেল্পলাইন
                </span>
                <a
                  href="tel:01716019731"
                  className="font-mono font-black text-slate-900 text-sm sm:text-base hover:text-[#005d42]"
                >
                  ০১৭১৬-০১৯৭৩১
                </a>
              </div>
            </div>
          </div>
        </div> */}

        {/* 2-Column Responsive Checkout Architecture */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Customer Information & Delivery Form (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            <form onSubmit={handlePlaceOrder} className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-2xs space-y-5">
              {/* Step 1 Title */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-[#005d42] text-white flex items-center justify-center font-black text-xs">
                    ১
                  </span>
                  <h2 className="font-bold text-slate-900 text-base">
                    আপনার ডেলিভারি ও যোগাযোগ তথ্য
                  </h2>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                  মোবাইল নম্বরই আপনার আইডি
                </span>
              </div>

              {/* Dynamic Returning Farmer Recognition Alert */}
              {/* {recognizedCustomer && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-900 animate-in fade-in duration-200">
                  <BadgeCheck className="w-5 h-5 text-[#005d42] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold">
                      স্বাগতম {recognizedCustomer.farmName || recognizedCustomer.name}! আপনার পূর্ববর্তী তথ্য লোড করা হয়েছে।
                    </p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      পূর্ববর্তী সফল অর্ডার: {recognizedCustomer.orderCount} টি{' '}
                      {recognizedCustomer.hasDiscount && `• ভিআইপি ${recognizedCustomer.discountPct}% ছাড় প্রযোজ্য`}
                    </p>
                  </div>
                </div>
              )} */}

              {/* Error Message Box */}
              {errorMessage && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-800 text-xs font-semibold">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form Input Fields */}
              <div className="space-y-4">
                {/* 1. Mobile Phone (Hero Input) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <span>মোবাইল নম্বর (১১ ডিজিট)</span>
                      <span className="text-red-500">*</span>
                    </label>
                    {/* <span className="text-[11px] text-slate-400 font-medium">
                      ডেলিভারি ট্র্যাকিং ও কল কনফার্মেশনের জন্য
                    </span> */}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold font-mono text-slate-500 text-sm">
                      🇧🇩 +88
                    </span>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="017XXXXXXXX"
                      maxLength={11}
                      autoFocus
                      required
                      className="w-full pl-22 pr-10 py-3 rounded-xl border border-slate-300 text-sm font-bold font-mono text-slate-900 outline-none focus:ring-2 focus:ring-[#005d42] focus:border-transparent transition-all placeholder:text-slate-300 bg-slate-50/50 focus:bg-white"
                    />
                    {isLookingUp ? (
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#005d42] border-t-transparent rounded-full animate-spin" />
                    ) : customerPhone.length === 11 ? (
                      <CheckCircle2 className="w-5 h-5 text-[#005d42] absolute right-3.5 top-1/2 -translate-y-1/2" />
                    ) : null}
                  </div>
                </div>

                {/* 2. Customer Name & Farm Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      <span>আপনার / খামারের নাম</span>
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. মোঃ রহিম উদ্দিন / রহিম ডেইরি ফার্ম"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-[#005d42] focus:border-transparent transition-all bg-slate-50/50 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      <span>বিকল্প মোবাইল (ঐচ্ছিক)</span>
                    </label>
                    <input
                      type="tel"
                      value={customerAltPhone}
                      onChange={(e) => setCustomerAltPhone(e.target.value)}
                      placeholder="e.g. 018XXXXXXXX (ফার্ম ম্যানেজার)"
                      maxLength={11}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-[#005d42] focus:border-transparent transition-all bg-slate-50/50 focus:bg-white"
                    />
                  </div>
                </div>

                {/* 3. District & Upazila */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-800">
                        <span>জেলা (District)</span>
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <span className="text-[10px] font-bold text-[#005d42]">
                        {isDhaka ? 'হোম ডেলিভারি ৳৭০' : 'কুরিয়ার ডেলিভারি ৳১৩০'}
                      </span>
                    </div>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#005d42] bg-white cursor-pointer"
                    >
                      {BANGLADESH_DISTRICTS.map((d) => (
                        <option key={d.nameEn} value={d.nameEn}>
                          {d.nameBn} ({d.nameEn}) {d.isDhaka ? '— ৳৭০ চার্জ' : '— ৳১৩০ চার্জ'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      <span>উপজেলা / থানা (Upazila / Thana)</span>
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      value={upazila}
                      onChange={(e) => setUpazila(e.target.value)}
                      placeholder="e.g. শাহজাদপুর, ঈশ্বরদী, মিরপুর"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-[#005d42] focus:border-transparent transition-all bg-slate-50/50 focus:bg-white"
                    />
                  </div>
                </div>

                {/* 4. Detailed Address & Landmark */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    <span>বিস্তারিত ঠিকানা ও নিকটস্থ ল্যান্ডমার্ক</span>
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="গ্রাম/পাড়া, ইউনিয়ন, বাজার অথবা নিকটস্থ পরিচিত স্থান (যেমন: পোতাজিয়া বাজার, দুধের আড়তের পাশে)"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-[#005d42] focus:border-transparent transition-all bg-slate-50/50 focus:bg-white resize-none leading-relaxed"
                  />
                </div>

                {/* 5. Special Instructions Note */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    <span>খামার নির্দেশিকা / বিশেষ নোট (ঐচ্ছিক)</span>
                  </label>
                  <input
                    type="text"
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    placeholder="e.g. বিকেলের মধ্যে কুরিয়ারে বুকিং দিলে ভালো হয়"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-[#005d42] focus:border-transparent transition-all bg-slate-50/50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Zero-Friction Tele-Confirmation Notice */}
              {/* <div className="p-3.5 rounded-xl bg-slate-100/80 border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#005d42] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>ঝামেলাহীন অর্ডার প্রটোকল:</strong> অর্ডার সাবমিট করার পর আমাদের বিশেষজ্ঞ কনফার্মেশন টিম আপনাকে ফোন করে ডোজ, মেয়াদ ও কুরিয়ার ডেলিভারি পয়েন্ট নিশ্চিত করে পার্সেল প্রেরণ করবে।
                </p>
              </div> */}
            </form>

            {/* Triple Assurance Bento Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col items-center text-center">
                <ShieldCheck className="w-6 h-6 text-[#005d42] mb-1.5" />
                <h4 className="font-bold text-slate-900 text-xs">১০০% আসল ও অনুমোদিত পণ্য</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">DLS অনুমোদিত লাইসেন্সড প্রিমিক্স</p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col items-center text-center">
                <Truck className="w-6 h-6 text-[#005d42] mb-1.5" />
                <h4 className="font-bold text-slate-900 text-xs">ক্যাশ অন ডেলিভারি</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">পণ্য দেখে মূল্য পরিশোধের সুবিধা</p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col items-center text-center">
                <Snowflake className="w-6 h-6 text-blue-600 mb-1.5" />
                <h4 className="font-bold text-slate-900 text-xs">নিরাপদ থার্মাল প্যাক</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">তাপরোধী বিশেষ বক্সে প্রেরণ</p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Order Summary & High-Converting CTA (5 Cols - Sticky) */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-5">
              {/* Step 2 Title */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-[#005d42] text-white flex items-center justify-center font-black text-xs">
                    ২
                  </span>
                  <h2 className="font-bold text-slate-900 text-base">
                    অর্ডারের বিবরণ (Order Summary)
                  </h2>
                </div>
                
              </div>

              {/* Items List */}
              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1 divide-y divide-slate-100">
                {items.map((item) => {
                  const mrp = Number(item.mrpPrice) || Number(item.sellingPrice) || 0;
                  const dbSelling = Number(item.sellingPrice) || mrp;
                  const hasItemIndividualPromo =
                    buyerMode !== 'WHOLESALE' &&
                    (item.discountType === 'INDIVIDUAL' ||
                      (mrp > 0 && dbSelling < mrp && item.discountType !== 'UNIVERSAL'));

                  const unitPrice =
                    buyerMode === 'WHOLESALE'
                      ? item.tradePrice
                      : hasItemIndividualPromo
                      ? dbSelling
                      : universalRate > 0
                      ? Math.round(mrp * (1 - universalRate))
                      : mrp;

                  const isBlocked =
                    item.isPurchasable === false || item.inStock === false || item.isAvailable === false;
                  const itemLineTotal = unitPrice * item.quantity;

                  return (
                    <div key={item.variantId} className="pt-3 first:pt-0 flex items-start gap-3">
                      {/* Product Thumbnail */}
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.nameEn}
                            fill
                            className={`object-contain p-1 ${isBlocked ? 'opacity-40 grayscale' : ''}`}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <ShoppingBag className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-slate-900 truncate">
                          {item.nameEn}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          প্যাক: {item.packSize} • ৳{unitPrice}
                        </p>
                        {isBlocked && (
                          <p className="text-[11px] font-bold text-rose-600 mt-0.5">
                            {item.statusMessage || 'স্টক শেষ বা অনুপলব্ধ'}
                          </p>
                        )}

                        {/* Inline Quantity Changer */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                              className="p-1 hover:bg-slate-200 text-slate-600 rounded-l"
                              title="পরিমাণ কমান"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-2.5 text-xs font-bold font-mono text-slate-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                              className="p-1 hover:bg-slate-200 text-slate-600 rounded-r"
                              title="পরিমাণ বাড়ান"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.variantId)}
                            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Item Total Price */}
                      <div className="text-right shrink-0">
                        <span className="font-black text-sm text-slate-900 font-mono block">
                          ৳{itemLineTotal.toLocaleString()}
                        </span>
                        {item.mrpPrice > unitPrice && (
                          <span className="text-xs text-slate-400 line-through font-mono">
                            ৳{(item.mrpPrice * item.quantity).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Price Calculation Summary Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>মোট মূল্য (MRP Subtotal):</span>
                  <span className="font-bold text-slate-900 font-mono">
                    ৳{baselineSubtotal.toLocaleString()}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-[#005d42] font-semibold">
                    <span className="flex items-center gap-1">
                      
                      <span>{discountLabel}:</span>
                    </span>
                    <span className="font-bold font-mono">
                      -৳{discountAmount.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-slate-600">
                  <span>ডেলিভারি চার্জ ({isDhaka ? 'ঢাকা' : 'ঢাকার বাইরে'}):</span>
                  <span className="font-bold text-slate-900 font-mono">
                    +৳{shippingFee}
                  </span>
                </div>

                {/* Grand Total */}
                <div className="pt-2.5 mt-2 border-t border-slate-200 flex items-center justify-between text-slate-900">
                  <div>
                    <span className="font-bold text-sm block">সর্বমোট প্রদেয় বিল:</span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      ভ্যাট ও প্যাকিং চার্জ অন্তর্ভুক্ত
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 rounded-xl text-lg sm:text-xl font-black text-[#005d42] bg-emerald-50 border border-emerald-200/90 font-mono shadow-2xs">
                      ৳{grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Method Notice */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#005d42] text-white flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-emerald-300" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">
                    পেমেন্ট মেথড: ক্যাশ অন ডেলিভারি (COD)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    পণ্য হাতে পেয়ে যাচাই করে মূল্য পরিশোধ করুন
                  </span>
                </div>
              </div>

              {/* High-Converting CTA Button */}
              <div className="space-y-2.5">
                {hasUnpurchasableItem && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-800 text-xs font-medium">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>কার্টের কিছু পণ্য বর্তমানে স্টক শেষ বা অনুপলব্ধ। অর্ডার সম্পন্ন করতে অনুগ্রহ করে সেই পণ্যটি কার্ট থেকে মুছে ফেলুন।</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting || hasUnpurchasableItem}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#005d42] hover:bg-[#004e37] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>অর্ডার তৈরি হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-emerald-300" />
                      <span>অর্ডার কনফার্ম করুন (৳{grandTotal.toLocaleString()})</span>
                    </>
                  )}
                </button>

                
              </div>

              {/* WhatsApp Instant Order Fallback Option */}
              <div className="pt-2 border-t border-slate-100">
                <a
                  href={`https://wa.me/8801716019731?text=${encodeURIComponent(waMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl border border-emerald-300 hover:bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-[#16A34A]" />
                  <span>অথবা হোয়াটসঅ্যাপে সরাসরি অর্ডার নিশ্চিত করুন</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

