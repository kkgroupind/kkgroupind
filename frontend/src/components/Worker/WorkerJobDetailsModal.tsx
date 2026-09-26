'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  PlayCircle,
  Loader2,
  Calendar,
  AlertCircle,
  User,
  Navigation,
  ExternalLink,
  Timer,
  CheckCircle2,
  Pause,
  Play,
  StopCircle,
  Sparkles,
} from 'lucide-react';
import { ServiceEnquiry, EnquiryService } from '@/services';
import { useAuth } from '@/context/auth-context';

interface WorkerJobDetailsModalProps {
  job: ServiceEnquiry | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (jobId: string, status: 'IN_PROGRESS' | 'COMPLETED') => Promise<void>;
  isActing?: boolean;
  onJobUpdated?: () => void;
}

export function WorkerJobDetailsModal({
  job,
  isOpen,
  onClose,
  onUpdateStatus,
  isActing = false,
  onJobUpdated,
}: WorkerJobDetailsModalProps) {
  const { token } = useAuth();

  const [localJob, setLocalJob] = useState<ServiceEnquiry | null>(job);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Live On-Site Chronometer state
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync prop changes
  useEffect(() => {
    setLocalJob(job);
    setActionError(null);

    // Initialize timer if job is in progress with workStartedAt
    if (job && job.status === 'IN_PROGRESS' && job.workStartedAt) {
      const startMs = new Date(job.workStartedAt).getTime();
      const elapsedSeconds = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
      setTimerSeconds(elapsedSeconds);
      setIsTimerRunning(true);
    } else {
      setTimerSeconds(0);
      setIsTimerRunning(false);
    }
  }, [job]);

  // Live timer interval
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTimerRunning]);

  if (!isOpen || !localJob) return null;

  const isAssigned = localJob.status === 'ASSIGNED';
  const isInProgress = localJob.status === 'IN_PROGRESS';
  const isCompleted = localJob.status === 'COMPLETED';
  const isHourly = localJob.isHourlyCalculated || false;

  // Format chronometer seconds into HH:MM:SS
  const formatTimer = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Google Maps navigation link
  const navigationDestination =
    localJob.mapUrl ||
    (localJob.location
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
          `${localJob.location}, Kerala, India`,
        )}`
      : 'https://maps.google.com');

  // 1. Worker Accepts the Job ("Will finish within the day")
  const handleAcceptJob = async (acceptanceText: string = 'Will finish within the day') => {
    if (!token) return;
    setIsSubmittingAction(true);
    setActionError(null);

    try {
      const res = await EnquiryService.acceptWorkerJob(
        localJob.id,
        { workerAcceptance: acceptanceText },
        token,
      );
      setLocalJob(res.enquiry);
      onJobUpdated?.();
    } catch (err: any) {
      setActionError(err?.message || 'Failed to accept job assignment');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // 2. Worker arrives on site and starts hourly working timer
  const handleStartTimer = async () => {
    if (!token) return;
    setIsSubmittingAction(true);
    setActionError(null);

    try {
      const res = await EnquiryService.startWorkTimer(
        localJob.id,
        { notes: 'Worker arrived on site and started working timer' },
        token,
      );
      setLocalJob(res.enquiry);
      setIsTimerRunning(true);
      setTimerSeconds(0);
      onJobUpdated?.();
    } catch (err: any) {
      // Fallback to standard status update if timer endpoint had an issue
      if (onUpdateStatus) {
        await onUpdateStatus(localJob.id, 'IN_PROGRESS');
      } else {
        setActionError(err?.message || 'Failed to start on-site timer');
      }
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // 3. Worker completes work and stops timer
  const handleStopTimer = async () => {
    if (!token) return;
    setIsSubmittingAction(true);
    setActionError(null);

    try {
      const durationMinutes = Math.max(1, Math.round(timerSeconds / 60));
      const res = await EnquiryService.stopWorkTimer(
        localJob.id,
        {
          durationMinutes,
          completionNotes: `Work completed on site. Total recorded duration: ${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m.`,
        },
        token,
      );
      setIsTimerRunning(false);
      setLocalJob(res.enquiry);
      onJobUpdated?.();
    } catch (err: any) {
      if (onUpdateStatus) {
        await onUpdateStatus(localJob.id, 'COMPLETED');
      } else {
        setActionError(err?.message || 'Failed to stop timer and complete work');
      }
    } finally {
      setIsSubmittingAction(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in select-none">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg bg-[#0c1310] rounded-[32px] p-6 sm:p-7 shadow-2xl border border-emerald-500/30 flex flex-col gap-4 text-slate-200 z-10 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-emerald-500/20 pb-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                {localJob.trackingNumber}
              </span>
              {isHourly && (
                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                  <Timer className="w-3 h-3" />
                  Hourly Metering (JCB)
                </span>
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
              {localJob.serviceName}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {actionError && (
          <div className="p-3 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{actionError}</span>
          </div>
        )}

        {/* 1-Tap Google Maps GPS Navigation Card */}
        <div className="p-4 rounded-2xl bg-[#121f18] border border-emerald-500/30 space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Work Site Location (Kerala)
              </span>
              <div className="flex items-start gap-1.5 text-white font-semibold text-sm">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  {localJob.location || `${localJob.city || ''}, ${localJob.district || 'Kasaragod'}, Kerala`}
                </span>
              </div>
            </div>

            <a
              href={navigationDestination}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-lg transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Start Navigation</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Location Remarks / Driving directions */}
          {localJob.locationRemarks && (
            <div className="pt-2 border-t border-white/5 text-xs text-slate-300 bg-black/20 p-2.5 rounded-xl">
              <strong className="text-emerald-400 font-semibold block mb-0.5">
                Access Remarks &amp; Landmarks:
              </strong>
              {localJob.locationRemarks}
            </div>
          )}

          {localJob.deadline && (
            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Target Completion: <strong>{new Date(localJob.deadline).toLocaleDateString()}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Live Hourly Working Chronometer (JCB / Machinery Work) */}
        {isHourly && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#121f18] to-[#18271e] border border-emerald-500/40 text-center space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
              On-Site Equipment Chronometer
            </span>
            <div className="font-mono text-3xl sm:text-4xl font-black text-white tracking-widest py-1 drop-shadow">
              {formatTimer(timerSeconds)}
            </div>
            <p className="text-[11px] text-slate-300">
              {isTimerRunning ? (
                <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Live Working Hour Calculation Active
                </span>
              ) : isCompleted ? (
                <span className="text-emerald-400 font-semibold">
                  Job Completed: {localJob.workDurationMinutes || Math.round(timerSeconds / 60)} minutes logged
                </span>
              ) : (
                <span className="text-slate-400">
                  Timer starts upon arriving at site location
                </span>
              )}
            </p>
          </div>
        )}

        {/* Operational Tasks & Instructions */}
        <div className="space-y-2 text-xs">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Work Specifications &amp; Requirements
          </label>
          <p className="bg-[#121f18] border border-white/5 p-3.5 rounded-2xl text-slate-200 font-medium leading-relaxed">
            {localJob.message}
          </p>

          {localJob.notes && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
              <strong className="font-bold text-amber-200">Office Dispatch Instructions: </strong>
              {localJob.notes}
            </div>
          )}

          {localJob.workerAcceptance && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Worker Commitment: </strong> {localJob.workerAcceptance}
              </span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-emerald-500/20 mt-1">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isCompleted
                  ? 'bg-emerald-500'
                  : isInProgress
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-purple-500'
              }`}
            />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {localJob.status.replace('_', ' ')}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* 1. If assigned and not yet accepted: "Accept Assignment" */}
            {isAssigned && !localJob.workerAcceptance && (
              <button
                type="button"
                onClick={() => handleAcceptJob('Will finish within the day')}
                disabled={isSubmittingAction}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isSubmittingAction ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>Accept: Finish Within The Day</span>
              </button>
            )}

            {/* 2. If assigned & accepted (or general assigned): "Arrived & Start Timer / Work" */}
            {isAssigned && (
              <button
                type="button"
                onClick={isHourly ? handleStartTimer : () => onUpdateStatus?.(localJob.id, 'IN_PROGRESS')}
                disabled={isSubmittingAction || isActing}
                className="bg-[#2A835F] hover:bg-[#236D4F] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isSubmittingAction || isActing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <PlayCircle className="w-3.5 h-3.5" />
                )}
                <span>{isHourly ? 'Arrived on Site & Start Timer' : 'Start Work'}</span>
              </button>
            )}

            {/* 3. If in progress: "Complete Work & Stop Timer" */}
            {isInProgress && (
              <button
                type="button"
                onClick={isHourly ? handleStopTimer : () => onUpdateStatus?.(localJob.id, 'COMPLETED')}
                disabled={isSubmittingAction || isActing}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isSubmittingAction || isActing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle className="w-3.5 h-3.5" />
                )}
                <span>{isHourly ? 'Complete Work & Stop Timer' : 'Mark Completed'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="bg-white/10 hover:bg-white/20 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
