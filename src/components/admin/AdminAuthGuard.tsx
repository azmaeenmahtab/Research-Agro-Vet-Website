'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import { ShieldAlert, Lock, ArrowRight, Loader2 } from 'lucide-react';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

/**
 * AdminAuthGuard Component
 * 
 * Verifies that the client session is authenticated and possesses the 'admin' role.
 * Displays a clean loading state or an Access Denied Error Boundary if unauthorized.
 */
export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const { data: session, isPending, error } = useSession();

  if (isPending) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#005d42]" />
        <p className="text-sm font-semibold text-slate-600">
          Verifying administrative credentials...
        </p>
      </div>
    );
  }

  const rawSession = session as any;
  const role = (rawSession?.user?.role || '').toLowerCase();
  const isAdmin = Boolean(rawSession?.user) && role === 'admin';

  if (!isAdmin || error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200/90 shadow-xl p-6 sm:p-8 text-center space-y-5 animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-slate-900">
              Access Restricted
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              You must be signed in with an active <span className="font-bold text-slate-700">Administrator</span> account to access the Research Agro Vet Control Center.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/admin/auth/login"
              className="w-full py-3 px-4 bg-[#005d42] hover:bg-emerald-800 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <Lock className="w-4 h-4" />
              <span>Sign In as Admin</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
