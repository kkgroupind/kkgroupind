'use client';

import React from 'react';
import { Shield, Sparkles } from 'lucide-react';

export interface OfficeStaffLoadingScreenProps {
  title?: string;
  subtitle?: string;
  statusText?: string;
  fullScreen?: boolean;
}

export function OfficeStaffLoadingScreen({
  title = 'Connecting Operations Desk...',
  subtitle = 'കേരള ഓപ്പറേഷൻസ് ഡെസ്ക് • സുരക്ഷിത പോർട്ടൽ',
  statusText = 'Verifying credentials & session...',
  fullScreen = true,
}: OfficeStaffLoadingScreenProps) {
  return (
    <div
      className={`relative overflow-hidden flex flex-col items-center justify-center p-4 select-none ${
        fullScreen ? 'min-h-screen w-full bg-[#ABD2FA]' : 'w-full py-16'
      }`}
    >
      {/* Ambient background glow orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#7692FF]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-[#1B2CC1]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Glassmorphic Center Card */}
      <div className="relative z-10 w-full max-w-sm bg-white/95 backdrop-blur-2xl border border-white/80 rounded-3xl p-8 shadow-[0_24px_60px_rgba(9,21,64,0.16)] flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Top vibrant brand bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7692FF] via-[#1B2CC1] to-[#7692FF]" />

        {/* Central Animated Emblem */}
        <div className="relative mb-5 flex items-center justify-center">
          {/* Pulsing halo */}
          <div className="absolute -inset-2 bg-gradient-to-tr from-[#1B2CC1]/25 to-[#7692FF]/25 rounded-3xl blur-lg animate-pulse" />

          {/* Rotating outer orbit indicator */}
          <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-[#1B2CC1]/40 animate-spin [animation-duration:8s] flex items-center justify-center" />

          {/* Core Emblem Badge */}
          <div className="absolute w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1B2CC1] to-[#091540] flex items-center justify-center shadow-lg shadow-[#1B2CC1]/30">
            <Shield className="w-7 h-7 text-[#ABD2FA]" />
          </div>
        </div>

        {/* Brand Kicker */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1B2CC1]/10 border border-[#1B2CC1]/20 text-[10px] font-extrabold uppercase tracking-widest text-[#1B2CC1] mb-2">
          <Sparkles className="w-3 h-3 text-[#1B2CC1]" />
          <span>KK GROUP • OPERATIONS</span>
        </div>

        {/* Headline */}
        <h2 className="text-base font-bold text-[#091540] tracking-tight">
          {title}
        </h2>

        {/* Malayalam Regional Subtitle */}
        <p className="text-xs text-slate-500 mt-1 font-normal leading-relaxed">
          {subtitle}
        </p>

        {/* Animated Shimmer Loading Track */}
        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-6 overflow-hidden relative border border-slate-200/60">
          <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-[#1B2CC1] via-[#7692FF] to-[#1B2CC1] animate-[progress_1.8s_ease-in-out_infinite]" />
        </div>

        {/* Live Status Pill */}
        <div className="mt-5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-600 shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="truncate">{statusText}</span>
        </div>
      </div>
    </div>
  );
}
