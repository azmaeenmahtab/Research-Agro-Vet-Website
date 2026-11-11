'use client';

import React, { useState } from 'react';
import {
  Star,
  CheckCircle2,
  MessageSquare,
  ShieldCheck,
  PenLine,
  Sparkles,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toBengaliNumber } from '@/lib/formatters';
import { getApiUrl } from '@/lib/api-client';

export interface ProductReviewItem {
  id: string;
  userName: string;
  userPhone?: string | null;
  farmerType?: string | null;
  rating: number;
  title?: string | null;
  comment: string;
  isVerified: boolean;
  createdAt: string | Date;
}

interface ProductReviewsSectionProps {
  productId: string;
  productName: string;
  initialReviews?: ProductReviewItem[];
}

const FARMER_TYPES = [
  'ডেইরি খামারি (গাভী পালন)',
  'পোল্ট্রি ও লেয়ার/ব্রয়লার খামারি',
  'মৎস্য ও চিংড়ি চাষী',
  'ছাগল ও ভেড়া পালনকারী',
  'ভেটেরিনারি ফার্মাসিস্ট / ডিলার',
  'ভেটেরিনারি সার্জন / ডাক্তার',
  'সাধারণ খামারি / ক্রেতা',
];

const RATING_LABELS: Record<number, string> = {
  1: '১ - কার্যকর নয়',
  2: '২ - মোটামুটি',
  3: '৩ - ভালো',
  4: '৪ - অনেক ভালো',
  5: '৫ - অসাধারণ ও শতভাগ কার্যকর!',
};

function formatRelativeBengaliDate(dateInput: string | Date): string {
  const d = new Date(dateInput);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'আজকে';
  if (diffDays === 1) return 'গতকাল';
  if (diffDays < 7) return `${toBengaliNumber(diffDays)} দিন আগে`;
  if (diffDays < 30) return `${toBengaliNumber(Math.floor(diffDays / 7))} সপ্তাহ আগে`;
  if (diffDays < 365) return `${toBengaliNumber(Math.floor(diffDays / 30))} মাস আগে`;
  return `${toBengaliNumber(Math.floor(diffDays / 365))} বছর আগে`;
}

