'use client';

import React, { useState, useEffect } from 'react';
import {
  AdminOrder,
  CourierProvider,
  DiscountSource,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  UpdateOrderPayload,
} from '@/types/admin-order';
import {
  X,
  Phone,
  MessageSquare,
  Save,
  Printer,
  Truck,
  Sparkles,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  CreditCard,
  DollarSign,
  Package,
  Layers,
  FileText,
  User,
  MapPin,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

interface OrderManageModalProps {
  order: AdminOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateOrder: (id: string, payload: UpdateOrderPayload) => Promise<void>;
  onPrintInvoice: (order: AdminOrder) => void;
}

export default function OrderManageModal({
  order,
  isOpen,
  onClose,
  onUpdateOrder,
  onPrintInvoice,
}: OrderManageModalProps) {
  const [activeTab, setActiveTab] = useState<'items' | 'payment' | 'logistics'>('items');

  // Form states
  const [discountType, setDiscountType] = useState<'UNIVERSAL_5' | 'CUSTOM'>('UNIVERSAL_5');
  const [customDiscountAmount, setCustomDiscountAmount] = useState<number>(0);
  const [discountLabel, setDiscountLabel] = useState<string>('Manager Special Rebate');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('UNPAID');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [trxId, setTrxId] = useState<string>('');

  const [orderStatus, setOrderStatus] = useState<OrderStatus>('PENDING');
  const [courierProvider, setCourierProvider] = useState<CourierProvider>('STEADFAST');
  const [consignmentId, setConsignmentId] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState<string>('');

  const [district, setDistrict] = useState<string>('');
  const [upazila, setUpazila] = useState<string>('');
  const [address, setAddress] = useState<string>('');

  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state whenever order opens/changes
  useEffect(() => {
    if (order) {
      setDiscountType(
        order.appliedDiscountSource === 'ADMIN_MANUAL' ? 'CUSTOM' : 'UNIVERSAL_5'
      );
      setCustomDiscountAmount(order.discountAmount || 0);
      setDiscountLabel(order.appliedDiscountLabel || 'Manager Special Rebate');

      setPaymentMethod(order.paymentMethod || 'COD');
      setPaymentStatus(order.paymentStatus || 'UNPAID');
      setPaidAmount(order.paidAmount || 0);
      setTrxId('');

      setOrderStatus(order.orderStatus || 'PENDING');
      setCourierProvider(order.courierProvider || 'STEADFAST');
      setConsignmentId(order.consignmentId || '');
      setAdminNotes(order.adminNotes || '');

      setDistrict(order.district || '');
      setUpazila(order.upazila || '');
      setAddress(order.address || '');

      setToastMessage(null);
      setActiveTab('items');
    }
  }, [order?.id, isOpen]);

  if (!isOpen || !order) return null;

  // Pricing calculations
  const subtotal = order.subtotal;
  const shippingFee = order.shippingFee;

  let calculatedDiscount = order.discountAmount;
  let calculatedDiscountSource: DiscountSource = order.appliedDiscountSource || 'GENERAL_STOREWIDE';
  let calculatedDiscountLabel = discountLabel;

  if (discountType === 'UNIVERSAL_5') {
    calculatedDiscount = Math.round(subtotal * 0.05);
    calculatedDiscountSource = 'GENERAL_STOREWIDE';
    calculatedDiscountLabel = 'Website 5% Universal Discount';
  } else if (discountType === 'CUSTOM') {
    calculatedDiscount = Number(customDiscountAmount) || 0;
    calculatedDiscountSource = 'ADMIN_MANUAL';
  }

  const grandTotal = Math.max(0, subtotal - calculatedDiscount + shippingFee);
  const dueAmount = Math.max(0, grandTotal - paidAmount);

  const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');

  const handleAutoGenerateConsignment = () => {
    const prefix = courierProvider === 'STEADFAST' ? 'SF' : 'AV';
    const rand = Math.floor(1000000 + Math.random() * 9000000);
    setConsignmentId(`${prefix}-${rand}`);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let combinedNotes = adminNotes;
      if (trxId.trim()) {
        combinedNotes = combinedNotes
          ? `${combinedNotes}\n[Payment TrxID: ${trxId.trim()}]`
          : `[Payment TrxID: ${trxId.trim()}]`;
      }

      await onUpdateOrder(order.id, {
        orderStatus,
        paymentStatus,
        paymentMethod,
        paidAmount,
        discountAmount: calculatedDiscount,
        appliedDiscountLabel: calculatedDiscountLabel,
        appliedDiscountSource: calculatedDiscountSource,
        shippingFee,
        courierProvider,
        consignmentId: consignmentId.trim() || null,
        adminNotes: combinedNotes.trim() || null,
        district: district.trim(),
        upazila: upazila.trim(),
        address: address.trim(),
      });

      setToastMessage('Order updated successfully!');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update order');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl  overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-[#005d42] text-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 text-white flex items-center justify-center shadow-inner shrink-0">
              <Package className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-white text-lg tracking-tight font-mono">
                  Order #{order.orderNumber}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-900 uppercase">
                  {orderStatus}
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-0.5 flex items-center gap-2 flex-wrap">
                <span>{order.customerName}</span>
                <span>•</span>
                <span className="font-mono font-semibold">{order.customerPhone}</span>
                <span>•</span>
                <span>{order.address || `${order.upazila}, ${order.district}`}</span>
              </p>
            </div>
          </div>

          {/* Quick Contact & Close */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <a
              href={`tel:${cleanPhone}`}
              className="bg-white text-[#005d42] hover:bg-emerald-50 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call ({cleanPhone.slice(-4)})</span>
            </a>

            <a
              href={`https://wa.me/88${cleanPhone}?text=${encodeURIComponent(
                `Hello ${order.customerName}, contacting you from Research Agro Vet Ltd regarding your order #${order.orderNumber}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#16A34A] text-white hover:bg-[#15803d] px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Stepper Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5">
          <div className="flex items-center gap-2 max-w-2xl">
            <button
              type="button"
              onClick={() => setActiveTab('items')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 border ${
                activeTab === 'items'
                  ? 'bg-white text-[#005d42] border-emerald-200 shadow-xs ring-2 ring-emerald-500/20'
                  : 'bg-transparent text-slate-600 border-transparent hover:bg-slate-200/60'
              }`}
            >
              <Layers className={`w-4 h-4 ${activeTab === 'items' ? 'text-[#005d42]' : 'text-slate-400'}`} />
              <span>1. Customer & Items ({order.items.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('payment')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 border ${
                activeTab === 'payment'
                  ? 'bg-white text-[#005d42] border-emerald-200 shadow-xs ring-2 ring-emerald-500/20'
                  : 'bg-transparent text-slate-600 border-transparent hover:bg-slate-200/60'
              }`}
            >
              <CreditCard className={`w-4 h-4 ${activeTab === 'payment' ? 'text-[#005d42]' : 'text-slate-400'}`} />
              <span>2. Discount & Payment</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('logistics')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 border ${
                activeTab === 'logistics'
                  ? 'bg-white text-[#005d42] border-emerald-200 shadow-xs ring-2 ring-emerald-500/20'
                  : 'bg-transparent text-slate-600 border-transparent hover:bg-slate-200/60'
              }`}
            >
              <Truck className={`w-4 h-4 ${activeTab === 'logistics' ? 'text-[#005d42]' : 'text-slate-400'}`} />
              <span>3. Courier & Logistics</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {toastMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* TAB 1: CUSTOMER & MEDICINES */}
          {activeTab === 'items' && (
            <div className="space-y-5">
              {/* Customer Delivery Snapshot */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <User className="w-4 h-4 text-[#005d42]" />
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Customer Delivery Address & Contact Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      District:
                    </label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-[#005d42]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Upazila / Thana:
                    </label>
                    <input
                      type="text"
                      value={upazila}
                      onChange={(e) => setUpazila(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-[#005d42]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Full Address / Farm Details:
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-[#005d42]"
                    />
                  </div>
                </div>

                {order.orderNote && (
                  <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900">
                    <strong>Customer Order Note:</strong> {order.orderNote}
                  </div>
                )}
              </div>

              {/* Medicines Itemized Table */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#005d42]" />
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Ordered Medicines ({order.items.length} items)
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    Total Units: {order.items.reduce((acc, i) => acc + i.quantity, 0)} pcs
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-100 rounded-xl overflow-hidden">
                    <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Medicine Name</th>
                        <th className="py-2.5 px-3">Pack Size</th>
                        <th className="py-2.5 px-3">SKU</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Unit Price</th>
                        <th className="py-2.5 px-3 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {order.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            {item.nameEn}
                            {item.nameBn && (
                              <span className="text-[11px] text-slate-500 block font-normal">
                                {item.nameBn}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-700">
                            {item.packSize}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">
                            {item.sku}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold">
                            {item.quantity}
                          </td>
                          <td className="py-2.5 px-3 text-right whitespace-nowrap">
                            <span className="text-slate-600 font-mono text-xs">
                              ৳{item.unitSellingPrice.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right whitespace-nowrap">
                            <span className="inline-block px-2.5 py-0.5 rounded-lg text-xs sm:text-[13px] font-extrabold text-[#005d42] bg-emerald-50 border border-emerald-200/90 tabular-nums shadow-2xs">
                              ৳{item.lineTotal.toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DISCOUNT & PAYMENT */}
          {activeTab === 'payment' && (
            <div className="space-y-5">
              {/* Step 1: Discount & Rebate Control */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span>Discount & Rebate Control</span>
                  </span>
                  <span className="text-[10px] font-bold text-[#005d42] bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                    Price Adjustment
                  </span>
                </div>

                
{/* Medicines Itemized Table */}
              <div className=" rounded-2xl bg-white space-y-3">
                {/* <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Ordered Medicines ({order.items.length} items)
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    Total Units: {order.items.reduce((acc, i) => acc + i.quantity, 0)} pcs
                  </span>
                </div> */}

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200/80 rounded-xl overflow-hidden">
                    <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Medicine Name</th>
                        <th className="py-2.5 px-3">Pack Size</th>
                        <th className="py-2.5 px-3">SKU</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Unit Price</th>
                        <th className="py-2.5 px-3 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {order.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            {item.nameEn}
                            {item.nameBn && (
                              <span className="text-[11px] text-slate-500 block font-normal">
                                {item.nameBn}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-700">
                            {item.packSize}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">
                            {item.sku}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold">
                            {item.quantity}
                          </td>
                          <td className="py-2.5 px-3 text-right whitespace-nowrap">
                            <span className="text-slate-600 font-mono text-xs">
                              ৳{item.unitSellingPrice.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right whitespace-nowrap">
                            <span className="inline-block px-2.5 py-0.5 rounded-lg text-xs sm:text-[13px] font-extrabold text-[#005d42] bg-emerald-50 border border-emerald-200/90 tabular-nums shadow-2xs">
                              ৳{item.lineTotal.toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

                

                <div className="flex items-center justify-between text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <span>Subtotal: <strong>৳{subtotal.toLocaleString()}</strong></span>
                  <span className="text-slate-300">•</span>
                  <span>Delivery Fee: <strong>৳{shippingFee}</strong></span>
                  <span className="text-slate-300">•</span>
                  <span>Discount: <strong className="text-red-600">-৳{calculatedDiscount}</strong></span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition-all">
                    <input
                      type="radio"
                      name="modalDiscountType"
                      checked={discountType === 'UNIVERSAL_5'}
                      onChange={() => setDiscountType('UNIVERSAL_5')}
                      className="text-[#005d42] focus:ring-0 mt-0.5"
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 text-xs">
                        Universal 5% Discount Applied (৳{Math.round(subtotal * 0.05)})
                      </span>
                      <span className="text-[11px] text-slate-500 mt-0.5">
                        Default 5% storewide checkout discount
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition-all">
                    <input
                      type="radio"
                      name="modalDiscountType"
                      checked={discountType === 'CUSTOM'}
                      onChange={() => setDiscountType('CUSTOM')}
                      className="text-[#005d42] focus:ring-0 mt-0.5"
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-[#005d42] text-xs">
                        Manager Special Rebate (Custom ৳)
                      </span>
                      <span className="text-[11px] text-slate-500 mt-0.5">
                        Set a custom telephone discount or farmer rebate
                      </span>
                    </div>
                  </label>
                </div>

                {discountType === 'CUSTOM' && (
                  <div className="grid grid-cols-2 gap-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Discount Amount (BDT):
                      </label>
                      <input
                        type="number"
                        value={customDiscountAmount}
                        onChange={(e) => setCustomDiscountAmount(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold font-mono outline-none focus:ring-2 focus:ring-[#005d42]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Discount Reason / Label:
                      </label>
                      <input
                        type="text"
                        value={discountLabel}
                        onChange={(e) => setDiscountLabel(e.target.value)}
                        placeholder="e.g. VIP Farmer Phone Rebate"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-[#005d42]"
                      />
                    </div>
                  </div>
                )}

                <div className="bg-[#005d42] text-white p-3.5 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-medium">Recalculated Grand Total:</span>
                  <span className="text-xl font-extrabold text-amber-300 tabular-nums">
                    ৳{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Step 2: Payment Recording */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <CreditCard className="w-4 h-4 text-[#005d42]" />
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Payment Recording & Transactions
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Payment Method:
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white outline-none focus:ring-2 focus:ring-[#005d42] font-medium"
                    >
                      <option value="COD">CASH ON DELIVERY (COD)</option>
                      <option value="PARTIAL_ADVANCE">BKASH (Merchant / Direct)</option>
                      <option value="SSLCOMMERZ">ONLINE PAYMENT (SSLCommerz)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Payment Status:
                    </label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white outline-none focus:ring-2 focus:ring-[#005d42] font-bold text-[#005d42]"
                    >
                      <option value="UNPAID">UNPAID</option>
                      <option value="PARTIAL">PARTIAL</option>
                      <option value="PAID">PAID</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Paid Amount (BDT):
                    </label>
                    <input
                      type="number"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white outline-none font-bold tabular-nums focus:ring-2 focus:ring-[#005d42]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      TrxID / Sender Phone Number:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. BJI982KL1M"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white outline-none font-mono uppercase focus:ring-2 focus:ring-[#005d42]"
                    />
                  </div>
                </div>

                {/* Highlighted Due Badge */}
                <div className="p-3.5 bg-amber-500/15 border border-amber-500/30 rounded-xl flex items-center justify-between text-amber-950">
                  <div className="flex items-center gap-2.5">
                    <Truck className="w-5 h-5 text-amber-700 shrink-0" />
                    <div>
                      <span className="font-bold text-xs uppercase tracking-wide block">
                        Courier Collectable Due (COD):
                      </span>
                      <span className="text-[11px] text-amber-800">
                        This amount will be printed on the invoice and consignment slip
                      </span>
                    </div>
                  </div>
                  <span className="text-2xl font-black text-amber-900 tabular-nums">
                    ৳{dueAmount.toLocaleString()} BDT
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LOGISTICS & TELE-NOTES */}
          {activeTab === 'logistics' && (
            <div className="space-y-5">
              {/* Courier & Dispatch Logistics */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#005d42]" />
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Courier Selection & Consignment Tracking
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                    Logistics Ready
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Update Order Status:
                    </label>
                    <select
                      value={orderStatus}
                      onChange={(e) => setOrderStatus(e.target.value as OrderStatus)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white outline-none focus:ring-2 focus:ring-[#005d42] font-bold text-[#005d42]"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED (Tele-verified)</option>
                      <option value="PACKED">PACKED</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Assigned Courier Partner:
                    </label>
                    <select
                      value={courierProvider}
                      onChange={(e) =>
                        setCourierProvider(e.target.value as CourierProvider)
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white outline-none focus:ring-2 focus:ring-[#005d42] font-semibold"
                    >
                      <option value="STEADFAST">STEADFAST COURIER</option>
                      <option value="PATHAO">PATHAO EXPRESS (Cold-Chain)</option>
                      <option value="REDX">REDX LOGISTICS</option>
                      <option value="SUNDARBAN">SUNDARBAN COURIER</option>
                      <option value="MANUAL">MANUAL DELIVERY / PICKUP</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Consignment / Tracking ID:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. SF-8829104"
                      value={consignmentId}
                      onChange={(e) => setConsignmentId(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-[#005d42]"
                    />
                    <button
                      type="button"
                      onClick={handleAutoGenerateConsignment}
                      className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors shrink-0"
                    >
                      Auto-Generate
                    </button>
                  </div>
                </div>
              </div>

              {/* Veterinary Consultation Notes */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-[#005d42]" />
                  <span>Veterinary Tele-Consultation & Follow-up Notes:</span>
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record dosage instructions given to the farmer, lactation advice, or tele-consultation follow-up notes..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-[#005d42] bg-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPrintInvoice(order)}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <Printer className="w-4 h-4 text-[#005d42]" />
              <span>Print Invoice</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {activeTab === 'items' && (
              <button
                type="button"
                onClick={() => setActiveTab('payment')}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            {activeTab === 'payment' && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab('items')}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Step</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('logistics')}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
            {activeTab === 'logistics' && (
              <button
                type="button"
                onClick={() => setActiveTab('payment')}
                className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-[#005d42] hover:bg-[#004e37] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

