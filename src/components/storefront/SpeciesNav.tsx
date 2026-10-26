'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

const speciesList = [
  { label: 'সকল পণ্য', href: '/products', tag: null },
  { label: 'গরু ও মহিষ', href: '/products?species=CATTLE_BUFFALO', tag: 'CATTLE_BUFFALO' },
  { label: 'পোল্ট্রি ও হাঁস', href: '/products?species=POULTRY', tag: 'POULTRY' },
  { label: 'ছাগল ও ভেড়া', href: '/products?species=GOAT_SHEEP', tag: 'GOAT_SHEEP' },
  { label: 'মৎস্য ও একুয়া', href: '/products?species=AQUA', tag: 'AQUA' },
  { label: 'পাইকারি ও ডিলার', href: '/#dealer-contact', tag: 'WHOLESALE' },
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
    <div className="bg-white border-b border-slate-200 sticky top-[58px] z-30">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
          {speciesList.map((item) => {
            const isWholesaleBtn = item.tag === 'WHOLESALE';
            const active = isActive(item);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`text-center px-2 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  isWholesaleBtn
                    ? active
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 hover:shadow-sm'
                    : active
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 hover:shadow-sm border border-slate-100 hover:border-emerald-200'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
