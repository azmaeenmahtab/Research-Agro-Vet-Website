'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getApiUrl } from '@/lib/api-client';
import {
  Tags,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Package,
  Loader2,
  AlertTriangle,
  ArrowUpDown,
  RefreshCw,
  FolderTree,
} from 'lucide-react';
import CategoryFormModal, { AdminCategory } from '@/components/admin/modals/CategoryFormModal';
import { toast } from '@heroui/react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);

  // Delete modal state
  const [deletingCategory, setDeletingCategory] = useState<AdminCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(getApiUrl('/api/admin/categories'));
      const data = await res.json();
      if (data.success && Array.isArray(data.categories)) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (category: AdminCategory) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleSaved = (savedCategory: AdminCategory) => {
    toast.success(`Category "${savedCategory.nameEn}" saved successfully!`);
    setCategories((prev) => {
      const idx = prev.findIndex((c) => c.id === savedCategory.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...savedCategory };
        return updated;
      }
      return [...prev, savedCategory].sort((a, b) => a.sortOrder - b.sortOrder);
    });
  };

  const handleToggleStatus = async (cat: AdminCategory) => {
    const nextStatus = !cat.isActive;
    // Optimistic UI update
    setCategories((prev) =>
      prev.map((c) => (c.id === cat.id ? { ...c, isActive: nextStatus } : c))
    );

    try {
      const res = await fetch(getApiUrl(`/api/admin/categories/${cat.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        // Rollback
        setCategories((prev) =>
          prev.map((c) => (c.id === cat.id ? { ...c, isActive: cat.isActive } : c))
        );
        toast.danger(data.message || 'Failed to update category status.');
      } else {
        toast.success(`Category "${cat.nameEn}" marked as ${nextStatus ? 'Active' : 'Inactive'}`);
      }
    } catch (err) {
      // Rollback
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, isActive: cat.isActive } : c))
      );
      toast.danger('Failed to update category status.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(getApiUrl(`/api/admin/categories/${deletingCategory.id}`), {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete category.');
      }

      toast.success(`Category "${deletingCategory.nameEn}" deleted successfully!`);
      setCategories((prev) => prev.filter((c) => c.id !== deletingCategory.id));
      setDeletingCategory(null);
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete category.');
      toast.danger(err.message || 'Failed to delete category.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered categories
  const filteredCategories = categories.filter((c) => {
    if (statusFilter === 'ACTIVE' && !c.isActive) return false;
    if (statusFilter === 'INACTIVE' && c.isActive) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchEn = c.nameEn?.toLowerCase().includes(q);
      const matchBn = c.nameBn?.includes(q);
      const matchSlug = c.slug?.toLowerCase().includes(q);
      return matchEn || matchBn || matchSlug;
    }
    return true;
  });

  // Summary counts
  const totalCategories = categories.length;
  const activeCount = categories.filter((c) => c.isActive).length;
  const inactiveCount = totalCategories - activeCount;
  const totalProductsLinked = categories.reduce(
    (sum, c) => sum + (c._count?.products || 0),
    0
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5 tracking-tight">
            <Tags className="w-6 h-6 text-[#005d42]" />
            <span>Therapeutic Category Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize veterinary feed premix, vitamins, digestive care, and medications into clinical groupings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchCategories}
            className="p-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
            title="Refresh categories"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#005d42]' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-[#005d42] text-white hover:bg-[#004e37] font-semibold text-xs transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Category</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Categories</span>
            <FolderTree className="w-4 h-4 text-[#005d42]" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalCategories}</p>
          <span className="text-[10px] text-slate-400">All registered clinical groups</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active on Store</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2">{activeCount}</p>
          <span className="text-[10px] text-emerald-600/80">Visible to customer filter</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Hidden / Inactive</span>
            <XCircle className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-600 mt-2">{inactiveCount}</p>
          <span className="text-[10px] text-slate-400">Not visible on frontend</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Products Linked</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-2">{totalProductsLinked}</p>
          <span className="text-[10px] text-blue-600/80">Total multi-category links</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-[#005d42] outline-none transition-all"
            placeholder="Search category name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              statusFilter === 'ALL'
                ? 'bg-[#005d42] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            All ({totalCategories})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              statusFilter === 'ACTIVE'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('INACTIVE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              statusFilter === 'INACTIVE'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            Hidden ({inactiveCount})
          </button>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#005d42] animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Loading therapeutic categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Tags className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No categories found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search
                ? `No categories matching "${search}". Try a different keyword.`
                : 'Get started by creating your first product category.'}
            </p>
            {!search && (
              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#005d42] text-white text-xs font-semibold hover:bg-[#004e37]"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-16">Sort</th>
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Slug / URL</th>
                  <th className="py-3 px-4">Assigned Products</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCategories.map((category) => {
                  const productCount = category._count?.products || 0;

                  return (
                    <tr
                      key={category.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Sort Order */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-700">
                          {category.sortOrder}
                        </span>
                      </td>

                      {/* Name En & Bn */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 text-sm block">
                            {category.nameEn}
                          </span>
                          {category.nameBn && (
                            <span className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded font-medium inline-block">
                              {category.nameBn}
                            </span>
                          )}
                          {category.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-1 max-w-md pt-0.5">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                        <span className="bg-slate-100 px-2 py-1 rounded-md text-slate-700">
                          {category.slug}
                        </span>
                      </td>

                      {/* Products Count */}
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/admin/products?category=${category.slug}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/60 font-semibold hover:bg-blue-100 transition-colors"
                          title="View assigned products in Products Dashboard"
                        >
                          <Package className="w-3.5 h-3.5 text-blue-600" />
                          <span>{productCount} {productCount === 1 ? 'Product' : 'Products'}</span>
                        </Link>
                      </td>

                      {/* Active Status Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(category)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                            category.isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                          title="Click to toggle active status"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              category.isActive ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'
                            }`}
                          />
                          <span>{category.isActive ? 'Active' : 'Hidden'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(category)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-[#005d42] hover:bg-emerald-50 transition-colors"
                            title="Edit Category"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteError(null);
                              setDeletingCategory(category);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Category Add/Edit Modal */}
      <CategoryFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        category={editingCategory}
        onSaved={handleSaved}
      />

      {/* Delete Confirmation Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-base">
                  Delete Category: {deletingCategory.nameEn}?
                </h3>
                <p className="text-xs text-slate-600">
                  {deletingCategory._count?.products && deletingCategory._count.products > 0 ? (
                    <span className="text-red-700 font-semibold block">
                      Warning: {deletingCategory._count.products} products are currently attached to this category.
                    </span>
                  ) : null}
                  Deleting this category will safely detach it from all associated products. The products themselves will NOT be deleted.
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingCategory(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-60"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Category</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

