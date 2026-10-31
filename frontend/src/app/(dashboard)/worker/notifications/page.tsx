'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  MoreVertical,
  Bell,
  HardHat,
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle,
  CheckCheck,
  RefreshCw,
  ChevronRight,
  X,
  IndianRupee,
  Megaphone,
  UserCheck,
  CreditCard,
  ShieldCheck,
  Activity,
  Layers,
} from 'lucide-react';
import { useWorker } from '@/context/worker-context';
import { useWorkerLanguage } from '@/context/worker-language-context';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import {
  NotificationService,
  NotificationItem,
  NotificationType,
} from '@/services/notification.service';
import {
  WorkerNavbar,
  WorkerWorkOrderDetailModal,
  WorkerAvailabilityModal,
  WorkerNotificationDetailModal,
  NotificationDetailData,
} from '@/components/Worker';
import { ActivityFeed } from '@/components/ActivityFeed';

// Unified display item combining server notifications and dispatches
interface DisplayNotification extends NotificationDetailData {
  id: string;
  title: string;
  subtitle: string;
  fullMessage?: string;
  type: NotificationType | 'JOB_DISPATCH' | 'SHIFT_UPDATE';
  isRead: boolean;
  timestamp: string; // ISO string
  displayTime: string; // e.g. "10:24 AM"
  dateKey: string; // e.g. "Today", "Yesterday", "Apr 28, 2025"
  rightBadge?: {
    text: string;
    variant: 'positive' | 'negative' | 'neutral' | 'accent';
  };
  jobData?: any;
  amount?: string;
  referenceId?: string;
  sender?: string;
  link?: string | null;
}

