'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, ShoppingBag, MessageCircle } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

export default function Navbar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const { getItemCount, getCartSubtotal, openCartDrawer } = useCartStore();

  useEffect(() => setMounted(true), []);

  const handleSearch = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/products?q=${encodeURIComponent(query.trim())}`);
  };

  // Use 0 on server & first render to avoid hydration mismatch
  const count = mounted ? getItemCount() : 0;
  const subtotal = mounted ? getCartSubtotal() : 0;

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 ">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="relative w-20 h-12 shrink-0 flex items-center justify-center">
            <Image
              src="/images/logo.png?v=3"
              alt="Research Agro Vet"
              fill
              className="object-contain"
              priority
              unoptimized
            />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg text-emerald-800 leading-tight">Research Agro Vet</span>
            <span className="text-[10px] text-slate-500 font-medium tracking-tight">Medicated Veterinary Feed Premix</span>
          </div>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex items-center relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="পণ্যের নাম (e.g. Re-Cal)"
            className="w-full pl-9 pr-20 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-emerald-600 focus:outline-none transition-all"
          />
          <button type="submit" className="absolute right-0 top-0 bottom-0 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold transition-colors">
            SEARCH
          </button>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/track-order" className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors">
            <span>অর্ডার ট্র্যাক</span>
          </Link>

          <a
            href="https://wa.me/8801711234567?text=আসসালামু%20আলাইকুম,%20ফিড%20প্রিমিক্স%20ও%20খামার%20পরামর্শের%20জন্য%20যোগাযোগ%20করছি।"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>পরামর্শ</span>
          </a>

          {/* Cart Button */}
          <button
            onClick={openCartDrawer}
            className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>কার্ট ({count})</span>
            <span className="hidden xs:inline border-l border-amber-500 pl-1.5">৳{subtotal.toLocaleString('bn-BD')}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
