'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Award, FileText, ShieldCheck, X, ZoomIn, Building2, Medal } from 'lucide-react';

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
    quote: 'পাবনা জেলার প্রাণিসম্পদ দপ্তরের সকল কর্মকর্তার বেড়া উপজেলা প্রাণিসম্পদ দপ্তরে আগমন উপলক্ষে বেড়ার সফল গবেষক ও উদ্ভাবক (এম ডি রিসার্চ এগ্রোভেট) ডাঃ মোঃ রেজাউল করিম-কে শুভেচ্ছা স্মারক।',
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
    quote: 'পাবনা জেলার প্রাণিসম্পদ দপ্তরের সকল কর্মকর্তার বেড়া উপজেলা প্রাণিসম্পদ দপ্তরে আগমন উপলক্ষে বেড়ার সফল গবেষক ও উদ্ভাবক (এম ডি রিসার্চ এগ্রোভেট) ডাঃ মোঃ রেজাউল করিম-কে শুভেচ্ছা স্মারক।',
    date: 'অফিসিয়াল সম্মাননা',
    image: '/images/founder/crest-dls-bera.jpg',
    group: 'CREST',
    badge: 'উপজেলা প্রাণিসম্পদ দপ্তর সম্মাননা',
  },
];

const DOCUMENTS: AchievementItem[] = [
  {
    id: 'patent-1',
    title: 'পেটেন্ট নং ১০০৫৪১৪: Liver and Stomach Disease Feed Supplement',
    issuer: 'Department of Patents, Designs and Trademarks',
    subtitle: 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার (Letters Patent)',
    quote: 'Title: "A Method for Preparing Animal Nutritional Feed Supplement Against Liver and Stomach Disease." Proprietor & Inventor: Dr. Md. Rezaul Karim.',
    date: '২৮ অক্টোবর ২০১৪ (ফাইলিং: ১২ অক্টোবর ২০১১)',
    image: '/images/founder/patent-1005414.jpg',
    group: 'DOCUMENT',
    badge: 'সরকারি পেটেন্ট',
  },
  {
    id: 'patent-2',
    title: 'পেটেন্ট নং ১০০৫৪১৫: Subclinical Mastitis and All Kinds of Pains Feed Supplement',
    issuer: 'Department of Patents, Designs and Trademarks',
    subtitle: 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার (Letters Patent)',
    quote: 'Title: "A Method for Preparing Animal Nutritional Feed Supplement Against Subclinical Mastitis and All Kinds of Pains." Proprietor & Inventor: Dr. Md. Rezaul Karim.',
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
    quote: '“দেশীয় কাঁচামালে তৈরি ভেটেরিনারি প্রডাক্টসমূহ মাঠ পর্যায়ে প্রয়োগকালে কোনরূপ পার্শ্ব-প্রতিক্রিয়া পরিলক্ষিত হয়নি এবং আশানুরূপ ফল পাইয়াছি।”',
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
    quote: '“দেশীয় কাঁচামালে তৈরি ভেটেরিনারি প্রডাক্টসমূহ মাঠ পর্যায়ে প্রয়োগকালে কোনরূপ পার্শ্ব-প্রতিক্রিয়া পরিলক্ষিত হয়নি।”',
    date: '১২ জুন ২০১৩',
    image: '/images/founder/bau-certification-2.jpg',
    group: 'DOCUMENT',
    badge: 'BAU মেডিসিন প্রত্যয়ন',
  },
];

export default function FounderAchievements() {
  const [selectedItem, setSelectedItem] = useState<AchievementItem | null>(null);

  return (
    <section className="w-full bg-gradient-to-b from-white via-slate-50/70 to-slate-100/70 py-12 sm:py-16 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/90 text-xs font-bold mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>অফিসিয়াল স্বীকৃতি ও উদ্ভাবন</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            গবেষক ও উদ্ভাবক পরিচিতি
          </h2>
        </div>

        {/* Top: Founder Profile */}
        <div className="max-w-xl mx-auto flex flex-col items-center text-center mb-12 sm:mb-16">
          <div className="relative w-48 h-60 sm:w-64 sm:h-80 rounded-2xl overflow-hidden mb-4 shadow-md border-2 border-emerald-600 bg-slate-100">
            <Image
              src="/images/founder/dr-rezaul-karim-enhanced.png"
              alt="ডাঃ মোঃ রেজাউল করিম — সফল গবেষক ও উদ্ভাবক"
              fill
              unoptimized
              className="object-cover object-top"
              priority
            />
          </div>

          <div className="space-y-1">
            <span className="inline-block px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-200">
              সফল গবেষক ও উদ্ভাবক
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight pt-1">
              ডাঃ মোঃ রেজাউল করিম
            </h3>
            <p className="text-sm font-bold text-emerald-800">
              স্বত্বাধিকারী, রিসার্চ এগ্রোভেট
            </p>
            <p className="text-xs text-slate-500 pt-0.5">
              হাতিগাড়া, বেড়া, পাবনা, বাংলাদেশ
            </p>
          </div>
        </div>

        {/* ROW 1: ACHIEVEMENTS & CRESTS */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
              <Medal className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                সম্মাননা ও স্বীকৃতি স্মারক (Achievements & Crests)
              </h4>
              <p className="text-xs text-slate-500">
                প্রাণিসম্পদ অধিদপ্তর কর্তৃক সফল গবেষক ও উদ্ভাবক হিসেবে প্রদত্ত শুভেচ্ছা স্মারকসমূহ
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {CRESTS.map((crest) => (
              <div
                key={crest.id}
                onClick={() => setSelectedItem(crest)}
                className="group bg-white rounded-2xl border border-slate-200/90 hover:border-amber-400 p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all flex flex-col sm:flex-row gap-4 items-center sm:items-start cursor-pointer"
              >
                {/* Crest Thumbnail */}
                <div className="relative aspect-[3/4] w-36 sm:w-32 shrink-0 rounded-xl overflow-hidden bg-slate-900 shadow-inner">
                  <Image
                    src={crest.image}
                    alt={crest.title}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/30 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 bg-white/95 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1 transition-opacity">
                      <ZoomIn className="w-3 h-3 text-amber-700" />
                      বড় করুন
                    </span>
                  </div>
                </div>

                {/* Crest Details */}
                <div className="flex-1 min-w-0 text-center sm:text-left space-y-1.5">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold">
                    {crest.badge}
                  </span>
                  <h5 className="text-sm sm:text-base font-extrabold text-slate-900">
                    {crest.title}
                  </h5>
                  <p className="text-xs font-semibold text-emerald-800">
                    {crest.subtitle}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                    &ldquo;{crest.quote}&rdquo;
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ROW 2: OFFICIAL PROOF & DOCUMENTS */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center">
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
                  <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-100 mb-3 border border-slate-200/80">
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
