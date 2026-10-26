'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

const speciesList = [
  { label: 'সকল ঔষধ', href: '/products', tag: null },
  { label: '🐄 গরু ও মহিষ', href: '/products?species=CATTLE_BUFFALO', tag: 'CATTLE_BUFFALO' },
  { label: '🐓 পোল্ট্রি ও হাঁস', href: '/products?species=POULTRY', tag: 'POULTRY' },
  { label: '🐐 ছাগল ও ভেড়া', href: '/products?species=GOAT_SHEEP', tag: 'GOAT_SHEEP' },
  { label: '🐟 মৎস্য ও একুয়া', href: '/products?species=AQUA', tag: 'AQUA' },
  { label: '🤝 পাইকারি ও ডিলার যোগাযোগ', href: '/#dealer-contact', tag: 'WHOLESALE' },
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
    <div className="bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 overflow-x-auto flex items-center gap-1.5 py-1.5 no-scrollbar text-xs">
        {speciesList.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`whitespace-nowrap px-3 py-1 rounded-md font-medium transition-all ${
              isActive(item)
                ? 'bg-emerald-700 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-100'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
