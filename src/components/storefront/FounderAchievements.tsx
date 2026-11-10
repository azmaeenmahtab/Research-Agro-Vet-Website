'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  ShieldCheck,
  X,
  ZoomIn,
  Medal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

interface AchievementItem {
  id: string;
  title: string;
  issuer: string;
  subtitle?: string;
  quote?: string;
  date: string;
  image: string;
  group: 'CREST' | 'DOCUMENT';
  badge: string;
}

const CRESTS: AchievementItem[] = [
  {
    id: 'crest-district',
    title: 'শুভেচ্ছা স্মারক: "বেড়ার সফল গবেষক ও উদ্ভাবক"',
    issuer: 'জেলা প্রাণিসম্পদ কর্মকর্তা, পাবনা',
    subtitle: 'সৌজন্যে: ডাঃ গৌরাঙ্গ কুমার তালুকদার, জেলা প্রাণিসম্পদ কর্মকর্তা, পাবনা।',
    quote:
      'পাবনা জেলার প্রাণিসম্পদ দপ্তরের সকল কর্মকর্তার বেড়া উপজেলা প্রাণিসম্পদ দপ্তরে আগমন উপলক্ষে বেড়ার সফল গবেষক ও উদ্ভাবক (এম ডি রিসার্চ এগ্রোভেট) ডাঃ মোঃ রেজাউল করিম-কে শুভেচ্ছা স্মারক।',
    date: 'অফিসিয়াল সম্মাননা',
    image: '/images/founder/crest-dls-pabna.jpg',
    group: 'CREST',
    badge: 'জেলা প্রাণিসম্পদ দপ্তর সম্মাননা',
  },
  {
    id: 'crest-upazila',
    title: 'শুভেচ্ছা স্মারক: "বেড়ার সফল গবেষক ও উদ্ভাবক"',
    issuer: 'উপজেলা প্রাণিসম্পদ কর্মকর্তা, বেড়া, পাবনা',
    subtitle: 'সৌজন্যে: ডাঃ মোঃ মিজানুর রহমান, উপজেলা প্রাণিসম্পদ কর্মকর্তা, বেড়া, পাবনা।',
    quote:
      'পাবনা জেলার প্রাণিসম্পদ দপ্তরের সকল কর্মকর্তার বেড়া উপজেলা প্রাণিসম্পদ দপ্তরে আগমন উপলক্ষে বেড়ার সফল গবেষক ও উদ্ভাবক (এম ডি রিসার্চ এগ্রোভেট) ডাঃ মোঃ রেজাউল করিম-কে শুভেচ্ছা স্মারক।',
    date: 'অফিসিয়াল সম্মাননা',
    image: '/images/founder/crest-dls-bera.jpg',
    group: 'CREST',
    badge: 'উপজেলা প্রাণিসম্পদ দপ্তর সম্মাননা',
  },
];

const DOCUMENTS: AchievementItem[] = [
  {
    id: 'patent-1',
    title: 'পেটেন্ট নং ১০০৫৪১৪: Animal Nutritional Feed Supplement Against Liver and Stomach Disease',
    issuer: 'Department of Patents, Designs and Trademarks',
    subtitle: 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার (Letters Patent)',
    quote:
      'Title: "A Method for Preparing Animal Nutritional Feed Supplement Against Liver and Stomach Disease." Proprietor & Inventor: Dr. Md. Rezaul Karim.',
    date: '২৮ অক্টোবর ২০১৪ (ফাইলিং: ১২ অক্টোবর ২০১১)',
    image: '/images/founder/patent-1005414.jpg',
    group: 'DOCUMENT',
    badge: 'সরকারি পেটেন্ট',
  },
  {
    id: 'patent-2',
    title:
      'পেটেন্ট নং ১০০৫৪১৫: Animal Nutritional Feed Supplement Against Subclinical Mastitis and All Kinds of Pains',
    issuer: 'Department of Patents, Designs and Trademarks',
    subtitle: 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার (Letters Patent)',
    quote:
      'Title: "A Method for Preparing Animal Nutritional Feed Supplement Against Subclinical Mastitis and All Kinds of Pains." Proprietor & Inventor: Dr. Md. Rezaul Karim.',
    date: '২৮ অক্টোবর ২০১৪ (ফাইলিং: ১২ অক্টোবর ২০১১)',
    image: '/images/founder/patent-1005415.jpg',
    group: 'DOCUMENT',
    badge: 'সরকারি পেটেন্ট',
  },
  {
    id: 'bau-1',
    title: 'ঔষধের কার্যকারিতার প্রত্যয়ন (ভেটেরিনারি ক্লিনিক)',
    issuer: 'বাংলাদেশ কৃষি বিশ্ববিদ্যালয় (BAU), ময়মনসিংহ',
    subtitle: 'প্রফেসর ডাঃ আব্দুর রহমান (রেজিঃ নং-০০০৮), সাবেক প্রফেসর ও কনসালটেন্ট, BAU।',
    quote:
      '“দেশীয় কাঁচামালে তৈরি ভেটেরিনারি প্রডাক্টসমূহ মাঠ পর্যায়ে প্রয়োগকালে কোনরূপ পার্শ্ব-প্রতিক্রিয়া পরিলক্ষিত হয়নি এবং আশানুরূপ ফল পাইয়াছি।”',
    date: '১২ জুন ২০১৩',
    image: '/images/founder/bau-certification-1.jpg',
    group: 'DOCUMENT',
    badge: 'BAU ক্লিনিক্যাল প্রত্যয়ন',
  },
  {
    id: 'bau-2',
    title: 'ঔষধের কার্যকারিতার প্রত্যয়ন (মেডিসিন বিভাগ)',
    issuer: 'বাংলাদেশ কৃষি বিশ্ববিদ্যালয় (BAU), ময়মনসিংহ',
    subtitle: 'প্রফেসর ড. মোঃ সিদ্দিকুর রহমান, ভেটেরিনারি মেডিসিন বিভাগ, BAU।',
    quote:
      '“দেশীয় কাঁচামালে তৈরি ভেটেরিনারি প্রডাক্টসমূহ মাঠ পর্যায়ে প্রয়োগকালে কোনরূপ পার্শ্ব-প্রতিক্রিয়া পরিলক্ষিত হয়নি।”',
    date: '১২ জুন ২০১৩',
    image: '/images/founder/bau-certification-2.jpg',
    group: 'DOCUMENT',
    badge: 'BAU মেডিসিন প্রত্যয়ন',
  },
];

