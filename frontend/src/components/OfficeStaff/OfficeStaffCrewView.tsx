'use client';

import React from 'react';
import {
  Users,
  HardHat,
  Phone,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
  Calendar,
  UserCheck,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { WorkerWithAvailability, WorkerStatus } from '@/services';
import { Invoice } from '@/app/(dashboard)/office-staff/dashboard/page';

interface OfficeStaffCrewViewProps {
  workers: WorkerWithAvailability[];
  invoices: Invoice[];
  onSelectWorkerForDispatch?: (workerId: string) => void;
  onShowToast?: (msg: string) => void;
}

export function OfficeStaffCrewView({
  workers,
  invoices,
  onSelectWorkerForDispatch,
  onShowToast,
}: OfficeStaffCrewViewProps) {
  const readyCount = workers.filter((w) => w.workerStatus === 'AVAILABLE').length;
  const busyCount = workers.filter((w) => w.workerStatus === 'BUSY').length;
  const offDutyCount = workers.filter((w) => w.workerStatus === 'OFF_DUTY').length;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Top Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Available for Dispatch
            </span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {readyCount} Operatives
            </div>
            <span className="text-[11px] text-slate-400">Ready for instant assignment</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              On-Field / Active
            </span>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {busyCount} Operatives
            </div>
            <span className="text-[11px] text-slate-400">Currently executing work orders</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-white/80 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Squad Size
            </span>
            <div className="text-2xl font-black text-[#091540] mt-1">
              {workers.length} Operatives
            </div>
            <span className="text-[11px] text-slate-400">Kerala certified field workforce</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#ABD2FA]/30 text-[#1B2CC1] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Operatives Grid */}
      <div className="bg-[#091540] rounded-[32px] p-5 sm:p-7 text-white shadow-2xl border border-[#7692FF]/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#7692FF]/20">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <HardHat className="w-5 h-5 text-[#ABD2FA]" />
              <span>Certified Kerala Field Crew & Squad Registry</span>
            </h3>
            <p className="text-xs text-[#ABD2FA]/80 mt-0.5">
              Live status, workloads, and dispatch management for KK Group field teams.
            </p>
          </div>
          <span className="text-xs font-semibold bg-[#1B2CC1]/30 text-[#ABD2FA] px-3 py-1 rounded-full border border-[#7692FF]/30 w-fit">
            {readyCount} of {workers.length} Ready
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {workers.map((worker) => {
            const isAvailable = worker.workerStatus === 'AVAILABLE';
            const isBusy = worker.workerStatus === 'BUSY';

            // Find jobs assigned to this worker
            const assignedOrders = invoices.filter(
              (inv) => inv.worker?.id === worker.id,
            );

            return (
              <div
                key={worker.id}
                className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg"
              >
                <div>
                  {/* Worker Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/15 overflow-hidden flex items-center justify-center shrink-0">
                        {(worker as any).profileImage ? (
                          <img
                            src={(worker as any).profileImage}
                            alt={worker.name || worker.username || 'Worker'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <HardHat className="w-5 h-5 text-emerald-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white tracking-tight leading-snug">
                          {worker.name || worker.username}
                        </h4>
                        <span className="text-[11px] text-slate-400 block font-mono">
                          @{worker.username}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                        isAvailable
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isBusy
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isAvailable
                            ? 'bg-emerald-400 animate-pulse'
                            : isBusy
                              ? 'bg-amber-400'
                              : 'bg-slate-500'
                        }`}
                      />
                      {worker.workerStatus}
                    </span>
                  </div>

                  {/* Worker Details & Workload */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                    {worker.phone && (
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" />
                          <span>Phone</span>
                        </span>
                        <a
                          href={`tel:${worker.phone}`}
                          className="font-mono text-emerald-400 hover:underline"
                        >
                          {worker.phone}
                        </a>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Active Orders</span>
                      </span>
                      <span className="font-semibold text-white">
                        {worker._count?.workerAssignments ?? assignedOrders.length} orders
                      </span>
                    </div>

                    {assignedOrders.length > 0 && (
                      <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60 mt-2">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider mb-1">
                          Current Assignment
                        </span>
                        <span className="text-xs text-white font-medium line-clamp-1">
                          {assignedOrders[0].serviceName}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {assignedOrders[0].customerName} &bull; {assignedOrders[0].location || 'Kerala'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectWorkerForDispatch) {
                        onSelectWorkerForDispatch(worker.id);
                      } else {
                        onShowToast?.(`Dispatch modal opened for ${worker.name || worker.username}`);
                      }
                    }}
                    className={`flex-1 text-xs font-bold py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      isAvailable
                        ? 'bg-[#1B2CC1] hover:bg-[#15239E] text-white shadow-md shadow-[#1B2CC1]/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{isAvailable ? 'Dispatch Now' : 'Assign More'}</span>
                  </button>

                  {worker.phone && (
                    <a
                      href={`tel:${worker.phone}`}
                      title={`Call ${worker.name || worker.username}`}
                      className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
