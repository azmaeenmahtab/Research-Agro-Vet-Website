'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  RotateCcw,
  Package,
  Clock,
  CheckCircle2,
  PackageCheck,
  Truck,
  CheckCheck,
  XCircle,
  CreditCard,
  BadgeCheck,
  Coins,
  AlertOctagon,
  Layers,
  X,
} from 'lucide-react';
import { Label, ListBox, Select } from '@heroui/react';
import { OrderStatsSummary } from '@/types/admin-order';

interface OrderFilterTabsProps {
  currentStatus: string;
  onStatusChange: (status: string) => void;
  currentPaymentStatus: string;
  onPaymentStatusChange: (status: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  stats: OrderStatsSummary;
  isLoading?: boolean;
}

export default function OrderFilterTabs({
  currentStatus,
  onStatusChange,
  currentPaymentStatus,
  onPaymentStatusChange,
  searchQuery,
  onSearchChange,
  stats,
  isLoading = false,
}: OrderFilterTabsProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const isTypingRef = useRef(false);

  // Sync local search when external prop changes (e.g. reset or cleared from outside)
  useEffect(() => {
    if (!isTypingRef.current) {
      setLocalSearch(searchQuery);
    }
  }, [searchQuery]);

  // Debounced search trigger (350ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      isTypingRef.current = false;
      if (localSearch !== searchQuery) {
        onSearchChange(localSearch);
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [localSearch, searchQuery, onSearchChange]);

  const handleInputChange = (val: string) => {
    isTypingRef.current = true;
    setLocalSearch(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      isTypingRef.current = false;
      onSearchChange(localSearch);
    }
  };

  const handleClearSearch = () => {
    isTypingRef.current = false;
    setLocalSearch('');
    onSearchChange('');
  };

  const hasActiveFilters =
    currentStatus !== 'ALL' || currentPaymentStatus !== 'ALL' || searchQuery.trim() !== '';

  const handleClearFilters = () => {
    isTypingRef.current = false;
    setLocalSearch('');
    onStatusChange('ALL');
    onPaymentStatusChange('ALL');
    onSearchChange('');
  };

  return (
    <div className="bg-white rounded-2xl p-x4 py-3 sm:px-5 border border-slate-200/80 shadow-2xs space-y-3">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-end justify-between gap-3">
        {/* Search Input with Debounce, Enter trigger, and Clear Button */}
        <div className="relative flex-1">
          <Label className="text-[11px] font-bold text-slate-700 block mb-2">
            Search Orders
          </Label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by Order ID (AV-...), Customer Name, Phone, or District..."
              value={localSearch}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-9 pr-24 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-[#005d42] outline-none transition-all placeholder:text-slate-400 font-medium"
            />
            {/* Input Action Indicators */}
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {isLoading && (
                <div className="w-3.5 h-3.5 border-2 border-[#005d42] border-t-transparent rounded-full animate-spin" />
              )}
              {localSearch && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="p-1 hover:bg-slate-200/80 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200 select-none">
                ↵ Enter
              </span>
            </div>
          </div>
        </div>

        {/* HeroUI Select: Order Status Filter */}
        <div className="w-full sm:w-[230px]">
          <Select
            className="w-full"
            placeholder="All Order Statuses"
            selectedKey={currentStatus}
            onSelectionChange={(key) => {
              if (key) onStatusChange(String(key));
            }}
            aria-label="Filter by Order Status"
          >
            <Label className="text-[11px] font-bold text-slate-700 block mb-1">
              Order Status
            </Label>
            <Select.Trigger className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-[#005d42] cursor-pointer">
              <Select.Value className="text-xs truncate font-medium text-slate-800" />
              <Select.Indicator className="text-slate-400 ml-2" />
            </Select.Trigger>
            <Select.Popover className="bg-white rounded-xl shadow-xl border border-slate-200 p-1 min-w-[230px] z-50">
              <ListBox className="outline-none space-y-0.5 max-h-64 overflow-y-auto p-1">
                <ListBox.Item
                  id="ALL"
                  textValue="All Order Statuses"
                  className="px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-[#005d42] cursor-pointer flex items-center justify-between outline-none data-[selected=true]:bg-emerald-100 data-[selected=true]:text-[#005d42] data-[selected=true]:font-bold"
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>All Orders</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-bold">
                      {stats.totalOrders}
                    </span>
                  </div>
                  <ListBox.ItemIndicator />
                </ListBox.Item>

                <ListBox.Item
                  id="PENDING"
                  textValue="Pending Action"
                  className="px-3 py-2 rounded-lg text-xs font-medium text-amber-900 hover:bg-amber-50 cursor-pointer flex items-center justify-between outline-none data-[selected=true]:bg-amber-100 data-[selected=true]:font-bold"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Pending</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold">
                      {stats.pendingCount || 0}
                    </span>
                  </div>
                  <ListBox.ItemIndicator />
                </ListBox.Item>

                <ListBox.Item
                  id="CONFIRMED"
                  textValue="Confirmed"
                  className="px-3 py-2 rounded-lg text-xs font-medium text-blue-900 hover:bg-blue-50 cursor-pointer flex items-center justify-between outline-none data-[selected=true]:bg-blue-100 data-[selected=true]:font-bold"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Confirmed</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 font-bold">
                      {stats.confirmedCount || 0}
                    </span>
                  </div>
                  <ListBox.ItemIndicator />
                </ListBox.Item>

                <ListBox.Item
                  id="PACKED"
                  textValue="Packed"
                  className="px-3 py-2 rounded-lg text-xs font-medium text-indigo-900 hover:bg-indigo-50 cursor-pointer flex items-center justify-between outline-none data-[selected=true]:bg-indigo-100 data-[selected=true]:font-bold"
                >
                  <div className="flex items-center gap-2">
                    <PackageCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Packed</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800 font-bold">
                      {stats.packedCount || 0}
                    </span>
                  </div>
                  <ListBox.ItemIndicator />
                </ListBox.Item>

                <ListBox.Item
                  id="SHIPPED"
                  textValue="Shipped"
                  className="px-3 py-2 rounded-lg text-xs font-medium text-sky-900 hover:bg-sky-50 cursor-pointer flex items-center justify-between outline-none data-[selected=true]:bg-sky-100 data-[selected=true]:font-bold"
                >
                  <div className="flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>Shipped</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-sky-100 text-sky-800 font-bold">
                      {stats.shippedCount || 0}
                    </span>
                  </div>
                  <ListBox.ItemIndicator />
                </ListBox.Item>

                <ListBox.Item
                  id="DELIVERED"
                  textValue="Delivered"
                  className="px-3 py-2 rounded-lg text-xs font-medium text-emerald-900 hover:bg-emerald-50 cursor-pointer flex items-center justify-between outline-none data-[selected=true]:bg-emerald-100 data-[selected=true]:font-bold"
                >
                  <div className="flex items-center gap-2">
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Delivered</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      {stats.deliveredCount || 0}
                    </span>
                  </div>
                  <ListBox.ItemIndicator />
                </ListBox.Item>

                <ListBox.Item
                  id="RETURNED"
                  textValue="Returned"
                  className="px-3 py-2 rounded-lg text-xs font-medium text-rose-900 hover:bg-rose-50 cursor-pointer flex items-center justify-between outline-none data-[selected=true]:bg-rose-100 data-[selected=true]:font-bold"
                >
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>Returned</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800 font-bold">
                      {stats.returnedCount || 0}
                    </span>
                  </div>
                  <ListBox.ItemIndicator />
                </ListBox.Item>

                <ListBox.Item
                  id="CANCELLED"
                  textValue="Cancelled"
                  className="px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer flex items-center justify-between outline-none data-[selected=true]:bg-slate-200 data-[selected=true]:font-bold"
                >
                  <div className="flex items-center gap-2">
                    <XCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Cancelled</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-bold">
                      {stats.cancelledCount || 0}
                    </span>
                  </div>
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
        </div>

        {/* HeroUI Select: Payment Status Filter */}
        <div className="w-full sm:w-[230px]">
          <Select
            className="w-full"
            placeholder="All Payment Statuses"
            selectedKey={currentPaymentStatus}
            onSelectionChange={(key) => {
              if (key) onPaymentStatusChange(String(key));
            }}
            aria-label="Filter by Payment Status"
          >
            <Label className="text-[11px] font-bold text-slate-700 block mb-1">
              Payment Status
            </Label>
            <Select.Trigger className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-[#005d42] cursor-pointer">
              <Select.Value className="text-xs truncate font-medium text-slate-800" />
              <Select.Indicator className="text-slate-400 ml-2" />
            </Select.Trigger>
            <Select.Popover className="bg-white rounded-xl shadow-xl border border-slate-200 p-1 min-w-[230px] z-50">
              <ListBox className="outline-none space-y-0.5 max-h-64 overflow-y-auto p-1">
                <ListBox.Item
                  id="ALL"
                  textValue="All Payment Statuses"
                  className="px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-[#005d42] cursor-pointer flex items-center justify-between outline-none data-[selected=true]:bg-emerald-100 data-[selected=true]:text-[#005d42] data-[selected=true]:font-bold"
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                    <span>All Payments</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-bold">
                      {stats.totalOrders}
                    </span>
                  </div>
                  <ListBox.ItemIndicator />
                </ListBox.Item>

                <ListBox.Item
                  id="PAID"
                  textValue="Paid Full"
                  className="px-3 py-2 rounded-lg text-xs font-medium text-emerald-900 hover:bg-emerald-50 cursor-pointer flex items-center justify-between outline-none data-[selected=true]:bg-emerald-100 data-[selected=true]:font-bold"
                >
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Paid (Full)</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      {stats.paidCount ?? stats.paidOrdersCount ?? 0}
                    </span>
                  </div>
                  <ListBox.ItemIndicator />
                </ListBox.Item>

                <ListBox.Item
                  id="PARTIAL"
                  textValue="Partial Paid"
                  className="px-3 py-2 rounded-lg text-xs font-medium text-amber-900 hover:bg-amber-50 cursor-pointer flex items-center justify-between outline-none data-[selected=true]:bg-amber-100 data-[selected=true]:font-bold"
                >
                  <div className="flex items-center gap-2">
                    <Coins className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Partial Advance</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold">
                      {stats.partialCount || 0}
                    </span>
                  </div>
                  <ListBox.ItemIndicator />
                </ListBox.Item>

                <ListBox.Item
                  id="UNPAID"
                  textValue="Unpaid (COD)"
                  className="px-3 py-2 rounded-lg text-xs font-medium text-orange-900 hover:bg-orange-50 cursor-pointer flex items-center justify-between outline-none data-[selected=true]:bg-orange-100 data-[selected=true]:font-bold"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                    <span>Unpaid (COD)</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-orange-100 text-orange-800 font-bold">
                      {stats.unpaidCount || 0}
                    </span>
                  </div>
                  <ListBox.ItemIndicator />
                </ListBox.Item>

                <ListBox.Item
                  id="REFUNDED"
                  textValue="Refunded"
                  className="px-3 py-2 rounded-lg text-xs font-medium text-purple-900 hover:bg-purple-50 cursor-pointer flex items-center justify-between outline-none data-[selected=true]:bg-purple-100 data-[selected=true]:font-bold"
                >
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>Refunded</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800 font-bold">
                      {stats.refundedCount || 0}
                    </span>
                  </div>
                  <ListBox.ItemIndicator />
                </ListBox.Item>

                <ListBox.Item
                  id="FAILED"
                  textValue="Failed"
                  className="px-3 py-2 rounded-lg text-xs font-medium text-rose-900 hover:bg-rose-50 cursor-pointer flex items-center justify-between outline-none data-[selected=true]:bg-rose-100 data-[selected=true]:font-bold"
                >
                  <div className="flex items-center gap-2">
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>Failed / Dropped</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800 font-bold">
                      {stats.failedCount || 0}
                    </span>
                  </div>
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
        </div>

        {/* Clear Filters Reset Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="px-3 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-all self-end"
            title="Reset all search and status filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
