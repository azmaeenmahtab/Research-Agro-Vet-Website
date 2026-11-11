import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession, unauthorizedResponse } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/reviews/product/[id]
 * Returns paginated reviews for a specific product with sorting by stars (asc/desc), star filtering, and pagination.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await verifyAdminSession(request);
    if (!session) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.max(1, Math.min(50, Number(searchParams.get('limit')) || 8));
    const starFilter = searchParams.get('star'); // '1'..'5' or 'ALL'
    const sort = searchParams.get('sort') || 'star_asc'; // 'star_asc' (low star first) | 'star_desc' | 'newest' | 'oldest'

    // Fetch product info
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        nameEn: true,
        nameBn: true,
        slug: true,
        thumbnail: true,
        formFactor: true,
        category: {
          select: {
            nameEn: true,
            nameBn: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    // Build review where clause
    const where: any = {
      productId: id,
    };

    if (starFilter && starFilter !== 'ALL') {
      const numStar = Number(starFilter);
      if (numStar >= 1 && numStar <= 5) {
        where.rating = numStar;
      }
    }

    // Determine sorting criteria
    let orderBy: any[];
    if (sort === 'star_asc') {
      // LOW STAR REVIEWS FIRST (1 star to 5 stars)
      orderBy = [{ rating: 'asc' }, { createdAt: 'desc' }];
    } else if (sort === 'star_desc') {
      // HIGH STAR REVIEWS FIRST (5 stars to 1 star)
      orderBy = [{ rating: 'desc' }, { createdAt: 'desc' }];
    } else if (sort === 'oldest') {
      orderBy = [{ createdAt: 'asc' }];
    } else {
      // Default: newest first
      orderBy = [{ createdAt: 'desc' }];
    }

    // Total count for filtered reviews
    const totalCount = await prisma.productReview.count({ where });

    // Fetch paginated reviews
    const reviews = await prisma.productReview.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        productId: true,
        userName: true,
        userPhone: true,
        farmerType: true,
        rating: true,
        title: true,
        comment: true,
        isVerified: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Compute all-time star distribution for this product (unaffected by current star filter)
    const allReviewsForStats = await prisma.productReview.findMany({
      where: { productId: id },
      select: { rating: true, status: true },
    });

    const starCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    allReviewsForStats.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) {
        starCounts[r.rating] = (starCounts[r.rating] || 0) + 1;
      }
    });

    const allReviewsTotal = allReviewsForStats.length;
    const avgRating =
      allReviewsTotal > 0
        ? Number(
            (allReviewsForStats.reduce((acc, r) => acc + r.rating, 0) / allReviewsTotal).toFixed(1)
          )
        : 0;

    const totalPages = Math.ceil(totalCount / limit) || 1;

    return NextResponse.json({
      success: true,
      product,
      stats: {
        totalReviews: allReviewsTotal,
        avgRating,
        starCounts,
        lowRatingCount: (starCounts[1] || 0) + (starCounts[2] || 0),
      },
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
      },
      reviews,
    });
  } catch (error: any) {
    console.error('Error fetching product reviews in admin:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch product reviews' },
      { status: 500 }
    );
  }
}

