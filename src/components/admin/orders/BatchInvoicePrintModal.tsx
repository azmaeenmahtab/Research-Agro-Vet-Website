'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  Printer,
  FileText,
  Receipt,
  Download,
  CheckCircle2,
  Package,
  Phone,
  MapPin,
  Calendar,
  Layers,
} from 'lucide-react';
import { AdminOrder } from '@/types/admin-order';

interface BatchInvoicePrintModalProps {
  orders: AdminOrder[];
  isOpen: boolean;
  onClose: () => void;
  dateRangeLabel?: string;
}

export default function BatchInvoicePrintModal({
  orders,
  isOpen,
  onClose,
  dateRangeLabel = 'Selected Orders',
}: BatchInvoicePrintModalProps) {
  // Print Format Toggle: 'A4' (Full Page Delivery Invoice) or 'THERMAL' (4x6 / 80mm Sticker Slip)
  const [format, setFormat] = useState<'A4' | 'THERMAL'>('A4');

  if (!isOpen || orders.length === 0) return null;

  const handlePrint = () => {
    window.print();
  };

  const totalBatchAmount = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  const totalBatchItems = orders.reduce(
    (sum, o) => sum + o.items.reduce((itemSum, item) => itemSum + (item.quantity || 1), 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[96vh] print:max-h-none print:shadow-none print:border-none print:w-full">
        {/* Top Controls Bar (Hidden during window.print) */}
        <div className="px-6 py-3.5 bg-gradient-to-r from-emerald-950 to-[#005d42] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-emerald-300">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-white text-base">
                  Batch Order Receipts Print
                </h3>
                <span className="bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-full text-xs font-bold">
                  {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
                </span>
              </div>
              <p className="text-xs text-emerald-100/80 mt-0.5">
                {dateRangeLabel} • {totalBatchItems} Total Items • Total: ৳{totalBatchAmount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Format Toggle: Standard A4 vs Compact Thermal */}
            <div className="bg-white/10 p-1 rounded-xl border border-white/20 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setFormat('A4')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  format === 'A4'
                    ? 'bg-white text-[#005d42] shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/5'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Standard A4 Invoice</span>
              </button>
              <button
                type="button"
                onClick={() => setFormat('THERMAL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  format === 'THERMAL'
                    ? 'bg-white text-[#005d42] shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/5'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Compact Thermal (4x6)</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-white text-[#005d42] hover:bg-emerald-50 font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print All ({orders.length})</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Sheets Container */}
        <div className="p-6 overflow-y-auto space-y-8 bg-slate-100 print:bg-white print:p-0 print:space-y-0 print:overflow-visible">
          {/* Print Styles for clean page-breaks */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              @page {
                size: ${format === 'A4' ? 'A4 portrait' : '100mm 150mm'};
                margin: ${format === 'A4' ? '12mm' : '4mm'};
              }
              body {
                background: white !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .batch-print-sheet {
                page-break-after: always !important;
                break-after: page !important;
                margin-bottom: 0 !important;
                box-shadow: none !important;
                border: ${format === 'A4' ? 'none' : '1px solid #cbd5e1'} !important;
                border-radius: 0 !important;
                padding: ${format === 'A4' ? '0 !important' : '6mm !important'};
              }
              .batch-print-sheet:last-child {
                page-break-after: auto !important;
                break-after: auto !important;
              }
            }
          `}} />

          {orders.map((order, idx) => {
            const orderDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return format === 'A4' ? (
              /* ========================================================
                 FORMAT 1: STANDARD A4 DELIVERY INVOICE (1 ORDER PER PAGE)
                 ======================================================== */
              <div
                key={order.id}
                className="batch-print-sheet bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-slate-800 space-y-6 max-w-4xl mx-auto"
              >
                {/* Invoice Header */}
                <div className="flex items-start justify-between border-b pb-4 border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 relative shrink-0">
                      <Image
                        src="/images/logo.png"
                        alt="Research Agro Vet Ltd."
                        width={56}
                        height={56}
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <h1 className="text-xl font-extrabold text-[#005d42] leading-tight">
                        Research Agro Vet Ltd.
                      </h1>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Veterinary Pharmaceuticals, Medicated Feed Premix & Animal Care
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        DLS Reg: 126-18-(07)-006 • Hotline: 01711-234567 • www.researchagrovet.com
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">
                      DELIVERY INVOICE #{idx + 1} of {orders.length}
                    </span>
                    <span className="text-lg font-extrabold font-mono text-slate-900 block mt-0.5">
                      {order.orderNumber}
                    </span>
                    <span className="text-xs text-slate-500 block">
                      Date: {orderDate}
                    </span>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                      {order.orderType} • {order.paymentMethod}
                    </span>
                  </div>
                </div>

                {/* Customer Information Grid */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      DELIVER TO (CUSTOMER):
                    </span>
                    <p className="font-bold text-slate-900 text-sm">{order.customerName}</p>
                    <p className="font-mono font-bold text-slate-800 mt-0.5">
                      📞 {order.customerPhone}
                      {order.customerAltPhone && ` / ${order.customerAltPhone}`}
                    </p>
                    <p className="text-slate-600 mt-1 leading-relaxed">
                      {order.address}
                    </p>
                    <p className="text-slate-500 font-medium">
                      {order.upazila}, {order.district}
                    </p>
                  </div>

                  <div className="border-l border-slate-200 pl-4 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      COURIER & DISPATCH:
                    </span>
                    <p className="font-semibold text-slate-800">
                      Carrier: <span className="font-bold">{order.courierProvider || 'Standard Delivery'}</span>
                    </p>
                    {order.consignmentId && (
                      <p className="font-mono text-xs text-slate-600">
                        Consignment: <span className="font-bold">{order.consignmentId}</span>
                      </p>
                    )}
                    <div className="pt-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        PAYMENT STATUS:
                      </span>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold mt-0.5 ${
                          order.paymentStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.paymentStatus} — {order.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-300 bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3 w-10">#</th>
                      <th className="py-2.5 px-3">Medicine / Feed Premix Description</th>
                      <th className="py-2.5 px-3 text-center">SKU</th>
                      <th className="py-2.5 px-3 text-center">Pack Size</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Total (৳)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {order.items.map((item, itemIdx) => (
                      <tr key={item.id || itemIdx}>
                        <td className="py-2.5 px-3 font-mono text-slate-400">{itemIdx + 1}</td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-slate-900 block">{item.nameEn}</span>
                          {item.nameBn && (
                            <span className="text-[10px] text-slate-500 font-medium block">
                              {item.nameBn}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-500 font-bold">
                          {item.sku}
                        </td>
                        <td className="py-2.5 px-3 text-center font-semibold text-slate-700">
                          {item.packSize}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900 text-sm">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                          ৳{item.unitSellingPrice.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          ৳{item.lineTotal.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Summary & Due Settlement */}
                <div className="flex justify-end pt-2">
                  <div className="w-72 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal:</span>
                      <span className="font-mono font-semibold">৳{order.subtotal.toLocaleString()}</span>
                    </div>
                    {order.discountAmount > 0 && (
                      <div className="flex justify-between text-red-600 font-medium">
                        <span>Discount ({order.appliedDiscountLabel || 'Promo'}):</span>
                        <span className="font-mono">-৳{order.discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600">
                      <span>Delivery Fee:</span>
                      <span className="font-mono font-semibold">৳{order.shippingFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-300 pt-1.5 text-sm font-bold text-slate-900">
                      <span>Grand Total:</span>
                      <span className="font-mono text-base font-extrabold text-[#005d42]">
                        ৳{order.grandTotal.toLocaleString()}
                      </span>
                    </div>

                    <div className="mt-3 p-3 rounded-xl bg-slate-900 text-white flex items-center justify-between font-mono">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
                          {order.paymentMethod === 'COD' ? 'CASH ON DELIVERY (COD):' : 'PAYABLE / DUE:'}
                        </span>
                        <span className="text-lg font-extrabold text-amber-300">
                          ৳{(order.codCollectableAmount ?? order.dueAmount ?? order.grandTotal).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-right text-[10px] text-slate-400 font-sans">
                        <span>Paid: ৳{order.paidAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Notes */}
                <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Keep medicines stored in a cool & dry place below 30°C.</span>
                  <span>Thank you for choosing Research Agro Vet Ltd.</span>
                </div>
              </div>
            ) : (
              /* ========================================================
                 FORMAT 2: COMPACT THERMAL / 4x6 STICKER LABEL FORMAT
                 ======================================================== */
              <div
                key={order.id}
                className="batch-print-sheet bg-white rounded-xl shadow-sm border border-slate-300 p-5 text-slate-900 space-y-3 max-w-sm mx-auto font-sans"
              >
                {/* Brand & Order # */}
                <div className="text-center border-b pb-2.5 border-dashed border-slate-300">
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight uppercase">
                    Research Agro Vet Ltd.
                  </h2>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Veterinary Medicated Feed Premix
                  </p>
                  <div className="mt-2 py-1 px-2 rounded-md bg-slate-100 font-mono font-extrabold text-lg text-slate-900 tracking-wider">
                    #{order.orderNumber}
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Date: {orderDate} • {order.orderType}
                  </span>
                </div>

                {/* Recipient Details */}
                <div className="border-b pb-2.5 border-dashed border-slate-300 text-xs space-y-1">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">
                    DELIVERY DESTINATION:
                  </span>
                  <p className="font-extrabold text-sm text-slate-900">{order.customerName}</p>
                  <p className="font-mono font-bold text-slate-900 text-sm">
                    📞 {order.customerPhone}
                  </p>
                  <p className="text-xs text-slate-700 leading-snug">
                    {order.address}, {order.upazila}, {order.district}
                  </p>
                </div>

                {/* Items Summary */}
                <div className="border-b pb-2.5 border-dashed border-slate-300 text-xs">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    ORDER ITEMS ({order.items.length}):
                  </span>
                  <div className="space-y-1">
                    {order.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex justify-between items-start text-[11px]">
                        <span className="font-semibold text-slate-800 leading-tight">
                          {item.quantity}x {item.nameEn} ({item.packSize})
                        </span>
                        <span className="font-mono font-bold text-slate-900 shrink-0 ml-2">
                          ৳{item.lineTotal.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cash To Collect (COD) */}
                <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-300 text-center space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    {order.paymentMethod === 'COD' ? 'CASH TO COLLECT (COD):' : 'PAYMENT DUE:'}
                  </span>
                  <span className="text-xl font-extrabold text-slate-900 font-mono block">
                    ৳{(order.codCollectableAmount ?? order.dueAmount ?? order.grandTotal).toLocaleString()}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">
                    Method: {order.paymentMethod} • Status: {order.paymentStatus}
                  </span>
                </div>

                {/* Tracking & Courier */}
                <div className="text-[10px] text-slate-500 text-center pt-1">
                  <span>Carrier: {order.courierProvider || 'Standard'}</span>
                  {order.consignmentId && (
                    <span className="font-mono block font-bold text-slate-700">
                      CN: {order.consignmentId}
                    </span>
                  )}
                  <p className="mt-1 text-[9px] text-slate-400">
                    Hotline: 01711-234567 • Research Agro Vet
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

