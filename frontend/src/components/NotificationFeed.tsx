'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Check,
  Trash2,
  ExternalLink,
  Clock,
  Sparkles,
  HardHat,
  Briefcase,
  FolderKanban,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Filter,
} from 'lucide-react';
import {
  NotificationService,
  NotificationItem,
  NotificationType,
} from '@/services/notification.service';

interface NotificationFeedProps {
  token: string | null;
  title?: string;
  isDark?: boolean;
  onCountChange?: (unreadCount: number) => void;
}

export function NotificationFeed({
  token,
  title = 'Notifications & Alerts',
  isDark = true,
  onCountChange,
}: NotificationFeedProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filterUnread, setFilterUnread] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await NotificationService.getMyNotifications(token, {
        unreadOnly: filterUnread,
        limit: 25,
      });
      setNotifications(res.items || []);
      setUnreadCount(res.unreadCount || 0);
      if (onCountChange) onCountChange(res.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token, filterUnread, onCountChange]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    if (!token) return;
    try {
      await NotificationService.markAsRead(id, token);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      if (onCountChange) onCountChange(Math.max(0, unreadCount - 1));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!token) return;
    try {
      await NotificationService.markAllAsRead(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      if (onCountChange) onCountChange(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;
    try {
      await NotificationService.deleteNotification(id, token);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleClickItem = (item: NotificationItem) => {
    if (!item.isRead) {
      handleMarkAsRead(item.id);
    }
    if (item.link) {
      router.push(item.link);
    }
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'ENQUIRY':
        return <FolderKanban className="w-4 h-4 text-[#2A835F]" />;
      case 'ASSIGNMENT':
        return <HardHat className="w-4 h-4 text-purple-400" />;
      case 'DUTY':
        return <Briefcase className="w-4 h-4 text-amber-400" />;
      case 'SUCCESS':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'WARNING':
      case 'URGENT':
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div
      className={`rounded-2xl sm:rounded-3xl border shadow-xl p-4 sm:p-7 transition-all ${
        isDark ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#2A835F]/15 text-[#2A835F] flex items-center justify-center font-bold shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight">{title}</h2>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#2A835F] text-white">
                  {unreadCount} New
                </span>
              )}
            </div>
            <p className={`text-[11px] sm:text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Real-time dispatch updates, service assignments, and system notices
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>Mark all read</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setFilterUnread(!filterUnread)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              filterUnread
                ? 'bg-[#2A835F] text-white border-[#2A835F]'
                : isDark
                ? 'bg-slate-800 border-slate-700 text-slate-300'
                : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{filterUnread ? 'Unread Only' : 'All Alerts'}</span>
          </button>

          <button
            type="button"
            onClick={() => fetchNotifications()}
            disabled={isLoading}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#2A835F]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-[#2A835F] mb-2" />
          <span className="text-xs">Loading notifications...</span>
        </div>
      ) : notifications.length === 0 ? (
        <div
          className={`py-12 text-center rounded-2xl border border-dashed p-6 ${
            isDark ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'
          }`}
        >
          <Bell className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#2A835F]" />
          <p className="text-xs font-semibold">No notifications right now</p>
          <p className="text-[11px] text-slate-500 mt-1">You&apos;re completely up to date.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => {
            const dateObj = new Date(item.createdAt);
            const dateFormatted = dateObj.toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
            });
            const timeFormatted = dateObj.toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={item.id}
                onClick={() => handleClickItem(item)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 group ${
                  !item.isRead
                    ? isDark
                      ? 'bg-slate-950/90 border-[#2A835F]/40 shadow-[0_0_15px_rgba(42,131,95,0.08)]'
                      : 'bg-emerald-50/50 border-[#2A835F]/30'
                    : isDark
                    ? 'bg-slate-950/40 hover:bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                    : 'bg-slate-50/50 hover:bg-white border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      !item.isRead
                        ? 'bg-[#2A835F]/20 border-[#2A835F]/40'
                        : isDark
                        ? 'bg-slate-800/80 border-slate-700'
                        : 'bg-slate-100 border-slate-200'
                    }`}
                  >
                    {getTypeIcon(item.type)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-xs sm:text-sm font-bold truncate ${
                          !item.isRead
                            ? 'text-slate-900 dark:text-white'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {item.title}
                      </h4>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#2A835F] shrink-0 animate-pulse" />
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {item.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>
                          {dateFormatted}, {timeFormatted}
                        </span>
                      </span>

                      {item.link && (
                        <span className="text-[#2A835F] font-bold group-hover:underline flex items-center gap-0.5">
                          <span>Open action</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 self-start shrink-0">
                  <button
                    type="button"
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-1.5 rounded-lg opacity-80 sm:opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-all cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
