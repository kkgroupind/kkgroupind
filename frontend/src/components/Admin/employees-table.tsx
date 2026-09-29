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
      <div className="p-6 flex justify-between items-center border-b border-gray-800/50">
        <h3 className="font-bold text-gray-200 text-lg">Recent Users Activity</h3>
        
        <div className="flex bg-[#1A1C23] p-1 rounded-xl border border-gray-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setRoleFilter(tab.id); setPage(1); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${roleFilter === tab.id ? 'bg-[#7B4DFF] text-white' : 'text-gray-400 hover:text-gray-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="overflow-x-auto custom-scrollbar flex-1">
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
