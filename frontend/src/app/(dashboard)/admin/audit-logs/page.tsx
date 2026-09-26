'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { useAdminTheme } from '@/context/admin-theme-context';
import {
  AuditService,
  AuditLogItem,
  AuditStats,
} from '@/services';
import {
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  User,
  Clock,
  Activity,
  Layers,
  FileText,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Code,
  HardHat,
  Briefcase,
  UserCircle,
  Shield,
  CheckCircle2,
} from 'lucide-react';

export default function AdminAuditLogsPage() {
  const { token } = useAuth();
  const { isDark } = useAdminTheme();

  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 25, totalPages: 1 });

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  // Selected Log for details modal
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = { page, limit: 25 };
      if (search.trim()) params.search = search.trim();
      if (roleFilter !== 'ALL') params.userRole = roleFilter;
      if (entityFilter !== 'ALL') params.entityType = entityFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const [logRes, statRes] = await Promise.all([
        AuditService.getLogs(token, params),
        AuditService.getStats(token),
      ]);

      setLogs(logRes.items);
      setMeta(logRes.meta);
      setStats(statRes);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token, page, search, roleFilter, entityFilter, startDate, endDate]);

  useEffect(() => {
    if (token) {
      fetchLogs();
    }
  }, [token, fetchLogs]);

  const getRoleBadge = (role?: string | null) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <Shield className="w-3 h-3" />
            Super Admin
          </span>
        );
      case 'OFFICE_STAFF':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Briefcase className="w-3 h-3" />
            Office Staff
          </span>
        );
      case 'WORKER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <HardHat className="w-3 h-3" />
            Worker
          </span>
        );
      case 'CUSTOMER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <UserCircle className="w-3 h-3" />
            Customer
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400">
            System
          </span>
        );
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('CREATE')) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (action.includes('VERIFY') || action.includes('APPROVE')) return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    if (action.includes('DELETE') || action.includes('REJECT')) return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
    if (action.includes('UPDATE')) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 p-4 sm:p-6 lg:p-8 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Header Banner */}
      <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 mb-8 border shadow-xl ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80'
      }`}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-radial from-purple-500/10 to-transparent pointer-events-none rounded-full blur-3xl -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Immutable Audit Trail
              </span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                System Security & Governance
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight flex items-center gap-3">
              <span>Universal Audit Logs</span>
              <span className="text-lg sm:text-2xl font-bold text-purple-500 opacity-90 hidden sm:inline">
                ഓഡിറ്റ് ലോഗുകൾ
              </span>
            </h1>
            <p className={`mt-2 text-sm max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Complete real-time ledger of actions executed across Super Admin, Office Staff, Field Workers, and Customers — financial entries, verification signatures, ticket assignments, and logins.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchLogs()}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border font-bold text-xs transition-all ${
                isDark ? 'border-slate-800 bg-slate-800 hover:bg-slate-700 text-slate-300' : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-purple-500' : ''}`} />
              <span>Refresh Log</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
        
        <div className={`p-6 rounded-3xl border transition-all ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Total Recorded Events
            </span>
            <Activity className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-3xl font-black text-purple-500">
            {stats?.totalAllTime || meta.total || 0}
          </div>
          <div className="text-xs text-slate-400 mt-1">Across all users & subsystems</div>
        </div>

        <div className={`p-6 rounded-3xl border transition-all ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Today&apos;s Operations
            </span>
            <Clock className="w-5 h-5 text-[#2A835F]" />
          </div>
          <div className="text-3xl font-black text-[#2A835F]">
            {stats?.totalToday || 0}
          </div>
          <div className="text-xs text-slate-400 mt-1">Events logged today in Kerala time</div>
        </div>

        <div className={`p-6 rounded-3xl border transition-all ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Active Stakeholders
            </span>
            <User className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-black text-blue-500">
            4 Roles
          </div>
          <div className="text-xs text-slate-400 mt-1">Admin, Staff, Worker & Customer</div>
        </div>

      </div>

      {/* Filter Toolbar */}
      <div className={`rounded-3xl border shadow-xl p-6 mb-8 ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Search text */}
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search user, action, details, IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Role filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold focus:outline-none ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <option value="ALL">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="OFFICE_STAFF">Office Staff</option>
              <option value="WORKER">Worker</option>
              <option value="CUSTOMER">Customer</option>
            </select>
          </div>

          {/* Entity filter */}
          <div>
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold focus:outline-none ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <option value="ALL">All Entities</option>
              <option value="FINANCE">Finance & Cashbook</option>
              <option value="SERVICE_ENQUIRY">Service Enquiries</option>
              <option value="USER">User & Profile</option>
              <option value="ATTENDANCE">Attendance & Duty</option>
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border text-xs font-medium focus:outline-none ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
              title="Filter from Date"
            />
          </div>

        </div>
      </div>

      {/* Audit Log Table */}
      <div className={`rounded-3xl border shadow-xl overflow-hidden ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className={`border-b text-xs font-bold uppercase tracking-wider ${
              isDark ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
              <tr>
                <th className="py-4 px-4 sm:px-6">Timestamp</th>
                <th className="py-4 px-4">Actor & Role</th>
                <th className="py-4 px-4">Action</th>
                <th className="py-4 px-4">Entity</th>
                <th className="py-4 px-4">Details</th>
                <th className="py-4 px-4 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No audit records matching your criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const dateObj = new Date(log.createdAt);
                  const timeFormatted = dateObj.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });
                  const dateFormatted = dateObj.toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <tr key={log.id} className="hover:bg-slate-500/5 transition-colors">
                      {/* Timestamp */}
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                        <div className="font-semibold">{dateFormatted}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{timeFormatted}</div>
                      </td>

                      {/* Actor */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {log.userName || log.userEmail || 'System Process'}
                        </div>
                        <div className="mt-1">
                          {getRoleBadge(log.userRole)}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>

                      {/* Entity */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-700 dark:text-slate-300">
                          {log.entityType}
                        </div>
                        {log.entityId && (
                          <div className="text-[10px] font-mono text-slate-400 truncate max-w-[120px]">
                            {log.entityId}
                          </div>
                        )}
                      </td>

                      {/* Details Preview */}
                      <td className="py-4 px-4 max-w-xs truncate">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          {log.details || '—'}
                        </span>
                      </td>

                      {/* View Action */}
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold hover:bg-purple-500/10 hover:text-purple-500 transition-colors"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-400">
              Showing page {meta.page} of {meta.totalPages} ({meta.total} events)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* INSPECT LOG MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 shadow-2xl border ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-500">
                  Security Audit Inspection
                </span>
                <h3 className="text-lg font-mono font-bold mt-0.5">
                  Log ID: {selectedLog.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 rounded-xl hover:bg-slate-500/10 text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-500/10">
                <div>
                  <div className="text-xs text-slate-400 uppercase font-bold">Action</div>
                  <div className="font-mono font-bold mt-1 text-purple-400">{selectedLog.action}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase font-bold">Timestamp</div>
                  <div className="font-semibold mt-1">{new Date(selectedLog.createdAt).toLocaleString('en-IN')}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-slate-400 uppercase text-[11px] font-bold">Actor</div>
                  <div className="font-semibold mt-0.5">{selectedLog.userName || 'System'}</div>
                  <div className="text-xs text-slate-400">{selectedLog.userEmail}</div>
                </div>
                <div>
                  <div className="text-slate-400 uppercase text-[11px] font-bold">Actor Role</div>
                  <div className="mt-1">{getRoleBadge(selectedLog.userRole)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-slate-400 uppercase text-[11px] font-bold">Entity Type</div>
                  <div className="font-semibold mt-0.5">{selectedLog.entityType}</div>
                </div>
                <div>
                  <div className="text-slate-400 uppercase text-[11px] font-bold">Entity ID</div>
                  <div className="font-mono text-xs mt-0.5">{selectedLog.entityId || 'N/A'}</div>
                </div>
              </div>

              {selectedLog.ipAddress && (
                <div>
                  <div className="text-slate-400 uppercase text-[11px] font-bold">Client IP Address</div>
                  <div className="font-mono text-xs mt-0.5">{selectedLog.ipAddress}</div>
                </div>
              )}

              <div>
                <div className="text-slate-400 uppercase text-[11px] font-bold mb-1.5">Full Payload Details</div>
                <pre className={`p-4 rounded-2xl font-mono text-xs overflow-x-auto border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>
                  {(() => {
                    try {
                      return JSON.stringify(JSON.parse(selectedLog.details || '{}'), null, 2);
                    } catch {
                      return selectedLog.details || 'No details payload recorded';
                    }
                  })()}
                </pre>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
