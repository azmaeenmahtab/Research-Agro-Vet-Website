import React from 'react';
import CategoryManagementDashboard from '@/components/admin/CategoryManagementDashboard';

export const metadata = {
  title: 'Therapeutic Categories — Research Agro Vet Admin',
  description: 'Manage veterinary categories and product classifications.',
};

export default function AdminCategoriesPage() {
  return <CategoryManagementDashboard />;
}
