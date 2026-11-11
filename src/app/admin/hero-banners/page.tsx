'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { authorizedFetch } from '@/lib/api-client';
import {
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Loader2,
  ExternalLink,
  Eye,
  X,
  AlertCircle,
  RefreshCw,
  Sliders,
  Check,
} from 'lucide-react';

interface HeroBannerItem {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  mobileUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

interface CloudinaryAsset {
  publicId: string;
  url: string;
  format: string;
  bytes: number;
  width: number;
  height: number;
  createdAt: string;
}

export default function AdminHeroBannersPage() {
  const [banners, setBanners] = useState<HeroBannerItem[]>([]);
  const [cloudinaryImages, setCloudinaryImages] = useState<CloudinaryAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [isAddingAssetId, setIsAddingAssetId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch banners from API (silent=true prevents whole-screen loader on button events)
  const fetchBanners = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const res = await authorizedFetch('/api/admin/hero-banners');
      const data = await res.json();
      if (data.success) {
        setBanners(data.banners || []);
        setCloudinaryImages(data.cloudinaryImages || []);
      } else {
        setFeedbackMsg({ type: 'error', text: data.message || 'Failed to load banners' });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to connect to server' });
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ type, text });
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 4000);
  };

  // Handle uploading image to Cloudinary and creating banner
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setIsUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // 1. Upload to Cloudinary under 'research-agro-vet/hero-banners'
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'research-agro-vet/hero-banners');

        const uploadRes = await authorizedFetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadData.success || !uploadData.url) {
          throw new Error(uploadData.message || 'Failed to upload image to Cloudinary');
        }

        // 2. Register banner in database
        const bannerRes = await authorizedFetch('/api/admin/hero-banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrl: uploadData.url,
            title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
            isActive: true,
            sortOrder: banners.length + i,
          }),
        });

        const bannerData = await bannerRes.json();
        if (!bannerData.success) {
          throw new Error(bannerData.message || 'Failed to save banner in database');
        }
      }

      showFeedback('Banner uploaded and added to carousel successfully!');
      if (fileInputRef.current) fileInputRef.current.value = '';
      await fetchBanners(true);
    } catch (err: any) {
      setUploadError(err.message || 'Upload error');
      showFeedback(err.message || 'Upload failed', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Toggle active status in slider
  const handleToggleActive = async (banner: HeroBannerItem) => {
    if (isUpdatingId) return;
    setIsUpdatingId(banner.id);
    const newStatus = !banner.isActive;

    // Optimistic UI update
    setBanners((prev) =>
      prev.map((b) => (b.id === banner.id ? { ...b, isActive: newStatus } : b))
    );

    try {
      const res = await authorizedFetch(`/api/admin/hero-banners/${banner.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });
      const data = await res.json();
      if (!data.success) {
        // Rollback on failure
        setBanners((prev) =>
          prev.map((b) => (b.id === banner.id ? { ...b, isActive: !newStatus } : b))
        );
        showFeedback(data.message || 'Status update failed', 'error');
      } else {
        showFeedback(
          newStatus
            ? 'Banner activated in hero carousel'
            : 'Banner hidden from hero carousel'
        );
      }
    } catch (err: any) {
      // Rollback
      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, isActive: !newStatus } : b))
      );
      showFeedback('Failed to connect to server', 'error');
    } finally {
      setIsUpdatingId(null);
    }
  };

  // Reorder banner
  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    if (isReordering) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    setIsReordering(true);
    const currentBanner = banners[index];
    const targetBanner = banners[targetIndex];

    const currentOrder = currentBanner.sortOrder;
    const targetOrder = targetBanner.sortOrder;

    // Optimistic swap
    const reordered = [...banners];
    reordered[index] = { ...targetBanner, sortOrder: currentOrder };
    reordered[targetIndex] = { ...currentBanner, sortOrder: targetOrder };
    setBanners(reordered);

    try {
      await Promise.all([
        authorizedFetch(`/api/admin/hero-banners/${currentBanner.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sortOrder: targetOrder }),
        }),
        authorizedFetch(`/api/admin/hero-banners/${targetBanner.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sortOrder: currentOrder }),
        }),
      ]);
      showFeedback('Slide order updated successfully');
    } catch (err) {
      showFeedback('Failed to update slide order', 'error');
      await fetchBanners(true);
    } finally {
      setIsReordering(false);
    }
  };

  // Delete banner
  const handleDeleteBanner = async (id: string) => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      setIsUpdatingId(id);
      const res = await authorizedFetch(`/api/admin/hero-banners/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setBanners((prev) => prev.filter((b) => b.id !== id));
        showFeedback('Banner deleted successfully');
      } else {
        showFeedback(data.message || 'Failed to delete banner', 'error');
      }
    } catch (err: any) {
      showFeedback('Failed to connect to server', 'error');
    } finally {
      setIsDeleting(false);
      setIsUpdatingId(null);
      setDeleteConfirmId(null);
    }
  };

  // Add existing Cloudinary image directly into banner list
  const handleAddCloudinaryAsset = async (asset: CloudinaryAsset) => {
    if (isAddingAssetId) return;
    try {
      setIsAddingAssetId(asset.publicId);
      const res = await authorizedFetch('/api/admin/hero-banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: asset.url,
          title: asset.publicId.split('/').pop() || 'Hero Banner',
          isActive: true,
          sortOrder: banners.length,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showFeedback('Image added to carousel successfully');
        await fetchBanners(true);
      } else {
        showFeedback(data.message || 'Failed to add image', 'error');
      }
    } catch (err: any) {
      showFeedback('Failed to connect to server', 'error');
    } finally {
      setIsAddingAssetId(null);
    }
  };

  const activeBanners = banners.filter((b) => b.isActive);
  const inactiveBanners = banners.filter((b) => !b.isActive);

  // Cloudinary assets that aren't yet in database
  const existingUrls = new Set(banners.map((b) => b.imageUrl));
  const unsyncedCloudinaryAssets = cloudinaryImages.filter(
    (c) => !existingUrls.has(c.url)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-2">
            <Sliders className="w-3.5 h-3.5 text-emerald-700" />
            <span>Storefront Visual CMS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Hero Banner & Carousel Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Upload banner graphics to Cloudinary and control which slides appear in the storefront hero slider.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchBanners()}
            disabled={isLoading || isUploading || isDeleting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isLoading || isDeleting}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload New Banner</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between gap-2 text-xs font-bold animate-in fade-in duration-150 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMsg(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 block">Total Uploaded Banners</span>
          {isLoading ? (
            <div className="h-8 w-16 bg-slate-100 animate-pulse rounded-lg mt-2" />
          ) : (
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {banners.length}
            </span>
          )}
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-200/90 shadow-2xs bg-gradient-to-br from-white to-emerald-50/30">
          <span className="text-xs font-bold text-emerald-800 block">Active in Carousel</span>
          {isLoading ? (
            <div className="h-8 w-16 bg-emerald-100/60 animate-pulse rounded-lg mt-2" />
          ) : (
            <span className="text-2xl font-black text-emerald-700 mt-1 block">
              {activeBanners.length}
            </span>
          )}
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 block">Hidden / Inactive</span>
          {isLoading ? (
            <div className="h-8 w-16 bg-slate-100 animate-pulse rounded-lg mt-2" />
          ) : (
            <span className="text-2xl font-black text-slate-600 mt-1 block">
              {inactiveBanners.length}
            </span>
          )}
        </div>
      </div>

      {/* Upload Dropzone */}
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`bg-white rounded-3xl border-2 border-dashed p-8 text-center transition-all ${
          isUploading
            ? 'border-emerald-500 bg-emerald-50/30 cursor-not-allowed pointer-events-none'
            : 'border-slate-300 hover:border-emerald-600 hover:bg-slate-50/50 cursor-pointer'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={isUploading}
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />

        <div className="max-w-md mx-auto flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-3 shadow-inner">
            {isUploading ? (
              <Loader2 className="w-7 h-7 animate-spin text-emerald-700" />
            ) : (
              <Upload className="w-7 h-7" />
            )}
          </div>

          <h3 className="text-base font-extrabold text-slate-900">
            {isUploading ? 'Uploading to Cloudinary...' : 'Click or drop images to upload hero banner'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Supports JPEG, PNG, or WEBP formats. High resolution recommended.
          </p>
          <span className="inline-block mt-3 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[11px] font-bold">
            Cloudinary folder: research-agro-vet/hero-banners
          </span>
        </div>
      </div>

      {/* MAIN CONTENT AREA: Handled with full Loading Skeleton / Spinner */}
      {isLoading ? (
        <div className="py-20 bg-white rounded-3xl border border-slate-200/90 shadow-2xs text-center space-y-3">
          <Loader2 className="w-9 h-9 animate-spin text-emerald-700 mx-auto" />
          <h3 className="text-base font-extrabold text-slate-900">Loading Carousel Banners...</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Fetching active slides and inspecting Cloudinary hero image repository
          </p>
        </div>
      ) : (
        <>
          {/* ACTIVE BANNERS SECTION */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-lg font-black text-slate-900">
                  Active Carousel Slides ({activeBanners.length})
                </h2>
              </div>
              <span className="text-xs text-slate-500">
                Use arrows to reorder slide display priority
              </span>
            </div>

            {activeBanners.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
                <ImageIcon className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-700">No active banners in carousel</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Activate an existing banner below or upload a new image above to populate the carousel.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {activeBanners.map((banner, idx) => {
                  const isThisUpdating = isUpdatingId === banner.id;

                  return (
                    <div
                      key={banner.id}
                      className="bg-white rounded-2xl border border-emerald-300/80 p-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group relative"
                    >
                      <div>
                        {/* Order & Status Badges */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-black border border-emerald-200">
                            Slide #{idx + 1}
                          </span>

                          {/* Toggle Slider Switch */}
                          <button
                            type="button"
                            disabled={isThisUpdating || isDeleting}
                            onClick={() => handleToggleActive(banner)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white cursor-pointer shadow-2xs"
                            title="Click to hide from carousel"
                          >
                            {isThisUpdating ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Updating...</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Active</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Image Preview Box */}
                        <div
                          onClick={() => setPreviewModalUrl(banner.imageUrl)}
                          className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 cursor-pointer shadow-inner group/img"
                        >
                          <Image
                            src={banner.imageUrl}
                            alt={banner.title}
                            fill
                            unoptimized
                            className="object-cover group-hover/img:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-slate-950/0 group-hover/img:bg-slate-950/30 transition-colors flex items-center justify-center">
                            <span className="opacity-0 group-hover/img:opacity-100 bg-white/95 text-slate-800 text-xs font-bold px-3 py-1 rounded-lg shadow flex items-center gap-1 transition-opacity">
                              <Eye className="w-3.5 h-3.5" />
                              Preview
                            </span>
                          </div>
                        </div>

                        {/* Title / Info */}
                        <div className="mt-3">
                          <h4 className="text-sm font-bold text-slate-900 truncate">
                            {banner.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5 truncate font-mono">
                            {banner.imageUrl}
                          </p>
                        </div>
                      </div>

                      {/* Bottom Controls */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        {/* Reorder Buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveOrder(idx, 'up')}
                            disabled={idx === 0 || isReordering || isThisUpdating}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveOrder(idx, 'down')}
                            disabled={idx === activeBanners.length - 1 || isReordering || isThisUpdating}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* External link & Delete */}
                        <div className="flex items-center gap-1">
                          <a
                            href={banner.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                            title="Open full image in new tab"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          <button
                            type="button"
                            disabled={isDeleting || isThisUpdating}
                            onClick={() => setDeleteConfirmId(banner.id)}
                            className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 disabled:opacity-40 text-rose-700 flex items-center justify-center transition-colors cursor-pointer"
                            title="Delete banner"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* INACTIVE / HIDDEN BANNERS SECTION */}
          {inactiveBanners.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-700">
                  Hidden / Inactive Banners ({inactiveBanners.length})
                </h2>
                <span className="text-xs text-slate-400">
                  Click &quot;Activate&quot; to show in hero carousel
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {inactiveBanners.map((banner) => {
                  const isThisUpdating = isUpdatingId === banner.id;

                  return (
                    <div
                      key={banner.id}
                      className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between opacity-80 hover:opacity-100"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-bold">
                            Hidden
                          </span>

                          {/* Toggle Slider Switch */}
                          <button
                            type="button"
                            disabled={isThisUpdating || isDeleting}
                            onClick={() => handleToggleActive(banner)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all bg-slate-200 hover:bg-emerald-600 hover:text-white disabled:opacity-60 text-slate-700 cursor-pointer"
                            title="Click to activate in carousel"
                          >
                            {isThisUpdating ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Activating...</span>
                              </>
                            ) : (
                              <span>Activate</span>
                            )}
                          </button>
                        </div>

                        {/* Thumbnail */}
                        <div
                          onClick={() => setPreviewModalUrl(banner.imageUrl)}
                          className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer"
                        >
                          <Image
                            src={banner.imageUrl}
                            alt={banner.title}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>

                        <div className="mt-3">
                          <h4 className="text-sm font-bold text-slate-800 truncate">
                            {banner.title}
                          </h4>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-1">
                        <a
                          href={banner.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                          title="Open full image in new tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        <button
                          type="button"
                          disabled={isDeleting || isThisUpdating}
                          onClick={() => setDeleteConfirmId(banner.id)}
                          className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 disabled:opacity-40 text-rose-700 flex items-center justify-center transition-colors cursor-pointer"
                          title="Delete banner"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CLOUDINARY FOLDER DISCOVERY (Unsynced Images) */}
          {unsyncedCloudinaryAssets.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-slate-800">
                    Unlinked Cloudinary Images ({unsyncedCloudinaryAssets.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    These files exist in Cloudinary hero-banners folder but have not yet been linked to the database slider.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {unsyncedCloudinaryAssets.map((asset) => {
                  const isThisAdding = isAddingAssetId === asset.publicId;

                  return (
                    <div
                      key={asset.publicId}
                      className="bg-white rounded-xl border border-slate-200 p-2.5 flex flex-col justify-between shadow-2xs hover:shadow-md transition-shadow"
                    >
                      <div
                        onClick={() => setPreviewModalUrl(asset.url)}
                        className="relative aspect-video w-full rounded-lg overflow-hidden bg-slate-100 mb-2 cursor-pointer"
                      >
                        <Image
                          src={asset.url}
                          alt={asset.publicId}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>

                      <button
                        type="button"
                        disabled={isThisAdding || isDeleting || isUploading}
                        onClick={() => handleAddCloudinaryAsset(asset)}
                        className="w-full py-1.5 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-60 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                      >
                        {isThisAdding ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Adding...</span>
                          </>
                        ) : (
                          <span>+ Add to Carousel</span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal (Full blocker with loading spinner and disabled state) */}
      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100"
          onClick={() => !isDeleting && setDeleteConfirmId(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              {isDeleting ? (
                <Loader2 className="w-6 h-6 animate-spin text-rose-600" />
              ) : (
                <Trash2 className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {isDeleting ? 'Deleting banner...' : 'Delete this banner?'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {isDeleting
                  ? 'Please wait while the banner is removed from database.'
                  : 'This will permanently remove the banner from the database and homepage carousel.'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteConfirmId(null)}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-800 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => handleDeleteBanner(deleteConfirmId)}
                className="py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-75 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs inline-flex items-center justify-center gap-1.5"
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
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Image Preview Modal */}
      {previewModalUrl && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setPreviewModalUrl(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewModalUrl(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center cursor-pointer shadow"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="relative aspect-video w-full rounded-xl overflow-hidden">
              <img
                src={previewModalUrl}
                alt="Banner Preview"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
