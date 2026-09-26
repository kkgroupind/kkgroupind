'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import {
  CalendarCheck,
  Search,
  RefreshCw,
  Clock,
  UserCheck,
  HardHat,
  Briefcase,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Coffee,
} from 'lucide-react';
import { AttendanceService, AttendanceOverviewResponse } from '@/services';

export default function AdminAttendancePage() {
  const { token, user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<AttendanceOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'OFFICE_STAFF' | 'WORKER'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

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
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10 text-gray-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
            <div className="p-2 bg-[#1A1C23] border border-gray-800 rounded-xl">
              <CalendarCheck className="w-6 h-6 text-[#7B4DFF]" />
            </div>
            Daily Attendance Ledger
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Real-time daily presence tracking for office staff and field workforce
          </p>
        </div>

        <button
          onClick={() => loadAttendance(true)}
          disabled={isRefreshing || isLoading}
          className="flex items-center gap-2 bg-[#14151A] hover:bg-[#1A1C23] border border-gray-800 px-3.5 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-all disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 text-[#7B4DFF] ${isRefreshing ? 'animate-spin' : ''}`}
          />
          <span>{isRefreshing ? 'Refreshing...' : 'Reload Attendance'}</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#14151A] border border-gray-800">
          <span className="text-xs text-gray-500 font-medium">Office Staff Present</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {data?.counts?.officeStaff?.available ?? 0}
            <span className="text-xs text-gray-500 font-normal ml-1">
              / {data?.counts?.officeStaff?.total ?? 0} total
            </span>
          </div>
          <span className="text-xs text-emerald-500/80 mt-1 block">Active on desk</span>
        </div>

        <div className="p-4 rounded-xl bg-[#14151A] border border-gray-800">
          <span className="text-xs text-gray-500 font-medium">Workers Available</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {data?.counts?.workers?.available ?? 0}
            <span className="text-xs text-gray-500 font-normal ml-1">
              / {data?.counts?.workers?.total ?? 0} total
            </span>
          </div>
          <span className="text-xs text-emerald-500/80 mt-1 block">Ready for job dispatch</span>
        </div>

        <div className="p-4 rounded-xl bg-[#14151A] border border-gray-800">
          <span className="text-xs text-gray-500 font-medium">Workers on Field Job</span>
          <div className="text-2xl font-bold text-blue-400 mt-1">
            {data?.counts?.workers?.busy ?? 0}
          </div>
          <span className="text-xs text-blue-400/80 mt-1 block">Busy executing tasks</span>
        </div>

        <div className="p-4 rounded-xl bg-[#14151A] border border-gray-800">
          <span className="text-xs text-gray-500 font-medium">Personnel Away / Off Duty</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            {(data?.counts?.officeStaff?.offDuty ?? 0) + (data?.counts?.workers?.offDuty ?? 0)}
          </div>
          <span className="text-xs text-amber-500/80 mt-1 block">On leave or inactive</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-[#14151A] border border-gray-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search personnel name, username, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0D0E12] border border-gray-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-gray-700"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(['ALL', 'OFFICE_STAFF', 'WORKER'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                roleFilter === r
                  ? 'bg-[#1A1C23] text-white border border-gray-700'
                  : 'bg-[#0D0E12] text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              {r === 'ALL' ? 'All Roles' : r === 'OFFICE_STAFF' ? 'Office Staff' : 'Field Workers'}
            </button>
          ))}
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-[#14151A] rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-100">
            Today&#39;s Attendance Roster &bull; {data?.date || new Date().toISOString().split('T')[0]}
          </h3>
          <span className="text-xs text-gray-500">{filteredPersonnel.length} members</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#0D0E12] text-gray-400 font-medium border-b border-gray-800">
              <tr>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Daily Status</th>
                <th className="py-3 px-4">Check-in Time</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#7B4DFF]" />
                    <span>Loading attendance records...</span>
                  </td>
                </tr>
              ) : filteredPersonnel.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    No attendance records match your filter.
                  </td>
                </tr>
              ) : (
                filteredPersonnel.map((person) => {
                  const checkIn = person.todayAttendance?.checkInAt;
                  const notes = person.todayAttendance?.notes;

                  return (
                    <tr key={person.id} className="hover:bg-[#1A1C23]/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center font-bold text-xs text-[#7B4DFF] overflow-hidden shrink-0 border border-gray-700/60 shadow-sm">
                            {person.avatar ? (
                              <img
                                src={person.avatar}
                                alt={person.name || person.username || 'Avatar'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : null}
                            {!person.avatar && (
                              <span>
                                {(person.name || person.username || 'U').charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-100">
                              {person.name || person.username}
                            </div>
                            <div className="text-[11px] text-gray-500 font-mono">
                              @{person.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-gray-300">
                          {person.type === 'OFFICE_STAFF' ? (
                            <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                          ) : (
                            <HardHat className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                          <span>
                            {person.type === 'OFFICE_STAFF' ? 'Office Staff' : 'Field Worker'}
                          </span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400">{person.phone || '—'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium ${
                            person.displayStatus === 'AVAILABLE'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : person.displayStatus === 'BUSY'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              person.displayStatus === 'AVAILABLE'
                                ? 'bg-emerald-500'
                                : person.displayStatus === 'BUSY'
                                ? 'bg-blue-500'
                                : 'bg-amber-500'
                            }`}
                          />
                          {person.displayStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400">
                        {checkIn ? (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-500" />
                            <span>{new Date(checkIn).toLocaleTimeString()}</span>
                          </div>
                        ) : (
                          <span className="text-gray-600">Not logged</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-400 italic max-w-xs truncate">
                        {notes || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
