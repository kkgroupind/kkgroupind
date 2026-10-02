'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useAdminTheme } from '@/context/admin-theme-context';
import { EnquiryService, NotificationService, FinanceService } from '@/services';
import { PwaInstallButton } from '@/components/PwaInstall';
import {
  LayoutDashboard,
  Users,
  HardHat,
  Briefcase,
  UserCircle,
  Building2,
  ClipboardList,
  FolderKanban,
  CalendarCheck,
  Activity,
  Coffee,
  Bell,
  Megaphone,
  MessageSquare,
  Layers,
  ShieldCheck,
  Settings,
  LogOut,
  X,
  ChevronsLeft,
  Menu,
  IndianRupee,
  BarChart3,
  CalendarClock,
} from 'lucide-react';

interface SidebarIndicators {
  pendingPayoutCount: number;
  pendingEnquiriesCount: number;
  unreadNotificationsCount: number;
  pendingFinanceCount: number;
}

const buildMenuData = (indicators: SidebarIndicators) => [
  {
    name: 'Overview',
    icon: LayoutDashboard,
    subItems: [
      { name: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
      { name: 'Services', icon: Layers, href: '/admin/services' },
      { name: 'Site Settings', icon: Settings, href: '/admin/settings?tab=site' },
    ],
  },
  {
    name: 'People',
    icon: Users,
    subItems: [
      { name: 'Workers', icon: HardHat, href: '/admin/people/workers' },
      { name: 'Office Staff', icon: Briefcase, href: '/admin/people/office-staff' },
      { name: 'Customers', icon: UserCircle, href: '/admin/people/customers' },
    ],
  },
  {
    name: 'Operations',
    icon: ClipboardList,
    hasAlert: indicators.pendingPayoutCount > 0 || indicators.pendingEnquiriesCount > 0,
    badgeVariant: indicators.pendingPayoutCount > 0 ? ('amber' as const) : ('blue' as const),
    badgeCount: indicators.pendingPayoutCount || indicators.pendingEnquiriesCount,
    subItems: [
      {
        name: 'Work Orders',
        icon: Briefcase,
        href: '/admin/operations/work-orders',
        badge: indicators.pendingPayoutCount > 0 ? indicators.pendingPayoutCount : undefined,
        badgeVariant: 'amber' as const,
        badgePulse: true,
        badgeLabel: `${indicators.pendingPayoutCount} completed ${
          indicators.pendingPayoutCount === 1 ? 'work order' : 'work orders'
        } awaiting worker payout`,
      },
      {
        name: 'Job Orders',
        icon: FolderKanban,
        href: '/admin/operations/enquiries',
        badge: indicators.pendingEnquiriesCount > 0 ? indicators.pendingEnquiriesCount : undefined,
        badgeVariant: 'blue' as const,
        badgePulse: false,
        badgeLabel: `${indicators.pendingEnquiriesCount} new job enquiries pending review`,
      },
      { name: 'Workforce Dispatch', icon: HardHat, href: '/admin/operations/assignments' },
      { name: 'Service Reminders', icon: CalendarClock, href: '/admin/operations/reminders' },
    ],
  },
  {
    name: 'Attendance & Availability',
    icon: CalendarCheck,
    subItems: [
      { name: 'Attendances', icon: CalendarCheck, href: '/admin/attendance' },
      { name: 'Availabilities', icon: Activity, href: '/admin/availability' },
      { name: 'Leaves', icon: Coffee, href: '/admin/leaves' },
    ],
  },
  {
    name: 'Communications',
    icon: MessageSquare,
    hasAlert: indicators.unreadNotificationsCount > 0,
    badgeVariant: 'purple' as const,
    badgeCount: indicators.unreadNotificationsCount,
    subItems: [
      {
        name: 'Notifications',
        icon: Bell,
        href: '/admin/communications/notifications',
        badge: indicators.unreadNotificationsCount > 0 ? indicators.unreadNotificationsCount : undefined,
        badgeVariant: 'purple' as const,
        badgePulse: true,
        badgeLabel: `${indicators.unreadNotificationsCount} unread notifications`,
      },
      { name: 'Announcements', icon: Megaphone, href: '/admin/communications/announcements' },
      { name: 'Complaints & Feedback', icon: MessageSquare, href: '/admin/communications/feedback' },
    ],
  },
  {
    name: 'Business & Finance',
    icon: Building2,
    hasAlert: indicators.pendingFinanceCount > 0,
    badgeVariant: 'amber' as const,
    badgeCount: indicators.pendingFinanceCount,
    subItems: [
      {
        name: 'Finance',
        icon: IndianRupee,
        href: '/admin/finance',
        badge: indicators.pendingFinanceCount > 0 ? indicators.pendingFinanceCount : undefined,
        badgeVariant: 'amber' as const,
        badgePulse: false,
        badgeLabel: `${indicators.pendingFinanceCount} pending financial transactions`,
      },
      { name: 'Reports', icon: BarChart3, href: '/admin/reports' },
    ],
  },
  { type: 'divider' },
  { name: 'Audit Logs', icon: ShieldCheck, href: '/admin/audit-logs' },
];

interface SidebarProps {
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const SidebarBadge = ({
  count,
  variant = 'amber',
  pulse = false,
  label,
  isDark,
}: {
  count: number;
  variant?: 'amber' | 'blue' | 'purple' | 'emerald';
  pulse?: boolean;
  label?: string;
  isDark: boolean;
}) => {
  if (!count || count <= 0) return null;

  const colorStyles = {
    amber: isDark
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
      : 'bg-amber-50 text-amber-800 border-amber-300',
    blue: isDark
      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
      : 'bg-blue-50 text-blue-800 border-blue-300',
    purple: isDark
      ? 'bg-[#7B4DFF]/20 text-[#9E7BFF] border-[#7B4DFF]/40 shadow-[0_0_10px_rgba(123,77,255,0.2)]'
      : 'bg-purple-50 text-purple-800 border-purple-300',
    emerald: isDark
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
      : 'bg-emerald-50 text-emerald-800 border-emerald-300',
  }[variant];

  const dotColor = {
    amber: 'bg-amber-400',
    blue: 'bg-blue-400',
    purple: 'bg-[#9E7BFF]',
    emerald: 'bg-emerald-400',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold rounded-full border shrink-0 transition-all ${colorStyles}`}
      title={label || `${count} pending`}
    >
      {pulse && <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse`} />}
      <span>{count > 99 ? '99+' : count}</span>
    </span>
  );
};

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
    (hasSubItems &&
      item.subItems.some((sub: any) => {
        const base = sub.href.split('?')[0];
        return (
          pathname === base ||
          pathname.startsWith(base + '/') ||
          (base.startsWith('/admin/operations') && pathname.startsWith('/admin/operations'))
        );
      }));

  if (hasSubItems) {
    return (
      <li className="mb-4">
        <div
          className={`flex items-center ${
            isCollapsed ? 'justify-center px-0 py-3' : 'px-4 py-2 justify-between'
          } ${isDark ? 'text-gray-500' : 'text-slate-400'}`}
          title={isCollapsed ? `${item.name}${item.badgeCount ? ` (${item.badgeCount} pending)` : ''}` : undefined}
        >
          {isCollapsed ? (
            <div className="relative flex items-center justify-center">
              <item.icon
                className={`w-5 h-5 ${
                  isActive ? 'text-[#2A835F]' : isDark ? 'text-gray-500' : 'text-slate-400'
                }`}
              />
              {item.hasAlert && (
                <span
                  className={`absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full animate-pulse ring-2 ${
                    isDark ? 'ring-[#0D0E12]' : 'ring-white'
                  } ${
                    item.badgeVariant === 'amber'
                      ? 'bg-amber-400'
                      : item.badgeVariant === 'purple'
                      ? 'bg-[#7B4DFF]'
                      : 'bg-blue-400'
                  }`}
                />
              )}
            </div>
          ) : (
            <>
              <span className="font-semibold text-xs uppercase tracking-wider">{item.name}</span>
              {item.hasAlert && item.badgeCount > 0 && (
                <span
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    item.badgeVariant === 'amber'
                      ? 'bg-amber-400'
                      : item.badgeVariant === 'purple'
                      ? 'bg-[#7B4DFF]'
                      : 'bg-blue-400'
                  }`}
                  title={`${item.badgeCount} pending items`}
                />
              )}
            </>
          )}
        </div>
        {!isCollapsed && (
          <ul className="mt-1 space-y-1">
            {item.subItems.map((sub: any) => {
              const SubIcon = sub.icon;
              const subBaseHref = sub.href.split('?')[0];
              const isSubActive =
                pathname === sub.href ||
                (sub.href.includes('?') && pathname === subBaseHref) ||
                (sub.href === '/admin/operations/work-orders' && pathname === '/admin/operations') ||
                (subBaseHref !== '/admin/dashboard' && pathname.startsWith(subBaseHref + '/'));
              return (
                <li key={sub.name}>
                  <Link
                    href={sub.href}
                    onClick={onClose}
                    className={`flex items-center justify-between gap-2 px-4 py-2.5 mx-2 text-sm rounded-xl transition-all ${
                      isSubActive
                        ? isDark
                          ? 'bg-[#2A835F]/15 text-[#2A835F] font-semibold border border-[#2A835F]/30'
                          : 'bg-[#EBF6F1] text-[#2A835F] font-semibold border border-[#2A835F]/25 shadow-xs'
                        : isDark
                        ? 'text-gray-400 hover:bg-[#1A1C23] hover:text-gray-200'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {SubIcon && <SubIcon className="w-4 h-4 shrink-0" />}
                      <span className="truncate">{sub.name}</span>
                    </div>

                    {sub.badge !== undefined && sub.badge > 0 && (
                      <SidebarBadge
                        count={sub.badge}
                        variant={sub.badgeVariant}
                        pulse={sub.badgePulse}
                        label={sub.badgeLabel}
                        isDark={isDark}
                      />
                    )}
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
        className={`flex items-center justify-between ${
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
        <div className="flex items-center gap-3 relative min-w-0">
          <item.icon className="w-5 h-5 shrink-0" />
          {isCollapsed && item.hasAlert && (
            <span
              className={`absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full animate-pulse ring-2 ${
                isDark ? 'ring-[#0D0E12]' : 'ring-white'
              } ${item.badgeVariant === 'amber' ? 'bg-amber-400' : 'bg-blue-400'}`}
            />
          )}
          {!isCollapsed && <span className="font-medium text-sm truncate">{item.name}</span>}
        </div>
        {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
          <SidebarBadge
            count={item.badge}
            variant={item.badgeVariant}
            pulse={item.badgePulse}
            isDark={isDark}
          />
        )}
      </Link>
    </li>
  );
};

export function Sidebar({ onClose, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { logout, user, token } = useAuth();
  const router = useRouter();
  const { isDark } = useAdminTheme();

  const [indicators, setIndicators] = useState<SidebarIndicators>({
    pendingPayoutCount: 0,
    pendingEnquiriesCount: 0,
    unreadNotificationsCount: 0,
    pendingFinanceCount: 0,
  });

  const fetchIndicators = useCallback(async () => {
    if (!token || user?.role !== 'SUPER_ADMIN') return;
    try {
      const [enquiriesRes, notifRes, financeRes] = await Promise.allSettled([
        EnquiryService.getAllEnquiries({}, token),
        NotificationService.getMyNotifications(token, { unreadOnly: true, limit: 1 }),
        FinanceService.getTransactions(token, { status: 'PENDING', limit: 1 }),
      ]);

      let pendingPayout = 0;
      let pendingEnquiries = 0;
      if (enquiriesRes.status === 'fulfilled' && enquiriesRes.value?.enquiries) {
        const list = enquiriesRes.value.enquiries;
        pendingPayout = list.filter(
          (w) => w.status === 'COMPLETED' && (!w.totalCalculatedWage || Number(w.totalCalculatedWage) === 0)
        ).length;
        pendingEnquiries = list.filter((w) => w.status === 'PENDING').length;
      }

      let unreadNotifs = 0;
      if (notifRes.status === 'fulfilled' && typeof notifRes.value?.unreadCount === 'number') {
        unreadNotifs = notifRes.value.unreadCount;
      }

      let pendingFinance = 0;
      if (financeRes.status === 'fulfilled') {
        pendingFinance = financeRes.value?.meta?.total ?? financeRes.value?.items?.length ?? 0;
      }

      setIndicators({
        pendingPayoutCount: pendingPayout,
        pendingEnquiriesCount: pendingEnquiries,
        unreadNotificationsCount: unreadNotifs,
        pendingFinanceCount: pendingFinance,
      });
    } catch (err) {
      console.warn('Failed to load admin sidebar indicators:', err);
    }
  }, [token, user]);

  useEffect(() => {
    fetchIndicators();
    const interval = setInterval(fetchIndicators, 30000);
    const onFocus = () => fetchIndicators();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchIndicators]);

  // Re-check indicators whenever the route changes (e.g. after a payment or enquiry update)
  useEffect(() => {
    fetchIndicators();
  }, [pathname, fetchIndicators]);

  const menuData = useMemo(() => buildMenuData(indicators), [indicators]);

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
        {/* PWA Web App Download Box */}
        {!isCollapsed && (
          <PwaInstallButton role="admin" variant="sidebar" className="mb-1" />
        )}

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
