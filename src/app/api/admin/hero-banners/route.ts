import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';
import { verifyAdminSession, unauthorizedResponse } from '@/lib/auth-server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * GET /api/admin/hero-banners
 * Lists all hero banners from the database, plus optionally existing Cloudinary assets in the hero folder.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request);
    if (!session) {
      return unauthorizedResponse();
    }

    // 1. Fetch from Database
    const banners = await prisma.heroBanner.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    // 2. Fetch existing Cloudinary images in the hero-banners folder so admin can see all uploaded files
    let cloudinaryImages: any[] = [];
    try {
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        const cloudResult = await cloudinary.api.resources({
          type: 'upload',
          prefix: 'research-agro-vet/hero-banners',
          max_results: 60,
        });
        cloudinaryImages = (cloudResult.resources || []).map((res: any) => ({
          publicId: res.public_id,
          url: res.secure_url,
          format: res.format,
          bytes: res.bytes,
          width: res.width,
          height: res.height,
          createdAt: res.created_at,
        }));
      }
    } catch (cloudErr) {
      console.warn('Note: Cloudinary resource listing skipped or restricted:', cloudErr);
    }

    return NextResponse.json({
      success: true,
      banners,
      cloudinaryImages,
    });
  } catch (error: any) {
    console.error('Error fetching hero banners:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch hero banners' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/hero-banners
 * Creates a new hero banner entry in the database.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request);
    if (!session) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const {
      imageUrl,
      title = 'Hero Slide',
      subtitle = null,
      isActive = true,
      sortOrder,
    } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, message: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Determine sortOrder if not provided
    let finalSortOrder = typeof sortOrder === 'number' ? sortOrder : 0;
    if (sortOrder === undefined) {
      const highestOrder = await prisma.heroBanner.findFirst({
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true },
      });
      finalSortOrder = (highestOrder?.sortOrder ?? -1) + 1;
    }

    const banner = await prisma.heroBanner.create({
      data: {
        imageUrl: imageUrl.trim(),
        title: (title || 'Hero Slide').trim(),
        subtitle: subtitle ? subtitle.trim() : null,
        isActive: Boolean(isActive),
        sortOrder: finalSortOrder,
      },
    });

    return NextResponse.json({
      success: true,
      banner,
      message: 'Hero banner added successfully',
    });
  } catch (error: any) {
    console.error('Error creating hero banner:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create hero banner' },
      { status: 500 }
    );
  }
}

