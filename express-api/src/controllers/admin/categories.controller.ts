import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// GET /api/admin/categories
export async function getAdminCategories(req: Request, res: Response) {
  try {
    const search = ((req.query.q as string) || '').trim();

    const where: any = {};
    if (search) {
      where.OR = [
        { nameEn: { contains: search, mode: 'insensitive' } },
        { nameBn: { contains: search } },
        { slug: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
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

    return res.json({ success: true, categories });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch categories',
    });
  }
}

// POST /api/admin/categories
export async function createAdminCategory(req: Request, res: Response) {
  try {
    const body = req.body;
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
      return res.status(400).json({
        success: false,
        message: 'English Category Name is required',
      });
    }

    const baseSlug = customSlug ? slugify(customSlug) : slugify(nameEn);
    let resolvedSlug = baseSlug || `cat-${Date.now()}`;
    let slugExists = await prisma.category.findUnique({ where: { slug: resolvedSlug } });
    let counter = 1;
    while (slugExists) {
      resolvedSlug = `${baseSlug}-${counter++}`;
      slugExists = await prisma.category.findUnique({ where: { slug: resolvedSlug } });
    }

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

    return res.json({ success: true, category });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create category',
    });
  }
}

// GET /api/admin/categories/:id
export async function getAdminCategoryById(req: Request, res: Response) {
  try {
    const { id } = req.params;
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
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    return res.json({ success: true, category });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch category',
    });
  }
}

// PUT /api/admin/categories/:id
export async function updateAdminCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const body = req.body;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Category not found' });
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

    return res.json({ success: true, category: updated });
  } catch (error: any) {
    console.error('Error updating category:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update category',
    });
  }
}

// DELETE /api/admin/categories/:id
export async function deleteAdminCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const existing = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true, primaryProducts: true },
        },
      },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    await prisma.$transaction(async (tx: any) => {
      
      await tx.product.updateMany({
        where: { categoryId: id },
        data: { categoryId: null },
      });

      await tx.category.update({
        where: { id },
        data: {
          products: {
            set: [],
          },
        },
      });

      await tx.category.delete({
        where: { id },
      });
    });

    return res.json({
      success: true,
      message: `Category "${existing.nameEn}" deleted successfully.`,
    });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete category',
    });
  }
}

