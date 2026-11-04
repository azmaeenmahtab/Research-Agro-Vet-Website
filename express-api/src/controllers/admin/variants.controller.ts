import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

// PATCH /api/admin/variants/:id
export async function updateAdminVariant(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const body = req.body;

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

    return res.json({ success: true, variant: updated });
  } catch (error: any) {
    console.error('Error updating variant inline:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update variant',
    });
  }
}