export default function FounderAchievements() {
  const [selectedItem, setSelectedItem] = useState<AchievementItem | null>(null);
  const [activeCrestIndex, setActiveCrestIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-cycle crests every 3.5 seconds with pause-on-hover
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveCrestIndex((prev) => (prev + 1) % CRESTS.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [isPaused]);

  const activeCrest = CRESTS[activeCrestIndex];

  return (
    <section className="w-full bg-gradient-to-b from-white via-slate-50/80 to-slate-100/70 py-12 sm:py-16 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/90 text-xs font-bold mb-3 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>অফিসিয়াল স্বীকৃতি ও গবেষণা</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            গবেষক ও উদ্ভাবক পরিচিতি
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            প্রাণিসম্পদ অধিদপ্তর ও বাংলাদেশ কৃষি বিশ্ববিদ্যালয় কর্তৃক স্বীকৃত গবেষণা ও উদ্ভাবন
          </p>
        </div>

        {/* TOP ROW: FOUNDER CARD (LEFT) + ANIMATED CREST SHOWCASE (RIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch mb-14">
          
          {/* LEFT: Founder Card (5 columns) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs hover:shadow-md transition-shadow flex flex-col items-center text-center justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />
            
            <div className="w-full flex flex-col items-center">
              {/* Founder Image */}
              <div className="relative w-44 h-56 sm:w-52 sm:h-64 rounded-2xl overflow-hidden mb-5 shadow-sm border-2 border-emerald-600/90 bg-slate-100 ring-4 ring-emerald-50">
                <Image
                  src="/images/founder/dr-rezaul-karim-enhanced.png"
                  alt="ডাঃ মোঃ রেজাউল করিম — সফল গবেষক ও উদ্ভাবক"
                  fill
                  unoptimized
                  className="object-cover object-top"
                  priority
                />
              </div>

              {/* Founder Details */}
              <div className="space-y-1.5 w-full">
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-100/90 text-emerald-900 text-xs font-black border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  সফল গবেষক ও উদ্ভাবক
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight pt-1">
                  ডাঃ মোঃ রেজাউল করিম
                </h3>
                <p className="text-sm font-bold text-emerald-800">
                  স্বত্বাধিকারী, রিসার্চ এগ্রোভেট
                </p>
                <div className="inline-flex items-center gap-1 text-xs text-slate-500 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>গ্রাম: হাতিগাড়া, পোঃ ও থানা: বেড়া, জেলা: পাবনা, বাংলাদেশ</span>
                </div>
              </div>
            </div>

            {/* Quick credentials strip */}
            <div className="w-full mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-center">
              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                <p className="text-[11px] font-bold text-slate-500">সরকারি স্বীকৃতি</p>
                <p className="text-xs font-black text-slate-800">২টি পেটেন্ট সনদ</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                <p className="text-[11px] font-bold text-slate-500">BAU প্রত্যয়ন</p>
                <p className="text-xs font-black text-slate-800">ক্লিনিক্যাল রিসার্চ</p>
              </div>
            </div>
          </div>

          {/* RIGHT: Animated Crest Showcase (7 columns) */}
          <div
            className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-500" />

            {/* Header: Crest Tabs & Auto-slide Indicator */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
                    <Medal className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-slate-900">
                      সম্মাননা ও শুভেচ্ছা স্মারক
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      প্রাণিসম্পদ অধিদপ্তর প্রদত্ত অফিসিয়াল সম্মাননা
                    </p>
                  </div>
                </div>

                {/* Tab Pill Selectors */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                  {CRESTS.map((crest, idx) => (
                    <button
                      key={crest.id}
                      type="button"
                      onClick={() => setActiveCrestIndex(idx)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                        activeCrestIndex === idx
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {idx === 0 ? 'জেলা দপ্তর' : 'উপজেলা দপ্তর'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Animated Progress Bar (indicates 3.5s cycle) */}
              <div className="h-1 bg-slate-100 rounded-full overflow-hidden w-full mt-3">
                <motion.div
                  key={`${activeCrestIndex}-${isPaused}`}
                  initial={{ width: '0%' }}
                  animate={{ width: isPaused ? undefined : '100%' }}
                  transition={{ duration: 3.5, ease: 'linear' }}
                  className="h-full bg-amber-500 rounded-full"
                />
              </div>
            </div>

            {/* Animated Crest Content (Both text & photo transition together) */}
            <div className="my-6 min-h-[290px] sm:min-h-[260px] flex items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCrest.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="w-full flex flex-col sm:flex-row gap-5 sm:gap-6 items-center sm:items-start"
                >
                  {/* Crest Image with Click to Zoom */}
                  <div
                    onClick={() => setSelectedItem(activeCrest)}
                    className="group relative aspect-[3/4] w-40 sm:w-44 shrink-0 rounded-2xl overflow-hidden bg-slate-900 shadow-md border-2 border-amber-300/80 cursor-pointer"
                    title="বড় করে দেখতে ক্লিক করুন"
                  >
                    <Image
                      src={activeCrest.image}
                      alt={activeCrest.title}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/30 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 bg-white/95 text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-lg shadow flex items-center gap-1 transition-opacity">
                        <ZoomIn className="w-3.5 h-3.5 text-amber-700" />
                        বড় করুন
                      </span>
                    </div>
                  </div>

                  {/* Crest Citation Text */}
                  <div className="flex-1 min-w-0 text-center sm:text-left space-y-2.5">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                        {activeCrest.badge}
                      </span>
                      <h5 className="text-base sm:text-lg font-black text-slate-900 pt-1">
                        {activeCrest.title}
                      </h5>
                      <p className="text-xs sm:text-sm font-bold text-emerald-800 pt-0.5">
                        {activeCrest.subtitle}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-150 text-xs sm:text-[13px] text-slate-700 leading-relaxed italic">
                      &ldquo;{activeCrest.quote}&rdquo;
                    </div>

                    <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setSelectedItem(activeCrest)}
                        className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                        স্মারক বড় করে দেখুন
                      </button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Controls: Previous / Next & Status */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="text-[11px]">
                {isPaused ? '⏸ প্রদর্শন থামানো আছে' : '৩.৫ সেকেন্ড পর পর স্বয়ংক্রিয়ভাবে পরিবর্তিত হবে'}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setActiveCrestIndex((prev) => (prev - 1 + CRESTS.length) % CRESTS.length)
                  }
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                  title="পূর্ববর্তী স্মারক"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-700 px-1">
                  {activeCrestIndex + 1} / {CRESTS.length}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setActiveCrestIndex((prev) => (prev + 1) % CRESTS.length)
                  }
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                  title="পরবর্তী স্মারক"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ROW 2: OFFICIAL PROOF & DOCUMENTS (4 COLUMNS) */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                সরকারি পেটেন্ট ও ক্লিনিক্যাল গবেষণাপত্র (Proof & Documents)
              </h4>
              <p className="text-xs text-slate-500">
                গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের পেটেন্ট সনদ ও বাংলাদেশ কৃষি বিশ্ববিদ্যালয় (BAU) কার্যকারিতার প্রত্যয়ন
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {DOCUMENTS.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setSelectedItem(doc)}
                className="group bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-500 p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {/* Document Thumbnail */}
                  <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-100 mb-3 border border-slate-200/80 shadow-2xs">
                    <Image
                      src={doc.image}
                      alt={doc.title}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/30 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 bg-white/95 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1 transition-opacity">
                        <ZoomIn className="w-3 h-3 text-emerald-700" />
                        বড় করে দেখুন
                      </span>
                    </div>
                  </div>

                  <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-100 text-[10px] font-extrabold mb-1">
                    {doc.badge}
                  </span>
                  <h5 className="text-xs sm:text-sm font-extrabold text-slate-900 line-clamp-2 leading-snug">
                    {doc.title}
                  </h5>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                    {doc.issuer}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{doc.date}</span>
                  <span className="font-bold text-emerald-700 group-hover:underline">দেখুন ↗</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Lightbox Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                  {selectedItem.issuer}
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                  {selectedItem.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="w-8 h-8 rounded-lg bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center shrink-0 cursor-pointer"
                title="বন্ধ করুন"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Image View */}
            <div className="relative flex-1 min-h-[350px] sm:min-h-[500px] bg-slate-900 p-2 flex items-center justify-center overflow-auto">
              <img
                src={selectedItem.image}
                alt={selectedItem.title}
                className="max-h-[75vh] w-auto object-contain rounded shadow"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span>{selectedItem.date}</span>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-bold cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
