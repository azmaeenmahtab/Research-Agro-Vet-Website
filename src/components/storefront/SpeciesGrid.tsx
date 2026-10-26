import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ImageIcon } from 'lucide-react';

interface SpeciesItem {
  id: string;
  tag: string;
  titleEn: string;
  titleBn: string;
  description: string;
  href: string;
  imageUrl?: string;
}

const speciesData: SpeciesItem[] = [
  {
    id: 'cattle',
    tag: 'গরু ও মহিষ',
    titleEn: 'Cattle & Buffalo Care',
    titleBn: 'ডেইরি ও গবাদিপশু চিকিৎসা',
    description: 'ডেইরি উৎপাদন, মোটাতাজাকরণ, মিল্ক ফিভার ও গর্ভধারণ সুরক্ষা সম্পূরক।',
    href: '/products?species=CATTLE_BUFFALO',
    imageUrl: '/images/cattle.jpg',
  },
  {
    id: 'poultry',
    tag: 'পোল্ট্রি ও হাঁস',
    titleEn: 'Poultry & Layer/Broiler',
    titleBn: 'পোল্ট্রি ও লেয়ার/ব্রয়লার কেয়ার',
    description: 'গ্রোথ প্রোমোটার, ডিম উৎপাদন বৃদ্ধি, শ্বাসকষ্টের ড্রপ ও ভ্যাকসিন সাপোর্ট।',
    href: '/products?species=POULTRY',
    imageUrl: '/images/poultry.jpg',
  },
  {
    id: 'goat',
    tag: 'ছাগল ও ভেড়া',
    titleEn: 'Goat & Sheep Care',
    titleBn: 'ছাগল ও ভেড়া স্বাস্থ্য সুরক্ষা',
    description: 'কৃমিনাশক বোলাস, পাতলা পায়খানা রোধক ও দ্রুত দৈহিক বৃদ্ধি সাপ্লিমেন্ট।',
    href: '/products?species=GOAT_SHEEP',
    imageUrl: '/images/goat_sheep.jpg',
  },
  {
    id: 'aqua',
    tag: 'মৎস্য ও একুয়া',
    titleEn: 'Fisheries & Aqua Care',
    titleBn: 'মৎস্য ও একুয়াকালচার পরিচর্যা',
    description: 'পুকুরের অ্যামোনিয়া গ্যাস রিমুভার, জিয়োলাইট ও পুষ্টিকর ফিশ প্রিমিক্স।',
    href: '/products?species=AQUA',
    imageUrl: '/images/fish.jpg',
  },
];

export default function SpeciesGrid() {
  return (
    <section className="py-12 bg-slate-50/60 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              প্রাণী ভিত্তিক ফিড প্রিমিক্স বাছাই করুন
            </h2>
          </div>
          
        </div>

        {/* 4-Card Animal Species Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {speciesData.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group flex flex-col p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 shadow-2xs hover:shadow-md transition-all justify-between"
            >
              <div>
                {/* Image Box */}
                <div className="relative h-44 w-full rounded-lg overflow-hidden bg-slate-100 mb-3.5 border border-slate-200/60">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.titleEn}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                      <ImageIcon className="w-6 h-6 stroke-[1.5] text-emerald-600/70 mb-1" />
                      <span className="text-[10px] font-medium text-slate-500">Image Placeholder</span>
                    </div>
                  )}

                  {/* Animal Tag Badge */}
                  {/* <span className="absolute top-2 left-2 bg-emerald-800 text-white text-[11px] font-bold px-2.5 py-0.5 rounded shadow-xs z-10">
                    {item.tag}
                  </span> */}
                </div>

                {/* Titles & Description */}
                {/* <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {item.titleEn}
                </h3> */}
                <p className="texr-[20px] font-semibold text-emerald-800 mt-0.5">
                  {item.titleBn}
                </p>
                <p className="text-sm text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>

              {/* Action Link Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-sm font-bold text-emerald-700 group-hover:text-emerald-800">
                <span>পণ্য তালিকা দেখুন</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
