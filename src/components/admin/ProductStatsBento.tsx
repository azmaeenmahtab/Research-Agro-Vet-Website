'use client';

import React from 'react';
import { Pill, Boxes, AlertTriangle, TrendingUp } from 'lucide-react';
import { ProductSummaryStats } from '@/types/admin-product';

interface ProductStatsBentoProps {
  stats: ProductSummaryStats;
}

export default function ProductStatsBento({ stats }: ProductStatsBentoProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Medicines */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4 hover:border-slate-300 transition-colors">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#005d42] flex items-center justify-center shrink-0">
          <Pill className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs text-slate-500 font-medium block">Total Registered</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {stats.totalProducts}
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              Licensed
            </span>
          </div>
        </div>
      </div>

      {/* 2. Active Variants */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4 hover:border-slate-300 transition-colors">
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
          <Boxes className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs text-slate-500 font-medium block">Active SKU Variants</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {stats.activeVariants}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">In Stock</span>
          </div>
        </div>
      </div>

      {/* 3. Out of Stock */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4 hover:border-slate-300 transition-colors">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
          stats.outOfStockVariants > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'
        }`}>
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs text-slate-500 font-medium block">Out of Stock</span>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold tracking-tight ${
              stats.outOfStockVariants > 0 ? 'text-red-600' : 'text-slate-900'
            }`}>
              {stats.outOfStockVariants}
            </span>
            {stats.outOfStockVariants > 0 ? (
              <span className="text-[11px] font-semibold text-red-700 bg-red-50 px-1.5 py-0.5 rounded animate-pulse">
                Needs Reorder
              </span>
            ) : (
              <span className="text-[11px] text-emerald-600 font-medium">All Healthy</span>
            )}
          </div>
        </div>
      </div>

      {/* 4. Average Gross Margin */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4 hover:border-slate-300 transition-colors">
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs text-slate-500 font-medium block">Avg Trade Margin</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {stats.averageMarginPercentage}%
            </span>
            <span className="text-[11px] font-medium text-slate-500">TP vs Selling</span>
          </div>
        </div>
      </div>
    </div>
  );
}
