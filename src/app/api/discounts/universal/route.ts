import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'default' },
      select: {
        enableGeneralDiscount: true,
        generalRetailDiscountPercent: true,
      },
    });

    const percent = Number(settings?.generalRetailDiscountPercent) || 0;
    const enabled = Boolean(settings?.enableGeneralDiscount);
    const label = `Website ${percent}% Universal Discount`;

    return NextResponse.json({
      success: true,
      data: {
        enabled,
        percent,
        label,
      },
    });
  } catch (error: any) {
    console.error('Error fetching public discount settings:', error);
    return NextResponse.json(
      {
        success: false,
        data: { enabled: true, percent: 5, label: 'Website 5% Universal Discount' },
      },
      { status: 200 }
    );
  }
}

