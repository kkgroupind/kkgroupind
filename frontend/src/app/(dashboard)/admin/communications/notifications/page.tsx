'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { useAdminTheme } from '@/context/admin-theme-context';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Search,
  RefreshCw,
  FolderKanban,
  HardHat,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
  Trash2,
  Check,
  Send,
  Plus,
  Megaphone,
  X,
} from 'lucide-react';
import {
  EnquiryService,
  AttendanceService,
  NotificationService,
  NotificationItem as ApiNotification,
  ServiceEnquiry,
} from '@/services';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'ENQUIRY' | 'DISPATCH' | 'ATTENDANCE' | 'SYSTEM';
  time: string;
  isRead: boolean;
  link?: string;
}

export default function AdminNotificationsPage() {
  const { token, user, isLoading: authLoading } = useAuth();
  const { isDark } = useAdminTheme();
  const router = useRouter();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'ENQUIRY' | 'DISPATCH' | 'ATTENDANCE' | 'SYSTEM'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Broadcast Modal State
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastRole, setBroadcastRole] = useState<'ALL' | 'WORKER' | 'OFFICE_STAFF' | 'CUSTOMER'>('ALL');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);

  const loadNotifications = useCallback(
    async (showRefresh = false) => {
      if (!token) return;
      if (showRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      try {
        const [notifRes, enqRes] = await Promise.allSettled([
          NotificationService.getMyNotifications(token, { limit: 50 }),
          EnquiryService.getAllEnquiries({}, token),
        ]);

        const items: NotificationItem[] = [];

        // 1. Real persistent notifications
        if (notifRes.status === 'fulfilled' && notifRes.value.items) {
          notifRes.value.items.forEach((n) => {
            let cat: 'ENQUIRY' | 'DISPATCH' | 'ATTENDANCE' | 'SYSTEM' = 'SYSTEM';
            if (n.type === 'ENQUIRY') cat = 'ENQUIRY';
            else if (n.type === 'ASSIGNMENT') cat = 'DISPATCH';
            else if (n.type === 'DUTY') cat = 'ATTENDANCE';

            items.push({
              id: n.id,
              title: n.title,
              message: n.message,
              category: cat,
              time: n.createdAt,
              isRead: n.isRead,
              link: n.link || undefined,
            });
          });
        }

        // 2. Fallback / Live Operational Events from Enquiries
        if (enqRes.status === 'fulfilled' && enqRes.value.enquiries) {
          enqRes.value.enquiries.slice(0, 15).forEach((e) => {
            const exists = items.some((item) => item.message.includes(e.trackingNumber));
            if (!exists) {
              if (e.status === 'PENDING') {
                items.push({
                  id: `enq-pending-${e.id}`,
                  title: `New Service Enquiry: ${e.serviceName}`,
                  message: `Customer ${e.customerName} submitted a request at ${e.location || 'site'}. Tracking: ${e.trackingNumber}`,
                  category: 'ENQUIRY',
                  time: e.createdAt,
                  isRead: false,
                  link: `/admin/operations/enquiries`,
                });
              } else if (e.status === 'ASSIGNED' && e.worker) {
                items.push({
                  id: `enq-assigned-${e.id}`,
                  title: `Workforce Dispatched: ${e.serviceName}`,
                  message: `Worker ${e.worker.name || e.worker.username} assigned to ${e.customerName}. Tracking: ${e.trackingNumber}`,
                  category: 'DISPATCH',
                  time: e.updatedAt || e.createdAt,
                  isRead: true,
                  link: `/admin/operations/work-orders`,
                });
              }
            }
          });
        }

        items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        setNotifications(items);
      } catch (err) {
        console.error('Failed to load notifications', err);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [token],
  );

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !broadcastTitle.trim() || !broadcastMessage.trim()) return;
    setIsSendingBroadcast(true);
    try {
      await NotificationService.adminBroadcast(token, {
        role: broadcastRole === 'ALL' ? undefined : broadcastRole,
        title: broadcastTitle.trim(),
        message: broadcastMessage.trim(),
      });
      setIsBroadcastModalOpen(false);
      setBroadcastTitle('');
      setBroadcastMessage('');
      loadNotifications(true);
    } catch (err) {
      console.error('Failed to broadcast notification:', err);
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!token || user?.role !== 'SUPER_ADMIN') {
        router.push('/admin/login');
      } else {
        loadNotifications();
      }
    }
  }, [authLoading, token, user, router, loadNotifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const matchCat = categoryFilter === 'ALL' || n.category === categoryFilter;
      const matchSearch =
        searchTerm === '' ||
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [notifications, categoryFilter, searchTerm]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className={`space-y-6 max-w-[1400px] mx-auto pb-10 ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-bold flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <div
              className={`p-2.5 rounded-[24px] border flex items-center justify-center ${
                isDark ? 'bg-[#12141A] border-white/[0.08] text-[#6366F1]' : 'bg-white border-slate-200 text-[#6366F1] shadow-xs'
              }`}
            >
              <Bell className="w-5 h-5" />
            </div>
            System Alerts &amp; Notifications
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Real-time alerts for customer requests, worker job progress, and system updates
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
          <button
            onClick={() => setIsBroadcastModalOpen(true)}
            className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#5254E0] text-white px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold shadow-md shadow-[#6366F1]/20 transition-all cursor-pointer"
          >
            <Megaphone className="w-4 h-4" />
            <span>Broadcast Alert</span>
          </button>

          <button
            onClick={() => loadNotifications(true)}
            disabled={isRefreshing || isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border transition-all disabled:opacity-50 cursor-pointer ${
              isDark
                ? 'bg-[#12141A] hover:bg-[#161922] border-white/[0.08] text-zinc-300 hover:text-white'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-xs'
            }`}
          >
            <RefreshCw
              className={`w-4 h-4 text-[#6366F1] ${isRefreshing ? 'animate-spin' : ''}`}
            />
            <span>{isRefreshing ? 'Refreshing...' : 'Reload'}</span>
          </button>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#121318] hover:bg-[#1E2028] border-white/[0.08] text-zinc-300'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Mark all read</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className={`p-4 rounded-3xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 ${
          isDark ? 'bg-[#181A20] border-white/[0.06]' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="relative flex-1 max-w-md">
          <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-full text-xs sm:text-sm border transition-colors outline-none ${
              isDark
                ? 'bg-[#121318] border-white/[0.06] text-white placeholder-zinc-500 focus:border-[#FF5C38]/50'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#FF5C38]/50'
            }`}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {(['ALL', 'ENQUIRY', 'DISPATCH', 'ATTENDANCE'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-[#FF5C38] text-white shadow-sm'
                  : isDark
                  ? 'bg-[#121318] hover:bg-[#1E2028] text-zinc-400 hover:text-white border border-white/[0.06]'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'All Alerts' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className={`py-20 text-center ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-[#FF5C38]" />
            <p className="text-xs">Loading operational alerts...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div
            className={`p-12 rounded-3xl border text-center ${
              isDark ? 'bg-[#181A20] border-white/[0.06] text-zinc-400' : 'bg-white border-slate-200 text-slate-500'
            }`}
          >
            No notifications found.
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-5 rounded-3xl border transition-all flex items-start gap-4 ${
                notif.isRead
                  ? isDark ? 'bg-[#181A20] border-white/[0.04] opacity-80' : 'bg-white border-slate-200 opacity-90'
                  : isDark ? 'bg-[#181A20] border-[#FF5C38]/30 shadow-xs' : 'bg-white border-[#FF5C38]/40 shadow-xs ring-1 ring-[#FF5C38]/20'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 ${
                  notif.category === 'ENQUIRY'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : notif.category === 'DISPATCH'
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}
              >
                {notif.category === 'ENQUIRY' ? (
                  <Clock className="w-4 h-4" />
                ) : notif.category === 'DISPATCH' ? (
                  <HardHat className="w-4 h-4" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {notif.title}
                  </h4>
                  <span className={`text-[11px] font-mono shrink-0 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                    {new Date(notif.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  {notif.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Broadcast Modal */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div
            className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 space-y-5 ${
              isDark ? 'bg-[#181A20] border-white/[0.1]' : 'bg-white border-slate-200'
            }`}
          >
            <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#FF5C38]/15 text-[#FF5C38] flex items-center justify-center">
                  <Megaphone className="w-4 h-4" />
                </div>
                <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Broadcast System Announcement
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBroadcastModalOpen(false)}
                className={`p-1.5 rounded-full hover:bg-white/10 ${isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-400 hover:text-slate-800'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  Target Audience
                </label>
                <select
                  value={broadcastRole}
                  onChange={(e) => setBroadcastRole(e.target.value as any)}
                  className={`w-full rounded-2xl px-4 py-2.5 text-xs border outline-none ${
                    isDark ? 'bg-[#121318] border-white/[0.06] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="ALL">Everyone (All Registered Users)</option>
                  <option value="WORKER">Technicians &amp; Labor Workforce Only</option>
                  <option value="OFFICE_STAFF">Office Staff &amp; Coordinators Only</option>
                  <option value="CUSTOMER">Customers Only</option>
                </select>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  Notification Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule Update, Urgent Weather Alert..."
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className={`w-full rounded-2xl px-4 py-2.5 text-xs border outline-none ${
                    isDark
                      ? 'bg-[#121318] border-white/[0.06] text-white placeholder-zinc-500 focus:border-[#FF5C38]/50'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#FF5C38]/50'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  Message Content
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Type your official announcement here..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className={`w-full rounded-2xl px-4 py-2.5 text-xs border outline-none resize-none ${
                    isDark
                      ? 'bg-[#121318] border-white/[0.06] text-white placeholder-zinc-500 focus:border-[#FF5C38]/50'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#FF5C38]/50'
                  }`}
                />
              </div>

              <div className={`flex items-center justify-end gap-3 pt-3 border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  disabled={isSendingBroadcast}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
                    isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingBroadcast || !broadcastTitle.trim() || !broadcastMessage.trim()}
                  className="flex items-center gap-2 bg-[#FF5C38] hover:bg-[#FF6B4A] text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-lg shadow-[#FF5C38]/20 transition cursor-pointer disabled:opacity-50"
                >
                  {isSendingBroadcast ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Broadcast</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
