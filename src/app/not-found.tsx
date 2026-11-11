import Navbar from '@/components/storefront/Navbar';
import CartDrawer from '@/components/storefront/CartDrawer';
import Footer from '@/components/storefront/Footer';
import { NotFoundContent } from '@/components/storefront/NotFoundContent';

export const metadata = {
  title: '৪০৪ • পৃষ্ঠাটি পাওয়া যায়নি | Research Agro Vet',
  description: 'দুঃখিত, আপনি যে পৃষ্ঠাটি খুঁজছেন তা সরানো হয়েছে অথবা ওয়েব লিংকটি সঠিক নয়।',
};

export default function RootNotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">
      <Navbar />
      <CartDrawer />
      <main className="flex-1 flex flex-col">
        <NotFoundContent />
      </main>
      <Footer />
    </div>
  );
}
