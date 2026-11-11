'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { authorizedFetch } from '@/lib/api-client';
import {
  Star,
  Search,
  Filter,
  ArrowUpDown,
  MessageSquare,
  AlertTriangle,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  ThumbsUp,
  AlertCircle,
} from 'lucide-react';

interface ProductReviewItem {
  id: string;
  productId: string;
  userName: string;
  userPhone?: string | null;
  farmerType?: string | null;
  rating: number;
  title?: string | null;
  comment: string;
  isVerified: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

interface ProductReviewSummary {
  id: string;
  nameEn: string;
  nameBn?: string | null;
  slug: string;
  formFactor: string;
  thumbnail: string;
  status: string;
  category?: {
    id: string;
    nameEn: string;
    nameBn?: string | null;
  } | null;
  totalReviews: number;
  avgRating: number;
  starCounts: Record<number, number>;
  lowRatingCount: number;
}

interface ReviewOverviewStats {
  totalReviews: number;
  overallAvgRating: number;
  reviewedProductsCount: number;
  totalLowReviews: number;
  totalCatalogProducts: number;
}

export default function AdminReviewsPage() {
  // Main Products List State
  const [products, setProducts] = useState<ProductReviewSummary[]>([]);
  const [stats, setStats] = useState<ReviewOverviewStats>({
    totalReviews: 0,
    overallAvgRating: 0,
    reviewedProductsCount: 0,
    totalLowReviews: 0,
    totalCatalogProducts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'WITH_REVIEWS' | 'LOW_RATING' | 'NO_REVIEWS'
  const [sortBy, setSortBy] = useState('reviews_desc'); // 'reviews_desc' | 'rating_asc' | 'rating_desc' | 'name'
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Modal State for Individual Product Reviews
  const [selectedProduct, setSelectedProduct] = useState<ProductReviewSummary | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalReviews, setModalReviews] = useState<ProductReviewItem[]>([]);
  const [modalStats, setModalStats] = useState<{
    totalReviews: number;
    avgRating: number;
    starCounts: Record<number, number>;
    lowRatingCount: number;
  } | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalPage, setModalPage] = useState(1);
  const [modalTotalPages, setModalTotalPages] = useState(1);
  const [modalStarFilter, setModalStarFilter] = useState('ALL'); // 'ALL' | '1' | '2' | '3' | '4' | '5'
  const [modalSort, setModalSort] = useState('star_asc'); // 'star_asc' (low star first) | 'star_desc' | 'newest' | 'oldest'

  // Mutation Loading States
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setActionFeedback({ type, text });
    setTimeout(() => setActionFeedback(null), 3500);
  };

