'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Download, ChevronsUpDown, X } from 'lucide-react';
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
  isLoading?: boolean;
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
  isLoading = false,
}: ProductFiltersProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const isTypingRef = useRef(false);

  // Sync with external reset / prop changes
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

  const handleClear = () => {
    isTypingRef.current = false;
    setLocalSearch('');
    onSearchChange('');
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
      {/* Search Input with Debounce, Enter trigger, and Clear Button */}
      <div className="relative flex-1">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          className="w-full pl-10 pr-24 py-2 bg-slate-50 text-slate-900 text-sm rounded-lg border border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#005d42] focus:border-transparent outline-none transition-all placeholder:text-slate-400"
          placeholder="Search by premix name, composition, SKU, or DLS license..."
          value={localSearch}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {/* Action Indicators */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {isLoading && (
            <div className="w-3.5 h-3.5 border-2 border-[#005d42] border-t-transparent rounded-full animate-spin" />
          )}
          {localSearch && (
            <button
              type="button"
              onClick={handleClear}
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
