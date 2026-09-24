'use client';

import React from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Phone,
  HardHat,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  ArrowRight,
} from 'lucide-react';
import { Invoice } from '@/app/(dashboard)/office-staff/dashboard/page';

interface OfficeStaffCalendarViewProps {
  invoices: Invoice[];
  onSelectInvoice?: (invoiceId: string) => void;
  onAssignWorker?: (invoiceId: string) => void;
  onShowToast?: (msg: string) => void;
}

export function OfficeStaffCalendarView({
  invoices,
  onSelectInvoice,
  onAssignWorker,
  onShowToast,
}: OfficeStaffCalendarViewProps) {
  // Sort invoices by preferred date / due days
  const scheduledOrders = [...invoices].sort(
    (a, b) => (a.dueInDays ?? 0) - (b.dueInDays ?? 0),
  );

  const pendingAssignment = scheduledOrders.filter((inv) => !inv.worker);
  const assignedOrders = scheduledOrders.filter((inv) => !!inv.worker);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Crew Dispatch
            </span>
            <div className="text-2xl font-black text-rose-600 mt-1">
              {pendingAssignment.length} Orders
            </div>
            <span className="text-[11px] text-slate-400">Requires worker assignment</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Dispatched & Scheduled
            </span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {assignedOrders.length} Orders
            </div>
            <span className="text-[11px] text-slate-400">Assigned to certified crew</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Calendar Range
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              Kerala Operations
            </div>
            <span className="text-[11px] text-slate-400">Next 14 days schedule</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-[#5851F8] flex items-center justify-center">
            <CalendarIcon className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Scheduled Orders Timeline Container */}
      <div className="bg-[#12131D] rounded-[32px] p-5 sm:p-7 text-white shadow-2xl border border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-emerald-400" />
              <span>Upcoming Field Jobs & Dispatches Schedule</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Chronological schedule of Kerala customer bookings and assigned squad timelines.
            </p>
          </div>
          <span className="text-xs font-semibold bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700 w-fit">
            {scheduledOrders.length} Total Bookings
          </span>
        </div>

        {/* Timeline Items */}
        <div className="mt-6 space-y-3">
          {scheduledOrders.map((order) => {
            const hasWorker = !!order.worker;

            return (
              <div
                key={order.id}
                className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-800 hover:border-slate-700 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left: Date & Service Details */}
                <div className="flex items-start gap-4">
                  {/* Date Badge */}
                  <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-3 flex flex-col items-center justify-center text-center shrink-0 w-16 sm:w-20">
                    <span className="text-[10px] uppercase font-bold text-emerald-400">
                      Due In
                    </span>
                    <span className="text-lg sm:text-xl font-black text-white leading-none my-0.5">
                      {order.dueInDays}d
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">
                      {order.preferredDate ? order.preferredDate.split(',')[0] : 'Scheduled'}
                    </span>
                  </div>

                  {/* Customer and Order Info */}
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 font-mono">
                        {order.code}
                      </span>
                      <span className="text-xs font-semibold bg-white/10 text-white px-2 py-0.5 rounded-full">
                        {order.companyName}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          hasWorker
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {hasWorker ? 'Crew Assigned' : 'Unassigned'}
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-white tracking-tight mt-1">
                      {order.serviceName}
                    </h4>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-400">
                      <span className="text-white font-medium">
                        Customer: {order.customerName}
                      </span>
                      {order.customerPhone && (
                        <span className="flex items-center gap-1 font-mono text-emerald-400">
                          <Phone className="w-3 h-3" />
                          {order.customerPhone}
                        </span>
                      )}
                      {order.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {order.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Worker Assigned & Quick Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                  {hasWorker ? (
                    <div className="flex items-center gap-2.5 bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700">
                      <HardHat className="w-4 h-4 text-emerald-400" />
                      <div className="text-left">
                        <span className="text-[10px] text-slate-400 block font-medium">
                          Assigned Operative
                        </span>
                        <span className="text-xs font-bold text-white">
                          {order.worker?.name || order.worker?.username}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-rose-500/15 border border-rose-500/30 px-3 py-2 rounded-xl text-rose-300 text-xs font-semibold">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>Pending Field Crew</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (onAssignWorker) {
                        onAssignWorker(order.id);
                      } else {
                        onShowToast?.(`Dispatch worker modal opened for ${order.code}`);
                      }
                    }}
                    className={`text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                      hasWorker
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        : 'bg-[#2A835F] hover:bg-[#236D4F] text-white shadow-md'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{hasWorker ? 'Reassign' : 'Dispatch Worker'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectInvoice) {
                        onSelectInvoice(order.id);
                      }
                    }}
                    className="text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>View Order</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
