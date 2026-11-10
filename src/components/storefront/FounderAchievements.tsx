'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Award, FileText, CheckCircle2, ShieldCheck, X, ZoomIn, Building2 } from 'lucide-react';

interface DocumentItem {
  id: string;
  title: string;
  issuer: string;
  date: string;
  image: string;
  category: 'PATENT' | 'CREST' | 'CERTIFICATE';
}

const DOCUMENTS: DocumentItem[] = [
  {
    id: 'patent-1',
    title: 'পেটেন্ট নং ১০০৫৪১৪: Liver and Stomach Disease Feed Supplement',
    issuer: 'Department of Patents, Designs and Trademarks, Govt. of Bangladesh',
    date: '২৮ অক্টোবর ২০১৪ (ফাইলিং: ১২ অক্টোবর ২০১১)',
    image: '/images/founder/patent-1005414.jpg',
    category: 'PATENT',
  },
  {
    id: 'patent-2',
    title: 'পেটেন্ট নং ১০০৫৪১৫: Subclinical Mastitis and All Kinds of Pains Feed Supplement',
    issuer: 'Department of Patents, Designs and Trademarks, Govt. of Bangladesh',
    date: '২৮ অক্টোবর ২০১৪ (ফাইলিং: ১২ অক্টোবর ২০১১)',
    image: '/images/founder/patent-1005415.jpg',
    category: 'PATENT',
  },
  {
    id: 'crest',
    title: 'শুভেচ্ছা স্মারক: "বেড়ার সফল গবেষক ও উদ্ভাবক"',
    issuer: 'উপজেলা প্রাণিসম্পদ দপ্তর, বেড়া, পাবনা (পাবনা জেলা প্রাণিসম্পদ দপ্তর)',
    date: 'অফিসিয়াল সম্মাননা',
    image: '/images/founder/crest-dls-bera.jpg',
    category: 'CREST',
  },
  {
    id: 'bau-1',
    title: 'ঔষধের কার্যকারিতার প্রত্যয়ন (ভেটেরিনারি ক্লিনিক)',
    issuer: 'প্রফেসর ডাঃ আব্দুর রহমান, বাংলাদেশ কৃষি বিশ্ববিদ্যালয় (BAU), ময়মনসিংহ',
    date: '১২ জুন ২০১৩',
    image: '/images/founder/bau-certification-1.jpg',
    category: 'CERTIFICATE',
  },
  {
    id: 'bau-2',
    title: 'ঔষধের কার্যকারিতার প্রত্যয়ন (মেডিসিন বিভাগ)',
    issuer: 'প্রফেসর ড. মোঃ সিদ্দিকুর রহমান, বাংলাদেশ কৃষি বিশ্ববিদ্যালয় (BAU), ময়মনসিংহ',
    date: '১২ জুন ২০১৩',
    image: '/images/founder/bau-certification-2.jpg',
    category: 'CERTIFICATE',
  },
];

