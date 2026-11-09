'use client';

import React from 'react';
import {
  ArrowRight,
  Clock,
  Phone,
  Snowflake,
  BadgePercent,
  CheckCircle2,
  AlertCircle,
  Truck,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Package,
} from 'lucide-react';
import {
  AdminOrder,
  OrderStatus,
  PaymentStatus,
} from '@/types/admin-order';

interface OrderTableProps {
  orders: AdminOrder[];
  totalOrders: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  selectedOrderId: string | null;
  onSelectOrder: (order: AdminOrder) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  isLoading: boolean;
}

function OrderTableSkeleton({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-slate-100">
          {/* 1. Order ID & Time */}
          <td className="py-4 px-4 align-middle">
            <div className="space-y-1.5">
              <div className="h-4 bg-slate-200 rounded-md w-24" />
              <div className="h-3 bg-slate-100 rounded w-16" />
            </div>
          </td>

          {/* 2. Customer & Farm */}
          <td className="py-4 px-3.5 align-middle">
            <div className="space-y-1.5">
              <div className="h-4 bg-slate-200 rounded-md w-32" />
              <div className="h-3 bg-slate-100 rounded w-24" />
            </div>
          </td>

          {/* 3. Items */}
          <td className="py-4 px-3 align-middle">
            <div className="flex items-center gap-2">
              <div className="h-5 bg-slate-200 rounded-md w-12" />
              <div className="h-3.5 bg-slate-100 rounded w-24" />
            </div>
          </td>

          {/* 4. Total Amount */}
          <td className="py-4 px-3 align-middle text-right">
            <div className="flex flex-col items-end space-y-1">
              <div className="h-4 bg-slate-200 rounded-md w-16" />
              <div className="h-3 bg-slate-100 rounded w-12" />
            </div>
          </td>

          {/* 5. Payment */}
          <td className="py-4 px-3 align-middle text-center">
            <div className="h-6 bg-slate-200 rounded-lg w-20 mx-auto" />
          </td>

          {/* 6. Status */}
          <td className="py-4 px-3 align-middle text-center">
            <div className="h-6 bg-slate-200 rounded-lg w-22 mx-auto" />
          </td>

          {/* 7. Action */}
          <td className="py-4 px-4 align-middle text-right">
            <div className="h-7 bg-slate-200 rounded-lg w-18 ml-auto" />
          </td>
        </tr>
      ))}
    </>
  );
}

function getPaginationItems(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total];
  }
  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, '...', current - 1, current, current + 1, '...', total];
}