  // Fetch Products Overview List (silent=true prevents full page skeleton on background updates)
  const fetchProductsOverview = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: '12',
        q: searchQuery,
        filter: filterType,
        sortBy,
      });

      const res = await authorizedFetch(`/api/admin/reviews?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setProducts(data.products || []);
        setStats(data.stats);
        setTotalPages(data.pagination.totalPages || 1);
        setTotalProducts(data.pagination.total || 0);
      } else {
        showFeedback(data.message || 'Failed to load reviews', 'error');
      }
    } catch (err: any) {
      showFeedback('Failed to connect to server', 'error');
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [currentPage, searchQuery, filterType, sortBy]);

  useEffect(() => {
    fetchProductsOverview();
  }, [fetchProductsOverview]);

  // Fetch Modal Reviews for a Specific Product (silent=true prevents modal skeleton flicker)
  const fetchProductReviewsModal = useCallback(async (silent = false) => {
    if (!selectedProduct) return;

    try {
      if (!silent) setModalLoading(true);
      const params = new URLSearchParams({
        page: String(modalPage),
        limit: '10',
        star: modalStarFilter,
        sort: modalSort,
      });

      const res = await authorizedFetch(
        `/api/admin/reviews/product/${selectedProduct.id}?${params.toString()}`
      );
      const data = await res.json();

      if (data.success) {
        setModalReviews(data.reviews || []);
        setModalStats(data.productStats);
        setModalTotalPages(data.pagination.totalPages || 1);
      } else {
        showFeedback(data.message || 'Failed to load product reviews', 'error');
      }
    } catch (err: any) {
      showFeedback('Failed to load review details', 'error');
    } finally {
      if (!silent) setModalLoading(false);
    }
  }, [selectedProduct, modalPage, modalStarFilter, modalSort]);

  useEffect(() => {
    if (isModalOpen && selectedProduct) {
      fetchProductReviewsModal();
    }
  }, [isModalOpen, selectedProduct, fetchProductReviewsModal]);

  // Open Product Reviews Modal
  const handleOpenProductReviews = (product: ProductReviewSummary) => {
    setSelectedProduct(product);
    setModalPage(1);
    setModalStarFilter('ALL');
    setModalSort('star_asc'); // Default to lowest star first as requested
    setIsModalOpen(true);
  };

  // Close Modal
  const handleCloseModal = () => {
    if (isDeleting || updatingStatusId) return;
    setIsModalOpen(false);
    setSelectedProduct(null);
    setModalReviews([]);
    setDeleteConfirmId(null);
  };

  // Delete Review Permanently
  const handleDeleteReview = async (reviewId: string) => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      const res = await authorizedFetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        showFeedback('Review deleted successfully');
        setDeleteConfirmId(null);
        setModalReviews((prev) => prev.filter((r) => r.id !== reviewId));
        await Promise.all([fetchProductReviewsModal(true), fetchProductsOverview(true)]);
      } else {
        showFeedback(data.message || 'Failed to delete review', 'error');
      }
    } catch (err) {
      showFeedback('Failed to connect to server', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle Review Status (KEEP vs REJECT / HIDE)
  const handleUpdateReviewStatus = async (
    reviewId: string,
    newStatus: 'APPROVED' | 'REJECTED'
  ) => {
    if (updatingStatusId || isDeleting) return;
    try {
      setUpdatingStatusId(reviewId);
      const res = await authorizedFetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();

      if (data.success) {
        showFeedback(
          newStatus === 'APPROVED'
            ? 'Review approved and visible on storefront'
            : 'Review hidden from storefront'
        );
        setModalReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, status: newStatus } : r))
        );
        await Promise.all([fetchProductReviewsModal(true), fetchProductsOverview(true)]);
      } else {
        showFeedback(data.message || 'Failed to update review status', 'error');
      }
    } catch (err) {
      showFeedback('Failed to connect to server', 'error');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-500 stroke-amber-600" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Customer Reviews & Ratings Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitor product ratings, inspect star distributions, moderate customer reviews, and identify feedback or spam.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchProductsOverview()}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 disabled:opacity-50 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Floating Action Feedback Toast */}
      {actionFeedback && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs sm:text-sm font-bold transition-all animate-in fade-in slide-in-from-top-3 ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700'
              : 'bg-rose-900 text-white border-rose-700'
          }`}
        >
          {actionFeedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-300" />
          )}
          <span>{actionFeedback.text}</span>
        </div>
      )}

      {/* Overview Metric Cards with Animated Pulse Skeletons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Total Reviews */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Reviews</span>
            <MessageSquare className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            {isLoading ? (
              <div className="h-8 w-20 bg-slate-100 animate-pulse rounded-lg mt-1" />
            ) : (
              <>
                <span className="text-2xl sm:text-3xl font-black text-slate-900">
                  {stats.totalReviews}
                </span>
                <span className="text-xs text-slate-500 font-medium">reviews</span>
              </>
            )}
          </div>
        </div>

        {/* Catalog Average Rating */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Store Avg Rating</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            {isLoading ? (
              <div className="h-8 w-20 bg-slate-100 animate-pulse rounded-lg mt-1" />
            ) : (
              <>
                <span className="text-2xl sm:text-3xl font-black text-amber-600">
                  {stats.overallAvgRating.toFixed(1)}
                </span>
                <span className="text-xs text-slate-500 font-medium">/ 5.0</span>
              </>
            )}
          </div>
        </div>

        {/* Reviewed Products */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Reviewed Products</span>
            <ThumbsUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            {isLoading ? (
              <div className="h-8 w-24 bg-slate-100 animate-pulse rounded-lg mt-1" />
            ) : (
              <>
                <span className="text-2xl sm:text-3xl font-black text-emerald-700">
                  {stats.reviewedProductsCount}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  / {stats.totalCatalogProducts} products
                </span>
              </>
            )}
          </div>
        </div>

        {/* Low Star Reviews Warning (1★ & 2★) */}
        <div
          onClick={() => {
            if (!isLoading) {
              setFilterType('LOW_RATING');
              setCurrentPage(1);
            }
          }}
          className={`bg-white p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer shadow-2xs space-y-1 ${
            stats.totalLowReviews > 0
              ? 'border-amber-300 hover:border-amber-400 hover:bg-amber-50/30'
              : 'border-slate-200/90'
          }`}
          title="Click to view products with low ratings"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
              Low Rating (1★ - 2★)
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            {isLoading ? (
              <div className="h-8 w-20 bg-rose-50 animate-pulse rounded-lg mt-1" />
            ) : (
              <>
                <span className="text-2xl sm:text-3xl font-black text-rose-600">
                  {stats.totalLowReviews}
                </span>
                <span className="text-xs text-rose-700 font-medium">needs attention</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Search, Filter & Sort Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by product name or slug (e.g. Re-Cal, AD-Plus)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdown */}
          <div className="md:col-span-4 flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white cursor-pointer"
            >
              <option value="ALL">All Products</option>
              <option value="WITH_REVIEWS">Products with Reviews</option>
              <option value="LOW_RATING">⚠️ Low Rated Products (Avg ≤ 3.0★)</option>
              <option value="NO_REVIEWS">No Reviews Yet</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-3 flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white cursor-pointer"
            >
              <option value="reviews_desc">Most Reviews First</option>
              <option value="rating_asc">Lowest Avg Rating First (1★ → 5★)</option>
              <option value="rating_desc">Highest Avg Rating First (5★ → 1★)</option>
              <option value="name">Product Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Products Review Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Product</th>
                
                <th className="py-3.5 px-4 text-center">Total Reviews</th>
                <th className="py-3.5 px-4">Avg Rating</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {isLoading ? (
                /* Skeleton rows while loading table */
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100" />
                        <div className="space-y-1.5 flex-1">
                          <div className="h-4 w-36 bg-slate-100 rounded" />
                          <div className="h-3 w-20 bg-slate-50 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-3.5 w-24 bg-slate-100 rounded mb-1" />
                      <div className="h-3 w-16 bg-slate-50 rounded" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-5 w-12 bg-slate-100 rounded-full mx-auto" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-28 bg-slate-100 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-36 bg-slate-100 rounded" />
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="h-8 w-24 bg-slate-100 rounded-xl ml-auto" />
                    </td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center space-y-2">
                    <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-sm font-bold text-slate-700">No products found</p>
                    <p className="text-xs text-slate-400">
                      Try adjusting your search query or filter settings.
                    </p>
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Product Thumbnail & Name */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                          <Image
                            src={p.thumbnail}
                            alt={p.nameEn}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-slate-900 group-hover:text-emerald-800 transition-colors truncate max-w-xs sm:max-w-sm">
                            {p.nameEn}
                          </p>
                          {p.nameBn && (
                            <p className="text-xs text-slate-500 truncate max-w-xs sm:max-w-sm">
                              {p.nameBn}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    

                    {/* Total Reviews Count */}
                    <td className="py-3.5 px-4 text-center">
                      {p.totalReviews > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {p.totalReviews}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">0</span>
                      )}
                    </td>

                    {/* Average Rating with Stars */}
                    <td className="py-3.5 px-4">
                      {p.totalReviews > 0 ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base font-black text-amber-700">
                              {p.avgRating.toFixed(1)}
                            </span>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3.5 h-3.5 ${
                                    star <= Math.round(p.avgRating)
                                      ? 'text-amber-500 fill-amber-500'
                                      : 'text-slate-200 fill-slate-200'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Low Rating Alert Badge if 1★/2★ exist */}
                          {p.lowRatingCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                              <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                              <span>{p.lowRatingCount} low star</span>
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">No ratings</span>
                      )}
                    </td>

                    

                    {/* Action Button: Manage Reviews */}
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenProductReviews(p)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#005d42] hover:bg-emerald-800 text-white transition-all shadow-xs active:scale-95 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Reviews</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Products List Pagination */}
        {products.length > 0 && totalPages > 1 && (
          <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <span>
              Showing <strong>{(currentPage - 1) * 12 + 1}</strong> to{' '}
              <strong>{Math.min(currentPage * 12, totalProducts)}</strong> of{' '}
              <strong>{totalProducts}</strong> products
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1 || isLoading}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-2 font-bold text-slate-800">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage >= totalPages || isLoading}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* INDIVIDUAL PRODUCT REVIEWS DETAILS MODAL */}
      {/* ========================================================================= */}
      {isModalOpen && selectedProduct && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150"
          onClick={() => !isDeleting && !updatingStatusId && handleCloseModal()}
        >
          <div
            className="bg-white w-full max-w-4xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative w-14 h-14 rounded-2xl bg-white border border-slate-200 overflow-hidden shrink-0 shadow-2xs">
                  <Image
                    src={selectedProduct.thumbnail}
                    alt={selectedProduct.nameEn}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                      {selectedProduct.category?.nameEn || 'General'}
                    </span>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      {selectedProduct.formFactor}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-xl font-black text-slate-900 tracking-tight truncate pt-0.5">
                    {selectedProduct.nameEn}
                  </h3>
                  {selectedProduct.nameBn && (
                    <p className="text-xs text-slate-500 truncate">{selectedProduct.nameBn}</p>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                disabled={isDeleting || updatingStatusId !== null}
                onClick={handleCloseModal}
                className="w-9 h-9 rounded-full bg-white hover:bg-slate-200 disabled:opacity-40 text-slate-500 hover:text-slate-800 flex items-center justify-center border border-slate-200 transition-colors shrink-0 cursor-pointer"
                title="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Subheader: Aggregate Metrics & Filtering / Sorting Toolbar */}
            <div className="p-4 sm:p-5 bg-white border-b border-slate-100 shrink-0 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Average Star Metric */}
                <div className="flex items-center gap-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-amber-600">
                      {(modalStats?.avgRating || selectedProduct.avgRating).toFixed(1)}
                    </span>
                    <span className="text-xs text-slate-400">/ 5.0</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= Math.round(modalStats?.avgRating || selectedProduct.avgRating)
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-slate-200 fill-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500 font-semibold border-l border-slate-200 pl-3">
                    {modalStats?.totalReviews || selectedProduct.totalReviews} total reviews
                  </span>
                </div>

                {/* Star Sorting Control */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 shrink-0">Sort By:</span>
                  <select
                    value={modalSort}
                    disabled={modalLoading || isDeleting || updatingStatusId !== null}
                    onChange={(e) => {
                      setModalSort(e.target.value);
                      setModalPage(1);
                    }}
                    className="py-1.5 px-3 bg-amber-50 border border-amber-200 disabled:opacity-50 rounded-xl text-xs font-bold text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
                  >
                    <option value="star_asc">⚠️ Lowest Star First (1★ → 5★)</option>
                    <option value="star_desc">⭐ Highest Star First (5★ → 1★)</option>
                    <option value="newest">Newest Reviews First</option>
                    <option value="oldest">Oldest Reviews First</option>
                  </select>
                </div>
              </div>

              {/* Star Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Filter Stars:
                </span>
                <button
                  type="button"
                  disabled={modalLoading || isDeleting || updatingStatusId !== null}
                  onClick={() => {
                    setModalStarFilter('ALL');
                    setModalPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50 ${
                    modalStarFilter === 'ALL'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All ({modalStats?.totalReviews || selectedProduct.totalReviews})
                </button>

                {[1, 2, 3, 4, 5].map((star) => {
                  const count = modalStats?.starCounts[star] || selectedProduct.starCounts[star] || 0;
                  const isActive = modalStarFilter === String(star);
                  const isLowStar = star <= 2;

                  return (
                    <button
                      key={star}
                      type="button"
                      disabled={modalLoading || isDeleting || updatingStatusId !== null}
                      onClick={() => {
                        setModalStarFilter(String(star));
                        setModalPage(1);
                      }}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50 ${
                        isActive
                          ? isLowStar
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-amber-500 text-white shadow-xs'
                          : isLowStar && count > 0
                          ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>{star}★</span>
                      <span className="opacity-80">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Body: Reviews List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-slate-50/50">
              {modalLoading ? (
                <div className="py-20 text-center space-y-2">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-700 mx-auto" />
                  <p className="text-xs font-semibold text-slate-500">Loading reviews...</p>
                </div>
              ) : modalReviews.length === 0 ? (
                <div className="py-16 text-center space-y-2 bg-white rounded-2xl border border-slate-200/80 p-8">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">No reviews found</p>
                  <p className="text-xs text-slate-400">
                    No customer reviews match the selected filter criteria for this product.
                  </p>
                </div>
              ) : (
                modalReviews.map((rev) => {
                  const isLowStar = rev.rating <= 2;
                  const isApproved = rev.status === 'APPROVED';
                  const isThisUpdatingStatus = updatingStatusId === rev.id;

                  return (
                    <div
                      key={rev.id}
                      className={`p-4 sm:p-5 rounded-2xl border bg-white transition-all shadow-2xs space-y-3 ${
                        isLowStar ? 'border-rose-200 ring-1 ring-rose-200/60' : 'border-slate-200/90'
                      }`}
                    >
                      {/* Review Item Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2.5">
                          {/* Rating Badge */}
                          <div
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black ${
                              isLowStar
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            <span>{rev.rating}</span>
                            <Star
                              className={`w-3.5 h-3.5 ${
                                isLowStar
                                  ? 'text-rose-500 fill-rose-500'
                                  : 'text-amber-500 fill-amber-500'
                              }`}
                            />
                          </div>

                          {/* Low star warning tag */}
                          {isLowStar && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              <span>Low Rating (Check Feedback)</span>
                            </span>
                          )}

                          {/* User Name & Farmer Type */}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                                {rev.userName}
                              </span>
                             
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400">
                              <span>{rev.farmerType || 'Customer'}</span>
                              {rev.userPhone && <span>• 📞 {rev.userPhone}</span>}
                            </div>
                          </div>
                        </div>

                        {/* Date & Status */}
                        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
                          <span className="text-slate-400 text-[11px]">
                            {new Date(rev.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              isApproved
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {isApproved ? 'Approved' : 'Hidden'}
                          </span>
                        </div>
                      </div>

                      {/* Review Comment Body */}
                      <div className="space-y-1">
                        {rev.title && (
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                            {rev.title}
                          </h4>
                        )}
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                          {rev.comment}
                        </p>
                      </div>

                      {/* Review Actions: KEEP or DELETE (NO EDIT as strictly instructed) */}
                      <div className="flex items-center justify-end pt-1">
                        <div className="flex items-center gap-2">
                          {/* Keep / Toggle Status button */}
                          {isApproved ? (
                            <button
                              type="button"
                              disabled={isThisUpdatingStatus || isDeleting}
                              onClick={() => handleUpdateReviewStatus(rev.id, 'REJECTED')}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 transition-colors cursor-pointer"
                              title="Hide this review from storefront"
                            >
                              {isThisUpdatingStatus ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Hiding...</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Hide Review</span>
                                </>
                              )}
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={isThisUpdatingStatus || isDeleting}
                              onClick={() => handleUpdateReviewStatus(rev.id, 'APPROVED')}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 disabled:opacity-50 transition-colors cursor-pointer"
                              title="Approve and show on storefront"
                            >
                              {isThisUpdatingStatus ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Approving...</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>Keep & Approve</span>
                                </>
                              )}
                            </button>
                          )}

                          {/* Delete Review Button */}
                          {deleteConfirmId === rev.id ? (
                            <div className="flex items-center gap-1.5 animate-in fade-in">
                              <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => handleDeleteReview(rev.id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white transition-all shadow-xs cursor-pointer"
                              >
                                {isDeleting ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Deleting...</span>
                                  </>
                                ) : (
                                  <span>Yes, Delete</span>
                                )}
                              </button>
                              <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              disabled={isDeleting || isThisUpdatingStatus}
                              onClick={() => setDeleteConfirmId(rev.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 disabled:opacity-40 transition-colors cursor-pointer"
                              title="Permanently delete review"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Pagination Footer */}
            {modalTotalPages > 1 && (
              <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600 shrink-0">
                <span>
                  Page <strong>{modalPage}</strong> of <strong>{modalTotalPages}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={modalPage <= 1 || modalLoading || isDeleting || updatingStatusId !== null}
                    onClick={() => setModalPage((prev) => Math.max(1, prev - 1))}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer text-xs font-semibold"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>

                  <button
                    type="button"
                    disabled={modalPage >= modalTotalPages || modalLoading || isDeleting || updatingStatusId !== null}
                    onClick={() => setModalPage((prev) => Math.min(modalTotalPages, prev + 1))}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer text-xs font-semibold"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
