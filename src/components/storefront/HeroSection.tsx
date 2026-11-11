'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ArrowRight, ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export function WhatsAppIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

export interface HeroBannerItem {
  id: string;
  imageUrl: string;
  title?: string | null;
}

interface HeroSectionProps {
  banners?: HeroBannerItem[];
}

export default function HeroSection({ banners = [] }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const hasBanners = banners && banners.length > 0;
  const safeIndex = hasBanners ? currentIndex % banners.length : 0;
  const currentBanner = hasBanners ? banners[safeIndex] : null;

  // Auto-cycle through banners every 4.5 seconds
  useEffect(() => {
    if (!hasBanners || banners.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [hasBanners, banners.length, isHovered]);

  const prevBanner = () => {
    if (!hasBanners) return;
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const nextBanner = () => {
    if (!hasBanners) return;
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <section className="relative bg-gradient-to-b from-slate-50 via-emerald-50/30 to-slate-50 border-b border-slate-200 overflow-hidden py-6 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        {/* Left Column: Value Proposition & CTAs */}
        <div className="lg:col-span-6 space-y-4 sm:space-y-5">

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.25]">
            গবাদিপশু ও পোল্ট্রির শতভাগ আসল ও অনুমোদিত{' '}
            <span className="text-emerald-700 decoration-emerald-300 decoration-4 underline-offset-4">
              মেডিকেটেড খাদ্য প্রি-মিক্স
            </span>
          </h1>

          {/* Government Approval Banner */}
          <div className="inline-flex items-center gap-3 bg-emerald-900 text-white px-3 sm:px-5 py-2.5 rounded-lg shadow-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-300 shrink-0" />
            <span className="font-semibold text-xs sm:text-base">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার অনুমোদিত প্রস্তুতকারক</span>
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
            সরাসরি অনুমোদিত প্রস্তুতকারক থেকে নিয়ন্ত্রিত কোল্ড-চেইনে সংরক্ষিত প্রিমিয়াম কোয়ালিটি ফিড প্রিমিক্স, মিল্ক বুস্টার, গ্রোথ সাপ্লিমেন্ট ও মিনারেল।
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-0 sm:pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-bold transition-all shadow-xs"
            >
              <span>সকল প্রিমিক্স দেখুন</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="https://wa.me/8801716019731?text=আসসালামু%20আলাইকুম,%20ফিড%20প্রিমিক্স%20ও%20খামার%20পরামর্শের%20জন্য%20যোগাযোগ%20করছি।"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition-all shadow-xs"
            >
              <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
              <span>পরামর্শ নিন</span>
            </a>
          </div>
        </div>

        {/* Right Column: Visual Showcase Image Slider */}
        <div className="lg:col-span-6 w-full">
          {/* Main Visual Image Slider */}
          <div
            className="group relative w-full h-80 sm:h-96 lg:h-[420px] rounded-3xl bg-slate-900 border border-slate-200/90 shadow-lg overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {hasBanners && currentBanner ? (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentBanner.id}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.4 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={currentBanner.imageUrl}
                      alt={currentBanner.title || 'রিসার্চ এগ্রোভেট হিরো ব্যানার'}
                      fill
                      unoptimized
                      priority
                      className="object-cover object-center"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Navigation arrows (visible on group hover) */}
                {banners.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        prevBanner();
                      }}
                      aria-label="পূর্ববর্তী ব্যানার"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-950/60 hover:bg-slate-950/85 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs cursor-pointer shadow-md"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        nextBanner();
                      }}
                      aria-label="পরবর্তী ব্যানার"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-950/60 hover:bg-slate-950/85 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs cursor-pointer shadow-md"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Pagination Dots */}
                    <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/50 backdrop-blur-xs">
                      {banners.map((b, idx) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setCurrentIndex(idx)}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            currentIndex === idx ? 'w-5 bg-emerald-400' : 'w-1.5 bg-white/60 hover:bg-white'
                          }`}
                          aria-label={`ব্যানার ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              /* Fallback when no active banners are uploaded */
              <div className="h-full w-full rounded-2xl bg-gradient-to-br from-emerald-50 via-slate-50 to-slate-100 flex flex-col items-center justify-center text-center p-6 border border-slate-200/60">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 mb-2">
                  <ImageIcon className="w-6 h-6 stroke-[1.75]" />
                </div>
                <p className="text-xs font-bold text-slate-700">রিসার্চ এগ্রোভেট</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                  উন্নত মানের ফিড প্রিমিক্স ও ভেটেরিনারি ফর্মুলেশন
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
