'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useAdminTheme } from '@/context/admin-theme-context';
import { EnquiryService, NotificationService, FinanceService } from '@/services';
import type { FinancialSummary } from '@/services/finance.service';
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
  Settings,
  LogOut,
  X,
  ChevronsLeft,
  Menu,
  IndianRupee,
  BarChart3,
  CalendarClock,
  Zap,
  ChevronDown,
  ChevronRight,
  Wallet,
  Calendar,
  FileText,
  CheckCircle2,
  Plus,
  Sparkles,
} from 'lucide-react';

interface SidebarIndicators {
  pendingPayoutCount: number;
  pendingEnquiriesCount: number;
  unreadNotificationsCount: number;
  pendingFinanceCount: number;
}

const buildMenuData = (indicators: SidebarIndicators) => [
  {
    name: 'Operations Command',
    key: 'frequently_used',
    subItems: [
      {
        name: 'Dashboard',
        icon: LayoutDashboard,
        href: '/admin/dashboard',
        badge: undefined,
      },
      {
        name: 'Work Orders',
        icon: Briefcase,
        href: '/admin/operations/work-orders',
        badge: indicators.pendingPayoutCount > 0 ? indicators.pendingPayoutCount : undefined,
        badgeVariant: 'coral' as const,
        badgePulse: true,
        subLinks: [
          { name: 'Direct Work Entry', href: '/admin/operations/direct-entry' },
          { name: 'Workforce Dispatch', href: '/admin/operations/assignments' },
          { name: 'Service Reminders', href: '/admin/operations/reminders' },
        ],
      },
      {
        name: 'Job Enquiries',
        icon: FolderKanban,
        href: '/admin/operations/enquiries',
        badge: indicators.pendingEnquiriesCount > 0 ? indicators.pendingEnquiriesCount : undefined,
        badgeVariant: 'periwinkle' as const,
      },
    ],
  },
  {
    name: 'People & Workforce',
    key: 'people',
    subItems: [
      { name: 'Workers Roster', icon: HardHat, href: '/admin/people/workers' },
      { name: 'Office Staff', icon: Briefcase, href: '/admin/people/office-staff' },
      { name: 'Customers', icon: UserCircle, href: '/admin/people/customers' },
    ],
  },
  {
    name: 'Services & Operations',
    key: 'operations_duty',
    subItems: [
      { name: 'Services Catalog', icon: Layers, href: '/admin/services' },
      { name: 'Attendance Records', icon: CalendarCheck, href: '/admin/attendance' },
      { name: 'Crew Availability', icon: Activity, href: '/admin/availability' },
      { name: 'Leave Requests', icon: Coffee, href: '/admin/leaves' },
    ],
  },
  {
    name: 'Finance & Records',
    key: 'finance_records',
    subItems: [
      {
        name: 'Finance Ledger',
        icon: IndianRupee,
        href: '/admin/finance',
        badge: indicators.pendingFinanceCount > 0 ? indicators.pendingFinanceCount : undefined,
        badgeVariant: 'amber' as const,
      },
      { name: 'Analytics & Reports', icon: BarChart3, href: '/admin/reports' },
      { name: 'Live Data Feed', icon: Zap, href: '/admin/data-feed' },
    ],
  },
  {
    name: 'Communications',
    key: 'communications',
    subItems: [
      {
        name: 'Notifications',
        icon: Bell,
        href: '/admin/communications/notifications',
        badge: indicators.unreadNotificationsCount > 0 ? indicators.unreadNotificationsCount : undefined,
        badgeVariant: 'purple' as const,
        badgePulse: true,
      },
      { name: 'Announcements', icon: Megaphone, href: '/admin/communications/announcements' },
      { name: 'Feedback & Support', icon: MessageSquare, href: '/admin/communications/feedback' },
    ],
  },
];

interface SidebarProps {
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ onClose, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { logout, user, token } = useAuth();
  const router = useRouter();
  const { isDark } = useAdminTheme();

