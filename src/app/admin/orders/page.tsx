import React from 'react';
import OrderManagementDashboard from '@/components/admin/orders/OrderManagementDashboard';

export const metadata = {
  title: 'Live Orders & Invoicing — Research Agro Vet Admin',
  description: 'Real-time veterinary order management, tele-confirmation, and courier dispatch control.',
};

export default function AdminOrdersPage() {
  return <OrderManagementDashboard />;
}

