'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, RefreshCw, Zap, Bell } from 'lucide-react';

interface OrderLiveTickerProps {
  pendingCount: number;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function OrderLiveTicker({
  pendingCount,
  onRefresh,
  isRefreshing,
}: OrderLiveTickerProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [countdown, setCountdown] = useState(15);
  const onRefreshRef = React.useRef(onRefresh);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  // Countdown timer decrement
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Trigger auto-refresh safely when countdown hits 0
  useEffect(() => {
    if (countdown === 0) {
      onRefreshRef.current();
      setCountdown(15);
    }
  }, [countdown]);

  return (
    <div className="w-full bg-[#005d42] text-white px-4 sm:px-6 py-2.5 rounded-2xl shadow-xs transition-all">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        {/* Left: Pending Alert Indicator */}
        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
          <span className="text-amber-300 font-bold tracking-wide uppercase flex items-center gap-1">
            <Bell className="w-4 h-4 text-amber-300 inline" />
            LIVE ORDER MONITOR:
          </span>
          <span className="bg-emerald-800/80 text-white px-2.5 py-0.5 rounded-lg font-bold border border-emerald-700/60 text-xs">
            {pendingCount > 0
              ? `${pendingCount} new pending order${pendingCount > 1 ? 's' : ''} waiting!`
              : 'All orders up to date'}
          </span>
        </div>

        {/* Right: Sound Alert & Auto-Refresh Controls */}
        <div className="flex items-center gap-3 text-xs">
          {/* <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-900/60 hover:bg-emerald-900 text-emerald-100 hover:text-white transition-colors border border-emerald-700/50"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Sound Alert: <strong className="text-emerald-300 font-bold">ON</strong></span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-300" />
                <span>Sound Alert: <strong className="text-slate-300">OFF</strong></span>
              </>
            )}
          </button> */}

          <span className="text-emerald-300/40 hidden md:inline">|</span>

          <button
            type="button"
            onClick={() => {
              onRefresh();
              setCountdown(15);
            }}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-900/60 hover:bg-emerald-900 text-emerald-100 hover:text-white transition-colors border border-emerald-700/50 disabled:opacity-50"
            title="Click to refresh now"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-300' : ''}`} />
            <span>Auto-Refresh: <strong>{countdown}s</strong></span>
          </button>

          
        </div>
      </div>
    </div>
  );
}

