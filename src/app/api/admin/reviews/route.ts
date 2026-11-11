import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession, unauthorizedResponse } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/reviews
 * Fetches products list with aggregated review metrics, search, and pagination.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request);
    if (!session) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('q') || '').trim();
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.max(1, Math.min(50, Number(searchParams.get('limit')) || 12));
    const filter = searchParams.get('filter') || 'ALL'; // 'ALL' | 'WITH_REVIEWS' | 'LOW_RATING' | 'NO_REVIEWS'
    const sortBy = searchParams.get('sortBy') || 'reviews_desc'; // 'reviews_desc' | 'rating_asc' | 'rating_desc' | 'name'

    // Build product search where clause
    const where: any = {};
    if (search) {
      where.OR = [
        { nameEn: { contains: search } },
        { nameBn: { contains: search } },
        { slug: { contains: search } },
      ];
    }

    // Fetch all products matching search to compute review metrics accurately
    const productsRaw = await prisma.product.findMany({
      where,
      select: {
        id: true,
        nameEn: true,
        nameBn: true,
        slug: true,
        formFactor: true,
        thumbnail: true,
        status: true,
        category: {
          select: {
            id: true,
            nameEn: true,
            nameBn: true,
          },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Compute aggregated metrics for each product
    let computedList = productsRaw.map((p) => {
      const allReviews = p.reviews;
      const totalReviews = allReviews.length;
      const ratingSum = allReviews.reduce((acc, r) => acc + r.rating, 0);
      const avgRating = totalReviews > 0 ? Number((ratingSum / totalReviews).toFixed(1)) : 0;

      const starCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      allReviews.forEach((r) => {
        if (r.rating >= 1 && r.rating <= 5) {
          starCounts[r.rating] = (starCounts[r.rating] || 0) + 1;
        }
      });

      const lowRatingCount = (starCounts[1] || 0) + (starCounts[2] || 0);

      return {
        id: p.id,
        nameEn: p.nameEn,
        nameBn: p.nameBn,
        slug: p.slug,
        formFactor: p.formFactor,
        thumbnail: p.thumbnail,
        status: p.status,
        category: p.category,
        totalReviews,
        avgRating,
        starCounts,
        lowRatingCount,
      };
    });

    // Global summary stats
    const totalReviewsInDb = computedList.reduce((acc, p) => acc + p.totalReviews, 0);
    const reviewedProductsCount = computedList.filter((p) => p.totalReviews > 0).length;
    const globalSum = computedList.reduce((acc, p) => acc + p.avgRating * p.totalReviews, 0);
    const overallAvgRating = totalReviewsInDb > 0 ? Number((globalSum / totalReviewsInDb).toFixed(1)) : 0;
    const totalLowReviews = computedList.reduce((acc, p) => acc + p.lowRatingCount, 0);

    // Apply Filter
    if (filter === 'WITH_REVIEWS') {
      computedList = computedList.filter((p) => p.totalReviews > 0);
    } else if (filter === 'LOW_RATING') {
      computedList = computedList.filter((p) => p.totalReviews > 0 && p.avgRating <= 3.0);
    } else if (filter === 'NO_REVIEWS') {
      computedList = computedList.filter((p) => p.totalReviews === 0);
    }

    // Apply Sorting
    if (sortBy === 'rating_asc') {
      // Products with lowest average rating first (prioritize products that have reviews)
      computedList.sort((a, b) => {
        if (a.totalReviews === 0 && b.totalReviews > 0) return 1;
        if (a.totalReviews > 0 && b.totalReviews === 0) return -1;
        return a.avgRating - b.avgRating;
      });
    } else if (sortBy === 'rating_desc') {
      computedList.sort((a, b) => b.avgRating - a.avgRating);
    } else if (sortBy === 'reviews_desc') {
      computedList.sort((a, b) => b.totalReviews - a.totalReviews);
    } else if (sortBy === 'name') {
      computedList.sort((a, b) => a.nameEn.localeCompare(b.nameEn));
    }

    // Apply Pagination
    const total = computedList.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginatedProducts = computedList.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      success: true,
      stats: {
        totalReviews: totalReviewsInDb,
        overallAvgRating,
        reviewedProductsCount,
        totalLowReviews,
        totalCatalogProducts: productsRaw.length,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      products: paginatedProducts,
    });
  } catch (error: any) {
    console.error('Admin reviews query error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch reviews overview' },
      { status: 500 }
    );
  }
}

