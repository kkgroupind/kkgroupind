'use client';

import React, { useState } from 'react';
import { Sidebar } from './sidebar';
import { Navbar } from './navbar';
import { useAdminTheme } from '@/context/admin-theme-context';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false); // Desktop
  const { isDark } = useAdminTheme();

  return (
    <div
      className={`flex h-screen overflow-hidden transition-colors duration-200 ${
        isDark ? 'bg-[#0D0E12] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'
      }`}
    >
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Wrapper */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          onClose={() => setIsSidebarOpen(false)}
          isCollapsed={isDesktopCollapsed}
          onToggleCollapse={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
        />
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden w-full">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main
          className={`flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar transition-colors duration-200 ${
            isDark ? 'bg-[#0D0E12]' : 'bg-[#F8FAFC]'
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
