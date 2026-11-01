'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';

interface SpeciesItem {
  label: string;
  labelBn: string;
  href: string;
  tag: string | null;
  image: string | null;
}

const speciesList: SpeciesItem[] = [
  {
    label: 'Cattle',
    labelBn: 'গরু ও মহিষ',
    href: '/products?species=CATTLE_BUFFALO',
    tag: 'CATTLE_BUFFALO',
    image: '/images/cattle.png',
  },
  {
    label: 'Poultry',
    labelBn: 'পোল্ট্রি ও হাঁস',
    href: '/products?species=POULTRY',
    tag: 'POULTRY',
    image: '/images/chicken.png',
  },
  {
    label: 'Fish',
    labelBn: 'মৎস্য ও একুয়া',
    href: '/products?species=AQUA',
    tag: 'AQUA',
    image: '/images/salmon.png',
  },
  {
    label: 'Goat & Sheep',
    labelBn: 'ছাগল ও ভেড়া',
    href: '/products?species=GOAT_SHEEP',
    tag: 'GOAT_SHEEP',
    image: '/images/goat.png',
  },
  {
    label: 'All Products',
    labelBn: 'সকল পণ্য',
    href: '/products',
    tag: null,
    image: null,
  },
  {
    label: 'Wholesale',
    labelBn: 'পাইকারি ও ডিলার',
    href: '/#dealer-contact',
    tag: 'WHOLESALE',
    image: null,
  },
];

export default function SpeciesNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSpecies = searchParams.get('species');
  const isWholesale = searchParams.get('mode') === 'wholesale';

  const isActive = (item: SpeciesItem) => {
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

            return (
              <Link
                key={item.label}
                href={item.href}
                title={item.labelBn}
                className={`group flex items-center justify-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border-[1.5px] border-dashed transition-all duration-200 cursor-pointer ${
                  isWholesaleBtn
                    ? active
                      ? 'bg-amber-100 border-amber-600 ring-2 ring-amber-500/30 shadow-xs'
                      : 'bg-amber-50/60 border-amber-500 hover:border-amber-600 hover:bg-amber-100/70 hover:shadow-xs hover:-translate-y-0.5 shadow-2xs'
                    : active
                    ? 'bg-emerald-50/90 border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-white border-[#5cb82e] hover:border-[#4da322] hover:bg-emerald-50/30 hover:shadow-xs hover:-translate-y-0.5 shadow-2xs'
                }`}
              >
                {/* 4 Species Animal Image Icons */}
                {item.image && (
                  <div
                    className={`relative flex items-center justify-center shrink-0 ${
                      item.tag === 'CATTLE_BUFFALO'
                        ? 'h-4 sm:h-4.5 w-5.5 sm:w-6'
                        : 'w-5 h-5 sm:w-5.5 sm:h-5.5'
                    }`}
                  >
                    <Image
                      src={item.image}
                      alt={item.label}
                      width={item.tag === 'CATTLE_BUFFALO' ? 30 : 22}
                      height={22}
                      className={`object-contain transition-transform duration-200 group-hover:scale-110 ${
                        item.tag === 'CATTLE_BUFFALO'
                          ? 'h-full w-full scale-[1.3] origin-center'
                          : 'h-full w-full'
                      }`}
                    />
                  </div>
                )}

                <span
                  className={`font-bold text-xs sm:text-sm tracking-tight transition-colors whitespace-nowrap ${
                    isWholesaleBtn
                      ? 'text-amber-900 group-hover:text-amber-950'
                      : active
                      ? 'text-[#005d42]'
                      : 'text-slate-800 group-hover:text-slate-950'
                  }`}
                >
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
