import { Request, Response } from 'express';
import { getProducts, getFeaturedProducts, toggleProductFeatured } from '../services/product.service';
import { prisma } from '../lib/prisma';

// GET /api/products
export async function listProducts(req: Request, res: Response) {
  try {
    const isFeatured = req.query.featured as string | undefined;

    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'default' },
      select: { enableGeneralDiscount: true, generalRetailDiscountPercent: true },
    });
    const percent = Number(settings?.generalRetailDiscountPercent) || 0;
    const universalDiscount = {
      enabled: Boolean(settings?.enableGeneralDiscount) && percent > 0,
      percent,
      label: `Website ${percent}% Universal Discount`,
    };

    // Quick path for homepage featured feed
    if (isFeatured === 'true' && !req.query.search && !req.query.category) {
      const limit = Number(req.query.limit) || 8;
      const products = await getFeaturedProducts(limit);
      return res.json({ success: true, products, universalDiscount });
    }

    const filters = {
      category: (req.query.category as string) || undefined,
      species: (req.query.species as string) || undefined,
      search: (req.query.q as string) || (req.query.search as string) || undefined,
      featured: isFeatured === 'true' ? true : undefined,
      limit: Number(req.query.limit) || 20,
      page: Number(req.query.page) || 1,
    };

    const result = await getProducts(filters);
    return res.json({ success: true, ...result, universalDiscount });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch products' });
  }
}

// GET /api/products/:id
export async function getProductById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { variants: true, category: true },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.json({ success: true, product });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// PATCH /api/products/:id
export async function patchProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const body = req.body;

    if (typeof body.isFeatured === 'boolean') {
      const updated = await toggleProductFeatured(id, body.isFeatured);
      return res.json({ success: true, product: updated });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: body,
      include: { variants: true },
    });

    return res.json({ success: true, product: updated });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

// GET /api/products/:id/reviews
export async function getProductReviews(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Resolve product by ID or Slug
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      select: { id: true },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
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
        ? Number((reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / total).toFixed(1))
        : 0;

    const ratingBreakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r: any) => {
      if (r.rating >= 1 && r.rating <= 5) {
        ratingBreakdown[r.rating] = (ratingBreakdown[r.rating] || 0) + 1;
      }
    });

    return res.json({
      success: true,
      reviews,
      total,
      avgRating,
      ratingBreakdown,
    });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

// POST /api/products/:id/reviews
export async function createProductReview(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const body = req.body;

    const { userName, rating, comment, farmerType, userPhone, title } = body;

    if (!userName || typeof userName !== 'string' || !userName.trim()) {
      return res.status(400).json({ success: false, message: 'আপনার নাম লিখুন' });
    }

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: '১ থেকে ৫ এর মধ্যে রেটিং দিন' });
    }

    if (!comment || typeof comment !== 'string' || !comment.trim()) {
      return res.status(400).json({ success: false, message: 'মতামত বা রিভিউ বিবরণ লিখুন' });
    }

    // Resolve product
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      select: { id: true },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'পণ্য খুঁজে পাওয়া যায়নি' });
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

    return res.json({
      success: true,
      message: 'আপনার রিভিউ সফলভাবে প্রকাশ হয়েছে! ধন্যবাদ।',
      review,
    });
  } catch (error: any) {
    console.error('Error creating review:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
