import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
            primaryProducts: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    const {
      nameEn,
      nameBn,
      slug: customSlug,
      description,
      image,
      sortOrder,
      isActive,
      metaTitle,
      metaDescription,
    } = body;

    let finalSlug = existing.slug;
    if (customSlug && customSlug !== existing.slug) {
      finalSlug = slugify(customSlug);
      const duplicate = await prisma.category.findFirst({
        where: { slug: finalSlug, NOT: { id } },
      });
      if (duplicate) {
        finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
      }
    } else if (nameEn && nameEn !== existing.nameEn && !customSlug) {
      const generated = slugify(nameEn);
      const duplicate = await prisma.category.findFirst({
        where: { slug: generated, NOT: { id } },
      });
      if (!duplicate) {
        finalSlug = generated;
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(nameEn !== undefined && { nameEn: nameEn.trim() }),
        ...(nameBn !== undefined && { nameBn: nameBn?.trim() || null }),
        ...(finalSlug && { slug: finalSlug }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(image !== undefined && { image: image?.trim() || null }),
        ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) || 0 }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(metaTitle !== undefined && { metaTitle: metaTitle?.trim() || null }),
        ...(metaDescription !== undefined && { metaDescription: metaDescription?.trim() || null }),
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

    return NextResponse.json({ success: true, category: updated });
  } catch (error: any) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true, primaryProducts: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    // Safely detach category relations before deleting so no products are broken
    await prisma.$transaction(async (tx) => {
      // 1. Reset primary category on any products using this as categoryId
      await tx.product.updateMany({
        where: { categoryId: id },
        data: { categoryId: null },
      });

      // 2. Disconnect from implicit many-to-many ProductToCategory
      await tx.category.update({
        where: { id },
        data: {
          products: {
            set: [],
          },
        },
      });

      // 3. Delete category
      await tx.category.delete({
        where: { id },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Category "${existing.nameEn}" deleted successfully.`,
    });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete category' },
      { status: 500 }
    );
  }
}

