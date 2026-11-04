'use client';

import React from 'react';
import {
  ChevronDown,
  ChevronRight,
  Edit,
  Stethoscope,
  Trash2,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { AdminProduct } from '@/types/admin-product';

interface ProductTableRowProps {
  product: AdminProduct;
  rowIndex: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEditProduct: (product: AdminProduct) => void;
  onEditClinical: (product: AdminProduct) => void;
  onDeleteProduct: (product: AdminProduct) => void;
}

export default function ProductTableRow({
  product,
  rowIndex,
  isExpanded,
  onToggleExpand,
  onEditProduct,
  onEditClinical,
  onDeleteProduct,
}: ProductTableRowProps) {
  const statusBadge = {
    ACTIVE: 'bg-emerald-50 text-[#005d42] border-emerald-200',
    DRAFT: 'bg-amber-50 text-amber-800 border-amber-200',
    ARCHIVED: 'bg-slate-100 text-slate-600 border-slate-200',
  }[product.status];

  const variantsToShow = isExpanded ? product.variants : product.variants.slice(0, 1);
  const totalVariantsCount = product.variants.length;

  // Alternating background color for every 2nd product
  const isEven = rowIndex % 2 === 0;
  const rowBgClass = isEven
    ? 'bg-white hover:bg-slate-50/70'
    : 'bg-slate-50/75 hover:bg-slate-100/70';

  return (
    <>
      {variantsToShow.map((variant, index) => {
        const isFirstRow = index === 0;

        return (
          <tr
            key={variant.id || `${product.id}-var-${index}`}
            className={`${rowBgClass} transition-colors border-b border-slate-200/80`}
          >
            {/* 1. PRODUCT IDENTITY (Rowspanned across all variants) */}
            {isFirstRow && (
              <td
                rowSpan={variantsToShow.length}
                className={`py-4 px-4 align-top border-r border-slate-200/80 ${
                  isEven ? 'bg-white' : 'bg-slate-50/90'
                }`}
                style={{ width: '32%' }}
              >
                <div className="flex items-start gap-3">
                  {/* Expand / Collapse Chevron */}
                  <button
                    type="button"
                    onClick={onToggleExpand}
                    className="mt-0.5 p-1 rounded-md hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition-colors shrink-0"
                    title={isExpanded ? 'Collapse variants' : 'Expand all pack sizes'}
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-[#005d42]" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    {/* Title & Status */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="font-bold text-slate-900 text-sm hover:text-[#005d42] transition-colors cursor-pointer"
                        onClick={() => onEditProduct(product)}
                        title="Click to edit product"
                      >
                        {product.nameEn}
                      </span>
                      {/* {product.nameBn && (
                        <span className="text-xs text-slate-500 font-medium">
                          ({product.nameBn})
                        </span>
                      )} */}
                      <span
                        className={`px-2 py-1 rounded text-[10px] font-bold border uppercase tracking-wider ${statusBadge}`}
                      >
                        {product.status}
                      </span>
                      {product.isFeatured && (
                        <span className="px-2 py-1 rounded text-[12px] font-bold bg-amber-100 text-amber-800">
                          Featured
                        </span>
                      )}
                    </div>

                    {/* DLS Number Only */}
                    {product.dlsLicenseNo ? (
                      <div className="flex items-center gap-1 text-xs text-slate-600 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-mono text-[11.5px]">
                          DLS: {product.dlsLicenseNo}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-mono">
                        DLS: N/A
                      </span>
                    )}

                    {/* Short Active Composition summary if available */}
                    {/* {product.composition && (
                      <p className="text-[11px] text-slate-500 line-clamp-1 italic">
                        {product.composition}
                      </p>
                    )} */}

                    {totalVariantsCount > 1 && !isExpanded && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={onToggleExpand}
                          className="text-[11px] text-[#005d42] hover:underline font-semibold flex items-center gap-1"
                        >
                          <Layers className="w-3 h-3" />
                          <span>View all {totalVariantsCount} pack sizes</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </td>
            )}

            {/* 2. PACK SIZE & SKU */}
            <td className="py-3 px-3.5 align-middle text-xs">
              <div className="flex flex-col">
                <span className="font-bold text-slate-800 text-sm">{variant.packSize}</span>
                {/* <span className="text-[11px] text-slate-400 font-mono tracking-tight">
                  {variant.sku}
                </span> */}
                {/* {variant.packagingInfo && (
                  <span className="text-[10px] text-slate-500">{variant.packagingInfo}</span>
                )} */}
              </div>
            </td>

            {/* 3. TRADE PRICE (TP) */}
            <td className="py-3.5 px-3 align-middle text-right whitespace-nowrap">
              <span className="inline-block px-3 py-1 rounded-lg text-sm sm:text-[15px] font-extrabold text-orange-800 bg-orange-50 border border-orange-200/90 tabular-nums shadow-2xs">
                ৳{Number(variant.tradePrice).toLocaleString()}
              </span>
            </td>

            {/* 4. MRP & Selling Price (BDT) */}
            <td className="py-3.5 px-3 align-middle text-right whitespace-nowrap">
              <div className="flex flex-col items-end gap-0.5">
                <span className="inline-block px-3 py-1 rounded-lg text-sm sm:text-[15px] font-extrabold text-[#005d42] bg-emerald-50 border border-emerald-200/90 tabular-nums shadow-2xs">
                  ৳{Number(variant.sellingPrice || variant.mrpPrice).toLocaleString()}
                </span>
                {Number(variant.sellingPrice) < Number(variant.mrpPrice) && (
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                    <span className="line-through">৳{Number(variant.mrpPrice).toLocaleString()}</span>
                    <span className="text-red-600 font-bold bg-red-50 px-1 rounded border border-red-200">
                      -{Math.round(((Number(variant.mrpPrice) - Number(variant.sellingPrice)) / Number(variant.mrpPrice)) * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </td>

            {/* 5. STOCK STATUS BADGE */}
            <td className="py-3.5 px-3 align-middle text-center whitespace-nowrap">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  variant.inStock
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    variant.inStock ? 'bg-emerald-600' : 'bg-red-600'
                  }`}
                />
                <span>{variant.inStock ? 'IN STOCK' : 'OUT'}</span>
              </span>
            </td>

            {/* 7. UNITS */}
            <td className="py-3.5 px-3 align-middle text-center whitespace-nowrap">
              <span className="text-sm font-semibold text-slate-600 tabular-nums">
                {variant.stockQuantity}
              </span>
            </td>

            {/* 8. ACTIONS (Rowspanned on the right side of the row) */}
            {isFirstRow && (
              <td
                rowSpan={variantsToShow.length}
                className={`py-4 px-4 align-middle text-right border-l border-slate-200/80 ${
                  isEven ? 'bg-white' : 'bg-slate-50/90'
                }`}
                style={{ width: '15%' }}
              >
                <div className="flex items-center justify-end gap-2">
                  {/* Edit Details Button */}
                  <button
                    type="button"
                    onClick={() => onEditProduct(product)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#005d42] text-white hover:bg-[#004e37] text-xs font-semibold shadow-xs transition-colors"
                    title="Edit product details, pricing and pack sizes"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  {/* Clinical Reference Button */}
                  {/* <button
                    type="button"
                    onClick={() => onEditClinical(product)}
                    className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#005d42] border border-emerald-200 transition-colors"
                    title="Edit Clinical Reference (Formulation & Diseases Cured)"
                  >
                    <Stethoscope className="w-4 h-4" />
                  </button> */}

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => onDeleteProduct(product)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                    title="Delete product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            )}
          </tr>
        );
      })}
    </>
  );
}
