import React from 'react';
import AdminNavbar from '@/components/admin/AdminNavbar';

export const metadata = {
  title: 'Admin Dashboard — Research Agro Vet',
  description: 'Veterinary Product, Pricing, and Inventory Management System',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8f9ff] text-slate-900 flex flex-col font-sans">
      <AdminNavbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
