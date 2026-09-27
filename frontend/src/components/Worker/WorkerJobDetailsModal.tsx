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
  TreePalm,
  Plus,
  Minus,
  IndianRupee,
  Layers,
  Zap,
  Droplets,
  Tractor,
  Wrench,
} from 'lucide-react';
import { ServiceEnquiry, EnquiryService } from '@/services';
import { useAuth } from '@/context/auth-context';
import { useWorkerLanguage } from '@/context/worker-language-context';

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
  const { language, t, translateService } = useWorkerLanguage();

  const [localJob, setLocalJob] = useState<ServiceEnquiry | null>(job);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Live On-Site Chronometer state (for JCB & Hourly services)
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Unit specifications logging state (Coconut Tree count, Sq.Ft., Points, Feet, etc.)
  const [unitCount, setUnitCount] = useState<number>(10);
  const [crownCleaningDone, setCrownCleaningDone] = useState(true);
  const [beetleMedicineApplied, setBeetleMedicineApplied] = useState(true);
  const [completionNotes, setCompletionNotes] = useState('');

  // Sync prop changes
  useEffect(() => {
    setLocalJob(job);
    setActionError(null);

    if (job) {
      // Derive initial units from job data
      const initialUnits = job.completedUnits ?? job.estimatedUnits ?? (
        job.serviceName?.toLowerCase().includes('coconut') || job.serviceName?.toLowerCase().includes('palm')
          ? 12
          : 5
      );
      setUnitCount(initialUnits);

      // Initialize timer if job is in progress with workStartedAt
      if (job.status === 'IN_PROGRESS' && job.workStartedAt) {
        const startMs = new Date(job.workStartedAt).getTime();
        const elapsedSeconds = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
        setTimerSeconds(elapsedSeconds);
        setIsTimerRunning(true);
      } else {
        setTimerSeconds(0);
        setIsTimerRunning(false);
      }
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

  // Identify service wage specification model accurately
  const sName = (localJob.serviceName || '').toLowerCase();
  const isMachinery =
    sName.includes('jcb') ||
    sName.includes('excavat') ||
    sName.includes('crane') ||
    sName.includes('earthmoving') ||
    sName.includes('trench') ||
    sName.includes('grader') ||
    sName.includes('ജെസിബി') ||
    sName.includes('എസ്കവേറ്റർ') ||
    sName.includes('ക്രെയിൻ') ||
    sName.includes('മണ്ണെടുക്കൽ');
  const isTreeService =
    sName.includes('coconut') ||
    sName.includes('cococare') ||
    sName.includes('palm') ||
    sName.includes('tree') ||
    sName.includes('കയറ്റം') ||
    sName.includes('തെങ്ങ്');
  const isPaintOrTile =
    sName.includes('paint') ||
    sName.includes('putty') ||
    sName.includes('tile') ||
    sName.includes('marble') ||
    sName.includes('granite') ||
    sName.includes('പെയിന്റിംഗ്') ||
    sName.includes('ടൈൽ');
  const isElectrical =
    sName.includes('electr') ||
    sName.includes('wire') ||
    sName.includes('wiring') ||
    sName.includes('kseb') ||
    sName.includes('ഇലക്ട്രിക്കൽ');
  const isBorewell =
    sName.includes('bore') ||
    sName.includes('drill') ||
    sName.includes('piling') ||
    sName.includes('കുഴൽക്കിണർ');
  const isMasonry =
    sName.includes('mason') ||
    sName.includes('brick') ||
    sName.includes('concrete') ||
    sName.includes('plaster') ||
    sName.includes('മേസ്തിരി');

  const wageType =
    localJob.wageType && localJob.wageType !== 'HOURLY'
      ? localJob.wageType
      : isMachinery
      ? 'HOURLY'
      : isTreeService
      ? 'PER_TREE'
      : isPaintOrTile
      ? 'PER_SQFT'
      : isElectrical
      ? 'PER_POINT'
      : isBorewell
      ? 'PER_FOOT'
      : isMasonry
      ? 'DAILY_WAGE'
      : localJob.wageType || 'FIXED_VISIT';

  const isCoconut = wageType === 'PER_TREE';
  const isHourly = wageType === 'HOURLY';
  const isSqFt = wageType === 'PER_SQFT';
  const isPoint = wageType === 'PER_POINT';
  const isFoot = wageType === 'PER_FOOT';
  const isDaily = wageType === 'DAILY_WAGE';
  const isVisit = wageType === 'FIXED_VISIT';

  const unitLabel =
    localJob.unitLabel ||
    (isCoconut
      ? 'Tree'
      : isHourly
      ? 'Hour'
      : isSqFt
      ? 'Sq. Ft.'
      : isPoint
      ? 'Point'
      : isFoot
      ? 'Foot'
      : isDaily
      ? 'Day / Shift'
      : 'Visit');

  const workerRate =
    localJob.workerUnitWage ||
    (isCoconut
      ? 80
      : isHourly
      ? 900
      : isSqFt
      ? sName.includes('tile') || sName.includes('marble')
        ? 28
        : 14
      : isPoint
      ? 260
      : isFoot
      ? 65
      : isDaily
      ? 1100
      : 220);

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

  // 2. Worker arrives on site and starts hourly timer (or marks in progress)
  const handleStartWork = async () => {
    if (!token) return;
    setIsSubmittingAction(true);
    setActionError(null);

    try {
      if (isHourly) {
        const res = await EnquiryService.startWorkTimer(
          localJob.id,
          { notes: 'Worker arrived on site and started equipment chronometer' },
          token,
        );
        setLocalJob(res.enquiry);
        setIsTimerRunning(true);
        setTimerSeconds(0);
      } else {
        const res = await EnquiryService.updateWorkerJobStatus(
          localJob.id,
          'IN_PROGRESS',
          'Operative arrived on site and began work execution',
          token,
        );
        setLocalJob(res.enquiry);
      }
      onJobUpdated?.();
    } catch (err: any) {
      if (onUpdateStatus) {
        await onUpdateStatus(localJob.id, 'IN_PROGRESS');
      } else {
        setActionError(err?.message || 'Failed to start work');
      }
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // 3. Worker completes work (Unit count or hourly duration logged)
  const handleCompleteWork = async () => {
    if (!token) return;
    setIsSubmittingAction(true);
    setActionError(null);

    try {
      if (isHourly) {
        const durationMinutes = Math.max(1, Math.round(timerSeconds / 60));
        const res = await EnquiryService.stopWorkTimer(
          localJob.id,
          {
            durationMinutes,
            completedUnits: Math.round((durationMinutes / 60) * 10) / 10,
            completionNotes: completionNotes.trim() || `Work completed. Recorded ${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m.`,
          },
          token,
        );
        setIsTimerRunning(false);
        setLocalJob(res.enquiry);
      } else {
        const units = Number(unitCount) || 1;
        let notesText = completionNotes.trim();
        if (isCoconut) {
          notesText = `Harvested ${units} coconut trees. ${crownCleaningDone ? 'Crown cleaned & fronds pruned.' : ''} ${beetleMedicineApplied ? 'Beetle medicine applied.' : ''} ${notesText}`;
        } else {
          notesText = `Completed ${units} ${unitLabel}s. ${notesText}`;
        }

        const res = await EnquiryService.updateWorkerJobStatus(
          localJob.id,
          'COMPLETED',
          notesText,
          token,
          {
            completedUnits: units,
            specificationDetails: {
              crownCleaningDone,
              beetleMedicineApplied,
            },
          },
        );
        setLocalJob(res.enquiry);
      }
      onJobUpdated?.();
    } catch (err: any) {
      if (onUpdateStatus) {
        await onUpdateStatus(localJob.id, 'COMPLETED');
      } else {
        setActionError(err?.message || 'Failed to complete work ticket');
      }
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Calculated live estimated wage for the operative
  const liveCalculatedWage = isHourly
    ? Math.round((Math.max(1, Math.round(timerSeconds / 60)) / 60) * workerRate)
    : Math.round((Number(unitCount) || 0) * workerRate);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-in fade-in select-none">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg bg-[#111827] rounded-[28px] p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.65)] border border-slate-700/80 flex flex-col gap-4 text-slate-200 z-10 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-[#34d399] bg-[#2A835F]/15 px-2.5 py-0.5 rounded-full border border-[#2A835F]/30">
                {localJob.trackingNumber}
              </span>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                {isCoconut ? (
                  <>
                    <TreePalm className="w-3 h-3" />
                    <span>Tree Count Model</span>
                  </>
                ) : isHourly ? (
                  <>
                    <Timer className="w-3 h-3" />
                    <span>Hourly Meter Model</span>
                  </>
                ) : isSqFt ? (
                  <>
                    <Layers className="w-3 h-3" />
                    <span>Area (Sq. Ft.) Model</span>
                  </>
                ) : isPoint ? (
                  <>
                    <Zap className="w-3 h-3" />
                    <span>Points Model</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    <span>{unitLabel} Basis</span>
                  </>
                )}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white leading-tight">
              {translateService(localJob.serviceName)}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {actionError && (
          <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{actionError}</span>
          </div>
        )}

        {/* 1-Tap Google Maps GPS Navigation Card */}
        <div className="p-4 rounded-2xl bg-[#1E293B]/70 border border-slate-750/80 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                {t('workSiteLocation')} (Kerala)
              </span>
              <div className="flex items-start gap-1.5 text-white font-semibold text-xs sm:text-sm">
                <MapPin className="w-4 h-4 text-[#2A835F] shrink-0 mt-0.5" />
                <span>
                  {localJob.location || `${localJob.city || ''}, ${localJob.district || 'Kasaragod'}, Kerala`}
                </span>
              </div>
            </div>

            <a
              href={navigationDestination}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#2A835F] hover:bg-[#236D4F] text-white px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{t('startNavigation')}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Location Remarks / Driving directions */}
          {localJob.locationRemarks && (
            <div className="pt-2 border-t border-slate-700/60 text-xs text-slate-300 bg-black/20 p-2.5 rounded-xl">
              <strong className="text-[#34d399] font-semibold block mb-0.5">
                {t('landmarks')}:
              </strong>
              {localJob.locationRemarks}
            </div>
          )}

          {localJob.deadline && (
            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {t('targetCompletion')}: <strong>{new Date(localJob.deadline).toLocaleDateString(language === 'hi' ? 'hi-IN' : language === 'ml' ? 'ml-IN' : 'en-IN')}</strong>
              </span>
            </div>
          )}
        </div>

        {/* ----------------- SPECIFICATION SECTION 1: COCONUT TREE PLUCKING COUNTER ----------------- */}
        {isCoconut && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#1E293B] via-[#16202E] to-[#121B28] border border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <TreePalm className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Coconut Palm Harvesting Specification
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Wage Rate: <strong className="text-emerald-300 font-bold">₹{workerRate}</strong> per tree
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Earned Wage Payout
                </span>
                <span className="font-mono text-base font-black text-[#34d399]">
                  ₹{(isCompleted && localJob.totalCalculatedWage ? localJob.totalCalculatedWage : liveCalculatedWage).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Tree Count Counter HUD */}
            <div className="bg-slate-900/90 border border-slate-750 rounded-2xl p-4 flex flex-col items-center gap-3">
              <span className="text-[11px] font-semibold text-slate-300">
                Number of Coconut Trees Plucked
              </span>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setUnitCount((prev) => Math.max(1, prev - 1))}
                  disabled={isCompleted || isSubmittingAction}
                  className="w-10 h-10 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-lg font-bold border border-slate-700 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="flex items-baseline gap-1.5 px-6 py-2 rounded-2xl bg-black/40 border border-emerald-500/40">
                  <input
                    type="number"
                    min={1}
                    value={unitCount}
                    onChange={(e) => setUnitCount(Math.max(1, Number(e.target.value)))}
                    disabled={isCompleted || isSubmittingAction}
                    className="w-16 bg-transparent text-center font-mono text-3xl font-black text-white focus:outline-none"
                  />
                  <span className="text-xs font-bold text-emerald-400">Trees</span>
                </div>

                <button
                  type="button"
                  onClick={() => setUnitCount((prev) => prev + 1)}
                  disabled={isCompleted || isSubmittingAction}
                  className="w-10 h-10 rounded-2xl bg-[#2A835F] hover:bg-[#236D4F] text-white flex items-center justify-center text-lg font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Increment Chips */}
              {!isCompleted && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Quick add:</span>
                  {[5, 10, 15, 20].map((inc) => (
                    <button
                      key={inc}
                      type="button"
                      onClick={() => setUnitCount((prev) => prev + inc)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-bold border border-slate-700 cursor-pointer"
                    >
                      +{inc}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Checklists for Kerala Agriculture Standards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={crownCleaningDone}
                  onChange={(e) => setCrownCleaningDone(e.target.checked)}
                  disabled={isCompleted}
                  className="w-4 h-4 rounded text-[#2A835F] focus:ring-0 bg-slate-950 border-slate-700"
                />
                <span className="text-slate-300 font-medium text-[11px]">
                  Crown Cleaning & Frond Pruning Done
                </span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={beetleMedicineApplied}
                  onChange={(e) => setBeetleMedicineApplied(e.target.checked)}
                  disabled={isCompleted}
                  className="w-4 h-4 rounded text-[#2A835F] focus:ring-0 bg-slate-950 border-slate-700"
                />
                <span className="text-slate-300 font-medium text-[11px]">
                  Rhinoceros Beetle Powder Applied
                </span>
              </label>
            </div>
          </div>
        )}

        {/* ----------------- SPECIFICATION SECTION 2: JCB / HOURLY CHRONOMETER ----------------- */}
        {isHourly && (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1E293B] via-[#16202E] to-[#121B28] border border-amber-500/30 text-center space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400">
                  <Tractor className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-white uppercase tracking-wider text-left">
                  JCB Machinery Chronometer
                </span>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                Rate: ₹{workerRate} / Hour
              </span>
            </div>

            <div className="font-mono text-3xl sm:text-4xl font-black text-white tracking-widest py-1 drop-shadow">
              {formatTimer(timerSeconds)}
            </div>

            <div className="flex items-center justify-between text-[11px] bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800">
              <span className="text-slate-400">
                {isTimerRunning ? (
                  <span className="inline-flex items-center gap-1.5 text-[#34d399] font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#34d399] animate-ping" />
                    Live Working Meter Active
                  </span>
                ) : isCompleted ? (
                  <span className="text-[#34d399] font-semibold">
                    Work Completed: {localJob.workDurationMinutes || Math.round(timerSeconds / 60)} minutes logged
                  </span>
                ) : (
                  'Timer starts upon arriving at site location'
                )}
              </span>

              <span className="font-mono text-xs font-bold text-emerald-300">
                Wage: ₹{(isCompleted && localJob.totalCalculatedWage ? localJob.totalCalculatedWage : liveCalculatedWage).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        )}

        {/* ----------------- SPECIFICATION SECTION 3: AREA / SQ.FT. / POINTS / FEET ----------------- */}
        {!isCoconut && !isHourly && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#16202E] border border-slate-700 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-sky-500/20 text-sky-400">
                  {isSqFt ? <Layers className="w-4 h-4" /> : isPoint ? <Zap className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </span>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {unitLabel} Measurement Specification
                </span>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                Rate: ₹{workerRate} / {unitLabel}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 items-center">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                  Completed {unitLabel}s
                </label>
                <input
                  type="number"
                  min={1}
                  value={unitCount}
                  onChange={(e) => setUnitCount(Math.max(1, Number(e.target.value)))}
                  disabled={isCompleted || isSubmittingAction}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-[#2A835F]"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Earned Worker Wage
                </span>
                <span className="font-mono text-base font-black text-[#34d399]">
                  ₹{(isCompleted && localJob.totalCalculatedWage ? localJob.totalCalculatedWage : liveCalculatedWage).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Operational Tasks & Instructions */}
        <div className="space-y-2 text-xs">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {t('workSpecs')}
          </label>
          <p className="bg-[#1E293B]/60 border border-slate-750 p-3.5 rounded-2xl text-slate-200 font-medium leading-relaxed">
            {localJob.message}
          </p>

          {localJob.notes && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
              <strong className="font-bold text-amber-200">{t('officeInstructions')}: </strong>
              {localJob.notes}
            </div>
          )}

          {localJob.workerAcceptance && (
            <div className="p-2.5 rounded-xl bg-[#2A835F]/15 border border-[#2A835F]/30 text-[#34d399] text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#34d399] shrink-0" />
              <span>
                <strong>{t('workerCommitment')}: </strong> {localJob.workerAcceptance}
              </span>
            </div>
          )}
        </div>

        {/* Action Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800 mt-1">
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
              {isCompleted ? t('completedBadge') : isInProgress ? t('inProgress') : t('assigned')}
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
                className="bg-[#2A835F] hover:bg-[#236D4F] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isSubmittingAction ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>{t('acceptFinishToday')}</span>
              </button>
            )}

            {/* 2. If assigned: "Arrive on Site & Begin Work" */}
            {isAssigned && (
              <button
                type="button"
                onClick={handleStartWork}
                disabled={isSubmittingAction || isActing}
                className="bg-[#2A835F] hover:bg-[#236D4F] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isSubmittingAction || isActing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <PlayCircle className="w-3.5 h-3.5" />
                )}
                <span>{isHourly ? 'Arrived on Site & Start Timer' : t('startWork')}</span>
              </button>
            )}

            {/* 3. If in progress: "Complete Work & Submit Specifications" */}
            {isInProgress && (
              <button
                type="button"
                onClick={handleCompleteWork}
                disabled={isSubmittingAction || isActing}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isSubmittingAction || isActing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle className="w-3.5 h-3.5" />
                )}
                <span>
                  {isCoconut
                    ? `Submit ${unitCount} Trees & Complete`
                    : isHourly
                    ? 'Stop Timer & Complete'
                    : `Submit ${unitCount} ${unitLabel}s & Complete`}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              {t('close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
