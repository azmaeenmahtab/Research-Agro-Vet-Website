'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ShoppingBag,
  CircleDollarSign,
  CheckCircle2,
  CheckCheck,
  Clock,
  Printer,
  Download,
  X,
  CreditCard,
  ChevronDown,
  Truck,
  Package,
  RotateCcw,
  XCircle,
  AlertOctagon,
  BadgeCheck,
  Coins,
  AlertCircle,
} from 'lucide-react';
import { RangeCalendar } from '@heroui/react';
import { parseDate, today, getLocalTimeZone, DateValue } from '@internationalized/date';
import { OrderStatsSummary } from '@/types/admin-order';

interface OrderStatsOverviewProps {
  stats: OrderStatsSummary;
  currentRange: string;
  onRangeSelect: (range: string, startDate?: string, endDate?: string) => void;
  startDate?: string;
  endDate?: string;
  onPrintAllInvoices: () => void;
  onExportCsv: () => void;
  filteredOrdersCount: number;
  onOpenManualOrder?: () => void;
  currentStatus?: string;
  onStatusSelect?: (status: string) => void;
  currentPaymentStatus?: string;
  onPaymentStatusSelect?: (paymentStatus: string) => void;
}

export default function OrderStatsOverview({
  stats,
  currentRange,
  onRangeSelect,
  startDate,
  endDate,
  onPrintAllInvoices,
  onExportCsv,
  filteredOrdersCount,
  onOpenManualOrder,
  currentStatus = 'ALL',
  onStatusSelect,
  currentPaymentStatus = 'ALL',
  onPaymentStatusSelect,
}: OrderStatsOverviewProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Close calendar popover on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Quick Range Presets
  const handlePreset = (preset: string) => {
    setIsCalendarOpen(false);
    const now = new Date();

    if (preset === 'LIFETIME') {
      onRangeSelect('LIFETIME', undefined, undefined);
      return;
    }

    if (preset === 'TODAY') {
      const todayStr = now.toISOString().split('T')[0];
      onRangeSelect('TODAY', todayStr, todayStr);
      return;
    }

    if (preset === 'YESTERDAY') {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().split('T')[0];
      onRangeSelect('YESTERDAY', yStr, yStr);
      return;
    }

    if (preset === 'WEEK') {
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      onRangeSelect('WEEK', start.toISOString().split('T')[0], now.toISOString().split('T')[0]);
      return;
    }

    if (preset === 'MONTH') {
      const start = new Date(now);
      start.setDate(start.getDate() - 30);
      onRangeSelect('MONTH', start.toISOString().split('T')[0], now.toISOString().split('T')[0]);
      return;
    }

    if (preset === 'THIS_MONTH') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      onRangeSelect('THIS_MONTH', start.toISOString().split('T')[0], now.toISOString().split('T')[0]);
      return;
    }
  };

  // Convert string dates to Calendar DateValue
  const getInitialCalendarRange = () => {
    try {
      if (startDate && endDate) {
        return {
          start: parseDate(startDate),
          end: parseDate(endDate),
        };
      }
    } catch (e) {
      // Fallback
    }
    const t = today(getLocalTimeZone());
    return {
      start: t.subtract({ days: 7 }),
      end: t,
    };
  };

  const [selectedRange, setSelectedRange] = useState<{
    start: DateValue;
    end: DateValue;
  }>(getInitialCalendarRange());

  const handleApplyCalendarRange = () => {
    if (selectedRange && selectedRange.start && selectedRange.end) {
      const startStr = selectedRange.start.toString();
      const endStr = selectedRange.end.toString();
      onRangeSelect('CUSTOM', startStr, endStr);
      setIsCalendarOpen(false);
    }
  };

  const handleToggleCalendar = () => {
    setIsCalendarOpen((prev) => !prev);
  };

  const getRangeDisplayText = () => {
    if (currentRange === 'LIFETIME') return 'Lifetime';
    if (currentRange === 'TODAY') return 'Today';
    if (currentRange === 'YESTERDAY') return 'Yesterday';
    if (currentRange === 'WEEK') return 'Last 7 Days';
    if (currentRange === 'MONTH') return 'Last 30 Days';
    if (currentRange === 'THIS_MONTH') return 'This Month';
    if (startDate && endDate) {
      return `${startDate} ~ ${endDate}`;
    }
    return 'Custom Range';
  };

  // Status Cards config
  const orderStatusCards = [
    {
      id: 'PENDING',
      label: 'Pending',
      count: stats.pendingCount || 0,
      icon: Clock,
      color: 'text-amber-700 bg-amber-50/70 border-amber-200/80',
      activeRing: 'ring-2 ring-amber-500 border-amber-500 bg-amber-50',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'CONFIRMED',
      label: 'Confirmed',
      count: stats.confirmedCount || 0,
      icon: CheckCircle2,
      color: 'text-blue-700 bg-blue-50/70 border-blue-200/80',
      activeRing: 'ring-2 ring-blue-500 border-blue-500 bg-blue-50',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'PACKED',
      label: 'Packed',
      count: stats.packedCount || 0,
      icon: Package,
      color: 'text-indigo-700 bg-indigo-50/70 border-indigo-200/80',
      activeRing: 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50',
      badgeColor: 'bg-indigo-100 text-indigo-800',
    },
    {
      id: 'SHIPPED',
      label: 'Shipped',
      count: stats.shippedCount || 0,
      icon: Truck,
      color: 'text-sky-700 bg-sky-50/70 border-sky-200/80',
      activeRing: 'ring-2 ring-sky-500 border-sky-500 bg-sky-50',
      badgeColor: 'bg-sky-100 text-sky-800',
    },
    {
      id: 'DELIVERED',
      label: 'Delivered',
      count: stats.deliveredCount || 0,
      icon: CheckCheck,
      color: 'text-emerald-700 bg-emerald-50/70 border-emerald-200/80',
      activeRing: 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'RETURNED',
      label: 'Returned',
      count: stats.returnedCount || 0,
      icon: RotateCcw,
      color: 'text-rose-700 bg-rose-50/70 border-rose-200/80',
      activeRing: 'ring-2 ring-rose-500 border-rose-500 bg-rose-50',
      badgeColor: 'bg-rose-100 text-rose-800',
    },
    {
      id: 'CANCELLED',
      label: 'Cancelled',
      count: stats.cancelledCount || 0,
      icon: XCircle,
      color: 'text-slate-700 bg-slate-50/70 border-slate-200/80',
      activeRing: 'ring-2 ring-slate-500 border-slate-500 bg-slate-100',
      badgeColor: 'bg-slate-200 text-slate-800',
    },
  ];

  // Payment Status Cards config
  const paymentStatusCards = [
    {
      id: 'PAID',
      label: 'Paid (Full)',
      count: stats.paidCount ?? stats.paidOrdersCount ?? 0,
      icon: BadgeCheck,
      color: 'text-emerald-700 bg-emerald-50/70 border-emerald-200/80',
      activeRing: 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'PARTIAL',
      label: 'Partial Paid',
      count: stats.partialCount || 0,
      icon: Coins,
      color: 'text-amber-700 bg-amber-50/70 border-amber-200/80',
      activeRing: 'ring-2 ring-amber-500 border-amber-500 bg-amber-50',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'UNPAID',
      label: 'Unpaid (COD)',
      count: stats.unpaidCount || 0,
      icon: Clock,
      color: 'text-orange-700 bg-orange-50/70 border-orange-200/80',
      activeRing: 'ring-2 ring-orange-500 border-orange-500 bg-orange-50',
      badgeColor: 'bg-orange-100 text-orange-800',
    },
    {
      id: 'REFUNDED',
      label: 'Refunded',
      count: stats.refundedCount || 0,
      icon: RotateCcw,
      color: 'text-purple-700 bg-purple-50/70 border-purple-200/80',
      activeRing: 'ring-2 ring-purple-500 border-purple-500 bg-purple-50',
      badgeColor: 'bg-purple-100 text-purple-800',
    },
    {
      id: 'FAILED',
      label: 'Failed / Dropped',
      count: stats.failedCount || 0,
      icon: AlertOctagon,
      color: 'text-rose-700 bg-rose-50/70 border-rose-200/80',
      activeRing: 'ring-2 ring-rose-500 border-rose-500 bg-rose-50',
      badgeColor: 'bg-rose-100 text-rose-800',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Bar: Financial Metrics + Action Tools */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        {/* Left: Gross Sales & Total Orders Summary */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80">
            <ShoppingBag className="w-4 h-4 text-[#005d42]" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                Total Orders
              </span>
              <span className="text-lg font-black text-slate-900 leading-tight">
                {stats.totalOrders}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50/80 border border-emerald-200/80">
            <CircleDollarSign className="w-4 h-4 text-[#005d42]" />
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                Gross Sales
              </span>
              <span className="text-lg font-black text-[#005d42] leading-tight">
                ৳{(stats.totalRevenue || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Range & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onPrintAllInvoices}
            disabled={filteredOrdersCount === 0}
            className="px-3.5 py-2 rounded-xl bg-[#005d42] hover:bg-[#004e37] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            title="Batch print delivery invoices or thermal slips for all matching orders"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipts ({filteredOrdersCount})</span>
          </button>

          <button
            type="button"
            onClick={onExportCsv}
            disabled={filteredOrdersCount === 0}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all disabled:opacity-50"
            title="Download CSV for Excel or Courier Bulk Upload"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Date Range Presets Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => handlePreset('LIFETIME')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              currentRange === 'LIFETIME'
                ? 'bg-[#005d42] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Lifetime (All)
          </button>

          <button
            type="button"
            onClick={() => handlePreset('TODAY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              currentRange === 'TODAY'
                ? 'bg-[#005d42] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Today
          </button>

          <button
            type="button"
            onClick={() => handlePreset('YESTERDAY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              currentRange === 'YESTERDAY'
                ? 'bg-[#005d42] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Yesterday
          </button>

          <button
            type="button"
            onClick={() => handlePreset('WEEK')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              currentRange === 'WEEK'
                ? 'bg-[#005d42] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Last 7 Days
          </button>

          <button
            type="button"
            onClick={() => handlePreset('MONTH')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              currentRange === 'MONTH'
                ? 'bg-[#005d42] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Last 30 Days
          </button>

          <button
            type="button"
            onClick={() => handlePreset('THIS_MONTH')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              currentRange === 'THIS_MONTH'
                ? 'bg-[#005d42] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            This Month
          </button>
        </div>

        {/* HeroUI Range Calendar Picker Popover */}
        <div className="relative" ref={calendarRef}>
          <button
            type="button"
            onClick={handleToggleCalendar}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 border transition-all ${
              currentRange === 'CUSTOM'
                ? 'bg-emerald-50 text-[#005d42] border-[#005d42]'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <CalendarIcon className="w-4 h-4 text-[#005d42]" />
            <span>{getRangeDisplayText()}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isCalendarOpen && (
            <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-[#005d42]" />
                  <span>Select Date Range</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsCalendarOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex justify-center">
                <RangeCalendar
                  aria-label="Filter Orders Date Range"
                  value={selectedRange as any}
                  onChange={(range: any) => setSelectedRange(range)}
                  firstDayOfWeek="mon"
                >
                  <RangeCalendar.Header>
                    <RangeCalendar.Heading />
                    <RangeCalendar.NavButton slot="previous" />
                    <RangeCalendar.NavButton slot="next" />
                  </RangeCalendar.Header>
                  <RangeCalendar.Grid>
                    <RangeCalendar.GridHeader>
                      {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
                    </RangeCalendar.GridHeader>
                    <RangeCalendar.GridBody>
                      {(date) => <RangeCalendar.Cell date={date} />}
                    </RangeCalendar.GridBody>
                  </RangeCalendar.Grid>
                </RangeCalendar>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 mt-3">
                <span className="text-[11px] font-mono text-slate-500 font-medium">
                  {selectedRange?.start?.toString()} → {selectedRange?.end?.toString()}
                </span>
                <button
                  type="button"
                  onClick={handleApplyCalendarRange}
                  className="px-4 py-1.5 rounded-xl bg-[#005d42] text-white hover:bg-[#004e37] text-xs font-bold shadow-xs transition-colors"
                >
                  Apply Range
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 1: ALL ORDER STATUS CARDS */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-[#005d42]" />
            Order Statuses (Fulfillment Lifecycle)
          </span>
          {currentStatus !== 'ALL' && onStatusSelect && (
            <button
              type="button"
              onClick={() => onStatusSelect('ALL')}
              className="text-[11px] font-bold text-[#005d42] hover:underline"
            >
              Reset to All Orders
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {orderStatusCards.map((card) => {
            const Icon = card.icon;
            const isSelected = currentStatus === card.id;

            return (
              <button
                key={card.id}
                type="button"
                onClick={() => {
                  if (onStatusSelect) {
                    onStatusSelect(isSelected ? 'ALL' : card.id);
                  }
                }}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected ? card.activeRing : `${card.color} hover:shadow-xs`
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold truncate">{card.label}</span>
                  <Icon className="w-3.5 h-3.5 opacity-80 shrink-0" />
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-black tabular-nums">{card.count}</span>
                  {isSelected && (
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-white/80 shadow-2xs">
                      Active
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: ALL PAYMENT STATUS CARDS */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-[#005d42]" />
            Payment Statuses (Accounts & Settlements)
          </span>
          {currentPaymentStatus !== 'ALL' && onPaymentStatusSelect && (
            <button
              type="button"
              onClick={() => onPaymentStatusSelect('ALL')}
              className="text-[11px] font-bold text-[#005d42] hover:underline"
            >
              Reset to All Payments
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {paymentStatusCards.map((card) => {
            const Icon = card.icon;
            const isSelected = currentPaymentStatus === card.id;

            return (
              <button
                key={card.id}
                type="button"
                onClick={() => {
                  if (onPaymentStatusSelect) {
                    onPaymentStatusSelect(isSelected ? 'ALL' : card.id);
                  }
                }}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected ? card.activeRing : `${card.color} hover:shadow-xs`
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold truncate">{card.label}</span>
                  <Icon className="w-3.5 h-3.5 opacity-80 shrink-0" />
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-black tabular-nums">{card.count}</span>
                  {isSelected && (
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-white/80 shadow-2xs">
                      Active
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
