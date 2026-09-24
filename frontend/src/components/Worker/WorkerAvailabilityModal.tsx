'use client';

import React from 'react';
import {
  HardHat,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Loader2,
  Calendar,
  Footprints,
} from 'lucide-react';

export interface WorkerAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (status: 'AVAILABLE' | 'OFF_DUTY') => Promise<void> | void;
  isLoading?: boolean;
  userName?: string;
  currentStatus?: 'AVAILABLE' | 'OFF_DUTY' | 'BUSY';
}

export function WorkerAvailabilityModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  userName = 'Field Worker',
  currentStatus = 'AVAILABLE',
}: WorkerAvailabilityModalProps) {
  if (!isOpen) return null;

  const isCurrentlyAvailable = currentStatus === 'AVAILABLE';
  const targetStatus: 'AVAILABLE' | 'OFF_DUTY' = isCurrentlyAvailable
    ? 'OFF_DUTY'
    : 'AVAILABLE';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] border border-slate-200/80 overflow-hidden relative select-none">
        {/* Top Accent Stripe */}
        <div
          className={`h-2 w-full ${
            targetStatus === 'AVAILABLE'
              ? 'bg-gradient-to-r from-[#2A835F] via-[#3db383] to-[#2A835F]'
              : 'bg-gradient-to-r from-amber-500 via-orange-400 to-amber-600'
          }`}
        />

        {/* Modal Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          aria-label="Close modal"
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header Badge */}
          <div className="flex items-center gap-2 mb-4">
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                targetStatus === 'AVAILABLE'
                  ? 'bg-[#EBF6F1] text-[#2A835F] border-[#C3E6D5]'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              <HardHat className="w-3.5 h-3.5" />
              <span>Field Worker Availability</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Squad Attendance</span>
            </span>
          </div>

          {/* Title with Bilingual Typography */}
          <div className="space-y-1 mb-4">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
              {targetStatus === 'AVAILABLE'
                ? 'Mark as Available for Work?'
                : 'Mark as On Leave / Off Duty?'}
            </h2>
            <p className="text-sm font-semibold text-[#2A835F]">
              {targetStatus === 'AVAILABLE'
                ? 'ഫീൽഡ് ജോലികൾക്കായി താങ്കൾ ലഭ്യമാണോ?'
                : 'അവധി രേഖപ്പെടുത്താൻ താങ്കൾ ഉറപ്പാണോ? (On Leave)'}
            </p>
          </div>

          {/* Explanation Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-6 space-y-2.5">
            <div className="flex items-start gap-3">
              {targetStatus === 'AVAILABLE' ? (
                <div className="w-9 h-9 rounded-xl bg-[#EBF6F1] text-[#2A835F] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              )}
              <div className="text-xs text-slate-600 leading-relaxed">
                {targetStatus === 'AVAILABLE' ? (
                  <>
                    Marking yourself as <strong>Available</strong> signals to the
                    operations team and office staff that you are ready for new
                    assignments (e.g. palm harvesting, earth excavation, masonry,
                    electrical, etc.).
                  </>
                ) : (
                  <>
                    Marking yourself as <strong>Off Duty / On Leave</strong> ensures
                    the office desk knows you are not working today. You will not
                    be assigned new dispatches until you mark yourself available.
                  </>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Today: {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
              </span>
              <span className="font-semibold text-slate-700">KK Group Squad Operations</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={() => onConfirm(targetStatus)}
              disabled={isLoading}
              className={`w-full sm:flex-1 py-3.5 px-5 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                targetStatus === 'AVAILABLE'
                  ? 'bg-[#2A835F] hover:bg-[#236D4F] active:scale-98 text-white'
                  : 'bg-amber-600 hover:bg-amber-700 active:scale-98 text-white'
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : targetStatus === 'AVAILABLE' ? (
                <CheckCircle2 className="w-4 h-4 text-white" />
              ) : (
                <Footprints className="w-4 h-4 text-white" />
              )}
              <span>
                {targetStatus === 'AVAILABLE'
                  ? 'Confirm Available / ലഭ്യമാണ്'
                  : 'Confirm Off Duty / അവധി രേഖപ്പെടുത്തുക'}
              </span>
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto py-3.5 px-5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
            >
              Cancel / റദ്ദാക്കുക
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
