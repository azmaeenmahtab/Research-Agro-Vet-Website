'use client';

import React, { useState, useEffect, useMemo } from 'react';
import ProductStatsBento from './ProductStatsBento';
import ProductFilters from './ProductFilters';
import ProductTable from './ProductTable';
import { ConfirmationModal, ProductFormModal, ClinicalDataModal } from './modals';
import { toast } from '@heroui/react';
import { authorizedFetch, getApiUrl } from '@/lib/api-client';
import {
  AdminProduct,
  AdminVariant,
  ProductSummaryStats,
} from '@/types/admin-product';

interface CategoryOption {
  id: string;
  nameEn: string;
  nameBn?: string | null;
  slug: string;
}

export default function ProductManagementDashboard() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [stats, setStats] = useState<ProductSummaryStats>({
    totalProducts: 0,
    activeVariants: 0,
    outOfStockVariants: 0,
    averageMarginPercentage: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [expandedProductIds, setExpandedProductIds] = useState<Set<string>>(new Set());

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);

  const [isClinicalModalOpen, setIsClinicalModalOpen] = useState(false);
  const [clinicalProduct, setClinicalProduct] = useState<AdminProduct | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<AdminProduct | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Universal Storewide Discount
  const [universalDiscount, setUniversalDiscount] = useState<{
    enabled: boolean;
    percent: number;
    label?: string;
  }>({ enabled: true, percent: 5, label: 'Website 5% Universal Discount' });

  // Fetch Universal Discount Policy
  const fetchUniversalDiscount = async () => {
    try {
      const res = await fetch(getApiUrl('/api/discounts/universal'));
      const data = await res.json();
      if (data?.success && data?.data) {
        setUniversalDiscount(data.data);
      }
    } catch (err) {
      console.error('Failed to load universal discount:', err);
    }
  };

  useEffect(() => {
    fetchUniversalDiscount();
  }, []);

  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  // Debounce search query to prevent typing stutter and race conditions
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (type === 'success') {
      toast.success(message);
    } else if (type === 'error') {
      toast.danger(message);
    } else {
      toast.info(message);
    }
  };

  // Fetch Products & Stats from API
  const fetchProducts = async (currentSearch = debouncedSearch) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentSearch) params.set('q', currentSearch);
      if (selectedCategory !== 'ALL') params.set('category', selectedCategory);
      if (selectedStatus !== 'ALL') params.set('status', selectedStatus);

      const res = await authorizedFetch(`/api/admin/products?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setProducts(data.products || []);
        if (data.categories) setCategories(data.categories);
        if (data.stats) setStats(data.stats);

        // By default expand first 3 products
        const initialExpanded = new Set<string>();
        (data.products || []).slice(0, 3).forEach((p: AdminProduct) => {
          initialExpanded.add(p.id);
        });
        setExpandedProductIds(initialExpanded);
      } else {
        showToast(data.message || 'Failed to load products', 'error');
      }
    } catch (err: any) {
      console.error(err);
      showToast('Error connecting to products API', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(debouncedSearch);
  }, [debouncedSearch, selectedCategory, selectedStatus]);

  // Expand / Collapse all toggle
  const isAllExpanded = useMemo(() => {
    return products.length > 0 && products.every((p) => expandedProductIds.has(p.id));
  }, [products, expandedProductIds]);

  const handleToggleExpandAll = () => {
    if (isAllExpanded) {
      setExpandedProductIds(new Set());
    } else {
      setExpandedProductIds(new Set(products.map((p) => p.id)));
    }
  };

  const handleToggleExpand = (productId: string) => {
    setExpandedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  // Action Triggers
  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsFormModalOpen(true);
  };

  const handleEditProduct = (product: AdminProduct) => {
    setEditingProduct(product);
    setIsFormModalOpen(true);
  };

  const handleEditClinical = (product: AdminProduct) => {
    setClinicalProduct(product);
    setIsClinicalModalOpen(true);
  };

  const handleDeleteProduct = (product: AdminProduct) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);

    try {
      const res = await authorizedFetch(`/api/admin/products/${productToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete product');
      }

      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      showToast(`Deleted ${productToDelete.nameEn}`, 'success');
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (err: any) {
      showToast(err.message || 'Error deleting product', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // When variant is updated via inline edit
  const handleVariantSaved = (
    productId: string,
    variantId: string,
    updated: Partial<AdminVariant>
  ) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          variants: p.variants.map((v) => (v.id === variantId ? { ...v, ...updated } : v)),
        };
      })
    );
  };

  // When whole product or clinical details are saved
  const handleProductSaved = (savedProduct: AdminProduct) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === savedProduct.id);
      if (exists) {
        return prev.map((p) => (p.id === savedProduct.id ? savedProduct : p));
      }
      return [savedProduct, ...prev];
    });
    showToast(`Product "${savedProduct.nameEn}" saved successfully!`, 'success');
    fetchProducts();
  };

  // Export to CSV
  const handleExportCsv = () => {
    if (products.length === 0) {
      showToast('No products available to export', 'info');
      return;
    }

    const headers = [
      'Product ID',
      'Name (EN)',
      'Name (BN)',
      'Category',
      'Form Factor',
      'DLS License',
      'Status',
      'SKU',
      'Pack Size',
      'Trade Price (TP)',
      'MRP (BDT)',
      'Effective Selling Price (BDT)',
      'Discount Type',
      'Discount %',
      'In Stock',
      'Stock Quantity',
    ];

    const rows: string[][] = [];

    products.forEach((p) => {
      p.variants.forEach((v) => {
        const mrp = Number(v.mrpPrice) || 0;
        const rawSelling = Number(v.sellingPrice) || mrp;
        const hasIndividual = mrp > 0 && rawSelling < mrp;
        const isUniv = !hasIndividual && Boolean(universalDiscount?.enabled) && Number(universalDiscount?.percent) > 0;
        
        let effectiveSelling = mrp;
        let discType = 'None';
        let discPct = 0;

        if (hasIndividual) {
          effectiveSelling = rawSelling;
          discType = 'Individual';
          discPct = Math.round(((mrp - rawSelling) / mrp) * 100);
        } else if (isUniv) {
          discType = 'Universal';
          discPct = Number(universalDiscount.percent);
          effectiveSelling = Math.round(mrp * (1 - discPct / 100));
        }

        rows.push([
          `"${p.id}"`,
          `"${p.nameEn.replace(/"/g, '""')}"`,
          `"${(p.nameBn || '').replace(/"/g, '""')}"`,
          `"${p.category?.nameEn || ''}"`,
          `"${p.formFactor}"`,
          `"${p.dlsLicenseNo || ''}"`,
          `"${p.status}"`,
          `"${v.sku}"`,
          `"${v.packSize}"`,
          String(v.tradePrice),
          String(mrp),
          String(effectiveSelling),
          discType,
          `${discPct}%`,
          v.inStock ? 'TRUE' : 'FALSE',
          String(v.stockQuantity),
        ]);
      });
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `research-agro-vet-products-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Catalog exported to CSV file', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Context Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          
          <div className="flex items-center gap-3">
            <h1 className="text-3xl  font-bold pb-3 text-slate-900 tracking-tight">
              Product & Packaging Management
            </h1>
           
          </div>
         
        </div>
      </div>

      {/* 4-Card Stats Bento */}
      <ProductStatsBento stats={stats} />

      {/* Search, Filter, Expand & Actions */}
      <ProductFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        isAllExpanded={isAllExpanded}
        onToggleExpandAll={handleToggleExpandAll}
        onAddProduct={handleAddProduct}
        onExportCsv={handleExportCsv}
        categories={categories}
        isLoading={isLoading}
      />

      {/* Main Multi-Variant Table */}
      <ProductTable
        products={products}
        isLoading={isLoading}
        expandedProductIds={expandedProductIds}
        universalDiscount={universalDiscount}
        onToggleExpand={handleToggleExpand}
        onEditProduct={handleEditProduct}
        onEditClinical={handleEditClinical}
        onDeleteProduct={handleDeleteProduct}
      />

      {/* Full Product & Variant Editor Modal */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        product={editingProduct}
        categories={categories}
        onClose={() => setIsFormModalOpen(false)}
        onSaved={handleProductSaved}
      />

      {/* Dedicated Separate Clinical & Disease Reference Modal */}
      <ClinicalDataModal
        isOpen={isClinicalModalOpen}
        product={clinicalProduct}
        onClose={() => setIsClinicalModalOpen(false)}
        onSaved={handleProductSaved}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Medicine"
        message={`Are you sure you want to permanently delete "${productToDelete?.nameEn || 'this medicine'}" and all of its pack-size variants? This action cannot be undone.`}
        confirmLabel="Delete Medicine"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setProductToDelete(null);
        }}
      />
    </div>
  );
}
