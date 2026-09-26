'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface WorkerOverviewChartProps {
  totalHours?: string;
  totalCompleted?: string;
  target?: string;
  currentMonth?: string;
  monthName?: string;
}

export function WorkerOverviewChart({
  totalHours = '0 Active',
  totalCompleted = '0 Orders',
  target = '10 Target',
  currentMonth,
  monthName,
}: WorkerOverviewChartProps) {
  const dynamicMonth =
    currentMonth || new Date().toLocaleString('en-US', { month: 'short' });
  const dynamicMonthFull =
    monthName || new Date().toLocaleString('en-US', { month: 'long' });
  const [selectedRange, setSelectedRange] = useState('Monthly');
  const [activeMonth, setActiveMonth] = useState(dynamicMonth);

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  return (
    <div className="w-full bg-[#5E42B4] rounded-[32px] sm:rounded-[36px] p-5 sm:p-6 text-white shadow-[0_20px_45px_rgba(94,66,180,0.32)] relative overflow-hidden flex flex-col justify-between select-none">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#FF5E88]/15 blur-3xl pointer-events-none" />

      {/* Top Row: Title & Range Selector */}
      <div className="flex items-center justify-between relative z-10 mb-4">
        <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
          Overview
        </h3>

        <div className="relative inline-block">
          <button
            type="button"
            onClick={() => setSelectedRange(selectedRange === 'Monthly' ? 'Weekly' : 'Monthly')}
            className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/20 border border-white/20 text-white text-[11px] font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer backdrop-blur-md"
          >
            <span>{selectedRange}</span>
            <ChevronDown className="w-3 h-3 text-white/80" />
          </button>
        </div>
      </div>

      {/* Center: Wavy Area Chart Canvas with Active Indicator */}
      <div className="relative w-full h-36 sm:h-40 my-2 z-10">
        {/* Active Tooltip Badge */}
        <div className="absolute left-[36%] sm:left-[37%] top-0 -translate-x-1/2 flex flex-col items-center z-20 pointer-events-none animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-[#1E1B4B]/95 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-xl shadow-xl flex flex-col items-center">
            <span className="text-xs font-black text-white leading-tight">
              {totalCompleted}
            </span>
            <span className="text-[9px] font-semibold text-pink-300 uppercase tracking-wider">
              Completed
            </span>
          </div>
          {/* Stem / Guide line connecting tooltip to pin point */}
          <div className="w-px h-6 bg-gradient-to-b from-white/40 to-transparent" />
        </div>

        {/* Wavy Chart SVG */}
        <svg
          viewBox="0 0 500 120"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF5E88" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#5E42B4" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#5E42B4" stopOpacity="0" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#FF5E88" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Area under curve */}
          <path
            d="M 0,95 Q 50,85 90,75 T 185,38 T 270,75 T 350,45 T 430,78 T 500,65 L 500,120 L 0,120 Z"
            fill="url(#chartGradient)"
          />

          {/* Glowing Wavy Line Stroke */}
          <path
            d="M 0,95 Q 50,85 90,75 T 185,38 T 270,75 T 350,45 T 430,78 T 500,65"
            fill="none"
            stroke="#FF5E88"
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="url(#glow)"
          />

          {/* Active Highlight Pin Dot on Apr */}
          <circle cx="185" cy="38" r="8" fill="#FF5E88" />
          <circle cx="185" cy="38" r="5" fill="#FFFFFF" />
        </svg>

        {/* Shaded vertical column beneath the active point */}
        <div className="absolute left-[37%] top-9 bottom-0 w-10 sm:w-12 -translate-x-1/2 bg-white/10 rounded-2xl pointer-events-none" />
      </div>

      {/* Horizontal Month Timeline Scale */}
      <div className="flex items-center justify-between text-[11px] font-semibold text-white/60 px-1 relative z-10 mb-4 overflow-x-auto scrollbar-none py-1">
        {months.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setActiveMonth(m)}
            className={`px-2.5 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap ${
              activeMonth === m
                ? 'bg-white text-[#5E42B4] font-extrabold shadow-sm scale-105'
                : 'hover:text-white'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Bottom Sculpted Metrics Row matching reference image */}
      <div className="relative z-10 grid grid-cols-3 items-end gap-2 pt-3 border-t border-white/15">
        {/* Left Column: Active Jobs */}
        <div className="flex flex-col items-center text-center">
          <span className="text-[10px] font-medium text-white/70 uppercase tracking-wider">
            Active Jobs
          </span>
          <span className="text-sm sm:text-base font-black text-white mt-0.5">
            {totalHours}
          </span>
          <span className="text-[10px] font-medium text-white/60 mt-0.5">
            {dynamicMonthFull}
          </span>
        </div>

        {/* Center Column: Total Completed with Elevated Pill Frame */}
        <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 flex flex-col items-center text-center shadow-lg -translate-y-1">
          <span className="text-[10px] font-medium text-white/80 uppercase tracking-wider">
            Completed Orders
          </span>
          <span className="text-base sm:text-lg font-black text-white tracking-tight mt-0.5">
            {totalCompleted}
          </span>
          <span className="text-[10px] font-semibold text-pink-200 mt-0.5">
            {dynamicMonthFull}
          </span>
        </div>

        {/* Right Column: Target */}
        <div className="flex flex-col items-center text-center">
          <span className="text-[10px] font-medium text-white/70 uppercase tracking-wider">
            Target
          </span>
          <span className="text-sm sm:text-base font-black text-white mt-0.5">
            {target}
          </span>
          <span className="text-[10px] font-medium text-white/60 mt-0.5">
            {dynamicMonthFull}
          </span>
        </div>
      </div>
    </div>
  );
}
