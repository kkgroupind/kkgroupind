'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
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
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10 text-gray-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
            <div className="p-2 bg-[#1A1C23] border border-gray-800 rounded-xl">
              <Coffee className="w-6 h-6 text-[#7B4DFF]" />
            </div>
            Leaves &amp; Off-Duty Personnel
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Track daily leaves and off-duty workforce across office operations and squads
          </p>
        </div>

        <button
          onClick={() => loadData(true)}
          disabled={isRefreshing || isLoading}
          className="flex items-center gap-2 bg-[#14151A] hover:bg-[#1A1C23] border border-gray-800 px-3.5 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-all disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 text-[#7B4DFF] ${isRefreshing ? 'animate-spin' : ''}`}
          />
          <span>{isRefreshing ? 'Refreshing...' : 'Reload Leave Records'}</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#14151A] border border-gray-800">
          <span className="text-xs text-gray-500 font-medium">Total on Leave Today</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">{totalOffDuty}</div>
          <span className="text-xs text-amber-500/80 mt-1 block">Staff &amp; workers off duty</span>
        </div>

        <div className="p-4 rounded-xl bg-[#14151A] border border-gray-800">
          <span className="text-xs text-gray-500 font-medium">Office Staff Away</span>
          <div className="text-2xl font-bold text-gray-100 mt-1">{offDutyStaff.length}</div>
          <span className="text-xs text-gray-500 mt-1 block">Desk status inactive</span>
        </div>

        <div className="p-4 rounded-xl bg-[#14151A] border border-gray-800">
          <span className="text-xs text-gray-500 font-medium">Field Workers Away</span>
          <div className="text-2xl font-bold text-gray-100 mt-1">{offDutyWorkers.length}</div>
          <span className="text-xs text-gray-500 mt-1 block">Unavailable for field dispatch</span>
        </div>
      </div>

      {/* Two Column Layout: Office Staff Leaves vs Field Worker Leaves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Office Staff Leaves */}
        <div className="bg-[#14151A] rounded-xl border border-gray-800 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <h3 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-purple-400" />
              <span>Office Staff Off Duty ({offDutyStaff.length})</span>
            </h3>
            <span className="text-xs text-amber-400 font-medium">Inactive Desk</span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
            {offDutyStaff.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-xs italic">
                All office staff members are currently present on desk.
              </div>
            ) : (
              offDutyStaff.map((staff) => (
                <div
                  key={staff.id}
                  className="p-3.5 rounded-lg bg-[#0D0E12] border border-gray-800 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-medium text-gray-100">
                      {staff.name || staff.username}
                    </h4>
                    <span className="text-[11px] text-gray-500 font-mono">
                      @{staff.username}
                    </span>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      {staff.phone || staff.email || 'No contact'}
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Off Duty
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Field Workers Leaves */}
        <div className="bg-[#14151A] rounded-xl border border-gray-800 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <h3 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
              <HardHat className="w-4 h-4 text-emerald-400" />
              <span>Field Workers Off Duty ({offDutyWorkers.length})</span>
            </h3>
            <span className="text-xs text-amber-400 font-medium">On Leave</span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
            {offDutyWorkers.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-xs italic">
                No workers are currently recorded on leave today.
              </div>
            ) : (
              offDutyWorkers.map((worker) => (
                <div
                  key={worker.id}
                  className="p-3.5 rounded-lg bg-[#0D0E12] border border-gray-800 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-medium text-gray-100">
                      {worker.name || worker.username}
                    </h4>
                    <span className="text-[11px] text-gray-500 font-mono">
                      @{worker.username}
                    </span>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      {worker.phone || 'No phone'}
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
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
