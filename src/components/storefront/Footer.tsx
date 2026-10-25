import Link from 'next/link';
import { Phone, Mail, MapPin, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand & Regulatory */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base text-white">Research Agro Vet</span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            Authorized distributor of veterinary pharmaceuticals, vaccines, and animal nutrition supplements for livestock, dairy, poultry, and aquaculture farming in Bangladesh.
          </p>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 text-emerald-400 rounded border border-slate-700 text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>DLS Reg: 126-18-(07)-006</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider">Categories</h4>
          <ul className="space-y-1.5">
            <li><Link href="/products?species=CATTLE_BUFFALO" className="hover:text-emerald-400 transition-colors">Cattle & Buffalo</Link></li>
            <li><Link href="/products?species=POULTRY" className="hover:text-emerald-400 transition-colors">Poultry & Birds</Link></li>
            <li><Link href="/products?species=GOAT_SHEEP" className="hover:text-emerald-400 transition-colors">Goat & Sheep</Link></li>
            <li><Link href="/products?species=AQUA" className="hover:text-emerald-400 transition-colors">Fisheries & Aqua</Link></li>
            <li><Link href="/#dealer-contact" className="hover:text-amber-400 transition-colors">Wholesale & Dealership</Link></li>
          </ul>
        </div>

        {/* Customer & Policies */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider">Customer Care & Policies</h4>
          <ul className="space-y-1.5">
            <li><Link href="/track-order" className="hover:text-emerald-400 transition-colors">Track Order</Link></li>
            <li><Link href="/terms" className="hover:text-emerald-400 transition-colors">Terms & Conditions</Link></li>
            <li><Link href="/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
            <li><Link href="/refund" className="hover:text-emerald-400 transition-colors">Refund & Return Policy</Link></li>
          </ul>
        </div>

        {/* Contact info */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider">Contact & Support</h4>
          <div className="space-y-2 text-slate-400">
            <p className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>01711-234567 (8:00 AM - 10:00 PM)</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>support@researchagrovet.com</span>
            </p>
            <p className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Dhaka, Bangladesh • Cash on Delivery in 64 Districts</span>
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 py-4 px-4 text-center text-slate-500 text-[11px]">
        © 2026 Research Agro Vet. All rights reserved. Powered by Clinical Agro-Commerce.
      </div>
    </footer>
  );
}
