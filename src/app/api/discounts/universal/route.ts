import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    const enabled = Boolean(settings?.enableGeneralDiscount) && percent > 0;
    const label = `Website ${percent}% Universal Discount`;

    return NextResponse.json(
      {
        success: true,
        data: {
          enabled,
          percent,
          label,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('Error fetching public discount settings:', error);
    return NextResponse.json(
      {
        success: false,
        data: { enabled: false, percent: 0, label: '' },
      },
      { status: 200 }
    );
  }
}

