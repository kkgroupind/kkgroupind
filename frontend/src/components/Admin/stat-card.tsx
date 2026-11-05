'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight, type LucideIcon } from 'lucide-react';
import { useAdminTheme } from '@/context/admin-theme-context';

export interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  trendDirection?: 'up' | 'down';
  timeframe?: string;
  prefixSymbol?: string;
  prefixColor?: string;
  icon?: LucideIcon;
  subtitle?: string;
  iconColor?: string;
}

export function StatCard({
  title,
  value,
  trend,
  trendDirection = 'up',
  timeframe,
  prefixSymbol,
  prefixColor = 'text-[#FF6442]',
  subtitle,
}: StatCardProps) {
  const { isDark } = useAdminTheme();

  const isUp = trendDirection === 'up' || (trend ? !trend.startsWith('-') : true);

  return (
    <div
      className={`p-5 sm:p-6 rounded-[28px] border transition-all duration-200 flex flex-col justify-between group hover:scale-[1.01] ${
        isDark
          ? 'bg-[#12141A] hover:bg-[#161922] border-white/[0.06] hover:border-white/[0.12] shadow-sm'
          : 'bg-white hover:bg-slate-50/90 border-slate-200 hover:border-slate-300 shadow-xs'
      }`}
    >
      {/* Top Row: Metric Title on Left, Trend Badge on Right */}
      <div className="flex justify-between items-center gap-2">
        <h3
          className={`font-semibold text-xs sm:text-sm line-clamp-1 ${
            isDark ? 'text-zinc-400' : 'text-slate-700 font-bold'
          }`}
        >
          {title}
        </h3>

        {trend && (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border shrink-0 ${
              isUp
                ? isDark
                  ? 'bg-[#6366F1]/15 text-[#818cf8] border-[#6366F1]/30'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : isDark
                ? 'bg-rose-500/15 text-rose-300 border-rose-500/25'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {isUp ? (
              <ArrowUpRight className="w-3 h-3 shrink-0" />
            ) : (
              <ArrowDownRight className="w-3 h-3 shrink-0" />
            )}
            <span>{trend}</span>
          </span>
        )}
      </div>

      {/* Middle Row: Large High-Contrast Value */}
      <div className="mt-4 mb-2">
        <div className="flex items-baseline gap-2 flex-wrap">
          {prefixSymbol && (
            <span
              className={`text-xl sm:text-2xl font-black ${
                isDark ? prefixColor : 'text-[#FF6442]'
              }`}
            >
              {prefixSymbol}
            </span>
          )}
          <h2
            className={`text-2xl sm:text-3xl font-black tracking-tight leading-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {value}
          </h2>
        </div>
      </div>

      {/* Bottom Row: Muted Timeframe Caption */}
      <div className="mt-1">
        <p
          className={`text-[11px] font-medium truncate ${
            isDark ? 'text-zinc-500' : 'text-slate-600 font-semibold'
          }`}
        >
          {subtitle || timeframe}
        </p>
      </div>
    </div>
  );
}
