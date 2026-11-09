import { Suspense } from 'react';
import SpeciesNav from '@/components/storefront/SpeciesNav';
import HeroSection from '@/components/storefront/HeroSection';
import SpeciesGrid from '@/components/storefront/SpeciesGrid';
import TherapeuticPills from '@/components/storefront/TherapeuticPills';
import FeaturedProducts from '@/components/storefront/FeaturedProducts';
import { getFeaturedProducts } from '@/services/product.service';
import { getUniversalDiscountConfig, UniversalDiscountConfig } from '@/lib/pricing';

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

export default async function HomePage() {
  return (
    <div>
      <Suspense fallback={<div className="h-8 bg-slate-50 border-b border-slate-200" />}>
        <SpeciesNav />
      </Suspense>
      <HeroSection />
      <SpeciesGrid />
      <TherapeuticPills />
      <FeaturedProductsLoader />
    </div>
  );
}
