import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession, unauthorizedResponse } from '@/lib/auth-server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifyAdminSession(request);
    if (!session) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const body = await request.json();

    const {
      composition,
      indication,
      dosageAndAdministration,
      withdrawalPeriod,
      contraindications,
      storageInstructions,
      searchKeywords,
    } = body;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(composition !== undefined && { composition: composition?.trim() || null }),
        ...(indication !== undefined && { indication: indication?.trim() || null }),
        ...(dosageAndAdministration !== undefined && {
          dosageAndAdministration: dosageAndAdministration?.trim() || null,
        }),
        ...(withdrawalPeriod !== undefined && {
          withdrawalPeriod: withdrawalPeriod?.trim() || null,
        }),
        ...(contraindications !== undefined && {
          contraindications: contraindications?.trim() || null,
        }),
        ...(storageInstructions !== undefined && {
          storageInstructions: storageInstructions?.trim() || null,
        }),
        ...(searchKeywords !== undefined && {
          searchKeywords: Array.isArray(searchKeywords) ? searchKeywords : [],
        }),
      },
      select: {
        id: true,
        nameEn: true,
        composition: true,
        indication: true,
        dosageAndAdministration: true,
        withdrawalPeriod: true,
        contraindications: true,
        storageInstructions: true,
        searchKeywords: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error('Error updating clinical reference data:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update clinical details' },
      { status: 500 }
    );
  }
}
