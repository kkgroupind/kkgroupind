'use client';

import React from 'react';
import { Search, RefreshCw } from 'lucide-react';

interface WorkerHeaderProps {
  userName?: string;
  userAvatar?: string;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  onProfileClick?: () => void;
  onReload?: () => void;
  isReloading?: boolean;
}

export function WorkerHeader({
  userName = 'Worker',
  userAvatar,
  searchQuery = '',
  onSearchChange,
  onProfileClick,
  onReload,
  isReloading = false,
}: WorkerHeaderProps) {
  return (
    <header className="w-full flex items-center justify-between gap-4 select-none">
      {/* Left: Primary / Dashboard Title */}
      <div className="flex flex-col">
        <span className="text-[11px] font-semibold text-slate-400 tracking-wider">
          Primary
        </span>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
          Dashboard
        </h1>
      </div>

      {/* Right: Search Pill, Reload Button & User Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Bar Pill */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-32 sm:w-56 pl-9 pr-4 py-2 text-xs font-semibold rounded-full bg-white text-slate-800 placeholder-slate-400 border border-slate-200/80 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#2A835F]/20 focus:border-[#2A835F] transition-all"
          />
        </div>

        {/* Reload Button */}
        {onReload && (
          <button
            type="button"
            onClick={onReload}
            disabled={isReloading}
            title="Reload & Sync Dashboard Data"
            aria-label="Reload dashboard data"
            className="w-9 h-9 rounded-full bg-white text-slate-600 hover:text-[#2A835F] border border-slate-200/80 shadow-xs flex items-center justify-center transition-all cursor-pointer hover:border-[#88B793] active:scale-95 disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isReloading ? 'animate-spin text-[#2A835F]' : ''}`} />
          </button>
        )}

        {/* User Avatar */}
        <button
          type="button"
          onClick={onProfileClick}
          aria-label="User profile"
          className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md hover:scale-105 transition-transform cursor-pointer bg-slate-200 flex items-center justify-center shrink-0"
        >
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <span className="text-[#2A835F] font-black text-sm">
              {(userName || 'W').charAt(0).toUpperCase()}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
