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
  Globe,
  Check,
  RefreshCw,
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useWorkerLanguage, WORKER_LANGUAGES } from '@/context/worker-language-context';
import { useWorker } from '@/context/worker-context';

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
  onReload?: () => void;
  isReloading?: boolean;
}

export function WorkerNavbar({
  activeTab,
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
  onReload,
  isReloading,
}: WorkerNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { language, setLanguage, t } = useWorkerLanguage();
  const workerCtx = useWorker();

  const handleReload = onReload || workerCtx?.reloadAll;
  const isSyncing = isReloading !== undefined ? isReloading : workerCtx?.isReloading;
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Compute active tab dynamically from pathname if not explicitly passed
  const currentTab =
    activeTab ||
    (pathname.startsWith('/worker/jobs')
      ? 'tasks'
      : pathname.startsWith('/worker/notifications')
      ? 'notifications'
      : pathname.startsWith('/worker/profile')
      ? 'profile'
      : 'home');

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
      if (
        langMenuRef.current &&
        !langMenuRef.current.contains(event.target as Node)
      ) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (tabId: string) => {
    if (tabId === 'profile') {
      router.push('/worker/profile');
    } else if (tabId === 'tasks' || tabId === 'jobs') {
      router.push('/worker/jobs');
    } else if (tabId === 'notifications') {
      router.push('/worker/notifications');
    } else {
      router.push('/worker/dashboard');
    }
    onTabChange?.(tabId);
  };

  const desktopNavItems: NavItem[] = [
    { id: 'home', icon: Home, label: t('home') },
    {
      id: 'tasks',
      icon: Briefcase,
      label: t('jobs'),
      badge: assignedJobsCount && assignedJobsCount > 0 ? assignedJobsCount : undefined,
    },
    {
      id: 'notifications',
      icon: Bell,
      label: t('notifications'),
      badge: hasNotifications && assignedJobsCount && assignedJobsCount > 0 ? assignedJobsCount : undefined,
    },
  ];

  const mobileNavItems: NavItem[] = [
    { id: 'home', icon: Home, label: t('home') },
    {
      id: 'tasks',
      icon: Briefcase,
      label: t('jobs'),
      badge: assignedJobsCount && assignedJobsCount > 0 ? assignedJobsCount : undefined,
    },
    {
      id: 'notifications',
      icon: Bell,
      label: t('notifications'),
      badge: hasNotifications && assignedJobsCount && assignedJobsCount > 0 ? assignedJobsCount : undefined,
    },
    { id: 'profile', icon: UserCircle, label: t('profile') },
  ];

  return (
    <>
      {/* ========================================================
          1. FIXED TOP NAVBAR (Zero Movement on Scroll)
          Pinned permanently at the top of the viewport
      ======================================================== */}
      <header className="fixed top-0 inset-x-0 z-50 w-full select-none pt-2 sm:pt-3 px-2 sm:px-4 bg-[#EAEFEA]/95 backdrop-blur-xl border-b border-slate-200/60 shadow-xs">
        <div className="w-full max-w-[1480px] mx-auto pb-2 sm:pb-2.5">
          <nav
            aria-label="Worker primary navigation"
            className="w-full bg-gradient-to-r from-[#0B1E24] via-[#134B4C] to-[#0B1E24] border border-[#134B4C]/80 rounded-2xl sm:rounded-3xl p-2 sm:p-2.5 px-3 sm:px-5 shadow-[0_15px_35px_rgba(11,30,36,0.35)] text-white flex items-center justify-between gap-3 transition-all"
          >
          {/* Left: Brand Emblem + Worker Info */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-inner">
              <HardHat className="w-5 h-5 text-[#88B793]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-black tracking-tight leading-none text-white">
                  KK GROUP
                </span>
                <span className="hidden sm:inline text-[10px] font-bold bg-[#2A835F] text-white px-2 py-0.5 rounded-full border border-[#88B793]/40">
                  {t('operative')}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-[#A3E5C7] uppercase tracking-wider mt-0.5">
                {userName} • {language === 'en' ? 'Kerala' : language === 'ml' ? 'കേരളം' : 'केरल'}
              </span>
            </div>
          </div>

          {/* Center: Desktop Navigation Bar with Icons and Names */}
          <div className="hidden md:flex items-center gap-1.5 lg:gap-2 overflow-x-auto scrollbar-none py-0.5">
            {desktopNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

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

          {/* Right: Reload Button, Language Switcher, Quick Duty Toggle, Alerts & Profile */}
          <div className="flex items-center gap-2 shrink-0">
            {/* 0. Live Reload / Sync Button */}
            <button
              type="button"
              onClick={handleReload}
              disabled={isSyncing}
              title="Reload Live Orders & Telemetry / വിവരങ്ങൾ പുതുക്കുക"
              aria-label="Reload field data"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold transition-all cursor-pointer border border-white/15 shadow-xs focus:outline-none disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-[#88B793] transition-transform ${
                  isSyncing ? 'animate-spin' : 'hover:rotate-180 duration-500'
                }`}
              />
              <span className="hidden sm:inline text-[11px] font-bold">
                {isSyncing ? 'Syncing...' : 'Reload'}
              </span>
            </button>

            {/* 1. Language Switcher Dropdown (EN / ML / HI) */}
            <div className="relative" ref={langMenuRef}>
              <button
                type="button"
                onClick={() => setIsLangMenuOpen((prev) => !prev)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer border border-white/15 shadow-xs focus:outline-none"
                title="Switch Language / ഭാഷ മാറ്റുക / भाषा बदलें"
                aria-expanded={isLangMenuOpen}
              >
                <Globe className="w-3.5 h-3.5 text-[#88B793]" />
                <span className="uppercase text-[11px] font-black">
                  {language}
                </span>
                <ChevronDown
                  className={`w-3 h-3 text-[#88B793] transition-transform duration-200 ${
                    isLangMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Language Selection Menu */}
              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2.5 w-44 bg-[#14161D] rounded-2xl border border-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.6)] py-1.5 text-gray-200 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-800/80">
                    Select Language
                  </div>
                  <div className="p-1 space-y-0.5">
                    {WORKER_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLangMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
                          language === lang.code
                            ? 'bg-[#2A835F] text-white font-bold'
                            : 'text-gray-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{lang.flag}</span>
                          <div className="flex flex-col leading-tight">
                            <span className="font-semibold">{lang.nativeName}</span>
                            <span className="text-[10px] opacity-70">{lang.name}</span>
                          </div>
                        </div>
                        {language === lang.code && (
                          <Check className="w-3.5 h-3.5 text-white" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

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
                {isOnDuty ? t('onDuty') : t('offDuty')}
              </span>
              <span className="inline sm:hidden text-[11px]">
                {isOnDuty ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Profile Avatar Trigger & Dropdown Menu (Desktop only - mobile uses bottom navbar) */}
            <div className="relative hidden md:block" ref={profileMenuRef}>
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
                  className={`w-3.5 h-3.5 text-[#88B793] transition-transform duration-200 ${
                    isProfileMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Profile Dropdown Popup Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2.5 w-64 bg-[#0B1E24] rounded-2xl border border-[#134B4C] shadow-[0_20px_50px_rgba(0,0,0,0.6)] py-2 text-gray-200 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Dropdown Header */}
                  <div className="px-4 py-3 border-b border-[#134B4C]/80 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-[#134B4C] border border-[#88B793]/40 flex items-center justify-center text-white font-bold shrink-0">
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
                      <span className="text-[11px] text-[#88B793] font-mono truncate">
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
                      <User className="w-4 h-4 text-[#88B793]" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-200">{t('profile')}</span>
                        <span className="text-[10px] text-gray-500">
                          {language === 'hi' ? 'कार्यकर्ता विवरण' : language === 'ml' ? 'തൊഴിലാളി വിവരങ്ങൾ' : 'Operative Credentials'}
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
                        <span className="font-semibold text-gray-200">{t('settings')}</span>
                        <span className="text-[10px] text-gray-500">
                          {language === 'hi' ? 'पासवर्ड एवं सुरक्षा' : language === 'ml' ? 'പാസ്‌വേഡ് & സുരക്ഷ' : 'Password & Security'}
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
                        <span className="font-semibold">{t('signOut')}</span>
                        <span className="text-[10px] text-rose-500/70">
                          {language === 'hi' ? 'साइन आउट करें' : language === 'ml' ? 'പുറത്തുകടക്കുക' : 'Exit Portal'}
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
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all relative cursor-pointer min-w-[58px] ${
                isActive ? 'text-[#2A835F]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  isActive ? 'bg-[#2A835F] text-white shadow-md shadow-[#2A835F]/30' : ''
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-black text-[#2A835F]' : 'font-semibold'}`}>
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
