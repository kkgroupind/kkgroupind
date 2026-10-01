'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  HardHat,
  UserCircle,
  FolderKanban,
  ChevronDown,
  ChevronRight,
  LogOut,
  X,
  Bell,
  Activity,
  Megaphone,
  Menu,
  Users,
} from 'lucide-react';

export type OfficeStaffSection =
  | 'dashboard'
  | 'profile'
  | 'people-customers'
  | 'people-workers'
  | 'operations-enquiries'
  | 'operations-works'
  | 'operations-assignments'
  | 'operations-services'
  | 'workforce-attendance'
  | 'workforce-availability'
  | 'workforce-leave'
  | 'reports'
  | 'notifications'
  | 'announcements'
  | 'activity-logs'
  | 'settings';

export interface OfficeStaffSidebarProps {
  activeSection: OfficeStaffSection;
  onSelectSection: (section: OfficeStaffSection) => void;
  isAvailable?: boolean;
  onToggleAvailability?: () => void;
  userName?: string;
  userRole?: string;
  userAvatar?: string | null;
  onLogout?: () => void;
  unreadEnquiriesCount?: number;
  availableWorkersCount?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export function OfficeStaffSidebar({
  activeSection,
  onSelectSection,
  isAvailable = false,
  onToggleAvailability,
  userName = 'Office Staff',
  userAvatar,
  onLogout,
  unreadEnquiriesCount = 0,
  availableWorkersCount = 0,
  isOpenMobile = false,
  onCloseMobile,
}: OfficeStaffSidebarProps) {
  const router = useRouter();
  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({
    operations: true,
  });
  const [isInternalMoreOpen, setIsInternalMoreOpen] = useState(false);

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isSheetOpen = isOpenMobile || isInternalMoreOpen;

  const closeSheet = () => {
    setIsInternalMoreOpen(false);
    if (onCloseMobile) onCloseMobile();
  };

  const handleItemClick = (section: OfficeStaffSection) => {
    closeSheet();
    if (section === 'profile') {
      router.push('/office-staff/profile');
      return;
    }
    onSelectSection(section);
  };

  const isCurrent = (section: OfficeStaffSection) => activeSection === section;

  return (
    <>
      {/* ========================================================
          1. DESKTOP PERMANENT SIDEBAR (Hidden on mobile < lg)
      ======================================================== */}
      <aside className="hidden lg:flex fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#091540] border-r border-[#1B2CC1]/25 text-white flex-col justify-between select-none shadow-2xl">
        {/* Top: Brand Header */}
        <div className="p-5 border-b border-[#1B2CC1]/25 flex items-center justify-between bg-[#060E2C]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 relative flex items-center justify-center shrink-0">
              <Image src="/logos/logo-bg.png" alt="KK Group Logo" fill className="object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-white tracking-tight leading-tight">
                KK Group
              </span>
              <span className="text-[11px] text-[#ABD2FA] font-medium">
                Office Staff Portal
              </span>
            </div>
          </div>
        </div>

        {/* Middle: Navigation Tree */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar text-sm font-medium">
          {/* Dashboard */}
          <button
            type="button"
            onClick={() => handleItemClick('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-left cursor-pointer ${
              isCurrent('dashboard')
                ? 'bg-[#1B2CC1] text-white font-bold shadow-md shadow-[#1B2CC1]/40'
                : 'text-[#ABD2FA]/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 shrink-0 ${isCurrent('dashboard') ? 'text-white' : 'text-[#7692FF]'}`} />
            <span>Dashboard</span>
          </button>

          {/* Operations Group */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => toggleGroup('operations')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#7692FF] hover:text-white transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <FolderKanban className="w-3.5 h-3.5 text-[#7692FF]" />
                <span>Operations</span>
              </span>
              {openGroups.operations ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {openGroups.operations && (
              <div className="mt-1 space-y-0.5 pl-3 border-l border-[#7692FF]/25 ml-3">
                <button
                  type="button"
                  onClick={() => handleItemClick('operations-enquiries')}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg transition-all text-left text-sm cursor-pointer ${
                    isCurrent('operations-enquiries') || isCurrent('operations-works')
                      ? 'bg-[#1B2CC1] text-white font-bold shadow-md shadow-[#1B2CC1]/40'
                      : 'text-[#ABD2FA]/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FolderKanban className={`w-4 h-4 shrink-0 ${isCurrent('operations-enquiries') || isCurrent('operations-works') ? 'text-white' : 'text-[#7692FF]'}`} />
                    <span>Job Orders</span>
                  </div>
                  {unreadEnquiriesCount > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-[#7692FF]/30 text-white border border-[#7692FF]/40">
                      {unreadEnquiriesCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleItemClick('operations-assignments')}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all text-left text-sm cursor-pointer ${
                    isCurrent('operations-assignments')
                      ? 'bg-[#1B2CC1] text-white font-bold shadow-md shadow-[#1B2CC1]/40'
                      : 'text-[#ABD2FA]/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <HardHat className={`w-4 h-4 shrink-0 ${isCurrent('operations-assignments') ? 'text-white' : 'text-amber-300'}`} />
                  <span>Workforce Dispatch</span>
                </button>
              </div>
            )}
          </div>

          {/* Field Workers & Workforce (Unified) */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleItemClick('people-workers')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all text-left cursor-pointer ${
                isCurrent('people-workers') ||
                isCurrent('workforce-attendance') ||
                isCurrent('workforce-availability') ||
                isCurrent('workforce-leave')
                  ? 'bg-[#1B2CC1] text-white font-bold shadow-md shadow-[#1B2CC1]/40'
                  : 'text-[#ABD2FA]/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <HardHat className={`w-4 h-4 shrink-0 ${
                  isCurrent('people-workers') ||
                  isCurrent('workforce-attendance') ||
                  isCurrent('workforce-availability') ||
                  isCurrent('workforce-leave')
                    ? 'text-white'
                    : 'text-[#7692FF]'
                }`} />
                <span>Field Workers</span>
              </div>
              {availableWorkersCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  {availableWorkersCount}
                </span>
              )}
            </button>
          </div>

          {/* Notifications */}
          <button
            type="button"
            onClick={() => handleItemClick('notifications')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-left cursor-pointer ${
              isCurrent('notifications')
                ? 'bg-[#1B2CC1] text-white font-bold shadow-md shadow-[#1B2CC1]/40'
                : 'text-[#ABD2FA]/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Bell className={`w-4 h-4 shrink-0 ${isCurrent('notifications') ? 'text-white' : 'text-[#7692FF]'}`} />
            <span>Alerts &amp; Notifications</span>
          </button>

          {/* Announcements */}
          <button
            type="button"
            onClick={() => handleItemClick('announcements')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-left cursor-pointer ${
              isCurrent('announcements')
                ? 'bg-[#1B2CC1] text-white font-bold shadow-md shadow-[#1B2CC1]/40'
                : 'text-[#ABD2FA]/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Megaphone className={`w-4 h-4 shrink-0 ${isCurrent('announcements') ? 'text-white' : 'text-[#7692FF]'}`} />
            <span>Notices &amp; Announcements</span>
          </button>

          {/* Activity Logs */}
          <button
            type="button"
            onClick={() => handleItemClick('activity-logs')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-left cursor-pointer ${
              isCurrent('activity-logs')
                ? 'bg-[#1B2CC1] text-white font-bold shadow-md shadow-[#1B2CC1]/40'
                : 'text-[#ABD2FA]/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Activity className={`w-4 h-4 shrink-0 ${isCurrent('activity-logs') ? 'text-white' : 'text-[#7692FF]'}`} />
            <span>My Activity Trail</span>
          </button>

          {/* Staff Profile */}
          <button
            type="button"
            onClick={() => handleItemClick('profile')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-left cursor-pointer ${
              isCurrent('profile')
                ? 'bg-[#1B2CC1] text-white font-bold shadow-md shadow-[#1B2CC1]/40'
                : 'text-[#ABD2FA]/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <UserCircle className={`w-4 h-4 shrink-0 ${isCurrent('profile') ? 'text-white' : 'text-[#7692FF]'}`} />
            <div className="flex items-center justify-between flex-1">
              <span>Staff Profile</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                isCurrent('profile')
                  ? 'bg-white/20 text-white'
                  : 'bg-[#7692FF]/20 text-[#ABD2FA] border border-[#7692FF]/30'
              }`}>
                Me
              </span>
            </div>
          </button>
        </div>

        {/* Bottom Section: Availability and User */}
        <div className="p-4 border-t border-[#1B2CC1]/25 space-y-3 bg-[#060E2C]">
          {/* Status Indicator & Change */}
          <div className="p-2.5 rounded-xl bg-[#0D1C52] border border-[#1B2CC1]/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  isAvailable ? 'bg-emerald-400 shadow-sm animate-pulse' : 'bg-amber-400'
                }`}
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate">
                  {isAvailable ? 'Available' : 'Unavailable'}
                </span>
                <span className="text-[11px] text-[#ABD2FA] truncate">
                  {isAvailable ? 'Ready for tasks' : 'Off duty'}
                </span>
              </div>
            </div>

            {onToggleAvailability && (
              <button
                type="button"
                onClick={onToggleAvailability}
                className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-xs text-white transition-colors border border-white/20 font-medium cursor-pointer"
              >
                Change
              </button>
            )}
          </div>

          {/* User profile card & Red Logout below */}
          <div className="flex flex-col gap-2 pt-1 border-t border-[#1B2CC1]/20">
            {/* 1. Staff Profile Card */}
            <div
              onClick={() => {
                router.push('/office-staff/profile');
              }}
              className={`flex items-center gap-2.5 w-full cursor-pointer group p-2 rounded-xl transition-all ${
                isCurrent('profile')
                  ? 'bg-[#1B2CC1] text-white shadow-md'
                  : 'bg-[#0D1C52] hover:bg-[#122468] border border-[#1B2CC1]/30 text-white'
              }`}
              title="Manage Staff Profile"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1B2CC1] to-[#7692FF] p-[2px] shrink-0">
                <div className="w-full h-full rounded-xl bg-[#091540] flex items-center justify-center font-bold text-xs text-white overflow-hidden">
                  {userAvatar ? (
                    <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                  ) : (
                    userName.charAt(0).toUpperCase()
                  )}
                </div>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-bold text-white group-hover:text-[#ABD2FA] truncate transition-colors">
                  {userName}
                </span>
                <span className="text-[10px] text-[#ABD2FA]/70 truncate font-mono">
                  Office Staff &bull; Portal
                </span>
              </div>
            </div>

            {/* 2. Logout Button in Red */}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Log out"
                className="flex items-center gap-2 py-2 px-3 rounded-xl transition-all font-semibold text-xs w-full cursor-pointer bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 hover:text-white border border-rose-400/30 shadow-xs"
              >
                <LogOut className="w-4 h-4 shrink-0 text-rose-300" />
                <span>Log out</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ========================================================
          2. MOBILE FIXED BOTTOM THUMB NAVIGATION BAR (lg:hidden)
          Easy thumb-friendly access to primary office workflows
      ======================================================== */}
      <nav
        aria-label="Office Staff Mobile Bottom Navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-2xl border-t border-[#7692FF]/30 shadow-[0_-8px_30px_rgba(9,21,64,0.12)] px-2 pt-1.5 flex items-center justify-around select-none"
        style={{ paddingBottom: 'max(0.6rem, env(safe-area-inset-bottom, 0.6rem))' }}
      >
        {/* 1. Dashboard */}
        <button
          type="button"
          onClick={() => handleItemClick('dashboard')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative cursor-pointer min-w-0 max-w-[72px] ${
            isCurrent('dashboard') ? 'text-[#1B2CC1]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
              isCurrent('dashboard')
                ? 'bg-[#ABD2FA]/40 text-[#1B2CC1] font-bold shadow-xs'
                : 'text-slate-500'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
          </div>
          <span
            className={`text-[10px] tracking-tight mt-0.5 truncate w-full text-center ${
              isCurrent('dashboard') ? 'font-black text-[#1B2CC1]' : 'font-semibold'
            }`}
          >
            Dashboard
          </span>
        </button>

        {/* 2. Job Orders */}
        <button
          type="button"
          onClick={() => handleItemClick('operations-enquiries')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative cursor-pointer min-w-0 max-w-[72px] ${
            isCurrent('operations-enquiries') || isCurrent('operations-works')
              ? 'text-[#1B2CC1]'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
              isCurrent('operations-enquiries') || isCurrent('operations-works')
                ? 'bg-[#ABD2FA]/40 text-[#1B2CC1] font-bold shadow-xs'
                : 'text-slate-500'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
          </div>
          <span
            className={`text-[10px] tracking-tight mt-0.5 truncate w-full text-center ${
              isCurrent('operations-enquiries') || isCurrent('operations-works')
                ? 'font-black text-[#1B2CC1]'
                : 'font-semibold'
            }`}
          >
            Orders
          </span>
          {unreadEnquiriesCount > 0 && (
            <span className="absolute top-0.5 right-2 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-xs animate-pulse">
              {unreadEnquiriesCount > 99 ? '99+' : unreadEnquiriesCount}
            </span>
          )}
        </button>

        {/* 3. Dispatch */}
        <button
          type="button"
          onClick={() => handleItemClick('operations-assignments')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative cursor-pointer min-w-0 max-w-[72px] ${
            isCurrent('operations-assignments') ? 'text-[#1B2CC1]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
              isCurrent('operations-assignments')
                ? 'bg-[#ABD2FA]/40 text-[#1B2CC1] font-bold shadow-xs'
                : 'text-slate-500'
            }`}
          >
            <HardHat className="w-4 h-4" />
          </div>
          <span
            className={`text-[10px] tracking-tight mt-0.5 truncate w-full text-center ${
              isCurrent('operations-assignments') ? 'font-black text-[#1B2CC1]' : 'font-semibold'
            }`}
          >
            Dispatch
          </span>
        </button>

        {/* 4. Workers */}
        <button
          type="button"
          onClick={() => handleItemClick('people-workers')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative cursor-pointer min-w-0 max-w-[72px] ${
            isCurrent('people-workers') || activeSection.startsWith('workforce')
              ? 'text-[#1B2CC1]'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
              isCurrent('people-workers') || activeSection.startsWith('workforce')
                ? 'bg-[#ABD2FA]/40 text-[#1B2CC1] font-bold shadow-xs'
                : 'text-slate-500'
            }`}
          >
            <Users className="w-4 h-4" />
          </div>
          <span
            className={`text-[10px] tracking-tight mt-0.5 truncate w-full text-center ${
              isCurrent('people-workers') || activeSection.startsWith('workforce')
                ? 'font-black text-[#1B2CC1]'
                : 'font-semibold'
            }`}
          >
            Workers
          </span>
          {availableWorkersCount > 0 && (
            <span className="absolute top-0.5 right-2 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-xs">
              {availableWorkersCount}
            </span>
          )}
        </button>

        {/* 5. More / Menu */}
        <button
          type="button"
          onClick={() => setIsInternalMoreOpen(true)}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative cursor-pointer min-w-0 max-w-[72px] ${
            isSheetOpen ||
            isCurrent('profile') ||
            isCurrent('notifications') ||
            isCurrent('announcements') ||
            isCurrent('activity-logs')
              ? 'text-[#1B2CC1]'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
              isSheetOpen ||
              isCurrent('profile') ||
              isCurrent('notifications') ||
              isCurrent('announcements') ||
              isCurrent('activity-logs')
                ? 'bg-[#ABD2FA]/40 text-[#1B2CC1] font-bold shadow-xs'
                : 'text-slate-500'
            }`}
          >
            <Menu className="w-4 h-4" />
          </div>
          <span
            className={`text-[10px] tracking-tight mt-0.5 truncate w-full text-center ${
              isSheetOpen || isCurrent('profile') ? 'font-black text-[#1B2CC1]' : 'font-semibold'
            }`}
          >
            More
          </span>
        </button>
      </nav>

      {/* ========================================================
          3. MOBILE "MORE" SLIDE-UP DRAWER SHEET (lg:hidden)
          Clean, thumb-friendly secondary actions & profile panel
      ======================================================== */}
      {isSheetOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            onClick={closeSheet}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          {/* Sheet Modal */}
          <div
            className="relative z-10 bg-[#091540] text-white rounded-t-3xl border-t border-[#1B2CC1]/30 max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200"
            style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}
          >
            {/* Top Handle */}
            <div className="pt-3 pb-1 flex justify-center">
              <div className="w-12 h-1.5 bg-white/25 rounded-full" />
            </div>

            {/* Sheet Header */}
            <div className="px-5 py-3 border-b border-[#1B2CC1]/25 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1B2CC1] to-[#7692FF] p-[2px] shrink-0">
                  <div className="w-full h-full rounded-xl bg-[#091540] flex items-center justify-center font-bold text-xs text-white overflow-hidden">
                    {userAvatar ? (
                      <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                    ) : (
                      userName.charAt(0).toUpperCase()
                    )}
                  </div>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-white truncate">{userName}</span>
                  <span className="text-[11px] text-[#ABD2FA]">Office Staff &bull; Portal</span>
                </div>
              </div>

              <button
                type="button"
                onClick={closeSheet}
                className="p-2 rounded-xl text-[#ABD2FA] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sheet Body Scrollable */}
            <div className="overflow-y-auto p-4 space-y-3 custom-scrollbar text-sm">
              {/* Desk Availability Switch Card */}
              <div className="p-3 rounded-2xl bg-[#0D1C52] border border-[#1B2CC1]/30 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-3 h-3 rounded-full shrink-0 ${
                      isAvailable ? 'bg-emerald-400 shadow-sm animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  <div>
                    <div className="text-xs font-bold text-white">
                      {isAvailable ? 'Available on Desk' : 'Currently Off Duty'}
                    </div>
                    <div className="text-[11px] text-[#ABD2FA]">
                      {isAvailable ? 'Receiving active calls & assignments' : 'Desk marked unavailable'}
                    </div>
                  </div>
                </div>
                {onToggleAvailability && (
                  <button
                    type="button"
                    onClick={() => {
                      closeSheet();
                      onToggleAvailability();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-xs text-white transition-colors border border-white/20 font-bold cursor-pointer"
                  >
                    Change
                  </button>
                )}
              </div>

              {/* Navigation Options List */}
              <div className="space-y-1 pt-1">
                <button
                  type="button"
                  onClick={() => handleItemClick('profile')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left cursor-pointer ${
                    isCurrent('profile')
                      ? 'bg-[#1B2CC1] text-white font-bold'
                      : 'text-[#ABD2FA]/90 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <UserCircle className="w-4 h-4 text-[#7692FF]" />
                    <span>My Staff Profile</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#7692FF]" />
                </button>

                <button
                  type="button"
                  onClick={() => handleItemClick('notifications')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left cursor-pointer ${
                    isCurrent('notifications')
                      ? 'bg-[#1B2CC1] text-white font-bold'
                      : 'text-[#ABD2FA]/90 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-[#7692FF]" />
                    <span>Alerts &amp; Notifications</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#7692FF]" />
                </button>

                <button
                  type="button"
                  onClick={() => handleItemClick('announcements')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left cursor-pointer ${
                    isCurrent('announcements')
                      ? 'bg-[#1B2CC1] text-white font-bold'
                      : 'text-[#ABD2FA]/90 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Megaphone className="w-4 h-4 text-[#7692FF]" />
                    <span>Notices &amp; Announcements</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#7692FF]" />
                </button>

                <button
                  type="button"
                  onClick={() => handleItemClick('activity-logs')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left cursor-pointer ${
                    isCurrent('activity-logs')
                      ? 'bg-[#1B2CC1] text-white font-bold'
                      : 'text-[#ABD2FA]/90 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-[#7692FF]" />
                    <span>My Activity Trail</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#7692FF]" />
                </button>
              </div>

              {/* Logout Button */}
              {onLogout && (
                <div className="pt-2 border-t border-[#1B2CC1]/25">
                  <button
                    type="button"
                    onClick={() => {
                      closeSheet();
                      onLogout();
                    }}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all font-bold text-xs w-full cursor-pointer bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 hover:text-white border border-rose-400/30 shadow-xs"
                  >
                    <LogOut className="w-4 h-4 shrink-0 text-rose-300" />
                    <span>Log out of Portal</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
