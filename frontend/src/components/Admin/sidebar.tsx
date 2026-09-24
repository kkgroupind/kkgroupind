'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
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
  ] },
  { name: 'People', icon: Users, subItems: [
      { name: 'Workers', icon: HardHat, href: '/admin/people/workers' },
      { name: 'Office Staff', icon: Briefcase, href: '/admin/people/office-staff' },
      { name: 'Customers', icon: UserCircle, href: '/admin/people/customers' },
    ] },
    { name: 'Operations', icon: ClipboardList, subItems: [
        { name: 'Enquiries', icon: FolderKanban, href: '/admin/operations/enquiries' },
        { name: 'Work Orders', icon: FolderKanban, href: '/admin/operations/work-orders' },
        { name: 'Assignments', icon: ClipboardCheck, href: '/admin/operations/assignments' },
        { name: 'Services', icon: Box, href: '/admin/operations/services' },
      ] },
    { name: 'Attendance & Availability', icon: ClipboardList, subItems: [
        { name: 'Attendances', icon: FolderKanban, href: '/admin/attendance' },
        { name: 'Availabilities', icon: FolderKanban, href: '/admin/availability' },
        { name: 'Leaves', icon: ClipboardCheck, href: '/admin/leaves' },
      ] },
  { name: 'Communications', icon: Building2, subItems: [
      { name: 'Notifications', icon: Building, href: '/admin/businesses/units' },
      { name: 'Announcements', icon: Factory, href: '/admin/businesses/departments' },
      { name: 'Complaints & Feedback', icon: Factory, href: '/admin/businesses/departments' },
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

const MenuItem = ({ item, pathname, onClose, isCollapsed }: any) => {
  if (item.type === 'divider') {
    return <div className={`h-px bg-gray-800 my-4 ${isCollapsed ? 'mx-2' : 'mx-4'}`} />;
  }

  const hasSubItems = !!item.subItems;
  const isActive = pathname === item.href || (hasSubItems && item.subItems.some((sub: any) => pathname.startsWith(sub.href)));

  if (hasSubItems) {
    return (
      <li className="mb-4">
        <div
          className={`flex items-center ${isCollapsed ? 'justify-center px-0 py-3' : 'px-4 py-2'} text-gray-500`}
          title={isCollapsed ? item.name : undefined}
        >
          {isCollapsed ? (
            <item.icon className={`w-5 h-5 ${isActive ? 'text-[#7B4DFF]' : 'text-gray-500'}`} />
          ) : (
            <span className="font-semibold text-xs uppercase tracking-wider">{item.name}</span>
          )}
        </div>
        {!isCollapsed && (
          <ul className="mt-1 space-y-1">
            {item.subItems.map((sub: any) => {
              const SubIcon = sub.icon;
              return (
                <li key={sub.name}>
                  <Link
                    href={sub.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-2.5 mx-2 text-sm rounded-xl transition-colors ${
                      pathname === sub.href
                        ? 'bg-[#1A1C23] text-[#7B4DFF] font-medium border border-gray-700/50'
                        : 'text-gray-400 hover:bg-[#1A1C23] hover:text-gray-200'
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
        className={`flex items-center ${isCollapsed ? 'justify-center px-0 py-3 mx-2' : 'px-4 py-2.5 mx-2'} rounded-xl transition-all duration-200 ${
          isActive
            ? 'bg-[#1A1C23] text-[#7B4DFF] font-medium border border-gray-700/50'
            : 'text-gray-400 hover:bg-[#1A1C23] hover:text-gray-200'
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

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  return (
    <aside className={`flex-shrink-0 bg-[#0D0E12] border-r border-gray-800 flex flex-col h-full overflow-y-auto custom-scrollbar transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72 lg:w-64'}`}>
      {/* Logo & Close Button */}
      <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 relative flex items-center justify-center shrink-0">
            <Image src="/logos/logo-bg.png" alt="KK Group Logo" fill className="object-contain" />
          </div>
          {!isCollapsed && <span className="text-xl font-semibold text-gray-100 tracking-tight whitespace-nowrap">KK Group</span>}
        </div>
        {/* Desktop Collapse Toggle */}
        {!isCollapsed && onToggleCollapse && (
          <button 
            onClick={onToggleCollapse}
            className="hidden lg:block p-1 text-gray-500 hover:text-gray-300 transition-colors shrink-0"
          >
            <ChevronsLeft className="w-5 h-5" />
          </button>
        )}
        {/* Mobile Close Button */}
        {onClose && !isCollapsed && (
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-900 transition-colors bg-gray-50 rounded-lg shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {isCollapsed && onToggleCollapse && (
        <div className="flex justify-center mb-4 hidden lg:flex">
           <button 
              onClick={onToggleCollapse}
              className="p-2 text-gray-500 hover:text-gray-300 hover:bg-[#1A1C23] rounded-lg transition-colors"
           >
              <Menu className="w-5 h-5" />
           </button>
        </div>
      )}

      {/* Navigation */}
      <nav className={`flex-1 pb-6 ${isCollapsed ? 'px-1' : 'px-2'}`}>
        <ul>
          {menuData.map((item, idx) => (
            <MenuItem key={idx} item={item} pathname={pathname} onClose={onClose} isCollapsed={isCollapsed} />
          ))}
        </ul>
      </nav>

      {/* User Profile Footer */}
      <div className={`p-6 border-t border-gray-800 flex flex-col gap-4 ${isCollapsed ? 'items-center px-2' : ''}`}>
        <button
           onClick={handleLogout}
           title={isCollapsed ? "Log out" : undefined}
           className={`flex items-center gap-3 py-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-[#1A1C23] transition-colors font-medium text-sm w-full ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
         >
           <LogOut className="w-5 h-5 shrink-0" />
           {!isCollapsed && <span>Log out</span>}
        </button>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
           <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 font-bold shrink-0">
             {user?.username ? user.username.charAt(0).toUpperCase() : 'O'}
           </div>
           {!isCollapsed && (
             <div className="overflow-hidden">
               <p className="text-sm font-semibold text-gray-200 truncate">{user?.username || 'Austin Martin'}</p>
               <p className="text-xs text-gray-500 truncate">austinm@gmail.com</p>
             </div>
           )}
        </div>
      </div>
    </aside>
  );
}
