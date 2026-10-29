'use client';

import React from 'react';
import ProductTableRow from './ProductTableRow';
import { AdminProduct } from '@/types/admin-product';
import { Calculator, Percent, Snowflake } from 'lucide-react';

interface ProductTableProps {
  products: AdminProduct[];
  isLoading: boolean;
  expandedProductIds: Set<string>;
  onToggleExpand: (productId: string) => void;
  onEditProduct: (product: AdminProduct) => void;
  onEditClinical: (product: AdminProduct) => void;
  onDeleteProduct: (product: AdminProduct) => void;
}

export default function ProductTable({
  products,
  isLoading,
  expandedProductIds,
  onToggleExpand,
  onEditProduct,
  onEditClinical,
  onDeleteProduct,
}: ProductTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-12 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-[#005d42] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-500 font-medium">Loading catalog and pricing data...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-12 text-center space-y-3">
        <p className="text-base font-bold text-slate-800">No products found</p>
        <p className="text-xs text-slate-500">
          Try adjusting your search criteria or filter options above.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                <th className="py-3 px-4 w-[34%]">Product & Identity</th>
                <th className="py-3 px-3.5 w-[14%]">Pack Size</th>
                <th className="py-3 px-3 w-[12%] text-right whitespace-nowrap">TP (Trade Price)</th>
                <th className="py-3 px-3 w-[14%] text-right whitespace-nowrap">MRP (BDT)</th>
                <th className="py-3 px-3 w-[12%] text-center whitespace-nowrap">Stock</th>
                <th className="py-3 px-3 w-[6%] text-center">Units</th>
                <th className="py-3 px-4 w-[8%] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800 text-sm">
              {products.map((product, index) => (
                <ProductTableRow
                  key={product.id}
                  product={product}
                  rowIndex={index}
                  isExpanded={expandedProductIds.has(product.id)}
                  onToggleExpand={() => onToggleExpand(product.id)}
                  onEditProduct={onEditProduct}
                  onEditClinical={onEditClinical}
                  onDeleteProduct={onDeleteProduct}
                />
              ))}
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
            <span>Showing {products.length} Products</span>
          </div>
        </div>
      </div>

      {/* Quick Helper Bento Cards (From Stitch Design) */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center gap-2 text-[#005d42] font-bold text-sm">
            <Calculator className="w-4 h-4" />
            <span>Automatic Trade Margin</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            The difference between Trade Price (TP) and Retail MRP gives retailers and dealers their wholesale margin. Invoices calculate dealer commissions automatically based on buyer status.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
            <Percent className="w-4 h-4" />
            <span>Storewide & VIP Discounts</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Universal discounts apply automatically at checkout unless a VIP customer has custom negotiated pricing. You can also override selling prices per variant directly in the editor.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
            <Snowflake className="w-4 h-4" />
            <span>Cold-Chain Compliance</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Temperature-sensitive biologics and vaccines (2°C - 8°C) are packaged with insulated thermal cold-packs. Stock status changes immediately notify courier dispatch.
          </p>
        </div>
      </div> */}
    </div>
  );
}
