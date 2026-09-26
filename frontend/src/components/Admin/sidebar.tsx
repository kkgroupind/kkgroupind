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
  ] },
  { name: 'People', icon: Users, subItems: [
      { name: 'Workers', icon: HardHat, href: '/admin/people/workers' },
      { name: 'Office Staff', icon: Briefcase, href: '/admin/people/office-staff' },
      { name: 'Customers', icon: UserCircle, href: '/admin/people/customers' },
    ] },
  { name: 'Operations', icon: ClipboardList, subItems: [
      { name: 'Enquiries', icon: Inbox, href: '/admin/operations/enquiries' },
      { name: 'Work Orders', icon: FolderKanban, href: '/admin/operations/work-orders' },
      { name: 'Assignments', icon: ClipboardCheck, href: '/admin/operations/assignments' },
      { name: 'Services', icon: Layers, href: '/admin/services' },
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
  { name: 'Businesses', icon: Building2, subItems: [
      { name: 'Business Units', icon: Building, href: '/admin/businesses/units' },
      { name: 'Departments', icon: Factory, href: '/admin/businesses/departments' },
    ] },
  { name: 'Finance', icon: IndianRupee, href: '/admin/finance' },
  { name: 'Inventory', icon: Package, href: '/admin/inventory' },
  { name: 'Website', icon: Globe, href: '/admin/website' },
  { name: 'Reports', icon: BarChart3, href: '/admin/reports' },
  { type: 'divider' },
  { name: 'Access Control', icon: Lock, href: '/admin/access-control' },
  { name: 'Settings', icon: Settings, href: '/admin/settings' },
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
  const isActive =
    pathname === item.href ||
    (hasSubItems && item.subItems.some((sub: any) => pathname.startsWith(sub.href)));

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
              const isSubActive = pathname === sub.href;
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
      className={`flex-shrink-0 border-r flex flex-col h-full overflow-y-auto custom-scrollbar transition-all duration-300 ${
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

      {/* Navigation */}
      <nav className={`flex-1 pb-6 ${isCollapsed ? 'px-1' : 'px-2'}`}>
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

      {/* User Profile Footer */}
      <div
        className={`p-6 border-t flex flex-col gap-4 ${
          isDark ? 'border-gray-800' : 'border-slate-200'
        } ${isCollapsed ? 'items-center px-2' : ''}`}
      >
        <button
          onClick={handleLogout}
          title={isCollapsed ? 'Log out' : undefined}
          className={`flex items-center gap-3 py-2 rounded-xl transition-colors font-medium text-sm w-full cursor-pointer ${
            isDark
              ? 'text-gray-400 hover:text-red-400 hover:bg-[#1A1C23]'
              : 'text-slate-600 hover:text-red-600 hover:bg-red-50'
          } ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>Log out</span>}
        </button>
        <Link
          href="/admin/settings"
          title="Open Admin Profile & Settings"
          className={`flex items-center p-2 rounded-xl transition-colors ${
            isDark ? 'hover:bg-[#1A1C23]' : 'hover:bg-slate-100'
          } ${isCollapsed ? 'justify-center' : 'gap-3'}`}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2A835F] to-emerald-600 p-[2px] shrink-0">
            <div
              className={`w-full h-full rounded-full flex items-center justify-center font-bold text-sm ${
                isDark ? 'bg-[#1A1C23] text-white' : 'bg-white text-[#2A835F]'
              }`}
            >
              {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
            </div>
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden text-left">
              <p
                className={`text-sm font-semibold truncate ${
                  isDark ? 'text-gray-200' : 'text-slate-900'
                }`}
              >
                {user?.name || user?.username || 'Super Admin'}
              </p>
              <p
                className={`text-xs truncate ${
                  isDark ? 'text-gray-500' : 'text-slate-500'
                }`}
              >
                {user?.email || `@${user?.username || 'admin'}`}
              </p>
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
}
