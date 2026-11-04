'use client';

import { useEffect } from 'react';
import { toast as heroToast } from '@heroui/react';

export interface ToastState {
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AdminToastProps {
  toast: ToastState | null;
  onClose?: () => void;
}

export default function AdminToast({ toast, onClose }: AdminToastProps) {
  useEffect(() => {
    if (!toast) return;
    if (toast.type === 'success') {
      heroToast.success(toast.message);
    } else if (toast.type === 'error') {
      heroToast.danger(toast.message);
    } else {
      heroToast.info(toast.message);
    }
    if (onClose) onClose();
  }, [toast, onClose]);

  return null;
}
