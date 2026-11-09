'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from '@heroui/react';
import {
  X,
  Search,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  User,
  ShoppingCart,
  CreditCard,
  FileText,
  Loader2,
  CheckCircle2,
  PlusCircle,
  Phone,
  MapPin,
  Check,
  ChevronDown,
} from 'lucide-react';
import { BANGLADESH_DISTRICTS } from '@/constants/districts';
import { bdPhoneRegex } from '@/lib/validators';
import { authorizedFetch, getApiUrl } from '@/lib/api-client';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ManualOrderFormState {
  // Step 1
  customerPhone: string;
  customerName: string;
  customerAltPhone: string;
  district: string;
  upazila: string;
  address: string;
  buyerMode: 'RETAIL' | 'WHOLESALE';

  // Step 2
  items: Array<{
    variantId: string;
    productName: string;
    packSize: string;
    unitSellingPrice: number;
    unitMrpPrice?: number;
    quantity: number;
  }>;

  // Step 3
  discountAmount: number;
  shippingFee: number;
  paymentMethod: string;
  paidAmount: number;

  // Step 4
  orderSource: 'STORE' | 'PHONE' | 'WHATSAPP' | 'FACEBOOK' | 'WALK_IN' | 'OTHER';
  adminNotes: string;
  orderNote: string;
}

interface ManualOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (orderNumber: string) => void;
}

interface ProductVariant {
  id: string;
  packSize: string;
  sellingPrice: number;
  mrpPrice: number;
  tradePrice: number;
  stockQuantity: number;
}

