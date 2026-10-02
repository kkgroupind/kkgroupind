'use client';
import React, { useState, useEffect } from 'react';
import { ChevronDown, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminDashboardService, type AuditLog, type PaginatedActivities } from '@/services/Admin/dashboard/dashboard.service';
import { useAuth } from '@/context/auth-context';

export function EmployeesTable() {
  const { token } = useAuth();
  const [data, setData] = useState<PaginatedActivities | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    if (!token) return;
    setIsLoading(true);
    adminDashboardService.getRecentActivity(token, 20, page, roleFilter)
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
    <div className="bg-[#14151A] rounded-2xl border border-gray-800 overflow-hidden flex flex-col min-h-[400px]">
      <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-800/50">
        <h3 className="font-bold text-gray-200 text-base sm:text-lg">Recent Users Activity</h3>
        
        <div className="flex bg-[#1A1C23] p-1 rounded-xl border border-gray-800 overflow-x-auto custom-scrollbar w-full sm:w-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setRoleFilter(tab.id); setPage(1); }}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex-1 sm:flex-none ${roleFilter === tab.id ? 'bg-[#7B4DFF] text-white' : 'text-gray-400 hover:text-gray-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Mobile Card Grid View: 2 cards per row with super details */}
      <div className="md:hidden p-3 flex-1">
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
          </div>
        ) : !data || data.data.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-xs">
            No recent activity found.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {data.data.map((log) => {
              const roleColor =
                log.userRole === 'WORKER'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : log.userRole === 'CUSTOMER'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : log.userRole === 'OFFICE_STAFF'
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  : 'bg-purple-500/10 text-purple-400 border-purple-500/20';

              return (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-[#1A1C23] border border-gray-800 flex flex-col justify-between hover:border-gray-700 transition-all text-left"
                >
                  <div>
                    {/* Top: Role & Time */}
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border truncate ${roleColor}`}
                      >
                        {log.userRole ? log.userRole.replace('_', ' ') : 'USER'}
                      </span>
                      <span className="text-[9px] text-gray-500 shrink-0 font-mono">
                        {new Date(log.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* User Name */}
                    <h4 className="text-xs font-bold text-gray-100 truncate">
                      {log.userName || log.user?.name || log.user?.username || log.userEmail || 'System'}
                    </h4>

                    {/* Action */}
                    <div className="mt-1">
                      <span className="text-[10px] font-semibold text-[#A881FF] capitalize block truncate">
                        {log.action.toLowerCase().replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Super Details */}
                    <div className="mt-1.5 p-1.5 rounded-lg bg-[#14151A] border border-gray-800/60">
                      <p className="text-[10px] text-gray-300 line-clamp-3 leading-tight">
                        {log.details || log.entityType || 'Action logged'}
                      </p>
                      {log.entityType && (
                        <div className="text-[8px] text-gray-500 font-mono mt-1 truncate">
                          Ref: {log.entityType}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Date footer */}
                  <div className="mt-2 pt-1.5 border-t border-gray-800/40 text-[8px] text-gray-500 flex items-center justify-between">
                    <span>
                      {new Date(log.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                    <span className="font-mono text-gray-400">
                      {new Date(log.createdAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto custom-scrollbar flex-1">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-xs text-gray-500 bg-[#14151A] border-b border-gray-800/50">
            <tr>
              <th scope="col" className="px-6 py-4 font-medium">User</th>
              <th scope="col" className="px-6 py-4 font-medium">Role</th>
              <th scope="col" className="px-6 py-4 font-medium">Action</th>
              <th scope="col" className="px-6 py-4 font-medium">Details</th>
              <th scope="col" className="px-6 py-4 font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-500" /></div>
                </td>
              </tr>
            ) : (!data || data.data.length === 0) ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No recent activity found.
                </td>
              </tr>
            ) : (
              data.data.map((log) => (
                <tr key={log.id} className="bg-[#14151A] hover:bg-[#1A1C23] transition-colors border-b border-gray-800/30 last:border-0">
                  <td className="px-6 py-4 font-medium text-gray-200 whitespace-nowrap">
                    {log.userName || log.user?.name || log.user?.username || log.userEmail || 'System'}
                  </td>
                  <td className="px-6 py-4">
                    {log.userRole ? (
                      <span className="bg-[#1A1C23] text-gray-300 border border-gray-700 px-2.5 py-1 rounded-md text-[10px] font-bold">
                        {log.userRole.replace('_', ' ')}
                      </span>
                    ) : (
                      <span className="text-gray-500 italic text-xs">Unknown</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-300 font-medium capitalize">{log.action.toLowerCase().replace('_', ' ')}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-400 text-xs">{log.details || log.entityType}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-500 text-xs">
                      {new Date(log.createdAt).toLocaleString('en-IN')}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="p-4 border-t border-gray-800/50 flex justify-between items-center bg-[#14151A]">
          <div className="text-xs text-gray-500">
            Showing page {data.page} of {data.totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="p-1.5 rounded-lg border border-gray-800 bg-[#1A1C23] text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page === data.totalPages}
              onClick={() => setPage(page + 1)}
              className="p-1.5 rounded-lg border border-gray-800 bg-[#1A1C23] text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
