'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { useAdminTheme } from '@/context/admin-theme-context';
import { useRouter } from 'next/navigation';
import {
  Activity,
  Search,
  RefreshCw,
  HardHat,
  Briefcase,
  Phone,
  Mail,
  UserCheck,
  CheckCircle2,
  Clock,
  Coffee,
} from 'lucide-react';
import { AttendanceService, AttendanceOverviewResponse, EnquiryService, WorkerWithAvailability } from '@/services';

export default function AdminAvailabilityPage() {
  const { token, user, isLoading: authLoading } = useAuth();
  const { isDark } = useAdminTheme();
  const router = useRouter();

  const [attendance, setAttendance] = useState<AttendanceOverviewResponse | null>(null);
  const [workers, setWorkers] = useState<WorkerWithAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'BUSY' | 'OFF_DUTY'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = useCallback(
    async (showRefresh = false) => {
      if (!token) return;
      if (showRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      try {
        const [overviewRes, workersRes] = await Promise.allSettled([
          AttendanceService.getOverview(token),
          EnquiryService.getActiveWorkers(token),
        ]);
        if (overviewRes.status === 'fulfilled') {
          setAttendance(overviewRes.value);
        }
        if (workersRes.status === 'fulfilled') {
          setWorkers(workersRes.value.workers || []);
        }
      } catch (err) {
        console.error('Failed to load availability data', err);
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
        loadData();
      }
    }
  }, [authLoading, token, user, router, loadData]);

  const filteredWorkers = useMemo(() => {
    return workers.filter((w) => {
      const matchStatus = statusFilter === 'ALL' || w.workerStatus === statusFilter;
      const matchSearch =
        searchTerm === '' ||
        (w.name && w.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (w.username && w.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (w.phone && w.phone.includes(searchTerm));
      return matchStatus && matchSearch;
    });
  }, [workers, statusFilter, searchTerm]);

  const counts = useMemo(() => {
    const available = workers.filter((w) => w.workerStatus === 'AVAILABLE').length;
    const busy = workers.filter((w) => w.workerStatus === 'BUSY').length;
    const offDuty = workers.filter((w) => w.workerStatus === 'OFF_DUTY').length;
    return { available, busy, offDuty, total: workers.length };
  }, [workers]);

  return (
    <div className={`space-y-6 max-w-[1400px] mx-auto pb-10 ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-bold flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <div
              className={`p-2.5 rounded-[24px] border flex items-center justify-center ${
                isDark ? 'bg-[#12141A] border-white/[0.08] text-[#6366F1]' : 'bg-white border-slate-200 text-[#6366F1] shadow-xs'
              }`}
            >
              <Activity className="w-5 h-5" />
            </div>
            Worker Availability
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            See which workers are ready to work today, busy on jobs, or off duty
          </p>
        </div>

        <button
          onClick={() => loadData(true)}
          disabled={isRefreshing || isLoading}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border transition-all disabled:opacity-50 cursor-pointer ${
            isDark
              ? 'bg-[#12141A] hover:bg-[#161922] border-white/[0.08] text-zinc-300 hover:text-white'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-xs'
          }`}
        >
          <RefreshCw
            className={`w-4 h-4 text-[#6366F1] ${isRefreshing ? 'animate-spin' : ''}`}
          />
          <span>{isRefreshing ? 'Refreshing...' : 'Reload Availability'}</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
          className={`p-4 sm:p-5 rounded-[24px] border transition-all flex flex-col justify-between ${
            isDark ? 'bg-[#12141A] border-white/[0.06]' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <span className={`text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Available Today
          </span>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 mt-2">{counts.available}</div>
          <span className="text-[11px] text-emerald-400 mt-1.5">Ready for new jobs</span>
        </div>

        <div
          className={`p-4 sm:p-5 rounded-[24px] border transition-all flex flex-col justify-between ${
            isDark ? 'bg-[#12141A] border-white/[0.06]' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <span className={`text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Working on Site
          </span>
          <div className="text-xl sm:text-2xl font-bold text-blue-400 mt-2">{counts.busy}</div>
          <span className="text-[11px] text-blue-400 mt-1.5">Currently on jobs</span>
        </div>

        <div
          className={`p-4 sm:p-5 rounded-[24px] border transition-all flex flex-col justify-between ${
            isDark ? 'bg-[#12141A] border-white/[0.06]' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <span className={`text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Off Duty / Away
          </span>
          <div className="text-xl sm:text-2xl font-bold text-amber-400 mt-2">{counts.offDuty}</div>
          <span className="text-[11px] text-amber-400 mt-1.5">Not available today</span>
        </div>

        <div
          className={`p-4 sm:p-5 rounded-[24px] border transition-all flex flex-col justify-between ${
            isDark ? 'bg-[#12141A] border-white/[0.06]' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <span className={`text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Total Workers
          </span>
          <div className={`text-xl sm:text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{counts.total}</div>
          <span className={`text-[11px] mt-1.5 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Total registered crew</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className={`p-4 rounded-3xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 ${
          isDark ? 'bg-[#181A20] border-white/[0.06]' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="relative flex-1 max-w-md">
          <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search worker name, username, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-full text-xs sm:text-sm border transition-colors outline-none ${
              isDark
                ? 'bg-[#121318] border-white/[0.06] text-white placeholder-zinc-500 focus:border-[#FF5C38]/50'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#FF5C38]/50'
            }`}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {(['ALL', 'AVAILABLE', 'BUSY', 'OFF_DUTY'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === s
                  ? 'bg-[#FF5C38] text-white shadow-sm'
                  : isDark
                  ? 'bg-[#121318] hover:bg-[#1E2028] text-zinc-400 hover:text-white border border-white/[0.06]'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
              }`}
            >
              {s === 'ALL' ? 'All Status' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Workers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWorkers.map((w) => {
          const isAvail = w.workerStatus === 'AVAILABLE';
          const isBusy = w.workerStatus === 'BUSY';

          return (
            <div
              key={w.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between gap-3 ${
                isDark ? 'bg-[#181A20] border-white/[0.06]' : 'bg-white border-slate-200 shadow-xs'
              } ${!isAvail && !isBusy ? 'opacity-65' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-xs ${
                      isAvail
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : isBusy
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        : isDark ? 'bg-[#121318] border-white/[0.06] text-zinc-400' : 'bg-slate-100 border-slate-200 text-slate-500'
                    }`}
                  >
                    {w.name ? w.name.charAt(0).toUpperCase() : 'W'}
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {w.name || w.username}
                    </h3>
                    <span className={`text-[11px] font-mono ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                      @{w.username}
                    </span>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    isAvail
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : isBusy
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isAvail ? 'bg-emerald-400' : isBusy ? 'bg-blue-400' : 'bg-amber-400'
                    }`}
                  />
                  {w.workerStatus}
                </span>
              </div>

              <div className={`pt-3 border-t space-y-1.5 text-xs ${isDark ? 'border-white/[0.06] text-zinc-400' : 'border-slate-100 text-slate-600'}`}>
                <div className="flex items-center justify-between">
                  <span>Mobile:</span>
                  <span className={`font-mono ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>{w.phone || 'No phone'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Completed Assignments:</span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {w._count?.workerAssignments ?? 0}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
