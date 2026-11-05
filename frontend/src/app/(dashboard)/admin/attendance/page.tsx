'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { useAdminTheme } from '@/context/admin-theme-context';
import { useRouter } from 'next/navigation';
import {
  CalendarCheck,
  Search,
  RefreshCw,
  Clock,
  UserCheck,
  HardHat,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Coffee,
  LayoutGrid,
  List,
  Phone,
} from 'lucide-react';
import { AttendanceService, AttendanceOverviewResponse } from '@/services';
import { AdminDropdown, AdminDropdownOption } from '@/components/Admin/admin-dropdown';

const ATTENDANCE_ROLE_OPTIONS: AdminDropdownOption[] = [
  { value: 'ALL', label: 'All Personnel' },
  {
    value: 'OFFICE_STAFF',
    label: 'Office Staff',
    badge: 'HQ',
    badgeColor: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  },
  {
    value: 'WORKER',
    label: 'Field Workers',
    badge: 'Field',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  },
];

export default function AdminAttendancePage() {
  const { token, user, isLoading: authLoading } = useAuth();
  const { isDark } = useAdminTheme();
  const router = useRouter();

  const [data, setData] = useState<AttendanceOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'OFFICE_STAFF' | 'WORKER'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const loadAttendance = useCallback(
    async (showRefresh = false) => {
      if (!token) return;
      if (showRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      try {
        const res = await AttendanceService.getOverview(token);
        setData(res);
      } catch (err) {
        console.error('Failed to load attendance overview', err);
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
        loadAttendance();
      }
    }
  }, [authLoading, token, user, router, loadAttendance]);

  const allPersonnel = useMemo(() => {
    if (!data) return [];
    const staffList = (data.officeStaff || []).map((s) => ({
      ...s,
      type: 'OFFICE_STAFF' as const,
      displayStatus: s.isAvailable ? 'AVAILABLE' : 'OFF_DUTY',
    }));
    const workerList = (data.workers || []).map((w) => ({
      ...w,
      type: 'WORKER' as const,
      displayStatus: w.workerStatus,
    }));
    return [...staffList, ...workerList];
  }, [data]);

  const filteredPersonnel = useMemo(() => {
    return allPersonnel.filter((p) => {
      const matchRole = roleFilter === 'ALL' || p.type === roleFilter;
      const matchSearch =
        searchTerm === '' ||
        (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.username && p.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.phone && p.phone.includes(searchTerm));
      return matchRole && matchSearch;
    });
  }, [allPersonnel, roleFilter, searchTerm]);

  return (
    <div className={`space-y-6 max-w-[1400px] mx-auto pb-10 ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className={`text-2xl sm:text-3xl font-extrabold flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <div
                className={`p-2.5 rounded-2xl border flex items-center justify-center ${
                  isDark ? 'bg-[#12141A] border-white/[0.08] text-[#6366F1]' : 'bg-white border-slate-200 text-[#6366F1] shadow-xs'
                }`}
              >
                <CalendarCheck className="w-5 h-5" />
              </div>
              <span>Daily Attendance</span>
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hidden sm:inline">
              Live Presence
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            See who is on duty, working on site, or on leave today across all teams
          </p>
        </div>

        <button
          onClick={() => loadAttendance(true)}
          disabled={isRefreshing || isLoading}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border transition-all disabled:opacity-50 cursor-pointer ${
            isDark
              ? 'bg-[#12141A] hover:bg-[#181B24] border-white/[0.08] text-gray-300 hover:text-white'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-xs'
          }`}
        >
          <RefreshCw
            className={`w-4 h-4 text-[#6366F1] ${isRefreshing ? 'animate-spin' : ''}`}
          />
          <span>{isRefreshing ? 'Refreshing...' : 'Reload Attendance'}</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
          className={`p-4 sm:p-5 rounded-[26px] border transition-all flex flex-col justify-between ${
            isDark ? 'bg-[#12141A] border-white/[0.06]' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
            Office Staff Present
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-2">
            {data?.counts?.officeStaff?.available ?? 0}
            <span className={`text-xs font-normal ml-1.5 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
              / {data?.counts?.officeStaff?.total ?? 0}
            </span>
          </div>
          <span className="text-[11px] text-emerald-400 mt-1.5">Active on desk</span>
        </div>

        <div
          className={`p-4 sm:p-5 rounded-[26px] border transition-all flex flex-col justify-between ${
            isDark ? 'bg-[#12141A] border-white/[0.06]' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
            Workers Available
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-2">
            {data?.counts?.workers?.available ?? 0}
            <span className={`text-xs font-normal ml-1.5 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
              / {data?.counts?.workers?.total ?? 0}
            </span>
          </div>
          <span className="text-[11px] text-emerald-400 mt-1.5">Ready for dispatch</span>
        </div>

        <div
          className={`p-4 sm:p-5 rounded-[26px] border transition-all flex flex-col justify-between ${
            isDark ? 'bg-[#12141A] border-white/[0.06]' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
            Workers on Field
          </span>
          <div className="text-xl sm:text-2xl font-black text-[#6366F1] mt-2">
            {data?.counts?.workers?.busy ?? 0}
          </div>
          <span className="text-[11px] text-[#6366F1] mt-1.5">Executing tasks</span>
        </div>

        <div
          className={`p-4 sm:p-5 rounded-[26px] border transition-all flex flex-col justify-between ${
            isDark ? 'bg-[#12141A] border-white/[0.06]' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
            Away / Off Duty
          </span>
          <div className="text-xl sm:text-2xl font-black text-amber-400 mt-2">
            {(data?.counts?.officeStaff?.offDuty ?? 0) + (data?.counts?.workers?.offDuty ?? 0)}
          </div>
          <span className="text-[11px] text-amber-400 mt-1.5">On leave / inactive</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className={`p-4 sm:p-5 rounded-[28px] border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 ${
          isDark ? 'bg-[#12141A] border-white/[0.06]' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="relative flex-1 max-w-md">
          <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search personnel name, username, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-full text-xs sm:text-sm border transition-colors outline-none ${
              isDark
                ? 'bg-[#121318] border-white/[0.06] text-white placeholder-zinc-500 focus:border-[#FF5C38]/50'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#FF5C38]/50'
            }`}
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          <div className="w-48">
            <AdminDropdown
              options={ATTENDANCE_ROLE_OPTIONS}
              value={roleFilter}
              onChange={(val) => setRoleFilter(val as any)}
              variant="coral"
              size="md"
            />
          </div>

          {/* View Mode Toggle */}
          <div className={`flex items-center p-1 rounded-full border ${isDark ? 'bg-[#121318] border-white/[0.06]' : 'bg-slate-100 border-slate-200'}`}>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#FF5C38] text-white shadow-sm'
                  : isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#FF5C38] text-white shadow-sm'
                  : isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Attendance Content: Cards or Table */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className={`col-span-full py-16 text-center ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#FF5C38]" />
              <span>Loading attendance roster...</span>
            </div>
          ) : filteredPersonnel.length === 0 ? (
            <div className={`col-span-full py-16 text-center ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
              No personnel found matching your filter criteria.
            </div>
          ) : (
            filteredPersonnel.map((person) => {
              const checkIn = person.todayAttendance?.checkInAt;
              const notes = person.todayAttendance?.notes;

              return (
                <div
                  key={person.id}
                  className={`p-5 rounded-3xl border transition-all ${
                    isDark ? 'bg-[#12141A] border-white/[0.06]' : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-sm ${
                        isDark ? 'bg-[#121318] border-white/[0.06] text-white' : 'bg-slate-100 border-slate-200 text-slate-800'
                      }`}>
                        {(person.name?.charAt(0) || person.username?.charAt(0) || 'P').toUpperCase()}
                      </div>
                      <div>
                        <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {person.name || person.username || 'Personnel'}
                        </h3>
                        <p className={`text-xs font-mono ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                          @{person.username || 'user'}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        person.displayStatus === 'AVAILABLE'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : person.displayStatus === 'BUSY'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {person.displayStatus}
                    </span>
                  </div>

                  <div className={`mt-4 pt-3 border-t text-xs space-y-1.5 ${isDark ? 'border-white/[0.06] text-zinc-400' : 'border-slate-100 text-slate-600'}`}>
                    <div className="flex items-center justify-between">
                      <span>Role:</span>
                      <span className={`font-semibold ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                        {person.type === 'OFFICE_STAFF' ? 'Office Staff' : 'Field Worker'}
                      </span>
                    </div>
                    {person.phone && (
                      <div className="flex items-center justify-between">
                        <span>Phone:</span>
                        <span className="font-mono">{person.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span>Check-in:</span>
                      <span className={checkIn ? 'text-emerald-400 font-mono' : isDark ? 'text-zinc-500' : 'text-slate-400'}>
                        {checkIn ? new Date(checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Not Checked In'}
                      </span>
                    </div>
                    {notes && (
                      <div className={`mt-2 p-2 rounded-xl text-[11px] italic border ${isDark ? 'bg-[#121318] border-white/[0.06] text-zinc-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                        "{notes}"
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Table View */
        <div
          className={`rounded-3xl border overflow-hidden ${
            isDark ? 'bg-[#12141A] border-white/[0.06]' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`border-b ${isDark ? 'border-white/[0.06] bg-[#121318] text-zinc-400' : 'border-slate-100 bg-slate-50 text-slate-500'}`}>
                <tr>
                  <th className="py-3 px-4 font-semibold">Personnel</th>
                  <th className="py-3 px-4 font-semibold">Role</th>
                  <th className="py-3 px-4 font-semibold">Contact</th>
                  <th className="py-3 px-4 font-semibold">Check-In Time</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-white/[0.04]' : 'divide-slate-100'}`}>
                {filteredPersonnel.map((person) => {
                  const checkIn = person.todayAttendance?.checkInAt;
                  return (
                    <tr key={person.id} className={isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}>
                      <td className="py-3 px-4">
                        <div className="font-bold text-sm text-slate-900 dark:text-white">
                          {person.name || person.username || 'Personnel'}
                        </div>
                        <div className="text-[11px] text-zinc-500 font-mono">@{person.username || 'user'}</div>
                      </td>
                      <td className="py-3 px-4">
                        {person.type === 'OFFICE_STAFF' ? 'Office Staff' : 'Field Worker'}
                      </td>
                      <td className="py-3 px-4 font-mono">{person.phone || '—'}</td>
                      <td className="py-3 px-4 font-mono">
                        {checkIn ? new Date(checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            person.displayStatus === 'AVAILABLE'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : person.displayStatus === 'BUSY'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {person.displayStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
