'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Users,
  Calculator,
  Calendar,
  Bell,
  RefreshCw,
  LogOut,
  Plus,
  User,
  Settings,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

export interface OfficeNavCategory {
  id: string;
  label: string;
  shortLabel?: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeColor?: string;
}

interface OfficeStaffNavbarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  orderCount?: number;
  pendingCount?: number;
  availableWorkersCount?: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onCreateInvoice?: () => void;
  userName?: string;
  userRole?: string;
  userAvatar?: string;
  onLogout?: () => void;
  isAvailable?: boolean;
  onToggleAvailability?: () => void;
  isTogglingAvailability?: boolean;
}

export function OfficeStaffNavbar({
  activeTab = 'dashboard',
  onTabChange,
  orderCount = 0,
  pendingCount = 0,
  availableWorkersCount = 0,
  onRefresh,
  isRefreshing = false,
  onCreateInvoice,
  userName = 'Office Staff',
  userRole = 'OFFICE_STAFF',
  userAvatar,
  onLogout,
  isAvailable = false,
  onToggleAvailability,
  isTogglingAvailability = false,
}: OfficeStaffNavbarProps) {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  // Concise, highly responsive navigation categories
  const navCategories: OfficeNavCategory[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      shortLabel: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'invoices',
      label: 'Invoices',
      shortLabel: 'Orders',
      icon: FileText,
      badge: orderCount > 0 ? orderCount : undefined,
      badgeColor: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    },
    {
      id: 'crew',
      label: 'Field Crew',
      shortLabel: 'Crew',
      icon: Users,
      badge: availableWorkersCount > 0 ? `${availableWorkersCount}` : undefined,
      badgeColor: 'bg-blue-50 text-blue-700 border border-blue-200',
    },
    {
      id: 'estimates',
      label: 'Estimates',
      shortLabel: 'Rates',
      icon: Calculator,
    },
    {
      id: 'calendar',
      label: 'Calendar',
      shortLabel: 'Schedule',
      icon: Calendar,
      badge: pendingCount > 0 ? pendingCount : undefined,
      badgeColor: 'bg-rose-100 text-rose-700 border border-rose-200',
    },
  ];

  const handleItemClick = (id: string) => {
    if (onTabChange) {
      onTabChange(id);
    }
  };

  return (
    <>
      {/* ========================================================
          1. SUPER RESPONSIVE FIXED TOP NAVBAR (Mobile -> 4K)
      ======================================================== */}
      <header className="fixed top-0 inset-x-0 z-50 w-full h-16 sm:h-18 lg:h-20 bg-white/95 backdrop-blur-2xl border-b border-slate-200/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.03)] flex items-center select-none transition-all">
        <div className="w-full max-w-[1520px] mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4 lg:gap-8">
          
          {/* ========================================================
              LEFT: Brand Emblem + Office Staff Identity
          ======================================================== */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div
              onClick={() => router.push('/')}
              title="Return to KK Group Homepage"
              className="flex items-center gap-2 sm:gap-2.5 group cursor-pointer"
            >
              {/* KK Group Emerald Sparkle Star Emblem */}
              <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-xl sm:rounded-2xl bg-[#EBF6F1] border border-[#C3E6D5] flex items-center justify-center text-[#2A835F] shadow-xs group-hover:scale-105 group-hover:bg-[#d8efe5] transition-all shrink-0">
                <svg
                  viewBox="0 0 24 24"
                  fill="#2A835F"
                  className="w-4 h-4 sm:w-5 sm:h-5 text-[#2A835F] shrink-0"
                >
                  <path d="M12 0L14.7 9.3L24 12L14.7 14.7L12 24L9.3 14.7L0 12L9.3 9.3L12 0Z" />
                </svg>
              </div>

              {/* Brand Typography & Office Staff Tag */}
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-sm sm:text-base lg:text-lg font-black tracking-tight leading-none text-[#0F172A] font-sans whitespace-nowrap">
                    KK GROUP
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-extrabold bg-[#EBF6F1] text-[#2A835F] border border-[#C3E6D5] px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                    OFFICE STAFFS
                  </span>
                </div>
                <span className="text-[10px] lg:text-[11px] font-medium text-slate-400 tracking-tight mt-0.5 hidden md:inline truncate max-w-[200px] lg:max-w-none">
                  Operations &bull; കേരളം
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================
              CENTER: Fluid Segmented Navigation Tabs (Tablet & Desktop)
          ======================================================== */}
          <nav
            aria-label="Office Staff Navigation"
            className="hidden md:flex items-center gap-1 lg:gap-1.5 xl:gap-2 bg-slate-100/90 p-1 sm:p-1.5 rounded-2xl border border-slate-200/80 shadow-inner"
          >
            {navCategories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeTab === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleItemClick(cat.id)}
                  className={`flex items-center gap-1.5 px-2.5 lg:px-3.5 xl:px-4 py-1.5 lg:py-2 rounded-xl text-xs lg:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-[#2A835F] shadow-[0_2px_8px_rgba(0,0,0,0.06)] ring-1 ring-slate-200/60 font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0 transition-colors ${
                      isActive ? 'text-[#2A835F]' : 'text-slate-400'
                    }`}
                  />
                  {/* Fluid label: short on medium tablet, full on desktop */}
                  <span className="hidden xl:inline">{cat.label}</span>
                  <span className="inline xl:hidden">{cat.shortLabel || cat.label}</span>

                  {cat.badge !== undefined && (
                    <span
                      className={`ml-0.5 text-[9px] lg:text-[10px] font-black px-1.5 py-0.2 rounded-full shadow-xs ${
                        cat.badgeColor || 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {cat.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* ========================================================
              RIGHT: Responsive Actions, Sync, Alerts & Profile
          ======================================================== */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Quick Live Refresh Button */}
            {onRefresh && (
              <button
                type="button"
                title="Synchronize live orders & field crew"
                onClick={onRefresh}
                className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 flex items-center justify-center border border-slate-200/70 shadow-xs transition-all cursor-pointer"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                    isRefreshing ? 'animate-spin text-[#2A835F]' : ''
                  }`}
                />
              </button>
            )}

            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => handleItemClick('calendar')}
              title={
                pendingCount > 0
                  ? `${pendingCount} orders awaiting dispatch`
                  : 'All orders dispatched'
              }
              className="relative w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 flex items-center justify-center border border-slate-200/70 shadow-xs transition-all cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {pendingCount > 0 && (
                <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* Compact CTA on Mobile / Full CTA on sm+ */}
            {onCreateInvoice && (
              <>
                {/* Mobile Icon Button */}
                <button
                  type="button"
                  onClick={onCreateInvoice}
                  title="Create New Service Order"
                  className="sm:hidden w-8 h-8 rounded-xl bg-[#2A835F] hover:bg-[#236D4F] text-white flex items-center justify-center shadow-xs transition-all cursor-pointer active:scale-95 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>

                {/* Tablet / Desktop Full Button */}
                <button
                  type="button"
                  onClick={onCreateInvoice}
                  className="hidden sm:flex items-center gap-1.5 lg:gap-2 bg-[#2A835F] hover:bg-[#236D4F] text-white text-xs sm:text-sm font-bold px-3 lg:px-4 py-2 sm:py-2.5 rounded-xl shadow-[0_3px_12px_rgba(42,131,95,0.25)] transition-all cursor-pointer active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="whitespace-nowrap">New Order</span>
                </button>
              </>
            )}

            {/* Availability / Duty Status Toggle Pill */}
            {onToggleAvailability && (
              <button
                type="button"
                onClick={onToggleAvailability}
                disabled={isTogglingAvailability}
                className={`hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-xs cursor-pointer ${
                  isAvailable
                    ? 'bg-[#EBF6F1] text-[#2A835F] border-[#C3E6D5] hover:bg-emerald-100/80'
                    : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/80'
                }`}
                title={isAvailable ? 'Click to change desk availability' : 'Click to mark as Available'}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isAvailable ? 'bg-[#2A835F] animate-pulse' : 'bg-amber-500'
                  }`}
                />
                <span className="whitespace-nowrap">
                  {isAvailable ? 'Available on Desk' : 'Off Duty / Unavailable'}
                </span>
              </button>
            )}

            {/* Divider (Tablet & Desktop) */}
            <div className="w-px h-5 sm:h-6 bg-slate-200 hidden sm:block" />

            {/* ========================================================
                PROFILE DROPDOWN: Responsive Anchor with Bounds Protection
            ======================================================== */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 sm:pr-2.5 rounded-2xl transition-all cursor-pointer border ${
                  isProfileOpen
                    ? 'bg-slate-100 border-slate-300 shadow-xs'
                    : 'bg-transparent border-transparent hover:bg-slate-100/80 hover:border-slate-200/80'
                }`}
                aria-expanded={isProfileOpen}
                aria-label="Staff profile and settings menu"
              >
                {/* Avatar with live status indicator dot */}
                <div className="relative w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100 shrink-0">
                  <img
                    src={
                      userAvatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                    }
                    alt={userName}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0.5 right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>

                {/* Staff Name & Role Tag (Wide Desktops Only to Save Space) */}
                <div className="hidden 2xl:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[110px]">
                    {userName}
                  </span>
                  <span className="text-[10px] font-semibold text-[#2A835F] leading-tight">
                    Office Staff
                  </span>
                </div>

                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    isProfileOpen ? 'rotate-180 text-slate-700' : ''
                  }`}
                />
              </button>

              {/* High-End Floating Profile Dropdown Card (Bounded for Small Screens) */}
              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-[calc(100vw-24px)] max-w-[280px] sm:max-w-72 sm:w-72 bg-white rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.12)] border border-slate-200/90 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Dropdown Header: Staff Identity */}
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100 shrink-0">
                      <img
                        src={
                          userAvatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                        }
                        alt={userName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-slate-900 truncate">
                        {userName}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-extrabold bg-[#EBF6F1] text-[#2A835F] px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {userRole === 'OFFICE_STAFF' ? 'OFFICE STAFF' : userRole}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Desk Active &bull; കേരളം
                      </span>
                    </div>
                  </div>

                  {/* Dropdown Menu Items */}
                  <div className="p-1.5 space-y-0.5">
                    {/* Profile & Identity */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        router.push('/office-staff/profile');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-[#2A835F] flex items-center justify-center shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800">Staff Profile</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          Personal info & staff identity
                        </span>
                      </div>
                    </button>

                    {/* Desk Settings & Rates */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        if (onTabChange) onTabChange('estimates');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                        <Settings className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800">Desk Settings</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          Tariff cards & notifications
                        </span>
                      </div>
                    </button>

                    {/* Duty Status Interactive Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        onToggleAvailability?.();
                      }}
                      className={`w-full px-3 py-2 rounded-xl border flex items-center justify-between my-1 cursor-pointer transition-colors text-left ${
                        isAvailable
                          ? 'bg-[#EBF6F1]/70 border-[#C3E6D5]/80 hover:bg-[#EBF6F1]'
                          : 'bg-amber-50/70 border-amber-200/80 hover:bg-amber-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck
                          className={`w-4 h-4 ${
                            isAvailable ? 'text-[#2A835F]' : 'text-amber-600'
                          }`}
                        />
                        <span className="text-xs font-bold text-slate-800">Dispatch Desk</span>
                      </div>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          isAvailable
                            ? 'bg-[#2A835F] text-white'
                            : 'bg-amber-600 text-white'
                        }`}
                      >
                        {isAvailable ? 'AVAILABLE' : 'OFF DUTY'}
                      </span>
                    </button>
                  </div>

                  {/* Sign Out / Logout Option */}
                  {onLogout && (
                    <div className="p-1.5 pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-rose-100/70 text-rose-600 flex items-center justify-center shrink-0">
                          <LogOut className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-rose-600">Sign Out</span>
                          <span className="text-[10px] text-rose-400 font-normal">
                            Log out from Office Desk
                          </span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================
          2. MOBILE RESPONSIVE BOTTOM NAVIGATION BAR
          Optimized with safe-area padding for all smartphones (iPhone & Android)
      ======================================================== */}
      <div
        aria-label="Office Staff Mobile Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-2xl border-t border-slate-200 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] px-2 pt-1.5 flex items-center justify-around select-none"
        style={{ paddingBottom: 'max(0.6rem, env(safe-area-inset-bottom, 0.6rem))' }}
      >
        {navCategories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeTab === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleItemClick(cat.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative cursor-pointer min-w-0 max-w-[70px] ${
                isActive ? 'text-[#2A835F]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-[#EBF6F1] text-[#2A835F] shadow-xs font-bold'
                    : 'text-slate-500'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <span
                className={`text-[10px] tracking-tight mt-0.5 truncate w-full text-center ${
                  isActive ? 'font-black text-[#2A835F]' : 'font-medium'
                }`}
              >
                {cat.shortLabel || cat.label}
              </span>

              {cat.badge !== undefined && (
                <span className="absolute top-0.5 right-1 bg-rose-500 text-white text-[8px] font-black px-1 py-0.2 rounded-full shadow-xs">
                  {typeof cat.badge === 'string' && cat.badge.includes(' ')
                    ? cat.badge.split(' ')[0]
                    : cat.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}
