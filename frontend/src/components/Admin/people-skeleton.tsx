'use client';

import React from 'react';
import { useAdminTheme } from '@/context/admin-theme-context';

interface PeopleSkeletonProps {
  count?: number;
  viewMode?: 'grid' | 'table';
}

export function PeopleSkeleton({ count = 6, viewMode = 'grid' }: PeopleSkeletonProps) {
  const { isDark } = useAdminTheme();

  if (viewMode === 'table') {
    return (
      <div
        className={`rounded-3xl border overflow-hidden animate-pulse ${
          isDark ? 'bg-[#181A20] border-white/[0.06]' : 'bg-white border-slate-200'
        }`}
      >
        <div className={`p-4 border-b ${isDark ? 'bg-[#14151B] border-white/[0.06]' : 'bg-slate-50 border-slate-100'}`}>
          <div className={`h-4 w-48 rounded-md ${isDark ? 'bg-white/[0.08]' : 'bg-slate-200'}`} />
        </div>
        <div className={`divide-y ${isDark ? 'divide-white/[0.04]' : 'divide-slate-100'}`}>
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl shrink-0 ${isDark ? 'bg-white/[0.06]' : 'bg-slate-200'}`} />
                <div className="space-y-1.5">
                  <div className={`h-4 w-32 rounded ${isDark ? 'bg-white/[0.08]' : 'bg-slate-200'}`} />
                  <div className={`h-3 w-24 rounded ${isDark ? 'bg-white/[0.04]' : 'bg-slate-100'}`} />
                </div>
              </div>
              <div className={`h-5 w-20 rounded-full hidden sm:block ${isDark ? 'bg-white/[0.06]' : 'bg-slate-200'}`} />
              <div className={`h-4 w-16 rounded hidden md:block ${isDark ? 'bg-white/[0.06]' : 'bg-slate-200'}`} />
              <div className={`h-4 w-24 rounded hidden lg:block ${isDark ? 'bg-white/[0.06]' : 'bg-slate-200'}`} />
              <div className="flex gap-2">
                <div className={`w-8 h-8 rounded-full ${isDark ? 'bg-white/[0.06]' : 'bg-slate-200'}`} />
                <div className={`w-8 h-8 rounded-full ${isDark ? 'bg-white/[0.06]' : 'bg-slate-200'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`rounded-3xl border p-5 sm:p-6 flex flex-col justify-between space-y-4 ${
            isDark ? 'bg-[#181A20] border-white/[0.06]' : 'bg-white border-slate-200'
          }`}
        >
          <div>
            {/* Top avatar & role skeleton */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3.5">
                <div className={`w-12 h-12 rounded-2xl shrink-0 ${isDark ? 'bg-white/[0.06]' : 'bg-slate-200'}`} />
                <div className="space-y-2">
                  <div className={`h-4 w-28 rounded-md ${isDark ? 'bg-white/[0.08]' : 'bg-slate-200'}`} />
                  <div className={`h-3 w-20 rounded ${isDark ? 'bg-white/[0.04]' : 'bg-slate-100'}`} />
                </div>
              </div>
              <div className={`h-6 w-20 rounded-full ${isDark ? 'bg-white/[0.06]' : 'bg-slate-200'}`} />
            </div>

            {/* Middle details skeleton */}
            <div className={`space-y-2.5 py-3 border-y my-3 ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
              <div className="flex items-center justify-between gap-2">
                <div className={`h-3.5 w-36 rounded ${isDark ? 'bg-white/[0.06]' : 'bg-slate-200'}`} />
                <div className={`h-3.5 w-14 rounded ${isDark ? 'bg-white/[0.04]' : 'bg-slate-100'}`} />
              </div>
              <div className="flex items-center justify-between">
                <div className={`h-3.5 w-16 rounded ${isDark ? 'bg-white/[0.06]' : 'bg-slate-200'}`} />
                <div className={`h-3.5 w-24 rounded ${isDark ? 'bg-white/[0.06]' : 'bg-slate-200'}`} />
              </div>
            </div>
          </div>

          {/* Bottom actions skeleton */}
          <div className="flex items-center justify-between pt-2 gap-2">
            <div className={`h-9 flex-1 rounded-full ${isDark ? 'bg-white/[0.06]' : 'bg-slate-200'}`} />
            <div className={`w-9 h-9 rounded-full shrink-0 ${isDark ? 'bg-white/[0.04]' : 'bg-slate-100'}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
