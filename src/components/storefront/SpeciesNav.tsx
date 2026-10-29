'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

function CattleIcon({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    null
  );
}

function PoultryIcon({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    null
  );
}

function FishBowlIcon({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    null
  );
}

function GoatIcon({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    null
  );
}

function AllProductsIcon({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    // <svg viewBox="0 0 48 48" fill="currentColor" className={className} aria-hidden="true">
    //   <rect x="9" y="9" width="13" height="13" rx="3.5" />
    //   <rect x="26" y="9" width="13" height="13" rx="3.5" />
    //   <rect x="9" y="26" width="13" height="13" rx="3.5" />
    //   <rect x="26" y="26" width="13" height="13" rx="3.5" />
    // </svg>
    null
  );
}

function WholesaleIcon({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    null
  );
}

const speciesList = [
  { label: 'Cattle', labelBn: 'গরু ও মহিষ', href: '/products?species=CATTLE_BUFFALO', tag: 'CATTLE_BUFFALO', Icon: CattleIcon },
  { label: 'Poultry', labelBn: 'পোল্ট্রি ও হাঁস', href: '/products?species=POULTRY', tag: 'POULTRY', Icon: PoultryIcon },
  { label: 'Fish', labelBn: 'মৎস্য ও একুয়া', href: '/products?species=AQUA', tag: 'AQUA', Icon: FishBowlIcon },
  { label: 'Goat & Sheep', labelBn: 'ছাগল ও ভেড়া', href: '/products?species=GOAT_SHEEP', tag: 'GOAT_SHEEP', Icon: GoatIcon },
  { label: 'All Products', labelBn: 'সকল পণ্য', href: '/products', tag: null, Icon: AllProductsIcon },
  { label: 'Wholesale', labelBn: 'পাইকারি ও ডিলার', href: '/#dealer-contact', tag: 'WHOLESALE', Icon: WholesaleIcon },
];

export default function SpeciesNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSpecies = searchParams.get('species');
  const isWholesale = searchParams.get('mode') === 'wholesale';

  const isActive = (item: typeof speciesList[0]) => {
    if (item.tag === 'WHOLESALE') return isWholesale;
    if (item.tag) return currentSpecies === item.tag;
    return pathname === '/products' && !currentSpecies && !isWholesale;
  };

  return (
    <div className="bg-white/95 backdrop-blur-xs border-b border-slate-200 sticky top-[69px] z-30 py-2 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
          {speciesList.map((item) => {
            const isWholesaleBtn = item.tag === 'WHOLESALE';
            const active = isActive(item);
            const Icon = item.Icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                title={item.labelBn}
                className={`group flex items-center justify-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border-[1.5px] border-dashed transition-all duration-200 cursor-pointer ${
                  active
                    ? 'bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                    : isWholesaleBtn
                    ? 'bg-white border-[#5cb82e] hover:border-amber-500 hover:bg-amber-50/30 hover:shadow-xs hover:-translate-y-0.5 shadow-2xs'
                    : 'bg-white border-[#5cb82e] hover:border-[#4da322] hover:bg-emerald-50/30 hover:shadow-xs hover:-translate-y-0.5 shadow-2xs'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                    isWholesaleBtn && active
                      ? 'text-amber-600'
                      : isWholesaleBtn
                      ? 'text-[#5cb82e] group-hover:text-amber-600'
                      : 'text-[#5cb82e]'
                  }`}
                />
                <span className="font-bold text-slate-800 text-xs sm:text-sm tracking-tight group-hover:text-slate-950 transition-colors whitespace-nowrap">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
