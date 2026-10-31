import React from 'react';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';

export const metadata = {
  title: 'Admin Dashboard — Research Agro Vet',
  description: 'Veterinary Product, Pricing, and Inventory Management System',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
