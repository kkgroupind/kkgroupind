'use client';

import React from 'react';
import {
  Bell,
  Home,
  FileText,
  BarChart2,
  Activity,
  PlayCircle,
  LogOut,
} from 'lucide-react';

interface WorkerSidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onLogout?: () => void;
  hasNotifications?: boolean;
}

export function WorkerSidebar({
  activeTab = 'home',
  onTabChange,
  onLogout,
  hasNotifications = true,
}: WorkerSidebarProps) {
  const navItems = [
    { id: 'home', icon: Home, label: 'Dashboard' },
    { id: 'tasks', icon: FileText, label: 'Work Orders' },
    { id: 'analytics', icon: BarChart2, label: 'Performance' },
    { id: 'activity', icon: Activity, label: 'Live Operations' },
    { id: 'training', icon: PlayCircle, label: 'Field Protocols' },
  ];

  return (
    <aside
      aria-label="Worker navigation"
      className="w-16 sm:w-20 bg-gradient-to-b from-[#0B1E24] via-[#134B4C] to-[#0B1E24] rounded-[32px] sm:rounded-[36px] p-3 sm:p-4 flex flex-col items-center justify-between shadow-[0_20px_40px_rgba(11,30,36,0.4)] border border-[#134B4C]/60 shrink-0 select-none py-6 text-white"
    >
      {/* Top: Notification Bell Button */}
      <div className="flex flex-col items-center gap-6 w-full">
        <button
          type="button"
          onClick={() => onTabChange?.('notifications')}
          aria-label="Notifications"
          className="relative w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer shadow-inner border border-white/10"
        >
          <Bell className="w-5 h-5 text-white/95" />
          {hasNotifications && (
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#88B793] ring-2 ring-[#0B1E24]" />
          )}
        </button>

        {/* Center Nav Icons */}
        <nav className="flex flex-col items-center gap-3.5 w-full mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange?.(item.id)}
                title={item.label}
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#2A835F] text-white shadow-lg shadow-black/25 scale-105 border border-[#88B793]/40'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Logout / Exit Button */}
      <div className="w-full flex flex-col items-center pt-4 border-t border-white/15">
        <button
          type="button"
          onClick={onLogout}
          title="Sign Out"
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/10 hover:bg-rose-500/80 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
}
