import { Suspense } from 'react';
import TopBanner from '@/components/storefront/TopBanner';
import Navbar from '@/components/storefront/Navbar';
import SpeciesNav from '@/components/storefront/SpeciesNav';
import CartDrawer from '@/components/storefront/CartDrawer';
import Footer from '@/components/storefront/Footer';

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">
      <TopBanner />
      <Navbar />
      <Suspense fallback={<div className="h-8 bg-slate-50 border-b border-slate-200" />}>
        <SpeciesNav />
      </Suspense>
      <CartDrawer />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
