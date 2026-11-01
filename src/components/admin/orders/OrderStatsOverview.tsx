'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ShoppingBag,
  CircleDollarSign,
  TrendingUp,
  CheckCircle2,
  Clock,
  Printer,
  Download,
  X,
  CreditCard,
  ChevronDown,
  Layers,
  Sparkles,
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

  // State for HeroUI RangeCalendar selection
  const nowCalendar = today(getLocalTimeZone());
  const [selectedRange, setSelectedRange] = useState<any>({
    start: startDate ? parseDate(startDate) : nowCalendar,
    end: endDate ? parseDate(endDate) : nowCalendar,
  });

  const handleApplyCalendarRange = () => {
    if (selectedRange?.start && selectedRange?.end) {
      const startStr = selectedRange.start.toString();
      const endStr = selectedRange.end.toString();
      onRangeSelect('CUSTOM', startStr, endStr);
      setIsCalendarOpen(false);
    }
  };

  // Formatted date range label for UI
  const getRangeDisplayText = () => {
    if (currentRange === 'LIFETIME') return 'Lifetime All Orders';
    if (currentRange === 'TODAY') return 'Today (Last 24 Hours)';
    if (currentRange === 'YESTERDAY') return 'Yesterday';
    if (currentRange === 'WEEK') return 'Last 7 Days (Past Week)';
    if (currentRange === 'MONTH') return 'Last 30 Days (Past Month)';
    if (currentRange === 'THIS_MONTH') return 'This Month';
    if (startDate && endDate) {
      return `${startDate} → ${endDate}`;
    }
    return 'Custom Date Range';
  };

  // Completion calculation
  const completionRate =
    stats.totalOrders > 0
      ? Math.round((stats.deliveredCount / stats.totalOrders) * 100)
      : 0;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-5">
      {/* Top Header: Title, Presets & Batch Print Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-6 bg-[#005d42] rounded-full inline-block"></span>
            <h2 className="font-bold text-slate-900 text-lg tracking-tight">
              Order Analytics & Sales Performance
            </h2>
          </div>
          
        </div>

        {/* Action Buttons: Batch Print Receipts & Export CSV */}
        <div className="flex items-center gap-2.5 flex-wrap">
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

      {/* Date Range Selection Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => handlePreset('LIFETIME')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
              currentRange === 'LIFETIME'
                ? 'bg-[#005d42] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>Lifetime (All)</span>
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

        {/* HeroUI Range Calendar Picker Popover Button */}
        <div className="relative" ref={calendarRef}>
          <button
            type="button"
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
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

          {/* Calendar Popover */}
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

              {/* HeroUI Built-in Range Calendar Component */}
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

      {/* Bento Grid Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1: Total Orders */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold">Orders in Range</span>
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {stats.totalOrders}
          </p>
          
        </div>

        {/* Card 2: Range Revenue */}
        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-[11px] font-bold">Gross Sales</span>
            <CircleDollarSign className="w-4 h-4 text-[#005d42]" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-[#005d42]">
            ৳{(stats.totalRevenue || 0).toLocaleString()}
          </p>
          
        </div>

        {/* Card 3: Average Order Value */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold">Average Order (AOV)</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900">
            ৳{(stats.averageOrderValue || 0).toLocaleString()}
          </p>
          
        </div>

        {/* Card 4: Delivered Fulfillment */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold">Delivered Success</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-emerald-700">
            {stats.deliveredCount}
          </p>
         
        </div>

        {/* Card 5: Pending Confirmation */}
        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/70 space-y-1">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-[11px] font-bold">Pending Action</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-amber-800">
            {stats.pendingCount}
          </p>
          
        </div>

        {/* Card 6: Payment Methods */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold">Payment Settlement</span>
            <CreditCard className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-sm font-extrabold text-slate-900 pt-1">
            <span className="text-emerald-700">{stats.paidOrdersCount || 0} Paid</span>
            <span className="text-slate-300 mx-1.5">•</span>
            <span className="text-slate-700">{stats.codOrdersCount || 0} COD</span>
          </div>
          
        </div>
      </div>
    </div>
  );
}
