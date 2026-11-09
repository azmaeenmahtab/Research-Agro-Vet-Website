import React from 'react';
import DiscountManagementDashboard from '@/components/admin/DiscountManagementDashboard';

export const metadata = {
  title: 'Discount Policies — Research Agro Vet Admin',
  description: 'Control universal storewide promotional discount and pricing rules.',
};

export default function AdminDiscountsPage() {
  return <DiscountManagementDashboard />;
}
