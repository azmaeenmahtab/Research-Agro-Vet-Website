import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;

    const order = await prisma.order.findUnique({
      where: { orderNumber },
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

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        subtotal: Number(order.subtotal),
        discountAmount: Number(order.discountAmount),
        shippingFee: Number(order.shippingFee),
        grandTotal: Number(order.grandTotal),
        paidAmount: Number(order.paidAmount),
        dueAmount: Number(order.dueAmount),
        items: order.items.map((i) => ({
          ...i,
          unitSellingPrice: Number(i.unitSellingPrice),
          lineTotal: Number(i.lineTotal),
        })),
      },
    });
  } catch (error: any) {
    console.error('Error fetching order by orderNumber:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

