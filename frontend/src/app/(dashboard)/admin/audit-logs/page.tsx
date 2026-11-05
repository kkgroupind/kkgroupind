'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useAdminTheme } from '@/context/admin-theme-context';
import { AuditService, AuditLogItem, AuditStats } from '@/services';
import {
  Activity,
  Search,
  RefreshCw,
  User,
  Clock,
  Shield,
  Briefcase,
  HardHat,
  UserCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  CheckCircle2,
  Filter,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function AdminAuditLogsPage() {
  const { token } = useAuth();
  const { isDark } = useAdminTheme();

  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });

  // Simplified filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const fetchLogs = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search.trim()) params.search = search.trim();
      if (roleFilter !== 'ALL') params.userRole = roleFilter;
      if (entityFilter !== 'ALL') params.entityType = entityFilter;

      const [logRes, statRes] = await Promise.allSettled([
        AuditService.getLogs(token, params),
        AuditService.getStats(token),
      ]);

      if (logRes.status === 'fulfilled' && logRes.value) {
        setLogs(logRes.value.items || []);
        setMeta(logRes.value.meta || { total: 0, page: 1, limit: 20, totalPages: 1 });
      }

      if (statRes.status === 'fulfilled' && statRes.value) {
        setStats(statRes.value);
      }
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token, page, search, roleFilter, entityFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Plain-English Action Formatter for Non-Tech Users
  const formatActionTitle = (action: string, entityType: string) => {
    const act = action.toUpperCase();
    if (act.includes('LOGIN')) return 'Logged into the system';
    if (act.includes('LOGOUT')) return 'Logged out';
    if (act.includes('CREATE') && entityType === 'SERVICE_ENQUIRY') return 'Created a new work request';
    if (act.includes('ASSIGN') || act.includes('DISPATCH')) return 'Assigned worker to job';
    if (act.includes('COMPLETE')) return 'Marked job as completed';
    if (act.includes('START')) return 'Started job work timer';
    if (act.includes('PAUSE')) return 'Paused work timer';
    if (act.includes('RESUME')) return 'Resumed work timer';
    if (act.includes('PAY') || act.includes('FINANCE')) return 'Recorded financial payment';
    if (act.includes('VERIFY')) return 'Verified payment record';
    if (act.includes('UPDATE')) return 'Updated account details';
    if (act.includes('DELETE')) return 'Removed record';
    return action.replace(/_/g, ' ').toLowerCase();
  };

  const rolePills = [
    { id: 'ALL', label: 'All People' },
    { id: 'WORKER', label: 'Workers' },
    { id: 'OFFICE_STAFF', label: 'Office Staff' },
    { id: 'CUSTOMER', label: 'Customers' },
    { id: 'SUPER_ADMIN', label: 'Super Admins' },
  ];

  const categoryPills = [
    { id: 'ALL', label: 'All Activities' },
    { id: 'SERVICE_ENQUIRY', label: 'Job Orders' },
    { id: 'FINANCE', label: 'Payments & Money' },
    { id: 'ATTENDANCE', label: 'Daily Attendance' },
    { id: 'USER', label: 'Profiles' },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 select-none">
      {/* 1. Header: Simple, Clean, Non-Tech Friendly */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Activity History
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                isDark ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-800'
              }`}
            >
              {meta.total} Total Actions
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            See everything happening in your business: who did what, when, and on which job
          </p>
        </div>

        <button
          onClick={() => fetchLogs()}
          disabled={isLoading}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
            isDark
              ? 'bg-[#12141A] hover:bg-[#181B24] border-white/[0.08] text-gray-300 hover:text-white'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-xs'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#6366F1] ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 2. Top Metric Cards: 3 Simple, Clear Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className={`p-5 rounded-[26px] border flex items-center justify-between transition-all ${
            isDark ? 'bg-[#12141A] border-white/[0.06]' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              All Actions Recorded
            </span>
            <div
              className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}
            >
              {stats?.totalAllTime || meta.total || 0}
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5">Complete history since day one</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#6366F1]/10 border border-[#6366F1]/20 flex items-center justify-center text-[#6366F1]">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div
          className={`p-5 rounded-[26px] border flex items-center justify-between transition-all ${
            isDark ? 'bg-[#12141A] border-white/[0.06]' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Today&apos;s Actions
            </span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {stats?.totalToday || 0}
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5">Happened today</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div
          className={`p-5 rounded-[26px] border flex items-center justify-between transition-all ${
            isDark ? 'bg-[#12141A] border-white/[0.06]' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Active Crew &amp; Clients
            </span>
            <div className="text-2xl font-black text-[#FF6442] mt-1">
              4 Roles
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5">Admins, Office, Workers, Clients</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#FF6442]/10 border border-[#FF6442]/20 flex items-center justify-center text-[#FF6442]">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Filter Toolbar: Intuitive Search & Role Pills */}
      <div
        className={`p-4 sm:p-5 rounded-[28px] border space-y-3.5 transition-all ${
          isDark ? 'bg-[#12141A] border-white/[0.06]' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by person name, job order, payment note..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className={`w-full pl-11 pr-4 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all focus:outline-none ${
              isDark
                ? 'bg-[#181B24] border border-white/[0.08] text-white placeholder-gray-500 focus:border-[#6366F1]'
                : 'bg-slate-100 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#6366F1]'
            }`}
          />
        </div>

        {/* Filter Pills Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pt-1 border-t border-white/[0.05]">
          {/* Role Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full md:w-auto">
            {rolePills.map((pill) => (
              <button
                key={pill.id}
                onClick={() => {
                  setRoleFilter(pill.id);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  roleFilter === pill.id
                    ? 'bg-[#6366F1] text-white shadow-xs'
                    : isDark
                    ? 'bg-[#181B24] text-gray-400 hover:text-white border border-white/[0.06]'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full md:w-auto">
            {categoryPills.map((pill) => (
              <button
                key={pill.id}
                onClick={() => {
                  setEntityFilter(pill.id);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  entityFilter === pill.id
                    ? 'bg-white/20 text-white font-bold'
                    : isDark
                    ? 'text-gray-400 hover:text-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Activity Stream: Simple, Clean Cards */}
      <div
        className={`rounded-[28px] border overflow-hidden transition-all ${
          isDark ? 'bg-[#0D0E12] border-white/[0.06]' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="p-4 sm:p-5 border-b border-white/[0.06] flex items-center justify-between">
          <h3
            className={`font-bold text-sm sm:text-base ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Live Activity Stream
          </h3>
          <span className="text-xs text-gray-500">
            Page {meta.page} of {meta.totalPages}
          </span>
        </div>

        {isLoading ? (
          <div className="p-16 text-center">
            <RefreshCw className="w-6 h-6 animate-spin text-[#6366F1] mx-auto mb-2" />
            <p className="text-xs text-gray-400">Loading activity stream...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center text-gray-400 text-xs">
            No activity matches your search or filter.
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {logs.map((log) => {
              const roleColor =
                log.userRole === 'WORKER'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : log.userRole === 'OFFICE_STAFF'
                  ? 'bg-[#6366F1]/10 text-[#818cf8] border-[#6366F1]/20'
                  : log.userRole === 'CUSTOMER'
                  ? 'bg-[#FF6442]/10 text-[#FF6442] border-[#FF6442]/20'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/20';

              const roleIcon =
                log.userRole === 'WORKER' ? (
                  <HardHat className="w-3.5 h-3.5" />
                ) : log.userRole === 'OFFICE_STAFF' ? (
                  <Briefcase className="w-3.5 h-3.5" />
                ) : (
                  <User className="w-3.5 h-3.5" />
                );

              const timeStr = new Date(log.createdAt).toLocaleString('en-IN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              const personName =
                log.userName || log.userEmail || 'System';

              return (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className={`p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 transition-colors cursor-pointer ${
                    isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    {/* User Avatar Circle */}
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6366F1] to-[#FF6442] p-[1.5px] shrink-0">
                      <div
                        className={`w-full h-full rounded-[14px] flex items-center justify-center font-bold text-xs uppercase ${
                          isDark ? 'bg-[#12141A] text-white' : 'bg-white text-indigo-600'
                        }`}
                      >
                        {personName.charAt(0)}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`font-bold text-xs sm:text-sm ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          {personName}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${roleColor}`}
                        >
                          {roleIcon}
                          <span>{log.userRole ? log.userRole.replace('_', ' ') : 'System'}</span>
                        </span>
                      </div>

                      <p className="text-xs text-gray-300 dark:text-gray-400 mt-0.5 line-clamp-1">
                        <strong className="text-white capitalize">
                          {formatActionTitle(log.action, log.entityType)}
                        </strong>
                        {log.details ? ` — ${log.details}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Time & View Details Button */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] text-gray-400 whitespace-nowrap font-medium">
                      {timeStr}
                    </span>
                    <button
                      type="button"
                      className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white border border-white/[0.06] transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        {meta.totalPages > 1 && (
          <div
            className={`p-4 border-t flex justify-between items-center ${
              isDark ? 'border-white/[0.06] bg-[#0A0B0E]' : 'border-slate-100 bg-slate-50'
            }`}
          >
            <span className="text-xs text-gray-400 font-medium">
              Showing page {meta.page} of {meta.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 rounded-full border border-white/[0.08] text-xs font-semibold disabled:opacity-40 transition-colors cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={page >= meta.totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 rounded-full border border-white/[0.08] text-xs font-semibold disabled:opacity-40 transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Simplified Activity Detail Dialog */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div
            className={`w-full max-w-lg rounded-[28px] border shadow-2xl p-6 space-y-4 ${
              isDark ? 'bg-[#12141A] border-white/[0.08] text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#6366F1]/10 text-[#6366F1] flex items-center justify-center font-bold">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Action Details</h3>
                  <p className="text-[11px] text-gray-400">Recorded system event</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex justify-between">
                <span className="text-gray-400 font-medium">Person:</span>
                <span className="font-bold">
                  {selectedLog.userName || selectedLog.userEmail || 'System'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex justify-between">
                <span className="text-gray-400 font-medium">Role:</span>
                <span className="font-bold">{selectedLog.userRole || 'System'}</span>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex justify-between">
                <span className="text-gray-400 font-medium">Action:</span>
                <span className="font-bold capitalize text-[#6366F1]">
                  {formatActionTitle(selectedLog.action, selectedLog.entityType)}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex justify-between">
                <span className="text-gray-400 font-medium">Time:</span>
                <span className="font-bold font-mono">
                  {new Date(selectedLog.createdAt).toLocaleString('en-IN')}
                </span>
              </div>

              {selectedLog.details && (
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] space-y-1">
                  <span className="text-gray-400 font-medium block">Details:</span>
                  <p className="text-gray-200">{selectedLog.details}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedLog(null)}
              className="w-full py-2.5 rounded-full bg-[#6366F1] hover:bg-[#5E5CE6] text-white font-bold text-xs transition-all shadow-md"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
