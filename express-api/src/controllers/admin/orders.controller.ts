import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import type { Prisma } from '@prisma/client';
import type { BuyerTier } from '../../types/admin-order';
import {
  getAdminOrders as getAdminOrdersService,
  getOrderStats as getOrderStatsService,
  getOrderById as getOrderByIdService,
  updateAdminOrder as updateAdminOrderService,
} from '../../services/order.service';

// GET /api/admin/orders
export async function getAdminOrders(req: Request, res: Response) {
  try {
    const status = (req.query.status as string) || 'ALL';
    const paymentStatus = (req.query.paymentStatus as string) || undefined;
    const search = (req.query.search as string) || undefined;
    const startDate = (req.query.startDate as string) || undefined;
    const endDate = (req.query.endDate as string) || undefined;
    const limit = Number(req.query.limit) || 50;
    const page = Number(req.query.page) || 1;

    const [orderData, stats] = await Promise.all([
      getAdminOrdersService({
        status,
        paymentStatus,
        search,
        startDate,
        endDate,
        limit,
        page,
      }),
      getOrderStatsService({ startDate, endDate }),
    ]);

    return res.json({
      success: true,
      orders: orderData.orders,
      total: orderData.total,
      page: orderData.page,
      totalPages: orderData.totalPages,
      stats,
    });
  } catch (error: any) {
    console.error('Error fetching admin orders:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch orders',
    });
  }
}

// GET /api/admin/orders/:id
export async function getAdminOrderById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const order = await getOrderByIdService(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.json({ success: true, order });
  } catch (error: any) {
    console.error('Error fetching order details:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch order',
    });
  }
}

// PUT /api/admin/orders/:id
export async function updateAdminOrder(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const body = req.body;

    const updated = await updateAdminOrderService(id, body);

    return res.json({
      success: true,
      message: 'Order updated successfully',
      order: updated,
    });
  } catch (error: any) {
    console.error('Error updating order:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update order',
    });
  }
}

