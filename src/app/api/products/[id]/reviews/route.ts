import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Resolve product by ID or Slug
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    const reviews = await prisma.productReview.findMany({
      where: {
        productId: product.id,
        status: 'APPROVED',
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = reviews.length;
    const avgRating =
      total > 0
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1))
        : 0;

    const ratingBreakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) {
        ratingBreakdown[r.rating] = (ratingBreakdown[r.rating] || 0) + 1;
      }
    });

    return NextResponse.json({
      success: true,
      reviews,
      total,
      avgRating,
      ratingBreakdown,
    });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { userName, rating, comment, farmerType, userPhone, title } = body;

    if (!userName || typeof userName !== 'string' || !userName.trim()) {
      return NextResponse.json({ success: false, message: 'আপনার নাম লিখুন' }, { status: 400 });
    }

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return NextResponse.json({ success: false, message: '১ থেকে ৫ এর মধ্যে রেটিং দিন' }, { status: 400 });
    }

    if (!comment || typeof comment !== 'string' || !comment.trim()) {
      return NextResponse.json({ success: false, message: 'মতামত বা রিভিউ বিবরণ লিখুন' }, { status: 400 });
    }

    // Resolve product
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ success: false, message: 'পণ্য খুঁজে পাওয়া যায়নি' }, { status: 404 });
    }

    const review = await prisma.productReview.create({
      data: {
        productId: product.id,
        userName: userName.trim(),
        userPhone: userPhone ? String(userPhone).trim() : null,
        farmerType: farmerType ? String(farmerType).trim() : 'খামারি / গ্রাহক',
        rating: Math.round(numRating),
        title: title ? String(title).trim() : null,
        comment: comment.trim(),
        status: 'APPROVED', // Immediately approved for real-time visibility
        isVerified: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'আপনার রিভিউ সফলভাবে প্রকাশ হয়েছে! ধন্যবাদ।',
      review,
    });
  } catch (error: any) {
    console.error('Error creating review:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