  const [hideWallet, setHideWallet] = useState(false);
  const [financeSummary, setFinanceSummary] = useState<FinancialSummary | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    '/admin/operations/work-orders': true,
  });

  const [indicators, setIndicators] = useState<SidebarIndicators>({
    pendingPayoutCount: 0,
    pendingEnquiriesCount: 0,
    unreadNotificationsCount: 0,
    pendingFinanceCount: 0,
  });

  const fetchIndicators = useCallback(async () => {
    if (!token || user?.role !== 'SUPER_ADMIN') return;
    try {
      const [enquiriesRes, notifRes, financeRes, summaryRes] = await Promise.allSettled([
        EnquiryService.getAllEnquiries({}, token),
        NotificationService.getMyNotifications(token, { unreadOnly: true, limit: 1 }),
        FinanceService.getTransactions(token, { status: 'PENDING', limit: 1 }),
        FinanceService.getSummary(token),
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

      if (summaryRes.status === 'fulfilled' && summaryRes.value) {
        setFinanceSummary(summaryRes.value);
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

  useEffect(() => {
    fetchIndicators();
  }, [pathname, fetchIndicators]);

  const menuData = useMemo(() => buildMenuData(indicators), [indicators]);

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const displayName = user?.name || user?.username || 'Super Admin';
  const initial = displayName.charAt(0).toUpperCase();

  const toggleSublinks = (href: string) => {
    setExpandedGroups((prev) => ({ ...prev, [href]: !prev[href] }));
  };

  const currentDateFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, []);

  const walletDisplayAmount = useMemo(() => {
    if (!financeSummary) return '₹ 0';
    const amount = financeSummary.netProfit || financeSummary.todayIncome || financeSummary.totalIncome || 0;
    return `₹ ${amount.toLocaleString('en-IN')}`;
  }, [financeSummary]);

  return (
    <aside
      className={`flex-shrink-0 border-r flex flex-col h-full overflow-hidden transition-all duration-300 z-30 select-none ${
        isDark
          ? 'bg-[#0D0E12] border-white/[0.06] text-gray-300'
          : 'bg-white border-slate-200/90 text-slate-800 shadow-sm'
      } ${isCollapsed ? 'w-20' : 'w-72 lg:w-[276px]'}`}
    >
      {/* 1. Top User Profile Card (Real User Data: Good Morning, Name, Settings, Logout) */}
      <div
        className={`p-3.5 border-b flex items-center transition-colors ${
          isDark ? 'border-white/[0.06] bg-[#0A0B0E]/60' : 'border-slate-100 bg-slate-50/50'
        } ${isCollapsed ? 'justify-center flex-col gap-2' : 'justify-between'}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6366F1] via-[#06B6D4] to-[#FF6442] p-[1.5px] shadow-sm flex items-center justify-center">
              <div
                className={`w-full h-full rounded-[14px] flex items-center justify-center font-extrabold text-xs uppercase ${
                  isDark ? 'bg-[#12141A] text-white' : 'bg-white text-indigo-600'
                }`}
              >
                {initial}
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#6366F1] text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#0D0E12] shadow-xs">
              +
            </span>
          </div>

          {!isCollapsed && (
            <div className="min-w-0">
              <span className="block text-[10px] font-semibold text-gray-400 dark:text-gray-500 leading-none truncate">
                Good Morning,
              </span>
              <h4
                className={`text-xs font-bold truncate mt-0.5 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
                title={displayName}
              >
                {displayName}
              </h4>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleLogout}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                isDark
                  ? 'bg-white/[0.04] hover:bg-rose-500/15 text-gray-400 hover:text-rose-400 border border-white/[0.06]'
                  : 'bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200'
              }`}
              title="Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
            <Link
              href="/admin/settings"
              className={`p-1.5 rounded-xl transition-all ${
                isDark
                  ? 'bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white border border-white/[0.06]'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 border border-slate-200'
              }`}
              title="Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </Link>
            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-xl bg-white/5 text-gray-400 hover:text-white ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Navigation Links */}
      <nav className={`flex-1 overflow-y-auto custom-scrollbar py-3 ${isCollapsed ? 'px-2' : 'px-3'}`}>
        {menuData.map((section) => (
          <div key={section.key} className="mb-4">
            {!isCollapsed && (
              <div className="flex items-center justify-between px-3 mb-1.5">
                <span className="text-[10px] font-extrabold tracking-wider uppercase text-gray-500">
                  {section.name}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              </div>
            )}

            <ul className="space-y-1">
              {section.subItems.map((item: any) => {
                const ItemIcon = item.icon;
                const baseHref = item.href ? item.href.split('?')[0] : '';
                const isActive =
                  pathname === item.href ||
                  (item.href && item.href !== '/admin/dashboard' && pathname.startsWith(baseHref));

                const hasSubTree = item.subLinks && item.subLinks.length > 0;
                const isExpanded = expandedGroups[item.href] ?? false;

                return (
                  <li key={item.name} className="relative">
                    <div
                      className={`group flex items-center justify-between rounded-[14px] transition-all duration-200 cursor-pointer ${
                        isCollapsed ? 'p-2.5 justify-center mx-auto' : 'px-3 py-2.5'
                      } ${
                        isActive
                          ? 'bg-[#6366F1] text-white shadow-md shadow-[#6366F1]/25 font-bold'
                          : isDark
                          ? 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className="flex items-center gap-2.5 min-w-0 flex-1"
                        title={isCollapsed ? item.name : undefined}
                      >
                        {ItemIcon && (
                          <ItemIcon
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive ? 'text-white' : isDark ? 'text-gray-400 group-hover:text-gray-200' : 'text-slate-500'
                            }`}
                          />
                        )}
                        {!isCollapsed && (
                          <span className="text-xs truncate font-medium">{item.name}</span>
                        )}
                      </Link>

                      {!isCollapsed && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          {item.badge !== undefined && item.badge > 0 && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : item.badgeVariant === 'coral'
                                  ? 'bg-[#FF6442]/20 text-[#FF6442] border border-[#FF6442]/30'
                                  : item.badgeVariant === 'amber'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-[#6366F1]/20 text-[#6366F1] border border-[#6366F1]/30'
                              } ${item.badgePulse ? 'animate-pulse' : ''}`}
                            >
                              {item.badge > 99 ? '99+' : item.badge}
                            </span>
                          )}

                          {hasSubTree && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleSublinks(item.href);
                              }}
                              className="p-0.5 rounded hover:bg-white/10 transition-colors text-inherit"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5 opacity-80" />
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {!isCollapsed && hasSubTree && isExpanded && (
                      <ul className="mt-1 pl-7 pr-2 space-y-1">
                        {item.subLinks.map((sub: any) => {
                          const isSubActive = pathname === sub.href;
                          return (
                            <li key={sub.name}>
                              <Link
                                href={sub.href}
                                onClick={onClose}
                                className={`flex items-center gap-2 py-1.5 px-2 rounded-lg text-[11px] font-medium transition-colors ${
                                  isSubActive
                                    ? 'text-[#6366F1] dark:text-[#818cf8] font-bold bg-[#6366F1]/10'
                                    : isDark
                                    ? 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]'
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                                }`}
                              >
                                <span className={`text-[9px] ${isSubActive ? 'text-[#6366F1]' : 'text-gray-600'}`}>
                                  {isSubActive ? '◆' : '◇'}
                                </span>
                                <span className="truncate">{sub.name}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {/* 4. Quick Direct Action Shortcut */}
        {!isCollapsed && (
          <div className="px-1 pt-1 pb-3">
            <Link
              href="/admin/operations/direct-entry"
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border border-dashed transition-all ${
                isDark
                  ? 'border-white/[0.12] text-gray-400 hover:text-white hover:border-[#6366F1]/50 hover:bg-[#6366F1]/5'
                  : 'border-slate-300 text-slate-600 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50/50'
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-[#6366F1]" />
              <span>Direct Work Entry</span>
            </Link>
          </div>
        )}

        {/* 5. Real Finance & Calendar Indicators */}
        {!isCollapsed && (
          <div
            className={`mx-1 p-3 rounded-2xl border space-y-2.5 transition-colors ${
              isDark ? 'bg-[#12141A] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <Link href="/admin/finance" className="flex items-center gap-2 hover:text-[#6366F1] transition-colors">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold text-[11px]">
                  Net Balance: {hideWallet ? '••••••' : walletDisplayAmount}
                </span>
              </Link>
              <button
                onClick={() => setHideWallet(!hideWallet)}
                className="text-[10px] font-bold text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                {hideWallet ? 'Show' : 'Hide'}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-white/[0.05]">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#FF6442]" />
                <span className="font-semibold text-[11px]">Today: {currentDateFormatted}</span>
              </div>
              <div className="flex -space-x-1.5 items-center">
                <div className="w-4 h-4 rounded-full bg-emerald-500 border border-[#0D0E12] text-[8px] text-white flex items-center justify-center font-bold">
                  K
                </div>
                <div className="w-4 h-4 rounded-full bg-indigo-500 border border-[#0D0E12] text-[8px] text-white flex items-center justify-center font-bold">
                  S
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. Real Notifications & Announcements Indicators */}
        {!isCollapsed && (
          <div className="mt-4 px-1 space-y-1">
            <div className="px-2 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
                System Feeds
              </span>
            </div>
            <Link
              href="/admin/communications/notifications"
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                isDark
                  ? 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bell className="w-3.5 h-3.5 text-[#6366F1]" />
                <span>Inbox</span>
              </div>
              {indicators.unreadNotificationsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FF6442] text-white">
                  {indicators.unreadNotificationsCount}
                </span>
              )}
            </Link>

            <Link
              href="/admin/reports"
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                isDark
                  ? 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>Monthly Reports</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Live
              </span>
            </Link>
          </div>
        )}
      </nav>

      {/* 7. Bottom Collapse & PWA Bar */}
      <div
        className={`p-3 border-t shrink-0 flex items-center justify-between transition-colors ${
          isDark ? 'border-white/[0.06] bg-[#0A0B0E]/60' : 'border-slate-100 bg-slate-50'
        }`}
      >
        {!isCollapsed && <PwaInstallButton role="admin" variant="sidebar" />}

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className={`p-2 rounded-xl transition-all ml-auto ${
              isDark
                ? 'text-gray-400 hover:text-white hover:bg-white/[0.06]'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <Menu className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
          </button>
        )}
      </div>
    </aside>
  );
}
