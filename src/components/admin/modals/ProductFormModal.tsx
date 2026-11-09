'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { toast } from '@heroui/react';
import { authorizedFetch } from '@/lib/api-client';
import {
  X,
  Plus,
  Trash2,
  Save,
  Package,
  Layers,
  FileText,
  AlertCircle,
  HelpCircle,
  Check,
  ChevronRight,
  ChevronLeft,
  Stethoscope,
  ShieldCheck,
  Tag,
  Tags,
  ExternalLink,
  ImageIcon,
  Sparkles,
  Info,
  DollarSign,
  Boxes,
  UploadCloud,
  Loader2,
  Lock,
  RefreshCw,
} from 'lucide-react';
import {
  AdminProduct,
  AdminVariant,
  ProductFormFactor,
  ProductStatus,
} from '@/types/admin-product';
import { cleanProductSlug, generateStandardSku, getFormFactorCode } from '@/lib/sku-generator';

interface GalleryItem {
  id: string;
  previewUrl: string;
  file?: File;
  existingUrl?: string;
}

interface CategoryOption {
  id: string;
  nameEn: string;
  nameBn?: string | null;
  slug: string;
}

interface ProductFormModalProps {
  product: AdminProduct | null; // null if adding new product
  categories: CategoryOption[];
  isOpen: boolean;
  onClose: () => void;
  onSaved: (product: AdminProduct) => void;
}

const FORM_FACTORS: ProductFormFactor[] = [
  'POWDER',
  'LIQUID',
  'SACHET',
  'BOLUS',
  'SOLUTION',
  'OINTMENT',
  'INJECTION',
  'OTHER',
];

const FORM_FACTOR_LABELS: Record<ProductFormFactor, string> = {
  POWDER: 'Powder (পাউডার)',
  LIQUID: 'Liquid / Syrup (লিকুইড / সিরাপ)',
  BOLUS: 'Bolus / Tablet (বোলাস / ট্যাবলেট)',
  SACHET: 'Sachet (স্যাচেট)',
  SOLUTION: 'Solution (সল্যুশন)',
  OINTMENT: 'Ointment / Cream (মলম)',
  INJECTION: 'Injection / Vial (ইনজেকশন)',
  OTHER: 'Other (অন্যান্য)',
};

const SPECIES_OPTIONS = [
  { id: 'CATTLE_BUFFALO', label: 'Cattle & Buffalo', image: '/images/cattle.png' },
  { id: 'GOAT_SHEEP', label: 'Goat & Sheep', image: '/images/goat.png' },
  { id: 'POULTRY', label: 'Poultry & Ducks', image: '/images/chicken.png' },
  { id: 'AQUA', label: 'Fisheries & Aqua', image: '/images/salmon.png' },
  { id: 'PET', label: 'Pets & Companion', image: '/images/petsandcompanion.png' },
];

