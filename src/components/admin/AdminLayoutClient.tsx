'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminAuthGuard from './AdminAuthGuard';

interface AdminLayoutClientProps {
  children: React.ReactNode;
}

export default function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const pathname = usePathname();

  // If on admin auth page (e.g. /admin/auth/login), render full screen without dashboard sidebar
  if (pathname?.startsWith('/admin/auth')) {
    return <main className="min-h-screen w-full">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] text-slate-900 flex flex-col font-sans">
      {/* Sidebar Navigation (Desktop fixed + Mobile slide-over) */}
      <AdminSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area: Takes full width for lg+ screens */}
      <div className="flex-1 min-w-0 flex flex-col lg:pl-64 xl:pl-72 transition-all duration-150">
        {/* <AdminHeader
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        /> */}
        <main className="flex-1 w-full px-4 sm:px-6 py-4 sm:py-5">
          <AdminAuthGuard>{children}</AdminAuthGuard>
        </main>
      </div>
    </div>
  );
}

