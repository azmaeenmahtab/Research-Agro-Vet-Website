import React from 'react';
import ProductManagementDashboard from '@/components/admin/ProductManagementDashboard';

export const metadata = {
  title: 'Products & Pricing Control — Research Agro Vet Admin',
  description: 'Manage veterinary medicines, pack sizes, wholesale TP, retail MRP, and clinical disease data.',
};

export default function AdminProductsPage() {
  return <ProductManagementDashboard />;
}
