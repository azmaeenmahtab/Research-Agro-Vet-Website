'use client';

import React, { useState, useEffect, useTransition } from 'react';
import ProductCard, { ProductCardData } from './ProductCard';
import ProductFilters from './ProductFilters';
import { toBengaliNumber } from '@/lib/formatters';
import { PackageSearch, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const SPECIES_NAMES: Record<string, string> = {
  CATTLE_BUFFALO: 'গরু ও মহিষ',
  POULTRY: 'পোল্ট্রি ও হাঁস',
  GOAT_SHEEP: 'ছাগল ও ভেড়া',
  AQUA: 'মৎস্য ও চিংড়ি',
};

function formatRawProduct(p: any): ProductCardData {
  return {
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
  };
}

interface ProductCatalogContainerProps {
  initialProducts: ProductCardData[];
  initialTotal: number;
  initialPage?: number;
  initialSpecies?: string;
  initialCategory?: string;
  initialSearch?: string;
  pageSize?: number;
}

export default function ProductCatalogContainer({
  initialProducts,
  initialTotal,
  initialPage = 1,
  initialSpecies,
  initialCategory,
  initialSearch,
  pageSize = 9,
}: ProductCatalogContainerProps) {
  const [products, setProducts] = useState<ProductCardData[]>(initialProducts);
  const [totalCount, setTotalCount] = useState(initialTotal);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [species, setSpecies] = useState<string | undefined>(initialSpecies);
  const [category, setCategory] = useState<string | undefined>(initialCategory);
  const [search, setSearch] = useState<string | undefined>(initialSearch);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Sync with browser back/forward history
  useEffect(() => {
    const handlePopState = () => {
      const sp = new URLSearchParams(window.location.search);
      const newSpecies = sp.get('species') || undefined;
      const newCategory = sp.get('category') || undefined;
      const newSearch = sp.get('q') || sp.get('search') || undefined;
      const newPage = Number(sp.get('page')) || 1;

      setSpecies(newSpecies);
      setCategory(newCategory);
      setSearch(newSearch);
      setCurrentPage(newPage);
      fetchProducts(newSpecies, newCategory, newSearch, newPage, false);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const updateUrl = (
    nextSpecies?: string,
    nextCategory?: string,
    nextSearch?: string,
    nextPage?: number
  ) => {
    const params = new URLSearchParams();
    if (nextSpecies) params.set('species', nextSpecies);
    if (nextCategory) params.set('category', nextCategory);
    if (nextSearch) params.set('q', nextSearch);
    if (nextPage && nextPage > 1) params.set('page', String(nextPage));

    const qs = params.toString();
    const newPath = qs ? `/products?${qs}` : '/products';
    window.history.pushState(null, '', newPath);
  };

  const fetchProducts = async (
    targetSpecies?: string,
    targetCategory?: string,
    targetSearch?: string,
    targetPage: number = 1,
    shouldUpdateUrl: boolean = true
  ) => {
    setIsLoading(true);
    if (shouldUpdateUrl) {
      updateUrl(targetSpecies, targetCategory, targetSearch, targetPage);
    }

    try {
      const params = new URLSearchParams();
      if (targetSpecies) params.set('species', targetSpecies);
      if (targetCategory) params.set('category', targetCategory);
      if (targetSearch) params.set('q', targetSearch);
      params.set('page', String(targetPage));
      params.set('limit', String(pageSize));

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.products)) {
        startTransition(() => {
          setProducts(data.products.map(formatRawProduct));
          setTotalCount(data.total ?? data.products.length);
          setCurrentPage(targetPage);
        });
      }
    } catch (err) {
      console.error('Failed to fetch filtered products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeciesChange = (newSpecies?: string) => {
    setSpecies(newSpecies);
    fetchProducts(newSpecies, category, search, 1);
  };

  const handleCategoryChange = (newCategory?: string) => {
    setCategory(newCategory);
    fetchProducts(species, newCategory, search, 1);
  };

  const handleReset = () => {
    setSpecies(undefined);
    setCategory(undefined);
    setSearch(undefined);
    fetchProducts(undefined, undefined, undefined, 1);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    fetchProducts(species, category, search, page);

    // Smooth scroll to top of catalog section
    const catalogTop = document.getElementById('catalog-content-top');
    if (catalogTop) {
      catalogTop.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const hasActiveFilters = Boolean(species || category || search);

  // Pagination bounds
  const startItem = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* Left Column: Filter Sidebar (col-span-4, sticky) */}
      <aside className="lg:col-span-3 w-full lg:sticky lg:top-[85px] self-start z-20">
        <ProductFilters
          currentSpecies={species}
          currentCategory={category}
          currentSearch={search}
          onSpeciesChange={handleSpeciesChange}
          onCategoryChange={handleCategoryChange}
          onReset={handleReset}
        />
      </aside>

      {/* Right Column: Catalog Grid & Pagination (col-span-8) */}
      <div className="lg:col-span-9 space-y-5" id="catalog-content-top">
        {/* Catalog Header Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {species ? SPECIES_NAMES[species] || species : 'সকল ভেটেরিনারি পণ্য'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-100">
                {toBengaliNumber(totalCount)} টি পণ্য
              </span>
              {isLoading && (
                <Loader2 className="w-4 h-4 text-emerald-700 animate-spin" />
              )}
            </div>
            {/* <p className="text-xs text-slate-500 mt-0.5">
              উন্নত ফর্মুলেশন ও নিশ্চিত কার্যকারিতা।
            </p> */}
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap">
              {species && (
                <button
                  type="button"
                  onClick={() => handleSpeciesChange(undefined)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 border border-emerald-200 transition-colors"
                >
                  <span>{SPECIES_NAMES[species] || species}</span>
                  <X className="w-3 h-3" />
                </button>
              )}
              {category && (
                <button
                  type="button"
                  onClick={() => handleCategoryChange(undefined)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 border border-slate-200 transition-colors"
                >
                  <span>{category}</span>
                  <X className="w-3 h-3" />
                </button>
              )}
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch(undefined);
                    fetchProducts(species, category, undefined, 1);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold hover:bg-amber-100 border border-amber-200 transition-colors"
                >
                  <span>সার্চ: {search}</span>
                  <X className="w-3 h-3" />
                </button>
              )}
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-amber-700 hover:text-amber-800 font-bold underline ml-1 cursor-pointer"
              >
                সকল মুছুন
              </button>
            </div>
          )}
        </div>

        {/* Products Grid (Only this section updates on filter/page change) */}
        <div className={`relative transition-opacity duration-200 ${isLoading || isPending ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <PackageSearch className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">কোনো ঔষধ পাওয়া যায়নি</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                আপনার নির্বাচিত ফিল্টারে কোনো পণ্য পাওয়া যায়নি। দয়া করে ফিল্টার পরিবর্তন করুন বা রিসেট করুন।
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center justify-center px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  সকল পণ্য দেখুন
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-500 font-medium">
              মোট {toBengaliNumber(totalCount)} টির মধ্যে {toBengaliNumber(startItem)} - {toBengaliNumber(endItem)} টি পণ্য প্রদর্শিত
            </span>

            <nav aria-label="Pagination" className="flex items-center gap-1.5">
              {/* Previous Button */}
              <button
                type="button"
                disabled={currentPage <= 1 || isLoading}
                onClick={() => handlePageChange(currentPage - 1)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  currentPage <= 1
                    ? 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed'
                    : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-2xs cursor-pointer'
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">পূর্ববর্তী</span>
              </button>

              {/* Page Number Buttons */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                      isActive
                        ? 'bg-[#047857] text-white shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs'
                    }`}
                  >
                    {toBengaliNumber(pageNum)}
                  </button>
                );
              })}

              {/* Next Button */}
              <button
                type="button"
                disabled={currentPage >= totalPages || isLoading}
                onClick={() => handlePageChange(currentPage + 1)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  currentPage >= totalPages
                    ? 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed'
                    : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-2xs cursor-pointer'
                }`}
              >
                <span className="hidden sm:inline">পরবর্তী</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