// POST /api/admin/orders/manual
export async function createManualOrder(req: Request, res: Response) {
  try {
    const body = req.body;
    const {
      customerName,
      customerPhone,
      customerAltPhone,
      district,
      upazila,
      address,
      orderNote,
      buyerMode = 'RETAIL',
      orderSource = 'STORE',
      adminNotes = 'Store',
      items,
      overrides = {},
    } = body;

    // 1. Basic validation
    if (!customerName || !customerName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Customer name is required',
      });
    }

    const cleanPhone = (customerPhone || '').replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length !== 11 || !cleanPhone.startsWith('01')) {
      return res.status(400).json({
        success: false,
        message: 'Valid 11-digit BD mobile number required (01XXXXXXXXX)',
      });
    }

    if (!district || !district.trim()) {
      return res.status(400).json({
        success: false,
        message: 'District is required',
      });
    }

    if (!upazila || !upazila.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Upazila / Thana is required',
      });
    }

    if (!address || !address.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Address is required',
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one item is required',
      });
    }

    // 2. Fetch variants
    const variantIds = items.map((i: any) => i.variantId);
    const dbVariants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: {
        product: {
          select: {
            id: true,
            nameEn: true,
            nameBn: true,
            status: true,
          },
        },
      },
    });

    if (dbVariants.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid products found for selected items',
      });
    }

    const isWholesale = buyerMode === 'WHOLESALE';

    // 3. Line items computation
    let subtotal = 0;
    const orderItemData: Array<{
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
    }> = [];

    for (const item of items) {
      const variant = dbVariants.find((v: any) => v.id === item.variantId);
      if (!variant) continue;

      const qty = Math.max(1, Number(item.quantity) || 1);
      const unitMrp = Number(variant.mrpPrice);
      const unitTp = Number(variant.tradePrice);
      
      // Server-enforced catalog price (from product management)
      const unitSelling = Number(variant.sellingPrice || variant.mrpPrice);

      const lineTotal = unitSelling * qty;
      subtotal += lineTotal;

      orderItemData.push({
        productId: variant.productId,
        variantId: variant.id,
        nameEn: variant.product.nameEn,
        nameBn: variant.product.nameBn,
        packSize: variant.packSize,
        sku: variant.sku,
        priceTierApplied: isWholesale ? 'WHOLESALE' : 'RETAIL',
        unitTradePrice: unitTp,
        unitMrpPrice: unitMrp,
        unitSellingPrice: unitSelling,
        quantity: qty,
        lineTotal: lineTotal,
      });
    }

    if (orderItemData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid products found in order items',
      });
    }

    // 4. Discount & Shipping overrides or defaults
    const rawDiscount = overrides.discountAmount !== undefined ? overrides.discountAmount : body.discountAmount;
    let discountAmount = rawDiscount !== undefined ? Math.max(0, Number(rawDiscount)) : 0;
    let appliedDiscountSource = discountAmount > 0
      ? (body.appliedDiscountSource || overrides.appliedDiscountSource || 'ADMIN_MANUAL')
      : null;
    let appliedDiscountLabel = discountAmount > 0
      ? (body.appliedDiscountLabel || overrides.appliedDiscountLabel || overrides.discountLabel || body.discountLabel || 'Admin Discount')
      : null;

    const rawShipping = overrides.shippingFee !== undefined ? overrides.shippingFee : body.shippingFee;
    let shippingFee = rawShipping !== undefined ? Math.max(0, Number(rawShipping)) : 0;

    const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);
    const rawPaid = overrides.paidAmount !== undefined ? overrides.paidAmount : body.paidAmount;
    const paidAmount = Math.max(0, Number(rawPaid || 0));
    const dueAmount = Math.max(0, grandTotal - paidAmount);

    let paymentStatus = overrides.paymentStatus || body.paymentStatus;
    if (!paymentStatus) {
      if (paidAmount >= grandTotal && grandTotal > 0) {
        paymentStatus = 'PAID';
      } else if (paidAmount > 0) {
        paymentStatus = 'PARTIAL';
      } else {
        paymentStatus = 'UNPAID';
      }
    }

    const paymentMethod = overrides.paymentMethod || body.paymentMethod || 'COD';

    // Format admin notes with store
    const userNotes = (adminNotes || '').trim();
    const combinedAdminNotes = userNotes
      ? (userNotes.toLowerCase().includes('store') ? userNotes : `Store sale - ${userNotes}`)
      : 'Store sale';

    // 5. Atomic DB Transaction
    const order = await prisma.$transaction(async (tx: any) => {
      const now = new Date();
      const yy = String(now.getFullYear()).slice(-2);
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const prefix = `AV-${yy}${mm}-`;

      const latestOrder = await tx.order.findFirst({
        where: { orderNumber: { startsWith: prefix } },
        orderBy: { orderNumber: 'desc' },
        select: { orderNumber: true },
      });

      let nextSeq = 1;
      if (latestOrder) {
        const lastNum = parseInt(latestOrder.orderNumber.replace(prefix, ''), 10);
        if (!isNaN(lastNum)) {
          nextSeq = lastNum + 1;
        }
      }

      let orderNumber = `${prefix}${String(nextSeq).padStart(4, '0')}`;
      while (await tx.order.findUnique({ where: { orderNumber } })) {
        nextSeq++;
        orderNumber = `${prefix}${String(nextSeq).padStart(4, '0')}`;
      }

      // Upsert CustomerProfile
      const profile = await tx.customerProfile.upsert({
        where: { phone: cleanPhone },
        update: {
          name: customerName.trim(),
          district: district.trim(),
          upazila: upazila.trim(),
          address: address.trim(),
          totalOrdersCount: { increment: 1 },
        },
        create: {
          phone: cleanPhone,
          name: customerName.trim(),
          district: district.trim(),
          upazila: upazila.trim(),
          address: address.trim(),
          totalOrdersCount: 1,
        },
      });

      // Create Order
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          orderType: isWholesale ? 'WHOLESALE' : 'RETAIL',
          customerProfileId: profile.id,
          customerName: customerName.trim(),
          customerPhone: cleanPhone,
          customerAltPhone: (customerAltPhone || '').trim() || null,
          district: district.trim(),
          upazila: upazila.trim(),
          address: address.trim(),
          orderNote: (orderNote || '').trim() || null,
          adminNotes: combinedAdminNotes || null,

          subtotal,
          discountAmount,
          appliedDiscountSource,
          appliedDiscountLabel,
          shippingFee,
          grandTotal,
          paidAmount,
          dueAmount,
          codCollectableAmount: dueAmount,

          paymentMethod: paymentMethod as any,
          paymentStatus: paymentStatus as any,
          orderStatus: 'CONFIRMED', // Manual orders are directly confirmed by admin
          agreedToPolicies: true,

          items: {
            create: orderItemData,
          },
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

      return createdOrder;
    });

    return res.json({
      success: true,
      message: 'Manual order created successfully',
      orderNumber: order.orderNumber,
      orderId: order.id,
      order: {
        ...order,
        subtotal: Number(order.subtotal),
        discountAmount: Number(order.discountAmount),
        shippingFee: Number(order.shippingFee),
        grandTotal: Number(order.grandTotal),
        paidAmount: Number(order.paidAmount),
        dueAmount: Number(order.dueAmount),
        items: order.items.map((i: any) => ({
          ...i,
          unitTradePrice: Number(i.unitTradePrice),
          unitMrpPrice: Number(i.unitMrpPrice),
          unitSellingPrice: Number(i.unitSellingPrice),
          lineTotal: Number(i.lineTotal),
        })),
      },
    });
  } catch (error: any) {
    console.error('Error creating manual order:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create manual order',
    });
  }
}

