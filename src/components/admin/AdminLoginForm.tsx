'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Loader2,
  Building2,
  HelpCircle,
  KeyRound,
} from 'lucide-react';
import { toast } from '@heroui/react';
import { authClient } from '@/lib/auth-client';

export default function AdminLoginForm() {
  const router = useRouter();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your administrator email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await authClient.signIn.email({
        email: cleanEmail,
        password: password,
      });

      if (res.error) {
        throw new Error(res.error.message || 'Invalid administrator credentials');
      }

      toast.success('Authentication successful! Welcome to Admin Portal.');
      
      // Navigate to original destination or admin orders dashboard
      const params = new URLSearchParams(window.location.search);
      const destination = params.get('from') || '/admin/orders';
      window.location.href = destination;
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
      toast.danger('Login failed', {
        description: err.message || 'Invalid credentials or administrative session expired.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Demo credential quick-fill
  const handleQuickFill = () => {
    setEmail('admin@researchagrovet.com');
    setPassword('Admin@2026!');
    setErrorMessage(null);
    toast.success('Demo credentials loaded');
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-900 text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* ─── Right Form Panel ─────────────────────────────────────────────── */}
      <div className="w-full flex items-center justify-center p-6 sm:p-10 md:p-14 bg-slate-50 relative overflow-y-auto">
        <div className="w-full max-w-md space-y-8 my-auto">
          {/* Form Header Card */}
          <div className="bg-white p-8 sm:p-9 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 space-y-6">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Image
                  src="/images/logo.png"
                  alt="Research Agro Vet Logo"
                  width={70}
                  height={60}
                  className="object-contain"
                  priority
                />
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Administrator Sign In
                  </h2>
                </div>
              </div>
            </div>

            {/* Error Notification Banner */}
            {errorMessage && (
              <div
                role="alert"
                className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in slide-in-from-top-1 duration-200"
              >
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium leading-relaxed">
                  {errorMessage}
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Address */}
              <div className="space-y-1.5">
                <label
                  htmlFor="admin-email"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  Admin Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="admin@researchagrovet.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005d42]/30 focus:border-[#005d42] transition-all text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="admin-password"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowHelpModal(true)}
                    className="text-xs font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005d42]/30 focus:border-[#005d42] transition-all text-slate-900 placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Options: Remember Me & Security Status */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#005d42] focus:ring-[#005d42] border-slate-300"
                  />
                  Remember this terminal
                </label>
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                  <KeyRound className="w-3 h-3 text-emerald-600" /> TLS 1.3
                </span>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-[#005d42] hover:bg-[#004e37] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/15 transition-all duration-150 disabled:opacity-60 cursor-pointer active:scale-[0.99]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      Sign In to Admin Dashboard
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Quick Demo Fill Pill (For local testing & development) */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Development Mode</span>
              <button
                type="button"
                onClick={handleQuickFill}
                className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>⚡ Fill Demo Login</span>
              </button>
            </div>
          </div>

          {/* Public Storefront Link & Support Footer */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 hover:text-emerald-700 font-medium transition-colors"
            >
              <Building2 className="w-3.5 h-3.5" />
              Return to Website Storefront
            </Link>
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Help & Support
            </button>
          </div>
        </div>
      </div>

      {/* ─── Help / Credentials Recovery Modal ─────────────────────────────── */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150 text-slate-800">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <ShieldCheck className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-base text-slate-900">
                Administrator Access Support
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                For security reasons, password resets are restricted to authorized IT operations personnel.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-slate-700">
              <div className="font-semibold text-slate-900">Research Agro Vet IT Support:</div>
              <div className="space-y-1 font-mono text-[11px] text-slate-600">
                <div>✉️ it-support@researchagrovet.com</div>
                <div>📞 +880 1716-019731</div>
                <div>🕒 Sat–Thu: 9:00 AM – 6:00 PM (Dhaka)</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Close Window
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

