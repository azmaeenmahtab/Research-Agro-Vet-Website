'use client';

import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

interface AdminLayoutClientProps {
  children: React.ReactNode;
}

export default function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
          {children}
        </main>
      </div>
    </div>
  );
}

