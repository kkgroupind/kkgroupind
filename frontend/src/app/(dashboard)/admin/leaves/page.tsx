'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { useAdminTheme } from '@/context/admin-theme-context';
import { useRouter } from 'next/navigation';
import {
  Coffee,
  Search,
  RefreshCw,
  HardHat,
  Briefcase,
  Calendar,
  AlertCircle,
  Phone,
  Clock,
} from 'lucide-react';
import { AttendanceService, AttendanceOverviewResponse } from '@/services';

export default function AdminLeavesPage() {
  const { token, user, isLoading: authLoading } = useAuth();
  const { isDark } = useAdminTheme();
  const router = useRouter();

  const [data, setData] = useState<AttendanceOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = useCallback(
    async (showRefresh = false) => {
      if (!token) return;
      if (showRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      try {
        const res = await AttendanceService.getOverview(token);
        setData(res);
      } catch (err) {
        console.error('Failed to load leave records', err);
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

  const offDutyStaff = useMemo(() => {
    if (!data?.officeStaff) return [];
    return data.officeStaff.filter((s) => !s.isAvailable || s.staffStatus === 'OFF_DUTY');
  }, [data]);

  const offDutyWorkers = useMemo(() => {
    if (!data?.workers) return [];
    return data.workers.filter((w) => w.workerStatus === 'OFF_DUTY');
  }, [data]);

  const totalOffDuty = offDutyStaff.length + offDutyWorkers.length;

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
              <Coffee className="w-5 h-5" />
            </div>
            Staff &amp; Worker Leaves
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            See who is off-duty or on leave today across office staff and field workers
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
          <span>{isRefreshing ? 'Refreshing...' : 'Reload Leaves'}</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div
          className={`p-4 sm:p-5 rounded-3xl border transition-all flex flex-col justify-between ${
            isDark ? 'bg-[#181A20] border-white/[0.06]' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Total Leave Today
          </span>
          <div className="text-xl sm:text-2xl font-bold text-amber-400 mt-2">{totalOffDuty}</div>
          <span className="text-[11px] text-amber-400 mt-1.5">Staff &amp; workers off duty</span>
        </div>

        <div
          className={`p-4 sm:p-5 rounded-3xl border transition-all flex flex-col justify-between ${
            isDark ? 'bg-[#181A20] border-white/[0.06]' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Office Staff Away
          </span>
          <div className={`text-xl sm:text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{offDutyStaff.length}</div>
          <span className={`text-[11px] mt-1.5 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Desk status inactive</span>
        </div>

        <div
          className={`p-4 sm:p-5 rounded-3xl border transition-all flex flex-col justify-between ${
            isDark ? 'bg-[#181A20] border-white/[0.06]' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Field Workers Away
          </span>
          <div className={`text-xl sm:text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{offDutyWorkers.length}</div>
          <span className={`text-[11px] mt-1.5 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Unavailable for dispatch</span>
        </div>
      </div>

      {/* Two Column Layout: Office Staff Leaves vs Field Worker Leaves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Office Staff Leaves */}
        <div
          className={`p-6 rounded-3xl border space-y-4 ${
            isDark ? 'bg-[#181A20] border-white/[0.06]' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
            <h3 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Briefcase className="w-4 h-4 text-[#FF5C38]" />
              <span>Office Staff Off Duty ({offDutyStaff.length})</span>
            </h3>
            <span className="text-xs text-amber-400 font-semibold">Inactive Desk</span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
            {offDutyStaff.length === 0 ? (
              <div className={`p-8 text-center text-xs italic ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                All office staff members are currently present on desk.
              </div>
            ) : (
              offDutyStaff.map((staff) => (
                <div
                  key={staff.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between ${
                    isDark ? 'bg-[#121318] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {staff.name || staff.username}
                    </h4>
                    <span className={`text-[11px] font-mono ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                      @{staff.username}
                    </span>
                    <div className={`text-[11px] mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      {staff.phone || staff.email || 'No contact'}
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Off Duty
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Field Workers Leaves */}
        <div
          className={`p-6 rounded-3xl border space-y-4 ${
            isDark ? 'bg-[#181A20] border-white/[0.06]' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
            <h3 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <HardHat className="w-4 h-4 text-emerald-400" />
              <span>Field Workers Off Duty ({offDutyWorkers.length})</span>
            </h3>
            <span className="text-xs text-amber-400 font-semibold">On Leave</span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
            {offDutyWorkers.length === 0 ? (
              <div className={`p-8 text-center text-xs italic ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                No workers are currently recorded on leave today.
              </div>
            ) : (
              offDutyWorkers.map((worker) => (
                <div
                  key={worker.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between ${
                    isDark ? 'bg-[#121318] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {worker.name || worker.username}
                    </h4>
                    <span className={`text-[11px] font-mono ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                      @{worker.username}
                    </span>
                    <div className={`text-[11px] mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      {worker.phone || 'No phone'}
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Leave / Off Duty
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
