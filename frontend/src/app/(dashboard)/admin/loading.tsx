'use client';

import React from 'react';
import { useAdminTheme } from '@/context/admin-theme-context';
import { PeopleSkeleton } from '@/components/Admin/people-skeleton';

export default function AdminLoading() {
  const { isDark } = useAdminTheme();

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl ${isDark ? 'bg-[#12141A]' : 'bg-slate-200'}`} />
            <div className={`h-7 w-48 rounded-xl ${isDark ? 'bg-[#12141A]' : 'bg-slate-200'}`} />
          </div>
          <div className={`h-4 w-64 rounded-lg ${isDark ? 'bg-white/[0.04]' : 'bg-slate-100'}`} />
        </div>
        <div className="flex gap-2">
          <div className={`h-9 w-24 rounded-full ${isDark ? 'bg-[#12141A]' : 'bg-slate-200'}`} />
          <div className={`h-9 w-32 rounded-full ${isDark ? 'bg-[#12141A]' : 'bg-slate-200'}`} />
        </div>
      </div>

      {/* Search & Filter Bar skeleton */}
      <div className={`flex items-center justify-between gap-4 p-4 rounded-[28px] border ${
        isDark ? 'bg-[#12141A] border-white/[0.06]' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className={`h-9 w-full max-w-md rounded-full ${isDark ? 'bg-[#161922]' : 'bg-slate-100'}`} />
        <div className="flex gap-2">
          <div className={`h-9 w-16 rounded-full hidden sm:block ${isDark ? 'bg-white/[0.04]' : 'bg-slate-100'}`} />
          <div className={`h-9 w-20 rounded-full ${isDark ? 'bg-[#161922]' : 'bg-slate-200'}`} />
        </div>
      </div>

      {/* Cards Grid skeleton */}
      <PeopleSkeleton count={6} viewMode="grid" />
    </div>
  );
}
