'use client';

import React from 'react';
import ProductTableRow from './ProductTableRow';
import { AdminProduct } from '@/types/admin-product';
import { Calculator, Percent, Snowflake } from 'lucide-react';

interface ProductTableProps {
  products: AdminProduct[];
  isLoading: boolean;
  expandedProductIds: Set<string>;
  universalDiscount?: {
    enabled: boolean;
    percent: number;
    label?: string;
  };
  onToggleExpand: (productId: string) => void;
  onEditProduct: (product: AdminProduct) => void;
  onEditClinical: (product: AdminProduct) => void;
  onDeleteProduct: (product: AdminProduct) => void;
}

function ProductTableSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-slate-100">
          {/* 1. Product & Identity */}
          <td className="py-4 px-4 align-middle">
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 bg-slate-200 rounded shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 bg-slate-200 rounded w-36" />
                <div className="h-3 bg-slate-100 rounded w-20" />
              </div>
            </div>
          </td>

          {/* 2. Pack Size */}
          <td className="py-4 px-3 align-middle">
            <div className="h-4 bg-slate-200 rounded w-16" />
          </td>

          {/* 3. TP */}
          <td className="py-4 px-3 align-middle text-right">
            <div className="h-6 bg-slate-200 rounded-lg w-16 ml-auto" />
          </td>

          {/* 4. MRP */}
          <td className="py-4 px-3 align-middle text-right">
            <div className="h-6 bg-slate-200 rounded-lg w-16 ml-auto" />
          </td>

          {/* 5. Selling Price */}
          <td className="py-4 px-3 align-middle text-right">
            <div className="h-6 bg-slate-200 rounded-lg w-16 ml-auto" />
          </td>

          {/* 6. Discount */}
          <td className="py-4 px-3 align-middle text-center">
            <div className="h-6 bg-slate-200 rounded-lg w-18 mx-auto" />
          </td>

          {/* 7. Stock */}
          <td className="py-4 px-3 align-middle text-center">
            <div className="h-5 bg-slate-200 rounded-full w-14 mx-auto" />
          </td>

          {/* 8. Units */}
          <td className="py-4 px-2.5 align-middle text-center">
            <div className="h-4 bg-slate-200 rounded w-8 mx-auto" />
          </td>

          {/* 9. Actions */}
          <td className="py-4 px-4 align-middle text-right">
            <div className="h-7 bg-slate-200 rounded-lg w-16 ml-auto" />
          </td>
        </tr>
      ))}
    </>
  );
}

export default function ProductTable({
  products,
  isLoading,
  expandedProductIds,
  universalDiscount,
  onToggleExpand,
  onEditProduct,
  onEditClinical,
  onDeleteProduct,
}: ProductTableProps) {
  return (
    <div className="space-y-6">
      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                <th className="py-3 px-4 w-[25%]">Product & Identity</th>
                <th className="py-3 px-3 w-[10%]">Pack Size</th>
                <th className="py-3 px-3 w-[10%] text-right whitespace-nowrap">TP (BDT)</th>
                <th className="py-3 px-3 w-[10%] text-right whitespace-nowrap">MRP (BDT)</th>
                <th className="py-3 px-3 w-[11%] text-right whitespace-nowrap">Selling Price</th>
                <th className="py-3 px-3 w-[13%] text-center whitespace-nowrap">Discount</th>
                <th className="py-3 px-3 w-[9%] text-center whitespace-nowrap">Stock</th>
                <th className="py-3 px-2.5 w-[5%] text-center">Units</th>
                <th className="py-3 px-4 w-[7%] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800 text-sm">
              {isLoading ? (
                <ProductTableSkeleton count={6} />
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 px-4 text-center">
                    <div className="max-w-xs mx-auto space-y-2">
                      <p className="text-base font-bold text-slate-800">No products found</p>
                      <p className="text-xs text-slate-500">
                        Try adjusting your search criteria or filter options above.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product, index) => (
                  <ProductTableRow
                    key={product.id}
                    product={product}
                    rowIndex={index}
                    isExpanded={expandedProductIds.has(product.id)}
                    universalDiscount={universalDiscount}
                    onToggleExpand={() => onToggleExpand(product.id)}
                    onEditProduct={onEditProduct}
                    onEditClinical={onEditClinical}
                    onDeleteProduct={onDeleteProduct}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Bottom Hint Bar */}
        <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>
              Click <strong>&quot;Edit&quot;</strong> on the right to update any product specs, pack sizes, prices, or inventory.
            </span>
          </div>
          <div className="flex items-center gap-3 font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Live Catalog
            </span>
            <span>•</span>
            <span>
              {isLoading ? (
                <span className="inline-block w-24 h-3.5 bg-slate-200 animate-pulse rounded" />
              ) : (
                `Showing ${products.length} Products`
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
