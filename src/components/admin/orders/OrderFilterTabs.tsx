'use client';

import React from 'react';
import { Search, Filter, ShoppingBag } from 'lucide-react';
import { OrderStatsSummary } from '@/types/admin-order';

interface OrderFilterTabsProps {
  currentStatus: string;
  onStatusChange: (status: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  stats: OrderStatsSummary;
}

export default function OrderFilterTabs({
  currentStatus,
  onStatusChange,
  searchQuery,
  onSearchChange,
  stats,
}: OrderFilterTabsProps) {
  const tabs = [
    { id: 'ALL', label: 'All Orders', count: stats.totalOrders },
    { id: 'PENDING', label: 'Pending', count: stats.pendingCount, isAlert: true },
    { id: 'CONFIRMED', label: 'Confirmed', count: stats.confirmedCount },
    { id: 'SHIPPED', label: 'Shipped', count: stats.shippedCount },
    { id: 'DELIVERED', label: 'Delivered', count: stats.deliveredCount },
    { id: 'CANCELLED', label: 'Cancelled', count: stats.cancelledCount },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-4">
      {/* Title & Today's Stat Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-6 bg-[#005d42] rounded-full inline-block"></span>
            <h2 className="font-bold text-slate-900 text-lg tracking-tight">
              Live Orders & Tele-Confirmation Dashboard
            </h2>
          </div>
          
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl font-medium border border-slate-200/70">
            Today's Orders: <strong className="text-slate-900 font-bold">{stats.todayCount}</strong>
          </span>
          <span className="text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl font-medium border border-emerald-200/80">
            Today's Sales: <strong className="font-bold">৳{stats.todayRevenue.toLocaleString()}</strong>
          </span>
        </div>
      </div>

      {/* Search Input & Status Pills */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-3 border-t border-slate-100">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by Order ID (AV-...), Customer Name, Phone, or District..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-[#005d42] outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {tabs.map((tab) => {
            const isActive = currentStatus === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onStatusChange(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  isActive
                    ? 'bg-[#005d42] text-white border-[#005d42] shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200/70 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {tab.isAlert && tab.count > 0 && !isActive && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                )}
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : tab.isAlert && tab.count > 0
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200/70 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

