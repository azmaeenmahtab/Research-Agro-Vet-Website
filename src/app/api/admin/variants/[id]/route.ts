import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      tradePrice,
      mrpPrice,
      sellingPrice,
      inStock,
      stockQuantity,
      packSize,
      minWholesaleQty,
      minWholesaleAmount,
      packagingInfo,
      unitsPerBox,
    } = body;

    const data: any = {};

    if (tradePrice !== undefined) data.tradePrice = Number(tradePrice);
    if (mrpPrice !== undefined) data.mrpPrice = Number(mrpPrice);
    if (sellingPrice !== undefined) data.sellingPrice = Number(sellingPrice);
    if (inStock !== undefined) data.inStock = Boolean(inStock);
    if (stockQuantity !== undefined) data.stockQuantity = Number(stockQuantity);
    if (packSize !== undefined) data.packSize = String(packSize).trim();
    if (packagingInfo !== undefined) {
      data.packagingInfo = packagingInfo ? String(packagingInfo).trim() : null;
    }
    if (unitsPerBox !== undefined) {
      data.unitsPerBox = unitsPerBox !== null && unitsPerBox !== '' ? Number(unitsPerBox) : null;
    }
    if (minWholesaleQty !== undefined) {
      data.minWholesaleQty = minWholesaleQty !== null ? Number(minWholesaleQty) : null;
    }
    if (minWholesaleAmount !== undefined) {
      data.minWholesaleAmount = minWholesaleAmount !== null ? Number(minWholesaleAmount) : null;
    }

    const updated = await prisma.productVariant.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, variant: updated });
  } catch (error: any) {
    console.error('Error updating variant inline:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update variant' },
      { status: 500 }
    );
  }
}
