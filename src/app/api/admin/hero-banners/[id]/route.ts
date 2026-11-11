import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';
import { verifyAdminSession, unauthorizedResponse } from '@/lib/auth-server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/admin/hero-banners/[id]
 * Updates a banner's active status, title, or sort order.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await verifyAdminSession(request);
    if (!session) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const body = await request.json();

    const banner = await prisma.heroBanner.findUnique({
      where: { id },
    });

    if (!banner) {
      return NextResponse.json(
        { success: false, message: 'Hero banner not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (typeof body.isActive === 'boolean') {
      updateData.isActive = body.isActive;
    }
    if (typeof body.sortOrder === 'number') {
      updateData.sortOrder = body.sortOrder;
    }
    if (typeof body.title === 'string') {
      updateData.title = body.title.trim();
    }
    if (typeof body.subtitle === 'string') {
      updateData.subtitle = body.subtitle.trim() || null;
    }

    const updated = await prisma.heroBanner.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      banner: updated,
      message: 'Banner updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating hero banner:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update hero banner' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/hero-banners/[id]
 * Deletes a hero banner record from database and attempts to remove it from Cloudinary.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await verifyAdminSession(request);
    if (!session) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const banner = await prisma.heroBanner.findUnique({
      where: { id },
    });

    if (!banner) {
      return NextResponse.json(
        { success: false, message: 'Hero banner not found' },
        { status: 404 }
      );
    }

    // Attempt to extract Cloudinary public_id and delete if hosted on Cloudinary
    if (banner.imageUrl && banner.imageUrl.includes('cloudinary.com')) {
      try {
        const matches = banner.imageUrl.match(/upload\/(?:v\d+\/)?(.+?)\.[a-zA-Z0-9]+$/);
        if (matches && matches[1]) {
          await cloudinary.uploader.destroy(matches[1]);
        }
      } catch (cloudErr) {
        console.warn('Could not delete Cloudinary asset:', cloudErr);
      }
    }

    await prisma.heroBanner.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Hero banner deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting hero banner:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete hero banner' },
      { status: 500 }
    );
  }
}

