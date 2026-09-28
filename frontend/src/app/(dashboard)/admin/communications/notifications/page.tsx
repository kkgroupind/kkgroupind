'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
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
} from 'lucide-react';
import {
  EnquiryService,
  AttendanceService,
  NotificationService,
  NotificationItem as ApiNotification,
  ServiceEnquiry,
} from '@/services';
import { Send, Plus, Megaphone } from 'lucide-react';

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
                  link: '/admin/operations/enquiries',
                });
              } else if (e.workerId) {
                items.push({
                  id: `enq-assign-${e.id}`,
                  title: `Technician Dispatched: ${e.serviceName}`,
                  message: `Assigned to ${e.worker?.name || e.worker?.username || 'technician'} for tracking code ${e.trackingNumber}.`,
                  category: 'DISPATCH',
                  time: e.assignedAt || e.updatedAt,
                  isRead: true,
                  link: '/admin/operations/assignments',
                });
              }
            }
          });
        }

        // Sort latest first
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
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10 text-gray-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
            <div className="p-2 bg-[#1A1C23] border border-gray-800 rounded-xl">
              <Bell className="w-6 h-6 text-[#7B4DFF]" />
            </div>
            Operations &amp; System Notifications
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Real-time activity alerts on customer requests, workforce dispatches, and check-ins
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => setIsBroadcastModalOpen(true)}
            className="flex items-center gap-2 bg-[#7B4DFF] hover:bg-[#6c3df2] px-3.5 py-2 rounded-xl text-sm font-medium text-white transition-all shadow-lg shadow-[#7B4DFF]/20"
          >
            <Megaphone className="w-4 h-4" />
            <span>Broadcast</span>
          </button>

          <button
            onClick={() => loadNotifications(true)}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-2 bg-[#14151A] hover:bg-[#1A1C23] border border-gray-800 px-3.5 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 text-[#7B4DFF] ${isRefreshing ? 'animate-spin' : ''}`}
            />
            <span>{isRefreshing ? 'Refreshing...' : 'Reload'}</span>
          </button>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-3.5 py-2 rounded-xl text-sm font-medium text-gray-200 hover:text-white border border-gray-700 transition-all"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-[#14151A] border border-gray-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0D0E12] border border-gray-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-gray-700"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(['ALL', 'ENQUIRY', 'DISPATCH', 'ATTENDANCE'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                categoryFilter === cat
                  ? 'bg-[#1A1C23] text-white border border-gray-700'
                  : 'bg-[#0D0E12] text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              {cat === 'ALL'
                ? 'All Alerts'
                : cat === 'ENQUIRY'
                ? 'Enquiries'
                : cat === 'DISPATCH'
                ? 'Dispatches'
                : 'Attendance'}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-[#14151A] rounded-xl border border-gray-800 overflow-hidden divide-y divide-gray-800">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#7B4DFF]" />
            <span>Loading notifications...</span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-xs">
            No notifications found in this category.
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                notif.isRead ? 'hover:bg-[#1A1C23]/40' : 'bg-blue-950/10 hover:bg-blue-950/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                    notif.category === 'ENQUIRY'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : notif.category === 'DISPATCH'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {notif.category === 'ENQUIRY' ? (
                    <FolderKanban className="w-4 h-4" />
                  ) : notif.category === 'DISPATCH' ? (
                    <HardHat className="w-4 h-4" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-semibold text-gray-100">{notif.title}</h3>
                    {!notif.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{notif.message}</p>
                  <span className="text-[11px] text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-600" />
                    <span>{new Date(notif.time).toLocaleString()}</span>
                  </span>
                </div>
              </div>

              {notif.link && (
                <button
                  type="button"
                  onClick={() => router.push(notif.link!)}
                  className="px-2.5 py-1 rounded bg-[#0D0E12] hover:bg-gray-800 text-gray-300 hover:text-white text-xs font-medium border border-gray-800 transition-colors shrink-0"
                >
                  View
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Broadcast Announcement Modal */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-[#14151A] border border-gray-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#7B4DFF]/10 text-[#7B4DFF] border border-[#7B4DFF]/20 rounded-xl">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-100">Send System Broadcast</h2>
                  <p className="text-xs text-gray-400">Push real-time alert notifications to users</p>
                </div>
              </div>
              <button
                onClick={() => setIsBroadcastModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
                  Target Audience
                </label>
                <select
                  value={broadcastRole}
                  onChange={(e) => setBroadcastRole(e.target.value as any)}
                  className="w-full bg-[#0D0E12] border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-gray-200 focus:outline-none focus:border-[#7B4DFF]"
                >
                  <option value="ALL">Everyone (All Registered Users)</option>
                  <option value="WORKER">Technicians &amp; Labor Workforce Only</option>
                  <option value="OFFICE_STAFF">Office Staff &amp; Coordinators Only</option>
                  <option value="CUSTOMER">Customers Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
                  Notification Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule Update, Urgent Weather Alert..."
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full bg-[#0D0E12] border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-[#7B4DFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
                  Message Content
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Type your official announcement here..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full bg-[#0D0E12] border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-[#7B4DFF] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  disabled={isSendingBroadcast}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingBroadcast || !broadcastTitle.trim() || !broadcastMessage.trim()}
                  className="flex items-center gap-2 bg-[#7B4DFF] hover:bg-[#6c3df2] px-4 py-2 rounded-xl text-xs font-semibold text-white transition disabled:opacity-50 shadow-md shadow-[#7B4DFF]/25"
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
