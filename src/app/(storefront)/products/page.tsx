import { Suspense } from 'react';
import Link from 'next/link';
import { getProducts } from '@/services/product.service';
import { ProductCardData } from '@/components/storefront/ProductCard';
import ProductCatalogContainer from '@/components/storefront/ProductCatalogContainer';
import { toBengaliNumber } from '@/lib/formatters';
import { Home, ShieldCheck } from 'lucide-react';

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
  description: 'গবাদিপশু, পোল্ট্রি ও মাছের জন্য ডিএলএস অনুমোদিত উন্নত ভেটেরিনারি ঔষধিযুক্ত ফিড প্রিমিক্স ক্যাটালগ।',
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

  // Fetch initial products from database for fast initial SSR / SEO
  let rawProducts: any[] = [];
  let totalCount = 0;

  try {
    const result = await getProducts({
      species,
      category,
      search,
      limit: PAGE_SIZE,
      page,
    });
    rawProducts = JSON.parse(JSON.stringify(result.products || []));
    totalCount = result.total || rawProducts.length;
  } catch (error) {
    console.error('Error fetching products in ProductsPage:', error);
  }

  // Format initial database products for ProductCard
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
        ? p.variants.map((v: any) => ({
            id: v.id,
            sku: v.sku,
            packSize: v.packSize,
            tradePrice: Number(v.tradePrice || 0),
            mrpPrice: Number(v.mrpPrice || v.sellingPrice || 0),
            sellingPrice:
              Number(v.sellingPrice) < Number(v.mrpPrice)
                ? Number(v.sellingPrice)
                : Math.round(Number(v.mrpPrice) * 0.95),
            inStock: v.inStock !== false,
            packagingInfo: v.packagingInfo || null,
            unitsPerBox: v.unitsPerBox || null,
          }))
        : [
            {
              id: `var-${p.id}`,
              sku: `SKU-${p.id}`,
              packSize: 'Standard',
              tradePrice: 100,
              mrpPrice: 120,
              sellingPrice: 114,
              inStock: true,
            },
          ],
  }));

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Breadcrumb & Regulatory Ribbon */}
      <div className="bg-white border-b border-slate-200 py-2.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-slate-600 flex-wrap">
            <Link href="/" className="hover:text-emerald-700 flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>হোম</span>
            </Link>
            <span className="text-slate-300">/</span>
            <Link href="/products" className="font-semibold text-slate-900 hover:text-emerald-700">
              সকল পণ্য
            </Link>
            {species && (
              <>
                <span className="text-slate-300">/</span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                  {SPECIES_NAMES[species] || species}
                </span>
              </>
            )}
            {category && (
              <>
                <span className="text-slate-300">/</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                  {category}
                </span>
              </>
            )}
            {search && (
              <>
                <span className="text-slate-300">/</span>
                <span className="text-amber-800 italic">“{search}”</span>
              </>
            )}
          </nav>

          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              প্রাণিসম্পদ অধিদপ্তর নিবন্ধিত
            </span>
            <span>•</span>
            <span>সর্বমোট {toBengaliNumber(totalCount)} টি পণ্য তালিকাভুক্ত</span>
          </div>
        </div>
      </div>

      {/* Main Catalog & Isolated Grid Section */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <ProductCatalogContainer
          initialProducts={initialProducts}
          initialTotal={totalCount}
          initialPage={page}
          initialSpecies={species}
          initialCategory={category}
          initialSearch={search}
          pageSize={PAGE_SIZE}
        />
      </main>
    </div>
  );
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <Suspense
      fallback={
        <div className="bg-slate-50 min-h-screen py-12 px-4 max-w-7xl mx-auto flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">ঔষধ তালিকা লোড হচ্ছে...</p>
          </div>
        </div>
      }
    >
      <ProductsCatalog searchParams={searchParams} />
    </Suspense>
  );
}
