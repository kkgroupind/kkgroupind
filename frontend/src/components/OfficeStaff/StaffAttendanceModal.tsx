'use client';

import React from 'react';
import {
  X,
  CheckCircle2,
  Loader2,
  Clock,
  UserCheck,
  AlertCircle,
} from 'lucide-react';

export interface StaffAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (status: 'AVAILABLE' | 'OFF_DUTY') => Promise<void> | void;
  isLoading?: boolean;
  userName?: string;
  mode?: 'login-prompt' | 'toggle-confirm';
  currentStatus?: 'AVAILABLE' | 'OFF_DUTY';
}

export function StaffAttendanceModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  userName = 'Staff Member',
  mode = 'login-prompt',
  currentStatus = 'OFF_DUTY',
}: StaffAttendanceModalProps) {
  if (!isOpen) return null;

  const isLoginPrompt = mode === 'login-prompt';
  const isCurrentlyAvailable = currentStatus === 'AVAILABLE';
  const targetToggleStatus: 'AVAILABLE' | 'OFF_DUTY' = isCurrentlyAvailable
    ? 'OFF_DUTY'
    : 'AVAILABLE';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#7692FF]/30 overflow-hidden relative shadow-2xl text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1B2CC1]/10 text-[#1B2CC1] border border-[#1B2CC1]/20 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#091540]">
                {isLoginPrompt ? 'Attendance Check-in' : 'Change Availability'}
              </h2>
              <p className="text-xs text-slate-500">
                {isLoginPrompt ? 'Office staff daily status' : 'Current status: ' + (isCurrentlyAvailable ? 'Available' : 'Away')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#091540] hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-[#091540]">
              {isLoginPrompt
                ? `Welcome back, ${userName}`
                : isCurrentlyAvailable
                ? 'Set status to Away?'
                : 'Set status to Available?'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isLoginPrompt
                ? 'Please confirm whether you are available for work today to begin handling enquiries and work orders.'
                : isCurrentlyAvailable
                ? 'You will be marked as away and won\'t be listed for active task handling.'
                : 'You will be marked as available to receive enquiries and coordinate field operations.'}
            </p>
          </div>

          {/* Date info banner */}
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <span className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#1B2CC1]" />
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </span>
            <span className="text-slate-400 font-medium">Office Portal</span>
          </div>

          {/* Action Buttons */}
          {isLoginPrompt ? (
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onConfirm('AVAILABLE')}
                disabled={isLoading}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#1B2CC1] hover:bg-[#15239E] text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>I am Available</span>
              </button>

              <button
                type="button"
                onClick={() => onConfirm('OFF_DUTY')}
                disabled={isLoading}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors disabled:opacity-50 border border-slate-200"
              >
                Away Today
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors border border-slate-200"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => onConfirm(targetToggleStatus)}
                disabled={isLoading}
                className={`py-2 px-4 rounded-xl font-bold text-xs transition-colors flex items-center gap-2 text-white disabled:opacity-50 shadow-md ${
                  targetToggleStatus === 'AVAILABLE'
                    ? 'bg-[#1B2CC1] hover:bg-[#15239E]'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  {targetToggleStatus === 'AVAILABLE'
                    ? 'Confirm Available'
                    : 'Confirm Away'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
