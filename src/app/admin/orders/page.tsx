import React, { Suspense } from 'react';
import OrderManagementDashboard from '@/components/admin/orders/OrderManagementDashboard';

export const metadata = {
  title: 'Live Orders & Invoicing — Research Agro Vet Admin',
  description: 'Real-time veterinary order management, tele-confirmation, and courier dispatch control.',
};

export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OrderManagementDashboard />
    </Suspense>
  );
}
