'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useAdminTheme } from '@/context/admin-theme-context';
import {
  LayoutDashboard,
  Users,
  HardHat,
  Briefcase,
  UserCircle,
  Building2,
  Building,
  Factory,
  ClipboardList,
  FolderKanban,
  ClipboardCheck,
  Box,
  Clock,
  IndianRupee,
  Package,
  Globe,
  BarChart3,
  Inbox,
  CalendarCheck,
  Activity,
  Coffee,
  Bell,
  Megaphone,
  MessageSquare,
  Layers,
  Lock,
  ShieldCheck,
  Settings,
  LogOut,
  X,
  ChevronsLeft,
  Menu,
} from 'lucide-react';

const menuData = [
  { name: 'Overview', icon: LayoutDashboard, subItems: [
      { name: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
      { name: 'Services', icon: Layers, href: '/admin/services' },
      { name: 'Site Settings', icon: Settings, href: '/admin/settings?tab=site' },
  ] },
  { name: 'People', icon: Users, subItems: [
      { name: 'Workers', icon: HardHat, href: '/admin/people/workers' },
      { name: 'Office Staff', icon: Briefcase, href: '/admin/people/office-staff' },
      { name: 'Customers', icon: UserCircle, href: '/admin/people/customers' },
    ] },
  { name: 'Operations', icon: ClipboardList, subItems: [
      { name: 'Job Orders', icon: FolderKanban, href: '/admin/operations/enquiries' },
      { name: 'Workforce Dispatch', icon: HardHat, href: '/admin/operations/assignments' },
    ] },
  { name: 'Attendance & Availability', icon: CalendarCheck, subItems: [
      { name: 'Attendances', icon: CalendarCheck, href: '/admin/attendance' },
      { name: 'Availabilities', icon: Activity, href: '/admin/availability' },
      { name: 'Leaves', icon: Coffee, href: '/admin/leaves' },
    ] },
  { name: 'Communications', icon: MessageSquare, subItems: [
      { name: 'Notifications', icon: Bell, href: '/admin/communications/notifications' },
      { name: 'Announcements', icon: Megaphone, href: '/admin/communications/announcements' },
      { name: 'Complaints & Feedback', icon: MessageSquare, href: '/admin/communications/feedback' },
    ] },
  { name: 'Business & Finance', icon: Building2, subItems: [
      { name: 'Finance', icon: IndianRupee, href: '/admin/finance' },
      { name: 'Reports', icon: BarChart3, href: '/admin/reports' },
    ] },
  { type: 'divider' },
  { name: 'Audit Logs', icon: ShieldCheck, href: '/admin/audit-logs' },
];

interface SidebarProps {
  onClose?: () => void; // Mobile close
  isCollapsed?: boolean;
  onToggleCollapse?: () => void; // Desktop toggle
}

const MenuItem = ({ item, pathname, onClose, isCollapsed, isDark }: any) => {
  if (item.type === 'divider') {
    return (
      <div
        className={`h-px my-4 transition-colors ${
          isDark ? 'bg-gray-800' : 'bg-slate-200'
        } ${isCollapsed ? 'mx-2' : 'mx-4'}`}
      />
    );
  }

  const hasSubItems = !!item.subItems;
  const itemBaseHref = item.href ? item.href.split('?')[0] : '';
  const isActive =
    (item.href && (pathname === item.href || (item.href.includes('?') && pathname === itemBaseHref))) ||
    (hasSubItems && item.subItems.some((sub: any) => pathname.startsWith(sub.href.split('?')[0])));

  if (hasSubItems) {
    return (
      <li className="mb-4">
        <div
          className={`flex items-center ${
            isCollapsed ? 'justify-center px-0 py-3' : 'px-4 py-2'
          } ${isDark ? 'text-gray-500' : 'text-slate-400'}`}
          title={isCollapsed ? item.name : undefined}
        >
          {isCollapsed ? (
            <item.icon
              className={`w-5 h-5 ${
                isActive ? 'text-[#2A835F]' : isDark ? 'text-gray-500' : 'text-slate-400'
              }`}
            />
          ) : (
            <span className="font-semibold text-xs uppercase tracking-wider">{item.name}</span>
          )}
        </div>
        {!isCollapsed && (
          <ul className="mt-1 space-y-1">
            {item.subItems.map((sub: any) => {
              const SubIcon = sub.icon;
              const subBaseHref = sub.href.split('?')[0];
              const isSubActive = pathname === sub.href || (sub.href.includes('?') && pathname === subBaseHref);
              return (
                <li key={sub.name}>
                  <Link
                    href={sub.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-2.5 mx-2 text-sm rounded-xl transition-all ${
                      isSubActive
                        ? isDark
                          ? 'bg-[#2A835F]/15 text-[#2A835F] font-semibold border border-[#2A835F]/30'
                          : 'bg-[#EBF6F1] text-[#2A835F] font-semibold border border-[#2A835F]/25 shadow-xs'
                        : isDark
                        ? 'text-gray-400 hover:bg-[#1A1C23] hover:text-gray-200'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {SubIcon && <SubIcon className="w-4 h-4" />}
                    <span>{sub.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li className="mb-1">
      <Link
        href={item.href}
        onClick={onClose}
        title={isCollapsed ? item.name : undefined}
        className={`flex items-center ${
          isCollapsed ? 'justify-center px-0 py-3 mx-2' : 'px-4 py-2.5 mx-2'
        } rounded-xl transition-all duration-200 ${
          isActive
            ? isDark
              ? 'bg-[#2A835F]/15 text-[#2A835F] font-semibold border border-[#2A835F]/30'
              : 'bg-[#EBF6F1] text-[#2A835F] font-semibold border border-[#2A835F]/25 shadow-xs'
            : isDark
            ? 'text-gray-400 hover:bg-[#1A1C23] hover:text-gray-200'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        <div className="flex items-center gap-3">
          <item.icon className="w-5 h-5" />
          {!isCollapsed && <span className="font-medium text-sm">{item.name}</span>}
        </div>
      </Link>
    </li>
  );
};

export function Sidebar({ onClose, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const router = useRouter();
  const { isDark } = useAdminTheme();

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  return (
    <aside
      className={`flex-shrink-0 border-r flex flex-col h-full overflow-hidden transition-all duration-300 ${
        isDark ? 'bg-[#0D0E12] border-gray-800' : 'bg-white border-slate-200 shadow-sm'
      } ${isCollapsed ? 'w-20' : 'w-72 lg:w-64'}`}
    >
      {/* Logo & Close Button */}
      <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 relative flex items-center justify-center shrink-0">
            <Image src="/logos/logo-bg.png" alt="KK Group Logo" fill className="object-contain" />
          </div>
          {!isCollapsed && (
            <span
              className={`text-xl font-bold tracking-tight whitespace-nowrap ${
                isDark ? 'text-gray-100' : 'text-slate-900'
              }`}
            >
              KK Group
            </span>
          )}
        </div>
        {/* Desktop Collapse Toggle */}
        {!isCollapsed && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className={`hidden lg:block p-1 transition-colors shrink-0 ${
              isDark ? 'text-gray-500 hover:text-gray-300' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <ChevronsLeft className="w-5 h-5" />
          </button>
        )}
        {/* Mobile Close Button */}
        {onClose && !isCollapsed && (
          <button
            onClick={onClose}
            className={`lg:hidden p-2 rounded-lg shrink-0 transition-colors ${
              isDark
                ? 'text-gray-400 hover:text-gray-100 bg-[#1A1C23]'
                : 'text-slate-500 hover:text-slate-900 bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {isCollapsed && onToggleCollapse && (
        <div className="flex justify-center mb-4 hidden lg:flex">
          <button
            onClick={onToggleCollapse}
            className={`p-2 rounded-lg transition-colors ${
              isDark
                ? 'text-gray-500 hover:text-gray-300 hover:bg-[#1A1C23]'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Navigation (Scrollable in middle) */}
      <nav className={`flex-1 overflow-y-auto custom-scrollbar pb-4 ${isCollapsed ? 'px-1' : 'px-2'}`}>
        <ul>
          {menuData.map((item, idx) => (
            <MenuItem
              key={idx}
              item={item}
              pathname={pathname}
              onClose={onClose}
              isCollapsed={isCollapsed}
              isDark={isDark}
            />
          ))}
        </ul>
      </nav>

      {/* Fixed Bottom Profile & Logout Footer */}
      <div
        className={`p-3.5 border-t border-gray-800 bg-[#0D0E12] shrink-0 flex flex-col gap-2 ${
          isCollapsed ? 'items-center px-2' : ''
        }`}
      >
        {/* 1. Admin Profile Card */}
        <Link
          href="/admin/settings"
          title="Open Admin Profile & Settings"
          className={`flex items-center p-2 rounded-xl transition-all bg-[#14151A] hover:bg-[#1A1C23] border border-gray-800/80 hover:border-gray-700/80 ${
            isCollapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2.5'
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7B4DFF] to-indigo-600 p-[2px] shrink-0 shadow-inner">
            <div className="w-full h-full rounded-xl flex items-center justify-center font-bold text-xs bg-[#181920] text-white">
              {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
            </div>
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden text-left flex-1 min-w-0">
              <p className="text-xs font-bold truncate text-gray-100">
                {user?.name || user?.username || 'Super Admin'}
              </p>
              <p className="text-[11px] truncate text-gray-400 font-mono">
                {user?.email || `@${user?.username || 'admin'}`}
              </p>
            </div>
          )}
        </Link>

        {/* 2. Logout Button (Below Profile, in Red) */}
        <button
          onClick={handleLogout}
          title={isCollapsed ? 'Log out' : undefined}
          className={`flex items-center gap-2.5 py-2 px-3 rounded-xl transition-all font-semibold text-xs w-full cursor-pointer bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-500/30 shadow-xs ${
            isCollapsed ? 'justify-center px-0 py-2' : ''
          }`}
        >
          <LogOut className="w-4 h-4 shrink-0 text-rose-400" />
          {!isCollapsed && <span>Log out</span>}
        </button>
      </div>
    </aside>
  );
}
