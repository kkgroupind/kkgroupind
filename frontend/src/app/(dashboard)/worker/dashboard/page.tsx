'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  Navigation,
  ExternalLink,
  ChevronRight,
  HardHat,
  Filter,
  Layers,
  ArrowRight,
  History,
} from 'lucide-react';
import { useWorker } from '@/context/worker-context';
import { WorkerShell, WorkerDutyCards } from '@/components/Worker';
import { ServiceEnquiry } from '@/services';

export default function WorkerDashboardPage() {
  const {
    jobs,
    loadingJobs,
    isOnDuty,
    requestToggleDuty,
    togglingDuty,
    openJobModal,
    updateJobStatus,
    actionLoadingId,
    activeJob,
    activeJobsCount,
    assignedJobsCount,
    completedJobsCount,
  } = useWorker();

  const [searchQuery, setSearchQuery] = useState('');
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'THIS_MONTH'>('ALL');

  // Format today's date in Malayalam & English
  const today = new Date();
  const dateFormattedEnglish = today.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const monthMalayalamMap: Record<number, string> = {
    0: 'ജനുവരി',
    1: 'ഫെബ്രുവരി',
    2: 'മാർച്ച്',
    3: 'ഏപ്രിൽ',
    4: 'മേയ്',
    5: 'ജൂൺ',
    6: 'ജൂലൈ',
    7: 'ഓഗസ്റ്റ്',
    8: 'സെപ്റ്റംബർ',
    9: 'ഒക്ടോബർ',
    10: 'നവംബർ',
    11: 'ഡിസംബർ',
  };

  const dayMalayalamMap: Record<number, string> = {
    0: 'ഞായർ',
    1: 'തിങ്കൾ',
    2: 'ചൊവ്വ',
    3: 'ബുധൻ',
    4: 'വ്യാഴം',
    5: 'വെള്ളി',
    6: 'ശനി',
  };

  const dateFormattedMalayalam = `${dayMalayalamMap[today.getDay()]}, ${today.getDate()} ${
    monthMalayalamMap[today.getMonth()]
  } ${today.getFullYear()}`;

  // Filter previous completed works
  const previousWorks = useMemo(() => {
    let list = jobs.filter((j) => j.status === 'COMPLETED');

    if (historyFilter === 'THIS_MONTH') {
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      list = list.filter((j) => {
        const d = new Date(j.completedAt || j.updatedAt || j.createdAt);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (j) =>
          j.serviceName.toLowerCase().includes(q) ||
          j.trackingNumber.toLowerCase().includes(q) ||
          j.customerName.toLowerCase().includes(q) ||
          (j.location && j.location.toLowerCase().includes(q))
      );
    }

    // Sort newest completed first
    return list.sort((a, b) => {
      const dateA = new Date(a.completedAt || a.updatedAt || a.createdAt).getTime();
      const dateB = new Date(b.completedAt || b.updatedAt || b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [jobs, historyFilter, searchQuery, today]);

  // Active / Ongoing Job
  const ongoingJob = jobs.find((j) => j.status === 'IN_PROGRESS');
  const newlyAssignedJob = jobs.find((j) => j.status === 'ASSIGNED');
  const currentWork = ongoingJob || newlyAssignedJob;

  return (
    <WorkerShell
      activeTab="home"
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    >
      {/* ========================================================
          1. TOP ROW: DATE & SHIFT HEADER + DUTY CARDS
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column: Today's Date, Duty Overview & Active Work */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-5">
          {/* Date & Shift Status Hero Banner */}
          <div className="bg-gradient-to-br from-[#5E42B4] via-[#5237A0] to-[#3B227A] rounded-[28px] sm:rounded-[36px] p-6 sm:p-7 text-white shadow-[0_15px_40px_rgba(94,66,180,0.25)] relative overflow-hidden flex flex-col justify-between gap-5 border border-white/15">
            {/* Subtle background aesthetics */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-[#FF5E88]/15 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-200">
                    ഇന്നത്തെ തീയതി • Today's Shift
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white">
                  {dateFormattedEnglish}
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-purple-200/90 mt-1">
                  {dateFormattedMalayalam}
                </p>
              </div>

              {/* Duty Toggle Pill */}
              <button
                type="button"
                onClick={requestToggleDuty}
                disabled={togglingDuty}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer border ${
                  isOnDuty
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-white border-emerald-400/40 shadow-emerald-950/20'
                    : 'bg-white/20 hover:bg-white/30 text-white border-white/20'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOnDuty ? 'bg-white animate-ping' : 'bg-slate-300'
                  }`}
                />
                <span>{isOnDuty ? 'ഫീൽഡ് ഡ്യൂട്ടി സജീവം (Available)' : 'അവധിയാണ് (Off Duty)'}</span>
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="relative z-10 grid grid-cols-3 gap-2.5 pt-4 border-t border-white/15">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                <span className="text-[11px] font-semibold text-purple-200 block">Active Work</span>
                <span className="text-lg sm:text-xl font-black text-white">{activeJobsCount}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                <span className="text-[11px] font-semibold text-purple-200 block">Assigned New</span>
                <span className="text-lg sm:text-xl font-black text-white">{assignedJobsCount}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                <span className="text-[11px] font-semibold text-purple-200 block">Completed</span>
                <span className="text-lg sm:text-xl font-black text-white">{completedJobsCount}</span>
              </div>
            </div>
          </div>

          {/* Today's Active / In-Progress Work Card */}
          <div className="bg-white rounded-[28px] sm:rounded-[36px] p-5 sm:p-6 shadow-[0_10px_35px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-purple-50 text-[#5E42B4] flex items-center justify-center font-bold">
                  <Briefcase className="w-5 h-5 text-[#5E42B4]" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                    ഇന്നത്തെ ജോലി / Today's Active Work
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Current work order requiring your operative field execution
                  </p>
                </div>
              </div>

              {currentWork && (
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    currentWork.status === 'IN_PROGRESS'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  {currentWork.status === 'IN_PROGRESS' ? 'In Progress' : 'Assigned (New)'}
                </span>
              )}
            </div>

            {currentWork ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex flex-col gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-slate-900">
                        {currentWork.serviceName}
                      </h3>
                      <span className="font-mono text-xs font-bold bg-purple-100 text-[#5E42B4] px-2.5 py-0.5 rounded-full">
                        {currentWork.trackingNumber}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Customer: <strong className="text-slate-800">{currentWork.customerName}</strong>
                    </p>
                  </div>

                  {currentWork.status === 'ASSIGNED' ? (
                    <button
                      type="button"
                      disabled={actionLoadingId === currentWork.id}
                      onClick={() => updateJobStatus(currentWork.id, 'IN_PROGRESS')}
                      className="px-4 py-2 rounded-xl bg-[#5E42B4] hover:bg-[#4E359B] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      {actionLoadingId === currentWork.id ? 'Starting...' : 'Start Job (ആരംഭിക്കുക)'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={actionLoadingId === currentWork.id}
                      onClick={() => updateJobStatus(currentWork.id, 'COMPLETED')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      {actionLoadingId === currentWork.id ? 'Completing...' : 'Mark Completed (പൂർത്തിയായി)'}
                    </button>
                  )}
                </div>

                {/* Details Pills: Phone, Location, Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200/60">
                    <Phone className="w-4 h-4 text-[#5E42B4] shrink-0" />
                    <span className="truncate">
                      Phone:{' '}
                      <a
                        href={`tel:${currentWork.customerPhone}`}
                        className="font-bold text-[#5E42B4] hover:underline"
                      >
                        {currentWork.customerPhone}
                      </a>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200/60">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">
                      Site:{' '}
                      <strong className="text-slate-800">
                        {currentWork.location || `${currentWork.city || ''}, ${currentWork.district || 'Kerala'}`}
                      </strong>
                    </span>
                    {currentWork.mapUrl && (
                      <a
                        href={currentWork.mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-auto text-emerald-600 hover:text-emerald-700"
                        title="Open in Google Maps"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                  <span className="text-xs text-slate-500 font-medium">
                    {currentWork.locationRemarks || 'Equipment & site guidelines configured by dispatch.'}
                  </span>
                  <button
                    type="button"
                    onClick={() => openJobModal(currentWork)}
                    className="text-xs font-bold text-[#5E42B4] hover:text-[#452D8A] flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Full Details</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 px-4 text-center rounded-2xl bg-slate-50/70 border border-slate-200/60 flex flex-col items-center justify-center gap-2.5">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  നിലവിൽ ആക്റ്റീവ് വർക്കുകൾ ഇല്ല / Standby Mode
                </h3>
                <p className="text-xs text-slate-500 max-w-md">
                  You currently have no active jobs in progress. When the office dispatch desk allocates a new customer order to you, it will appear here instantly.
                </p>
                <Link
                  href="/worker/jobs"
                  className="mt-2 text-xs font-bold px-4 py-2 rounded-xl bg-white border border-slate-200 text-[#5E42B4] hover:bg-slate-50 transition-colors shadow-xs"
                >
                  View All Assigned Jobs ({jobs.length})
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Daily Field Duty Cards */}
        <div className="lg:col-span-5 xl:col-span-4 flex">
          <WorkerDutyCards
            isOnDuty={isOnDuty}
            onToggleDuty={requestToggleDuty}
            isTogglingDuty={togglingDuty}
            activeJobTitle={currentWork ? currentWork.serviceName : 'Standby / Ready'}
            totalTimeWorked={`${completedJobsCount} Completed`}
            currentMonth={today.toLocaleString('en-US', { month: 'long' })}
            onViewActiveJob={() => {
              if (currentWork) {
                openJobModal(currentWork);
              }
            }}
          />
        </div>
      </div>

      {/* ========================================================
          2. PREVIOUS WORK HISTORY SECTION
          "needs to see the previous work and all like that only"
      ======================================================== */}
      <div className="w-full bg-white rounded-[28px] sm:rounded-[36px] p-5 sm:p-7 shadow-[0_12px_35px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <History className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                മുൻകാല ജോലികൾ / Work History & Previous Works
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Complete record of your past completed work orders, dispatches, and dates
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setHistoryFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                historyFilter === 'ALL'
                  ? 'bg-[#5E42B4] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              All Time ({jobs.filter((j) => j.status === 'COMPLETED').length})
            </button>
            <button
              type="button"
              onClick={() => setHistoryFilter('THIS_MONTH')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                historyFilter === 'THIS_MONTH'
                  ? 'bg-[#5E42B4] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              This Month
            </button>
            <Link
              href="/worker/jobs"
              className="text-xs font-bold text-[#5E42B4] hover:underline flex items-center gap-1 ml-2"
            >
              <span>Jobs Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Previous Works List */}
        {loadingJobs ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Loading previous works record...
          </div>
        ) : previousWorks.length > 0 ? (
          <div className="space-y-3">
            {previousWorks.map((job) => {
              const completedDate = new Date(job.completedAt || job.updatedAt || job.createdAt);
              const formattedDate = completedDate.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div
                  key={job.id}
                  onClick={() => openJobModal(job)}
                  className="p-4 sm:p-5 rounded-2xl bg-white hover:bg-slate-50/80 border border-slate-200/70 hover:border-purple-300 transition-all cursor-pointer shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-[#5E42B4] transition-colors truncate">
                          {job.serviceName}
                        </span>
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {job.trackingNumber}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Completed (പൂർത്തിയായി)
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 mt-1">
                        <span>
                          Customer: <strong className="text-slate-700">{job.customerName}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Location: <strong className="text-slate-700">{job.location || job.district || 'Kerala'}</strong>
                        </span>
                        {job.workDurationMinutes && (
                          <>
                            <span>•</span>
                            <span>Duration: {job.workDurationMinutes} mins</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Date & Action */}
                  <div className="flex items-center gap-3 sm:self-center shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formattedDate}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openJobModal(job);
                      }}
                      className="text-xs font-bold text-[#5E42B4] hover:text-[#452D8A] bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl transition-colors"
                    >
                      Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center rounded-2xl bg-slate-50/60 border border-slate-100 flex flex-col items-center justify-center gap-2 text-slate-400">
            <CheckCircle2 className="w-10 h-10 text-slate-300 mb-1" />
            <p className="text-sm font-bold text-slate-700">മുൻകാല ജോലികൾ ഒന്നും രേഖപ്പെടുത്തിയിട്ടില്ല</p>
            <p className="text-xs max-w-sm">
              No completed previous works found. Once you complete assigned field work orders, your entire verified job ledger and history will be listed here.
            </p>
          </div>
        )}
      </div>
    </WorkerShell>
  );
}
