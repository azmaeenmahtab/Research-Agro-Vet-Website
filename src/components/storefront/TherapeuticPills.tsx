'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Layers, ChevronLeft, ChevronRight } from 'lucide-react';

const categories = [
  { label: 'সকল রোগ ও উপসর্গ', href: '/products' },
  { label: 'ক্ষুধা ও বদহজম / Bloat', href: '/products?category=digestive-appetite-care' },
  { label: 'ক্যালসিয়াম ও দুধ বৃদ্ধি / Milk Booster', href: '/products?category=calcium-milk-bone' },
  { label: 'লিভার টনিক / Liver Tonic', href: '/products?category=liver-tonic-digestive' },
  { label: 'ভিটামিন ও জিংক / Vitality', href: '/products?category=vitamins-growth-promoters' },
  { label: 'প্রজনন ও ফার্টিলিটি', href: '/products?category=reproductive-uterine-care' },
  { label: 'স্যালাইন ও ফার্স্ট এইড', href: '/products?category=electrolytes-diarrhea-wound' },
];

export default function TherapeuticPills() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: direction === 'left' ? -220 : 220, behavior: 'smooth' });
  };

  return (
    <section className="bg-slate-100/70 border-b border-slate-200 py-2.5">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-2">
        {/* Label */}
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 shrink-0 mr-1">
          <Layers className="w-3.5 h-3.5 text-emerald-700" />
          <span className="hidden sm:inline">রোগ ও উপসর্গ:</span>
        </div>

        {/* Left Arrow Button */}
        <button
          onClick={() => scroll('left')}
          aria-label="Previous categories"
          className="p-1 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-emerald-700 shadow-2xs shrink-0 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Pills Track (Hidden Scrollbar) */}
        <div
          ref={scrollRef}
          className="flex-1 flex items-center gap-2 overflow-x-auto scroll-smooth py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {categories.map((cat, idx) => (
            <Link
              key={cat.label}
              href={cat.href}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs transition-all ${
                idx === 0
                  ? 'bg-emerald-700 text-white font-bold shadow-xs'
                  : 'bg-white text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/50 border border-slate-200/90 font-medium'
              }`}
            >
              {cat.label}
            </Link>
          ))}
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={() => scroll('right')}
          aria-label="Next categories"
          className="p-1 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-emerald-700 shadow-2xs shrink-0 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
