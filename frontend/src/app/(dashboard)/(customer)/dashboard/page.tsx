'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getDashboardRoute } from '@/lib/auth-routes';
import { RoleBadge } from '@/components/role-badge';
import {
  User,
  Mail,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ShoppingBag,
  Heart,
  Settings,
  Bell,
  ArrowUpRight,
  Phone,
  MapPin,
  RefreshCw,
  Loader2,
  Sparkles,
  Activity,
} from 'lucide-react';
import { EnquiryService, ServiceEnquiry } from '@/services';
import { ActivityFeed } from '@/components/ActivityFeed';
import { NotificationFeed } from '@/components/NotificationFeed';
import { AnnouncementsList } from '@/components/AnnouncementsList';
import { Megaphone } from 'lucide-react';

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const [enquiries, setEnquiries] = useState<ServiceEnquiry[]>([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(true);
  const [activeTab, setActiveTab] = useState<'bookings' | 'activities' | 'notifications' | 'announcements'>('bookings');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (token) {
      import('@/services/notification.service').then(({ NotificationService }) => {
        NotificationService.getMyNotifications(token, { limit: 1 })
          .then((res) => setUnreadCount(res.unreadCount || 0))
          .catch(() => {});
      });
    }
  }, [token]);

  useEffect(() => {
    if (!isLoading) {
      if (!token || !user) {
        router.push('/login');
      } else if (user.role !== 'CUSTOMER') {
        router.push(getDashboardRoute(user.role));
      }
    }
  }, [isLoading, token, user, router]);

  const loadEnquiries = useCallback(async () => {
    if (!token) return;
    setLoadingEnquiries(true);
    try {
      const res = await EnquiryService.getCustomerEnquiries(token);
      setEnquiries(res.enquiries || []);
    } catch {
      // Graceful fallback
    } finally {
      setLoadingEnquiries(false);
    }
  }, [token]);

  useEffect(() => {
    if (token && user?.role === 'CUSTOMER') {
      loadEnquiries();
    }
  }, [loadEnquiries, token, user]);

  if (isLoading || !user) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 p-8 text-white shadow-xl mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-2xl font-bold shadow-inner">
              {user.email?.charAt(0).toUpperCase() || user.name?.charAt(0).toUpperCase() || 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm">
                  Customer Portal
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-100 border border-emerald-400/30">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  Email Verified
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Welcome back, {user.name || user.email?.split('@')[0]}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100 mt-0.5">
                {user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/#services"
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Book New Service</span>
            </a>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Account Details & Security */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-500" />
              Account Information
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 dark:text-zinc-400">Account Name</span>
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {user.name || 'Valued Customer'}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 dark:text-zinc-400">Email</span>
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {user.email}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 dark:text-zinc-400">Account Type</span>
                <RoleBadge role={user.role} size="sm" />
              </div>

              <div className="flex justify-between py-2">
                <span className="text-zinc-500 dark:text-zinc-400">Member Since</span>
                <span className="text-zinc-700 dark:text-zinc-300">
                  {new Date(user.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              Security Check
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">
              Your customer account is protected with email OTP verification and encrypted authentication.
            </p>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Email authentication validated</span>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Tabs for Bookings, Activities & Notifications */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab Navigation Bar */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setActiveTab('bookings')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Bookings ({enquiries.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('activities')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'activities'
                  ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4 text-purple-400" />
              <span>Activity History</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('announcements')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'announcements'
                  ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Megaphone className="w-4 h-4 text-indigo-400" />
              <span>Announcements</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('notifications')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                activeTab === 'notifications'
                  ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Bell className="w-4 h-4 text-amber-400" />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
          </div>

          {/* TAB 1: Service Bookings & Enquiries */}
          {activeTab === 'bookings' && (
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                    My Service Bookings &amp; Enquiries
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Real-time status updates on services you requested
                  </p>
                </div>

                <button
                  onClick={loadEnquiries}
                  className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {loadingEnquiries ? (
                <div className="py-12 flex flex-col items-center justify-center text-zinc-400">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-500 mb-2" />
                  <span className="text-xs">Loading your enquiries...</span>
                </div>
              ) : enquiries.length === 0 ? (
                <div className="py-12 text-center text-zinc-400 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 p-6">
                  <ShoppingBag className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                    No service enquiries found
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-1 mb-4">
                    Browse our 13 home &amp; commercial services and submit an enquiry anytime.
                  </p>
                  <a
                    href="/#services"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <span>Explore Services</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  {enquiries.map((enq) => {
                    const isCompleted = enq.status === 'COMPLETED';
                    const isInProgress = enq.status === 'IN_PROGRESS';
                    const isAssigned = enq.status === 'ASSIGNED';

                    return (
                      <div
                        key={enq.id}
                        className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              {enq.trackingNumber}
                            </span>
                            <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                              {enq.serviceName}
                            </h4>
                          </div>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isCompleted
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : isInProgress
                                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                                : isAssigned
                                ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {enq.status.replace('_', ' ')}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-600 dark:text-zinc-300">
                          {enq.message}
                        </p>

                        {enq.worker && (
                          <div className="text-[11px] text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/30 p-2.5 rounded-lg border border-sky-100 dark:border-sky-900 flex items-center justify-between">
                            <span>
                              Assigned Worker: <strong>{enq.worker.name || 'Specialist'}</strong>
                            </span>
                            {enq.worker.phone && (
                              <a
                                href={`tel:${enq.worker.phone}`}
                                className="font-semibold underline flex items-center gap-1"
                              >
                                <Phone className="w-3 h-3" />
                                <span>{enq.worker.phone}</span>
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: Announcements */}
          {activeTab === 'announcements' && (
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-indigo-500" />
                    Company Announcements
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Important notices and updates from KK Group
                  </p>
                </div>
              </div>
              <AnnouncementsList />
            </div>
          )}

          {/* TAB 2: Activity & Audit Ledger */}
          {activeTab === 'activities' && (
            <ActivityFeed
              token={token}
              isDark={true}
              title="My Account Activity Trail"
              subtitle="Full chronological ledger of your logins, service bookings, and verified actions"
              limit={15}
            />
          )}

          {/* TAB 3: Notifications & Real-Time Alerts */}
          {activeTab === 'notifications' && (
            <NotificationFeed
              token={token}
              isDark={true}
              title="My Notifications & Dispatch Alerts"
              onCountChange={setUnreadCount}
            />
          )}
        </div>
      </div>
    </div>
  );
}
