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
  MapPin,
  CheckCircle2,
} from 'lucide-react';

interface AchievementItem {
  id: string;
  title: string;
  issuer: string;
  giverName?: string;
  giverDesignation?: string;
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
    giverName: 'ডাঃ গৌরাঙ্গ কুমার তালুকদার',
    giverDesignation: 'জেলা প্রাণিসম্পদ কর্মকর্তা, পাবনা',
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
    giverName: 'ডাঃ মোঃ মিজানুর রহমান',
    giverDesignation: 'উপজেলা প্রাণিসম্পদ কর্মকর্তা, বেড়া, পাবনা',
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
    badge: 'BAU প্রত্যয়ন',
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
    badge: 'BAU প্রত্যয়ন',
  },
];

export default function FounderAchievements() {
  const [selectedItem, setSelectedItem] = useState<AchievementItem | null>(null);
  const [activeCrestIndex, setActiveCrestIndex] = useState(0);
  const [displayedName, setDisplayedName] = useState('');
  const [typingPhase, setTypingPhase] = useState<'typing' | 'pausing' | 'deleting'>('typing');
  const [isHovered, setIsHovered] = useState(false);

  const activeCrest = CRESTS[activeCrestIndex];

  // Typewriter effect for the giver's name: types down, pauses, removes (backspaces), then swaps crest
  useEffect(() => {
    if (isHovered && typingPhase === 'pausing') {
      return;
    }

    const targetFullName = activeCrest.giverName || '';
    
    // Split using Intl.Segmenter to preserve Bengali conjuncts and vowel marks accurately
    const segmenter =
      typeof Intl !== 'undefined' && Intl.Segmenter
        ? new Intl.Segmenter('bn', { granularity: 'grapheme' })
        : null;

    const fullGraphemes = segmenter
      ? Array.from(segmenter.segment(targetFullName), (s) => s.segment)
      : targetFullName.split('');

    const currentGraphemes = segmenter
      ? Array.from(segmenter.segment(displayedName), (s) => s.segment)
      : displayedName.split('');

    let timer: NodeJS.Timeout;

    if (typingPhase === 'typing') {
      if (currentGraphemes.length < fullGraphemes.length) {
        timer = setTimeout(() => {
          setDisplayedName(fullGraphemes.slice(0, currentGraphemes.length + 1).join(''));
        }, 70); // typing speed per grapheme
      } else {
        timer = setTimeout(() => {
          setTypingPhase('pausing');
        }, 200);
      }
    } else if (typingPhase === 'pausing') {
      // Stay paused for reading (~2.2 seconds)
      timer = setTimeout(() => {
        setTypingPhase('deleting');
      }, 2200);
    } else if (typingPhase === 'deleting') {
      if (currentGraphemes.length > 0) {
        timer = setTimeout(() => {
          setDisplayedName(fullGraphemes.slice(0, currentGraphemes.length - 1).join(''));
        }, 35); // backspacing speed
      } else {
        // Name removed completely -> swap to next crest and start typing
        setActiveCrestIndex((prev) => (prev + 1) % CRESTS.length);
        setTypingPhase('typing');
      }
    }

    return () => clearTimeout(timer);
  }, [typingPhase, displayedName, activeCrestIndex, isHovered, activeCrest.giverName]);

  const handleSelectCrest = (idx: number) => {
    if (idx === activeCrestIndex) return;
    setActiveCrestIndex(idx);
    setDisplayedName('');
    setTypingPhase('typing');
  };

  return (
    <section className="w-full bg-slate-50/70 py-6 sm:py-16 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            গবেষক ও উদ্ভাবক পরিচিতি
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            প্রাণিসম্পদ অধিদপ্তর ও BAU কর্তৃক স্বীকৃত গবেষণা ও উদ্ভাবন
          </p>
        </div>

        {/* TOP ROW: FOUNDER CARD (LEFT) + ANIMATED CREST SHOWCASE (RIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch mb-14">
          
          {/* LEFT: Founder Card (5 columns) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden">
            
            {/* Half Top Slate Portion with Bigger Founder Picture */}
            <div className="w-full bg-slate-100/90 pt-4 px-4 flex flex-col items-center border-b border-slate-200/70">
              <div className="relative w-68 h-72 sm:w-77  sm:h-80 overflow-hidden">
                <Image
                  src="/images/founder/dr-rezaul-karim-enhanced.png"
                  alt="ডাঃ মোঃ রেজাউল করিম — সফল গবেষক ও উদ্ভাবক"
                  fill
                  unoptimized
                  className="object-cover object-top"
                  priority
                />
              </div>
            </div>

            {/* Bottom White Portion: Details & Credentials */}
            <div className="p-4 sm:p-7 flex flex-col items-center text-center justify-between flex-1">
              <div className="space-y-1.5 w-full">
                <span className="inline-flex items-center gap-1 px-3.5 py-1 rounded-full  text-emerald-900 text-xs font-black border border-emerald-200">
                  {/* <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> */}
                  গবেষক ও উদ্ভাবক
                </span>
                <h3 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight pt-1">
                  ডাঃ মোঃ রেজাউল করিম
                </h3>
                <p className="text-sm font-bold text-emerald-800">
                  স্বত্বাধিকারী, রিসার্চ এগ্রোভেট
                </p>
                {/* <div className="inline-flex items-center gap-1 text-xs text-slate-500 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>গ্রাম: হাতিগাড়া, পোঃ ও থানা: বেড়া, জেলা: পাবনা, বাংলাদেশ</span>
                </div> */}
              </div>

              
            </div>
          </div>

          {/* RIGHT: Animated Crest Showcase (7 columns) */}
          <div
            className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Top Bar: Crest Badge & Live Auto-cycle indicator */}
            <div className="flex items-center justify-between gap-2 pb-3 sm:pb-4 border-b border-slate-100">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 text-xs font-black border border-emerald-200">
                <Medal className="w-3.5 h-3.5 text-emerald-700" />
                <span>{activeCrest.badge}</span>
              </div>
              
            </div>

            {/* Crest Content: Large Photo + Citation & Animated Typewriter */}
            <div className="py-3 sm:py-5 flex-1 flex items-center">
              <div className="w-full flex flex-col md:flex-row gap-5 lg:gap-6 items-center md:items-start">
                
                {/* Crest Image with AnimatePresence for smooth swap */}
                <div
                  onClick={() => setSelectedItem(activeCrest)}
                  className="group relative aspect-[3/4] w-48 sm:w-56 md:w-60 shrink-0 rounded-2xl overflow-hidden bg-slate-100 shadow-md border border-slate-200/90 cursor-pointer ring-4 ring-slate-50"
                  title="বড় করে দেখতে ক্লিক করুন"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeCrest.id}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.3 }}
                      className="relative w-full h-full"
                    >
                      <Image
                        src={activeCrest.image}
                        alt={activeCrest.title}
                        fill
                        unoptimized
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        priority
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Zoom overlay hint */}
                  <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/30 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 bg-white/95 text-slate-800 text-[11px] font-bold px-3 py-1.5 rounded-lg shadow flex items-center gap-1.5 transition-opacity">
                      <ZoomIn className="w-3.5 h-3.5 text-slate-700" />
                      বড় করে দেখুন
                    </span>
                  </div>
                </div>

                {/* Crest Citation & Animated Typewriter Name */}
                <div className="flex-1 min-w-0 text-center md:text-left space-y-3.5 flex flex-col justify-between self-stretch">
                  <div className="hidden sm:block space-y-1">
                    <h4 className="text-base sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
                      {activeCrest.title}
                    </h4>
                    
                  </div>

                  {/* Verbatim Inscribed Citation from the Crest */}
                  <div className="hidden sm:block bg-slate-50/90 p-3.5 sm:p-4 rounded-2xl border border-slate-200/70 text-xs sm:text-[13px] text-slate-700 leading-relaxed italic shadow-2xs">
                    &ldquo;{activeCrest.quote}&rdquo;
                  </div>

                  {/* Giver Name: Type Down & Removing Animation */}
                  <div className="pt-0 sm:pt-2 border-t-0 sm:border-t sm:border-slate-100 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      সৌজন্যে ও সম্মাননা প্রদানকারী:
                    </span>
                    <div className="flex items-center justify-center md:justify-start min-h-[30px]">
                      <span className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
                        {displayedName}
                      </span>
                      <span className="inline-block w-0.5 h-5 bg-emerald-600 ml-1.5 animate-pulse" />
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-emerald-800">
                      {activeCrest.giverDesignation}
                    </p>
                  </div>
                </div>

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
              <h4 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
                সরকারি পেটেন্ট ও ক্লিনিক্যাল গবেষণাপত্র (Proof & Documents)
              </h4>
              
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {DOCUMENTS.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setSelectedItem(doc)}
                className="group bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-500 p-3 sm:p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {/* Document Thumbnail */}
                  <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-100 mb-2 sm:mb-3 border border-slate-200/80 shadow-2xs">
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

                  <span className="inline-block px-2 sm:px-3 py-1 sm:py-2 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs sm:text-sm font-extrabold mb-1">
                    {doc.badge}
                  </span>
                  {/* <h5 className="text-xs sm:text-sm font-extrabold text-slate-900 line-clamp-2 leading-snug">
                    {doc.title}
                  </h5>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                    {doc.issuer}
                  </p> */}
                </div>

                {/* <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{doc.date}</span>
                  <span className="font-bold text-emerald-700 group-hover:underline">দেখুন ↗</span>
                </div> */}
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
