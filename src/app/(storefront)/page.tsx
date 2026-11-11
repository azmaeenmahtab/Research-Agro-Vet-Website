import { Suspense } from 'react';
import SpeciesNav from '@/components/storefront/SpeciesNav';
import HeroSection from '@/components/storefront/HeroSection';
import SpeciesGrid from '@/components/storefront/SpeciesGrid';
import TherapeuticPills from '@/components/storefront/TherapeuticPills';
import FeaturedProducts from '@/components/storefront/FeaturedProducts';
import FounderAchievements from '@/components/storefront/FounderAchievements';
import MoreProductsSection from '@/components/storefront/MoreProductsSection';
import { getFeaturedProducts } from '@/services/product.service';
import { getUniversalDiscountConfig, UniversalDiscountConfig } from '@/lib/pricing';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getHeroBanners() {
  try {
    const banners = await prisma.heroBanner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        imageUrl: true,
        title: true,
      },
    });
    return banners;
  } catch (error) {
    console.error('Database query fallback for hero banners:', error);
    return [];
  }
}

async function FeaturedProductsLoader() {
  let products: any[] = [];
  let universalDiscount: UniversalDiscountConfig = { enabled: false, percent: 0, label: '' };
  try {
    const [rawProducts, discountConfig] = await Promise.all([
      getFeaturedProducts(8),
      getUniversalDiscountConfig(),
    ]);
    // Serialize Prisma Decimals for the Client Component boundary
    products = JSON.parse(JSON.stringify(rawProducts));
    universalDiscount = discountConfig;
  } catch (error) {
    console.error('Database query fallback in HomePage:', error);
  }

  return <FeaturedProducts initialProducts={products} universalDiscount={universalDiscount} />;
}

async function getMoreProducts(limit = 14) {
  try {
    // Fetch active products skipping top 8 featured so visitors see fresh variety
    const products = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: {
        variants: { orderBy: { sellingPrice: 'asc' } },
        category: true,
        categories: true,
      },
      skip: 8,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    if (products.length >= limit) return products;

    // Fallback to top active products if fewer than limit
    return prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: {
        variants: { orderBy: { sellingPrice: 'asc' } },
        category: true,
        categories: true,
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Database query fallback for more products:', error);
    return [];
  }
}

async function MoreProductsLoader() {
  let products: any[] = [];
  let universalDiscount: UniversalDiscountConfig = { enabled: false, percent: 0, label: '' };
  try {
    const [rawProducts, discountConfig] = await Promise.all([
      getMoreProducts(14),
      getUniversalDiscountConfig(),
    ]);
    products = JSON.parse(JSON.stringify(rawProducts));
    universalDiscount = discountConfig;
  } catch (error) {
    console.error('Database query fallback in MoreProductsLoader:', error);
  }

  return <MoreProductsSection products={products} universalDiscount={universalDiscount} />;
}

export default async function HomePage() {
  const heroBanners = await getHeroBanners();

  return (
    <div>
      <Suspense fallback={<div className="h-8 bg-slate-50 border-b border-slate-200" />}>
        <SpeciesNav />
      </Suspense>
      <HeroSection banners={heroBanners} />
      {/* <SpeciesGrid /> */}
      {/* <TherapeuticPills /> */}
      <FeaturedProductsLoader />
      <FounderAchievements />
      <MoreProductsLoader />
    </div>
  );
}
