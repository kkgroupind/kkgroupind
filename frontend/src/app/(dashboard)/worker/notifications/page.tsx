'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Bell,
  HardHat,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  ChevronRight,
  Filter,
  CheckCheck,
} from 'lucide-react';
import { useWorker } from '@/context/worker-context';
import { WorkerShell } from '@/components/Worker';

export default function WorkerNotificationsPage() {
  const {
    jobs,
    isOnDuty,
    requestToggleDuty,
    openJobModal,
    assignedJobsCount,
  } = useWorker();

  const [filterType, setFilterType] = useState<'ALL' | 'NEW' | 'DUTY'>('ALL');

  const assignedJobs = useMemo(() => jobs.filter((j) => j.status === 'ASSIGNED'), [jobs]);
  const inProgressJobs = useMemo(() => jobs.filter((j) => j.status === 'IN_PROGRESS'), [jobs]);
  const completedJobs = useMemo(() => jobs.filter((j) => j.status === 'COMPLETED'), [jobs]);

  return (
    <WorkerShell activeTab="notifications">
      <div className="w-full space-y-6">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-[28px] sm:rounded-[36px] p-5 sm:p-7 shadow-[0_12px_35px_rgba(0,0,0,0.04)] border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#5E42B4] flex items-center justify-center font-bold">
              <Bell className="w-6 h-6 text-[#5E42B4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  അറിയിപ്പുകൾ / Notifications
                </h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-[#5E42B4] border border-purple-200">
                  {assignedJobsCount} New Dispatches
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Real-time operational alerts, newly dispatched customer orders, and field shift logs
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center bg-slate-100/90 p-1.5 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === 'ALL'
                  ? 'bg-[#5E42B4] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Notifications
            </button>
            <button
              type="button"
              onClick={() => setFilterType('NEW')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === 'NEW'
                  ? 'bg-[#5E42B4] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              New Dispatches ({assignedJobsCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('DUTY')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === 'DUTY'
                  ? 'bg-[#5E42B4] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Shift Status
            </button>
          </div>
        </div>

        {/* Notifications Body */}
        <div className="bg-white rounded-[28px] sm:rounded-[36px] p-5 sm:p-7 shadow-[0_12px_35px_rgba(0,0,0,0.04)] border border-slate-100 space-y-3.5">
          {/* Daily Duty Status Card */}
          {(filterType === 'ALL' || filterType === 'DUTY') && (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    isOnDuty
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : 'bg-amber-50 text-amber-600 border border-amber-200'
                  }`}
                >
                  <HardHat className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      {isOnDuty
                        ? 'ഫീൽഡ് ഡ്യൂട്ടി സജീവമാണ് / Attendance Active'
                        : 'ഡ്യൂട്ടി അവധിയാണ് / Off Duty Status'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700">
                      Daily Status
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 max-w-xl">
                    {isOnDuty
                      ? 'You are marked Available today. Office dispatch coordinators can allocate new customer orders to your queue.'
                      : 'You are marked Off Duty. No new work orders will be assigned until you toggle back on duty.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={requestToggleDuty}
                className="text-xs font-bold px-4 py-2 rounded-xl bg-white border border-slate-200 text-[#5E42B4] hover:bg-slate-50 transition-colors shadow-xs shrink-0 cursor-pointer"
              >
                Change Shift Status
              </button>
            </div>
          )}

          {/* New Assigned Work Orders */}
          {(filterType === 'ALL' || filterType === 'NEW') &&
            assignedJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => openJobModal(job)}
                className="p-4 sm:p-5 rounded-2xl bg-purple-50/40 hover:bg-purple-50/80 border border-purple-200/80 transition-all cursor-pointer shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-[#5E42B4] text-white flex items-center justify-center shrink-0">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-900 group-hover:text-[#5E42B4] transition-colors">
                        പുതിയ വർക്ക് ഓർഡർ / New Work Order Dispatched: {job.serviceName}
                      </span>
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#5E42B4] text-white">
                        {job.trackingNumber}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        Action Required
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Customer: <strong className="text-slate-800">{job.customerName}</strong> • Site:{' '}
                      <strong className="text-slate-800">{job.location || job.district || 'Kerala'}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:self-center shrink-0">
                  <span className="text-xs font-bold text-[#5E42B4] group-hover:underline flex items-center gap-1">
                    <span>Inspect Dispatch</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))}

          {/* In-Progress Work Notifications */}
          {filterType === 'ALL' &&
            inProgressJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => openJobModal(job)}
                className="p-4 sm:p-5 rounded-2xl bg-amber-50/40 hover:bg-amber-50/80 border border-amber-200/80 transition-all cursor-pointer shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-900 group-hover:text-amber-800 transition-colors">
                        Ongoing Work In Progress: {job.serviceName}
                      </span>
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        {job.trackingNumber}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Customer: {job.customerName} • Site: {job.location || job.district}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:self-center shrink-0">
                  <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                    <span>Active Now</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))}

          {/* Completed Work History Notifications */}
          {filterType === 'ALL' &&
            completedJobs.slice(0, 5).map((job) => (
              <div
                key={job.id}
                onClick={() => openJobModal(job)}
                className="p-4 sm:p-5 rounded-2xl bg-slate-50/60 hover:bg-slate-100/70 border border-slate-200/60 transition-all cursor-pointer shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-slate-800 group-hover:text-slate-950 transition-colors">
                        Work Order Completed: {job.serviceName}
                      </span>
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {job.trackingNumber}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Client: {job.customerName} • Verified and logged into service ledger
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:self-center shrink-0">
                  <span className="text-xs font-semibold text-slate-400">
                    {new Date(job.completedAt || job.updatedAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>
            ))}

          {jobs.length === 0 && (
            <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
              <Bell className="w-10 h-10 text-slate-300" />
              <span className="font-bold text-slate-600 text-sm">No Notifications Yet</span>
              <p className="max-w-xs">
                You are all caught up! New dispatch alerts and work order assignments will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </WorkerShell>
  );
}
