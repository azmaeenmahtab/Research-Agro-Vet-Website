'use client';

import React from 'react';
import { Search, Plus, Download, ChevronsUpDown } from 'lucide-react';
import { ProductStatus } from '@/types/admin-product';

interface CategoryOption {
  id: string;
  nameEn: string;
  nameBn?: string | null;
  slug: string;
}

interface ProductFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  isAllExpanded: boolean;
  onToggleExpandAll: () => void;
  onAddProduct: () => void;
  onExportCsv: () => void;
  categories: CategoryOption[];
}

export default function ProductFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  isAllExpanded,
  onToggleExpandAll,
  onAddProduct,
  onExportCsv,
  categories,
}: ProductFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          className="w-full pl-10 pr-4 py-2 bg-slate-50 text-slate-900 text-sm rounded-lg border border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#005d42] focus:border-transparent outline-none transition-all placeholder:text-slate-400"
          placeholder="Search by premix name, composition, SKU, or DLS license..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Category Dropdown */}
        <select
          className="px-3 py-2 bg-slate-50 text-slate-800 text-xs font-medium rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#005d42] outline-none cursor-pointer"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="ALL">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nameEn}
            </option>
          ))}
        </select>

        {/* Status Filter Segmented Controls */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold">
          {['ALL', 'ACTIVE', 'DRAFT', 'ARCHIVED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => onStatusChange(st)}
              className={`px-3 py-1 rounded-md transition-all ${
                selectedStatus === st
                  ? 'bg-white text-[#005d42] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Toggle Expand / Collapse Variants */}
        <button
          type="button"
          onClick={onToggleExpandAll}
          className="px-3 py-2 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold border border-slate-200 flex items-center gap-1.5 transition-colors"
          title="Toggle all pack-size variants"
        >
          <ChevronsUpDown className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {isAllExpanded ? 'Collapse All' : 'Expand All'}
          </span>
        </button>

        {/* Export CSV Button */}
        <button
          type="button"
          onClick={onExportCsv}
          className="px-3 py-2 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold border border-slate-200 flex items-center gap-1.5 transition-colors"
          title="Export products to CSV spreadsheet"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* Add Product Button */}
        <button
          type="button"
          onClick={onAddProduct}
          className="px-4 py-2 bg-[#005d42] hover:bg-[#004e37] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>
    </div>
  );
}
