import { NextRequest, NextResponse } from 'next/server';
import { getAdminOrders, getOrderStats } from '@/services/order.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'ALL';
    const paymentStatus = searchParams.get('paymentStatus') || undefined;
    const search = searchParams.get('search') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const limit = Number(searchParams.get('limit')) || 50;
    const page = Number(searchParams.get('page')) || 1;

    const [orderData, stats] = await Promise.all([
      getAdminOrders({
        status,
        paymentStatus,
        search,
        startDate,
        endDate,
        limit,
        page,
      }),
      getOrderStats({ startDate, endDate }),
    ]);

    return NextResponse.json({
      success: true,
      orders: orderData.orders,
      total: orderData.total,
      page: orderData.page,
      totalPages: orderData.totalPages,
      stats,
    });
  } catch (error: any) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to fetch orders',
      },
      { status: 500 }
    );
  }
}

