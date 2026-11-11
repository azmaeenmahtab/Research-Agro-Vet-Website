import React from 'react';
import Link from 'next/link';
import { ShieldAlert, Phone, ArrowLeft, MessageCircle, CheckCircle2, AlertTriangle, PhoneCall } from 'lucide-react';
import { WhatsAppIcon } from '@/components/storefront/HeroSection';

export const metadata = {
  title: 'রিটার্ন ও রিফান্ড পলিসি | Research Agro Vet',
  description: 'Research Agro Vet এর বিক্রয়, যাচাই-বাছাই এবং রিটার্ন ও রিফান্ড সংক্রান্ত অফিসিয়াল নীতিমালা।',
};

export default function RefundPolicyPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-14 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-emerald-700 transition-colors">
            হোম
          </Link>
          <span className="text-slate-400">/</span>
          <span className="font-semibold text-slate-800">রিটার্ন ও রিফান্ড নীতি</span>
        </nav>

        {/* The Single Policy Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm sm:p-6 p-4 sm:p-10 space-y-5 sm:space-y-8">
          {/* Card Header */}
          <div className="text-center space-y-3 sm:pb-6 pb-4 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center mx-auto shadow-2xs">
              <ShieldAlert className="w-8 h-8" />
            </div>

            

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              রিটার্ন ও রিফান্ড পলিসি
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
              Research Agro Vet Ltd. থেকে পণ্য ক্রয়ের পূর্বে সকল খামারি ও সম্মানিত গ্রাহকদের নিচের শর্তাবলী মনোযোগ দিয়ে পড়ার অনুরোধ করা হচ্ছে।
            </p>
          </div>

          {/* Main Key Policy Points */}
          <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
            {/* 1. Jachai Bachai */}
            <div className=" p-4 rounded-2xl bg-slate-50 border border-slate-100">
              
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-base">
                  কেনার পূর্বে শতভাগ যাচাই-বাছাই আবশ্যক
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm">
                  যেকোনো পণ্য অর্ডারের পূর্বে পণ্যের নাম, স্পেসিস (প্রাণীর ধরন), উপাদান, প্যাক সাইজ ও মেয়াদ ভালোভাবে <strong>যাচাই-বাছাই</strong> করে নিন। আপনার খামারের প্রাণীর প্রয়োজন অনুযায়ী সঠিক পণ্যটি নিশ্চিত হয়েই অর্ডার করুন।
                </p>
              </div>
            </div>

            {/* 2. Non-Refundable */}
            <div className="  p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
             
              <div className="space-y-1">
                <h3 className="font-bold text-amber-950 text-base flex items-center gap-2">
                  <span>কোনো পণ্যই পরিবর্তন বা রিফান্ডযোগ্য নয়</span>
                  
                </h3>
                <p className="text-amber-900/90 text-xs sm:text-sm">
                  ভেটেরিনারি পণ্যের বিশেষ তাপমাত্রা সংবেদনশীলতা, সর্বোচ্চ বায়ো-সিকিউরিটি এবং ভেজালমুক্ত মান নিশ্চিত করার লক্ষ্যে <strong>একবার সরবরাহকৃত কোনো পণ্য ফেরত (Return) বা মূল্য রিফান্ড (Refund) করা হয় না</strong>।
                </p>
              </div>
            </div>

            {/* 3. Phone Call Confirmation */}
            <div className="  p-4 rounded-2xl bg-slate-50 border border-slate-100">
             
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-base ">
                  <span>ফোনে যাচাই ও নিশ্চয়তার পরই পার্সেল প্রেরণ</span>
                  
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm">
                  ওয়েবসাইটে অর্ডার প্লেস করার পর আমাদের অফিসিয়াল প্রতিনিধি সরাসরি ফোনকলের মাধ্যমে আপনার সাথে কথা বলবেন। আপনার চাহিদা, পরিমাণ ও ডেলিভারি ঠিকানা শতভাগ নিশ্চিত হওয়ার পরেই কেবল পার্সেল কুরিয়ারে বুকিং দেওয়া হবে।
                </p>
              </div>
            </div>

            {/* 4. WhatsApp Help */}
            <div className="  p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
              
              <div className="space-y-1">
                <h3 className="font-bold text-emerald-950 text-base">
                  যেকোনো বিভ্রান্তি বা প্রয়োজনে সরাসরি WhatsApp-এ পরামর্শ
                </h3>
                <p className="text-emerald-900/90 text-xs sm:text-sm">
                  পণ্য সম্পর্কে কোনো সন্দেহ, মাত্রা বা ব্যবহারের নিয়ম জানার থাকলে অর্ডার করার পূর্বেই আমাদের অফিসিয়াল WhatsApp-এ মেসেজ দিন বা কল করুন। আমাদের টিম সঠিক তথ্য দিয়ে আপনাকে সহযোগিতা করবে।
                </p>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://wa.me/8801716019731?text=আসসালামু%20আলাইকুম,%20পণ্য%20সম্পর্কে%20যাচাই-বাছাই%20করতে%20যোগাযোগ%20করছি।"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
            >
              <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
              <span>WhatsApp-এ যোগাযোগ করুন</span>
            </a>

            <a
              href="tel:01716019731"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm border border-slate-300 shadow-2xs transition-all"
            >
              <Phone className="w-4 h-4 text-emerald-700" />
              <span>কল: ০১৭১৬-০১৯৭৩১</span>
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

