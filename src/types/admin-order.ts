export type BuyerTier = 'RETAIL' | 'WHOLESALE';
export type CourierProvider = 'STEADFAST' | 'PATHAO' | 'REDX' | 'SUNDARBAN' | 'MANUAL';
export type DiscountSource = 'INDIVIDUAL_PRODUCT' | 'CLIENT_CUSTOM' | 'GENERAL_STOREWIDE' | 'COUPON' | 'ADMIN_MANUAL';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
export type PaymentMethod = 'SSLCOMMERZ' | 'COD' | 'PARTIAL_ADVANCE';
export type PaymentStatus = 'UNPAID' | 'PAID' | 'PARTIAL' | 'FAILED' | 'CANCELLED' | 'REFUNDED';

export interface AdminOrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  nameEn: string;
  nameBn?: string | null;
  packSize: string;
  sku: string;
  priceTierApplied: BuyerTier;
  unitTradePrice: number;
  unitMrpPrice: number;
  unitSellingPrice: number;
  quantity: number;
  lineTotal: number;
  product?: {
    id: string;
    thumbnail: string;
    formFactor: string;
  };
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  orderType: BuyerTier;
  customerProfileId?: string | null;
  customerName: string;
  customerPhone: string;
  customerAltPhone?: string | null;
  customerEmail?: string | null;
  district: string;
  upazila: string;
  address: string;
  orderNote?: string | null;

  subtotal: number;
  discountAmount: number;
  appliedDiscountSource?: DiscountSource | null;
  appliedDiscountLabel?: string | null;
  couponCode?: string | null;
  shippingFee: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;

  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  agreedToPolicies: boolean;

  courierProvider?: CourierProvider | null;
  consignmentId?: string | null;
  trackingCode?: string | null;
  trackingUrl?: string | null;
  courierStatus?: string | null;
  codCollectableAmount?: number | null;
  dispatchedAt?: string | null;
  deliveredAt?: string | null;

  adminNotes?: string | null;
  items: AdminOrderItem[];

  createdAt: string;
  updatedAt: string;
}

export interface OrderStatsSummary {
  totalOrders: number;
  totalRevenue?: number;
  averageOrderValue?: number;
  // Order Statuses
  pendingCount: number;
  confirmedCount: number;
  packedCount?: number;
  shippedCount: number;
  deliveredCount: number;
  returnedCount?: number;
  cancelledCount: number;
  // Payment Statuses
  paidCount?: number;
  partialCount?: number;
  unpaidCount?: number;
  refundedCount?: number;
  failedCount?: number;
  // Legacy / Period
  codOrdersCount?: number;
  paidOrdersCount?: number;
  todayCount: number;
  todayRevenue: number;
  lifetimeTotalOrders?: number;
  lifetimeRevenue?: number;
}

export interface UpdateOrderPayload {
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paidAmount?: number;
  discountAmount?: number;
  appliedDiscountLabel?: string | null;
  appliedDiscountSource?: DiscountSource | null;
  shippingFee?: number;
  courierProvider?: CourierProvider | null;
  consignmentId?: string | null;
  trackingCode?: string | null;
  adminNotes?: string | null;
  district?: string;
  upazila?: string;
  address?: string;
}

