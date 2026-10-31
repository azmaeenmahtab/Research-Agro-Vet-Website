'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ExternalLink, ShieldCheck, Bell } from 'lucide-react';

interface AdminHeaderProps {
  onOpenMobileSidebar: () => void;
}

export default function AdminHeader({ onOpenMobileSidebar }: AdminHeaderProps) {
  const pathname = usePathname();

  // Determine contextual title from pathname
  const getPageTitle = () => {
    if (pathname.includes('/admin/products')) return 'Product & Inventory Management';
    if (pathname.includes('/admin/orders')) return 'Live Orders & Invoicing';
    if (pathname.includes('/admin/categories')) return 'Therapeutic Categories';
    if (pathname.includes('/admin/discounts')) return 'Coupons & VIP Discounts';
    if (pathname.includes('/admin/settings')) return 'Store & System Settings';
    return 'Admin Dashboard';
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 xl:px-10 flex items-center justify-between">
      {/* Left: Mobile Toggle & Page Context */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
            <span>Admin</span>
            <span>/</span>
            <span className="text-[#005d42] font-bold">Portal</span>
          </div>
          <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-tight">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Right: Quick actions & profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all hover:border-emerald-300 hover:text-[#005d42]"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Live Store</span>
        </Link>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-[#005d42]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>System Online</span>
        </div>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
            AD
          </div>
        </div>
      </div>
    </header>
  );
}

