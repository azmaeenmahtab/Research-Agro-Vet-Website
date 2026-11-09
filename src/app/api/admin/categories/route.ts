import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('q')?.trim() || '';

    const where: any = {};
    if (search) {
      where.OR = [
        { nameEn: { contains: search } },
        { nameBn: { contains: search } },
        { slug: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        _count: {
          select: {
            products: true,
            primaryProducts: true,
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      nameEn,
      nameBn,
      slug: customSlug,
      description,
      image,
      sortOrder,
      isActive = true,
      metaTitle,
      metaDescription,
    } = body;

    if (!nameEn || !nameEn.trim()) {
      return NextResponse.json(
        { success: false, message: 'English Category Name is required' },
        { status: 400 }
      );
    }

    const baseSlug = customSlug ? slugify(customSlug) : slugify(nameEn);
    let resolvedSlug = baseSlug || `cat-${Date.now()}`;
    let slugExists = await prisma.category.findUnique({ where: { slug: resolvedSlug } });
    let counter = 1;
    while (slugExists) {
      resolvedSlug = `${baseSlug}-${counter++}`;
      slugExists = await prisma.category.findUnique({ where: { slug: resolvedSlug } });
    }

    // Auto determine sortOrder if not provided
    let finalSortOrder = Number(sortOrder);
    if (isNaN(finalSortOrder)) {
      const maxCat = await prisma.category.findFirst({
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true },
      });
      finalSortOrder = (maxCat?.sortOrder ?? 0) + 1;
    }

    const category = await prisma.category.create({
      data: {
        nameEn: nameEn.trim(),
        nameBn: nameBn?.trim() || null,
        slug: resolvedSlug,
        description: description?.trim() || null,
        image: image?.trim() || null,
        sortOrder: finalSortOrder,
        isActive: Boolean(isActive),
        metaTitle: metaTitle?.trim() || null,
        metaDescription: metaDescription?.trim() || null,
      },
      include: {
        _count: {
          select: {
            products: true,
            primaryProducts: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create category' },
      { status: 500 }
    );
  }
}

