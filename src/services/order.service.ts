import { prisma } from '@/lib/prisma';
import {
  OrderStatus,
  PaymentStatus,
  Prisma,
} from '@prisma/client';
import {
  AdminOrder,
  OrderStatsSummary,
  UpdateOrderPayload,
} from '@/types/admin-order';

export interface OrderQueryFilters {
  status?: string; // 'ALL' | OrderStatus
  paymentStatus?: string;
  search?: string;
  limit?: number;
  page?: number;
  startDate?: string;
  endDate?: string;
}

/**
 * Transforms Decimal fields into numbers for clean JSON serialization
 */
function serializeOrder(order: any): AdminOrder {
  return {
    ...order,
    subtotal: Number(order.subtotal) || 0,
    discountAmount: Number(order.discountAmount) || 0,
    shippingFee: Number(order.shippingFee) || 0,
    grandTotal: Number(order.grandTotal) || 0,
    paidAmount: Number(order.paidAmount) || 0,
    dueAmount: Number(order.dueAmount) || 0,
    codCollectableAmount: order.codCollectableAmount
      ? Number(order.codCollectableAmount)
      : null,
    items: (order.items || []).map((item: any) => ({
      ...item,
      unitTradePrice: Number(item.unitTradePrice) || 0,
      unitMrpPrice: Number(item.unitMrpPrice) || 0,
      unitSellingPrice: Number(item.unitSellingPrice) || 0,
      lineTotal: Number(item.lineTotal) || 0,
    })),
    createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt,
    updatedAt: order.updatedAt instanceof Date ? order.updatedAt.toISOString() : order.updatedAt,
    dispatchedAt: order.dispatchedAt instanceof Date ? order.dispatchedAt.toISOString() : order.dispatchedAt,
    deliveredAt: order.deliveredAt instanceof Date ? order.deliveredAt.toISOString() : order.deliveredAt,
  };
}

export async function getAdminOrders(filters: OrderQueryFilters = {}) {
  const {
    status = 'ALL',
    paymentStatus,
    search,
    limit = 50,
    page = 1,
    startDate,
    endDate,
  } = filters;
  const skip = (page - 1) * limit;

  const where: Prisma.OrderWhereInput = {};

  if (status && status !== 'ALL') {
    where.orderStatus = status as OrderStatus;
  }

  if (paymentStatus && paymentStatus !== 'ALL') {
    where.paymentStatus = paymentStatus as PaymentStatus;
  }

  if (startDate || endDate) {
    where.createdAt = {
      ...(startDate && { gte: new Date(startDate) }),
      ...(endDate && {
        lte: (() => {
          const d = new Date(endDate);
          d.setHours(23, 59, 59, 999);
          return d;
        })(),
      }),
    };
  }

  if (search && search.trim()) {
    const term = search.trim();
    where.OR = [
      { orderNumber: { contains: term, mode: 'insensitive' } },
      { customerName: { contains: term, mode: 'insensitive' } },
      { customerPhone: { contains: term } },
      { district: { contains: term, mode: 'insensitive' } },
      { upazila: { contains: term, mode: 'insensitive' } },
      { consignmentId: { contains: term, mode: 'insensitive' } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                thumbnail: true,
                formFactor: true,
              },
            },
          },
        },
      },
      take: limit,
      skip,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders: orders.map(serializeOrder),
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export interface OrderStatsParams {
  startDate?: string;
  endDate?: string;
}

export async function getOrderStats(params: OrderStatsParams = {}): Promise<OrderStatsSummary> {
  const { startDate, endDate } = params;

  const dateFilter: Prisma.DateTimeFilter | undefined =
    startDate || endDate
      ? {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate && {
            lte: (() => {
              const d = new Date(endDate);
              d.setHours(23, 59, 59, 999);
              return d;
            })(),
          }),
        }
      : undefined;

  const rangeWhere: Prisma.OrderWhereInput = dateFilter ? { createdAt: dateFilter } : {};

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    totalOrders,
    orderStatusGroups,
    paymentStatusGroups,
    rangeOrdersForRevenue,
    todayOrders,
    lifetimeCount,
    lifetimeOrdersRevenue,
  ] = await Promise.all([
    prisma.order.count({ where: rangeWhere }),
    prisma.order.groupBy({
      by: ['orderStatus'],
      where: rangeWhere,
      _count: { id: true },
    }),
    prisma.order.groupBy({
      by: ['paymentStatus'],
      where: rangeWhere,
      _count: { id: true },
    }),
    prisma.order.findMany({
      where: {
        ...rangeWhere,
        orderStatus: { not: 'CANCELLED' },
      },
      select: { grandTotal: true, paymentMethod: true, paymentStatus: true },
    }),
    prisma.order.findMany({
      where: {
        createdAt: { gte: todayStart },
        orderStatus: { not: 'CANCELLED' },
      },
      select: { grandTotal: true },
    }),
    prisma.order.count(),
    prisma.order.aggregate({
      where: { orderStatus: { not: 'CANCELLED' } },
      _sum: { grandTotal: true },
    }),
  ]);

  const orderStatusMap: Record<string, number> = {};
  for (const item of orderStatusGroups) {
    orderStatusMap[item.orderStatus] = item._count.id;
  }
  const paymentStatusMap: Record<string, number> = {};
  for (const item of paymentStatusGroups) {
    paymentStatusMap[item.paymentStatus] = item._count.id;
  }

  const totalRevenue = rangeOrdersForRevenue.reduce(
    (acc, curr) => acc + Number(curr.grandTotal || 0),
    0
  );
  const averageOrderValue =
    rangeOrdersForRevenue.length > 0
      ? Math.round(totalRevenue / rangeOrdersForRevenue.length)
      : 0;

  const todayRevenue = todayOrders.reduce(
    (acc, curr) => acc + Number(curr.grandTotal || 0),
    0
  );

  const codOrdersCount = rangeOrdersForRevenue.filter(
    (o) => o.paymentMethod === 'COD'
  ).length;

  return {
    totalOrders,
    totalRevenue,
    averageOrderValue,
    // Order Statuses
    pendingCount: orderStatusMap['PENDING'] || 0,
    confirmedCount: orderStatusMap['CONFIRMED'] || 0,
    packedCount: orderStatusMap['PACKED'] || 0,
    shippedCount: orderStatusMap['SHIPPED'] || 0,
    deliveredCount: orderStatusMap['DELIVERED'] || 0,
    returnedCount: orderStatusMap['RETURNED'] || 0,
    cancelledCount: orderStatusMap['CANCELLED'] || 0,
    // Payment Statuses
    paidCount: paymentStatusMap['PAID'] || 0,
    partialCount: paymentStatusMap['PARTIAL'] || 0,
    unpaidCount: paymentStatusMap['UNPAID'] || 0,
    refundedCount: paymentStatusMap['REFUNDED'] || 0,
    failedCount: paymentStatusMap['FAILED'] || 0,
    // Legacy / Period
    codOrdersCount,
    paidOrdersCount: paymentStatusMap['PAID'] || 0,
    todayCount: todayOrders.length,
    todayRevenue,
    lifetimeTotalOrders: lifetimeCount,
    lifetimeRevenue: Number(lifetimeOrdersRevenue._sum.grandTotal || 0),
  };
}

