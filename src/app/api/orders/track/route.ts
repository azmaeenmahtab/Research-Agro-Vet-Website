import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = (searchParams.get('phone') || searchParams.get('query') || '').trim();

    if (!rawQuery) {
      return NextResponse.json(
        { success: false, message: 'অনুগ্রহ করে মোবাইল নম্বর বা অর্ডার নম্বর প্রদান করুন।' },
        { status: 400 }
      );
    }

    const digitsOnly = rawQuery.replace(/[^0-9]/g, '');
    let phoneQuery = '';
    if (digitsOnly.startsWith('8801') && digitsOnly.length === 13) {
      phoneQuery = digitsOnly.slice(2);
    } else if (digitsOnly.startsWith('01') && digitsOnly.length === 11) {
      phoneQuery = digitsOnly;
    }

    const orderNumberClean = rawQuery.replace(/^#/, '').trim();

    const orConditions: any[] = [];
    if (phoneQuery) {
      orConditions.push({ customerPhone: phoneQuery });
      orConditions.push({ customerAltPhone: phoneQuery });
    }
    if (orderNumberClean.length >= 3) {
      orConditions.push({ orderNumber: orderNumberClean });
    }

    if (orConditions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'সঠিক ১১ ডিজিটের মোবাইল নম্বর (যেমন: 01716019731) বা অর্ডার নম্বর প্রদান করুন।',
        },
        { status: 400 }
      );
    }

    const orders = await prisma.order.findMany({
      where: {
        OR: orConditions,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                nameEn: true,
                nameBn: true,
                thumbnail: true,
                formFactor: true,
              },
            },
          },
        },
      },
    });

    const serializedOrders = orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      orderType: o.orderType,
      orderStatus: o.orderStatus,
      paymentStatus: o.paymentStatus,
      paymentMethod: o.paymentMethod,
      createdAt: o.createdAt.toISOString(),
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      customerAltPhone: o.customerAltPhone,
      district: o.district,
      upazila: o.upazila,
      address: o.address,
      orderNote: o.orderNote,
      subtotal: Number(o.subtotal),
      discountAmount: Number(o.discountAmount),
      shippingFee: Number(o.shippingFee),
      grandTotal: Number(o.grandTotal),
      paidAmount: Number(o.paidAmount),
      dueAmount: Number(o.dueAmount),
      courierProvider: o.courierProvider,
      consignmentId: o.consignmentId,
      trackingCode: o.trackingCode,
      trackingUrl: o.trackingUrl,
      courierStatus: o.courierStatus,
      dispatchedAt: o.dispatchedAt ? o.dispatchedAt.toISOString() : null,
      deliveredAt: o.deliveredAt ? o.deliveredAt.toISOString() : null,
      items: o.items.map((it) => ({
        id: it.id,
        productId: it.productId,
        productNameEn: it.nameEn,
        productNameBn: it.nameBn,
        packSize: it.packSize,
        quantity: it.quantity,
        unitSellingPrice: Number(it.unitSellingPrice),
        lineTotal: Number(it.lineTotal),
        thumbnail: it.product?.thumbnail || '/images/placeholder-medicine.webp',
        formFactor: it.product?.formFactor || null,
      })),
    }));

    return NextResponse.json({
      success: true,
      count: serializedOrders.length,
      orders: serializedOrders,
    });
  } catch (error: any) {
    console.error('Track order query error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'অর্ডার তথ্য অনুসন্ধানে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}
