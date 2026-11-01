'use client';

import React from 'react';
import Image from 'next/image';
import { X, Printer } from 'lucide-react';
import { AdminOrder } from '@/types/admin-order';

interface InvoicePrintModalProps {
  order: AdminOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function InvoicePrintModal({
  order,
  isOpen,
  onClose,
}: InvoicePrintModalProps) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh] print:max-h-none print:shadow-none print:border-none print:w-full">
        {/* Header Controls (Hidden during print) */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between print:hidden">
          <span className="font-bold text-slate-800 text-sm">
            Invoice Preview — #{order.orderNumber}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-[#005d42] hover:bg-[#004e37] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-8 overflow-y-auto space-y-6 text-slate-800 font-sans print:p-6">
          {/* Company Brand Header */}
          <div className="flex items-start justify-between border-b pb-4 border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 relative shrink-0">
                <Image
                  src="/images/logo.png"
                  alt="Research Agro Vet Ltd."
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-[#005d42] leading-tight">
                  Research Agro Vet Ltd.
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Veterinary Pharmaceuticals & Animal Healthcare
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  DLS Reg: 126-18-(07)-006 • Hotline: 01711-234567
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400 block">
                DELIVERY INVOICE
              </span>
              <span className="text-base font-extrabold font-mono text-slate-900 block mt-0.5">
                {order.orderNumber}
              </span>
              <span className="text-xs text-slate-500 block">
                Date: {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Customer & Courier Information */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50/70 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                CUSTOMER INFORMATION:
              </span>
              <p className="font-bold text-slate-900 text-sm">{order.customerName}</p>
              <p className="font-mono font-semibold text-slate-700 mt-0.5">{order.customerPhone}</p>
              <p className="text-slate-600 mt-1 leading-relaxed">{order.address}</p>
              <p className="text-slate-500 font-medium">
                {order.upazila}, {order.district}
              </p>
            </div>

            <div className="border-l pl-6 border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                LOGISTICS & COURIER:
              </span>
              <p className="font-bold text-slate-800">
                Courier: {order.courierProvider || 'STEADFAST'}
              </p>
              <p className="font-mono text-slate-600 mt-0.5">
                Consignment ID: {order.consignmentId || 'Pending'}
              </p>
              <p className="text-slate-600 mt-1">
                Payment Method: <strong className="font-semibold">{order.paymentMethod}</strong>
              </p>
              <p className="text-slate-600">
                Payment Status: <strong className="font-semibold">{order.paymentStatus}</strong>
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <div>
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 border-b border-slate-200">SL</th>
                  <th className="py-2.5 px-3 border-b border-slate-200">Medicine Description & Pack Size</th>
                  <th className="py-2.5 px-3 border-b border-slate-200">SKU</th>
                  <th className="py-2.5 px-3 border-b border-slate-200 text-center">Qty</th>
                  <th className="py-2.5 px-3 border-b border-slate-200 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 border-b border-slate-200 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.items.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="py-2.5 px-3 font-mono">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {item.nameEn}
                      <span className="text-slate-500 font-normal block text-[11px]">
                        {item.packSize}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{item.sku}</td>
                    <td className="py-2.5 px-3 text-center font-bold">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right font-mono">৳{item.unitSellingPrice}</td>
                    <td className="py-2.5 px-3 text-right font-bold font-mono">
                      ৳{item.lineTotal.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Calculation & Highlighted Due Box */}
          <div className="flex justify-between items-start gap-6 pt-2">
            <div className="flex-1 space-y-2">
              {order.adminNotes && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <span className="font-bold text-slate-700 block mb-0.5">
                    Veterinary Consultation Notes:
                  </span>
                  <p className="text-slate-600 italic">{order.adminNotes}</p>
                </div>
              )}
            </div>

            <div className="w-64 space-y-1.5 text-xs text-right">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal:</span>
                <span className="font-bold tabular-nums">৳{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Discount:</span>
                <span className="font-bold tabular-nums">-৳{order.discountAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Delivery Fee:</span>
                <span className="font-bold tabular-nums">৳{order.shippingFee}</span>
              </div>
              <div className="border-t pt-1 flex justify-between font-bold text-slate-900 text-sm">
                <span>Grand Total:</span>
                <span className="tabular-nums">৳{order.grandTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Paid Amount:</span>
                <span className="font-bold tabular-nums">৳{order.paidAmount}</span>
              </div>

              {/* COURIER DUE BANNER */}
              <div className="border-2 border-[#005d42] bg-emerald-50/80 p-2.5 rounded-lg text-center mt-2">
                <span className="text-[10px] font-bold text-[#005d42] uppercase tracking-wide block">
                  COURIER COLLECTABLE DUE (COD):
                </span>
                <span className="text-lg font-black text-[#005d42] tabular-nums block">
                  ৳{order.dueAmount.toLocaleString()} BDT
                </span>
              </div>
            </div>
          </div>

          {/* Footer Declaration */}
          <div className="border-t pt-4 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Thank you for partnering with Research Agro Vet Ltd.</span>
            <span>Computer-generated invoice; no physical signature required.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

