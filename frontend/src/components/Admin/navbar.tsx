'use client';

import React, { useState, useEffect } from 'react';
import NextLink from 'next/link';
import { Search, Bell, Settings, Maximize, Minimize, Menu } from 'lucide-react';

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  return (
    <header className="h-20 flex items-center justify-between px-4 lg:px-8 border-b shrink-0 bg-[#0D0E12] border-gray-800 text-gray-200">
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 transition-colors rounded-xl shadow-sm border text-gray-400 hover:text-gray-100 bg-[#1A1C23] border-gray-800"
          aria-label="Toggle Mobile Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div className="relative w-full max-w-md hidden sm:flex items-center rounded-full p-1 border bg-[#1A1C23] border-gray-800">
          <div className="pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search resources, workers, orders..."
            className="block w-full pl-3 pr-4 py-2 border-none bg-transparent text-sm focus:outline-none focus:ring-0 text-gray-200 placeholder-gray-500"
          />
          <button
            className="text-xs font-semibold px-4 py-1.5 rounded-full transition-colors cursor-pointer bg-[#2A2D35] hover:bg-[#3A3D45] text-gray-300"
          >
            Search
          </button>
        </div>
      </div>

      {/* Right Actions: Only Fullscreen, Notifications, and Settings */}
      <div className="flex items-center gap-2.5 sm:gap-3 ml-4">
        {/* Fullscreen Toggle Button */}
        <button
          onClick={handleToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          className="p-2.5 rounded-xl border border-gray-800 bg-[#14151A] hover:bg-[#1A1C23] text-gray-400 hover:text-gray-100 transition-colors shadow-sm flex items-center justify-center cursor-pointer"
          aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? (
            <Minimize className="w-4 h-4 text-emerald-400" />
          ) : (
            <Maximize className="w-4 h-4" />
          )}
        </button>

        {/* Notifications Button */}
        <NextLink
          href="/admin/communications/notifications"
          className="p-2.5 rounded-xl border border-gray-800 bg-[#14151A] hover:bg-[#1A1C23] text-gray-400 hover:text-gray-100 transition-colors relative shadow-sm flex items-center justify-center cursor-pointer"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#7B4DFF] rounded-full ring-2 ring-[#0D0E12] animate-pulse" />
        </NextLink>

        {/* Settings Button */}
        <NextLink
          href="/admin/settings"
          className="p-2.5 rounded-xl border border-gray-800 bg-[#14151A] hover:bg-[#1A1C23] text-gray-400 hover:text-gray-100 transition-colors shadow-sm flex items-center justify-center cursor-pointer"
          title="Admin Settings & Profile"
          aria-label="Admin Settings & Profile"
        >
          <Settings className="w-4 h-4" />
        </NextLink>
      </div>
    </header>
  );
}
