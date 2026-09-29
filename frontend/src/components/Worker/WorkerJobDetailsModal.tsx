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
  Users,
  ShieldCheck,
  Coffee,
  Utensils,
  AlertTriangle,
  Save,
  ChevronDown,
} from 'lucide-react';
import { ServiceEnquiry, EnquiryService } from '@/services';
import { useAuth } from '@/context/auth-context';
import { useWorkerLanguage } from '@/context/worker-language-context';
import Image from 'next/image';
import { getServiceBanner } from '@/utils/service-options';

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
  const { user, token } = useAuth();
  const { language, t, translateService } = useWorkerLanguage();

  const [localJob, setLocalJob] = useState<ServiceEnquiry | null>(job);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Live On-Site Chronometer state (for JCB & Hourly services)
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Break / Pause State (Lunch, Breakfast/Tea, Emergency, Breakdown)
  const [activeBreak, setActiveBreak] = useState<{
    reason: string;
    startedAt: string;
    notes?: string;
  } | null>(null);
  const [breakTimerSeconds, setBreakTimerSeconds] = useState(0);
  const [showBreakSelector, setShowBreakSelector] = useState(false);
  const breakIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Dedicated Confirmation Dialog States
  const [isPauseConfirmOpen, setIsPauseConfirmOpen] = useState(false);
  const [isResumeConfirmOpen, setIsResumeConfirmOpen] = useState(false);
  const [selectedBreakReason, setSelectedBreakReason] = useState<string>('LUNCH');
  const [breakNotes, setBreakNotes] = useState<string>('');

  const [isStopTimerConfirmOpen, setIsStopTimerConfirmOpen] = useState(false);
  const [isCompleteCountConfirmOpen, setIsCompleteCountConfirmOpen] = useState(false);

  // Group Work Co-Workers Dropdown State
  const [isSquadDropdownOpen, setIsSquadDropdownOpen] = useState(false);

  // Unit specifications & draft progress logging state (Tree count, Sq.Ft., Points, etc.)
  const [unitCount, setUnitCount] = useState<number>(10);
  const [crownCleaningDone, setCrownCleaningDone] = useState(true);
  const [beetleMedicineApplied, setBeetleMedicineApplied] = useState(true);
  const [completionNotes, setCompletionNotes] = useState('');
  const [lastDraftSavedTime, setLastDraftSavedTime] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Sync prop changes
  useEffect(() => {
    setLocalJob(job);
    setActionError(null);

    if (job) {
      // Derive initial units from job data
      const spec = (job.specificationDetails as any) || {};
      const initialUnits =
        spec.temporaryCount ??
        job.completedUnits ??
        job.estimatedUnits ??
        (job.serviceName?.toLowerCase().includes('coconut') ||
        job.serviceName?.toLowerCase().includes('palm')
          ? 12
          : 5);
      setUnitCount(initialUnits);

      if (spec.lastDraftSavedAt) {
        setLastDraftSavedTime(
          new Date(spec.lastDraftSavedAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        );
      } else {
        setLastDraftSavedTime(null);
      }

      // Check active break status
      if (spec.activeBreak) {
        setActiveBreak(spec.activeBreak);
        const breakStartMs = new Date(spec.activeBreak.startedAt).getTime();
        const breakElapsed = Math.max(0, Math.floor((Date.now() - breakStartMs) / 1000));
        setBreakTimerSeconds(breakElapsed);
      } else {
        setActiveBreak(null);
        setBreakTimerSeconds(0);
      }

      // Initialize timer if job is in progress with workStartedAt
      if (job.status === 'IN_PROGRESS' && job.workStartedAt) {
        const startMs = new Date(job.workStartedAt).getTime();
        const elapsedSeconds = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
        setTimerSeconds(elapsedSeconds);
        setIsTimerRunning(!spec.activeBreak);
      } else {
        setTimerSeconds(0);
        setIsTimerRunning(false);
      }
    }
  }, [job]);

  // Live timer interval (runs only when timer is running and not on active break)
  useEffect(() => {
    if (isTimerRunning && !activeBreak) {
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
  }, [isTimerRunning, activeBreak]);

  // Live break timer interval (counts duration while on pause)
  useEffect(() => {
    if (activeBreak) {
      breakIntervalRef.current = setInterval(() => {
        setBreakTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (breakIntervalRef.current) {
        clearInterval(breakIntervalRef.current);
      }
    }
    return () => {
      if (breakIntervalRef.current) {
        clearInterval(breakIntervalRef.current);
      }
    };
  }, [activeBreak]);

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

  // Rate is only populated if officially set post-completion
  const workerRate = localJob.workerUnitWage || 0;

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

  // 3. Worker Pauses Timer for Break (Lunch, Breakfast, Emergency)
  const handlePauseForBreak = async (reason: string, notes?: string) => {
    if (!token || !localJob) return;
    setIsSubmittingAction(true);
    setActionError(null);
    try {
      const res = await EnquiryService.pauseWorkTimer(localJob.id, { reason, notes }, token);
      setLocalJob(res.enquiry);
      setActiveBreak({ reason, startedAt: new Date().toISOString(), notes });
      setBreakTimerSeconds(0);
      setShowBreakSelector(false);
      setIsPauseConfirmOpen(false);
      setBreakNotes('');
      onJobUpdated?.();
    } catch (err: any) {
      setActionError(err?.message || 'Failed to pause timer for break');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // 4. Worker Resumes Timer After Break
  const handleResumeFromBreak = async () => {
    if (!token || !localJob) return;
    setIsSubmittingAction(true);
    setActionError(null);
    try {
      const res = await EnquiryService.resumeWorkTimer(localJob.id, {}, token);
      setLocalJob(res.enquiry);
      setActiveBreak(null);
      setBreakTimerSeconds(0);
      setIsTimerRunning(true);
      setIsResumeConfirmOpen(false);
      onJobUpdated?.();
    } catch (err: any) {
      setActionError(err?.message || 'Failed to resume work timer');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // 5. Worker Saves Temporary Draft (Count / units progress)
  const handleSaveDraftProgress = async () => {
    if (!token || !localJob) return;
    setIsSavingDraft(true);
    setActionError(null);
    try {
      const res = await EnquiryService.saveWorkDraft(
        localJob.id,
        {
          completedUnits: unitCount,
          specificationDetails: {
            crownCleaningDone,
            beetleMedicineApplied,
          },
        },
        token,
      );
      setLocalJob(res.enquiry);
      const savedTime = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      setLastDraftSavedTime(savedTime);
      onJobUpdated?.();
    } catch (err: any) {
      setActionError(err?.message || 'Failed to save progress draft');
    } finally {
      setIsSavingDraft(false);
    }
  };

  // 6. Worker completes work (Unit count or hourly duration logged)
  const handleCompleteWork = async () => {
    if (!token || !localJob) return;
    setIsSubmittingAction(true);
    setActionError(null);

    try {
      if (isHourly) {
        const spec = (localJob.specificationDetails as any) || {};
        const breaks = Array.isArray(spec.breaks) ? spec.breaks : [];
        const recordedBreakMins = breaks.reduce(
          (acc: number, b: any) => acc + (b.durationMinutes || 0),
          0,
        );
        const ongoingBreakMins = activeBreak ? Math.max(1, Math.round(breakTimerSeconds / 60)) : 0;
        const totalBreakMinutes = recordedBreakMins + ongoingBreakMins;

        const elapsedMinutes = Math.max(1, Math.round(timerSeconds / 60));
        const netDurationMinutes = Math.max(1, elapsedMinutes - totalBreakMinutes);
        const netHoursDecimal = Math.round((netDurationMinutes / 60) * 10) / 10;

        const res = await EnquiryService.stopWorkTimer(
          localJob.id,
          {
            durationMinutes: netDurationMinutes,
            completedUnits: netHoursDecimal,
            completionNotes:
              completionNotes.trim() ||
              `Work completed. Net work time: ${Math.floor(netDurationMinutes / 60)}h ${netDurationMinutes % 60}m (${totalBreakMinutes}m breaks deducted).`,
          },
          token,
        );
        setIsTimerRunning(false);
        setActiveBreak(null);
        setLocalJob(res.enquiry);
        setIsStopTimerConfirmOpen(false);
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
        setIsCompleteCountConfirmOpen(false);
      }
      onJobUpdated?.();
    } catch (err: any) {
      if (onUpdateStatus) {
        await onUpdateStatus(localJob.id, 'COMPLETED');
        setIsStopTimerConfirmOpen(false);
        setIsCompleteCountConfirmOpen(false);
      } else {
        setActionError(err?.message || 'Failed to complete work ticket');
      }
    } finally {
      setIsSubmittingAction(false);
    }
  };



  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-in fade-in select-none">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg bg-[#111827] rounded-2xl sm:rounded-[28px] p-3.5 sm:p-6 shadow-[0_25px_70px_rgba(0,0,0,0.65)] border border-slate-700/80 flex flex-col gap-3.5 sm:gap-4 text-slate-200 z-10 animate-in zoom-in-95 duration-200 max-h-[92vh] sm:max-h-[88vh] overflow-y-auto custom-scrollbar min-w-0">
        {/* Service Banner Image */}
        <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-slate-700/80 shadow-md">
          <Image
            src={getServiceBanner(localJob.serviceName)}
            alt={localJob.serviceName}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/40 to-transparent" />
          <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-end justify-between">
            <span className="font-mono text-xs font-bold text-[#34d399] bg-[#2A835F]/40 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-[#2A835F]/50">
              {localJob.trackingNumber}
            </span>
            <span className="text-[10px] font-bold text-emerald-300 bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20">
              Kasaragod Squad
            </span>
          </div>
        </div>

        {/* Service Execution Mode Badge Banner */}
        {isHourly ? (
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/35">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-black text-amber-300 block uppercase tracking-wider">
                  ⏱️ Machinery Timer Mode (JCB / Equipment)
                </span>
                <span className="text-[11px] text-amber-200/70 block">
                  On-site equipment chronometer. Break time excluded from billing.
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Pricing</span>
              <span className="text-[11px] font-semibold text-amber-300/90">Post-Completion</span>
            </div>
          </div>
        ) : isCoconut ? (
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent border border-emerald-500/35">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                <TreePalm className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-black text-emerald-300 block uppercase tracking-wider">
                  🌴 Cococare Tree Count Mode
                </span>
                <span className="text-[11px] text-emerald-200/70 block">
                  തെങ്ങ് കയറ്റം &amp; വിളവെടുപ്പ് • Log harvested palms &amp; plant care.
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Pricing</span>
              <span className="text-[11px] font-semibold text-emerald-300/90">Post-Completion</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-sky-500/20 via-sky-500/10 to-transparent border border-sky-500/35">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-400 flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-black text-sky-300 block uppercase tracking-wider">
                  📐 {unitLabel} Measurement Count Mode
                </span>
                <span className="text-[11px] text-sky-200/70 block">
                  Log completed {unitLabel} units for job settlement.
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Pricing</span>
              <span className="text-[11px] font-semibold text-sky-300/90">Post-Completion</span>
            </div>
          </div>
        )}

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

        {/* ----------------- OFFICE DESK COORDINATOR CARD ----------------- */}
        {(() => {
          const spec = (localJob.specificationDetails as any) || {};
          const officeName: string = localJob.officeStaff?.name || spec.coordinatorName || '';
          const officePhone: string = localJob.officeStaff?.phone || spec.coordinatorPhone || '';
          if (!officeName && !officePhone) return null;
          return (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-950/60 to-slate-900/80 border border-blue-500/25 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="p-1.5 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block">Office Coordinator</span>
                  <span className="text-xs font-semibold text-white truncate block">{officeName || 'KK Group Office'}</span>
                  {officePhone && (
                    <span className="text-[11px] text-blue-200/70">{officePhone}</span>
                  )}
                </div>
              </div>
              {officePhone && (
                <a
                  href={`tel:${officePhone}`}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all active:scale-95 shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Office</span>
                </a>
              )}
            </div>
          );
        })()}

        {/* ----------------- CO-WORKING SQUAD MEMBERS CARD ----------------- */}
        {(() => {
          const spec = (localJob.specificationDetails as any) || {};
          const squadMembers: Array<{ id: string; name: string; phone?: string; role?: string }> =
            Array.isArray(spec.squadMembers) ? spec.squadMembers : [];
          if (squadMembers.length <= 1) return null;

          return (
            <div className="rounded-2xl bg-gradient-to-br from-violet-950/50 to-slate-900/80 border border-violet-500/25 overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => setIsSquadDropdownOpen((prev) => !prev)}
                className="w-full p-3.5 flex items-center justify-between gap-2 hover:bg-violet-900/20 text-left transition-colors cursor-pointer"
                aria-expanded={isSquadDropdownOpen}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="p-1.5 rounded-xl bg-violet-500/20 text-violet-400 shrink-0">
                    <Users className="w-4 h-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-violet-300">
                        {language === 'ml' ? 'സഹപ്രവർത്തകർ' : 'Squad Co-Workers'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-violet-500/30 text-violet-200 border border-violet-500/40 text-[10px] font-bold">
                        {squadMembers.length} {language === 'ml' ? 'പേർ' : 'Workers'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block truncate">
                      {language === 'ml' ? 'ഗ്രൂപ്പ് വർക്ക് • സഹപ്രവർത്തകരെ കാണുക' : 'Group Work • Tap to view all co-workers'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-violet-300 shrink-0">
                  <span>{isSquadDropdownOpen ? (language === 'ml' ? 'മറയ്ക്കുക' : 'Hide') : (language === 'ml' ? 'കാണുക' : 'View All')}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isSquadDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {isSquadDropdownOpen && (
                <div className="p-3.5 pt-0 space-y-1.5 border-t border-violet-500/20 mt-1">
                  <div className="space-y-1.5 pt-2">
                    {squadMembers.map((member) => {
                      const isCurrentUser = member.id === user?.id;
                      return (
                        <div key={member.id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-black/30 border border-slate-800">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-7 h-7 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                              <User className="w-3.5 h-3.5 text-violet-300" />
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-white block truncate">{member.name}</span>
                                {isCurrentUser && (
                                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-violet-500/30 text-violet-200 border border-violet-500/40">
                                    {language === 'ml' ? 'നിങ്ങൾ' : 'You'}
                                  </span>
                                )}
                              </div>
                              {member.role && (
                                <span className="text-[10px] text-violet-300/70">{member.role}</span>
                              )}
                            </div>
                          </div>
                          {member.phone && !isCurrentUser && (
                            <a
                              href={`tel:${member.phone}`}
                              className="shrink-0 p-1.5 px-2.5 rounded-lg bg-violet-600/30 hover:bg-violet-600/50 text-violet-200 hover:text-white transition-colors flex items-center gap-1 text-[11px] font-bold"
                            >
                              <Phone className="w-3 h-3 text-violet-300" />
                              <span>Call</span>
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

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
                    Coconut Palm Harvesting
                  </h4>
                  <span className="text-[11px] text-slate-400">ഈന്തപ്പന വിളവെടുക്കൽ</span>
                </div>
              </div>

              {isCompleted && localJob.totalCalculatedWage && localJob.totalCalculatedWage > 0 ? (
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Wage Payout</span>
                  <span className="font-mono text-base font-black text-[#34d399]">
                    ₹{localJob.totalCalculatedWage.toLocaleString('en-IN')}
                  </span>
                </div>
              ) : (
                <span className="text-[10px] text-slate-400 italic bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700">
                  {isCompleted ? 'Payout Pending Office Approval' : 'Wage set after completion'}
                </span>
              )}
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

            {/* Save Draft Button for Count Work */}
            {isInProgress && !isCompleted && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-700/40">
                <span className="text-[11px] text-slate-400">
                  {lastDraftSavedTime ? (
                    <span className="text-emerald-400">✓ Draft saved at {lastDraftSavedTime}</span>
                  ) : (
                    'Save progress to protect count'
                  )}
                </span>
                <button
                  type="button"
                  onClick={handleSaveDraftProgress}
                  disabled={isSavingDraft || isSubmittingAction}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-900/50 hover:bg-emerald-800/60 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSavingDraft ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Draft</span>
                </button>
              </div>
            )}
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
                  JCB / Machinery Chronometer
                </span>
              </div>
              {isCompleted && localJob.totalCalculatedWage && localJob.totalCalculatedWage > 0 ? (
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  ₹{localJob.totalCalculatedWage.toLocaleString('en-IN')}
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 italic bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700">
                  {isCompleted ? 'Payout Pending Office Approval' : 'Wage set after completion'}
                </span>
              )}
            </div>

            {/* Active Break Banner */}
            {activeBreak && (
              <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-orange-900/40 border border-orange-500/40">
                <div className="flex items-center gap-2">
                  {activeBreak.reason === 'LUNCH' ? (
                    <Utensils className="w-4 h-4 text-orange-400" />
                  ) : activeBreak.reason === 'BREAKFAST' ? (
                    <Coffee className="w-4 h-4 text-orange-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                  )}
                  <div className="text-left">
                    <span className="text-xs font-bold text-orange-300 block">
                      {activeBreak.reason === 'LUNCH' ? '🍱 Lunch Break' : activeBreak.reason === 'BREAKFAST' ? '☕ Tea / Breakfast Break' : '🚨 Emergency / Rain Break'}
                    </span>
                    <span className="text-[10px] text-orange-200/60 font-mono">{formatTimer(breakTimerSeconds)} elapsed</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleResumeFromBreak}
                  disabled={isSubmittingAction}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-60"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Resume Work</span>
                </button>
              </div>
            )}

            <div className="font-mono text-3xl sm:text-4xl font-black text-white tracking-widest py-1 drop-shadow">
              {formatTimer(timerSeconds)}
            </div>

            {/* 3-Tier Time Metrics Strip: Net Work • Break Deducted • Gross On-Site */}
            {(() => {
              const spec = (localJob.specificationDetails as any) || {};
              const breaks = Array.isArray(spec.breaks) ? spec.breaks : [];
              const totalBreakMins = spec.totalBreakMinutes ?? breaks.reduce((acc: number, b: any) => acc + (b.durationMinutes || 0), 0);
              const actualWorkMins = spec.actualWorkMinutes ?? localJob.workDurationMinutes ?? Math.round(timerSeconds / 60);
              const grossMins = spec.grossDurationMinutes ?? (actualWorkMins + totalBreakMins);

              return (
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/30">
                    <span className="text-[10px] text-emerald-400/90 uppercase font-bold block truncate">
                      Net Labor Time
                    </span>
                    <span className="font-mono text-sm sm:text-base font-black text-white">
                      {isTimerRunning && !activeBreak ? formatTimer(timerSeconds) : `${actualWorkMins}m`}
                    </span>
                    <span className="text-[9px] text-emerald-300/60 block mt-0.5">യഥാർത്ഥ ജോലി</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/30">
                    <span className="text-[10px] text-amber-400/90 uppercase font-bold block truncate">
                      Break Deducted
                    </span>
                    <span className="font-mono text-sm sm:text-base font-black text-amber-300">
                      {activeBreak ? formatTimer(breakTimerSeconds) : `${totalBreakMins}m`}
                    </span>
                    <span className="text-[9px] text-amber-300/60 block mt-0.5">
                      {breaks.length} break{breaks.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block truncate">
                      Gross On-Site
                    </span>
                    <span className="font-mono text-sm sm:text-base font-black text-slate-200">
                      {grossMins}m
                    </span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">ആകെ സമയം</span>
                  </div>
                </div>
              );
            })()}

            <div className="flex items-center justify-between text-[11px] bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800">
              <span className="text-slate-400">
                {activeBreak ? (
                  <span className="inline-flex items-center gap-1.5 text-orange-400 font-bold">
                    <Pause className="w-3 h-3" />
                    On Break — Timer Paused
                  </span>
                ) : isTimerRunning ? (
                  <span className="inline-flex items-center gap-1.5 text-[#34d399] font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#34d399] animate-ping" />
                    Live Working Meter Active
                  </span>
                ) : isCompleted ? (
                  <span className="text-[#34d399] font-semibold">
                    Completed: {localJob.workDurationMinutes || Math.round(timerSeconds / 60)} min logged
                  </span>
                ) : (
                  'Timer starts upon arriving at site'
                )}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {(() => {
                  const spec = (localJob.specificationDetails as any) || {};
                  const breaks = Array.isArray(spec.breaks) ? spec.breaks : [];
                  const totalBreakMins = spec.totalBreakMinutes ?? breaks.reduce((acc: number, b: any) => acc + (b.durationMinutes || 0), 0);
                  return totalBreakMins > 0 ? `${totalBreakMins}m breaks logged` : 'No breaks yet';
                })()}
              </span>
            </div>

            {/* Break Controls — opens dedicated confirmation modal */}
            {isInProgress && !isCompleted && isTimerRunning && !activeBreak && (
              <button
                type="button"
                onClick={() => setIsPauseConfirmOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-98"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Timer for Break (ബ്രേക്ക് എടുക്കുക)</span>
              </button>
            )}

            {/* Resume Control if active break */}
            {isInProgress && !isCompleted && activeBreak && (
              <button
                type="button"
                onClick={() => setIsResumeConfirmOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition-all cursor-pointer shadow-md shadow-blue-600/30 active:scale-98"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Resume Work Timer (പണി പുനരാരംഭിക്കുക)</span>
              </button>
            )}

            {/* Comprehensive Breaks Log Archive */}
            {(() => {
              const spec = (localJob.specificationDetails as any) || {};
              const breaks = Array.isArray(spec.breaks) ? spec.breaks : [];
              if (breaks.length === 0) return null;

              const getBreakBadge = (reason: string) => {
                const r = (reason || '').toUpperCase();
                if (r.includes('LUNCH') || r.includes('ഊണ്')) return { label: 'Lunch Break (ഉച്ചഭക്ഷണം)', icon: '🍱' };
                if (r.includes('BREAKFAST') || r.includes('പ്രാതൽ')) return { label: 'Tea / Breakfast (പ്രാതൽ)', icon: '☕' };
                if (r.includes('TEA') || r.includes('ചായ')) return { label: 'Tea Break (ചായ കുടി)', icon: '🫖' };
                if (r.includes('RAIN') || r.includes('മഴ') || r.includes('WEATHER')) return { label: 'Rain / Weather (മഴ തടസ്സം)', icon: '🌧️' };
                if (r.includes('FUEL') || r.includes('REPAIR') || r.includes('കേടുപാട്')) return { label: 'Refuel / Repair (അറ്റകുറ്റപ്പണി)', icon: '⛽' };
                return { label: reason || 'Break (ബ്രേക്ക്)', icon: '⏸️' };
              };

              return (
                <div className="text-left border-t border-slate-700/40 pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-amber-400 uppercase font-black tracking-wider flex items-center gap-1.5">
                      <Coffee className="w-3.5 h-3.5" />
                      <span>Break Records History ({breaks.length})</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Non-billable time</span>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                    {breaks.map((b: any, i: number) => {
                      const badge = getBreakBadge(b.reason);
                      const startStr = b.startedAt ? new Date(b.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                      const endStr = b.endedAt ? new Date(b.endedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                      const dur = b.durationMinutes !== undefined ? `${b.durationMinutes}m` : 'Ongoing';

                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm shrink-0">{badge.icon}</span>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-200 block truncate text-[11px]">
                                {badge.label}
                              </span>
                              {(startStr || endStr) && (
                                <span className="text-[10px] text-slate-500 font-mono block">
                                  {startStr} {endStr ? `→ ${endStr}` : '(Active)'}
                                </span>
                              )}
                              {b.notes && (
                                <span className="text-[10px] text-slate-400 italic block truncate">
                                  &quot;{b.notes}&quot;
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="font-mono text-xs font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 shrink-0">
                            {dur}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
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
                  {unitLabel} Measurement
                </span>
              </div>
              {isCompleted && localJob.totalCalculatedWage && localJob.totalCalculatedWage > 0 ? (
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  ₹{localJob.totalCalculatedWage.toLocaleString('en-IN')}
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 italic bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700">
                  {isCompleted ? 'Payout Pending Office Approval' : 'Wage set after completion'}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
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

            {/* Save Draft Button */}
            {isInProgress && !isCompleted && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-700/40">
                <span className="text-[11px] text-slate-400">
                  {lastDraftSavedTime ? (
                    <span className="text-emerald-400">✓ Saved at {lastDraftSavedTime}</span>
                  ) : (
                    'Save progress temporarily'
                  )}
                </span>
                <button
                  type="button"
                  onClick={handleSaveDraftProgress}
                  disabled={isSavingDraft || isSubmittingAction}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-900/50 hover:bg-emerald-800/60 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSavingDraft ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Draft</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ----------------- UNIVERSAL TIME & BREAK RECORDS CARD (NON-HOURLY JOBS) ----------------- */}
        {!isHourly && (localJob.workStartedAt || localJob.workDurationMinutes || isCompleted || ((localJob.specificationDetails as any)?.breaks && (localJob.specificationDetails as any).breaks.length > 0)) && (() => {
          const spec = (localJob.specificationDetails as any) || {};
          const breaks = Array.isArray(spec.breaks) ? spec.breaks : [];
          const totalBreakMins = spec.totalBreakMinutes ?? breaks.reduce((acc: number, b: any) => acc + (b.durationMinutes || 0), 0);
          const actualWorkMins = spec.actualWorkMinutes ?? localJob.workDurationMinutes ?? 0;
          const grossMins = spec.grossDurationMinutes ?? (actualWorkMins + totalBreakMins);

          const getBreakBadge = (reason: string) => {
            const r = (reason || '').toUpperCase();
            if (r.includes('LUNCH') || r.includes('ഊണ്')) return { label: 'Lunch Break (ഉച്ചഭക്ഷണം)', icon: '🍱' };
            if (r.includes('BREAKFAST') || r.includes('പ്രാതൽ')) return { label: 'Tea / Breakfast (പ്രാതൽ)', icon: '☕' };
            if (r.includes('TEA') || r.includes('ചായ')) return { label: 'Tea Break (ചായ കുടി)', icon: '🫖' };
            if (r.includes('RAIN') || r.includes('മഴ') || r.includes('WEATHER')) return { label: 'Rain / Weather (മഴ തടസ്സം)', icon: '🌧️' };
            if (r.includes('FUEL') || r.includes('REPAIR') || r.includes('കേടുപാട്')) return { label: 'Refuel / Repair (അറ്റകുറ്റപ്പണി)', icon: '⛽' };
            return { label: reason || 'Break (ബ്രേക്ക്)', icon: '⏸️' };
          };

          return (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#121B28] border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Clock className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Field Time &amp; Break Records
                    </h4>
                    <span className="text-[10px] text-slate-400">സമയവും ബ്രേക്ക് രേഖകളും</span>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-emerald-400 border border-emerald-500/30">
                  {isCompleted ? '✓ Work Concluded' : 'Active Execution'}
                </span>
              </div>

              {/* 3 Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-400/90 uppercase font-bold block truncate">
                    Net Labor Time
                  </span>
                  <span className="font-mono text-sm sm:text-base font-black text-white">
                    {actualWorkMins > 0 ? `${actualWorkMins}m` : (timerSeconds > 0 ? formatTimer(timerSeconds) : '—')}
                  </span>
                  <span className="text-[9px] text-emerald-300/60 block mt-0.5">യഥാർത്ഥ ജോലി</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/30">
                  <span className="text-[10px] text-amber-400/90 uppercase font-bold block truncate">
                    Break Deducted
                  </span>
                  <span className="font-mono text-sm sm:text-base font-black text-amber-300">
                    {totalBreakMins}m
                  </span>
                  <span className="text-[9px] text-amber-300/60 block mt-0.5">
                    {breaks.length} break{breaks.length === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block truncate">
                    Gross On-Site
                  </span>
                  <span className="font-mono text-sm sm:text-base font-black text-slate-200">
                    {grossMins > 0 ? `${grossMins}m` : '—'}
                  </span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">ആകെ സമയം</span>
                </div>
              </div>

              {/* Break Log Details (if any breaks exist) */}
              {breaks.length > 0 && (
                <div className="text-left border-t border-slate-700/40 pt-2.5 space-y-1.5">
                  <span className="text-[10px] text-amber-400 uppercase font-bold flex items-center gap-1.5">
                    <Coffee className="w-3.5 h-3.5" />
                    <span>Break Records History ({breaks.length})</span>
                  </span>

                  <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                    {breaks.map((b: any, i: number) => {
                      const badge = getBreakBadge(b.reason);
                      const startStr = b.startedAt ? new Date(b.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                      const endStr = b.endedAt ? new Date(b.endedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                      const dur = b.durationMinutes !== undefined ? `${b.durationMinutes}m` : 'Ongoing';

                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm shrink-0">{badge.icon}</span>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-200 block truncate text-[11px]">
                                {badge.label}
                              </span>
                              {(startStr || endStr) && (
                                <span className="text-[10px] text-slate-500 font-mono block">
                                  {startStr} {endStr ? `→ ${endStr}` : '(Active)'}
                                </span>
                              )}
                              {b.notes && (
                                <span className="text-[10px] text-slate-400 italic block truncate">
                                  &quot;{b.notes}&quot;
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="font-mono text-xs font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 shrink-0">
                            {dur}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

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

        {/* ----------------- FINALIZED PAYOUT CARD (worker sees after wage is set by admin) ----------------- */}
        {isCompleted && (() => {
          const spec = (localJob.specificationDetails as any) || {};
          const finalWage = localJob.totalCalculatedWage;
          const finalUnits = localJob.completedUnits;
          const unitLbl = localJob.unitLabel || unitLabel;
          const wageSet = finalWage && finalWage > 0;

          if (wageSet) {
            return (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-900/80 border border-emerald-500/40 space-y-2">
                <div className="flex items-center gap-2 border-b border-emerald-500/20 pb-2.5">
                  <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <IndianRupee className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">Your Finalized Payout</span>
                    <span className="text-[11px] text-emerald-200/60">Confirmed by KK Group Office</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    {finalUnits && (
                      <span className="text-[11px] text-slate-400 block">
                        {finalUnits} {unitLbl}(s) completed
                      </span>
                    )}
                    {localJob.workDurationMinutes && (
                      <span className="text-[11px] text-slate-400 block">
                        {Math.floor(localJob.workDurationMinutes / 60)}h {localJob.workDurationMinutes % 60}m recorded
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-400/70 uppercase font-bold block">Total Payout</span>
                    <span className="font-mono text-2xl font-black text-emerald-400">
                      ₹{finalWage.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center gap-3">
              <span className="p-1.5 rounded-xl bg-slate-700 text-slate-400 shrink-0">
                <IndianRupee className="w-4 h-4" />
              </span>
              <div>
                <span className="text-xs font-semibold text-slate-300 block">Payout Pending Confirmation</span>
                <span className="text-[11px] text-slate-500">Office team will finalize your wage shortly. Check back later.</span>
              </div>
            </div>
          );
        })()}

        {/* Action Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-800 mt-1 min-w-0">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isCompleted
                  ? 'bg-emerald-500'
                  : isInProgress
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-[#2A835F]'
              }`}
            />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {isCompleted ? t('completedBadge') : isInProgress ? t('inProgress') : t('assigned')}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto justify-stretch sm:justify-end">
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

            {/* 3a. If in progress & hourly & timer running: "Pause for Break" */}
            {isInProgress && isHourly && isTimerRunning && !activeBreak && (
              <button
                type="button"
                onClick={() => setIsPauseConfirmOpen(true)}
                className="bg-amber-600 hover:bg-amber-500 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Break</span>
              </button>
            )}

            {/* 3b. If on break: "Resume Work" shortcut */}
            {isInProgress && activeBreak && (
              <button
                type="button"
                onClick={() => setIsResumeConfirmOpen(true)}
                disabled={isSubmittingAction}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-60 active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Resume Work</span>
              </button>
            )}

            {/* 3c. If in progress: "Complete Work & Submit Specifications" */}
            {isInProgress && (
              <button
                type="button"
                onClick={() => {
                  if (isHourly) {
                    setIsStopTimerConfirmOpen(true);
                  } else {
                    setIsCompleteCountConfirmOpen(true);
                  }
                }}
                disabled={isSubmittingAction || isActing}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-60 active:scale-95"
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

        {/* ----------------- MODAL 1: PAUSE TIMER CONFIRMATION MODAL ----------------- */}
        {isPauseConfirmOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none">
            <div className="relative w-full max-w-md bg-[#16202E] rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-amber-500/50 shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-slate-200 space-y-3.5 sm:space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                  <Pause className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Pause Timer for Break?
                  </h3>
                  <p className="text-xs text-amber-300/80">
                    ബ്രേക്ക് സമയം രേഖപ്പെടുത്തുക
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-750 flex items-center justify-between text-xs">
                <span className="text-slate-400">Current Work Meter:</span>
                <span className="font-mono text-base font-black text-amber-400">{formatTimer(timerSeconds)}</span>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                  Select Break Reason:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'BREAKFAST', icon: '☕', label: 'Breakfast / Tea', ml: 'രാവിലത്തെ ചായ' },
                    { key: 'LUNCH', icon: '🍱', label: 'Lunch Break', ml: 'ഉച്ചഭക്ഷണം' },
                    { key: 'TEA', icon: '🫖', label: 'Evening Tea', ml: 'വൈകുന്നേരത്തെ ചായ' },
                    { key: 'MAINTENANCE', icon: '⛽', label: 'Refuel / Repair', ml: 'ഇന്ധനം / മെഷീൻ' },
                    { key: 'WEATHER', icon: '🌧️', label: 'Rain / Site Delay', ml: 'മഴ / കാലാവസ്ഥ' },
                    { key: 'OTHER', icon: '❓', label: 'Other Delay', ml: 'മറ്റ് കാരണങ്ങൾ' },
                  ].map(({ key, icon, label, ml }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedBreakReason(key)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedBreakReason === key
                          ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-sm ring-1 ring-amber-500/50'
                          : 'bg-slate-900/70 border-slate-750 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <span className="text-lg">{icon}</span>
                      <div className="min-w-0">
                        <span className="text-xs font-bold block truncate">{label}</span>
                        <span className="text-[10px] text-slate-400 block truncate">{ml}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400 block">
                  Break Notes (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Taking 30m lunch break, machine parked safely"
                  value={breakNotes}
                  onChange={(e) => setBreakNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="text-[11px] text-amber-200/70 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl">
                ⚠️ The working timer will freeze. Break time is excluded from customer billing and finalized during payout.
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setIsPauseConfirmOpen(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Keep Working
                </button>
                <button
                  type="button"
                  onClick={() => handlePauseForBreak(selectedBreakReason, breakNotes)}
                  disabled={isSubmittingAction}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {isSubmittingAction ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Pause className="w-3.5 h-3.5" />
                  )}
                  <span>Confirm Pause</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- MODAL 2: STOP TIMER & COMPLETE CONFIRMATION MODAL ----------------- */}
        {isStopTimerConfirmOpen && (() => {
          const spec = (localJob.specificationDetails as any) || {};
          const breaks = Array.isArray(spec.breaks) ? spec.breaks : [];
          const recordedBreakMins = breaks.reduce((acc: number, b: any) => acc + (b.durationMinutes || 0), 0);
          const ongoingBreakMins = activeBreak ? Math.max(1, Math.round(breakTimerSeconds / 60)) : 0;
          const totalBreakMinutes = recordedBreakMins + ongoingBreakMins;

          const elapsedMinutes = Math.max(1, Math.round(timerSeconds / 60));
          const netDurationMinutes = Math.max(1, elapsedMinutes - totalBreakMinutes);
          const netHoursDecimal = Math.round((netDurationMinutes / 60) * 10) / 10;
          const estimatedWage = Math.round(netHoursDecimal * workerRate);

          return (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none">
              <div className="relative w-full max-w-md bg-[#16202E] rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-emerald-500/50 shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-slate-200 space-y-3.5 sm:space-y-4 animate-in zoom-in-95 duration-150">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                    <StopCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Stop Timer &amp; Complete Job?
                    </h3>
                    <p className="text-xs text-emerald-300/80">
                      ജോലി പൂർത്തിയാക്കി സമർപ്പിക്കുക
                    </p>
                  </div>
                </div>

                {/* Machinery Summary Card */}
                <div className="bg-slate-900/90 border border-slate-750 rounded-2xl p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Gross Machine Time Elapsed:</span>
                    <span className="font-mono font-bold text-white">{Math.floor(elapsedMinutes / 60)}h {elapsedMinutes % 60}m</span>
                  </div>
                  <div className="flex items-center justify-between text-amber-400">
                    <span>Break Deductions ({breaks.length + (activeBreak ? 1 : 0)} breaks):</span>
                    <span className="font-mono font-bold">-{totalBreakMinutes} mins</span>
                  </div>
                  <div className="flex items-center justify-between text-white border-t border-slate-800 pt-2 font-bold">
                    <span>Net Billable Work Duration:</span>
                    <span className="font-mono text-emerald-400 text-sm">{netHoursDecimal} Hours ({netDurationMinutes} mins)</span>
                  </div>
                  <div className="text-[11px] text-emerald-300/80 bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-xl">
                    ℹ️ Payout will be finalized and assigned by the office desk coordinator after this work ticket is submitted.
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-400 block">
                    Work Completion Remarks:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Ground leveling and drainage digging completed smoothly."
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-750 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsStopTimerConfirmOpen(false)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    Continue Work
                  </button>
                  <button
                    type="button"
                    onClick={handleCompleteWork}
                    disabled={isSubmittingAction}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {isSubmittingAction ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5" />
                    )}
                    <span>Stop &amp; Complete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ----------------- MODAL 3: SUBMIT COUNT & COMPLETE CONFIRMATION MODAL ----------------- */}
        {isCompleteCountConfirmOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none">
            <div className="relative w-full max-w-md bg-[#16202E] rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-emerald-500/50 shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-slate-200 space-y-3.5 sm:space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                  {isCoconut ? <TreePalm className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Confirm &amp; Submit Harvest Count?
                  </h3>
                  <p className="text-xs text-emerald-300/80">
                    വിളവെടുപ്പ് എണ്ണം സ്ഥിരീകരിക്കുക
                  </p>
                </div>
              </div>

              {/* Count Summary Card */}
              <div className="bg-slate-900/90 border border-slate-750 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between text-white font-bold">
                  <span>{isCoconut ? 'Total Coconut Trees Plucked' : `Completed ${unitLabel}s`}:</span>
                  <span className="font-mono text-base text-emerald-400">{unitCount} {isCoconut ? 'Trees' : unitLabel}</span>
                </div>
                {isCoconut && (
                  <div className="py-2 border-y border-slate-800 space-y-1 text-slate-300">
                    <div className="flex items-center justify-between">
                      <span>Crown Cleaning &amp; Frond Pruning:</span>
                      <span className={crownCleaningDone ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                        {crownCleaningDone ? '✓ Completed' : '✕ Skipped'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Rhinoceros Beetle Powder:</span>
                      <span className={beetleMedicineApplied ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                        {beetleMedicineApplied ? '✓ Applied' : '✕ Skipped'}
                      </span>
                    </div>
                  </div>
                )}
                <div className="text-[11px] text-emerald-300/80 bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-xl">
                  ℹ️ Payout will be finalized and assigned by the office desk coordinator after this harvest count is submitted.
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400 block">
                  Completion Remarks (Optional):
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Good yield, tall palms harvested safely."
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-750 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCompleteCountConfirmOpen(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Edit Count
                </button>
                <button
                  type="button"
                  onClick={handleCompleteWork}
                  disabled={isSubmittingAction}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {isSubmittingAction ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5" />
                  )}
                  <span>Confirm &amp; Complete</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- MODAL 4: RESUME TIMER CONFIRMATION MODAL ----------------- */}
        {isResumeConfirmOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none">
            <div className="relative w-full max-w-md bg-[#16202E] rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-blue-500/50 shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-slate-200 space-y-3.5 sm:space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0">
                  <Play className="w-6 h-6 fill-blue-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Resume Work Timer?
                  </h3>
                  <p className="text-xs text-blue-300/80">
                    ബ്രേക്ക് അവസാനിപ്പിച്ച് പണി പുനരാരംഭിക്കുക
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-750 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Current Break Reason:</span>
                  <span className="font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/30">
                    {activeBreak?.reason || 'General Break'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Break Duration:</span>
                  <span className="font-mono text-base font-black text-blue-400">
                    {formatTimer(breakTimerSeconds)}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-blue-200/80 bg-blue-950/40 border border-blue-500/30 p-2.5 rounded-xl">
                ℹ️ The live working timer will resume immediately. Break duration is recorded and subtracted from final billable units.
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setIsResumeConfirmOpen(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Stay on Break
                </button>
                <button
                  type="button"
                  onClick={handleResumeFromBreak}
                  disabled={isSubmittingAction}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {isSubmittingAction ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-white" />
                  )}
                  <span>Confirm Resume</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
