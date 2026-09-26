'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Home,
  FileText,
  BarChart2,
  Activity,
  PlayCircle,
  LogOut,
  HardHat,
  Users,
  MapPin,
  Loader2,
  CheckCircle2,
  UserCircle,
  User,
  Settings,
  ChevronDown,
  Briefcase,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface NavItem {
  id: string;
  icon: React.ElementType;
  label: string;
  badge?: string | number;
}

interface WorkerNavbarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onLogout?: () => void;
  hasNotifications?: boolean;
  assignedJobsCount?: number;
  isOnDuty?: boolean;
  onToggleDuty?: () => void;
  isTogglingDuty?: boolean;
  userName?: string;
  userAvatar?: string | null;
  userHandle?: string;
  userRole?: string;
}

export function WorkerNavbar({
  activeTab = 'home',
  onTabChange,
  onLogout,
  hasNotifications = true,
  assignedJobsCount,
  isOnDuty = true,
  onToggleDuty,
  isTogglingDuty = false,
  userName = 'Operative',
  userAvatar,
  userHandle,
  userRole = 'WORKER',
}: WorkerNavbarProps) {
  const router = useRouter();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (tabId: string) => {
    if (tabId === 'profile') {
      router.push('/worker/profile');
      return;
    }
    if (activeTab === 'profile') {
      router.push('/worker/dashboard');
      return;
    }
    onTabChange?.(tabId);
  };

  const desktopNavItems: NavItem[] = [
    { id: 'home', icon: Home, label: 'Home' },
    {
      id: 'tasks',
      icon: Briefcase,
      label: 'Jobs',
      badge: assignedJobsCount && assignedJobsCount > 0 ? assignedJobsCount : undefined,
    },
    {
      id: 'notifications',
      icon: Bell,
      label: 'Notification',
      badge: hasNotifications && assignedJobsCount && assignedJobsCount > 0 ? assignedJobsCount : undefined,
    },
  ];

  const mobileNavItems: NavItem[] = [
    { id: 'home', icon: Home, label: 'Home' },
    {
      id: 'tasks',
      icon: Briefcase,
      label: 'Jobs',
      badge: assignedJobsCount && assignedJobsCount > 0 ? assignedJobsCount : undefined,
    },
    {
      id: 'notifications',
      icon: Bell,
      label: 'Notification',
      badge: hasNotifications && assignedJobsCount && assignedJobsCount > 0 ? assignedJobsCount : undefined,
    },
    { id: 'profile', icon: UserCircle, label: 'Profile' },
  ];

  return (
    <>
      {/* ========================================================
          1. FIXED TOP NAVBAR (Zero Movement on Scroll)
          Pinned permanently at the top of the viewport
      ======================================================== */}
      <header className="fixed top-0 inset-x-0 z-50 w-full select-none pt-2 sm:pt-3 px-2 sm:px-4 bg-[#E5E8F2]/95 backdrop-blur-xl border-b border-slate-200/60 shadow-xs">
        <div className="w-full max-w-[1480px] mx-auto pb-2 sm:pb-2.5">
          <nav
            aria-label="Worker primary navigation"
            className="w-full bg-[#5E42B4] border border-white/20 rounded-2xl sm:rounded-3xl p-2 sm:p-2.5 px-3 sm:px-5 shadow-[0_15px_35px_rgba(94,66,180,0.3)] text-white flex items-center justify-between gap-3 transition-all"
          >
          {/* Left: Brand Emblem + Worker Info */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-white shadow-inner">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-black tracking-tight leading-none text-white">
                  KK GROUP
                </span>
                <span className="hidden sm:inline text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">
                  OPERATIVE
                </span>
              </div>
              <span className="text-[10px] font-semibold text-purple-200 uppercase tracking-wider mt-0.5">
                {userName} &bull; കേരളം
              </span>
            </div>
          </div>

          {/* Center: Desktop Navigation Bar with Icons and Names */}
          <div className="hidden md:flex items-center gap-1.5 lg:gap-2 overflow-x-auto scrollbar-none py-0.5">
            {desktopNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 lg:px-4 py-2 rounded-xl lg:rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-white/20 text-white shadow-sm scale-[1.02] ring-1 ring-white/35 font-extrabold'
                      : 'text-white/75 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>

                  {item.badge !== undefined && (
                    <span className="ml-0.5 bg-[#FF5E88] text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right: Quick Duty Toggle, Alerts & Sign Out */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Duty Status Pill Toggle */}
            <button
              type="button"
              onClick={onToggleDuty}
              disabled={isTogglingDuty}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-xs border ${
                isOnDuty
                  ? 'bg-emerald-500/90 hover:bg-emerald-400 text-white border-emerald-400/40'
                  : 'bg-white/15 hover:bg-white/25 text-white/90 border-white/20'
              }`}
            >
              {isTogglingDuty ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
              ) : (
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOnDuty ? 'bg-white animate-pulse' : 'bg-slate-300'
                  }`}
                />
              )}
              <span className="hidden sm:inline">
                {isOnDuty ? 'On Duty' : 'Off Duty'}
              </span>
              <span className="inline sm:hidden text-[11px]">
                {isOnDuty ? 'Duty ON' : 'Duty OFF'}
              </span>
            </button>

            {/* Profile Avatar Trigger & Dropdown Menu */}
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1 pl-1 pr-2 sm:pr-2.5 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer border border-white/15 focus:outline-none shadow-xs"
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="true"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0 shadow-xs">
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt={userName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-black uppercase">
                      {userName.charAt(0) || 'W'}
                    </span>
                  )}
                </div>
                <span className="hidden md:inline font-bold text-xs truncate max-w-[110px]">
                  {userName}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-purple-200 transition-transform duration-200 ${
                    isProfileMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Profile Dropdown Popup Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2.5 w-64 bg-[#14161D] rounded-2xl border border-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.6)] py-2 text-gray-200 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Dropdown Header */}
                  <div className="px-4 py-3 border-b border-gray-800/80 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-[#5E42B4] border border-purple-400/30 flex items-center justify-center text-white font-bold shrink-0">
                      {userAvatar ? (
                        <img
                          src={userAvatar}
                          alt={userName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        userName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-white truncate">
                        {userName}
                      </span>
                      <span className="text-[11px] text-purple-400 font-mono truncate">
                        {userHandle ? `@${userHandle}` : 'Operative Member'}
                      </span>
                      <span className="text-[10px] text-gray-400 mt-0.5">
                        Worker • Kerala Field Squad
                      </span>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-1.5 space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        router.push('/worker/profile');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-[#1A1C23] transition-colors text-left cursor-pointer"
                    >
                      <User className="w-4 h-4 text-purple-400" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-200">Profile</span>
                        <span className="text-[10px] text-gray-500">
                          തൊഴിലാളി വിവരങ്ങൾ
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        router.push('/worker/profile?tab=security');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-[#1A1C23] transition-colors text-left cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-200">Settings</span>
                        <span className="text-[10px] text-gray-500">
                          പാസ്‌വേഡ് & സുരക്ഷ
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Sign Out Item */}
                  <div className="pt-1.5 border-t border-gray-800/80 p-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onLogout?.();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <div className="flex flex-col">
                        <span className="font-semibold">Sign Out</span>
                        <span className="text-[10px] text-rose-500/70">
                          പുറത്തുകടക്കുക
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>
        </div>
      </header>

      {/* ========================================================
          2. UTMOST MOBILE-FRIENDLY FIXED BOTTOM THUMB NAVIGATION BAR
          Optimized for workers holding smartphone with one hand on field!
      ======================================================== */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-2xl border-t border-slate-200/90 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] px-2 py-1.5 flex items-center justify-around select-none"
      >
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all relative cursor-pointer min-w-[58px] ${
                isActive ? 'text-[#5E42B4]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  isActive ? 'bg-[#5E42B4] text-white shadow-md shadow-[#5E42B4]/30' : ''
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-black text-[#5E42B4]' : 'font-semibold'}`}>
                {item.label}
              </span>

              {item.badge !== undefined && (
                <span className="absolute top-0.5 right-2 bg-[#FF5E88] text-white text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-xs">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
}
