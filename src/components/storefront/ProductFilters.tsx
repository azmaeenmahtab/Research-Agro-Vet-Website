'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Filter, RotateCcw, Phone, MessageSquare, ChevronDown, Check } from 'lucide-react';

const SPECIES_OPTIONS = [
  { id: 'ALL', label: 'সকল প্রাণী', value: undefined },
  { id: 'CATTLE_BUFFALO', label: 'গরু ও মহিষ (Cattle)', value: 'CATTLE_BUFFALO' },
  { id: 'POULTRY', label: 'পোল্ট্রি ও হাঁস (Poultry)', value: 'POULTRY' },
  { id: 'GOAT_SHEEP', label: 'ছাগল ও ভেড়া (Goat)', value: 'GOAT_SHEEP' },
  { id: 'AQUA', label: 'মৎস্য ও চিংড়ি (Aqua)', value: 'AQUA' },
];

const CATEGORY_OPTIONS = [
  { slug: 'ALL', label: 'সকল ক্যাটাগরি (All)', value: undefined },
  { slug: 'digestive-appetite-care', label: 'ক্ষুধা, হজম ও পেট ফাঁপা', value: 'digestive-appetite-care' },
  { slug: 'calcium-milk-bone', label: 'ক্যালসিয়াম ও দুধ বৃদ্ধি', value: 'calcium-milk-bone' },
  { slug: 'vitamins-growth-promoters', label: 'ভিটামিন, জিংক ও বৃদ্ধি', value: 'vitamins-growth-promoters' },
  { slug: 'liver-tonic-digestive', label: 'লিভার টনিক ও টক্সিন কেয়ার', value: 'liver-tonic-digestive' },
  { slug: 'reproductive-uterine-care', label: 'প্রজনন ও জরায়ু সুরক্ষা', value: 'reproductive-uterine-care' },
  { slug: 'electrolytes-diarrhea-wound', label: 'স্যালাইন, ডায়রিয়া ও ক্ষত', value: 'electrolytes-diarrhea-wound' },
];

interface ProductFiltersProps {
  currentSpecies?: string;
  currentCategory?: string;
  currentSearch?: string;
  onSpeciesChange?: (species: string | undefined) => void;
  onCategoryChange?: (category: string | undefined) => void;
  onReset?: () => void;
}

export default function ProductFilters({
  currentSpecies,
  currentCategory,
  currentSearch,
  onSpeciesChange,
  onCategoryChange,
  onReset,
}: ProductFiltersProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const updateFilter = (key: string, value: string | undefined) => {
    if (key === 'species' && onSpeciesChange) {
      onSpeciesChange(value);
      return;
    }
    if (key === 'category' && onCategoryChange) {
      onCategoryChange(value);
      return;
    }

    const params = new URLSearchParams();
    const newSpecies = key === 'species' ? value : currentSpecies;
    const newCategory = key === 'category' ? value : currentCategory;

    if (newSpecies) params.set('species', newSpecies);
    if (newCategory) params.set('category', newCategory);
    if (currentSearch) params.set('q', currentSearch);

    const qs = params.toString();
    router.push(qs ? `/products?${qs}` : '/products');
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
      return;
    }
    router.push('/products');
  };

  const hasActiveFilters = Boolean(currentSpecies || currentCategory || currentSearch);

  const filterContent = (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-700" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">ফিল্টারসমূহ</h2>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>রিসেট</span>
          </button>
        )}
      </div>

      {/* Species Filter */}
      <div>
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          প্রাণী অনুযায়ী (Species)
        </h3>
        <div className="space-y-1.5">
          {SPECIES_OPTIONS.map((spec) => {
            const isSelected = (!currentSpecies && spec.value === undefined) || currentSpecies === spec.value;
            return (
              <button
                key={spec.id}
                type="button"
                onClick={() => updateFilter('species', spec.value)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${
                  isSelected
                    ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{spec.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories Filter */}
      <div className="pt-2 border-t border-slate-200">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          ক্যাটাগরি (Indication)
        </h3>
        <div className="space-y-1.5">
          {CATEGORY_OPTIONS.map((cat) => {
            const isSelected = (!currentCategory && cat.value === undefined) || currentCategory === cat.value;
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => updateFilter('category', cat.value)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${
                  isSelected
                    ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{cat.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Wholesale / Dealer Support Banner */}
      {/* <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
            🤝
          </div>
          <div>
            <h4 className="text-xs font-bold text-white leading-tight">পাইকারি ও ডিলার রেট</h4>
            <p className="text-[10px] text-slate-300">ট্রেড প্রাইস (TP) সুবিধা</p>
          </div>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          বক্স বা কার্টনে সরাসরি ড্রাগ লাইসেন্সধারী ফার্মেসি বা খামারে ওষুধ পেতে যোগাযোগ করুন।
        </p>
        <div className="space-y-1.5 pt-1">
          <a
            href="tel:01711234567"
            className="w-full py-1.5 px-3 rounded-lg bg-white text-slate-900 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-slate-100 transition-colors shadow-2xs"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-700" />
            <span>০১৭১১-২৩৪৫৬৭</span>
          </a>
          <a
            href="https://wa.me/8801711234567?text=আসসালামু%20আলাইকুম,%20পাইকারি%20রেট%20ও%20ডিলারশিপের%20জন্য%20জানতে%20চাচ্ছি।"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>হোয়াটসঅ্যাপ</span>
          </a>
        </div>
      </div> */}
    </div>
  );

  return (
    <div className="w-full">
      {/* Mobile Toggle Button */}
      <div className="lg:hidden mb-4">
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-slate-800 text-xs font-bold shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-700" />
            <span>ফিল্টার ও ক্যাটাগরি</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
            )}
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileOpen ? 'rotate-180' : ''}`} />
        </button>

        {mobileOpen && (
          <div className="mt-2 bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            {filterContent}
          </div>
        )}
      </div>

      {/* Desktop Panel */}
      <div className="hidden lg:block bg-white rounded-xl border border-slate-200 p-5 shadow-2xs max-h-[calc(100vh-100px)] overflow-y-auto [scrollbar-width:thin]">
        {filterContent}
      </div>
    </div>
  );
}
