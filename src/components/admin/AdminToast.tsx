'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastState {
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AdminToastProps {
  toast: ToastState | null;
  onClose: () => void;
}

export default function AdminToast({ toast, onClose }: AdminToastProps) {
  if (!toast) return null;

  const bgConfig = {
    success: 'bg-[#005d42] text-white border-emerald-600',
    error: 'bg-red-700 text-white border-red-800',
    info: 'bg-slate-900 text-white border-slate-800',
  }[toast.type];

  const Icon = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  }[toast.type];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border animate-in slide-in-from-bottom-5 duration-200 transition-all text-sm font-medium ${bgConfig}">
      <Icon className="w-5 h-5 shrink-0" />
      <span>{toast.message}</span>
      <button
        onClick={onClose}
        className="p-1 hover:bg-white/20 rounded-md transition-colors ml-2"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
