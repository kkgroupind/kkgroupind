'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Briefcase,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  Phone,
  ExternalLink,
  ChevronRight,
  HardHat,
  Calendar,
  Layers,
  Timer,
} from 'lucide-react';
import { useWorker } from '@/context/worker-context';
import { useWorkerLanguage } from '@/context/worker-language-context';
import { WorkerShell } from '@/components/Worker';
import { ServiceEnquiry } from '@/services';
import { getServiceBanner } from '@/utils/service-options';

export default function WorkerJobsPage() {
  const {
    jobs,
    loadingJobs,
    openJobModal,
    updateJobStatus,
    acceptJob,
    markReachedSite,
    actionLoadingId,
  } = useWorker();

  const { language, t, translateService } = useWorkerLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN_PROGRESS' | 'ASSIGNED' | 'COMPLETED'>('ALL');

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    let list = jobs;

    if (statusFilter !== 'ALL') {
      list = list.filter((j) => j.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (j) =>
          j.serviceName.toLowerCase().includes(q) ||
          j.trackingNumber.toLowerCase().includes(q) ||
          j.customerName.toLowerCase().includes(q) ||
          (j.location && j.location.toLowerCase().includes(q)) ||
          (j.city && j.city.toLowerCase().includes(q))
      );
    }

    return list;
  }, [jobs, statusFilter, searchQuery]);

  const counts = useMemo(
    () => ({
      all: jobs.length,
      inProgress: jobs.filter((j) => j.status === 'IN_PROGRESS').length,
      assigned: jobs.filter((j) => j.status === 'ASSIGNED').length,
      completed: jobs.filter((j) => j.status === 'COMPLETED').length,
    }),
    [jobs]
  );

  return (
    <WorkerShell
      activeTab="tasks"
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    >
      <div className="w-full space-y-6">
        {/* Page Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-[28px] sm:rounded-[36px] p-5 sm:p-7 shadow-[0_12px_35px_rgba(0,0,0,0.04)] border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#5E42B4] flex items-center justify-center font-bold">
              <Briefcase className="w-6 h-6 text-[#5E42B4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {t('workOrdersTitle')}
                </h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-[#5E42B4] border border-purple-200">
                  {jobs.length} Total
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {t('workOrdersSubtitle')}
              </p>
            </div>
          </div>

          {/* Filter Segmented Controls */}
          <div className="flex items-center bg-slate-100/90 p-1.5 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-[#5E42B4] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('allFilterCount')} ({counts.all})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('IN_PROGRESS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'IN_PROGRESS'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('activeFilterCount')} ({counts.inProgress})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('ASSIGNED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'ASSIGNED'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('assignedFilterCount')} ({counts.assigned})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('COMPLETED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'COMPLETED'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('completedFilterCount')} ({counts.completed})
            </button>
          </div>
        </div>

        {/* Jobs Cards Grid / List */}
        {loadingJobs ? (
          <div className="py-20 text-center text-xs text-slate-400">
            Loading work orders...
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {filteredJobs.map((job) => {
              const isAssigned = job.status === 'ASSIGNED';
              const isInProgress = job.status === 'IN_PROGRESS';
              const isCompleted = job.status === 'COMPLETED';

              return (
                <div
                  key={job.id}
                  className="bg-white rounded-[28px] p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-200/80 hover:border-purple-300 transition-all flex flex-col justify-between gap-4 group"
                >
                  {/* Top Header */}
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden shrink-0 border border-slate-200 shadow-xs bg-slate-100">
                          <Image
                            src={getServiceBanner(job.serviceName)}
                            alt={job.serviceName}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-[#5E42B4] border border-purple-200">
                              {job.trackingNumber}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isAssigned
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : isInProgress
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {isAssigned
                                ? t('assigned')
                                : isInProgress
                                ? t('inProgress')
                                : t('completedBadge')}
                            </span>
                          </div>
                          <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-[#5E42B4] transition-colors mt-1.5 truncate">
                            {translateService(job.serviceName)}
                          </h3>
                        </div>
                      </div>
                    </div>

                    {(() => {
                      const sName = (job.serviceName || '').toLowerCase();
                      const isMachinery = sName.includes('jcb') || sName.includes('excavat') || sName.includes('loader') || sName.includes('crane');
                      const wageType = job.wageType && (job.wageType !== 'HOURLY' || isMachinery)
                        ? job.wageType
                        : sName.includes('cococare') || sName.includes('coconut') || sName.includes('palm')
                        ? 'PER_TREE'
                        : isMachinery
                        ? 'HOURLY'
                        : sName.includes('paint') || sName.includes('tile')
                        ? 'PER_SQFT'
                        : sName.includes('electr') || sName.includes('wir')
                        ? 'PER_POINT'
                        : sName.includes('bore') || sName.includes('drill')
                        ? 'PER_FOOT'
                        : sName.includes('mason') || sName.includes('brick')
                        ? 'DAILY_WAGE'
                        : 'FIXED_VISIT';

                      const unitLabel = job.unitLabel || (wageType === 'PER_TREE' ? 'Tree' : wageType === 'HOURLY' ? 'Hour' : wageType === 'PER_SQFT' ? 'Sq. Ft.' : wageType === 'PER_POINT' ? 'Point' : wageType === 'PER_FOOT' ? 'Foot' : wageType === 'DAILY_WAGE' ? 'Day' : 'Visit');
                      const rate = job.workerUnitWage || (wageType === 'PER_TREE' ? 80 : wageType === 'HOURLY' ? 900 : wageType === 'PER_SQFT' ? 14 : wageType === 'PER_POINT' ? 260 : wageType === 'PER_FOOT' ? 65 : wageType === 'DAILY_WAGE' ? 1100 : 220);

                      return (
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                            {wageType === 'PER_TREE'
                              ? '🌴 Tree Count Basis'
                              : wageType === 'HOURLY'
                              ? '⏱️ Hourly Chronometer'
                              : wageType === 'PER_SQFT'
                              ? '📐 Area (Sq. Ft.)'
                              : wageType === 'PER_POINT'
                              ? '⚡ Point Basis'
                              : wageType === 'PER_FOOT'
                              ? '📏 Foot Depth'
                              : wageType === 'DAILY_WAGE'
                              ? '📅 Daily Shift'
                              : '🔧 Fixed Visit'}
                          </span>
                          {job.totalCalculatedWage ? (
                            <span className="text-[11px] font-mono font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                              Payout: ₹{job.totalCalculatedWage.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                              {language === 'ml' ? 'വേതനം: ജോലിക്ക് ശേഷം' : 'Payout: Set after completion'}
                            </span>
                          )}
                          {job.completedUnits ? (
                            <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                              {job.completedUnits} {unitLabel}s
                            </span>
                          ) : null}
                        </div>
                      );
                    })()}

                    <div className="space-y-2 mt-3 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Office Desk:</span>
                        <strong className="text-slate-800">
                          {job.officeStaff?.name || 'Dispatch Coordinator'}
                        </strong>
                        <a
                          href={`tel:${job.officeStaff?.phone || '+91 94000 00000'}`}
                          className="ml-auto inline-flex items-center gap-1 text-emerald-600 font-bold hover:underline"
                          title="Call Office Coordinator if you have doubts"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{job.officeStaff?.phone || 'Call Office'}</span>
                        </a>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate">
                          {job.location || `${job.city || ''}, ${job.district || 'Kerala'}`}
                        </span>
                        {job.mapUrl && (
                          <a
                            href={job.mapUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-auto text-emerald-600 hover:text-emerald-700 shrink-0"
                            title="Open Google Maps"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      {job.deadline && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>{t('deadline')}: {new Date(job.deadline).toLocaleDateString(language === 'hi' ? 'hi-IN' : language === 'ml' ? 'ml-IN' : 'en-IN')}</span>
                        </div>
                      )}

                      {job.locationRemarks && (
                        <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic line-clamp-2">
                          "{job.locationRemarks}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => openJobModal(job)}
                      className="text-xs font-bold text-[#5E42B4] hover:text-[#462F8B] flex items-center gap-1 cursor-pointer"
                    >
                      <span>{t('viewDetails')}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {isAssigned && (
                      <>
                        {job.workerAcceptance !== 'ACCEPTED' && job.workerAcceptance !== 'REACHED_SITE' ? (
                          <button
                            type="button"
                            disabled={actionLoadingId === job.id}
                            onClick={() => acceptJob(job.id)}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                          >
                            {actionLoadingId === job.id ? 'Accepting...' : (language === 'ml' ? 'ജോലി സ്വീകരിക്കുക' : 'Accept Work')}
                          </button>
                        ) : job.workerAcceptance === 'ACCEPTED' ? (
                          <button
                            type="button"
                            disabled={actionLoadingId === job.id}
                            onClick={() => markReachedSite(job.id)}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                          >
                            {actionLoadingId === job.id ? 'Recording...' : (language === 'ml' ? 'സൈറ്റിൽ എത്തി' : 'Reached Site')}
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={actionLoadingId === job.id}
                            onClick={() => updateJobStatus(job.id, 'IN_PROGRESS')}
                            className="px-4 py-2 rounded-xl bg-[#5E42B4] hover:bg-[#4E359B] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                          >
                            {actionLoadingId === job.id ? t('starting') : (language === 'ml' ? 'ജോലി ആരംഭിക്കുക' : 'Start Work')}
                          </button>
                        )}
                      </>
                    )}

                    {isInProgress && (
                      <button
                        type="button"
                        disabled={actionLoadingId === job.id}
                        onClick={() => updateJobStatus(job.id, 'COMPLETED')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        {actionLoadingId === job.id ? t('completing') : t('markCompleted')}
                      </button>
                    )}

                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{t('done')}</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center rounded-[28px] bg-white border border-slate-100 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Briefcase className="w-12 h-12 text-slate-300" />
            <h3 className="text-base font-bold text-slate-700">{t('noJobsFound')}</h3>
            <p className="text-xs max-w-sm">
              {searchQuery
                ? `"${searchQuery}"`
                : t('noJobsFoundDesc')}
            </p>
          </div>
        )}
      </div>
    </WorkerShell>
  );
}
