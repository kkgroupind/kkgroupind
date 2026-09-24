'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
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
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10 text-gray-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
            <div className="p-2 bg-[#1A1C23] border border-gray-800 rounded-xl">
              <Activity className="w-6 h-6 text-[#7B4DFF]" />
            </div>
            Live Workforce Availability
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Real-time operational readiness radar of field technicians and workforce capacity
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
          <span>{isRefreshing ? 'Refreshing...' : 'Reload Availability'}</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#14151A] border border-gray-800">
          <span className="text-xs text-gray-500 font-medium">Ready for Dispatch</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{counts.available}</div>
          <span className="text-xs text-emerald-500/80 mt-1 block">Technicians currently available</span>
        </div>

        <div className="p-4 rounded-xl bg-[#14151A] border border-gray-800">
          <span className="text-xs text-gray-500 font-medium">Active on Job</span>
          <div className="text-2xl font-bold text-blue-400 mt-1">{counts.busy}</div>
          <span className="text-xs text-blue-400/80 mt-1 block">Engaged on-site</span>
        </div>

        <div className="p-4 rounded-xl bg-[#14151A] border border-gray-800">
          <span className="text-xs text-gray-500 font-medium">Off Duty / Away</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">{counts.offDuty}</div>
          <span className="text-xs text-amber-500/80 mt-1 block">Unavailable today</span>
        </div>

        <div className="p-4 rounded-xl bg-[#14151A] border border-gray-800">
          <span className="text-xs text-gray-500 font-medium">Total Registered Force</span>
          <div className="text-2xl font-bold text-gray-100 mt-1">{counts.total}</div>
          <span className="text-xs text-gray-500 mt-1 block">Registered technicians</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-[#14151A] border border-gray-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search worker name, username, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0D0E12] border border-gray-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-gray-700"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(['ALL', 'AVAILABLE', 'BUSY', 'OFF_DUTY'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-[#1A1C23] text-white border border-gray-700'
                  : 'bg-[#0D0E12] text-gray-400 hover:text-white border border-gray-800'
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
              className={`p-4 rounded-xl border transition-colors flex flex-col justify-between gap-3 ${
                isAvail
                  ? 'bg-[#14151A] border-emerald-500/30'
                  : isBusy
                  ? 'bg-[#14151A] border-blue-500/30'
                  : 'bg-[#14151A] border-gray-800 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isAvail
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : isBusy
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {w.name ? w.name.charAt(0).toUpperCase() : 'W'}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-100">
                      {w.name || w.username}
                    </h3>
                    <span className="text-[11px] text-gray-500 font-mono">
                      @{w.username}
                    </span>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium ${
                    isAvail
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : isBusy
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isAvail ? 'bg-emerald-500' : isBusy ? 'bg-blue-500' : 'bg-amber-500'
                    }`}
                  />
                  {w.workerStatus}
                </span>
              </div>

              <div className="pt-2 border-t border-gray-800/80 space-y-1.5 text-xs text-gray-400">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Mobile:</span>
                  <span className="text-gray-300">{w.phone || 'No phone'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Completed Assignments:</span>
                  <span className="text-gray-200 font-medium">
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
