'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import {
  ClipboardCheck,
  Search,
  RefreshCw,
  HardHat,
  FolderKanban,
  MapPin,
  Calendar,
  Send,
  Phone,
  UserCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  Briefcase,
  User,
  LayoutGrid,
  List,
  Sparkles,
} from 'lucide-react';
import { EnquiryService, ServiceEnquiry, WorkerWithAvailability } from '@/services';
import { AssignWorkerModal } from '@/components/OfficeStaff/AssignWorkerModal';
import { useAdminTheme } from '@/context/admin-theme-context';

export default function AdminAssignmentsPage() {
  const { token, user, isLoading: authLoading } = useAuth();
  const { isDark } = useAdminTheme();
  const router = useRouter();

  const [enquiries, setEnquiries] = useState<ServiceEnquiry[]>([]);
  const [workers, setWorkers] = useState<WorkerWithAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeLedgerView, setActiveLedgerView] = useState<'grid' | 'table'>('grid');

  // Modals
  const [selectedEnquiry, setSelectedEnquiry] = useState<ServiceEnquiry | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const loadData = useCallback(
    async (showRefreshIndicator = false) => {
      if (!token) return;
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      try {
        const [enqRes, workersRes] = await Promise.allSettled([
          EnquiryService.getAllEnquiries({}, token),
          EnquiryService.getActiveWorkers(token),
        ]);
        if (enqRes.status === 'fulfilled') {
          setEnquiries(enqRes.value.enquiries || []);
        }
        if (workersRes.status === 'fulfilled') {
          setWorkers(workersRes.value.workers || []);
        }
      } catch (err) {
        console.error('Failed to load assignments data', err);
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

  const pendingEnquiries = useMemo(
    () => enquiries.filter((e) => e.status === 'PENDING'),
    [enquiries],
  );

  const assignedEnquiries = useMemo(
    () => enquiries.filter((e) => e.workerId !== null),
    [enquiries],
  );

  const availableWorkers = useMemo(
    () => workers.filter((w) => w.workerStatus === 'AVAILABLE'),
    [workers],
  );

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
              <ClipboardCheck className="w-5 h-5" />
            </div>
            Assign Workers to Jobs
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Assign available workers to waiting customer jobs and track who is currently working on site
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/admin/operations/work-orders"
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
              isDark
                ? 'bg-[#12141A] hover:bg-[#161922] border-white/[0.08] text-zinc-300 hover:text-white'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-xs'
            }`}
          >
            <FolderKanban className="w-4 h-4 text-[#6366F1]" />
            <span>All Work Orders</span>
          </Link>

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
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh List'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row: 3 simple cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className={`group p-4 sm:p-5 rounded-[24px] border transition-all duration-300 relative overflow-hidden ${
          isDark ? 'bg-[#12141A] border-white/[0.06]' : 'bg-white border-slate-200/80 shadow-xs'
        }`}>
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
          <span className="text-[10px] sm:text-[11px] text-amber-400 font-semibold uppercase tracking-wider block">
            Jobs Waiting for Workers
          </span>
          <div className="text-xl sm:text-2xl font-bold text-amber-400 mt-1">{pendingEnquiries.length}</div>
          <span className={`text-[11px] mt-1 hidden sm:block ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
            Needs a worker assigned
          </span>
        </div>

        <div className={`group p-4 sm:p-5 rounded-[24px] border transition-all duration-300 relative overflow-hidden ${
          isDark ? 'bg-[#12141A] border-white/[0.06]' : 'bg-white border-slate-200/80 shadow-xs'
        }`}>
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
          <span className="text-[10px] sm:text-[11px] text-emerald-400 font-semibold uppercase tracking-wider block">
            Workers Ready to Work
          </span>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1">{availableWorkers.length}</div>
          <span className={`text-[11px] mt-1 hidden sm:block ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
            Ready for new jobs
          </span>
        </div>

        <div className={`group p-4 sm:p-5 rounded-[24px] border transition-all duration-300 relative overflow-hidden ${
          isDark ? 'bg-[#12141A] border-white/[0.06]' : 'bg-white border-slate-200/80 shadow-xs'
        }`}>
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#6366F1]/40 to-transparent" />
          <span className="text-[10px] sm:text-[11px] text-[#A78BFA] font-semibold uppercase tracking-wider block">
            Jobs In Progress
          </span>
          <div className="text-xl sm:text-2xl font-bold text-[#A78BFA] mt-1">{assignedEnquiries.length}</div>
          <span className={`text-[11px] mt-1 hidden sm:block ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
            Workers on field right now
          </span>
        </div>
      </div>

      {/* Two Column Layout: Waiting Jobs vs Available Workers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Waiting Jobs */}
        <div className={`rounded-[28px] border p-5 space-y-4 relative overflow-hidden ${
          isDark ? 'bg-[#12141A] border-white/[0.06]' : 'bg-white border-slate-200/80 shadow-xs'
        }`}>
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
          <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
            <h3 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <FolderKanban className="w-4 h-4 text-amber-400" />
              <span>Jobs Waiting for Workers</span>
            </h3>
            <span className="text-xs text-amber-400 font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              {pendingEnquiries.length} waiting
            </span>
          </div>

          <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1 custom-scrollbar">
            {pendingEnquiries.length === 0 ? (
              <div className={`p-12 text-center text-xs italic ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                Great job! All jobs have a worker assigned.
              </div>
            ) : (
              pendingEnquiries.map((enq) => (
                <div
                  key={enq.id}
                  className={`group p-4 rounded-[20px] border transition-all space-y-2.5 relative overflow-hidden ${
                    isDark
                      ? 'bg-[#161922] border-white/[0.06] hover:border-white/[0.14]'
                      : 'bg-slate-50 border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-semibold text-amber-400">
                        {enq.trackingNumber}
                      </span>
                      <h4 className={`text-sm font-bold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {enq.serviceName}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEnquiry(enq);
                        setIsAssignModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#6366F1] hover:bg-[#5254E0] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Assign Worker</span>
                    </button>
                  </div>

                  {enq.wageType && (
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        isDark ? 'bg-[#12141A] text-zinc-300 border-white/[0.06]' : 'bg-white text-slate-700 border-slate-200'
                      }`}>
                        {enq.wageType === 'PER_TREE'
                          ? '🌴 Per Tree'
                          : enq.wageType === 'HOURLY'
                          ? '⏱️ Hourly'
                          : `${enq.unitLabel || 'Unit'} Basis`}
                      </span>
                      {enq.unitRate && (
                        <span className={`text-[10px] font-mono ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                          ₹{enq.unitRate} / {enq.unitLabel || 'Unit'}
                        </span>
                      )}
                    </div>
                  )}

                  <div className={`text-xs flex items-center gap-2 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                    <User className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
                    <span className={`font-medium ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>{enq.customerName}</span>
                    <span className="font-mono text-[11px] opacity-75">({enq.customerPhone})</span>
                  </div>

                  {enq.location && (
                    <div className={`text-[11px] flex items-center gap-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      <MapPin className="w-3.5 h-3.5 text-[#6366F1] shrink-0" />
                      <span>{enq.location}</span>
                    </div>
                  )}

                  {enq.message && (
                    <p className={`text-[11px] italic p-2.5 rounded-xl border ${
                      isDark ? 'bg-[#12141A] text-zinc-300 border-white/[0.06]' : 'bg-white text-slate-700 border-slate-200/80'
                    }`}>
                      &ldquo;{enq.message}&rdquo;
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Available Workers */}
        <div className={`rounded-[28px] border p-5 space-y-4 relative overflow-hidden ${
          isDark ? 'bg-[#12141A] border-white/[0.06]' : 'bg-white border-slate-200/80 shadow-xs'
        }`}>
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
          <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
            <h3 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <HardHat className="w-4 h-4 text-emerald-400" />
              <span>Available Workers</span>
            </h3>
            <span className="text-xs text-emerald-400 font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              {availableWorkers.length} ready
            </span>
          </div>

          <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1 custom-scrollbar">
            {availableWorkers.length === 0 ? (
              <div className={`p-12 text-center text-xs italic ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                No workers currently available.
              </div>
            ) : (
              availableWorkers.map((worker) => (
                <div
                  key={worker.id}
                  className={`group p-4 rounded-[20px] border transition-all flex items-center justify-between relative overflow-hidden ${
                    isDark
                      ? 'bg-[#161922] border-white/[0.06] hover:border-white/[0.14]'
                      : 'bg-slate-50 border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-[20px] bg-gradient-to-br from-emerald-500 to-teal-600 p-[2px] shadow-sm">
                        <div className={`w-full h-full rounded-[18px] flex items-center justify-center font-bold text-xs overflow-hidden ${
                          isDark ? 'bg-[#12141A] text-white' : 'bg-white text-slate-900'
                        }`}>
                          {worker.avatar ? (
                            <img
                              src={worker.avatar}
                              alt={worker.name || worker.username || 'Worker avatar'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <span>{worker.name ? worker.name.charAt(0).toUpperCase() : 'W'}</span>
                          )}
                        </div>
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 ${
                        isDark ? 'border-[#161922]' : 'border-white'
                      } bg-emerald-500`} />
                    </div>

                    <div>
                      <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {worker.name || worker.username}
                      </h4>
                      <div className={`text-[11px] flex items-center gap-2 mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                        <Phone className="w-3 h-3 opacity-70" />
                        <span className="font-mono">{worker.phone || 'No phone'}</span>
                      </div>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Ready
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Active Jobs Section (with Grid / Table view toggle) */}
      <div className={`rounded-[28px] border p-5 space-y-4 ${
        isDark ? 'bg-[#12141A] border-white/[0.06]' : 'bg-white border-slate-200/80 shadow-xs'
      }`}>
        <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
          <div>
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Active Jobs ({assignedEnquiries.length})
            </h3>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Jobs currently assigned to workers and active on site
            </p>
          </div>

          <div className={`flex items-center border rounded-full p-1 ${
            isDark ? 'bg-[#161922] border-white/[0.06]' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => setActiveLedgerView('grid')}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                activeLedgerView === 'grid'
                  ? 'bg-[#6366F1] text-white shadow-sm'
                  : isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setActiveLedgerView('table')}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                activeLedgerView === 'table'
                  ? 'bg-[#6366F1] text-white shadow-sm'
                  : isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {assignedEnquiries.length === 0 ? (
          <div className={`p-12 text-center text-xs italic ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
            No jobs currently assigned.
          </div>
        ) : activeLedgerView === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedEnquiries.map((item) => (
              <div
                key={item.id}
                className={`group rounded-[24px] border p-4 transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                  isDark
                    ? 'bg-[#161922] border-white/[0.06] hover:border-white/[0.14]'
                    : 'bg-slate-50 border-slate-200/80 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="font-mono text-xs font-semibold text-[#6366F1]">
                        {item.trackingNumber}
                      </span>
                      <h4 className={`text-sm font-bold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {item.serviceName}
                      </h4>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                        item.status === 'COMPLETED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : item.status === 'IN_PROGRESS'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                      }`}
                    >
                      {item.status === 'IN_PROGRESS' ? 'Working Now' : item.status === 'COMPLETED' ? 'Completed' : 'Assigned'}
                    </span>
                  </div>

                  <div className={`space-y-2 py-2.5 border-y my-2.5 text-xs ${
                    isDark ? 'border-white/[0.06]' : 'border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`flex items-center gap-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                        <User className="w-3.5 h-3.5" />
                        <span>Customer</span>
                      </span>
                      <span className={`font-medium truncate max-w-[150px] ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                        {item.customerName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`flex items-center gap-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                        <HardHat className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Worker</span>
                      </span>
                      <span className="text-emerald-400 font-medium truncate max-w-[150px]">
                        {item.worker?.name || item.worker?.username || 'Assigned'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`flex items-center gap-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Assigned Date</span>
                      </span>
                      <span className={isDark ? 'text-zinc-300' : 'text-slate-700'}>
                        {item.assignedAt ? new Date(item.assignedAt).toLocaleDateString() : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  {item.status === 'COMPLETED' ? (
                    <div className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Job Completed</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEnquiry(item);
                        setIsAssignModalOpen(true);
                      }}
                      className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                        isDark
                          ? 'bg-[#12141A] hover:bg-[#1f222d] text-zinc-300 hover:text-white border-white/[0.06]'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span>Reassign Worker</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={`w-full text-left text-xs ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
              <thead className={`font-semibold border-b ${
                isDark ? 'bg-[#0D0E12] text-zinc-400 border-white/[0.06]' : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                <tr>
                  <th className="py-3 px-4">Tracking Code</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Assigned Worker</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-white/[0.04]' : 'divide-slate-200'}`}>
                {assignedEnquiries.map((item) => (
                  <tr key={item.id} className={`transition-colors ${isDark ? 'hover:bg-[#161922]/60' : 'hover:bg-slate-50'}`}>
                    <td className="py-3 px-4 font-mono font-semibold text-[#6366F1]">
                      {item.trackingNumber}
                    </td>
                    <td className={`py-3 px-4 font-medium ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                      {item.serviceName}
                    </td>
                    <td className="py-3 px-4">
                      <div className={`font-medium ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>{item.customerName}</div>
                      <div className={`text-[11px] font-mono ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>{item.customerPhone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                        <HardHat className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{item.worker?.name || item.worker?.username || 'Worker'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                          item.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : item.status === 'IN_PROGRESS'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                        }`}
                      >
                        {item.status === 'IN_PROGRESS' ? 'Working' : item.status === 'COMPLETED' ? 'Done' : 'Assigned'}
                      </span>
                    </td>
                    <td className={`py-3 px-4 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      {item.assignedAt ? new Date(item.assignedAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Modal */}
      {isAssignModalOpen && selectedEnquiry && (
        <AssignWorkerModal
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setSelectedEnquiry(null);
          }}
          onAssignedSuccess={() => {
            loadData();
          }}
          enquiry={selectedEnquiry}
          workers={workers}
          token={token || undefined}
        />
      )}
    </div>
  );
}