export async function getOrderById(id: string): Promise<AdminOrder | null> {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              thumbnail: true,
              formFactor: true,
            },
          },
        },
      },
    },
  });

  if (!order) return null;
  return serializeOrder(order);
}

export async function updateAdminOrder(id: string, payload: UpdateOrderPayload): Promise<AdminOrder> {
  const current = await prisma.order.findUnique({
    where: { id },
  });

  if (!current) {
    throw new Error('Order not found');
  }

  const subtotal = Number(current.subtotal);
  const discountAmount =
    payload.discountAmount !== undefined
      ? Number(payload.discountAmount)
      : Number(current.discountAmount);
  const shippingFee =
    payload.shippingFee !== undefined
      ? Number(payload.shippingFee)
      : Number(current.shippingFee);
  const paidAmount =
    payload.paidAmount !== undefined
      ? Number(payload.paidAmount)
      : Number(current.paidAmount);

  // Recalculate grandTotal and dueAmount
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);
  const dueAmount = Math.max(0, grandTotal - paidAmount);

  // Use admin's explicitly chosen paymentStatus if provided; otherwise auto-compute from paidAmount
  let paymentStatus = payload.paymentStatus || current.paymentStatus;
  if (!payload.paymentStatus && payload.paidAmount !== undefined) {
    if (paidAmount >= grandTotal && grandTotal > 0) {
      paymentStatus = 'PAID';
    } else if (paidAmount > 0 && paidAmount < grandTotal) {
      paymentStatus = 'PARTIAL';
    } else if (paidAmount === 0) {
      paymentStatus = 'UNPAID';
    }
  }

  // If refunded or returned/cancelled, courier should collect 0 on delivery
  const finalDueAmount = (paymentStatus === 'REFUNDED' || payload.orderStatus === 'RETURNED' || payload.orderStatus === 'CANCELLED')
    ? 0
    : dueAmount;

  const updated = await prisma.order.update({
    where: { id },
    data: {
      ...(payload.orderStatus && { orderStatus: payload.orderStatus }),
      paymentStatus,
      ...(payload.paymentMethod && { paymentMethod: payload.paymentMethod }),
      paidAmount: new Prisma.Decimal(paidAmount),
      discountAmount: new Prisma.Decimal(discountAmount),
      shippingFee: new Prisma.Decimal(shippingFee),
      grandTotal: new Prisma.Decimal(grandTotal),
      dueAmount: new Prisma.Decimal(finalDueAmount),
      codCollectableAmount: new Prisma.Decimal(finalDueAmount),
      ...(payload.appliedDiscountLabel !== undefined && {
        appliedDiscountLabel: payload.appliedDiscountLabel,
      }),
      ...(payload.appliedDiscountSource !== undefined && {
        appliedDiscountSource: payload.appliedDiscountSource,
      }),
      ...(payload.courierProvider !== undefined && {
        courierProvider: payload.courierProvider,
      }),
      ...(payload.consignmentId !== undefined && {
        consignmentId: payload.consignmentId,
      }),
      ...(payload.trackingCode !== undefined && {
        trackingCode: payload.trackingCode,
      }),
      ...(payload.adminNotes !== undefined && {
        adminNotes: payload.adminNotes,
      }),
      ...(payload.district && { district: payload.district }),
      ...(payload.upazila && { upazila: payload.upazila }),
      ...(payload.address && { address: payload.address }),
      ...(payload.orderStatus === 'SHIPPED' && !current.dispatchedAt && {
        dispatchedAt: new Date(),
      }),
      ...(payload.orderStatus === 'DELIVERED' && !current.deliveredAt && {
        deliveredAt: new Date(),
      }),
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              thumbnail: true,
              formFactor: true,
            },
          },
        },
      },
    },
  });

  return serializeOrder(updated);
}

