'use client';

import React, { useState, useMemo } from 'react';
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
import { WorkerShell } from '@/components/Worker';
import { ServiceEnquiry } from '@/services';

export default function WorkerJobsPage() {
  const {
    jobs,
    loadingJobs,
    openJobModal,
    updateJobStatus,
    actionLoadingId,
  } = useWorker();

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
                  വർക്ക് ഓർഡറുകൾ / Jobs & Work Orders
                </h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-[#5E42B4] border border-purple-200">
                  {jobs.length} Total
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Browse all field dispatches, ongoing work orders, and past completion logs
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
              All ({counts.all})
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
              Active ({counts.inProgress})
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
              New Assigned ({counts.assigned})
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
              Completed ({counts.completed})
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
                      <div>
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
                              ? 'Assigned'
                              : isInProgress
                              ? 'In Progress'
                              : 'Completed'}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-[#5E42B4] transition-colors mt-2">
                          {job.serviceName}
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-2 mt-3 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Customer:</span>
                        <strong className="text-slate-800">{job.customerName}</strong>
                        {job.customerPhone && (
                          <a
                            href={`tel:${job.customerPhone}`}
                            className="ml-auto inline-flex items-center gap-1 text-[#5E42B4] font-bold hover:underline"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{job.customerPhone}</span>
                          </a>
                        )}
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
                          <span>Deadline: {new Date(job.deadline).toLocaleDateString('en-IN')}</span>
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
                      <span>Full Details</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {isAssigned && (
                      <button
                        type="button"
                        disabled={actionLoadingId === job.id}
                        onClick={() => updateJobStatus(job.id, 'IN_PROGRESS')}
                        className="px-4 py-2 rounded-xl bg-[#5E42B4] hover:bg-[#4E359B] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        {actionLoadingId === job.id ? 'Starting...' : 'Start Job'}
                      </button>
                    )}

                    {isInProgress && (
                      <button
                        type="button"
                        disabled={actionLoadingId === job.id}
                        onClick={() => updateJobStatus(job.id, 'COMPLETED')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        {actionLoadingId === job.id ? 'Completing...' : 'Mark Completed'}
                      </button>
                    )}

                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Done</span>
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
            <h3 className="text-base font-bold text-slate-700">No Jobs Found</h3>
            <p className="text-xs max-w-sm">
              {searchQuery
                ? `No work orders matched your search query "${searchQuery}".`
                : 'There are currently no work orders under this status filter.'}
            </p>
          </div>
        )}
      </div>
    </WorkerShell>
  );
}
