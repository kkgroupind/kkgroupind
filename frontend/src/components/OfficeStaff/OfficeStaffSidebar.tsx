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
  IndianRupee,
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
  | 'operations-finance'
  | 'workforce-attendance'
  | 'workforce-availability'
  | 'workforce-leave'
  | 'reports'
  | 'notifications'
  | 'activity-logs'
  | 'settings';

interface OfficeStaffSidebarProps {
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

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleItemClick = (section: OfficeStaffSection) => {
    if (section === 'profile') {
      router.push('/office-staff/profile');
      if (onCloseMobile) onCloseMobile();
      return;
    }
    onSelectSection(section);
    if (onCloseMobile) onCloseMobile();
  };

  const isCurrent = (section: OfficeStaffSection) => activeSection === section;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        />
      )}

      {/* Sidebar Container */}
      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#091540] border-r border-[#1B2CC1]/25 text-white flex flex-col justify-between transition-transform duration-200 ease-in-out select-none shadow-2xl ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
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

          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-[#ABD2FA] hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Middle: Navigation Tree */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar text-sm font-medium">
          {/* Dashboard */}
          <button
            type="button"
            onClick={() => handleItemClick('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-left ${
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
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#7692FF] hover:text-white transition-colors"
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
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg transition-all text-left text-sm ${
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
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all text-left text-sm ${
                    isCurrent('operations-assignments')
                      ? 'bg-[#1B2CC1] text-white font-bold shadow-md shadow-[#1B2CC1]/40'
                      : 'text-[#ABD2FA]/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <HardHat className={`w-4 h-4 shrink-0 ${isCurrent('operations-assignments') ? 'text-white' : 'text-amber-300'}`} />
                  <span>Workforce Dispatch</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleItemClick('operations-finance')}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all text-left text-sm ${
                    isCurrent('operations-finance')
                      ? 'bg-[#1B2CC1] text-white font-bold shadow-md shadow-[#1B2CC1]/40'
                      : 'text-[#ABD2FA]/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <IndianRupee className={`w-4 h-4 shrink-0 ${isCurrent('operations-finance') ? 'text-white' : 'text-emerald-300'}`} />
                  <span>Finance &amp; Collections</span>
                </button>
              </div>
            )}
          </div>

          {/* Field Workers & Workforce (Unified) */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleItemClick('people-workers')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all text-left ${
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

          {/* Staff Profile */}
          <button
            type="button"
            onClick={() => handleItemClick('profile')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-left ${
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
                  isAvailable ? 'bg-emerald-400 shadow-sm' : 'bg-amber-400'
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
                className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-xs text-white transition-colors border border-white/20 font-medium"
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
                if (onCloseMobile) onCloseMobile();
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
    </>
  );
}