export default function OrderTable({
  orders,
  totalOrders,
  currentPage,
  pageSize,
  totalPages,
  selectedOrderId,
  onSelectOrder,
  onPageChange,
  onPageSizeChange,
  isLoading,
}: OrderTableProps) {
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'PACKED':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'SHIPPED':
        return 'bg-indigo-100 text-indigo-900 border-indigo-300';
      case 'DELIVERED':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'RETURNED':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-900 border-red-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'PAID':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'PARTIAL':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'UNPAID':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'REFUNDED':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'FAILED':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const startRecord = totalOrders === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalOrders);
  const paginationItems = getPaginationItems(currentPage, totalPages);

  return (
    <div className="space-y-4">
      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-3.5">Customer & Farm</th>
                <th className="py-3 px-3">Items</th>
                <th className="py-3 px-3 text-right">Total Amount</th>
                <th className="py-3 px-3 text-center">Payment</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 text-xs">
              {isLoading ? (
                <OrderTableSkeleton count={pageSize || 8} />
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 px-4 text-center">
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                        <Package className="w-6 h-6 stroke-[1.5]" />
                      </div>
                      <p className="font-bold text-slate-800 text-sm">No orders found</p>
                      <p className="text-xs text-slate-400">
                        Try adjusting your search query, status filters, or date range.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const isSelected = order.id === selectedOrderId;
                  const totalItemUnits = order.items.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                  );

                  return (
                    <tr
                      key={order.id}
                      onClick={() => onSelectOrder(order)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-emerald-50/70 border-l-4 border-l-[#005d42]'
                          : 'hover:bg-slate-50/70'
                      }`}
                    >
                    {/* 1. Order ID & Time */}
                    <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 font-mono text-sm text-[#005d42]">
                          {order.orderNumber}
                        </span>
                        <span className="text-[12px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-4 h-4 text-slate-400 " />
                          <span>{formatRelativeTime(order.createdAt)}</span>
                        </span>
                      </div>
                    </td>

                    {/* 2. Customer & Farm */}
                    <td className="py-3.5 px-3.5 align-middle">
                      <div className="flex flex-col gap-2 min-w-[160px]">
                        <span className="font-bold text-slate-900 text-sm">
                          {order.customerName}
                        </span>
                        <span className="text-sm text-slate-600 font-mono flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{order.customerPhone}</span>
                        </span>
                        {/* <span className="text-[10px] py-1 text-slate-400 truncate max-w-[280px]" title={order.address}>
                          {order.address || `${order.upazila}, ${order.district}`}
                        </span> */}
                      </div>
                    </td>

                    {/* 3. Items Summary */}
                    <td className="py-3.5 px-3 align-middle">
                      <div className="flex flex-col gap-1 min-w-[160px] max-w-[320px]">
                        {order.items.map((item, idx) => (
                          <div
                            key={item.id || `${item.sku}-${idx}`}
                            className="flex items-center gap-3 text-xs"
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#005d42] shrink-0" />
                              <span
                                className="font-medium text-slate-800 text-sm truncate"
                                title={`${item.nameEn}${item.packSize ? ` (${item.packSize})` : ''}`}
                              >
                                {item.nameEn}
                                {item.packSize && (
                                  <span className="text-[12px] text-slate-400 font-normal ml-1">
                                    ({item.packSize})
                                  </span>
                                )}
                              </span>
                            </div>
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-bold shrink-0 border border-slate-200/60">
                              ×{item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* 4. Total Amount */}
                    <td className="py-3.5 px-3 align-middle text-right whitespace-nowrap">
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="inline-block px-3 py-1 rounded-lg text-sm sm:text-[15px] font-extrabold text-[#005d42] bg-emerald-50 border border-emerald-200/90 tabular-nums shadow-2xs">
                          ৳{order.grandTotal.toLocaleString()}
                        </span>
                        {order.discountAmount > 0 && (
                          <span className="text-[10px] text-slate-400 line-through tabular-nums font-medium pr-1">
                            ৳{(order.subtotal + order.shippingFee).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 5. Payment Badge */}
                    <td className="py-3.5 px-3 align-middle text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getPaymentBadge(
                          order.paymentStatus
                        )}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>

                    {/* 6. Order Status Badge */}
                    <td className="py-3.5 px-3 align-middle text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>

                    {/* 7. Action Button */}
                    <td className="py-3.5 px-4 align-middle text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectOrder(order);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1 ${
                          order.orderStatus === 'PENDING'
                            ? 'bg-[#005d42] text-white hover:bg-[#004e37] shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <span>
                          {order.orderStatus === 'PENDING' ? 'Confirm' : 'Manage'}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>

        {/* Enterprise Numbered Pagination Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          {/* Left: Range Counter & Rows Per Page */}
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-slate-600">
              {isLoading ? (
                <span className="inline-block w-28 h-3.5 bg-slate-200 animate-pulse rounded" />
              ) : (
                <>
                  Showing <strong className="text-slate-900 font-bold">{startRecord}–{endRecord}</strong> of{' '}
                  <strong className="text-slate-900 font-bold">{totalOrders}</strong> orders
                </>
              )}
            </span>

            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
              <span className="text-slate-500 text-[11px]">Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-2 py-1 font-semibold focus:outline-none focus:ring-2 focus:ring-[#005d42] cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* Right: Page Buttons & Prev/Next */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              {/* Previous Button */}
              <button
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-700 transition-colors flex items-center gap-1 font-medium cursor-pointer disabled:cursor-not-allowed"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">Prev</span>
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {paginationItems.map((item, idx) => {
                  if (item === '...') {
                    return (
                      <span
                        key={`ellipsis-${idx}`}
                        className="w-7 text-center text-slate-400 font-bold text-xs"
                      >
                        ...
                      </span>
                    );
                  }

                  const pageNum = item as number;
                  const isActive = pageNum === currentPage;

                  return (
                    <button
                      key={`page-${pageNum}`}
                      type="button"
                      onClick={() => onPageChange(pageNum)}
                      className={`min-w-7 h-7 px-2 rounded-lg text-xs font-semibold transition-all border ${
                        isActive
                          ? 'bg-[#005d42] text-white border-[#005d42] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900 cursor-pointer'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                type="button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-700 transition-colors flex items-center gap-1 font-medium cursor-pointer disabled:cursor-not-allowed"
                title="Next page"
              >
                <span className="hidden sm:inline text-xs">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Operational Advisory Bento Cards (From Stitch Design) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Snowflake className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-xs">
              Cold-Chain Pack Protection
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              Ensure temperature-sensitive vaccines and biological drugs are dispatched in insulated thermal boxes with frozen ice-gel packs.
            </p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
            <BadgePercent className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-xs">
              Tele-Discount Protocol
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              Special rebates or custom phone discounts granted to farmers are automatically logged and tracked in the customer ledger.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

