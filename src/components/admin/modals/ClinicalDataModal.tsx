'use client';

import React, { useState, useEffect } from 'react';
import { X, Stethoscope, Save, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import { AdminProduct, ClinicalDataPayload } from '@/types/admin-product';
import { getApiUrl } from '@/lib/api-client';

interface ClinicalDataModalProps {
  product: AdminProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (updatedProduct: AdminProduct) => void;
}

export default function ClinicalDataModal({
  product,
  isOpen,
  onClose,
  onSaved,
}: ClinicalDataModalProps) {
  const [formData, setFormData] = useState<ClinicalDataPayload>({
    composition: '',
    indication: '',
    dosageAndAdministration: '',
    withdrawalPeriod: '',
    contraindications: '',
    storageInstructions: '',
    searchKeywords: [],
  });
  const [keywordsInput, setKeywordsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        composition: product.composition || '',
        indication: product.indication || '',
        dosageAndAdministration: product.dosageAndAdministration || '',
        withdrawalPeriod: product.withdrawalPeriod || '',
        contraindications: product.contraindications || '',
        storageInstructions:
          product.storageInstructions ||
          'Store below 30°C in a dry place protected from light and moisture.',
        searchKeywords: product.searchKeywords || [],
      });
      setKeywordsInput((product.searchKeywords || []).join(', '));
      setError(null);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const keywords = keywordsInput
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);

      const payload: ClinicalDataPayload = {
        ...formData,
        searchKeywords: keywords,
      };

      const res = await fetch(getApiUrl(`/api/admin/products/${product.id}/clinical`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update clinical details');
      }

      onSaved({
        ...product,
        ...data.product,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#005d42] flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-lg">
                  Clinical & Disease Reference
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-[#005d42]">
                  Medical Data
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Editing formulation & therapeutic profile for{' '}
                <strong className="text-slate-700">{product.nameEn}</strong>
                {product.nameBn ? ` (${product.nameBn})` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice */}
        <div className="px-6 py-2.5 bg-blue-50/80 border-b border-blue-100 text-xs text-blue-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            These clinical details populate the veterinary pharmacology section on the product page and empower AI dosage assistance.
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Composition (How medicine is made) */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1.5">
              1. Composition & Active Ingredients (How the Medicine is Made)
            </label>
            <textarea
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#005d42] focus:border-transparent outline-none transition-all placeholder:text-slate-400"
              placeholder="e.g. Each 100 ml contains: Zinc Sulfate Monohydrate USP 1000 mg, Vitamin Complex, Biotin, Inositol..."
              value={formData.composition || ''}
              onChange={(e) => setFormData({ ...formData, composition: e.target.value })}
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Specify active chemical ingredients, USP/BP standards, and generic carrier base.
            </p>
          </div>

          {/* 2. Indication & Diseases Cured */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1.5">
              2. Indications & Target Diseases (What Diseases It Cures)
            </label>
            <textarea
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#005d42] focus:border-transparent outline-none transition-all placeholder:text-slate-400"
              placeholder="e.g. Treats acute hypocalcemia, milk fever, ketosis, stimulates appetite, and strengthens hoof and bone density in dairy cattle..."
              value={formData.indication || ''}
              onChange={(e) => setFormData({ ...formData, indication: e.target.value })}
            />
            <p className="text-[11px] text-slate-500 mt-1">
              List the primary symptoms, clinical conditions, and livestock diseases treated by this medicine.
            </p>
          </div>

          {/* 3. Dosage and Administration */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1.5">
              3. Dosage & Administration Guidelines
            </label>
            <textarea
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#005d42] focus:border-transparent outline-none transition-all placeholder:text-slate-400"
              placeholder="e.g. Cattle & Buffalo: 50-100 ml daily for 3-5 days. Calves & Goats: 10-20 ml. Administer orally or mix with feed..."
              value={formData.dosageAndAdministration || ''}
              onChange={(e) =>
                setFormData({ ...formData, dosageAndAdministration: e.target.value })
              }
            />
          </div>

          {/* Two Columns: Withdrawal & Contraindications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1.5">
                Withdrawal Period
              </label>
              <input
                type="text"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#005d42] focus:border-transparent outline-none"
                placeholder="e.g. Meat: 7 days, Milk: 0 days"
                value={formData.withdrawalPeriod || ''}
                onChange={(e) => setFormData({ ...formData, withdrawalPeriod: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1.5">
                Contraindications & Warnings
              </label>
              <input
                type="text"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#005d42] focus:border-transparent outline-none"
                placeholder="e.g. Do not use in animals with severe renal dysfunction"
                value={formData.contraindications || ''}
                onChange={(e) => setFormData({ ...formData, contraindications: e.target.value })}
              />
            </div>
          </div>

          {/* Storage Instructions */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1.5">
              Storage & Temperature Guidelines
            </label>
            <input
              type="text"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#005d42] focus:border-transparent outline-none"
              placeholder="e.g. Store below 25°C in a cool dry place. Keep out of reach of children."
              value={formData.storageInstructions || ''}
              onChange={(e) => setFormData({ ...formData, storageInstructions: e.target.value })}
            />
          </div>

          {/* Search & AI Keywords */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1.5">
              Veterinary Search & AI Keywords (Comma-separated)
            </label>
            <input
              type="text"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#005d42] focus:border-transparent outline-none"
              placeholder="e.g. zinc, calcium, milk fever, diarrhea, mastitis, appetite, bloat"
              value={keywordsInput}
              onChange={(e) => setKeywordsInput(e.target.value)}
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Helps both farmers searching on the website and the AI chatbot match this medicine to farmer inquiries.
            </p>
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-[#005d42] text-white hover:bg-[#004e37] font-semibold text-sm transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving Reference Data...' : 'Save Clinical Reference'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
