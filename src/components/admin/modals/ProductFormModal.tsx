'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
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
  ImageIcon,
  Sparkles,
  Info,
  DollarSign,
  Boxes,
} from 'lucide-react';
import {
  AdminProduct,
  AdminVariant,
  ProductFormFactor,
  ProductStatus,
} from '@/types/admin-product';

interface CategoryOption {
  id: string;
  nameEn: string;
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

const SPECIES_OPTIONS = [
  { id: 'CATTLE_BUFFALO', label: 'Cattle & Buffalo', icon: '🐄' },
  { id: 'GOAT_SHEEP', label: 'Goat & Sheep', icon: '🐐' },
  { id: 'POULTRY', label: 'Poultry & Ducks', icon: '🐔' },
  { id: 'AQUA', label: 'Fisheries & Aqua', icon: '🐟' },
  { id: 'PET', label: 'Pets & Companion', icon: '🐾' },
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
  const [categoryId, setCategoryId] = useState('');
  const [formFactor, setFormFactor] = useState<ProductFormFactor>('POWDER');
  const [speciesTags, setSpeciesTags] = useState<string[]>(['CATTLE_BUFFALO']);
  const [status, setStatus] = useState<ProductStatus>('ACTIVE');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);

  // Regulatory & Branding
  const [dlsLicenseNo, setDlsLicenseNo] = useState('');
  const [bangladeshPatentNo, setBangladeshPatentNo] = useState('');
  const [manufacturer, setManufacturer] = useState('Research Agro Vet Ltd.');
  const [thumbnail, setThumbnail] = useState('/images/placeholder-medicine.webp');
  const [imagesInput, setImagesInput] = useState('');
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
      setCategoryId(product.categoryId || '');
      setFormFactor(product.formFactor || 'POWDER');
      setSpeciesTags(product.speciesTags || ['CATTLE_BUFFALO']);
      setStatus(product.status || 'ACTIVE');
      setIsFeatured(Boolean(product.isFeatured));
      setIsBestSeller(Boolean(product.isBestSeller));
      setDlsLicenseNo(product.dlsLicenseNo || '');
      setBangladeshPatentNo(product.bangladeshPatentNo || '');
      setManufacturer(product.manufacturer || 'Research Agro Vet Ltd.');
      setThumbnail(product.thumbnail || '/images/placeholder-medicine.webp');
      setImagesInput((product.images || []).join('\n'));
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
      setCategoryId(categories[0]?.id || '');
      setFormFactor('POWDER');
      setSpeciesTags(['CATTLE_BUFFALO']);
      setStatus('ACTIVE');
      setIsFeatured(false);
      setIsBestSeller(false);
      setDlsLicenseNo('');
      setBangladeshPatentNo('');
      setManufacturer('Research Agro Vet Ltd.');
      setThumbnail('/images/placeholder-medicine.webp');
      setImagesInput('');
      setShortDescription('');

      // 1 Default Variant
      setVariants([
        {
          sku: 'RAV-100G',
          packSize: '100 gm Pack',
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

  // Variant operations
  const addVariant = () => {
    const newIdx = variants.length + 1;
    setVariants([
      ...variants,
      {
        sku: `RAV-VAR-${newIdx}`,
        packSize: '500 ml Bottle',
        weightGrams: 500,
        packagingInfo: '1 Carton = 12 Bottles',
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
      alert('A product must have at least one pack-size variant.');
      return;
    }
    setVariants(variants.filter((_, idx) => idx !== index));
  };

  const updateVariant = (index: number, field: keyof AdminVariant, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim()) {
      setError('Product English Name is required.');
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
      const parsedImages = imagesInput
        .split('\n')
        .map((img) => img.trim())
        .filter(Boolean);

      const parsedKeywords = searchKeywordsInput
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);

      const payload = {
        nameEn: nameEn.trim(),
        nameBn: nameBn.trim() || null,
        slug: slug.trim() || undefined,
        categoryId: categoryId || null,
        formFactor,
        speciesTags,
        status,
        isFeatured,
        isBestSeller,
        dlsLicenseNo: dlsLicenseNo.trim() || null,
        bangladeshPatentNo: bangladeshPatentNo.trim() || null,
        manufacturer: manufacturer.trim() || null,
        thumbnail: thumbnail.trim() || '/images/placeholder-medicine.webp',
        images: parsedImages,
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

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
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
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-900 to-[#005d42] text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 text-white flex items-center justify-center shadow-inner">
              <Package className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-white text-lg tracking-tight">
                  {isEditing ? 'Edit Medicine & Packaging Details' : 'Add New Medicine'}
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
              <p className="text-xs text-emerald-100/80 mt-0.5">
                Configure basic identity, pack-size pricing, and clinical reference.
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
                      onChange={(e) => setNameEn(e.target.value)}
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#005d42] outline-none transition-all font-mono text-xs"
                      placeholder="auto-generated-if-empty"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Therapeutic Category
                    </label>
                    <select
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#005d42] outline-none bg-white transition-all"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                    >
                      <option value="">-- Select Category --</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Form Factor
                    </label>
                    <select
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#005d42] outline-none bg-white transition-all font-medium"
                      value={formFactor}
                      onChange={(e) => setFormFactor(e.target.value as ProductFormFactor)}
                    >
                      {FORM_FACTORS.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
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
                        className={`p-3 rounded-xl border text-left transition-all duration-150 flex flex-col items-center text-center gap-1.5 ${
                          isSelected
                            ? 'bg-emerald-50/80 border-[#005d42] ring-2 ring-[#005d42]/20 text-[#005d42]'
                            : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-2xl">{sp.icon}</span>
                        <span className="text-xs font-semibold">{sp.label}</span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-[#005d42] text-white flex items-center justify-center text-[10px]">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Media & Visuals */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <ImageIcon className="w-4 h-4 text-[#005d42]" />
                  <h3 className="font-bold text-slate-900 text-sm">Media & Visuals</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                  <div className="md:col-span-3 space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Thumbnail Image URL
                      </label>
                      <input
                        type="text"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#005d42] outline-none font-mono text-xs"
                        placeholder="/images/placeholder-medicine.webp or Cloudinary URL"
                        value={thumbnail}
                        onChange={(e) => setThumbnail(e.target.value)}
                      />
                    </div>

                    <div>
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

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center">
                    <span className="text-[11px] font-semibold text-slate-500 mb-2">Live Preview</span>
                    <div className="w-24 h-24 rounded-lg bg-white border border-slate-200 relative overflow-hidden flex items-center justify-center shadow-xs">
                      {thumbnail ? (
                        <Image
                          src={thumbnail}
                          alt="Thumbnail preview"
                          fill
                          className="object-contain p-1"
                          onError={(e) => {
                            (e.currentTarget as any).src = '/images/placeholder-medicine.webp';
                          }}
                        />
                      ) : (
                        <Package className="w-8 h-8 text-slate-300" />
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Additional Gallery Images (One URL per line)
                  </label>
                  <textarea
                    rows={2}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-[#005d42] outline-none"
                    placeholder="https://...&#10;https://..."
                    value={imagesInput}
                    onChange={(e) => setImagesInput(e.target.value)}
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
                            onChange={(e) => updateVariant(idx, 'packSize', e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            SKU Code
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#005d42] outline-none font-mono text-slate-800 transition-all"
                            placeholder="e.g. RZP-100ML"
                            value={variant.sku}
                            onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                          />
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
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving Medicine...' : isEditing ? 'Update Medicine' : 'Save Product'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
