'use client';

import React, { useState, useEffect } from 'react';
import NextLink from 'next/link';
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  User,
  Shield,
  Activity,
  FileText,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import {
  adminDashboardService,
  type PaginatedActivities,
} from '@/services/Admin/dashboard/dashboard.service';
import { useAuth } from '@/context/auth-context';
import { useAdminTheme } from '@/context/admin-theme-context';

export function EmployeesTable() {
  const { token } = useAuth();
  const { isDark } = useAdminTheme();
  const [data, setData] = useState<PaginatedActivities | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    if (!token) return;
    setIsLoading(true);
    adminDashboardService
      .getRecentActivity(token, 10, page, roleFilter)
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        console.error('Failed to load recent activities', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [token, page, roleFilter]);

  const tabs = [
    { id: 'ALL', label: 'All Users' },
    { id: 'WORKER', label: 'Workers' },
    { id: 'CUSTOMER', label: 'Customers' },
    { id: 'OFFICE_STAFF', label: 'Office Staff' },
  ];

  return (
    <div
      className={`rounded-[28px] border overflow-hidden flex flex-col min-h-[400px] transition-all duration-200 ${
        isDark
          ? 'bg-[#12141A] border-white/[0.06] shadow-sm'
          : 'bg-white border-slate-200 shadow-xs'
      }`}
    >
      {/* Header: Title on Left, View All / Filters on Right (Exact Reference Layout) */}
      <div
        className={`p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b ${
          isDark ? 'border-white/[0.06]' : 'border-slate-100'
        }`}
      >
        <div>
          <h3
            className={`font-bold text-base sm:text-lg tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Recent System Activity
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Audit logs &amp; user actions across Kerala operations
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Tab Filter Pills */}
          <div
            className={`flex p-1 rounded-full border overflow-x-auto custom-scrollbar ${
              isDark ? 'bg-[#121318] border-white/[0.08]' : 'bg-slate-100 border-slate-200'
            }`}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setRoleFilter(tab.id);
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  roleFilter === tab.id
                    ? isDark
                      ? 'bg-[#241A19] text-[#FF6B4A] border border-[#FF5C38]/25 font-bold shadow-xs'
                      : 'bg-white text-orange-600 shadow-xs font-bold'
                    : isDark
                    ? 'text-gray-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <NextLink
            href="/admin/audit-logs"
            className="text-xs font-bold text-[#FF5C38] hover:text-[#FF7A5C] transition-colors shrink-0"
          >
            View All
          </NextLink>
        </div>
      </div>

      {/* Desktop Table View (Matching Exact Reference Table Styling) */}
      <div className="hidden md:block overflow-x-auto custom-scrollbar flex-1">
        <table className="w-full text-sm text-left">
          <thead
            className={`text-[11px] uppercase tracking-wider border-b ${
              isDark
                ? 'bg-[#14151B] text-gray-400 border-white/[0.06]'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
          >
            <tr>
              <th scope="col" className="px-6 py-3.5 font-bold">User</th>
              <th scope="col" className="px-6 py-3.5 font-bold">Role</th>
              <th scope="col" className="px-6 py-3.5 font-bold">Action</th>
              <th scope="col" className="px-6 py-3.5 font-bold">Details</th>
              <th scope="col" className="px-6 py-3.5 font-bold">Time</th>
            </tr>
          </thead>
          <tbody
            className={`divide-y ${
              isDark ? 'divide-white/[0.04] text-gray-300' : 'divide-slate-100 text-slate-700'
            }`}
          >
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  <div className="flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[#FF5C38]" />
                  </div>
                </td>
              </tr>
            ) : !data || data.data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  No recent activity found.
                </td>
              </tr>
            ) : (
              data.data.map((log) => {
                const roleBadgeColor =
                  log.userRole === 'WORKER'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : log.userRole === 'CUSTOMER'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : log.userRole === 'OFFICE_STAFF'
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    : 'bg-[#FF5C38]/10 text-[#FF7A5C] border-[#FF5C38]/20';

                return (
                  <tr
                    key={log.id}
                    className={`transition-colors ${
                      isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="px-6 py-4 font-semibold whitespace-nowrap">
                      <span className={isDark ? 'text-white' : 'text-slate-900'}>
                        {log.userName || log.user?.name || log.user?.username || log.userEmail || 'System'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {log.userRole ? (
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${roleBadgeColor}`}
                        >
                          {log.userRole.replace('_', ' ')}
                        </span>
                      ) : (
                        <span className="text-gray-500 italic text-xs">System</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-xs text-[#FF5C38] capitalize">
                        {log.action.toLowerCase().replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs line-clamp-1 max-w-sm">
                        {log.details || log.entityType || 'Action logged'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Grid View */}
      <div className="md:hidden p-3 flex-1">
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#FF5C38]" />
          </div>
        ) : !data || data.data.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-xs">
            No recent activity found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {data.data.map((log) => {
              const roleBadgeColor =
                log.userRole === 'WORKER'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : log.userRole === 'CUSTOMER'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : log.userRole === 'OFFICE_STAFF'
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  : 'bg-[#FF5C38]/10 text-[#FF7A5C] border-[#FF5C38]/20';

              return (
                <div
                  key={log.id}
                  className={`p-3 rounded-2xl border transition-all text-left ${
                    isDark
                      ? 'bg-[#14151B] border-white/[0.06] hover:border-white/[0.12]'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleBadgeColor}`}
                    >
                      {log.userRole ? log.userRole.replace('_', ' ') : 'USER'}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {new Date(log.createdAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <h4
                    className={`text-xs font-bold truncate ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {log.userName || log.user?.name || log.user?.username || log.userEmail || 'System'}
                  </h4>

                  <div className="mt-1">
                    <span className="text-[11px] font-semibold text-[#FF5C38] capitalize block truncate">
                      {log.action.toLowerCase().replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div
                    className={`mt-2 p-2 rounded-xl border text-[11px] ${
                      isDark
                        ? 'bg-[#101217] border-white/[0.06] text-gray-300'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <p className="line-clamp-2 leading-tight">
                      {log.details || log.entityType || 'Action logged'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {data && data.totalPages > 1 && (
        <div
          className={`p-4 border-t flex justify-between items-center ${
            isDark
              ? 'border-white/[0.06] bg-[#14151B] text-gray-400'
              : 'border-slate-100 bg-slate-50 text-slate-600'
          }`}
        >
          <div className="text-xs font-medium">
            Page {data.page} of {data.totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className={`p-1.5 rounded-lg border text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer ${
                isDark
                  ? 'border-white/[0.08] bg-[#181A20] text-gray-300 hover:text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page === data.totalPages}
              onClick={() => setPage(page + 1)}
              className={`p-1.5 rounded-lg border text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer ${
                isDark
                  ? 'border-white/[0.08] bg-[#181A20] text-gray-300 hover:text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
