import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json({ found: false });
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 11 || !cleanPhone.startsWith('01')) {
      return NextResponse.json({ found: false });
    }

    const profile = await prisma.customerProfile.findUnique({
      where: { phone: cleanPhone },
      select: {
        id: true,
        name: true,
        businessOrFarmName: true,
        district: true,
        upazila: true,
        address: true,
        hasCustomDiscount: true,
        discountType: true,
        discountValue: true,
        totalOrdersCount: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ found: false });
    }

    return NextResponse.json({
      found: true,
      customer: {
        name: profile.name,
        businessOrFarmName: profile.businessOrFarmName,
        district: profile.district,
        upazila: profile.upazila,
        address: profile.address,
        hasCustomDiscount: profile.hasCustomDiscount,
        discountValue: Number(profile.discountValue || 0),
        discountType: profile.discountType,
        totalOrdersCount: profile.totalOrdersCount,
      },
    });
  } catch (error: any) {
    console.error('Customer lookup error:', error);
    return NextResponse.json({ found: false }, { status: 500 });
  }
}

