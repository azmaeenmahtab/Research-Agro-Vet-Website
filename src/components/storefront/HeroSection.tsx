import Link from 'next/link';
import { ShieldCheck, Truck, Snowflake, ArrowRight, MessageCircle, ImageIcon, CheckCircle2 } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-b from-slate-50 via-emerald-50/30 to-slate-50 border-b border-slate-200 overflow-hidden py-10 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Value Proposition & CTAs */}
        <div className="lg:col-span-7 space-y-5">

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.25]">
            গবাদিপশু ও পোল্ট্রির শতভাগ আসল ও অনুমোদিত{' '}
            <span className="text-emerald-700  decoration-emerald-300 decoration-4 underline-offset-4">
              Medicated খাদ্য প্রি-মিক্স
            </span>
          </h1>

          {/* Government Approval Banner */}
          <div className="inline-flex items-center gap-3 bg-emerald-900 text-white px-5 py-2.5 rounded-lg shadow-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-300 shrink-0" />
            <span className=" font-semibold">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার অনুমোদিত প্রস্তুতকারক</span>
            {/* <span className="text-sm text-amber-300 font-bold border-l border-emerald-700 pl-3">DLS Reg. 126</span> */}
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
            সরাসরি অনুমোদিত প্রস্তুতকারক থেকে নিয়ন্ত্রিত কোল্ড-চেইনে সংরক্ষিত প্রিমিয়াম কোয়ালিটি ফিড প্রিমিক্স, মিল্ক বুস্টার, গ্রোথ সাপ্লিমেন্ট ও মিনারেল।
          </p>

          {/* Trust Badges */}
          {/* <div className="flex flex-wrap gap-2.5 pt-1 text-xs text-slate-700">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-2xs font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              DLS লাইসেন্সকৃত ডিলার: 126
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-2xs font-medium">
              <Truck className="w-4 h-4 text-emerald-600" />
              সারা বাংলাদেশে ক্যাশ অন ডেলিভারি
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-2xs font-medium">
              <Snowflake className="w-4 h-4 text-emerald-600" />
              কোল্ড-চেইন (২°C - ৮°C) সংরক্ষিত
            </span>
          </div> */}

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-bold transition-all shadow-xs"
            >
              <span>সকল প্রিমিক্স দেখুন</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="https://wa.me/8801716019731?text=আসসালামু%20আলাইকুম,%20ফিড%20প্রিমিক্স%20ও%20খামার%20পরামর্শের%20জন্য%20যোগাযোগ%20করছি।"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition-all shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>হোয়াটসঅ্যাপে পরামর্শ নিন</span>
            </a>
          </div>
        </div>

        {/* Right Column: Visual Showcase Placeholder & Bento Stats */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Visual Image Placeholder */}
          <div className="relative w-full h-72 sm:h-80 rounded-2xl border-2 border-dashed border-emerald-200/80 bg-white p-4 shadow-sm flex flex-col justify-between overflow-hidden">
            <div className="h-full w-full rounded-xl bg-gradient-to-br from-emerald-50 via-slate-50 to-slate-100 flex flex-col items-center justify-center text-center p-6 border border-slate-200/60">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 mb-2">
                <ImageIcon className="w-6 h-6 stroke-[1.75]" />
              </div>
              <p className="text-xs font-bold text-slate-700">হিরো ব্যানার ইমেজ প্লেসহোল্ডার</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                ক্লাউডিনারি / ImgBB থেকে আপলোডকৃত ব্যানারের জন্য সংরক্ষিত
              </p>
            </div>

            {/* Cold Chain Badge overlay */}
            {/* <div className="absolute bottom-6 left-6 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900/85 backdrop-blur-xs text-white rounded-lg text-[11px] font-semibold">
              <Snowflake className="w-3.5 h-3.5 text-emerald-400" />
              <span>কোল্ড-চেইন নিয়ন্ত্রিত ওয়্যারহাউস (২°C - ৮°C)</span>
            </div> */}
          </div>

          {/* Quick Metrics Trio */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="block text-base font-extrabold text-emerald-700">১০০%</span>
              <span className="text-[11px] text-slate-500 font-medium">জেনুইন প্রিমিক্স</span>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="block text-base font-extrabold text-emerald-700">৬৪ জেলা</span>
              <span className="text-[11px] text-slate-500 font-medium">হোম ডেলিভারি</span>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="block text-base font-extrabold text-emerald-700">২৪/৭</span>
              <span className="text-[11px] text-slate-500 font-medium">টেলি-পরামর্শ</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
