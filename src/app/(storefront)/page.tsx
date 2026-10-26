import { Suspense } from 'react';
import HeroSection from '@/components/storefront/HeroSection';
import SpeciesGrid from '@/components/storefront/SpeciesGrid';
import TherapeuticPills from '@/components/storefront/TherapeuticPills';
import FeaturedProducts from '@/components/storefront/FeaturedProducts';
import { getFeaturedProducts } from '@/services/product.service';

async function FeaturedProductsLoader() {
  let products: any[] = [];
  try {
    const rawProducts = await getFeaturedProducts(4);
    // Serialize Prisma Decimals for the Client Component boundary
    products = JSON.parse(JSON.stringify(rawProducts));
  } catch (error) {
    console.error('Database query fallback in HomePage:', error);
  }

  return <FeaturedProducts initialProducts={products} />;
}

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <SpeciesGrid />
      <TherapeuticPills />
      <Suspense fallback={<FeaturedProducts initialProducts={[]} />}>
        <FeaturedProductsLoader />
      </Suspense>
    </div>
  );
}
