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
            লাইভস্টক, ডেইরি, পোল্ট্রি ও মৎস্য খামারীদের জন্য অনুমোদিত ভেটেরিনারি ঔষধ ও পুষ্টি সম্পূরক সরবরাহকারী।
          </p>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 text-emerald-400 rounded border border-slate-700 text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>DLS Reg: 126-18-(07)-006</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider">ক্যাটাগরি সমূহ</h4>
          <ul className="space-y-1.5">
            <li><Link href="/products?species=CATTLE_BUFFALO" className="hover:text-emerald-400 transition-colors">গরু ও মহিষ (Cattle)</Link></li>
            <li><Link href="/products?species=POULTRY" className="hover:text-emerald-400 transition-colors">পোল্ট্রি ও হাঁস (Poultry)</Link></li>
            <li><Link href="/products?species=GOAT_SHEEP" className="hover:text-emerald-400 transition-colors">ছাগল ও ভেড়া (Goat & Sheep)</Link></li>
            <li><Link href="/products?species=AQUA" className="hover:text-emerald-400 transition-colors">মৎস্য ও একুয়া (Fisheries)</Link></li>
            <li><Link href="/#dealer-contact" className="hover:text-amber-400 transition-colors">পাইকারি ও ডিলার যোগাযোগ</Link></li>
          </ul>
        </div>

        {/* Customer & Policies */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider">গ্রাহক সেবা ও পলিসি</h4>
          <ul className="space-y-1.5">
            <li><Link href="/track-order" className="hover:text-emerald-400 transition-colors">অর্ডার ট্র্যাকিং</Link></li>
            <li><Link href="/terms" className="hover:text-emerald-400 transition-colors">শর্তাবলী (Terms & Conditions)</Link></li>
            <li><Link href="/privacy" className="hover:text-emerald-400 transition-colors">প্রাইভেসি পলিসি (Privacy Policy)</Link></li>
            <li><Link href="/refund" className="hover:text-emerald-400 transition-colors">রিটার্ন ও রিফান্ড নীতি</Link></li>
          </ul>
        </div>

        {/* Contact info */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider">যোগাযোগ ও সহায়তা</h4>
          <div className="space-y-2 text-slate-400">
            <p className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>01711-234567 (সকাল ৮টা - রাত ১০টা)</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>support@researchagrovet.com</span>
            </p>
            <p className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>ঢাকা, বাংলাদেশ • ৬৪ জেলায় ক্যাশ অন ডেলিভারি</span>
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 py-4 px-4 text-center text-slate-500 text-[11px]">
        © 2026 Research Agro Vet. All rights reserved.
      </div>
    </footer>
  );
}
