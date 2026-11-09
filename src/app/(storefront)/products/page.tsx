import { Suspense } from 'react';
import Link from 'next/link';
import { getProducts } from '@/services/product.service';
import { ProductCardData } from '@/components/storefront/ProductCard';
import ProductCatalogContainer from '@/components/storefront/ProductCatalogContainer';
import { getUniversalDiscountConfig, calculateVariantPricing, UniversalDiscountConfig } from '@/lib/pricing';


interface ProductsPageProps {
  searchParams: Promise<{
    species?: string;
    category?: string;
    search?: string;
    q?: string;
    page?: string;
  }>;
}

export const metadata = {
  title: 'সকল ভেটেরিনারি ফিড প্রিমিক্স পণ্য তালিকা | Research Agro Vet',
  description: 'গবাদিপশু, পোল্ট্রি ও মাছের জন্য ডিএলএস অনুমোদিত উন্নত ভেটেরিনারি ফিড প্রিমিক্স ক্যাটালগ।',
};

const SPECIES_NAMES: Record<string, string> = {
  CATTLE_BUFFALO: 'গরু ও মহিষ',
  POULTRY: 'পোল্ট্রি ও হাঁস',
  GOAT_SHEEP: 'ছাগল ও ভেড়া',
  AQUA: 'মৎস্য ও চিংড়ি',
};

const PAGE_SIZE = 9;

async function ProductsCatalog({ searchParams }: ProductsPageProps) {
  const resolvedParams = await searchParams;
  const { species, category } = resolvedParams;
  const search = resolvedParams.q || resolvedParams.search;
  const page = Number(resolvedParams.page) || 1;

  // Fetch initial products and live universal discount config
  let rawProducts: any[] = [];
  let totalCount = 0;
  let universalDiscount: UniversalDiscountConfig = { enabled: false, percent: 0, label: '' };

  try {
    const [result, discountConfig] = await Promise.all([
      getProducts({
        species,
        category,
        search,
        limit: PAGE_SIZE,
        page,
      }),
      getUniversalDiscountConfig(),
    ]);
    rawProducts = JSON.parse(JSON.stringify(result.products || []));
    totalCount = result.total || rawProducts.length;
    universalDiscount = discountConfig;
  } catch (error) {
    console.error('Error fetching products in ProductsPage:', error);
  }

  // Format initial database products for ProductCard with Individual Dominance & Universal Fallback
  const initialProducts: ProductCardData[] = rawProducts.map((p) => ({
    id: p.id,
    slug: p.slug,
    nameEn: p.nameEn,
    nameBn: p.nameBn || null,
    tagBadge: p.dlsLicenseNo ? 'DLS অনুমোদিত' : undefined,
    inStock: p.status === 'ACTIVE',
    thumbnail: p.thumbnail,
    imageUrl: p.thumbnail,
    speciesTags: p.speciesTags || [],
    indication: p.indication || null,
    variants:
      p.variants && p.variants.length > 0
        ? p.variants.map((v: any) => {
            const pricing = calculateVariantPricing(
              Number(v.mrpPrice || v.sellingPrice || 0),
              Number(v.sellingPrice),
              universalDiscount
            );
            return {
              id: v.id,
              sku: v.sku,
              packSize: v.packSize,
              tradePrice: Number(v.tradePrice || 0),
              mrpPrice: pricing.mrpPrice,
              sellingPrice: pricing.sellingPrice,
              discountPercent: pricing.discountPercent,
              discountType: pricing.discountType,
              inStock: v.inStock !== false,
              packagingInfo: v.packagingInfo || null,
              unitsPerBox: v.unitsPerBox || null,
            };
          })
        : [],
  }));

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 pt-4 sm:pt-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500 flex-wrap">
          <Link href="/" className="hover:text-emerald-700 transition-colors">
            হোম
          </Link>
          <span className="text-slate-400">/</span>
          <Link
            href="/products"
            className={
              species || category || search
                ? 'hover:text-emerald-700 transition-colors'
                : 'font-semibold text-slate-800'
            }
          >
            সকল পণ্য
          </Link>
          {species && (
            <>
              <span className="text-slate-400">/</span>
              <span className="font-semibold text-slate-800">
                {SPECIES_NAMES[species] || species}
              </span>
            </>
          )}
          {category && (
            <>
              <span className="text-slate-400">/</span>
              <span className="font-semibold text-slate-800">
                {category}
              </span>
            </>
          )}
          {search && (
            <>
              <span className="text-slate-400">/</span>
              <span className="text-slate-700 italic">“{search}”</span>
            </>
          )}
        </nav>
      </div>

      {/* Main Catalog & Isolated Grid Section */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <ProductCatalogContainer
          key={`${species || ''}-${category || ''}-${search || ''}-${page}`}
          initialProducts={initialProducts}
          initialTotal={totalCount}
          initialPage={page}
          initialSpecies={species}
          initialCategory={category}
          initialSearch={search}
          universalDiscount={universalDiscount}
          pageSize={PAGE_SIZE}
        />
      </main>
    </div>
  );
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  return <ProductsCatalog searchParams={searchParams} />;
}
