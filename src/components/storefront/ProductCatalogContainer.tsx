'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard, { ProductCardData } from './ProductCard';
import ProductFilters from './ProductFilters';
import { toBengaliNumber } from '@/lib/formatters';
import { PackageSearch, X, ChevronLeft, ChevronRight, Loader2, Search } from 'lucide-react';
import { getApiUrl } from '@/lib/api-client';
import { calculateVariantPricing, UniversalDiscountConfig } from '@/lib/pricing';

const SPECIES_NAMES: Record<string, string> = {
  CATTLE_BUFFALO: 'গরু ও মহিষ',
  POULTRY: 'পোল্ট্রি ও হাঁস',
  GOAT_SHEEP: 'ছাগল ও ভেড়া',
  AQUA: 'মৎস্য ও চিংড়ি',
};

function formatRawProduct(p: any, universalDiscount?: UniversalDiscountConfig | null): ProductCardData {
  return {
    id: p.id,
    slug: p.slug,
    nameEn: p.nameEn,
    nameBn: p.nameBn || null,
    tagBadge: p.dlsLicenseNo ? 'DLS অনুমোদিত' : undefined,
    isFeatured: Boolean(p.isFeatured),
    isBestSeller: Boolean(p.isBestSeller),
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
  universalDiscount?: UniversalDiscountConfig;
}

export default function ProductCatalogContainer({
  initialProducts,
  initialTotal,
  initialPage = 1,
  initialSpecies,
  initialCategory,
  initialSearch,
  pageSize = 9,
  universalDiscount,
}: ProductCatalogContainerProps) {
  const searchParamsHook = useSearchParams();
  const [products, setProducts] = useState<ProductCardData[]>(initialProducts);
  const [totalCount, setTotalCount] = useState(initialTotal);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [species, setSpecies] = useState<string | undefined>(initialSpecies);
  const [category, setCategory] = useState<string | undefined>(initialCategory);
  const [search, setSearch] = useState<string | undefined>(initialSearch);
  const [searchInput, setSearchInput] = useState<string>(initialSearch || '');
  const [currentDiscount, setCurrentDiscount] = useState<UniversalDiscountConfig | undefined>(universalDiscount);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Sync state with incoming server props when URL or router changes
  useEffect(() => {
    setProducts(initialProducts);
    setTotalCount(initialTotal);
    setCurrentPage(initialPage);
    setSpecies(initialSpecies);
    setCategory(initialCategory);
    setSearch(initialSearch);
    setSearchInput(initialSearch || '');
  }, [initialProducts, initialTotal, initialPage, initialSpecies, initialCategory, initialSearch]);

  // Sync with Next.js router query param changes (e.g. from Navbar search or links)
  useEffect(() => {
    if (!searchParamsHook) return;
    const urlQuery = searchParamsHook.get('q') || searchParamsHook.get('search') || undefined;
    const urlSpecies = searchParamsHook.get('species') || undefined;
    const urlCategory = searchParamsHook.get('category') || undefined;
    const urlPage = Number(searchParamsHook.get('page')) || 1;

    if (
      urlQuery !== search ||
      urlSpecies !== species ||
      urlCategory !== category ||
      urlPage !== currentPage
    ) {
      setSearch(urlQuery);
      setSearchInput(urlQuery || '');
      setSpecies(urlSpecies);
      setCategory(urlCategory);
      setCurrentPage(urlPage);
      fetchProducts(urlSpecies, urlCategory, urlQuery, urlPage, false);
    }
  }, [searchParamsHook]);

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
      setSearchInput(newSearch || '');
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

      const res = await fetch(getApiUrl(`/api/products?${params.toString()}`));
      const data = await res.json();

      if (data.success && Array.isArray(data.products)) {
        if (data.universalDiscount) {
          setCurrentDiscount(data.universalDiscount);
        }
        const activeDiscount = data.universalDiscount || currentDiscount;
        startTransition(() => {
          setProducts(data.products.map((p: any) => formatRawProduct(p, activeDiscount)));
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

  const handleSearchSubmit = (text: string) => {
    const trimmed = text.trim() || undefined;
    setSearch(trimmed);
    fetchProducts(species, category, trimmed, 1);
  };

  const handleReset = () => {
    setSpecies(undefined);
    setCategory(undefined);
    setSearch(undefined);
    setSearchInput('');
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
    <div className="grid grid-cols-1 lg:grid-cols-12 sm:gap-5 gap-0 items-start">
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
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {search ? `“${search}” এর ফলাফল` : species ? SPECIES_NAMES[species] || species : 'সকল ভেটেরিনারি পণ্য'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-100">
                {toBengaliNumber(totalCount)} টি পণ্য
              </span>
              {isLoading && (
                <Loader2 className="w-4 h-4 text-emerald-700 animate-spin" />
              )}
            </div>
          </div>

          {/* Quick Search inside Catalog Header */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearchSubmit(searchInput);
                  }
                }}
                placeholder="পণ্য বা রোগের নাম খুঁজুন..."
                className="w-full pl-8 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:border-emerald-600 focus:outline-none transition-all"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    handleSearchSubmit('');
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  title="মুছুন"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            {searchInput.trim() !== (search || '').trim() && (
              <button
                type="button"
                onClick={() => handleSearchSubmit(searchInput)}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors shrink-0 shadow-2xs"
              >
                সার্চ
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 mr-1">সক্রিয় ফিল্টার:</span>
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
                  setSearchInput('');
                  fetchProducts(species, category, undefined, 1);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold hover:bg-amber-100 border border-amber-200 transition-colors"
              >
                <span>সার্চ: “{search}”</span>
                <X className="w-3 h-3" />
              </button>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-amber-700 hover:text-amber-800 font-bold underline ml-auto cursor-pointer"
            >
              সকল মুছুন
            </button>
          </div>
        )}

        {/* Products Grid (Only this section updates on filter/page change) */}
        <div className={`relative transition-opacity duration-200 ${isLoading || isPending ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5">
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
              <h3 className="text-base font-bold text-slate-800">কোনো পণ্য পাওয়া যায়নি</h3>
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
