'use client';

import React, { useState, useEffect } from 'react';
import {
  Percent,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Save,
  HelpCircle,
  Tag,
  ArrowRight,
  Calculator,
  Sliders,
  AlertCircle,
  Power,
  Store,
} from 'lucide-react';
import { toast } from '@heroui/react';
import { getApiUrl } from '@/lib/api-client';

interface UniversalDiscountSettings {
  enabled: boolean;
  percent: number;
  label: string;
  updatedAt?: string;
}

export default function DiscountManagementPage() {
  const [settings, setSettings] = useState<UniversalDiscountSettings>({
    enabled: true,
    percent: 5,
    label: 'Website 5% Universal Discount',
  });
  const [initialSettings, setInitialSettings] = useState<UniversalDiscountSettings>({
    enabled: true,
    percent: 5,
    label: 'Website 5% Universal Discount',
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Live Simulator state
  const [testAmount, setTestAmount] = useState<number>(1000);

  // Fetch current universal discount from API
  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/admin/discounts/universal'), {
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSettings(data.data);
        setInitialSettings(data.data);
      } else {
        toast.danger(data.message || 'Failed to load discount settings');
      }
    } catch (err: any) {
      console.error('Failed to fetch discount settings:', err);
      toast.danger('Network error fetching discount settings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const hasChanges =
    settings.enabled !== initialSettings.enabled ||
    Number(settings.percent) !== Number(initialSettings.percent);

  // Save changes to API
  const handleSave = async () => {
    const numPercent = Number(settings.percent);
    if (isNaN(numPercent) || numPercent < 0 || numPercent > 100) {
      toast.danger('Please enter a valid discount percentage between 0 and 100');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(getApiUrl('/api/admin/discounts/universal'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          enabled: settings.enabled,
          percent: numPercent,
        }),
      });
      const data = await res.json();

      if (data.success && data.data) {
        setSettings(data.data);
        setInitialSettings(data.data);
        toast.success('Universal Discount Updated!', {
          description: `Applied ${data.data.percent}% storewide discount across the entire website and order management system.`,
        });
      } else {
        toast.danger(data.message || 'Failed to update discount settings');
      }
    } catch (err: any) {
      console.error('Failed to save discount settings:', err);
      toast.danger('Network error saving discount settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Preset percentage chips
  const presets = [0, 5, 7.5, 10, 12, 15, 20];

  // Simulator calculations
  const simEffectivePercent = settings.enabled ? Number(settings.percent) || 0 : 0;
  const simDiscountValue = Math.round((testAmount * simEffectivePercent) / 100);
  const simPayable = Math.max(0, testAmount - simDiscountValue);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-[#005d42] shrink-0 shadow-xs">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Discount Management
              </h1>
              {settings.enabled && settings.percent > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse">
                  Active ({settings.percent}%)
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  Paused / Inactive
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Control the universal storewide promotional discount applied across website checkout, cart, and POS manual orders.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchSettings}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
            title="Reload settings"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="px-5 py-2.5 rounded-xl bg-[#005d42] hover:bg-[#004e37] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Discount Policy</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Universal Discount Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Configuration Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-5 h-5 text-[#005d42]" />
                <h2 className="font-extrabold text-sm text-slate-900 tracking-tight">
                  Universal Storewide Discount Policy
                </h2>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {settings.updatedAt ? `Updated: ${new Date(settings.updatedAt).toLocaleDateString()}` : ''}
              </span>
            </div>

            {/* Enable/Disable Switch */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-xs text-slate-900 block flex items-center gap-2">
                  <Power className={`w-3.5 h-3.5 ${settings.enabled ? 'text-emerald-600' : 'text-slate-400'}`} />
                  Storewide Universal Discount Status
                </span>
                <p className="text-[11px] text-slate-500">
                  When enabled, this discount applies to all standard retail products that do not have their own individual promo prices.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSettings((prev) => ({ ...prev, enabled: !prev.enabled }))}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.enabled ? 'bg-[#005d42]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    settings.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Percentage Input & Quick Presets */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                Universal Discount Percentage (%)
              </label>

              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-xs">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={settings.percent}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        percent: Number(e.target.value),
                      }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-lg font-black font-mono text-slate-900 outline-none focus:ring-2 focus:ring-[#005d42] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold text-lg">
                    %
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {presets.map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setSettings((prev) => ({ ...prev, percent: pct }))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        Number(settings.percent) === pct
                          ? 'bg-[#005d42] text-white border-[#005d42] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                Enter any percentage between 0% and 100%. Decimal values like 7.5% are supported.
              </p>
            </div>

            {/* Live System Label Preview */}
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                System Computed Order Invoice Tag
              </span>
              <p className="font-mono font-bold text-sm text-[#005d42]">
                Website {settings.percent}% Universal Discount
              </p>
              <p className="text-[11px] text-slate-600">
                This exact text label will be attached to customer invoices, courier manifests, and payment audit logs.
              </p>
            </div>
          </div>

          {/* System Hierarchy & Multi-Tier Discount Architecture */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <ShieldAlert className="w-5 h-5 text-[#005d42]" />
              <h2 className="font-extrabold text-sm text-slate-900 tracking-tight">
                Discount Hierarchy & Non-Conflict Rules
              </h2>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="px-2 py-1 rounded-lg bg-emerald-600 text-white font-black text-xs shrink-0">
                  RULE 1
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Individual Product Promotional Discount (Dominant)
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    If an individual product has a promotional price configured in the product catalog (<code className="text-emerald-700 font-bold font-mono">sellingPrice &lt; mrpPrice</code>), that individual promo takes priority for that item.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="px-2 py-1 rounded-lg bg-blue-600 text-white font-black text-xs shrink-0">
                  RULE 2
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Universal Storewide Discount ({settings.percent}%)
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    For all other standard items without their own promotional discount, the dynamic universal discount of <strong className="text-blue-800">{settings.percent}%</strong> is automatically applied at checkout and manual order creation.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="px-2 py-1 rounded-lg bg-amber-600 text-white font-black text-xs shrink-0">
                  RULE 3
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Admin / Manager Custom Phone Rebate
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    During tele-sales calls or manual order confirmation, the admin can choose a custom BDT discount rebate. Once the order is confirmed, discounts are locked to prevent tampering.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Price Calculator & System Scope */}
        <div className="space-y-6">
          {/* Interactive Calculator Simulator */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Calculator className="w-5 h-5 text-[#005d42]" />
              <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
                Live Pricing Simulator
              </h3>
            </div>

            <p className="text-xs text-slate-500">
              Test how the updated {settings.percent}% universal discount affects order totals:
            </p>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-700">
                Sample Order Subtotal (BDT):
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  ৳
                </span>
                <input
                  type="number"
                  min={1}
                  value={testAmount}
                  onChange={(e) => setTestAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-sm font-bold font-mono outline-none focus:ring-2 focus:ring-[#005d42]"
                />
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-bold text-slate-800">৳{testAmount.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center text-emerald-700 font-medium">
                <span>
                  Universal Discount ({settings.enabled ? `${settings.percent}%` : 'Disabled'}):
                </span>
                <span className="font-mono font-bold">
                  -৳{simDiscountValue.toLocaleString()}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-slate-900 font-bold">
                <span>Payable Subtotal:</span>
                <span className="font-mono font-black text-base text-[#005d42]">
                  ৳{simPayable.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
              💡 <strong>Instant System Sync:</strong> When saved, this applies immediately across the Next.js Storefront, Express Backend validation, and Admin Order modals without requiring a restart.
            </div>
          </div>

          {/* Affected System Components Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Store className="w-5 h-5 text-[#005d42]" />
              <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
                System Coverage
              </h3>
            </div>

            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Online Storefront Checkout Page</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Customer Shopping Cart Drawer</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Admin Manual Order Taking Modal</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Order Management & Payment Settlement</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Express API Zero-Trust Price Engine</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