export default function ProductFormModal({
  product,
  categories,
  isOpen,
  onClose,
  onSaved,
}: ProductFormModalProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'variants' | 'clinical'>('basic');
  const isEditing = Boolean(product?.id);

  // Form State
  const [nameEn, setNameEn] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [slug, setSlug] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [formFactor, setFormFactor] = useState<ProductFormFactor>('POWDER');
  const [speciesTags, setSpeciesTags] = useState<string[]>(['CATTLE_BUFFALO']);
  const [status, setStatus] = useState<ProductStatus>('ACTIVE');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);

  // Regulatory & Branding
  const [dlsLicenseNo, setDlsLicenseNo] = useState('');
  const [bangladeshPatentNo, setBangladeshPatentNo] = useState('');
  const [manufacturer, setManufacturer] = useState('Research Agro Vet Ltd.');
  const [thumbnailPreview, setThumbnailPreview] = useState('/images/placeholder-medicine.webp');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [shortDescription, setShortDescription] = useState('');

  // Variants list
  const [variants, setVariants] = useState<AdminVariant[]>([]);

  // Clinical & Disease Reference
  const [composition, setComposition] = useState('');
  const [indication, setIndication] = useState('');
  const [dosageAndAdministration, setDosageAndAdministration] = useState('');
  const [withdrawalPeriod, setWithdrawalPeriod] = useState('');
  const [contraindications, setContraindications] = useState('');
  const [storageInstructions, setStorageInstructions] = useState(
    'Store below 30°C in a dry place protected from light and moisture.'
  );
  const [searchKeywordsInput, setSearchKeywordsInput] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setNameEn(product.nameEn || '');
      setNameBn(product.nameBn || '');
      setSlug(product.slug || '');
      const initialCatIds =
        product.categories && product.categories.length > 0
          ? product.categories.map((c) => c.id)
          : product.categoryId
          ? [product.categoryId]
          : [];
      setSelectedCategoryIds(initialCatIds);
      setFormFactor(product.formFactor || 'POWDER');
      setSpeciesTags(product.speciesTags || ['CATTLE_BUFFALO']);
      setStatus(product.status || 'ACTIVE');
      setIsFeatured(Boolean(product.isFeatured));
      setIsBestSeller(Boolean(product.isBestSeller));
      setDlsLicenseNo(product.dlsLicenseNo || '');
      setBangladeshPatentNo(product.bangladeshPatentNo || '');
      setManufacturer(product.manufacturer || 'Research Agro Vet Ltd.');
      setThumbnailPreview(product.thumbnail || '/images/placeholder-medicine.webp');
      setThumbnailFile(null);
      setGalleryItems(
        (product.images || []).map((url, i) => ({
          id: `existing-${i}-${url}`,
          previewUrl: url,
          existingUrl: url,
        }))
      );
      setShortDescription(product.shortDescription || '');

      setVariants(
        (product.variants || []).map((v) => ({
          id: v.id,
          sku: v.sku,
          packSize: v.packSize,
          weightGrams: v.weightGrams || 100,
          packagingInfo: v.packagingInfo || '',
          unitsPerBox: v.unitsPerBox || null,
          tradePrice: Number(v.tradePrice) || 0,
          mrpPrice: Number(v.mrpPrice) || 0,
          sellingPrice: Number(v.sellingPrice) || 0,
          minWholesaleQty: v.minWholesaleQty || null,
          minWholesaleAmount: v.minWholesaleAmount ? Number(v.minWholesaleAmount) : null,
          stockQuantity: v.stockQuantity || 100,
          inStock: v.inStock ?? true,
          isDefault: Boolean(v.isDefault),
          sortOrder: v.sortOrder || 0,
        }))
      );

      setComposition(product.composition || '');
      setIndication(product.indication || '');
      setDosageAndAdministration(product.dosageAndAdministration || '');
      setWithdrawalPeriod(product.withdrawalPeriod || '');
      setContraindications(product.contraindications || '');
      setStorageInstructions(
        product.storageInstructions ||
          'Store below 30°C in a dry place protected from light and moisture.'
      );
      setSearchKeywordsInput((product.searchKeywords || []).join(', '));
      setError(null);
    } else {
      // Reset form for adding new product
      setNameEn('');
      setNameBn('');
      setSlug('');
      setSelectedCategoryIds(categories[0]?.id ? [categories[0].id] : []);
      setFormFactor('POWDER');
      setSpeciesTags(['CATTLE_BUFFALO']);
      setStatus('ACTIVE');
      setIsFeatured(false);
      setIsBestSeller(false);
      setDlsLicenseNo('');
      setBangladeshPatentNo('');
      setManufacturer('Research Agro Vet Ltd.');
      setThumbnailPreview('/images/placeholder-medicine.webp');
      setThumbnailFile(null);
      setGalleryItems([]);
      setShortDescription('');

      // 1 Default Variant with standard unified 3-digit SKU
      const defaultPack = '100 gm Pack';
      const defaultSku = generateStandardSku('AUTO', 'POWDER', defaultPack);
      setVariants([
        {
          sku: defaultSku,
          packSize: defaultPack,
          weightGrams: 100,
          packagingInfo: '1 Box = 20 Pcs',
          unitsPerBox: 20,
          tradePrice: 50,
          mrpPrice: 85,
          sellingPrice: 85,
          minWholesaleQty: 20,
          minWholesaleAmount: null,
          stockQuantity: 100,
          inStock: true,
          isDefault: true,
          sortOrder: 0,
        },
      ]);

      setComposition('');
      setIndication('');
      setDosageAndAdministration('');
      setWithdrawalPeriod('');
      setContraindications('');
      setStorageInstructions('Store below 30°C in a dry place protected from light and moisture.');
      setSearchKeywordsInput('');
      setError(null);
    }
  }, [product, categories, isOpen]);

  if (!isOpen) return null;

  // Category multi-select toggle helper
  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((cId) => cId !== id) : [...prev, id]
    );
  };

  // Species toggle helper
  const toggleSpecies = (tag: string) => {
    if (speciesTags.includes(tag)) {
      if (speciesTags.length > 1) {
        setSpeciesTags(speciesTags.filter((t) => t !== tag));
      }
    } else {
      setSpeciesTags([...speciesTags, tag]);
    }
  };

  // Variant operations & Real-Time Auto-SKU Synchronization
  const handleNameEnChange = (newName: string) => {
    setNameEn(newName);
    if (!isEditing) {
      setSlug(cleanProductSlug(newName));
    }
  };

  const handleFormFactorChange = (newFactor: ProductFormFactor) => {
    setFormFactor(newFactor);
    setVariants((prev) =>
      prev.map((v) => ({
        ...v,
        sku: generateStandardSku(product?.legacyCatalogId ?? 'AUTO', newFactor, v.packSize),
      }))
    );
  };

  const handlePackSizeChange = (idx: number, newPackSize: string) => {
    setVariants((prev) => {
      const updated = [...prev];
      const current = updated[idx];
      if (!current) return prev;

      updated[idx] = {
        ...current,
        packSize: newPackSize,
        sku: generateStandardSku(product?.legacyCatalogId ?? 'AUTO', formFactor, newPackSize),
      };
      return updated;
    });
  };

  const addVariant = () => {
    const defaultNewPack =
      formFactor === 'LIQUID'
        ? '500 ml Bottle'
        : formFactor === 'BOLUS'
        ? '20 Bolus'
        : '1 kg Pack';
    const autoSku = generateStandardSku(product?.legacyCatalogId ?? 'AUTO', formFactor, defaultNewPack);
    setVariants([
      ...variants,
      {
        sku: autoSku,
        packSize: defaultNewPack,
        weightGrams: 500,
        packagingInfo: '1 Box = 12 Pcs',
        unitsPerBox: 12,
        tradePrice: 150,
        mrpPrice: 240,
        sellingPrice: 240,
        minWholesaleQty: 12,
        minWholesaleAmount: null,
        stockQuantity: 100,
        inStock: true,
        isDefault: false,
        sortOrder: variants.length,
      },
    ]);
  };

  const removeVariant = (index: number) => {
    if (variants.length <= 1) {
      toast.warning('A product must have at least one pack-size variant.');
      return;
    }
    setVariants(variants.filter((_, idx) => idx !== index));
  };

  const updateVariant = (index: number, field: keyof AdminVariant, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  // Photo Selection Handlers (Client-Side Only, 0 Cloudinary Uploads until Save)
  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (thumbnailFile && thumbnailPreview.startsWith('blob:')) {
      URL.revokeObjectURL(thumbnailPreview);
    }

    const objectUrl = URL.createObjectURL(file);
    setThumbnailPreview(objectUrl);
    setThumbnailFile(file);
    setError(null);
    e.target.value = '';
  };

  const handleResetThumbnail = () => {
    if (thumbnailFile && thumbnailPreview.startsWith('blob:')) {
      URL.revokeObjectURL(thumbnailPreview);
    }
    setThumbnailPreview('/images/placeholder-medicine.webp');
    setThumbnailFile(null);
  };

  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: GalleryItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        newItems.push({
          id: `new-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
          previewUrl: URL.createObjectURL(file),
          file,
        });
      }
    }

    setGalleryItems((prev) => [...prev, ...newItems]);
    setError(null);
    e.target.value = '';
  };

  const handleDeleteGalleryItem = (id: string) => {
    setGalleryItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.file && target.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  // Submit Handler: Uploads any new device photos to Cloudinary ONLY when Save is clicked
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim()) {
      setError('Product English Name is required.');
      setActiveTab('basic');
      return;
    }

    if (selectedCategoryIds.length === 0) {
      setError('Please select at least one therapeutic category for this medicine.');
      setActiveTab('basic');
      return;
    }

    if (variants.length === 0) {
      setError('Please add at least one pack size variant.');
      setActiveTab('variants');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Upload Thumbnail to Cloudinary ONLY NOW upon saving (if a new file was chosen)
      let resolvedThumbnailUrl = thumbnailPreview;
      if (thumbnailFile) {
        const thumbFormData = new FormData();
        thumbFormData.append('file', thumbnailFile);

        const thumbRes = await authorizedFetch('/api/admin/upload', {
          method: 'POST',
          body: thumbFormData,
        });

        const thumbData = await thumbRes.json();
        if (!thumbRes.ok || !thumbData.success) {
          throw new Error(thumbData.message || 'Failed to upload thumbnail to Cloudinary');
        }
        resolvedThumbnailUrl = thumbData.url;
      }

      // 2. Upload any new Gallery Photos to Cloudinary ONLY NOW upon saving
      const itemsToUpload = galleryItems.filter((item) => item.file);
      const uploadedUrlsMap = new Map<string, string>();

      if (itemsToUpload.length > 0) {
        const galleryFormData = new FormData();
        itemsToUpload.forEach((item) => {
          if (item.file) {
            galleryFormData.append('files', item.file);
          }
        });

        const galleryRes = await authorizedFetch('/api/admin/upload', {
          method: 'POST',
          body: galleryFormData,
        });

        const galleryData = await galleryRes.json();
        if (!galleryRes.ok || !galleryData.success) {
          throw new Error(galleryData.message || 'Failed to upload gallery images to Cloudinary');
        }

        const returnedUrls: string[] = galleryData.urls || [];
        itemsToUpload.forEach((item, index) => {
          if (returnedUrls[index]) {
            uploadedUrlsMap.set(item.id, returnedUrls[index]);
          }
        });
      }

      const finalGalleryUrls: string[] = [];
      for (const item of galleryItems) {
        if (item.existingUrl) {
          finalGalleryUrls.push(item.existingUrl);
        } else if (uploadedUrlsMap.has(item.id)) {
          finalGalleryUrls.push(uploadedUrlsMap.get(item.id)!);
        }
      }

      // 3. Save Product with the confirmed Cloudinary URLs
      const parsedKeywords = searchKeywordsInput
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);

      const payload = {
        nameEn: nameEn.trim(),
        nameBn: nameBn.trim() || null,
        slug: slug.trim() || undefined,
        categoryId: selectedCategoryIds[0] || null,
        categoryIds: selectedCategoryIds,
        formFactor,
        speciesTags,
        status,
        isFeatured,
        isBestSeller,
        dlsLicenseNo: dlsLicenseNo.trim() || null,
        bangladeshPatentNo: bangladeshPatentNo.trim() || null,
        manufacturer: manufacturer.trim() || null,
        thumbnail: resolvedThumbnailUrl.trim() || '/images/placeholder-medicine.webp',
        images: finalGalleryUrls,
        shortDescription: shortDescription.trim() || null,
        variants,
        composition: composition.trim() || null,
        indication: indication.trim() || null,
        dosageAndAdministration: dosageAndAdministration.trim() || null,
        withdrawalPeriod: withdrawalPeriod.trim() || null,
        contraindications: contraindications.trim() || null,
        storageInstructions: storageInstructions.trim() || null,
        searchKeywords: parsedKeywords,
      };

      const url = isEditing
        ? `/api/admin/products/${product?.id}`
        : '/api/admin/products';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await authorizedFetch(url, {
        method,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save product');
      }

      onSaved(data.product);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-900 to-[#005d42] text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 text-white flex items-center justify-center shadow-inner">
              <Package className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-bold text-white text-lg tracking-tight flex items-center gap-2 flex-wrap">
                  <span>{isEditing ? `Edit : ${nameEn || product?.nameEn || 'Medicine'}` : 'Add New Medicine'}</span>
                  {isEditing && (nameBn || product?.nameBn) && (
                    <span className="text-sm font-normal text-emerald-200/90">
                      ({nameBn || product?.nameBn})
                    </span>
                  )}
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                    status === 'ACTIVE'
                      ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30'
                      : 'bg-amber-400/20 text-amber-200 border border-amber-400/30'
                  }`}
                >
                  {status}
                </span>
              </div>
              <p className="text-xs text-emerald-100/80 mt-0.5 flex items-center gap-2 flex-wrap">
                {isEditing ? (
                  <>
                    {/* <span className="font-mono text-emerald-200 font-semibold">/{slug || product?.slug}</span>
                    <span>•</span>
                    <span>{FORM_FACTOR_LABELS[formFactor] || formFactor}</span>
                    <span>•</span>
                    <span>{variants.length} Pack Size{variants.length === 1 ? '' : 's'}</span> */}
                  </>
                ) : (
                  <span>Configure basic identity, pack-size pricing, and clinical reference.</span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-150"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Stepper Navigation */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3">
          <div className="flex items-center gap-2 max-w-3xl">
            <button
              type="button"
              onClick={() => setActiveTab('basic')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 border ${
                activeTab === 'basic'
                  ? 'bg-white text-[#005d42] border-emerald-200 shadow-xs ring-2 ring-emerald-500/20'
                  : 'bg-transparent text-slate-600 border-transparent hover:bg-slate-200/60'
              }`}
            >
              <FileText className={`w-4 h-4 ${activeTab === 'basic' ? 'text-[#005d42]' : 'text-slate-400'}`} />
              <span>1. Basic Info & Regulatory</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('variants')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 border ${
                activeTab === 'variants'
                  ? 'bg-white text-[#005d42] border-emerald-200 shadow-xs ring-2 ring-emerald-500/20'
                  : 'bg-transparent text-slate-600 border-transparent hover:bg-slate-200/60'
              }`}
            >
              <Layers className={`w-4 h-4 ${activeTab === 'variants' ? 'text-[#005d42]' : 'text-slate-400'}`} />
              <div className="flex items-center gap-1.5">
                <span>2. Pack Sizes & Pricing</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-[#005d42] font-bold">
                  {variants.length}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('clinical')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 border ${
                activeTab === 'clinical'
                  ? 'bg-white text-[#005d42] border-emerald-200 shadow-xs ring-2 ring-emerald-500/20'
                  : 'bg-transparent text-slate-600 border-transparent hover:bg-slate-200/60'
              }`}
            >
              <Stethoscope className={`w-4 h-4 ${activeTab === 'clinical' ? 'text-[#005d42]' : 'text-slate-400'}`} />
              <span>3. Clinical & Disease Reference</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2.5 animate-in shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* =========================================
              TAB 1: BASIC INFO & MEDIA
             ========================================= */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              {/* Product Identity */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Tag className="w-4 h-4 text-[#005d42]" />
                  <h3 className="font-bold text-slate-900 text-sm">General Identification</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Product Name (English) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#005d42] focus:border-[#005d42] outline-none transition-all"
                      placeholder="e.g. Re-Zinc Plus"
                      value={nameEn}
                      onChange={(e) => handleNameEnChange(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Product Name (Bengali / বাংলা)
                    </label>
                    <input
                      type="text"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#005d42] focus:border-[#005d42] outline-none transition-all"
                      placeholder="e.g. রি-জিংক প্লাস"
                      value={nameBn}
                      onChange={(e) => setNameBn(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        URL Slug
                      </label>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>Auto-Locked</span>
                      </span>
                    </div>
                    <input
                      type="text"
                      readOnly
                      tabIndex={-1}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-xs font-mono select-all cursor-not-allowed outline-none"
                      placeholder="auto-generated-from-name"
                      value={slug || (nameEn ? cleanProductSlug(nameEn) : '')}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Form Factor
                    </label>
                    <select
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#005d42] outline-none bg-white transition-all font-medium"
                      value={formFactor}
                      onChange={(e) => handleFormFactorChange(e.target.value as ProductFormFactor)}
                    >
                      {FORM_FACTORS.map((f) => (
                        <option key={f} value={f}>
                          {FORM_FACTOR_LABELS[f] || f}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Therapeutic Categories Multi-Selection */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Tags className="w-4 h-4 text-[#005d42]" />
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Therapeutic Categories (Select all that apply) <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                      {selectedCategoryIds.length} {selectedCategoryIds.length === 1 ? 'Category' : 'Categories'} Selected
                    </span>
                    <a
                      href="/admin/categories"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#005d42] hover:underline font-semibold flex items-center gap-1"
                      title="Open category management in a new tab"
                    >
                      <span>+ Manage Categories</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {categories.map((c) => {
                    const isSelected = selectedCategoryIds.includes(c.id);
                    const isPrimary = selectedCategoryIds[0] === c.id;

                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => toggleCategory(c.id)}
                        className={`p-3 rounded-xl border text-left transition-all duration-150 flex items-start justify-between gap-2 relative cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50/90 border-[#005d42] ring-2 ring-[#005d42]/20 text-[#005d42]'
                            : 'bg-slate-50/70 border-slate-200/80 text-slate-700 hover:bg-slate-100/70 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-0.5 min-w-0 pr-4">
                          <span className="text-xs font-bold leading-snug block truncate">
                            {c.nameEn}
                          </span>
                          {c.nameBn && (
                            <span className="text-[10px] text-slate-500 font-medium block truncate">
                              {c.nameBn}
                            </span>
                          )}
                          {isPrimary && (
                            <span className="inline-block mt-1 text-[9px] bg-[#005d42] text-white font-bold px-1.5 py-0.2 rounded uppercase tracking-wider">
                              Primary
                            </span>
                          )}
                        </div>

                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                            isSelected
                              ? 'bg-[#005d42] text-white'
                              : 'border border-slate-300 bg-white text-transparent'
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Livestock Species Targeting */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Target Livestock Species (Select all that apply)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {SPECIES_OPTIONS.map((sp) => {
                    const isSelected = speciesTags.includes(sp.id);
                    return (
                      <button
                        type="button"
                        key={sp.id}
                        onClick={() => toggleSpecies(sp.id)}
                        className={`p-3 rounded-xl border text-left transition-all duration-150 flex flex-col items-center text-center gap-2 relative ${
                          isSelected
                            ? 'bg-emerald-50/80 border-[#005d42] ring-2 ring-[#005d42]/20 text-[#005d42]'
                            : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <div className="w-12 h-10 relative flex items-center justify-center shrink-0">
                          <Image
                            src={sp.image}
                            alt={sp.label}
                            width={sp.id === 'CATTLE_BUFFALO' ? 44 : 36}
                            height={36}
                            className={`object-contain transition-transform duration-150 ${
                              isSelected ? 'scale-110' : 'opacity-85'
                            } ${sp.id === 'CATTLE_BUFFALO' ? 'scale-[1.25]' : ''}`}
                          />
                        </div>
                        <span className="text-xs font-semibold leading-snug">{sp.label}</span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-[#005d42] text-white flex items-center justify-center text-[10px] absolute top-2 right-2 shadow-2xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Media & Visuals */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#005d42]" />
                    <h3 className="font-bold text-slate-900 text-sm">Product Photos & Media</h3>
                  </div>
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                    Direct Device Upload • Cloudinary Hosted
                  </span>
                </div>

                {/* Main Thumbnail Upload */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-800">
                      Main Display Photo (Thumbnail) <span className="text-red-500">*</span>
                    </label>
                    {thumbnailFile && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        New photo selected (Uploads on Save)
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                    {/* Thumbnail preview */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-white border border-slate-200 relative overflow-hidden flex items-center justify-center shrink-0 shadow-2xs group">
                      {thumbnailPreview ? (
                        <Image
                          src={thumbnailPreview}
                          alt="Product thumbnail preview"
                          fill
                          unoptimized
                          className="object-contain p-1.5"
                          onError={(e) => {
                            (e.currentTarget as any).src = '/images/placeholder-medicine.webp';
                          }}
                        />
                      ) : (
                        <Package className="w-8 h-8 text-slate-300" />
                      )}
                    </div>

                    {/* Upload button and actions */}
                    <div className="flex-1 space-y-2">
                      <p className="text-xs text-slate-600">
                        Select a photo directly from your device. It will preview immediately and upload to Cloudinary only when you click <strong>Save Product</strong>.
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <label className={`cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                          isSubmitting
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-[#005d42] hover:bg-[#004732] text-white active:scale-95'
                        }`}>
                          <UploadCloud className="w-4 h-4" />
                          <span>{thumbnailPreview && thumbnailPreview !== '/images/placeholder-medicine.webp' ? 'Replace Photo' : 'Select Photo from Device'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={isSubmitting}
                            onChange={handleThumbnailSelect}
                          />
                        </label>

                        {thumbnailPreview && thumbnailPreview !== '/images/placeholder-medicine.webp' && (
                          <button
                            type="button"
                            onClick={handleResetThumbnail}
                            className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-all"
                          >
                            Reset to Default
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Zero bandwidth wasted if you close or cancel the modal without saving.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Multiple Gallery Photos */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-800">
                      Additional Gallery Photos
                    </label>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {galleryItems.length} photo{galleryItems.length === 1 ? '' : 's'} staged
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {/* Add Photos Tile */}
                    <label className="border-2 border-dashed border-slate-300 hover:border-[#005d42] hover:bg-emerald-50/30 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all aspect-square">
                      <div className="w-9 h-9 rounded-full bg-emerald-100/70 text-[#005d42] flex items-center justify-center mb-1.5 shadow-2xs">
                        <Plus className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">Add Photos</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Select from device</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        disabled={isSubmitting}
                        onChange={handleGallerySelect}
                      />
                    </label>

                    {/* Gallery Image Thumbnails */}
                    {galleryItems.map((item, idx) => (
                      <div
                        key={item.id}
                        className="relative group rounded-xl border border-slate-200 bg-white overflow-hidden aspect-square shadow-2xs hover:shadow-md transition-all flex items-center justify-center"
                      >
                        <Image
                          src={item.previewUrl}
                          alt={`Gallery photo ${idx + 1}`}
                          fill
                          unoptimized
                          className="object-contain p-1"
                          onError={(e) => {
                            (e.currentTarget as any).src = '/images/placeholder-medicine.webp';
                          }}
                        />
                        {/* New indicator badge if not yet saved to Cloudinary */}
                        {item.file && (
                          <span className="absolute top-1.5 left-1.5 px-1 py-0.5 bg-amber-500 text-white text-[8px] font-bold rounded shadow-xs">
                            Pending Save
                          </span>
                        )}
                        {/* Order badge */}
                        <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-slate-900/70 backdrop-blur-2xs text-white text-[9px] font-mono rounded">
                          #{idx + 1}
                        </span>
                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteGalleryItem(item.id)}
                          className="absolute top-1.5 right-1.5 p-1.5 bg-red-600 text-white rounded-lg opacity-90 hover:opacity-100 hover:scale-110 shadow-sm transition-all"
                          title="Delete this picture"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Short Description */}
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Short Storefront Teaser / Summary
                  </label>
                  <textarea
                    rows={2}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#005d42] outline-none"
                    placeholder="Quick 1-2 sentence description shown under product title..."
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* Regulatory Compliance & Manufacturer */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <ShieldCheck className="w-4 h-4 text-[#005d42]" />
                  <h3 className="font-bold text-slate-900 text-sm">Regulatory Compliance & Manufacturer</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      DLS License No
                    </label>
                    <input
                      type="text"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#005d42] outline-none font-mono text-xs"
                      placeholder="e.g. 126-18-(07)-006"
                      value={dlsLicenseNo}
                      onChange={(e) => setDlsLicenseNo(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Bangladesh Patent No
                    </label>
                    <input
                      type="text"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#005d42] outline-none font-mono text-xs"
                      placeholder="e.g. 1005414"
                      value={bangladeshPatentNo}
                      onChange={(e) => setBangladeshPatentNo(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Manufacturer
                    </label>
                    <input
                      type="text"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#005d42] outline-none"
                      value={manufacturer}
                      onChange={(e) => setManufacturer(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Visibility and Flags */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Sparkles className="w-4 h-4 text-[#005d42]" />
                  <h3 className="font-bold text-slate-900 text-sm">Storefront Visibility & Merchandising</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Publication Status
                    </label>
                    <select
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#005d42] outline-none bg-white font-medium"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as ProductStatus)}
                    >
                      <option value="ACTIVE">ACTIVE (Visible on Store)</option>
                      <option value="DRAFT">DRAFT (Hidden)</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#005d42]"></div>
                      <span className="ml-2.5 text-xs font-semibold text-slate-800">
                        Featured on Homepage
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isBestSeller}
                        onChange={(e) => setIsBestSeller(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#005d42]"></div>
                      <span className="ml-2.5 text-xs font-semibold text-slate-800">
                        Best Seller Badge
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================
              TAB 2: VARIANTS, PACKAGING & PRICING
             ========================================= */}
          {activeTab === 'variants' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-[#005d42]" />
                    <span>Pack Sizes, Wholesale & Retail Pricing</span>
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Each pack size (e.g. 100 ml, 1 Lt, 1 kg) has independent Trade Price (TP), MRP, selling price, and carton master packaging.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addVariant}
                  className="px-4 py-2 rounded-xl bg-[#005d42] text-white hover:bg-[#004e37] font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Pack Size</span>
                </button>
              </div>

              <div className="space-y-4">
                {variants.map((variant, idx) => {
                  const discountPercent =
                    variant.mrpPrice > 0 && variant.sellingPrice < variant.mrpPrice
                      ? Math.round(((variant.mrpPrice - variant.sellingPrice) / variant.mrpPrice) * 100)
                      : 0;

                  return (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4 relative transition-all hover:border-emerald-200"
                    >
                      {/* Variant Top bar */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-[#005d42] text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-slate-900 text-sm">
                            {variant.packSize || `Variant #${idx + 1}`}
                          </span>
                          {variant.isDefault ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-[#005d42] font-bold">
                              Default Pack
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = variants.map((v, i) => ({
                                  ...v,
                                  isDefault: i === idx,
                                }));
                                setVariants(updated);
                              }}
                              className="text-[11px] text-slate-500 hover:text-[#005d42] underline"
                            >
                              Set Default
                            </button>
                          )}
                          {discountPercent > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-100 text-red-700 font-bold">
                              {discountPercent}% OFF
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => removeVariant(idx)}
                          className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          title="Remove pack size"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Variant General Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Pack Size Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#005d42] outline-none font-medium transition-all"
                            placeholder="e.g. 100 ml Bottle, 1 kg Pack"
                            value={variant.packSize}
                            onChange={(e) => handlePackSizeChange(idx, e.target.value)}
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                              <Lock className="w-3 h-3 text-slate-400" />
                              <span>SKU Code</span>
                            </label>
                           
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              readOnly
                              tabIndex={-1}
                              className="w-full px-3 py-2 pr-8 rounded-xl border border-slate-200 text-xs bg-slate-100 text-slate-600 font-mono font-bold cursor-not-allowed uppercase select-all"
                              value={
                                variant.sku ||
                                generateStandardSku(product?.legacyCatalogId ?? 'AUTO', formFactor, variant.packSize)
                              }
                              title="SKU code is non-editable and strictly managed according to the RAV-XXX-FORM-PACK standard."
                            />
                            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
                              <Lock className="w-3.5 h-3.5" />
                            </div>
                          </div>
                         
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Weight (Grams)
                          </label>
                          <input
                            type="number"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#005d42] outline-none transition-all"
                            value={variant.weightGrams}
                            onChange={(e) =>
                              updateVariant(idx, 'weightGrams', Number(e.target.value))
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Units per Box / Carton
                          </label>
                          <input
                            type="number"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#005d42] outline-none transition-all"
                            placeholder="e.g. 12 or 20"
                            value={variant.unitsPerBox ?? ''}
                            onChange={(e) =>
                              updateVariant(
                                idx,
                                'unitsPerBox',
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
                          />
                        </div>
                      </div>

                      {/* Carton & Packaging Info */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Packaging Info (Carton / Box)
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#005d42] outline-none transition-all"
                          placeholder="e.g. 1 Box = 20 Pcs, 1 Carton = 12 Bottles"
                          value={variant.packagingInfo || ''}
                          onChange={(e) => updateVariant(idx, 'packagingInfo', e.target.value)}
                        />
                      </div>

                      {/* Pricing and Stock Bar */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/70">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Trade Price (TP / ৳) <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-2 text-slate-400 text-xs font-bold">৳</span>
                            <input
                              type="number"
                              step="0.01"
                              required
                              className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-[#005d42] outline-none font-semibold text-slate-900"
                              placeholder="0.00"
                              value={variant.tradePrice}
                              onChange={(e) =>
                                updateVariant(idx, 'tradePrice', Number(e.target.value))
                              }
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Printed MRP (৳) <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-2 text-slate-400 text-xs font-bold">৳</span>
                            <input
                              type="number"
                              step="0.01"
                              required
                              className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-[#005d42] outline-none font-semibold text-slate-900"
                              placeholder="0.00"
                              value={variant.mrpPrice}
                              onChange={(e) =>
                                updateVariant(idx, 'mrpPrice', Number(e.target.value))
                              }
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Selling Price (৳) <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-2 text-emerald-600 text-xs font-bold">৳</span>
                            <input
                              type="number"
                              step="0.01"
                              required
                              className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-emerald-300 text-xs bg-white focus:ring-2 focus:ring-[#005d42] outline-none font-bold text-[#005d42]"
                              placeholder="0.00"
                              value={variant.sellingPrice}
                              onChange={(e) =>
                                updateVariant(idx, 'sellingPrice', Number(e.target.value))
                              }
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Stock Quantity & Status
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              className="w-20 px-2 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-[#005d42] outline-none font-medium"
                              value={variant.stockQuantity}
                              onChange={(e) =>
                                updateVariant(idx, 'stockQuantity', Number(e.target.value))
                              }
                            />
                            <button
                              type="button"
                              onClick={() => updateVariant(idx, 'inStock', !variant.inStock)}
                              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold tracking-wide uppercase transition-all ${
                                variant.inStock
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                                  : 'bg-red-100 text-red-700 border border-red-300 hover:bg-red-200'
                              }`}
                            >
                              {variant.inStock ? 'In Stock' : 'Out'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Live Individual Discount Calculator & Status */}
                      <div className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all ${
                        variant.mrpPrice > 0 && variant.sellingPrice < variant.mrpPrice
                          ? 'bg-emerald-50/70 border-emerald-200'
                          : 'bg-slate-50/70 border-slate-200/80'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Tag className={`w-4 h-4 shrink-0 ${
                            variant.mrpPrice > 0 && variant.sellingPrice < variant.mrpPrice
                              ? 'text-[#005d42]'
                              : 'text-slate-400'
                          }`} />
                          <div>
                            {variant.mrpPrice > 0 && variant.sellingPrice < variant.mrpPrice ? (
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-[#005d42]">
                                  🎉 Individual Discount: {Math.round(((variant.mrpPrice - variant.sellingPrice) / variant.mrpPrice) * 100)}% OFF
                                </span>
                                <span className="text-[11px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300 font-mono shadow-2xs">
                                  Customer Saves ৳{(variant.mrpPrice - variant.sellingPrice).toFixed(2)}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  (Dominates universal discount at checkout)
                                </span>
                              </div>
                            ) : variant.sellingPrice > variant.mrpPrice ? (
                              <span className="text-xs font-bold text-amber-700">
                                ⚠️ Warning: Selling Price (৳{variant.sellingPrice}) is higher than Printed MRP (৳{variant.mrpPrice})
                              </span>
                            ) : (
                              <span className="text-xs font-medium text-slate-500">
                                No individual discount set (Standard MRP: ৳{variant.mrpPrice || 0} — will receive storewide Universal Discount at checkout)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quick Discount Setters */}
                        {variant.mrpPrice > 0 && (
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Quick Set:</span>
                            {[5, 10, 15, 20].map((pct) => (
                              <button
                                key={pct}
                                type="button"
                                onClick={() => {
                                  const calculatedSelling = Math.round(variant.mrpPrice * (1 - pct / 100));
                                  updateVariant(idx, 'sellingPrice', calculatedSelling);
                                }}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all border ${
                                  discountPercent === pct
                                    ? 'bg-[#005d42] text-white border-[#005d42]'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-[#005d42]'
                                }`}
                                title={`Set ${pct}% discount`}
                              >
                                {pct}%
                              </button>
                            ))}
                            {variant.sellingPrice !== variant.mrpPrice && (
                              <button
                                type="button"
                                onClick={() => updateVariant(idx, 'sellingPrice', variant.mrpPrice)}
                                className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white text-slate-500 border border-slate-200 hover:bg-slate-100"
                                title="Reset selling price to printed MRP"
                              >
                                Reset (0%)
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =========================================
              TAB 3: CLINICAL & DISEASE REFERENCE
             ========================================= */}
          {activeTab === 'clinical' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-xs text-emerald-900 flex items-start gap-3 shadow-2xs">
                <HelpCircle className="w-5 h-5 text-[#005d42] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900">Clinical Reference Section:</p>
                  <p className="text-slate-600 leading-relaxed">
                    This medical information represents the clinical pharmacology of the drug (how it is made and what diseases it cures).
                  </p>
                </div>
              </div>

              {/* Composition */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  1. Composition (How the Medicine is Made / Active Ingredients)
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#005d42] outline-none"
                  placeholder="e.g. Zinc Sulfate Monohydrate USP, Vitamin B-Complex, Calcium Propionate..."
                  value={composition}
                  onChange={(e) => setComposition(e.target.value)}
                />
              </div>

              {/* Indications */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  2. Indications (What Diseases & Symptoms It Cures)
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#005d42] outline-none"
                  placeholder="e.g. Indicated for milk fever, acute anorexia, rumen acidosis, foot rot, and deficiency..."
                  value={indication}
                  onChange={(e) => setIndication(e.target.value)}
                />
              </div>

              {/* Dosage */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  3. Dosage & Administration
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#005d42] outline-none"
                  placeholder="e.g. Cattle: 50 ml twice daily for 3 days; Poultry: 1 ml per 2 liters drinking water..."
                  value={dosageAndAdministration}
                  onChange={(e) => setDosageAndAdministration(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Withdrawal Period
                  </label>
                  <input
                    type="text"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#005d42] outline-none"
                    placeholder="e.g. Meat: 7 days, Milk: 0 days"
                    value={withdrawalPeriod}
                    onChange={(e) => setWithdrawalPeriod(e.target.value)}
                  />
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Contraindications & Warnings
                  </label>
                  <input
                    type="text"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#005d42] outline-none"
                    placeholder="e.g. Do not administer to animals with severe renal failure"
                    value={contraindications}
                    onChange={(e) => setContraindications(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Storage Guidelines
                </label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#005d42] outline-none"
                  value={storageInstructions}
                  onChange={(e) => setStorageInstructions(e.target.value)}
                />
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Search & AI Chatbot Keywords (Comma-separated)
                </label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#005d42] outline-none"
                  placeholder="e.g. mastitis, milk fever, calcium, bloat, zinc, anorexia"
                  value={searchKeywordsInput}
                  onChange={(e) => setSearchKeywordsInput(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-500 font-medium">
              * Required fields must be filled before saving.
            </span>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              {/* Stepper buttons */}
              {activeTab === 'variants' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('basic')}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium text-xs transition-colors flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
              )}
              {activeTab === 'clinical' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('variants')}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium text-xs transition-colors flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
              )}
              {activeTab === 'basic' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('variants')}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 font-medium text-xs transition-colors flex items-center gap-1"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
              {activeTab === 'variants' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('clinical')}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 font-medium text-xs transition-colors flex items-center gap-1"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-xs transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-[#005d42] text-white hover:bg-[#004e37] font-semibold text-xs transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-200" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>
                  {isSubmitting
                    ? thumbnailFile || galleryItems.some((i) => i.file)
                      ? 'Uploading Photos & Saving...'
                      : 'Saving Medicine...'
                    : isEditing
                    ? 'Update Medicine'
                    : 'Save Product'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
