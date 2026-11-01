import {
  BuyerTier,
  CourierProvider,
  DiscountSource,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '@prisma/client';

export type {
  BuyerTier,
  CourierProvider,
  DiscountSource,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
};

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
  pendingCount: number;
  confirmedCount: number;
  shippedCount: number;
  deliveredCount: number;
  cancelledCount: number;
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

