import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma, BuyerTier } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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
      return NextResponse.json(
        { success: false, message: 'গ্রাহকের নাম প্রদান করা আবশ্যক (Customer name is required)' },
        { status: 400 }
      );
    }

    const cleanPhone = (customerPhone || '').replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length !== 11 || !cleanPhone.startsWith('01')) {
      return NextResponse.json(
        { success: false, message: 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (Valid 11-digit BD mobile required: 01XXXXXXXXX)' },
        { status: 400 }
      );
    }

    if (!district || !district.trim()) {
      return NextResponse.json(
        { success: false, message: 'জেলা নির্বাচন করুন (Please select a district)' },
        { status: 400 }
      );
    }

    if (!upazila || !upazila.trim()) {
      return NextResponse.json(
        { success: false, message: 'উপজেলা / থানার নাম লিখুন (Please enter your Upazila / Thana)' },
        { status: 400 }
      );
    }

    if (!address || !address.trim()) {
      return NextResponse.json(
        { success: false, message: 'সম্পূর্ণ ঠিকানা লিখুন (Please enter delivery address)' },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'অন্তত একটি পণ্য নির্বাচন করুন (At least one item required)' },
        { status: 400 }
      );
    }

    // 2. Fetch variants from DB
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
      return NextResponse.json(
        { success: false, message: 'নির্বাচিত পণ্য পাওয়া যায়নি (No valid products found)' },
        { status: 400 }
      );
    }

    const isWholesale = buyerMode === 'WHOLESALE';

    // 3. Compute item totals & subtotal
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
        priceTierApplied: isWholesale ? BuyerTier.WHOLESALE : BuyerTier.RETAIL,
        unitTradePrice: unitTp,
        unitMrpPrice: unitMrp,
        unitSellingPrice: unitSelling,
        quantity: qty,
        lineTotal: lineTotal,
      });
    }

    if (orderItemData.length === 0) {
      return NextResponse.json(
        { success: false, message: 'কার্টের কোনো বৈধ পণ্য পাওয়া যায়নি' },
        { status: 400 }
      );
    }

    // 4. Overrides & Totals
    const rawDiscount = overrides.discountAmount !== undefined ? overrides.discountAmount : body.discountAmount;
    const discountAmount = rawDiscount !== undefined ? Math.max(0, Number(rawDiscount)) : 0;
    const appliedDiscountSource = discountAmount > 0
      ? (body.appliedDiscountSource || overrides.appliedDiscountSource || 'ADMIN_MANUAL')
      : null;
    const appliedDiscountLabel = discountAmount > 0
      ? (body.appliedDiscountLabel || overrides.appliedDiscountLabel || overrides.discountLabel || body.discountLabel || 'Admin Discount')
      : null;

    const rawShipping = overrides.shippingFee !== undefined ? overrides.shippingFee : body.shippingFee;
    const shippingFee = rawShipping !== undefined ? Math.max(0, Number(rawShipping)) : 0;

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
    const userNotes = (adminNotes || '').trim();
    const combinedAdminNotes = userNotes
      ? (userNotes.toLowerCase().includes('store') ? userNotes : `Store sale - ${userNotes}`)
      : 'Store sale';

    // 5. DB Transaction
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
          orderType: isWholesale ? BuyerTier.WHOLESALE : BuyerTier.RETAIL,
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
          orderStatus: 'CONFIRMED',
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

    return NextResponse.json({
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
    console.error('Error placing manual order:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to place manual order',
      },
      { status: 500 }
    );
  }
}

