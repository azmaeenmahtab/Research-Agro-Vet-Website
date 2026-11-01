'use client';

import React, { useState, useEffect, useCallback } from 'react';
import OrderLiveTicker from './OrderLiveTicker';
import OrderStatsOverview from './OrderStatsOverview';
import OrderFilterTabs from './OrderFilterTabs';
import OrderTable from './OrderTable';
import OrderManageModal from './OrderManageModal';
import InvoicePrintModal from './InvoicePrintModal';
import BatchInvoicePrintModal from './BatchInvoicePrintModal';
import {
  AdminOrder,
  OrderStatsSummary,
  UpdateOrderPayload,
} from '@/types/admin-order';

export default function OrderManagementDashboard() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [stats, setStats] = useState<OrderStatsSummary>({
    totalOrders: 0,
    pendingCount: 0,
    confirmedCount: 0,
    shippedCount: 0,
    deliveredCount: 0,
    cancelledCount: 0,
    todayCount: 0,
    todayRevenue: 0,
  });

  const [currentStatus, setCurrentStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('LIFETIME');
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Invoice Print Modal State
  const [invoiceOrderToPrint, setInvoiceOrderToPrint] = useState<AdminOrder | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false);
  const [isBatchPrintModalOpen, setIsBatchPrintModalOpen] = useState<boolean>(false);

  // Fetch orders from API
  const fetchOrders = useCallback(
    async (quiet = false, targetPage?: number, targetPageSize?: number) => {
      const activePage = targetPage ?? currentPage;
      const activeSize = targetPageSize ?? pageSize;

      if (!quiet) setIsLoading(true);
      else setIsRefreshing(true);

      try {
        const params = new URLSearchParams();
        if (currentStatus !== 'ALL') params.append('status', currentStatus);
        if (searchQuery.trim()) params.append('search', searchQuery.trim());
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        params.append('limit', String(activeSize));
        params.append('page', String(activePage));

        const res = await fetch(`/api/admin/orders?${params.toString()}`);
        const data = await res.json();

        if (data.success) {
          setOrders(data.orders);
          setTotalOrders(data.total ?? data.orders.length);
          setTotalPages(data.totalPages ?? 1);
          setStats(data.stats);

          // If a modal is open, keep its state synced with the latest server data
          setSelectedOrder((prev) => {
            if (!prev) return null;
            const found = data.orders.find((o: AdminOrder) => o.id === prev.id);
            return found || prev;
          });
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentStatus, searchQuery, startDate, endDate, currentPage, pageSize]
  );

  useEffect(() => {
    fetchOrders(false);
  }, [fetchOrders]);

  const handleStatusChange = (status: string) => {
    setCurrentStatus(status);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Update order handler
  const handleUpdateOrder = async (id: string, payload: UpdateOrderPayload) => {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to update order');
    }

    const updated = data.order;

    // Update local state smoothly
    setOrders((prev) =>
      prev.map((o) => (o.id === updated.id ? updated : o))
    );
    setSelectedOrder(updated);

    // Refresh stats in background
    fetchOrders(true);
  };

  const handleRangeSelect = (range: string, start?: string, end?: string) => {
    setDateRange(range);
    setStartDate(start);
    setEndDate(end);
    setCurrentPage(1);
  };

  const handleExportCsv = () => {
    if (orders.length === 0) return;

    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Phone',
      'District',
      'Upazila',
      'Address',
      'Order Type',
      'Item Count',
      'Subtotal (BDT)',
      'Discount (BDT)',
      'Shipping Fee (BDT)',
      'Grand Total (BDT)',
      'Paid Amount (BDT)',
      'Due Amount (COD)',
      'Payment Method',
      'Payment Status',
      'Order Status',
      'Courier',
      'Consignment ID',
    ];

    const rows = orders.map((o) => [
      `"${o.orderNumber}"`,
      `"${new Date(o.createdAt).toLocaleDateString('en-GB')}"`,
      `"${(o.customerName || '').replace(/"/g, '""')}"`,
      `"${o.customerPhone || ''}"`,
      `"${(o.district || '').replace(/"/g, '""')}"`,
      `"${(o.upazila || '').replace(/"/g, '""')}"`,
      `"${(o.address || '').replace(/"/g, '""')}"`,
      `"${o.orderType}"`,
      o.items.length,
      o.subtotal,
      o.discountAmount,
      o.shippingFee,
      o.grandTotal,
      o.paidAmount,
      o.dueAmount,
      `"${o.paymentMethod}"`,
      `"${o.paymentStatus}"`,
      `"${o.orderStatus}"`,
      `"${o.courierProvider || ''}"`,
      `"${o.consignmentId || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const dateStamp = new Date().toISOString().split('T')[0];
    const filename = `orders-${dateRange.toLowerCase()}-${dateStamp}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintInvoice = (order: AdminOrder) => {
    setInvoiceOrderToPrint(order);
    setIsInvoiceModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 1. Live Order Monitoring Bar */}
      <OrderLiveTicker
        pendingCount={stats.pendingCount}
        onRefresh={() => fetchOrders(true)}
        isRefreshing={isRefreshing}
      />

      {/* 2. Order Analytics & Date Range Stat Cards Bento */}
      <OrderStatsOverview
        stats={stats}
        currentRange={dateRange}
        onRangeSelect={handleRangeSelect}
        startDate={startDate}
        endDate={endDate}
        onPrintAllInvoices={() => setIsBatchPrintModalOpen(true)}
        onExportCsv={handleExportCsv}
        filteredOrdersCount={totalOrders}
      />

      {/* 3. Top Filter Toolbar & Status Badges */}
      <OrderFilterTabs
        currentStatus={currentStatus}
        onStatusChange={handleStatusChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        stats={stats}
      />

      {/* 4. Full-Width Orders Table with Enterprise Numbered Pagination */}
      <div className="w-full">
        <OrderTable
          orders={orders}
          totalOrders={totalOrders}
          currentPage={currentPage}
          pageSize={pageSize}
          totalPages={totalPages}
          selectedOrderId={selectedOrder?.id || null}
          onSelectOrder={(order) => setSelectedOrder(order)}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          isLoading={isLoading}
        />
      </div>

      {/* 5. Full-Size Order Details & Tele-Confirmation Modal */}
      <OrderManageModal
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        onUpdateOrder={handleUpdateOrder}
        onPrintInvoice={handlePrintInvoice}
      />

      {/* 6. Single Invoice Print Modal */}
      <InvoicePrintModal
        order={invoiceOrderToPrint}
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setInvoiceOrderToPrint(null);
        }}
      />

      {/* 7. Multi-Order Batch Invoice Print Modal (Standard A4 & Thermal 4x6) */}
      <BatchInvoicePrintModal
        orders={orders}
        isOpen={isBatchPrintModalOpen}
        onClose={() => setIsBatchPrintModalOpen(false)}
        dateRangeLabel={
          dateRange === 'LIFETIME'
            ? 'Lifetime (All Orders)'
            : startDate && endDate
            ? `${startDate} → ${endDate}`
            : dateRange
        }
      />
    </div>
  );
}
