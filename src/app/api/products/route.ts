import { NextRequest, NextResponse } from 'next/server';
import { getProducts, getFeaturedProducts } from '@/services/product.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isFeatured = searchParams.get('featured');

    // Quick path for homepage featured feed premix / products
    if (isFeatured === 'true' && !searchParams.get('search') && !searchParams.get('category')) {
      const limit = Number(searchParams.get('limit')) || 8;
      const products = await getFeaturedProducts(limit);
      return NextResponse.json({ success: true, products });
    }

    const filters = {
      category: searchParams.get('category') || undefined,
      species: searchParams.get('species') || undefined,
      search: searchParams.get('q') || searchParams.get('search') || undefined,
      featured: isFeatured === 'true' ? true : undefined,
      limit: Number(searchParams.get('limit')) || 20,
      page: Number(searchParams.get('page')) || 1,
    };

    const result = await getProducts(filters);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
