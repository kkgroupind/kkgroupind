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
import { EnquiryService, AttendanceService, ServiceEnquiry } from '@/services';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'ENQUIRY' | 'DISPATCH' | 'ATTENDANCE';
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
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'ENQUIRY' | 'DISPATCH' | 'ATTENDANCE'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const loadNotifications = useCallback(
    async (showRefresh = false) => {
      if (!token) return;
      if (showRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      try {
        const [enqRes, attRes] = await Promise.allSettled([
          EnquiryService.getAllEnquiries({}, token),
          AttendanceService.getOverview(token),
        ]);

        const items: NotificationItem[] = [];

        if (enqRes.status === 'fulfilled' && enqRes.value.enquiries) {
          enqRes.value.enquiries.slice(0, 15).forEach((e) => {
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
          });
        }

        if (attRes.status === 'fulfilled' && attRes.value.officeStaff) {
          attRes.value.officeStaff.forEach((s) => {
            if (s.todayAttendance) {
              items.push({
                id: `att-staff-${s.id}`,
                title: `Desk Check-in: ${s.name || s.username}`,
                message: `${s.name || s.username} checked in as ${s.isAvailable ? 'Available' : 'Off Duty'} today.`,
                category: 'ATTENDANCE',
                time: s.todayAttendance.checkInAt,
                isRead: true,
                link: '/admin/attendance',
              });
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
    </div>
  );
}
