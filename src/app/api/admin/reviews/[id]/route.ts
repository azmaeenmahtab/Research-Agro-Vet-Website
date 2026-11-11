import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession, unauthorizedResponse } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/admin/reviews/[id]
 * Permanently deletes a review.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await verifyAdminSession(request);
    if (!session) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    const existing = await prisma.productReview.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Review not found' },
        { status: 404 }
      );
    }

    await prisma.productReview.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'রিভিউটি সফলভাবে মুছে ফেলা হয়েছে (Review permanently deleted)',
    });
  } catch (error: any) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete review' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/reviews/[id]
 * Updates a review's moderation status ('APPROVED', 'PENDING', 'REJECTED') or verification status.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await verifyAdminSession(request);
    if (!session) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.productReview.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Review not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (body.status && ['APPROVED', 'PENDING', 'REJECTED'].includes(body.status)) {
      updateData.status = body.status;
    }
    if (typeof body.isVerified === 'boolean') {
      updateData.isVerified = body.isVerified;
    }

    const updated = await prisma.productReview.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'রিভিউ স্ট্যাটাস সফলভাবে আপডেট হয়েছে',
      review: updated,
    });
  } catch (error: any) {
    console.error('Error updating review status:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update review' },
      { status: 500 }
    );
  }
}

