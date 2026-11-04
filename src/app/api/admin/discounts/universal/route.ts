import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.siteSettings.upsert({
      where: { id: 'default' },
      update: {},
      create: {
        id: 'default',
        enableGeneralDiscount: true,
        generalRetailDiscountPercent: 5,
      },
      select: {
        enableGeneralDiscount: true,
        generalRetailDiscountPercent: true,
        updatedAt: true,
      },
    });

    const percent = Number(settings.generalRetailDiscountPercent) || 0;
    const enabled = Boolean(settings.enableGeneralDiscount);
    const label = `Website ${percent}% Universal Discount`;

    return NextResponse.json({
      success: true,
      data: {
        enabled,
        percent,
        label,
        updatedAt: settings.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Error fetching universal discount settings:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to fetch discount settings',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { enabled, percent } = body;

    if (percent !== undefined && (isNaN(Number(percent)) || Number(percent) < 0 || Number(percent) > 100)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Discount percent must be a number between 0 and 100',
        },
        { status: 400 }
      );
    }

    const updated = await prisma.siteSettings.upsert({
      where: { id: 'default' },
      update: {
        ...(enabled !== undefined && { enableGeneralDiscount: Boolean(enabled) }),
        ...(percent !== undefined && { generalRetailDiscountPercent: Number(percent) }),
      },
      create: {
        id: 'default',
        enableGeneralDiscount: enabled !== undefined ? Boolean(enabled) : true,
        generalRetailDiscountPercent: percent !== undefined ? Number(percent) : 5,
      },
      select: {
        enableGeneralDiscount: true,
        generalRetailDiscountPercent: true,
        updatedAt: true,
      },
    });

    const newPercent = Number(updated.generalRetailDiscountPercent) || 0;
    const isEnabled = Boolean(updated.enableGeneralDiscount);
    const label = `Website ${newPercent}% Universal Discount`;

    return NextResponse.json({
      success: true,
      message: 'Universal discount settings successfully updated',
      data: {
        enabled: isEnabled,
        percent: newPercent,
        label,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Error updating universal discount settings:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to update discount settings',
      },
      { status: 500 }
    );
  }
}

