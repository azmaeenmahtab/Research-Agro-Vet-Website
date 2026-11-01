'use client';

import React, { useState, useEffect } from 'react';
import { X, Tags, Loader2, AlertCircle, Check, ArrowRight } from 'lucide-react';

export interface AdminCategory {
  id: string;
  nameEn: string;
  nameBn?: string | null;
  slug: string;
  description?: string | null;
  image?: string | null;
  sortOrder: number;
  isActive: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  _count?: {
    products?: number;
    primaryProducts?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: AdminCategory | null;
  onSaved: (category: AdminCategory) => void;
}

function cleanSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export default function CategoryFormModal({
  isOpen,
  onClose,
  category,
  onSaved,
}: CategoryFormModalProps) {
  const isEditing = Boolean(category?.id);

  const [nameEn, setNameEn] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);
  const [autoSlug, setAutoSlug] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      setNameEn(category.nameEn || '');
      setNameBn(category.nameBn || '');
      setSlug(category.slug || '');
      setDescription(category.description || '');
      setSortOrder(category.sortOrder ?? 1);
      setIsActive(category.isActive ?? true);
      setAutoSlug(false);
      setError(null);
    } else {
      setNameEn('');
      setNameBn('');
      setSlug('');
      setDescription('');
      setSortOrder(1);
      setIsActive(true);
      setAutoSlug(true);
      setError(null);
    }
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleNameEnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNameEn(val);
    if (autoSlug) {
      setSlug(cleanSlug(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim()) {
      setError('English category name is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        nameEn: nameEn.trim(),
        nameBn: nameBn.trim() || null,
        slug: slug.trim() ? cleanSlug(slug) : cleanSlug(nameEn),
        description: description.trim() || null,
        sortOrder: Number(sortOrder) || 0,
        isActive,
      };

      const url = isEditing
        ? `/api/admin/categories/${category?.id}`
        : '/api/admin/categories';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save category');
      }

      onSaved(data.category);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-900 to-[#005d42] text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-emerald-300">
              <Tags className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">
                {isEditing ? `Edit Category : ${category?.nameEn}` : 'Add New Therapeutic Category'}
              </h2>
              <p className="text-xs text-emerald-200/80">
                {isEditing ? 'Update category details and storefront visibility' : 'Create a new category for feed premix & medicine grouping'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category Name (English) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#005d42] outline-none transition-all"
                placeholder="e.g. Calcium & Milk Production"
                value={nameEn}
                onChange={handleNameEnChange}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category Name (Bengali / বাংলা)
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#005d42] outline-none transition-all"
                placeholder="e.g. ক্যালসিয়াম ও দুধ বৃদ্ধিকারক"
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                URL Slug <span className="text-red-500">*</span>
              </label>
              <label className="flex items-center gap-1.5 text-[11px] text-slate-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSlug}
                  onChange={(e) => setAutoSlug(e.target.checked)}
                  className="rounded text-[#005d42] focus:ring-[#005d42]"
                />
                <span>Auto-generate from English name</span>
              </label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs text-slate-400 font-mono select-none">
                /category/
              </span>
              <input
                type="text"
                required
                className="w-full pl-22 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-[#005d42] outline-none transition-all"
                placeholder="calcium-milk-bone"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setAutoSlug(false);
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Display Sort Order
              </label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#005d42] outline-none transition-all"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Lower numbers appear first on storefront navigation.
              </span>
            </div>

            <div className="pt-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#005d42]"></div>
                <div className="ml-3">
                  <span className="text-xs font-bold text-slate-800 block">
                    {isActive ? 'Active (Visible on Storefront)' : 'Inactive (Hidden)'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Control whether this category shows in filter tabs.
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description / Notes (Optional)
            </label>
            <textarea
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#005d42] outline-none transition-all resize-none"
              placeholder="Brief description of this therapeutic indication or feed premix category..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#005d42] text-white hover:bg-[#004e37] font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isEditing ? 'Save Changes' : 'Create Category'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