export default function ProductReviewsSection({
  productId,
  productName,
  initialReviews = [],
}: ProductReviewsSectionProps) {
  const [reviews, setReviews] = useState<ProductReviewItem[]>(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // Pagination states
  const PAGE_SIZE = 4;
  const [currentPage, setCurrentPage] = useState(1);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [farmerType, setFarmerType] = useState(FARMER_TYPES[0]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Calculate statistics
  const total = reviews.length;
  const avgRating =
    total > 0
      ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1))
      : 0;

  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
    ratingCounts[star] = (ratingCounts[star] || 0) + 1;
  });

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(reviews.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, reviews.length);
  const paginatedReviews = reviews.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
    const el = document.getElementById('reviews-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setErrorMsg('দয়া করে আপনার নাম লিখুন।');
      return;
    }

    if (!comment.trim() || comment.trim().length < 5) {
      setErrorMsg('দয়া করে পণ্যের কার্যকারিতা নিয়ে অন্তত ৫ অক্ষরের রিভিউ লিখুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(getApiUrl(`/api/products/${productId}/reviews`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: name.trim(),
          userPhone: phone.trim() || undefined,
          farmerType,
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'রিভিউ জমা দেওয়া সম্ভব হয়নি।');
      }

      // Prepend newly created review
      if (data.review) {
        setReviews([data.review, ...reviews]);
        setCurrentPage(1);
      }

      setSuccessMsg('আপনার মূল্যবান রিভিউ সফলভাবে প্রকাশিত হয়েছে! ধন্যবাদ।');
      setName('');
      setPhone('');
      setComment('');
      setRating(5);
      setTimeout(() => {
        setShowForm(false);
        setSuccessMsg(null);
      }, 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="reviews-section" className="scroll-mt-24 space-y-4">
      {/* 2-Column One-Row Grid Layout on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 sm:gap-6 gap-4 items-start">
        {/* Left Column: Summary & Rating Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white sm:p-6 p-4  rounded-2xl border border-slate-200 shadow-2xs space-y-5 lg:sticky lg:top-24">
          {/* Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                <MessageSquare className="w-4 h-4 text-emerald-700" />
              </div>
              <h3 className="sm:text-lg font-black text-slate-900 tracking-tight">
                খামারিদের মতামত ও রিভিউ
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                {toBengaliNumber(total)} টি
              </span>
            </div>
            
          </div>

          {/* Big Score Box */}
          <div className="flex flex-col items-center justify-center sm:p-6 p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 text-center space-y-1.5">
            <div className="sm:text-4xl text-2xl font-black text-slate-900 tracking-tight">
              {total > 0 ? toBengaliNumber(avgRating) : '০.০'}
            </div>
            <div className="flex items-center gap-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(avgRating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
            
          </div>

          {/* Progress Bars */}
          <div className="space-y-2 pt-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingCounts[star as 1 | 2 | 3 | 4 | 5];
              const percent = total > 0 ? Math.round((count / total) * 100) : 0;

              return (
                <div key={star} className="flex items-center gap-2.5 text-xs">
                  <div className="flex items-center gap-1 w-12 font-bold text-slate-700 shrink-0">
                    <span>{toBengaliNumber(star)} স্টার</span>
                  </div>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        star >= 4
                          ? 'bg-emerald-600'
                          : star === 3
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="w-8 text-right font-medium text-slate-500 shrink-0">
                    <span>{toBengaliNumber(count)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Write a Review Button */}
          <button
            type="button"
            onClick={() => {
              setShowForm(!showForm);
              setErrorMsg(null);
            }}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-all duration-200 cursor-pointer"
          >
            <PenLine className="w-4 h-4" />
            <span>{showForm ? 'ফর্ম বন্ধ করুন' : 'রিভিউ লিখুন'}</span>
          </button>
        </div>

        {/* Right Column: Review Form (when open) + Reviews List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Submit Review Form Box */}
          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="bg-white p-4 sm:p-6 rounded-2xl border border-emerald-300 shadow-xs space-y-4 animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                <div className="flex items-center gap-2 text-emerald-900 font-black text-sm">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>আপনার অভিজ্ঞতা ও মতামত লিখুন</span>
                </div>
                <span className="text-[11px] text-slate-500">* চিহ্নিত ঘরগুলো আবশ্যক</span>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Star Rating Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  পণ্যের কার্যকারিতা রেটিং দিন *
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const activeStar = (hoverRating !== null ? hoverRating : rating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          className="p-1 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                          title={`${star} Star`}
                        >
                          <Star
                            className={`w-6 h-6 ${
                              activeStar
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300 hover:text-amber-300'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-xs font-bold text-slate-700 ml-2">
                    {RATING_LABELS[hoverRating !== null ? hoverRating : rating]}
                  </span>
                </div>
              </div>

              {/* Name & Farmer Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    আপনার নাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="যেমন: মোঃ রফিকুল ইসলাম"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    খামারের ধরন / পেশা
                  </label>
                  <select
                    value={farmerType}
                    onChange={(e) => setFarmerType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {FARMER_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mobile / Phone (optional for verification) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  মোবাইল নম্বর <span className="font-normal text-slate-500">(ঐচ্ছিক - গোপন থাকবে)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="০১৭১১-XXXXXX"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Review Comment */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  আপনার বিস্তারিত রিভিউ বা ফলাফল *
                </label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="পণ্যটি খাইয়ে কী পরিবর্তন বা উপকার পেলেন? দুধের পরিমাণ, খাবারের রুচি বা পশুর স্বাস্থ্য সম্পর্কে বিস্তারিত লিখুন..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>জমা হচ্ছে...</span>
                    </>
                  ) : (
                    <span>রিভিউ পোস্ট করুন</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Reviews List */}
          {reviews.length > 0 ? (
            <>
              {paginatedReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3 transition-all hover:border-slate-300"
                >
                  {/* Reviewer Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-sm shadow-2xs border border-emerald-200 shrink-0">
                        {rev.userName.charAt(0) || 'খ'}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-sm sm:text-base">
                            {rev.userName}
                          </span>
                          {/* {rev.isVerified && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>যাচাইকৃত ক্রেতা</span>
                            </span>
                          )} */}
                        </div>
                        {rev.farmerType && (
                          <p className="text-[11px] text-slate-500 font-medium">
                            {rev.farmerType}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Rating & Relative Time */}
                    <div className="flex items-center gap-2.5 sm:text-right">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-slate-600 font-semibold whitespace-nowrap">
                        {formatRelativeBengaliDate(rev.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-1">
                    {rev.comment}
                  </p>
                </div>
              ))}

              {/* Pagination Bar */}
              {totalPages > 1 && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <span className="text-slate-500 font-medium text-center sm:text-left">
                    সর্বমোট {toBengaliNumber(reviews.length)} টির মধ্যে {toBengaliNumber(startIndex + 1)}–{toBengaliNumber(endIndex)} টি প্রদর্শিত
                  </span>

                  <div className="flex items-center justify-center gap-1.5 self-center sm:self-auto">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      title="পূর্ববর্তী পৃষ্ঠা"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handlePageChange(p)}
                        className={`w-8 h-8 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                          p === currentPage
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {toBengaliNumber(p)}
                      </button>
                    ))}

                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      title="পরবর্তী পৃষ্ঠা"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Empty state */
            <div className="bg-white sm:p-6 md:p-8 p-4 rounded-2xl border border-slate-200 text-center shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto font-bold">
                <Star className="w-6 h-6 fill-emerald-100" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                এখনো কোনো রিভিউ দেওয়া হয়নি
              </h4>
              
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                প্রথম রিভিউ লিখুন
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
