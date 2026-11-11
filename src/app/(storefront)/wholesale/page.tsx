import React from 'react';
import Link from 'next/link';
import { Handshake, MessageCircle, Phone, ArrowLeft, Building2, Package, Percent, ShieldCheck, Truck } from 'lucide-react';
import { WhatsAppIcon } from '@/components/storefront/HeroSection';

export const metadata = {
  title: 'পাইকারি ও ডিলারশিপ অর্ডার | Research Agro Vet',
  description: 'ফার্মেসি, ডিলার ও বাণিজ্যিক খামারিদের জন্য Research Agro Vet এর সরাসরি ফ্যাক্টরি ট্রেড প্রাইস (TP) ও পাইকারি অর্ডার সংক্রান্ত তথ্য।',
};

export default function WholesalePage() {
  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-14 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-emerald-700 transition-colors">
            হোম
          </Link>
          <span className="text-slate-400">/</span>
          <span className="font-semibold text-slate-800">পাইকারি ও ডিলার পয়েন্ট</span>
        </nav>

        {/* The Wholesale Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-10 sm:space-y-8 space-y-5">
          {/* Card Header */}
          <div className="text-center space-y-3  pb-3 sm:pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center mx-auto shadow-2xs">
              <Handshake className="w-8 h-8 text-amber-800" />
            </div>

            {/* <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
              <span>B2B • পাইকারি ও ডিলার পয়েন্ট</span>
            </div> */}

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              পাইকারি ও ডিলারশিপ অর্ডার
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              সরাসরি কারখানা থেকে বিশেষ ট্রেড প্রাইস (TP) সুবিধায় কার্টন বা বাল্ক অর্ডারে আপনার ফার্মেসি বা খামারে পণ্য পৌঁছে দিন।
            </p>
          </div>

          {/* Wholesale Benefits Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <Percent className="w-4 h-4 text-amber-700" />
                <span>ট্রেড প্রাইস (TP) সুবিধা</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Veterinary ফার্মেসি, ডিলার ও বড় খামারিদের জন্য বিশেষ পাইকারি ছাড় এবং আকর্ষণীয় ব্যবসায়িক মার্জিন।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <Building2 className="w-4 h-4 text-emerald-700" />
                <span>সরাসরি Manufacturer থেকে সরবরাহ</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                ১০০% অরিজিনাল ও লাইসেন্সড ফিড প্রিমিক্স সরাসরি Manufacturer থেকে প্রাপ্তি।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Package className="w-4 h-4 text-emerald-700" />
                <span>বক্স ও কার্টন অর্ডার সুবিধা</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                কার্টন ও বাল্ক পরিমাণের অর্ডারে দ্রুত কুরিয়ার বুকিং ও নিরাপদ পরিবহন নিশ্চয়তা।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Truck className="w-4 h-4 text-emerald-700" />
                <span>৬৪ জেলায় ক্যাশ অন ডেলিভারি</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                দেশের যেকোনো জেলা বা উপজেলায় কুরিয়ারের মাধ্যমে নিরাপদে পণ্য পৌঁছে দেওয়ার ব্যবস্থা।
              </p>
            </div>
          </div>

          {/* Simple 3-Step Process */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span>পাইকারি অর্ডার করার সহজ নিয়মাবলী</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
              <div className="space-y-1">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">১</span>
                  WhatsApp-এ মেসেজ দিন
                </span>
                <p className="text-[11px] text-slate-500">নিচের বাটনে ট্যাপ করে সরাসরি চ্যাট শুরু করুন।</p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">২</span>
                  পণ্যের তালিকা জানান
                </span>
                <p className="text-[11px] text-slate-500">আপনার প্রয়োজনীয় পণ্যের নাম ও কার্টন সংখ্যা লিখুন।</p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">৩</span>
                  ইনভয়েস ও নিশ্চয়তা
                </span>
                <p className="text-[11px] text-slate-500">আমাদের টিম ট্রেড প্রাইস (TP) হিসাব করে অর্ডার পাঠাবে।</p>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://wa.me/8801716019731?text=আসসালামু%20আলাইকুম%20Research%20Agro%20Vet,%20আমি%20পাইকারি%20রেট%20(TP)%20ও%20ডিলারশিপে%20অর্ডার%20করতে%20আগ্রহী।"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#005d42] hover:bg-[#004e37] text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
            >
              <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
              <span>WhatsApp-এ পাইকারি অর্ডার করুন</span>
            </a>

            <a
              href="tel:01716019731"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm border border-slate-300 shadow-2xs transition-all"
            >
              <Phone className="w-4 h-4 text-emerald-700" />
              <span>Hotline: ০১৭১৬-০১৯৭৩১</span>
            </a>

            <Link
              href="/products"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl text-slate-600 hover:text-emerald-700 font-bold text-xs sm:text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>সকল পণ্য</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

