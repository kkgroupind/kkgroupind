'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  Search,
  RefreshCw,
  Clock,
  Layers,
  Code,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { AuditService, AuditLogItem } from '@/services/audit.service';
import { ActivityModal } from './ActivityModal';

interface ActivityFeedProps {
  token: string | null;
  title?: string;
  subtitle?: string;
  isDark?: boolean;
  limit?: number;
}

export function ActivityFeed({
  token,
  title = 'My Activity & Audit Log',
  subtitle = 'Immutable timestamped trail of all actions and operations performed by your account',
  isDark = true,
  limit = 10,
}: ActivityFeedProps) {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit, totalPages: 1 });

  const fetchMyLogs = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const params: any = { page, limit };
      if (search.trim()) params.search = search.trim();
      if (actionFilter !== 'ALL') params.action = actionFilter;

      const res = await AuditService.getMyLogs(token, params);
      setLogs(res.items || []);
      setMeta(res.meta || { total: 0, page: 1, limit, totalPages: 1 });
    } catch (err) {
      console.error('Failed to fetch my activity logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token, page, limit, search, actionFilter]);

  useEffect(() => {
    fetchMyLogs();
  }, [fetchMyLogs]);

  const getActionBadgeColor = (action: string) => {
    if (action.includes('CREATE') || action.includes('REGISTER'))
      return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (action.includes('VERIFY') || action.includes('ACCEPTED'))
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    if (action.includes('LOGIN'))
      return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    if (action.includes('COMPLETED'))
      return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
    if (action.includes('DUTY') || action.includes('CHECK_IN'))
      return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  return (
    <div
      className={`rounded-2xl sm:rounded-3xl border shadow-xl p-4 sm:p-7 transition-all ${
        isDark ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 sm:mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-[#2A835F]/15 text-[#2A835F] flex items-center justify-center font-bold shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight">{title}</h2>
          </div>
          <p className={`text-[11px] sm:text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchMyLogs()}
          disabled={isLoading}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
            isDark
              ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#2A835F]' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="sm:col-span-2 relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search action or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#2A835F] ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {['ALL', 'LOGIN', 'ENQUIRY', 'DUTY'].map((act) => (
            <button
              key={act}
              type="button"
              onClick={() => setActionFilter(act)}
              className={`flex-1 shrink-0 px-2.5 py-2 rounded-xl text-[11px] font-bold border transition-all text-center cursor-pointer ${
                actionFilter === act
                  ? 'bg-[#2A835F] text-white border-[#2A835F]'
                  : isDark
                  ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              {act}
            </button>
          ))}
        </div>
      </div>

      {/* Log Items */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-[#2A835F] mb-2" />
          <span className="text-xs">Loading activity ledger...</span>
        </div>
      ) : logs.length === 0 ? (
        <div
          className={`py-12 text-center rounded-2xl border border-dashed p-6 ${
            isDark ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'
          }`}
        >
          <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#2A835F]" />
          <p className="text-xs font-semibold">No activity logs recorded matching criteria</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => {
            const dateObj = new Date(log.createdAt);
            const dateFormatted = dateObj.toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const timeFormatted = dateObj.toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });

            return (
              <div
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group hover:shadow-md ${
                  isDark
                    ? 'bg-slate-950/60 hover:bg-slate-950/90 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-50/60 hover:bg-white border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-[#2A835F]/10 border border-[#2A835F]/20 text-[#2A835F] flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border ${getActionBadgeColor(
                          log.action,
                        )}`}
                      >
                        {log.action}
                      </span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {log.entityType}
                      </span>
                      {log.entityId && (
                        <span className="font-mono text-[10px] text-slate-400 truncate max-w-[120px]">
                          #{log.entityId.slice(0, 8)}
                        </span>
                      )}
                    </div>

                    {log.details && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                        {log.details}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {dateFormatted}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{timeFormatted}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLog(log);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-[#2A835F]/10 text-[#2A835F] hover:bg-[#2A835F] hover:text-white transition-all cursor-pointer"
                  >
                    <Code className="w-3 h-3" />
                    <span>Inspect</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Page {meta.page} of {meta.totalPages} ({meta.total} activities)
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Activity Details Modal */}
      <ActivityModal
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
        isDark={isDark}
      />
    </div>
  );
}
