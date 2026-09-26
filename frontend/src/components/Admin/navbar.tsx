'use client';

import React from 'react';
import NextLink from 'next/link';
import { Search, Bell, Settings, MessageSquare, Sun, Moon, Menu } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useAdminTheme } from '@/context/admin-theme-context';

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user } = useAuth();
  const { theme, setTheme, toggleTheme, isDark } = useAdminTheme();

  return (
    <header
      className={`h-20 flex items-center justify-between px-4 lg:px-8 border-b shrink-0 transition-colors duration-200 ${
        isDark
          ? 'bg-[#0D0E12] border-gray-800 text-gray-200'
          : 'bg-white border-slate-200 text-slate-800 shadow-sm'
      }`}
    >
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className={`lg:hidden p-2 transition-colors rounded-xl shadow-sm border ${
            isDark
              ? 'text-gray-400 hover:text-gray-100 bg-[#1A1C23] border-gray-800'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100 border-slate-200'
          }`}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div
          className={`relative w-full max-w-md hidden sm:flex items-center rounded-full p-1 border transition-colors ${
            isDark
              ? 'bg-[#1A1C23] border-gray-800'
              : 'bg-slate-100 border-slate-200'
          }`}
        >
          <div className="pl-4 flex items-center pointer-events-none">
            <Search className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-slate-500'}`} />
          </div>
          <input
            type="text"
            placeholder="Search resources, workers, orders..."
            className={`block w-full pl-3 pr-4 py-2 border-none bg-transparent text-sm focus:outline-none focus:ring-0 ${
              isDark
                ? 'text-gray-200 placeholder-gray-500'
                : 'text-slate-900 placeholder-slate-400 font-medium'
            }`}
          />
          <button
            className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-colors cursor-pointer ${
              isDark
                ? 'bg-[#2A2D35] hover:bg-[#3A3D45] text-gray-300'
                : 'bg-white hover:bg-slate-200 text-slate-700 shadow-sm'
            }`}
          >
            Search
          </button>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 lg:gap-4 ml-4">
        {/* Mobile Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className={`sm:hidden p-2.5 rounded-full border transition-all cursor-pointer ${
            isDark
              ? 'bg-[#1A1C23] border-gray-800 text-amber-400 hover:text-amber-300'
              : 'bg-slate-100 border-slate-200 text-[#2A835F] hover:text-[#236D4F]'
          }`}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Desktop Theme Switcher Pill */}
        <div
          className={`hidden sm:flex items-center gap-1 rounded-full p-1 border transition-colors ${
            isDark
              ? 'bg-[#1A1C23] border-gray-800'
              : 'bg-slate-100 border-slate-200'
          }`}
        >
          <button
            type="button"
            onClick={() => setTheme('light')}
            title="Light Theme"
            className={`p-2 rounded-full transition-all cursor-pointer ${
              !isDark
                ? 'bg-white text-amber-600 shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            title="Dark Theme"
            className={`p-2 rounded-full transition-all cursor-pointer ${
              isDark
                ? 'bg-[#2A835F] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-700 hover:bg-black/5'
            }`}
          >
            <Moon className="w-4 h-4" />
          </button>
        </div>

        {/* Notifications & Settings Group */}
        <div
          className={`flex items-center gap-1.5 rounded-full p-1 border px-2 transition-colors ${
            isDark
              ? 'bg-[#1A1C23] border-gray-800 text-gray-400'
              : 'bg-slate-100 border-slate-200 text-slate-600'
          }`}
        >
          <button
            className={`p-2 transition-colors rounded-full relative cursor-pointer ${
              isDark ? 'hover:text-gray-200' : 'hover:text-slate-900'
            }`}
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#2A835F] rounded-full"></span>
          </button>
          <button
            className={`p-2 transition-colors rounded-full cursor-pointer ${
              isDark ? 'hover:text-gray-200' : 'hover:text-slate-900'
            }`}
            title="Messages"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <NextLink
            href="/admin/settings"
            className={`p-2 transition-colors rounded-full ${
              isDark ? 'hover:text-gray-200' : 'hover:text-slate-900'
            }`}
            title="Admin Settings & Profile"
          >
            <Settings className="w-4 h-4" />
          </NextLink>
        </div>
      </div>
    </header>
  );
}
