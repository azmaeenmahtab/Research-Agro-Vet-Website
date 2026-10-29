'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, ShoppingCart, Tags, Settings, ExternalLink, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

export default function AdminNavbar() {
  const pathname = usePathname();

  const navLinks = [
    { label: 'Products & Pricing', href: '/admin/products', icon: Package },
    { label: 'Live Orders', href: '/admin/orders', icon: ShoppingCart },
    { label: 'Categories', href: '/admin/categories', icon: Tags },
    { label: 'Coupons & VIP Discounts', href: '/admin/discounts', icon: Tags },
    { label: 'Store Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-xs">
    

      {/* Main Admin Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/admin/products" className="flex items-center gap-3">
              <Image src="/images/logo.png" alt="Logo" width={50} height={50} />
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 text-base leading-tight">
                  Research Agro Vet
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                  Admin CMS Portal
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-900 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#005d42]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-900">Administrator</span>
              <span className="text-[11px] text-slate-500">Super Admin Access</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 font-semibold text-sm">
              AD
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