interface ProductSearchResult {
  id: string;
  nameEn: string;
  nameBn?: string | null;
  formFactor?: string;
  variants: ProductVariant[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STEP_LABELS = [
  { id: 1, label: 'Customer Info', icon: User },
  { id: 2, label: 'Order Items', icon: ShoppingCart },
  { id: 3, label: 'Pricing & Payment', icon: CreditCard },
  { id: 4, label: 'Source & Notes', icon: FileText },
];

const PAYMENT_METHODS = [
  { value: 'COD', label: 'Cash on Delivery (COD)' },
  { value: 'BKASH', label: 'bKash' },
  { value: 'NAGAD', label: 'Nagad' },
  { value: 'ROCKET', label: 'Rocket' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CARD', label: 'Card' },
];

const ORDER_SOURCES = [
  { value: 'STORE', label: 'Store Sale', emoji: '🏪' },
  { value: 'WALK_IN', label: 'Walk-in', emoji: '🚶' },
  { value: 'PHONE', label: 'Phone Call', emoji: '📞' },
  { value: 'WHATSAPP', label: 'WhatsApp', emoji: '💬' },
  { value: 'FACEBOOK', label: 'Facebook', emoji: '📘' },
  { value: 'OTHER', label: 'Other', emoji: '🔗' },
];

function getDefaultShipping(district: string): number {
  const d = BANGLADESH_DISTRICTS.find(
    (d) => d.nameEn.toLowerCase() === district.toLowerCase()
  );
  return d?.isDhaka ? 70 : 130;
}

function computePaymentStatus(
  grandTotal: number,
  paidAmount: number
): 'UNPAID' | 'PARTIAL' | 'PAID' {
  if (paidAmount <= 0) return 'UNPAID';
  if (paidAmount >= grandTotal) return 'PAID';
  return 'PARTIAL';
}

const INPUT_CLASS =
  'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white';
const LABEL_CLASS = 'text-sm font-semibold text-slate-700 mb-1 block';
const ERROR_CLASS = 'text-xs text-red-500 mt-1';
const SECTION_HEADER = 'text-sm font-semibold text-slate-700 mb-3';

// ─── Searchable District Select Component ─────────────────────────────────────

interface SearchableDistrictSelectProps {
  value: string;
  onChange: (district: string) => void;
  error?: string;
}

function SearchableDistrictSelect({
  value,
  onChange,
  error,
}: SearchableDistrictSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredDistricts = BANGLADESH_DISTRICTS.filter(
    (d) =>
      d.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      d.nameBn.includes(search)
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedDistrictObj = BANGLADESH_DISTRICTS.find(
    (d) => d.nameEn.toLowerCase() === (value || '').toLowerCase()
  );

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between border rounded-lg px-3 py-2 text-sm bg-white transition-all text-left shadow-xs ${
          error
            ? 'border-red-400 ring-1 ring-red-400'
            : isOpen
            ? 'border-emerald-500 ring-2 ring-emerald-500/20'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <span className="flex items-center gap-2 truncate">
          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
          {selectedDistrictObj ? (
            <span className="font-medium text-slate-800">
              {selectedDistrictObj.nameEn}{' '}
              <span className="text-slate-400 font-normal">
                ({selectedDistrictObj.nameBn})
              </span>
              {selectedDistrictObj.nameEn === 'Pabna' && (
                <span className="ml-2 text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full inline-block align-middle">
                  Store Default
                </span>
              )}
            </span>
          ) : (
            <span className="text-slate-400">— Select District —</span>
          )}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ml-1 ${
            isOpen ? 'rotate-180 text-emerald-600' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Search district (English or Bangla)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs focus:outline-none placeholder:text-slate-400 text-slate-800"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-xs text-slate-400 hover:text-slate-600 px-1"
              >
                Clear
              </button>
            )}
          </div>

          <div className="max-h-56 overflow-y-auto divide-y divide-slate-50 p-1">
            {filteredDistricts.length === 0 ? (
              <p className="text-xs text-slate-400 p-3 text-center">
                No matching district found
              </p>
            ) : (
              filteredDistricts.map((d) => {
                const isSelected = d.nameEn.toLowerCase() === (value || '').toLowerCase();
                const isPabna = d.nameEn === 'Pabna';
                return (
                  <button
                    key={d.nameEn}
                    type="button"
                    onClick={() => {
                      onChange(d.nameEn);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors text-left ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-900 font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{d.nameEn}</span>
                      <span className="text-slate-400">({d.nameBn})</span>
                      {isPabna && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-medium">
                          Store
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && <p className={ERROR_CLASS}>{error}</p>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ManualOrderModal({
  isOpen,
  onClose,
  onSuccess,
}: ManualOrderModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Customer lookup state
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [returningCustomer, setReturningCustomer] = useState<{
    name: string;
    previousOrderCount: number;
  } | null>(null);

  // Product search state
  const [productQuery, setProductQuery] = useState('');
  const [productResults, setProductResults] = useState<ProductSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Form state
  const [form, setForm] = useState<ManualOrderFormState>({
    customerPhone: '',
    customerName: '',
    customerAltPhone: '',
    district: 'Pabna',
    upazila: '',
    address: '',
    buyerMode: 'RETAIL',
    items: [],
    discountAmount: 0,
    shippingFee: 0,
    paymentMethod: 'COD',
    paidAmount: 0,
    orderSource: 'STORE',
    adminNotes: 'Store',
    orderNote: '',
  });

  // Mutually exclusive discount mode
  const [discountMode, setDiscountMode] = useState<'NONE' | 'INDIVIDUAL_PRODUCT' | 'UNIVERSAL_5' | 'CUSTOM'>('NONE');
  const [customDiscountAmount, setCustomDiscountAmount] = useState<number>(0);
  const [customDiscountReason, setCustomDiscountReason] = useState<string>('Manager Custom Rebate');

  // Dynamic Universal Discount
  const [universalDiscount, setUniversalDiscount] = useState<{
    enabled: boolean;
    percent: number;
    label: string;
  }>({ enabled: true, percent: 5, label: 'Website 5% Universal Discount' });

  useEffect(() => {
    if (isOpen) {
      fetch(getApiUrl('/api/discounts/universal'))
        .then((res) => res.json())
        .then((res) => {
          if (res?.data) {
            setUniversalDiscount(res.data);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setErrors({});
      setReturningCustomer(null);
      setProductQuery('');
      setProductResults([]);
      setShowDropdown(false);
      setDiscountMode('NONE');
      setCustomDiscountAmount(0);
      setCustomDiscountReason('Manager Custom Rebate');
      setForm({
        customerPhone: '',
        customerName: '',
        customerAltPhone: '',
        district: 'Pabna',
        upazila: '',
        address: '',
        buyerMode: 'RETAIL',
        items: [],
        discountAmount: 0,
        shippingFee: 0,
        paymentMethod: 'COD',
        paidAmount: 0,
        orderSource: 'STORE',
        adminNotes: 'Store',
        orderNote: '',
      });
    }
  }, [isOpen]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ─── Computed values ──────────────────────────────────────────────────────

  const subtotal = form.items.reduce(
    (sum, item) => sum + item.unitSellingPrice * item.quantity,
    0
  );

  // Individual product discount sum across items (when sellingPrice < mrpPrice)
  const totalIndividualDiscount = form.items.reduce((acc, item) => {
    const mrp = item.unitMrpPrice || item.unitSellingPrice;
    const saving = Math.max(0, mrp - item.unitSellingPrice);
    return acc + saving * item.quantity;
  }, 0);

  let activeDiscountAmount = 0;
  let activeDiscountSource: string | null = null;
  let activeDiscountLabel: string | null = null;

  if (discountMode === 'NONE') {
    activeDiscountAmount = 0;
    activeDiscountSource = null;
    activeDiscountLabel = null;
  } else if (discountMode === 'INDIVIDUAL_PRODUCT') {
    activeDiscountAmount = totalIndividualDiscount;
    activeDiscountSource = 'INDIVIDUAL_PRODUCT';
    activeDiscountLabel = 'Individual Product Promotional Discount';
  } else if (discountMode === 'UNIVERSAL_5') {
    const universalPct = universalDiscount.enabled ? universalDiscount.percent : 0;
    activeDiscountAmount = Math.round(subtotal * (universalPct / 100));
    activeDiscountSource = 'GENERAL_STOREWIDE';
    activeDiscountLabel = universalDiscount.label || `Website ${universalDiscount.percent}% Universal Discount`;
  } else if (discountMode === 'CUSTOM') {
    activeDiscountAmount = Math.max(0, customDiscountAmount);
    activeDiscountSource = 'ADMIN_MANUAL';
    activeDiscountLabel = customDiscountReason.trim() || 'Manager Custom Rebate';
  }

  const grandTotal = Math.max(0, subtotal - activeDiscountAmount + form.shippingFee);
  const dueAmount = Math.max(0, grandTotal - form.paidAmount);
  const paymentStatus = computePaymentStatus(grandTotal, form.paidAmount);

  // ─── Customer lookup ──────────────────────────────────────────────────────

  const handlePhoneLookup = async () => {
    if (!bdPhoneRegex.test(form.customerPhone)) {
      setErrors((prev) => ({
        ...prev,
        customerPhone: 'Enter a valid 11-digit BD phone number (01XXXXXXXXX)',
      }));
      return;
    }
    setErrors((prev) => ({ ...prev, customerPhone: '' }));
    setIsLookingUp(true);
    try {
      const res = await fetch(getApiUrl(`/api/orders/lookup?phone=${form.customerPhone}`));
      const data = await res.json();
      if (data.success && data.customer) {
        const c = data.customer;
        setForm((prev) => ({
          ...prev,
          customerName: c.name || prev.customerName,
          district: c.district || prev.district,
          upazila: c.upazila || prev.upazila,
          address: c.address || prev.address,
        }));
        setReturningCustomer({
          name: c.name,
          previousOrderCount: c.orderCount ?? 0,
        });
        toast.success('Customer found!', {
          description: `${c.name} — ${c.orderCount ?? 0} previous order(s)`,
        });
      } else {
        setReturningCustomer(null);
        toast.info('No existing customer found for this number.');
      }
    } catch {
      toast.danger('Lookup failed. Please try again.');
    } finally {
      setIsLookingUp(false);
    }
  };

  // ─── Product search ───────────────────────────────────────────────────────

  const searchProducts = useCallback(async (q: string) => {
    if (!q.trim()) {
      setProductResults([]);
      setShowDropdown(false);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(
        getApiUrl(`/api/admin/products?q=${encodeURIComponent(q.trim())}`),
        { credentials: 'include' }
      );
      const data = await res.json();
      const list: ProductSearchResult[] = data.products ?? data ?? [];
      setProductResults(list);
      setShowDropdown(list.length > 0);
    } catch {
      setProductResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleProductQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setProductQuery(val);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => searchProducts(val), 400);
  };

  const handleSelectVariant = (
    product: ProductSearchResult,
    variant: ProductVariant
  ) => {
    // If this variant already exists, increment qty
    const existing = form.items.findIndex((i) => i.variantId === variant.id);
    if (existing !== -1) {
      setForm((prev) => ({
        ...prev,
        items: prev.items.map((item, idx) =>
          idx === existing ? { ...item, quantity: item.quantity + 1 } : item
        ),
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        items: [
          ...prev.items,
          {
            variantId: variant.id,
            productName: product.nameEn,
            packSize: variant.packSize,
            unitSellingPrice: Number(variant.sellingPrice || variant.mrpPrice),
            unitMrpPrice: Number(variant.mrpPrice),
            quantity: 1,
          },
        ],
      }));
    }
    setProductQuery('');
    setShowDropdown(false);
    setErrors((prev) => ({ ...prev, items: '' }));
  };

  const handleUpdateItemQty = (idx: number, qty: number) => {
    if (qty < 1) return;
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === idx ? { ...item, quantity: qty } : item
      ),
    }));
  };


  const handleRemoveItem = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  };

  // ─── Validation (Only runs on final Submit click) ───────────────────────

  const validateFinal = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Customer info validations
    if (!form.customerPhone.trim() || !bdPhoneRegex.test(form.customerPhone)) {
      newErrors.customerPhone = 'Valid 11-digit BD phone required (01XXXXXXXXX)';
    }
    if (!form.customerName.trim() || form.customerName.trim().length < 2) {
      newErrors.customerName = 'Customer name is required (min 2 chars)';
    }
    if (
      form.customerAltPhone &&
      form.customerAltPhone.trim() &&
      !bdPhoneRegex.test(form.customerAltPhone)
    ) {
      newErrors.customerAltPhone = 'Invalid alternate phone number';
    }
    if (!form.district) {
      newErrors.district = 'Please select a district';
    }
    if (!form.upazila.trim()) {
      newErrors.upazila = 'Upazila / Thana is required';
    }
    if (!form.address.trim() || form.address.trim().length < 5) {
      newErrors.address = 'Detailed address is required (min 5 chars)';
    }

    // Cart items validation
    if (!form.items || form.items.length === 0) {
      newErrors.items = 'At least one product item is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      if (
        newErrors.customerPhone ||
        newErrors.customerName ||
        newErrors.customerAltPhone ||
        newErrors.district ||
        newErrors.upazila ||
        newErrors.address
      ) {
        setCurrentStep(1);
        toast.danger('Customer info incomplete', {
          description: Object.values(newErrors)[0],
        });
      } else if (newErrors.items) {
        setCurrentStep(2);
        toast.danger('Cart is empty', {
          description: 'Please search and add at least one product before submitting.',
        });
      }
      return false;
    }

    return true;
  };

  // Freely move between steps without blocking
  const handleNext = () => {
    setCurrentStep((s) => Math.min(s + 1, 4));
  };

  const handleBack = () => {
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  // ─── Submit (Final event validation) ──────────────────────────────────────

  const handleSubmit = async () => {
    if (!validateFinal()) return;
    setIsSubmitting(true);
    try {
      const payload = {
        customerPhone: form.customerPhone,
        customerName: form.customerName,
        customerAltPhone: form.customerAltPhone || undefined,
        district: form.district,
        upazila: form.upazila,
        address: form.address,
        buyerMode: form.buyerMode,
        items: form.items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
          unitSellingPrice: item.unitSellingPrice,
        })),
        discountAmount: activeDiscountAmount,
        appliedDiscountSource: activeDiscountSource,
        appliedDiscountLabel: activeDiscountLabel,
        shippingFee: form.shippingFee,
        paymentMethod: form.paymentMethod,
        paidAmount: form.paidAmount,
        paymentStatus: computePaymentStatus(grandTotal, form.paidAmount),
        orderSource: form.orderSource,
        adminNotes: form.adminNotes || undefined,
        orderNote: form.orderNote || undefined,
      };

      const res = await authorizedFetch('/api/admin/orders/manual', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to create order');
      }

      const orderNumber: string = data.orderNumber ?? data.order?.orderNumber ?? '';
      toast.success(`✅ Order ${orderNumber} created successfully`);
      onSuccess(orderNumber);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      toast.danger('Failed to create order', { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-emerald-900 to-[#005d42] text-white p-5 flex items-center justify-between gap-4 shadow-xs shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center shrink-0">
              <PlusCircle className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base tracking-tight">
                Create Manual Order
              </h2>
              <p className="text-xs text-emerald-100/80 mt-0.5">
                Admin-placed order — Research Agro Vet
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Step Indicators ─────────────────────────────────────────────── */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 shrink-0">
          <div className="flex items-center gap-1">
            {STEP_LABELS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isDone = currentStep > step.id;
              return (
                <React.Fragment key={step.id}>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(step.id)}
                    className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                      isActive
                        ? 'bg-white text-[#005d42] border-emerald-300 shadow-xs ring-2 ring-emerald-500/20'
                        : isDone
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <Icon
                        className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#005d42]' : 'text-slate-400'}`}
                      />
                    )}
                    <span className="hidden sm:inline">{step.label}</span>
                    <span className="sm:hidden">{step.id}</span>
                  </button>
                  {idx < STEP_LABELS.length - 1 && (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* ── Scrollable Body ──────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* ════════════════════════════════════════════════════════════════
              STEP 1: CUSTOMER INFO
          ════════════════════════════════════════════════════════════════ */}
          {currentStep === 1 && (
            <div className="space-y-5">
              {/* Phone Lookup */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <h3 className={SECTION_HEADER}>📞 Phone Lookup</h3>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      value={form.customerPhone}
                      onChange={(e) => {
                        setForm((prev) => ({
                          ...prev,
                          customerPhone: e.target.value,
                        }));
                        setErrors((prev) => ({ ...prev, customerPhone: '' }));
                        setReturningCustomer(null);
                      }}
                      maxLength={11}
                      className={INPUT_CLASS}
                    />
                    {errors.customerPhone && (
                      <p className={ERROR_CLASS}>{errors.customerPhone}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handlePhoneLookup}
                    disabled={isLookingUp}
                    className="px-4 py-2 rounded-lg bg-[#005d42] hover:bg-[#004e37] text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-60 transition-colors shrink-0"
                  >
                    {isLookingUp ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Phone className="w-4 h-4" />
                    )}
                    Lookup
                  </button>
                </div>

                {/* Returning Customer Badge */}
                {returningCustomer && (
                  <div className="flex items-center gap-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-emerald-800">
                        Returning Customer
                      </span>
                      <p className="text-xs text-emerald-700">
                        {returningCustomer.name} •{' '}
                        {returningCustomer.previousOrderCount} previous order
                        {returningCustomer.previousOrderCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Customer Details */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <h3 className={SECTION_HEADER}>👤 Customer Details</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL_CLASS}>
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Full customer name"
                      value={form.customerName}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          customerName: e.target.value,
                        }))
                      }
                      className={INPUT_CLASS}
                    />
                    {errors.customerName && (
                      <p className={ERROR_CLASS}>{errors.customerName}</p>
                    )}
                  </div>

                  <div>
                    <label className={LABEL_CLASS}>Alternate Phone</label>
                    <input
                      type="tel"
                      placeholder="01XXXXXXXXX (optional)"
                      value={form.customerAltPhone}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          customerAltPhone: e.target.value,
                        }))
                      }
                      maxLength={11}
                      className={INPUT_CLASS}
                    />
                    {errors.customerAltPhone && (
                      <p className={ERROR_CLASS}>{errors.customerAltPhone}</p>
                    )}
                  </div>
                </div>



                {/* District */}
                <div>
                  <label className={LABEL_CLASS}>
                    District <span className="text-red-500">*</span>
                  </label>
                  <SearchableDistrictSelect
                    value={form.district}
                    onChange={(selectedDistrict) =>
                      setForm((prev) => ({
                        ...prev,
                        district: selectedDistrict,
                      }))
                    }
                    error={errors.district}
                  />
                </div>

                {/* Upazila */}
                <div>
                  <label className={LABEL_CLASS}>
                    Upazila / Thana <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Savar, Dhamrai, Mirpur"
                    value={form.upazila}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, upazila: e.target.value }))
                    }
                    className={INPUT_CLASS}
                  />
                  {errors.upazila && (
                    <p className={ERROR_CLASS}>{errors.upazila}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className={LABEL_CLASS}>
                    Full Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Village / Road / Farm name, nearest landmark..."
                    value={form.address}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, address: e.target.value }))
                    }
                    className={INPUT_CLASS}
                  />
                  {errors.address && (
                    <p className={ERROR_CLASS}>{errors.address}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              STEP 2: ORDER ITEMS
          ════════════════════════════════════════════════════════════════ */}
          {currentStep === 2 && (
            <div className="space-y-5">
              {/* Product Search */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <h3 className={SECTION_HEADER}>🔍 Search & Add Products</h3>
                <div className="relative" ref={dropdownRef}>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search by product name or SKU..."
                      value={productQuery}
                      onChange={handleProductQueryChange}
                      onFocus={() =>
                        productResults.length > 0 && setShowDropdown(true)
                      }
                      className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                    {isSearching && (
                      <Loader2 className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 animate-spin" />
                    )}
                  </div>

                  {/* Dropdown */}
                  {showDropdown && productResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-72 overflow-y-auto">
                      {productResults.map((product) => (
                        <div key={product.id}>
                          <div className="px-3 pt-2.5 pb-1">
                            <span className="text-xs font-bold text-slate-900">
                              {product.nameEn}
                            </span>
                            {product.nameBn && (
                              <span className="text-xs text-slate-500 ml-1.5">
                                {product.nameBn}
                              </span>
                            )}
                          </div>
                          {product.variants.map((variant) => (
                            <button
                              key={variant.id}
                              type="button"
                              onClick={() =>
                                handleSelectVariant(product, variant)
                              }
                              className="w-full text-left px-4 py-2 hover:bg-emerald-50 flex items-center justify-between gap-2 group transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <Plus className="w-3.5 h-3.5 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                <span className="text-sm text-slate-700 font-medium">
                                  {variant.packSize}
                                </span>
                              </div>
                              <span className="text-xs font-bold text-[#005d42] font-mono">
                                ৳{variant.sellingPrice.toLocaleString()}
                              </span>
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {errors.items && (
                  <p className={ERROR_CLASS}>{errors.items}</p>
                )}
              </div>

              {/* Items Table */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <h3 className={`${SECTION_HEADER} flex items-center justify-between`}>
                  <span>🛒 Order Items ({form.items.length})</span>
                  {form.items.length > 0 && (
                    <span className="text-xs text-slate-500 font-normal">
                      Subtotal:{' '}
                      <strong className="text-[#005d42] font-mono">
                        ৳{subtotal.toLocaleString()}
                      </strong>
                    </span>
                  )}
                </h3>

                {form.items.length === 0 ? (
                  <div className="py-10 text-center text-sm text-slate-400 border border-dashed border-slate-200 rounded-xl">
                    No items added yet. Search for a product above.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-slate-100 rounded-xl overflow-hidden">
                      <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3">Product / Pack Size</th>
                          <th className="py-2.5 px-3 text-right">Unit Price (৳)</th>
                          <th className="py-2.5 px-3 text-center">Qty</th>
                          <th className="py-2.5 px-3 text-right">Line Total</th>
                          <th className="py-2.5 px-2 text-center">×</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {form.items.map((item, idx) => (
                          <tr key={item.variantId} className="hover:bg-slate-50/60">
                            <td className="py-2.5 px-3">
                              <span className="font-semibold text-slate-900 block">
                                {item.productName}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {item.packSize}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <span className="font-mono font-semibold text-slate-800 text-xs">
                                ৳{item.unitSellingPrice.toLocaleString()}
                              </span>
                              {item.unitMrpPrice && item.unitMrpPrice > item.unitSellingPrice && (
                                <span className="block text-[10px] text-slate-400 line-through">
                                  ৳{item.unitMrpPrice.toLocaleString()}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) =>
                                  handleUpdateItemQty(idx, Number(e.target.value))
                                }
                                className="w-14 border border-slate-200 rounded-md px-2 py-1 text-xs text-center font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <span className="inline-block px-2.5 py-0.5 rounded-lg text-xs font-extrabold text-[#005d42] bg-emerald-50 border border-emerald-200/90 tabular-nums">
                                ৳
                                {(
                                  item.unitSellingPrice * item.quantity
                                ).toLocaleString()}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="w-6 h-6 rounded-full bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors mx-auto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              STEP 3: PRICING & PAYMENT
          ════════════════════════════════════════════════════════════════ */}
          {currentStep === 3 && (
            <div className="space-y-5">
              {/* Pricing Summary Card */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <h3 className={SECTION_HEADER}>💰 Pricing Summary</h3>

                <div className="space-y-2">
                  {/* Subtotal */}
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-600">Subtotal</span>
                    <span className="font-mono font-bold text-slate-900">
                      ৳{subtotal.toLocaleString()}
                    </span>
                  </div>

                  {/* Mutually Exclusive Discount Policy */}
                  <div className="py-3 border-b border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700">Order Discount Policy</span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Active: -৳{activeDiscountAmount.toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {/* Option 1: No Discount */}
                      <label className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        discountMode === 'NONE'
                          ? 'bg-slate-100 border-slate-400 ring-1 ring-slate-400 font-semibold'
                          : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/50'
                      }`}>
                        <input
                          type="radio"
                          name="manualOrderDiscountMode"
                          checked={discountMode === 'NONE'}
                          onChange={() => setDiscountMode('NONE')}
                          className="text-[#005d42] mt-0.5"
                        />
                        <div>
                          <p className="text-slate-800">🚫 No Discount (৳0)</p>
                          <p className="text-[11px] text-slate-500 font-normal">Full regular pricing</p>
                        </div>
                      </label>

                      {/* Option 2: Individual Product Discount */}
                      <label className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        discountMode === 'INDIVIDUAL_PRODUCT'
                          ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 font-semibold'
                          : totalIndividualDiscount > 0
                          ? 'bg-slate-50/70 border-slate-200 hover:bg-emerald-50/30'
                          : 'opacity-60 bg-slate-50/40 border-slate-200 cursor-not-allowed'
                      }`}>
                        <input
                          type="radio"
                          name="manualOrderDiscountMode"
                          checked={discountMode === 'INDIVIDUAL_PRODUCT'}
                          disabled={totalIndividualDiscount <= 0}
                          onChange={() => setDiscountMode('INDIVIDUAL_PRODUCT')}
                          className="text-[#005d42] mt-0.5"
                        />
                        <div>
                          <p className="text-slate-800">🏷️ Individual Promo (৳{totalIndividualDiscount})</p>
                          <p className="text-[11px] text-slate-500 font-normal">
                            {totalIndividualDiscount > 0 ? 'Promo on selected items' : 'No items have promo price'}
                          </p>
                        </div>
                      </label>

                      {/* Option 3: Universal 5% */}
                      <label className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        discountMode === 'UNIVERSAL_5'
                          ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 font-semibold'
                          : 'bg-slate-50/70 border-slate-200 hover:bg-emerald-50/30'
                      }`}>
                        <input
                          type="radio"
                          name="manualOrderDiscountMode"
                          checked={discountMode === 'UNIVERSAL_5'}
                          onChange={() => setDiscountMode('UNIVERSAL_5')}
                          className="text-[#005d42] mt-0.5"
                        />
                        <div>
                          <p className="text-slate-800">
                            🌐 Universal {universalDiscount.percent}% (৳{Math.round(subtotal * ((universalDiscount.enabled ? universalDiscount.percent : 0) / 100))})
                          </p>
                          <p className="text-[11px] text-slate-500 font-normal">
                            {universalDiscount.enabled
                              ? `Standard ${universalDiscount.percent}% storewide discount`
                              : 'Universal discount currently disabled in settings'}
                          </p>
                        </div>
                      </label>

                      {/* Option 4: Custom Manager Rebate */}
                      <label className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        discountMode === 'CUSTOM'
                          ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 font-semibold'
                          : 'bg-slate-50/70 border-slate-200 hover:bg-emerald-50/30'
                      }`}>
                        <input
                          type="radio"
                          name="manualOrderDiscountMode"
                          checked={discountMode === 'CUSTOM'}
                          onChange={() => setDiscountMode('CUSTOM')}
                          className="text-[#005d42] mt-0.5"
                        />
                        <div>
                          <p className="text-[#005d42]">✏️ Manager Custom Rebate</p>
                          <p className="text-[11px] text-slate-500 font-normal">Custom discount amount</p>
                        </div>
                      </label>
                    </div>

                    {discountMode === 'CUSTOM' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Discount Amount (BDT):</label>
                          <input
                            type="number"
                            min={0}
                            value={customDiscountAmount}
                            onChange={(e) => setCustomDiscountAmount(Number(e.target.value))}
                            className="w-full border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-mono font-bold bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Reason / Note:</label>
                          <input
                            type="text"
                            value={customDiscountReason}
                            onChange={(e) => setCustomDiscountReason(e.target.value)}
                            placeholder="e.g. Phone customer VIP concession"
                            className="w-full border border-slate-300 rounded-lg px-2.5 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Shipping Fee */}
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <div>
                      <span className="text-sm text-slate-600">Shipping Fee</span>
                      {form.district && (
                        <span className="text-xs text-slate-400 ml-1.5">
                          (auto: {form.district})
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      min={0}
                      value={form.shippingFee}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          shippingFee: Number(e.target.value),
                        }))
                      }
                      className="w-28 border border-slate-200 rounded-md px-2 py-1 text-sm text-right font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Grand Total */}
                  <div className="flex items-center justify-between py-3 bg-[#005d42] rounded-xl px-4">
                    <span className="text-sm font-bold text-white">Grand Total</span>
                    <span className="font-mono font-black text-xl text-amber-300 tabular-nums">
                      ৳{grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Card */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <h3 className={SECTION_HEADER}>💳 Payment Details</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Payment Method */}
                  <div>
                    <label className={LABEL_CLASS}>Payment Method</label>
                    <select
                      value={form.paymentMethod}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          paymentMethod: e.target.value,
                        }))
                      }
                      className={INPUT_CLASS}
                    >
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Amount Paid */}
                  <div>
                    <label className={LABEL_CLASS}>Amount Paid (BDT)</label>
                    <input
                      type="number"
                      min={0}
                      value={form.paidAmount}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          paidAmount: Number(e.target.value),
                        }))
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>

                {/* Due Amount */}
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Due Amount</span>
                  <span
                    className={`font-mono font-bold text-base tabular-nums ${
                      dueAmount > 0 ? 'text-red-600' : 'text-emerald-600'
                    }`}
                  >
                    ৳{dueAmount.toLocaleString()}
                  </span>
                </div>

                {/* Payment Status Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Payment Status</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      paymentStatus === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800'
                        : paymentStatus === 'PARTIAL'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              STEP 4: ORDER SOURCE & NOTES
          ════════════════════════════════════════════════════════════════ */}
          {currentStep === 4 && (
            <div className="space-y-5">
              {/* Order Source */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <h3 className={SECTION_HEADER}>
                  📡 Order Source <span className="text-red-500">*</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {ORDER_SOURCES.map((src) => (
                    <label
                      key={src.value}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                        form.orderSource === src.value
                          ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="orderSource"
                        value={src.value}
                        checked={form.orderSource === src.value}
                        onChange={() =>
                          setForm((prev) => ({
                            ...prev,
                            orderSource: src.value as ManualOrderFormState['orderSource'],
                          }))
                        }
                        className="text-[#005d42] focus:ring-0"
                      />
                      <span className="text-base">{src.emoji}</span>
                      <span
                        className={`text-xs font-semibold ${
                          form.orderSource === src.value
                            ? 'text-emerald-800'
                            : 'text-slate-700'
                        }`}
                      >
                        {src.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <h3 className={SECTION_HEADER}>📝 Notes</h3>

                <div>
                  <label className={LABEL_CLASS}>Admin Notes (Internal)</label>
                  <textarea
                    rows={3}
                    placeholder="Internal notes about this order..."
                    value={form.adminNotes}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        adminNotes: e.target.value,
                      }))
                    }
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className={LABEL_CLASS}>
                    Customer Order Note (Visible to customer)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Note visible to customer..."
                    value={form.orderNote}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        orderNote: e.target.value,
                      }))
                    }
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              {/* Order Summary Preview */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs text-xs space-y-1.5 text-slate-600">
                <h3 className="font-bold text-slate-800 text-sm mb-2">
                  📋 Order Summary
                </h3>
                <div className="flex justify-between">
                  <span>Customer</span>
                  <span className="font-semibold text-slate-900">
                    {form.customerName} ({form.customerPhone})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Location</span>
                  <span className="font-semibold text-slate-900">
                    {form.upazila}, {form.district}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Items</span>
                  <span className="font-semibold text-slate-900">
                    {form.items.length} product(s)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Grand Total</span>
                  <span className="font-bold text-[#005d42] font-mono">
                    ৳{grandTotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Payment</span>
                  <span className="font-semibold text-slate-900">
                    {form.paymentMethod} — {paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer Navigation ────────────────────────────────────────────── */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 flex items-center gap-1 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 rounded-xl bg-[#005d42] hover:bg-[#004e37] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
              >
                Next Step
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 rounded-xl bg-[#005d42] hover:bg-[#004e37] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Order...
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    Create Order
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
