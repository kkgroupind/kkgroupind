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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <div className="w-full max-w-md bg-[#14161D] rounded-2xl border border-gray-800 overflow-hidden relative shadow-2xl text-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-300">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-100">
                {isLoginPrompt ? 'Attendance Check-in' : 'Change Availability'}
              </h2>
              <p className="text-xs text-gray-400">
                {isLoginPrompt ? 'Office staff daily status' : 'Current status: ' + (isCurrentlyAvailable ? 'Available' : 'Away')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-gray-100">
              {isLoginPrompt
                ? `Welcome back, ${userName}`
                : isCurrentlyAvailable
                ? 'Set status to Away?'
                : 'Set status to Available?'}
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              {isLoginPrompt
                ? 'Please confirm whether you are available for work today to begin handling enquiries and work orders.'
                : isCurrentlyAvailable
                ? 'You will be marked as away and won\'t be listed for active task handling.'
                : 'You will be marked as available to receive enquiries and coordinate field operations.'}
            </p>
          </div>

          {/* Date info banner */}
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-[#0D0E12] border border-gray-800 text-xs text-gray-400">
            <span className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-gray-500" />
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </span>
            <span className="text-gray-500 font-medium">Office Portal</span>
          </div>

          {/* Action Buttons */}
          {isLoginPrompt ? (
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onConfirm('AVAILABLE')}
                disabled={isLoading}
                className="flex-1 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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
                className="py-2.5 px-4 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium text-xs transition-colors disabled:opacity-50 border border-gray-700/60"
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
                className="py-2 px-4 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium text-xs transition-colors border border-gray-700/60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => onConfirm(targetToggleStatus)}
                disabled={isLoading}
                className={`py-2 px-4 rounded-lg font-medium text-xs transition-colors flex items-center gap-2 text-white disabled:opacity-50 ${
                  targetToggleStatus === 'AVAILABLE'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-amber-600 hover:bg-amber-500'
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
