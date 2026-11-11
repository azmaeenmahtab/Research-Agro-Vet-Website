import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/hero-banners
 * Public storefront endpoint returning active hero slider banners.
 */
export async function GET() {
  try {
    const banners = await prisma.heroBanner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        sortOrder: true,
      },
    });

    return NextResponse.json({
      success: true,
      banners,
    });
  } catch (error: any) {
    console.error('Error fetching storefront hero banners:', error);
    return NextResponse.json(
      { success: false, banners: [] },
      { status: 500 }
    );
  }
}

