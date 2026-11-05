'use client';

import React, { useState, useEffect } from 'react';
import NextLink from 'next/link';
import Image from 'next/image';
import {
  Search,
  Bell,
  Settings,
  Maximize,
  Minimize,
  Menu,
  Sun,
  Moon,
  Mic,
  Download,
  Plus,
  Users,
  Hexagon,
  Sparkles,
} from 'lucide-react';
import { PwaInstallButton } from '@/components/PwaInstall';
import { useAdminTheme } from '@/context/admin-theme-context';
import { useAuth } from '@/context/auth-context';

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toggleTheme, isDark } = useAdminTheme();
  const { user } = useAuth();

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if ((document.documentElement as any).webkitRequestFullscreen) {
          await (document.documentElement as any).webkitRequestFullscreen();
        } else if ((document.documentElement as any).msRequestFullscreen) {
          await (document.documentElement as any).msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Unable to toggle fullscreen mode:', err);
    }
  };

  const handleExportXls = () => {
    // Standard CSV / Excel export generator for operational records
    const headers = ['ID', 'Type', 'Status', 'Timestamp'];
    const rows = [
      ['JOB-101', 'Direct Entry', 'COMPLETED', new Date().toISOString()],
      ['JOB-102', 'Work Order', 'IN_PROGRESS', new Date().toISOString()],
      ['JOB-103', 'Enquiry', 'PENDING', new Date().toISOString()],
    ];
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `KK_Group_Operations_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const displayName = user?.name || user?.username || 'Super Admin';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header
      className={`h-20 flex items-center justify-between px-4 lg:px-8 border-b shrink-0 transition-colors duration-200 z-20 select-none ${
        isDark
          ? 'bg-[#0A0B0E] border-white/[0.06] text-gray-200'
          : 'bg-white border-slate-200 text-slate-900 shadow-xs'
      }`}
    >
      {/* 1. Left Section: Mobile Menu + Geometric Cube Brand Mark (KK GROUP™ / ORBITAL™) */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className={`lg:hidden p-2.5 transition-colors rounded-2xl border ${
            isDark
              ? 'text-gray-400 hover:text-white bg-[#12141A] border-white/[0.08]'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100 border-slate-200'
          }`}
          aria-label="Toggle Mobile Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* ORBITAL / KK GROUP Geometric Logo Mark */}
        <NextLink href="/admin/dashboard" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center">
            {/* Hexagon/Cube graphic */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6366F1] to-[#06B6D4] p-[1.5px] shadow-sm flex items-center justify-center transition-transform group-hover:scale-105">
              <div
                className={`w-full h-full rounded-[10px] flex items-center justify-center ${
                  isDark ? 'bg-[#0A0B0E]' : 'bg-white'
                }`}
              >
                <div className="w-3.5 h-3.5 border-2 border-[#6366F1] rotate-45 rounded-xs" />
              </div>
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className={`font-black text-lg tracking-tight uppercase ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              KK GROUP
            </span>
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">
              ™
            </span>
          </div>
        </NextLink>

        {/* Dual Mode Switcher Pill (ORBITAL Spec: [Moon / Sun] toggle) */}
        <div className="hidden sm:flex items-center ml-2">
          <button
            onClick={toggleTheme}
            type="button"
            className={`flex items-center gap-1.5 p-1 rounded-full border transition-all cursor-pointer ${
              isDark
                ? 'bg-[#12141A] border-white/[0.08]'
                : 'bg-slate-100 border-slate-200'
            }`}
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            <div
              className={`p-1.5 rounded-full transition-all ${
                isDark
                  ? 'bg-[#6366F1] text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
            </div>
            <div
              className={`p-1.5 rounded-full transition-all ${
                !isDark
                  ? 'bg-white text-amber-500 shadow-xs'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>

        {/* Crew Roster Quick Access */}
        <div className="hidden md:flex items-center -space-x-1.5 ml-2">
          <NextLink
            href="/admin/people/workers"
            title="Add or Manage Workforce"
            className="w-7 h-7 rounded-full bg-[#6366F1] text-white text-xs font-bold flex items-center justify-center border-2 border-[#0A0B0E] hover:scale-105 transition-transform shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
          </NextLink>
        </div>
      </div>

      {/* 2. Middle Section: Floating Pill Search Bar with Mic Icon (ORBITAL Spec) */}
      <div className="flex-1 max-w-md mx-4 lg:mx-8 hidden sm:block">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type here to start searching..."
            className={`w-full pl-11 pr-11 py-2.5 rounded-full text-xs font-medium transition-all focus:outline-none ${
              isDark
                ? 'bg-[#12141A] border border-white/[0.08] text-gray-200 placeholder-gray-500 focus:border-[#6366F1]/70 focus:ring-2 focus:ring-[#6366F1]/20'
                : 'bg-slate-100 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20'
            }`}
          />
          <button
            type="button"
            className="absolute right-3.5 p-1 text-gray-400 hover:text-white transition-colors"
            title="Voice Search"
          >
            <Mic className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Right Section: Notification, Export Data .Xls Pill, Fullscreen, PWA */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Export Data .Xls Pill Button (ORBITAL Spec) */}
        <button
          onClick={handleExportXls}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer ${
            isDark
              ? 'bg-[#12141A] hover:bg-[#181B24] border border-white/[0.08] text-gray-200 hover:text-white'
              : 'bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800'
          }`}
          title="Export Operational Data to Excel/CSV"
        >
          <Download className="w-3.5 h-3.5 text-[#6366F1]" />
          <span className="hidden md:inline">Export Data</span>
          <span className="text-[10px] text-gray-500 font-mono">.Xls</span>
        </button>

        {/* Notification Bell */}
        <NextLink
          href="/admin/communications/notifications"
          className={`p-2.5 rounded-full border transition-all duration-200 relative shadow-xs flex items-center justify-center cursor-pointer ${
            isDark
              ? 'border-white/[0.08] bg-[#12141A] hover:bg-[#181B24] text-gray-400 hover:text-white'
              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900'
          }`}
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#FF6442] rounded-full ring-2 ring-white dark:ring-[#0A0B0E] animate-pulse" />
        </NextLink>

        {/* Fullscreen Toggle */}
        <button
          onClick={handleToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          className={`hidden sm:flex p-2.5 rounded-full border transition-all duration-200 shadow-xs items-center justify-center cursor-pointer ${
            isDark
              ? 'border-white/[0.08] bg-[#12141A] hover:bg-[#181B24] text-gray-400 hover:text-white'
              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900'
          }`}
        >
          {isFullscreen ? (
            <Minimize className="w-4 h-4 text-emerald-400" />
          ) : (
            <Maximize className="w-4 h-4" />
          )}
        </button>

        {/* PWA Install */}
        <PwaInstallButton role="admin" variant="navbar" />

        {/* Profile Avatar */}
        <NextLink
          href="/admin/settings"
          className="relative flex items-center justify-center cursor-pointer"
          title={`Profile: ${displayName}`}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#06B6D4] p-[2px] shadow-sm flex items-center justify-center">
            <div
              className={`w-full h-full rounded-full flex items-center justify-center font-bold text-xs uppercase ${
                isDark ? 'bg-[#12141A] text-white' : 'bg-white text-indigo-600'
              }`}
            >
              {initial}
            </div>
          </div>
        </NextLink>
      </div>
    </header>
  );
}