export default function FounderAchievements() {
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);

  return (
    <section className="w-full bg-gradient-to-b from-white via-slate-50/60 to-slate-100/70 py-12 sm:py-16 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
        
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            গবেষক ও উদ্ভাবক পরিচিতি
          </h2>
          {/* <p className="text-xs sm:text-sm text-slate-600 mt-2">
            রিসার্চ এগ্রোভেট-এর স্বত্বাধিকারী ও সরকারি পেটেন্টপ্রাপ্ত উদ্ভাবনসমূহ
          </p> */}
        </div>

        {/* Top Split: Founder Profile & 3 Official Recognitions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start mb-10">
          
          {/* Founder Identity Card (Left) */}
          <div className="lg:col-span-5 flex py-10 flex-col items-center text-center">
            <div className="relative w-44 h-56 sm:w-80 sm:h-96 rounded-xl overflow-hidden mb-4 shadow-sm bg-slate-100">
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
              {/* <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                সফল গবেষক ও উদ্ভাবক
              </span> */}
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight pt-1">
                ডাঃ মোঃ রেজাউল করিম
              </h3>
              <p className="text-xs font-bold text-emerald-700">
                স্বত্বাধিকারী, রিসার্চ এগ্রোভেট
              </p>
              <p className="text-xs text-slate-500 pt-1">
                হাতিগাড়া, বেড়া, পাবনা, বাংলাদেশ
              </p>
            </div>

            {/* Micro Specs */}
            {/* <div className="grid grid-cols-2 gap-2 w-full mt-5 pt-4 border-t border-slate-100 text-left">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                <span className="text-[10px] text-slate-500 font-medium block">সরকারি স্বীকৃতি</span>
                <span className="text-xs font-extrabold text-slate-800">২টি পেটেন্ট সনদ</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                <span className="text-[10px] text-slate-500 font-medium block">ক্লিনিক্যাল ট্রায়াল</span>
                <span className="text-xs font-extrabold text-slate-800">BAU প্রত্যয়নপ্রাপ্ত</span>
              </div>
            </div> */}
          </div>

          {/* 3 Core Official Documents Cards (Right) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Card 1: Government Patents */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs hover:border-emerald-300 transition-colors">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                    গণপ্রজাতন্ত্রী বাংলাদেশ সরকার (Letters Patent)
                  </span>
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                    Department of Patents, Designs and Trademarks কর্তৃক ২টি পেটেন্ট
                  </h4>
                  <ul className="text-xs text-slate-600 mt-2 space-y-1 list-disc list-inside">
                    <li>
                      <strong className="text-slate-800">পেটেন্ট নং ১০০৫৪১৪:</strong> Animal Nutritional Feed Supplement Against Liver and Stomach Disease.
                    </li>
                    <li>
                      <strong className="text-slate-800">পেটেন্ট নং ১০০৫৪১৫:</strong> Animal Nutritional Feed Supplement Against Subclinical Mastitis and All Kinds of Pains.
                    </li>
                  </ul>
                  <p className="text-[11px] text-slate-400 mt-1.5 font-medium">
                    উদ্ভাবক ও স্বত্বাধিকারী: Dr. Md. Rezaul Karim
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: BAU Clinical Certification */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs hover:border-emerald-300 transition-colors">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#005d42] border border-emerald-200 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    বাংলাদেশ কৃষি বিশ্ববিদ্যালয় (BAU), ময়মনসিংহ
                  </span>
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                    মেডিসিন বিভাগ ও ভেটেরিনারি ক্লিনিক কর্তৃক কার্যকারিতার প্রত্যয়ন
                  </h4>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-emerald-50/70 border border-emerald-100 p-2.5 rounded-lg italic">
                    &ldquo;দেশীয় কাঁচামালে তৈরি ভেটেরিনারি প্রডাক্টসমূহ মাঠ পর্যায়ে প্রয়োগকালে কোনরূপ পার্শ্ব-প্রতিক্রিয়া পরিলক্ষিত হয়নি এবং আশানুরূপ ফল পাইয়াছি।&rdquo;
                  </p>
                  <p className="text-[11px] text-slate-500 mt-2 font-medium">
                    প্রত্যয়নকারী: প্রফেসর ডাঃ আব্দুর রহমান (রেজিঃ নং-০০০৮) ও প্রফেসর ড. মোঃ সিদ্দিকুর রহমান
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: District Livestock Office Crest */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs hover:border-emerald-300 transition-colors">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                    পাবনা জেলা প্রাণিসম্পদ দপ্তর
                  </span>
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                    উপজেলা প্রাণিসম্পদ দপ্তর, বেড়া কর্তৃক শুভেচ্ছা স্মারক
                  </h4>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    &ldquo;বেড়ার সফল গবেষক ও উদ্ভাবক (এম ডি রিসার্চ এগ্রোভেট) ডাঃ মোঃ রেজাউল করিম-কে শুভেচ্ছা স্মারক&rdquo;
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1.5 font-medium">
                    সৌজন্যে: ডাঃ মোঃ মিজানুর রহমান, উপজেলা প্রাণিসম্পদ কর্মকর্তা, বেড়া, পাবনা
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Document Gallery Thumbnails */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                মূল সরকারি পেটেন্ট ও প্রত্যয়ন নথিপত্র
              </h4>
              <p className="text-xs text-slate-500">
                যেকোনো নথিতে ক্লিক করে মূল ফ্রেম ও স্বাক্ষর বড় করে দেখুন
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {DOCUMENTS.map((doc) => (
              <button
                key={doc.id}
                type="button"
                onClick={() => setSelectedDoc(doc)}
                className="group text-left border border-slate-200 hover:border-emerald-500 rounded-xl p-2 bg-slate-50 hover:bg-white transition-all shadow-2xs flex flex-col cursor-pointer"
              >
                <div className="relative aspect-[3/4] w-full bg-slate-200 rounded-lg overflow-hidden mb-2">
                  <Image
                    src={doc.image}
                    alt={doc.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 18vw"
                  />
                  <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/30 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 bg-white/95 text-slate-800 text-[11px] font-bold px-2 py-1 rounded shadow-md flex items-center gap-1 transition-opacity">
                      <ZoomIn className="w-3.5 h-3.5 text-emerald-700" />
                      বড় করুন
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold text-emerald-800 line-clamp-1 block">
                  {doc.category === 'PATENT' ? 'সরকারি পেটেন্ট' : doc.category === 'CREST' ? 'সম্মাননা ক্রেস্ট' : 'BAU প্রত্যয়ন'}
                </span>
                <span className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug">
                  {doc.title}
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Lightbox Modal */}
      {selectedDoc && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
          onClick={() => setSelectedDoc(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                  {selectedDoc.issuer}
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                  {selectedDoc.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="w-8 h-8 rounded-lg bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center shrink-0 cursor-pointer"
                title="বন্ধ করুন"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Image View */}
            <div className="relative flex-1 min-h-[350px] sm:min-h-[500px] bg-slate-900 p-2 flex items-center justify-center overflow-auto">
              <img
                src={selectedDoc.image}
                alt={selectedDoc.title}
                className="max-h-[75vh] w-auto object-contain rounded shadow"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span>{selectedDoc.date}</span>
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
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

