'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  HardHat,
  UserCircle,
  FolderKanban,
  ClipboardCheck,
  Box,
  CalendarCheck,
  Activity,
  Coffee,
  BarChart3,
  Bell,
  ScrollText,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
  X,
  Radio,
} from 'lucide-react';

export type OfficeStaffSection =
  | 'dashboard'
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
  | 'activity-logs'
  | 'settings';

interface OfficeStaffSidebarProps {
  activeSection: OfficeStaffSection;
  onSelectSection: (section: OfficeStaffSection) => void;
  isAvailable?: boolean;
  onToggleAvailability?: () => void;
  userName?: string;
  userRole?: string;
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
  onLogout,
  unreadEnquiriesCount = 0,
  availableWorkersCount = 0,
  isOpenMobile = false,
  onCloseMobile,
}: OfficeStaffSidebarProps) {
  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({
    people: true,
    operations: true,
    workforce: true,
  });

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleItemClick = (section: OfficeStaffSection) => {
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
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0D0E12] border-r border-gray-800 text-gray-300 flex flex-col justify-between transition-transform duration-200 ease-in-out select-none ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top: Brand Header */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 relative flex items-center justify-center shrink-0">
              <Image src="/logos/logo-bg.png" alt="KK Group Logo" fill className="object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-gray-100 tracking-tight leading-tight">
                KK Group
              </span>
              <span className="text-[11px] text-gray-500 font-medium">
                Office Staff Portal
              </span>
            </div>
          </div>

          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
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
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors text-left ${
              isCurrent('dashboard')
                ? 'bg-[#1A1C23] text-white font-medium border border-gray-700/50'
                : 'text-gray-400 hover:bg-[#1A1C23] hover:text-gray-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Dashboard</span>
          </button>

          {/* People Group */}
          <div className="pt-3">
            <button
              type="button"
              onClick={() => toggleGroup('people')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-300 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5" />
                <span>People</span>
              </span>
              {openGroups.people ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {openGroups.people && (
              <div className="mt-1 space-y-0.5 pl-3 border-l border-gray-800 ml-3">
                <button
                  type="button"
                  onClick={() => handleItemClick('people-customers')}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors text-left text-sm ${
                    isCurrent('people-customers')
                      ? 'bg-[#1A1C23] text-white font-medium border border-gray-700/50'
                      : 'text-gray-400 hover:bg-[#1A1C23] hover:text-gray-200'
                  }`}
                >
                  <UserCircle className="w-4 h-4 shrink-0" />
                  <span>Customers</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleItemClick('people-workers')}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg transition-colors text-left text-sm ${
                    isCurrent('people-workers')
                      ? 'bg-[#1A1C23] text-white font-medium border border-gray-700/50'
                      : 'text-gray-400 hover:bg-[#1A1C23] hover:text-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <HardHat className="w-4 h-4 shrink-0" />
                    <span>Workers</span>
                  </div>
                  {availableWorkersCount > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-normal">
                      {availableWorkersCount}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Operations Group */}
          <div className="pt-3">
            <button
              type="button"
              onClick={() => toggleGroup('operations')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-300 transition-colors"
            >
              <span className="flex items-center gap-2">
                <FolderKanban className="w-3.5 h-3.5" />
                <span>Operations</span>
              </span>
              {openGroups.operations ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {openGroups.operations && (
              <div className="mt-1 space-y-0.5 pl-3 border-l border-gray-800 ml-3">
                <button
                  type="button"
                  onClick={() => handleItemClick('operations-enquiries')}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg transition-colors text-left text-sm ${
                    isCurrent('operations-enquiries')
                      ? 'bg-[#1A1C23] text-white font-medium border border-gray-700/50'
                      : 'text-gray-400 hover:bg-[#1A1C23] hover:text-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FolderKanban className="w-4 h-4 shrink-0" />
                    <span>Enquiries</span>
                  </div>
                  {unreadEnquiriesCount > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-normal">
                      {unreadEnquiriesCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleItemClick('operations-works')}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors text-left text-sm ${
                    isCurrent('operations-works')
                      ? 'bg-[#1A1C23] text-white font-medium border border-gray-700/50'
                      : 'text-gray-400 hover:bg-[#1A1C23] hover:text-gray-200'
                  }`}
                >
                  <FolderKanban className="w-4 h-4 shrink-0" />
                  <span>Works</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleItemClick('operations-assignments')}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors text-left text-sm ${
                    isCurrent('operations-assignments')
                      ? 'bg-[#1A1C23] text-white font-medium border border-gray-700/50'
                      : 'text-gray-400 hover:bg-[#1A1C23] hover:text-gray-200'
                  }`}
                >
                  <ClipboardCheck className="w-4 h-4 shrink-0" />
                  <span>Assignments</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleItemClick('operations-services')}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors text-left text-sm ${
                    isCurrent('operations-services')
                      ? 'bg-[#1A1C23] text-white font-medium border border-gray-700/50'
                      : 'text-gray-400 hover:bg-[#1A1C23] hover:text-gray-200'
                  }`}
                >
                  <Box className="w-4 h-4 shrink-0" />
                  <span>Services</span>
                </button>
              </div>
            )}
          </div>

          {/* Workforce Group */}
          <div className="pt-3">
            <button
              type="button"
              onClick={() => toggleGroup('workforce')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-300 transition-colors"
            >
              <span className="flex items-center gap-2">
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>Workforce</span>
              </span>
              {openGroups.workforce ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {openGroups.workforce && (
              <div className="mt-1 space-y-0.5 pl-3 border-l border-gray-800 ml-3">
                <button
                  type="button"
                  onClick={() => handleItemClick('workforce-attendance')}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors text-left text-sm ${
                    isCurrent('workforce-attendance')
                      ? 'bg-[#1A1C23] text-white font-medium border border-gray-700/50'
                      : 'text-gray-400 hover:bg-[#1A1C23] hover:text-gray-200'
                  }`}
                >
                  <CalendarCheck className="w-4 h-4 shrink-0" />
                  <span>Attendance</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleItemClick('workforce-availability')}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors text-left text-sm ${
                    isCurrent('workforce-availability')
                      ? 'bg-[#1A1C23] text-white font-medium border border-gray-700/50'
                      : 'text-gray-400 hover:bg-[#1A1C23] hover:text-gray-200'
                  }`}
                >
                  <Activity className="w-4 h-4 shrink-0" />
                  <span>Availability</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleItemClick('workforce-leave')}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors text-left text-sm ${
                    isCurrent('workforce-leave')
                      ? 'bg-[#1A1C23] text-white font-medium border border-gray-700/50'
                      : 'text-gray-400 hover:bg-[#1A1C23] hover:text-gray-200'
                  }`}
                >
                  <Coffee className="w-4 h-4 shrink-0" />
                  <span>Leave</span>
                </button>
              </div>
            )}
          </div>

          <div className="my-3 border-t border-gray-800" />

          {/* Reports */}
          <button
            type="button"
            onClick={() => handleItemClick('reports')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors text-left ${
              isCurrent('reports')
                ? 'bg-[#1A1C23] text-white font-medium border border-gray-700/50'
                : 'text-gray-400 hover:bg-[#1A1C23] hover:text-gray-200'
            }`}
          >
            <BarChart3 className="w-4 h-4 shrink-0" />
            <span>Reports</span>
          </button>

          {/* Notifications */}
          <button
            type="button"
            onClick={() => handleItemClick('notifications')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors text-left ${
              isCurrent('notifications')
                ? 'bg-[#1A1C23] text-white font-medium border border-gray-700/50'
                : 'text-gray-400 hover:bg-[#1A1C23] hover:text-gray-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 shrink-0" />
              <span>Notifications</span>
            </div>
            {unreadEnquiriesCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-blue-500" />
            )}
          </button>

          {/* Activity Logs */}
          <button
            type="button"
            onClick={() => handleItemClick('activity-logs')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors text-left ${
              isCurrent('activity-logs')
                ? 'bg-[#1A1C23] text-white font-medium border border-gray-700/50'
                : 'text-gray-400 hover:bg-[#1A1C23] hover:text-gray-200'
            }`}
          >
            <ScrollText className="w-4 h-4 shrink-0" />
            <span>Activity Logs</span>
          </button>

          {/* Settings */}
          <button
            type="button"
            onClick={() => handleItemClick('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors text-left ${
              isCurrent('settings')
                ? 'bg-[#1A1C23] text-white font-medium border border-gray-700/50'
                : 'text-gray-400 hover:bg-[#1A1C23] hover:text-gray-200'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Settings</span>
          </button>
        </div>

        {/* Bottom Section: Availability and User */}
        <div className="p-4 border-t border-gray-800 space-y-3 bg-[#0a0b0e]">
          {/* Status Indicator & Change */}
          <div className="p-2.5 rounded-xl bg-[#14161d] border border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  isAvailable ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-gray-200 truncate">
                  {isAvailable ? 'Available' : 'Unavailable'}
                </span>
                <span className="text-[11px] text-gray-500 truncate">
                  {isAvailable ? 'Ready for tasks' : 'Off duty'}
                </span>
              </div>
            </div>

            {onToggleAvailability && (
              <button
                type="button"
                onClick={onToggleAvailability}
                className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 hover:text-white transition-colors border border-gray-700/60"
              >
                Change
              </button>
            )}
          </div>

          {/* User profile row */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center font-medium text-gray-300 text-xs shrink-0">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-gray-200 truncate">
                  {userName}
                </span>
                <span className="text-[11px] text-gray-500 truncate">
                  Office Staff
                </span>
              </div>
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Log out"
                className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
