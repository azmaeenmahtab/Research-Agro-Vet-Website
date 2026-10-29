import TopBanner from '@/components/storefront/TopBanner';
import Navbar from '@/components/storefront/Navbar';
import CartDrawer from '@/components/storefront/CartDrawer';
import Footer from '@/components/storefront/Footer';

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">
      {/* <TopBanner /> */}
      <Navbar />
      <CartDrawer />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
