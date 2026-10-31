'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  Package,
  ShoppingCart,
  Tags,
  Percent,
  Settings,
  ExternalLink,
  ShieldCheck,
  X,
  LayoutDashboard,
  CheckCircle2,
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const navigationSections = [
    {
      title: 'Catalog & Inventory',
      links: [
        {
          label: 'Products & Pricing',
          href: '/admin/products',
          icon: Package,
          badge: null,
        },
        {
          label: 'Live Orders',
          href: '/admin/orders',
          icon: ShoppingCart,
          badge: null,
        },
        {
          label: 'Categories',
          href: '/admin/categories',
          icon: Tags,
          badge: null,
        },
        {
          label: 'Coupons & VIP',
          href: '/admin/discounts',
          icon: Percent,
          badge: null,
        },
      ],
    },
    {
      title: 'Configuration',
      links: [
        {
          label: 'Store Settings',
          href: '/admin/settings',
          icon: Settings,
          badge: null,
        },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white text-slate-800">
      {/* Brand & Header */}
      <div className="px-5 py-3 border-b border-slate-150 flex items-center justify-between">
        <Link
          href="/admin/products"
          onClick={onClose}
          className="flex items-center gap-3 group"
        >
          <div className="relative w-20 h-12 flex items-center justify-center">
            <Image
              src="/images/logo.png"
              alt="Research Agro Vet Logo"
            fill
              className="object-contain"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-slate-900 text-sm leading-snug tracking-tight truncate group-hover:text-[#005d42] transition-colors">
              Research Agro Vet
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-semibold text-[#005d42] tracking-wider uppercase">
                Admin Control
              </span>
            </div>
          </div>
        </Link>

        {/* Mobile close button */}
        <button
          onClick={onClose}
          type="button"
          className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {navigationSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1.5">
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname?.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-50 text-[#005d42] border border-emerald-200/80 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-[#005d42]' : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate">{link.label}</span>
                    </div>

                    {link.badge && (
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-[#005d42]">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Storefront Link Section */}
        <div className="pt-2">
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Storefront
          </p>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60 border border-slate-200/70 transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
              <span>View Live Store</span>
            </div>
            <span className="text-[10px] text-slate-400 group-hover:text-emerald-600">
              Open ↗
            </span>
          </Link>
        </div>
      </div>

      {/* Footer / Admin User Profile */}
      <div className="p-4 border-t border-slate-200/80 bg-slate-50/80">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#005d42] to-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
              AD
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-800 truncate">
                Administrator
              </span>
              <span className="text-[10px] text-slate-500 font-medium truncate">
                Super Admin Access
              </span>
            </div>
          </div>

          <div
            title="System Status: Connected"
            className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 shrink-0"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 xl:w-72 lg:fixed lg:inset-y-0 lg:z-40 border-r border-slate-200 bg-white">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Slide-Over) */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />

          {/* Drawer Panel */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

