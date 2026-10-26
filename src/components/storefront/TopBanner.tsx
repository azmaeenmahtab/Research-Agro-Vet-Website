import { BadgePercent, Phone, ShieldCheck } from 'lucide-react';

const TickerItem = () => (
  <div className="flex items-center gap-12 sm:gap-20 px-8 shrink-0">
    {/* 1. Discount */}
    <div className="flex items-center gap-2">
      <BadgePercent className="w-3.5 h-3.5 text-amber-300 shrink-0" />
      <span>বিশেষ অফার: সকল ফিড প্রিমিক্স ও পণ্যে চলছে <strong>৫% সার্বজনীন ছাড়!</strong></span>
    </div>

    {/* 2. Helpline */}
    <a href="tel:01711234567" className="flex items-center gap-1.5 hover:text-white transition-colors">
      <Phone className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
      <span>হেল্পলাইন: <strong>01716-019731</strong> (সকাল ৮টা - রাত ১০টা)</span>
    </a>

    {/* 3. Licensed Dealer */}
    <div className="flex items-center gap-1.5 bg-emerald-900/60 text-emerald-200 px-2.5 py-0.5 rounded text-[11px]">
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
      <span>DLS অনুমোদিত ডিলার: Reg. No. - 126</span>
    </div>
  </div>
);

export default function TopBanner() {
  return (
    <aside aria-label="Announcement ticker" className="bg-emerald-800 text-white text-xs py-1.5 overflow-hidden select-none border-b border-emerald-900/50 w-full relative">
      <style>{`
        @keyframes tickerScroll {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .ticker-track {
          display: flex;
          width: max-content;
          will-change: transform;
          animation: tickerScroll 50s linear infinite;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="ticker-track">
        <div className="flex shrink-0">
          <TickerItem />
          <TickerItem />
        </div>
        <div className="flex shrink-0">
          <TickerItem />
          <TickerItem />
        </div>
      </div>
    </aside>
  );
}
