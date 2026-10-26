import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductBySlug, getProducts } from '@/services/product.service';
import ProductDetailsView from '@/components/storefront/ProductDetailsView';
import { ProductCardData } from '@/components/storefront/ProductCard';
import { Home, ShieldCheck } from 'lucide-react';

interface ProductDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'পণ্য পাওয়া যায়নি | Research Agro Vet',
    };
  }

  const title = `${product.nameEn}${product.nameBn ? ` (${product.nameBn})` : ''} | Research Agro Vet`;
  const description =
    product.shortDescription ||
    product.indication?.slice(0, 150) ||
    'ডিএলএস অনুমোদিত উন্নত ভেটেরিনারি ফিড প্রিমিক্স।';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [product.thumbnail || '/images/placeholder-medicine.webp'],
    },
  };
}

async function ProductDetailContent({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const rawProduct = await getProductBySlug(slug);

  if (!rawProduct) {
    notFound();
  }

  // Serialize Prisma Decimals & Relations
  const product = JSON.parse(JSON.stringify(rawProduct));

  // Fetch related products (e.g. from the same species or general active)
  let relatedProducts: ProductCardData[] = [];
  try {
    const relatedResult = await getProducts({
      species: product.speciesTags?.[0],
      limit: 5,
    });

    const filtered = (relatedResult.products || []).filter((p: any) => p.id !== product.id);
    relatedProducts = filtered.slice(0, 4).map((p: any) => ({
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
          : [],
    }));
  } catch (err) {
    console.error('Error fetching related products:', err);
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Breadcrumb & Regulatory Strip */}
      <div className="bg-white border-b border-slate-200 py-2.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-slate-600 flex-wrap">
            <Link href="/" className="hover:text-emerald-700 flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>হোম</span>
            </Link>
            <span className="text-slate-300">/</span>
            <Link href="/products" className="hover:text-emerald-700">
              সকল পণ্য
            </Link>
            {product.category && (
              <>
                <span className="text-slate-300">/</span>
                <Link
                  href={`/products?category=${product.category.slug}`}
                  className="hover:text-emerald-700"
                >
                  {product.category.nameBn || product.category.nameEn}
                </Link>
              </>
            )}
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-900 truncate max-w-xs">{product.nameEn}</span>
          </nav>

          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              {product.dlsLicenseNo ? `DLS Lic: ${product.dlsLicenseNo}` : 'প্রাণিসম্পদ অধিদপ্তর অনুমোদিত'}
            </span>
            <span>•</span>
            <span className="text-emerald-700 font-bold">ইন-স্টক ও ডেলিভারি যোগ্য</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <ProductDetailsView product={product} relatedProducts={relatedProducts} />
      </main>
    </div>
  );
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  return (
    <Suspense
      fallback={
        <div className="bg-slate-50 min-h-screen py-16 px-4 max-w-7xl mx-auto flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-600 font-bold">পণ্যের বিস্তারিত লোড হচ্ছে...</p>
          </div>
        </div>
      }
    >
      <ProductDetailContent params={params} />
    </Suspense>
  );
}
