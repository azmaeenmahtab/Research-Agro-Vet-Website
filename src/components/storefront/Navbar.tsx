'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingBag,
  MessageCircle,
  Truck,
  Menu,
  X,
  Home,
  Package,
  Store,
  ChevronRight,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { WhatsAppIcon } from './HeroSection';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { getItemCount, getCartSubtotal, openCartDrawer } = useCartStore();

  useEffect(() => {
    setMounted(true);
    useCartStore.getState().syncWithServer();
    const sp = new URLSearchParams(window.location.search);
    const q = sp.get('q') || sp.get('search');
    if (q) setQuery(q);
  }, []);

  // Close mobile navigation drawer whenever route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleSearch = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?q=${encodeURIComponent(query.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  // Use 0 on server & first render to avoid hydration mismatch
  const count = mounted ? getItemCount() : 0;
  const subtotal = mounted ? getCartSubtotal() : 0;

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3 sm:gap-4">
          {/* Left: Mobile Hamburger + Brand */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Mobile Hamburger Button (On the left side of logo) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="মোবাইল মেনু খুলুন"
              className="flex md:hidden p-1.5 rounded-lg text-slate-700 hover:text-emerald-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Brand */}
            <Link href="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              <div className="relative w-11 sm:w-20 h-11 sm:h-12 shrink-0 flex items-center justify-center">
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
                <span className="font-extrabold text-sm sm:text-lg text-emerald-800 leading-tight">
                  Research Agro Vet
                </span>
                <span className="text-[9px] sm:text-[10px] text-slate-500 font-medium tracking-tight">
                  Dairy, Poultry and Fisheries
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex items-center relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="পণ্যের নাম (e.g. Re-Cal)"
              className="w-full pl-9 pr-20 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-emerald-600 focus:outline-none transition-all"
            />
            <button
              type="submit"
              className="absolute right-0 top-0 bottom-0 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-r-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              SEARCH
            </button>
          </form>

          {/* Actions: Track, Hotline, Cart */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Truck Button (Track Order) */}
            <Link
              prefetch={false}
              href="/track-order"
              className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-emerald-800 hover:bg-slate-100 transition-colors"
              title="আপনার অর্ডার ট্র্যাক করুন"
            >
              <Truck className="w-4.5 h-4.5 text-emerald-700" />
              <span className="hidden md:inline">অর্ডার ট্র্যাক</span>
            </Link>

            {/* Desktop WhatsApp Advice Button */}
            <a
              href="https://wa.me/8801716019731?text=আসসালামু%20আলাইকুম,%20ফিড%20প্রিমিক্স%20ও%20খামার%20পরামর্শের%20জন্য%20যোগাযোগ%20করছি।"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors"
            >
              <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
              <span>পরামর্শ</span>
            </a>

            {/* Mobile Cart Button: ONLY Shopping Bag Icon and Number */}
            <button
              type="button"
              onClick={openCartDrawer}
              aria-label={`কার্ট (${count})`}
              className="flex sm:hidden items-center gap-1 px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="font-mono font-black text-xs leading-none">({count})</span>
            </button>

            {/* Desktop Cart Button */}
            <button
              type="button"
              onClick={openCartDrawer}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>কার্ট ({count})</span>
              <span className="hidden lg:inline border-l border-amber-500 pl-1.5">
                ৳{subtotal.toLocaleString('bn-BD')}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Smooth Mobile Navigation Drawer Modal */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop with Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            {/* Slide-in Drawer from Left with zero overshoot */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 300, bounce: 0 }}
              className="absolute inset-y-0 left-0 w-[74%] sm:w-[80%] max-w-[290px] sm:max-w-xs bg-white shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2"
                >
                  <div className="relative w-10 h-8 shrink-0">
                    <Image
                      src="/images/logo.png?v=3"
                      alt="Research Agro Vet"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  {/* <div className="flex flex-col">
                    <span className="font-extrabold text-xs sm:text-sm text-emerald-800 leading-tight">
                      Research Agro Vet
                    </span>
                    
                  </div> */}
                </Link>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="মেনু বন্ধ করুন"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              

              {/* Scrollable Navigation Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Main Links */}
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2 block">
                    প্রধান পেজসমূহ
                  </span>
                  <Link
                    href="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-800 hover:text-emerald-700 hover:bg-emerald-50/70 transition-colors"
                  >
                    <Home className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>হোমপেজ</span>
                  </Link>
                  <Link
                    href="/products"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-800 hover:text-emerald-700 hover:bg-emerald-50/70 transition-colors"
                  >
                    <Package className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>সকল পণ্য ক্যাটালগ</span>
                  </Link>
                  <Link
                    href="/track-order"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-800 hover:text-emerald-700 hover:bg-emerald-50/70 transition-colors"
                  >
                    <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>অর্ডার ট্র্যাক করুন</span>
                  </Link>
                  <Link
                    href="/wholesale"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-amber-900 bg-amber-50/80 border border-amber-200/70 hover:bg-amber-100/80 transition-colors"
                  >
                    <Store className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>পাইকারি ও ডিলার পোর্টাল</span>
                  </Link>
                </div>

                {/* Categories */}
                <div className="space-y-1 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2 block">
                    খামার ও প্রাণী ক্যাটাগরি
                  </span>
                  <Link
                    href="/products?species=CATTLE_BUFFALO"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <span>গরু ও মহিষ (Cattle & Buffalo)</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                  <Link
                    href="/products?species=POULTRY"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <span>পোল্ট্রি ও হাঁস (Poultry)</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                  <Link
                    href="/products?species=AQUA"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <span>মৎস্য ও একুয়া (Aquaculture)</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                  <Link
                    href="/products?species=GOAT_SHEEP"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <span>ছাগল ও ভেড়া (Goat & Sheep)</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                </div>

                {/* Customer Policy */}
                <div className="space-y-1 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2 block">
                    পলিসি ও নিয়মাবলী
                  </span>
                  <Link
                    href="/refund"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>রিটার্ন ও রিফান্ড নীতি</span>
                  </Link>
                </div>
              </div>

              {/* Drawer Footer Hotline & WhatsApp */}
              <div className="p-3.5 bg-slate-50 border-t border-slate-100 space-y-2">
                <a
                  href="https://wa.me/8801716019731?text=আসসালামু%20আলাইকুম,%20ফিড%20প্রিমিক্স%20ও%20খামার%20পরামর্শের%20জন্য%20যোগাযোগ%20করছি।"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-2xs"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
                  <span>হোয়াটসঅ্যাপে পরামর্শ নিন</span>
                </a>
                <a
                  href="tel:01716019731"
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                  <span>হটলাইন: 01716019731</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
