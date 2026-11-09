import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductBySlug, getProducts } from '@/services/product.service';
import ProductDetailsView from '@/components/storefront/ProductDetailsView';
import { ProductCardData } from '@/components/storefront/ProductCard';
import { getUniversalDiscountConfig, calculateVariantPricing } from '@/lib/pricing';

interface ProductDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Transforms raw Cloudinary image URLs into standard 1200x630 (1.91:1) social share cards.
 * Fits the full product bottle/packet cleanly inside the frame on a white background with zero cropping.
 */
function getProductOgImageUrl(imageUrl?: string | null): string {
  if (!imageUrl) return '/images/og-image.png';

  if (imageUrl.includes('res.cloudinary.com') && imageUrl.includes('/image/upload/')) {
    return imageUrl.replace(
      '/image/upload/',
      '/image/upload/c_fit,h_570,w_1100/b_white,c_pad,h_630,w_1200,f_auto,q_auto/'
    );
  }

  return imageUrl;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'পণ্য পাওয়া যায়নি',
    };
  }

  const title = product.nameBn
    ? `${product.nameEn} (${product.nameBn})`
    : product.nameEn;

  // Keep description within ~135 characters for clean social cards without mid-sentence truncations
  const rawDescription =
    product.shortDescription ||
    product.indication?.replace(/\r?\n|\r/g, ' ') ||
    'ডিএলএস অনুমোদিত উন্নত ভেটেরিনারি ফিড প্রিমিক্স ও পুষ্টি সম্পূরক।';
  const description =
    rawDescription.length > 135
      ? `${rawDescription.slice(0, 132).trim()}...`
      : rawDescription;

  const ogImageUrl = getProductOgImageUrl(product.thumbnail);

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      siteName: 'Research Agro Vet',
      locale: 'bn_BD',
      title: `${title} | Research Agro Vet`,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: product.nameEn,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Research Agro Vet`,
      description,
      images: [ogImageUrl],
    },
  };
}

async function ProductDetailContent({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const [rawProduct, universalDiscount] = await Promise.all([
    getProductBySlug(slug),
    getUniversalDiscountConfig(),
  ]);

  if (!rawProduct) {
    notFound();
  }

  // Serialize Prisma Decimals & Relations
  const product = JSON.parse(JSON.stringify(rawProduct));

  // Apply Individual Dominance & Universal Fallback to product variants
  if (product.variants && Array.isArray(product.variants)) {
    product.variants = product.variants.map((v: any) => {
      const pricing = calculateVariantPricing(
        Number(v.mrpPrice || v.sellingPrice || 0),
        Number(v.sellingPrice),
        universalDiscount
      );
      return {
        ...v,
        mrpPrice: pricing.mrpPrice,
        sellingPrice: pricing.sellingPrice,
        discountPercent: pricing.discountPercent,
        savingsPerUnit: pricing.savingsPerUnit,
        discountType: pricing.discountType,
        hasDiscount: pricing.hasDiscount,
      };
    });
  }

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
                inStock: v.inStock !== false,
                packagingInfo: v.packagingInfo || null,
                unitsPerBox: v.unitsPerBox || null,
              };
            })
          : [],
    }));
  } catch (err) {
    console.error('Error fetching related products:', err);
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 pt-4 sm:pt-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500 flex-wrap">
          <Link href="/" className="hover:text-emerald-700 transition-colors">
            হোম
          </Link>
          <span className="text-slate-400">/</span>
          <Link href="/products" className="hover:text-emerald-700 transition-colors">
            সকল পণ্য
          </Link>
          {product.category && (
            <>
              <span className="text-slate-400">/</span>
              <Link
                href={`/products?category=${product.category.slug}`}
                className="hover:text-emerald-700 transition-colors"
              >
                {product.category.nameBn || product.category.nameEn}
              </Link>
            </>
          )}
          <span className="text-slate-400">/</span>
          <span className="font-semibold text-slate-800 truncate max-w-xs sm:max-w-md">
            {product.nameEn}
          </span>
        </nav>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <ProductDetailsView
          product={product}
          relatedProducts={relatedProducts}
          universalDiscount={universalDiscount}
        />
      </main>
    </div>
  );
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  return <ProductDetailContent params={params} />;
}
