import Link from 'next/link';
import { Home, ShoppingBag } from 'lucide-react';

export function NotFoundContent() {
  return (
    <div className="flex-1 flex items-center justify-center py-12 sm:py-20 px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Visual Badge & 404 Header */}
        <div className="relative inline-flex flex-col items-center">
          <div className="w-24 h-24 rounded-3xl bg-emerald-50 border-2 border-emerald-200/80 flex items-center justify-center text-emerald-800 shadow-2xs mb-4">
            <span className="font-extrabold text-3xl font-mono text-[#005d42]">404</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            দুঃখিত! কাঙ্ক্ষিত Page পাওয়া যায়নি
          </h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
            আপনি যে লিঙ্কটিতে ক্লিক করেছেন তা হয়তো পরিবর্তিত হয়েছে অথবা ঠিকানাটিতে কোনো ভুল ছিল।
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#005d42] hover:bg-[#004e37] text-white font-bold text-sm shadow-2xs hover:shadow-xs transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm border border-slate-300 shadow-2xs transition-all"
          >
            <ShoppingBag className="w-4 h-4 text-[#005d42]" />
            <span>All Products</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