export default function WorkerNotificationsPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const toast = useToast();
  const {
    jobs,
    isOnDuty,
    requestToggleDuty,
    confirmDutyChange,
    togglingDuty,
    openJobModal,
    closeJobModal,
    selectedJob,
    isJobModalOpen,
    updateJobStatus,
    actionLoadingId,
    isAvailabilityModalOpen,
    setIsAvailabilityModalOpen,
    assignedJobsCount,
    reloadAll,
    isReloading,
  } = useWorker();

  const { language, t, translateService } = useWorkerLanguage();

  // Filter tabs state
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UNREAD' | 'DISPATCHES' | 'SHIFTS'>('ALL');
  const [viewMode, setViewMode] = useState<'notifications' | 'activity'>('notifications');

  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dropdown menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Server notifications state
  const [serverNotifications, setServerNotifications] = useState<NotificationItem[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);

  // Fetch server notifications
  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    setIsLoadingNotifications(true);
    try {
      const res = await NotificationService.getMyNotifications(token, {
        limit: 40,
      });
      setServerNotifications(res.items || []);
    } catch (err) {
      console.error('Failed to fetch worker notifications:', err);
    } finally {
      setIsLoadingNotifications(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Close 3-dots menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Detailed View Modal state
  const [selectedNotification, setSelectedNotification] = useState<DisplayNotification | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Work Order Details Modal state (Finora style receipt)
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any | null>(null);
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);

  // Sync if context triggers job modal opening
  useEffect(() => {
    if (isJobModalOpen && selectedJob) {
      setSelectedWorkOrder(selectedJob);
      setIsWorkOrderModalOpen(true);
      closeJobModal();
    }
  }, [isJobModalOpen, selectedJob, closeJobModal]);

  // Click on a notification: Mark as read and open detailed view
  const handleSelectNotification = async (item: DisplayNotification) => {
    setSelectedNotification(item);
    setIsDetailModalOpen(true);

    if (!token) return;
    if (!item.isRead) {
      try {
        await NotificationService.markAsRead(item.id, token);
        setServerNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)),
        );
      } catch (err) {
        console.error('Failed to mark notification read:', err);
      }
    }
  };

  // Delete / Dismiss notification
  const handleDeleteNotification = async (id: string) => {
    if (!token) return;
    try {
      await NotificationService.deleteNotification(id, token);
      setServerNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success('Alert Dismissed', 'Notification removed from your feed.');
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    setIsMenuOpen(false);
    if (!token) return;
    try {
      await NotificationService.markAllAsRead(token);
      setServerNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('Marked as Read', 'All notifications have been marked as read.');
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  // Format date helper: "Today", "Yesterday", or "Apr 28, 2025"
  const getDateGroupKey = (dateStr: string): string => {
    const targetDate = new Date(dateStr);
    const now = new Date();

    const isToday =
      targetDate.getDate() === now.getDate() &&
      targetDate.getMonth() === now.getMonth() &&
      targetDate.getFullYear() === now.getFullYear();

    if (isToday) return 'Today';

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      targetDate.getDate() === yesterday.getDate() &&
      targetDate.getMonth() === yesterday.getMonth() &&
      targetDate.getFullYear() === yesterday.getFullYear();

    if (isYesterday) return 'Yesterday';

    return targetDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format time helper: e.g. "10:24 AM"
  const formatTime = (dateStr: string): string => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Synthesize and unify all notifications and live job queue into grouped feed
  const unifiedNotifications = useMemo<DisplayNotification[]>(() => {
    const list: DisplayNotification[] = [];

    // 1. Add server notifications
    serverNotifications.forEach((sn) => {
      let badge: DisplayNotification['rightBadge'] = undefined;
      const isFinance = sn.type === 'FINANCE';
      if (isFinance) {
        badge = { text: '+ ₹1,200.00', variant: 'positive' };
      } else if (!sn.isRead) {
        badge = { text: 'New', variant: 'accent' };
      }

      const matchedJob = jobs.find(
        (j) =>
          j.id === sn.metadata?.enquiryId ||
          j.id === sn.metadata?.jobId ||
          j.trackingNumber === sn.metadata?.trackingNumber ||
          j.trackingNumber === sn.metadata?.referenceNumber
      );

      list.push({
        id: sn.id,
        title: sn.title,
        subtitle: sn.message,
        fullMessage: sn.message,
        type: sn.type,
        isRead: sn.isRead,
        timestamp: sn.createdAt,
        displayTime: formatTime(sn.createdAt),
        dateKey: getDateGroupKey(sn.createdAt),
        rightBadge: badge,
        jobData: matchedJob || sn.metadata?.jobData || (sn.type === 'ASSIGNMENT' || sn.type === 'ENQUIRY' ? jobs[0] : undefined),
        amount: isFinance ? '+ ₹1,200.00' : undefined,
        referenceId: sn.metadata?.referenceNumber || `NOTIF-${sn.id.slice(-6).toUpperCase()}`,
        sender: sn.metadata?.coordinatorName || 'KK Group Kerala Dispatch Desk',
        link: sn.link,
      });
    });

    // 2. Add active job queue items as real-time dispatches
    jobs.forEach((j) => {
      const exists = list.some((item) => item.id === `job-${j.id}`);
      if (!exists) {
        const isAssigned = j.status === 'ASSIGNED';
        const isProgress = j.status === 'IN_PROGRESS';
        const timeStr = j.updatedAt || j.createdAt || new Date().toISOString();

        list.push({
          id: `job-${j.id}`,
          title: `${translateService(j.serviceName)}`,
          subtitle: `${j.customerName} • ${j.location || j.district || 'Kerala'}`,
          fullMessage: `Field service assignment dispatched for customer ${j.customerName}. Work location: ${j.location || j.district || 'Kerala, India'}. Tracking code: ${j.trackingNumber}. Please review requirements, verify equipment on vehicle, and coordinate on-site arrival.`,
          type: 'JOB_DISPATCH',
          isRead: !isAssigned,
          timestamp: timeStr,
          displayTime: formatTime(timeStr),
          dateKey: getDateGroupKey(timeStr),
          rightBadge: isAssigned
            ? { text: 'New Dispatch', variant: 'accent' }
            : isProgress
            ? { text: 'In Progress', variant: 'neutral' }
            : { text: 'Completed', variant: 'positive' },
          jobData: j,
          amount: j.totalCalculatedWage
            ? `₹${Number(j.totalCalculatedWage).toLocaleString('en-IN')}`
            : j.totalCalculatedCost
            ? `₹${Number(j.totalCalculatedCost).toLocaleString('en-IN')}`
            : undefined,
          referenceId: j.trackingNumber,
          sender: 'KK Group Dispatch Coordinator',
        });
      }
    });

    // 3. Fallback demo data if feed is completely empty
    if (list.length === 0) {
      const now = new Date();
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      const older = new Date('2025-04-28T14:30:00Z');

      list.push(
        {
          id: 'mock-1',
          title: 'Deep Well Cleaning Assigned',
          subtitle: 'Thrissur Central • Order #KK-8021',
          fullMessage: 'A new well cleaning job has been assigned in Thrissur Central. Operative squad is requested to prepare high-pressure pumping units and safety harness before departure.',
          type: 'JOB_DISPATCH',
          isRead: false,
          timestamp: now.toISOString(),
          displayTime: '10:24 AM',
          dateKey: 'Today',
          rightBadge: { text: '- Order', variant: 'negative' },
          referenceId: 'KK-8021',
          sender: 'Thrissur Field Coordinator',
          jobData: jobs.find((j) => j.trackingNumber === 'KK-8021') || jobs[0] || {
            id: 'mock-job-1',
            trackingNumber: 'KK-8021',
            serviceName: 'Deep Well Cleaning & Disinfection',
            serviceCategory: 'WELL_SERVICES',
            customerName: 'Suresh Kumar',
            customerPhone: '+91 98470 12345',
            location: 'Thrissur Round South, Kerala',
            city: 'Thrissur',
            district: 'Thrissur',
            status: 'ASSIGNED',
            workerUnitWage: 1200,
            unitLabel: 'Well',
            message: 'Deep well cleaning required. Submersible pump and safety harness required on site.',
            createdAt: now.toISOString(),
          },
        },
        {
          id: 'mock-2',
          title: 'Shift Attendance Check-In',
          subtitle: 'Available for Dispatches • Kerala Squad',
          fullMessage: 'Operative attendance marked as AVAILABLE for the day. You are currently in the queue for automated and manual dispatch allocations across your district.',
          type: 'DUTY',
          isRead: true,
          timestamp: now.toISOString(),
          displayTime: '09:15 AM',
          dateKey: 'Today',
          rightBadge: { text: 'On Duty', variant: 'neutral' },
          referenceId: 'ATT-90412',
          sender: 'Automated Shift System',
        },
        {
          id: 'mock-3',
          title: 'Field Wage Credited',
          subtitle: 'Thrissur Operations Finance Hub',
          fullMessage: 'Daily operative compensation and travel allowance of ₹1,200.00 has been verified by the finance team and credited to your registered operative payroll account.',
          type: 'FINANCE',
          isRead: true,
          timestamp: now.toISOString(),
          displayTime: '08:30 AM',
          dateKey: 'Today',
          rightBadge: { text: '+ ₹1,200.00', variant: 'positive' },
          amount: '+ ₹1,200.00',
          referenceId: 'TXN-99418',
          sender: 'Finance Desk • Thrissur',
        },
        {
          id: 'mock-4',
          title: 'Borewell Flushing Complete',
          subtitle: 'Aluva Plant • Job Verified',
          fullMessage: 'Work order for borewell flushing at Aluva Industrial Plant was successfully closed and signed off by the site manager. Performance score updated.',
          type: 'JOB_DISPATCH',
          isRead: true,
          timestamp: yesterday.toISOString(),
          displayTime: '06:45 PM',
          dateKey: 'Yesterday',
          rightBadge: { text: '+ ₹850.00', variant: 'positive' },
          amount: '+ ₹850.00',
          referenceId: 'KK-7910',
          sender: 'Aluva Site Supervisor',
          jobData: jobs.find((j) => j.trackingNumber === 'KK-7910') || jobs[1] || {
            id: 'mock-job-4',
            trackingNumber: 'KK-7910',
            serviceName: 'Borewell Flushing',
            serviceCategory: 'BOREWELL_SERVICES',
            customerName: 'Aluva Industrial Plant Admin',
            customerPhone: '+91 94471 98765',
            location: 'Aluva Industrial Estate, Kerala',
            city: 'Aluva',
            district: 'Ernakulam',
            status: 'COMPLETED',
            workerUnitWage: 850,
            totalCalculatedWage: 850,
            unitLabel: 'Site',
            message: 'Work order for borewell flushing at Aluva Industrial Plant was successfully closed and signed off by the site manager.',
            createdAt: yesterday.toISOString(),
          },
        },
        {
          id: 'mock-5',
          title: 'Safety Equipment Broadcast',
          subtitle: 'Mandatory helmets & rubber boots for monsoon ops',
          fullMessage: 'Notice from Kerala Operations Head: Heavy monsoon rainfall expected across coastal zones. All field squads must enforce safety harnesses, insulated rubber boots, and certified helmets on all machinery sites.',
          type: 'SYSTEM',
          isRead: true,
          timestamp: yesterday.toISOString(),
          displayTime: '08:15 PM',
          dateKey: 'Yesterday',
          rightBadge: { text: 'Alert', variant: 'neutral' },
          referenceId: 'BRD-2026-08',
          sender: 'Kerala Ops Safety Cell',
        },
        {
          id: 'mock-6',
          title: 'Medical & First-Aid Kit Restock',
          subtitle: 'Field squad emergency unit replenishment',
          fullMessage: 'Emergency first-aid packs and burn kits have been refreshed at the central warehouse. Van operators please inspect vehicle medical compartments before 8:00 AM.',
          type: 'INFO',
          isRead: true,
          timestamp: older.toISOString(),
          displayTime: '02:32 PM',
          dateKey: 'Apr 28, 2025',
          rightBadge: { text: 'Supplies', variant: 'neutral' },
          referenceId: 'MED-1102',
          sender: 'Central Logistics Store',
        },
        {
          id: 'mock-7',
          title: 'Spare Parts & Machine Tools',
          subtitle: 'Submersible water pump intake nozzle',
          fullMessage: 'Replacement nozzle and high-pressure hose joint issued for unit JCB-04. Please return old decommissioned fittings to the Thrissur workshop.',
          type: 'SYSTEM',
          isRead: true,
          timestamp: older.toISOString(),
          displayTime: '11:20 AM',
          dateKey: 'Apr 28, 2025',
          rightBadge: { text: '- ₹450.00', variant: 'negative' },
          amount: '- ₹450.00',
          referenceId: 'PRT-4402',
          sender: 'Equipment Workshop',
        },
      );
    }

    // Sort descending by timestamp
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [serverNotifications, jobs, translateService]);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return unifiedNotifications.filter((item) => {
      // 1. Tab filter
      if (activeFilter === 'UNREAD' && item.isRead) return false;
      if (activeFilter === 'DISPATCHES' && item.type !== 'JOB_DISPATCH' && item.type !== 'ASSIGNMENT' && item.type !== 'ENQUIRY') return false;
      if (activeFilter === 'SHIFTS' && item.type !== 'DUTY' && item.type !== 'SHIFT_UPDATE') return false;

      // 2. Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesSubtitle = item.subtitle.toLowerCase().includes(query);
        return matchesTitle || matchesSubtitle;
      }

      return true;
    });
  }, [unifiedNotifications, activeFilter, searchQuery]);

  // Group notifications by dateKey preserving chronological section order
  const groupedNotifications = useMemo(() => {
    const groups: { [key: string]: DisplayNotification[] } = {};
    const order: string[] = [];

    filteredNotifications.forEach((item) => {
      if (!groups[item.dateKey]) {
        groups[item.dateKey] = [];
        order.push(item.dateKey);
      }
      groups[item.dateKey].push(item);
    });

    return order.map((key) => ({
      date: key,
      items: groups[key],
    }));
  }, [filteredNotifications]);

  // Helper to render icon for each notification type
  const renderNotificationIcon = (type: DisplayNotification['type']) => {
    switch (type) {
      case 'JOB_DISPATCH':
      case 'ASSIGNMENT':
      case 'ENQUIRY':
        return (
          <div className="w-12 h-12 rounded-2xl bg-[#0F8A5F] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Briefcase className="w-5 h-5 stroke-[2]" />
          </div>
        );
      case 'FINANCE':
        return (
          <div className="w-12 h-12 rounded-2xl bg-[#10B981] text-white flex items-center justify-center shrink-0 shadow-xs">
            <IndianRupee className="w-5 h-5 stroke-[2.2]" />
          </div>
        );
      case 'DUTY':
      case 'SHIFT_UPDATE':
        return (
          <div className="w-12 h-12 rounded-2xl bg-[#0D9488] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Clock className="w-5 h-5 stroke-[2]" />
          </div>
        );
      case 'URGENT':
      case 'WARNING':
        return (
          <div className="w-12 h-12 rounded-2xl bg-[#EF4444] text-white flex items-center justify-center shrink-0 shadow-xs">
            <AlertCircle className="w-5 h-5 stroke-[2]" />
          </div>
        );
      case 'SUCCESS':
        return (
          <div className="w-12 h-12 rounded-2xl bg-[#10B981] text-white flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-5 h-5 stroke-[2]" />
          </div>
        );
      case 'SYSTEM':
      case 'INFO':
      default:
        return (
          <div className="w-12 h-12 rounded-2xl bg-[#1E293B] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Bell className="w-5 h-5 stroke-[2]" />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center font-sans antialiased text-slate-800">
      {/* 1. TOP NAVBAR */}
      <WorkerNavbar
        activeTab="notifications"
        onLogout={() => {
          router.push('/worker/login');
        }}
        hasNotifications={assignedJobsCount > 0}
        assignedJobsCount={assignedJobsCount}
        isOnDuty={isOnDuty}
        onToggleDuty={requestToggleDuty}
        isTogglingDuty={togglingDuty}
        userName={user?.name || user?.username || 'Operative'}
        userAvatar={user?.avatar}
        userHandle={user?.username || undefined}
        userRole={user?.role}
      />

      {/* ========================================================
          MOBILE NOTIFICATIONS CONTAINER (Matching Provided UI)
      ======================================================== */}
      <div className="w-full max-w-md mx-auto pt-20 sm:pt-24 pb-28 px-4 flex flex-col gap-4">
        
        {/* Top Header: Back Arrow, Title, Search & Three-Dots Menu */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/worker/dashboard')}
              className="p-1 -ml-1 text-slate-800 hover:text-slate-950 transition-colors cursor-pointer"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-6 h-6 stroke-[2]" />
            </button>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Notifications
            </h1>
          </div>

          <div className="flex items-center gap-1 relative" ref={menuRef}>
            {/* Search Icon */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                isSearchOpen ? 'bg-slate-200 text-slate-900' : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
              title="Search alerts"
            >
              <Search className="w-5 h-5 stroke-[2]" />
            </button>

            {/* Three Dots Menu */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-full text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer"
              title="More Options"
            >
              <MoreVertical className="w-5 h-5 stroke-[2]" />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 top-10 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-40 animate-in fade-in zoom-in-95">
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                >
                  <CheckCheck className="w-4 h-4 text-[#0F8A5F]" />
                  <span>Mark all as read</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    reloadAll();
                    fetchNotifications();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 text-slate-500 ${isReloading ? 'animate-spin' : ''}`} />
                  <span>Refresh alerts</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setViewMode(viewMode === 'notifications' ? 'activity' : 'notifications');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                >
                  <Activity className="w-4 h-4 text-[#0F8A5F]" />
                  <span>{viewMode === 'notifications' ? 'Activity history' : 'Back to notifications'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Expandable Search Input */}
        {isSearchOpen && (
          <div className="relative animate-in fade-in slide-in-from-top-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications, dispatches..."
              className="w-full pl-9 pr-9 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0F8A5F] shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* ========================================================
            FILTER PILLS (Matching Reference: All / Income / Expenses)
        ======================================================== */}
        {viewMode === 'notifications' && (
          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              type="button"
              onClick={() => setActiveFilter('ALL')}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                activeFilter === 'ALL'
                  ? 'bg-[#0F563F] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
              }`}
            >
              All
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('DISPATCHES')}
              className={`px-4.5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                activeFilter === 'DISPATCHES'
                  ? 'bg-[#0F563F] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
              }`}
            >
              Dispatches
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('SHIFTS')}
              className={`px-4.5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                activeFilter === 'SHIFTS'
                  ? 'bg-[#0F563F] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
              }`}
            >
              Duty &amp; Shifts
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('UNREAD')}
              className={`px-4.5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                activeFilter === 'UNREAD'
                  ? 'bg-[#0F563F] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
              }`}
            >
              Unread
            </button>
          </div>
        )}

        {/* View Mode: Activity Log Feed */}
        {viewMode === 'activity' ? (
          <div className="pt-2">
            <ActivityFeed
              token={token}
              isDark={false}
              title="Operative Audit Trail"
              subtitle="Chronological record of your assignments, check-ins, and operations"
              limit={20}
            />
          </div>
        ) : (
          /* ========================================================
              GROUPED CHRONOLOGICAL FEED (Today, Yesterday, Apr 28, 2025)
          ======================================================== */
          <div className="flex flex-col gap-5 pt-1">
            {groupedNotifications.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center justify-center gap-2.5 bg-white rounded-3xl border border-slate-100 p-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                  <Bell className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-700">No notifications found</h3>
                <p className="text-xs text-slate-400 max-w-xs">
                  {searchQuery
                    ? `No alerts matching "${searchQuery}"`
                    : 'You have no new alerts in this category.'}
                </p>
              </div>
            ) : (
              groupedNotifications.map((group) => (
                <div key={group.date} className="flex flex-col gap-2.5">
                  {/* Group Date Header */}
                  <h2 className="text-sm sm:text-[15px] font-bold text-slate-900 tracking-tight px-1">
                    {group.date}
                  </h2>

                  {/* Group Items */}
                  <div className="flex flex-col gap-1.5">
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectNotification(item)}
                        className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl transition-all cursor-pointer group ${
                          item.isRead
                            ? 'hover:bg-slate-100/70'
                            : 'bg-emerald-50/40 hover:bg-emerald-50/70 border border-emerald-100/80 shadow-2xs'
                        }`}
                      >
                        {/* Left: Squircle Icon & Text Details */}
                        <div className="flex items-center gap-3.5 min-w-0 pr-2">
                          {renderNotificationIcon(item.type)}

                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[14px] font-bold text-slate-900 truncate leading-snug group-hover:text-[#0F8A5F] transition-colors">
                                {item.title}
                              </span>
                              {!item.isRead && (
                                <span className="w-2 h-2 rounded-full bg-[#0F8A5F] shrink-0" />
                              )}
                            </div>
                            <span className="text-[12px] text-slate-400 font-normal truncate mt-0.5">
                              {item.subtitle}
                            </span>
                          </div>
                        </div>

                        {/* Right: Amount/Status Badge & Timestamp */}
                        <div className="flex flex-col items-end shrink-0 pl-1">
                          {item.rightBadge && (
                            <span
                              className={`text-[13px] font-bold tracking-tight leading-snug ${
                                item.rightBadge.variant === 'positive'
                                  ? 'text-[#0F8A5F]'
                                  : item.rightBadge.variant === 'accent'
                                  ? 'text-[#0F8A5F]'
                                  : item.rightBadge.variant === 'negative'
                                  ? 'text-slate-800'
                                  : 'text-slate-600'
                              }`}
                            >
                              {item.rightBadge.text}
                            </span>
                          )}
                          <span className="text-[11px] text-slate-400 font-normal mt-0.5">
                            {item.displayTime}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ========================================================
          DETAILED NOTIFICATION VIEW MODAL (Finora Style Receipt)
      ======================================================== */}
      <WorkerNotificationDetailModal
        notification={selectedNotification}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedNotification(null);
        }}
        onOpenJob={(job) => {
          setIsDetailModalOpen(false);
          setSelectedWorkOrder(job);
          setIsWorkOrderModalOpen(true);
        }}
        onDelete={handleDeleteNotification}
      />

      {/* ========================================================
          WORK ORDER DETAILS MODAL (Finora Style Matching Receipt)
      ======================================================== */}
      {selectedWorkOrder && (
        <WorkerWorkOrderDetailModal
          job={selectedWorkOrder}
          isOpen={isWorkOrderModalOpen}
          onClose={() => {
            setIsWorkOrderModalOpen(false);
            setSelectedWorkOrder(null);
          }}
          onBack={() => {
            setIsWorkOrderModalOpen(false);
            if (selectedNotification) {
              setIsDetailModalOpen(true);
            }
          }}
          onUpdateStatus={updateJobStatus}
          isActing={actionLoadingId === selectedWorkOrder.id}
          onJobUpdated={reloadAll}
        />
      )}

      {/* Duty Availability Modal */}
      <WorkerAvailabilityModal
        isOpen={isAvailabilityModalOpen}
        onClose={() => setIsAvailabilityModalOpen(false)}
        onConfirm={confirmDutyChange}
        isLoading={togglingDuty}
        userName={user?.name || user?.username || 'Operative'}
        currentStatus={isOnDuty ? 'AVAILABLE' : 'OFF_DUTY'}
      />
    </div>
  );
}
