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
  const { token } = useAuth();
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
    if (!token) return;
    setIsSubmittingAction(true);
    setActionError(null);

    try {
      if (isHourly) {
        const spec = (localJob.specificationDetails as any) || {};
        const breaks = Array.isArray(spec.breaks) ? spec.breaks : [];
        const totalBreakMinutes = breaks.reduce(
          (acc: number, b: any) => acc + (b.durationMinutes || 0),
          0,
        );
        const elapsedMinutes = Math.max(1, Math.round(timerSeconds / 60));
        const netDurationMinutes = Math.max(1, elapsedMinutes - totalBreakMinutes);

        const res = await EnquiryService.stopWorkTimer(
          localJob.id,
          {
            durationMinutes: netDurationMinutes,
            completedUnits: Math.round((netDurationMinutes / 60) * 10) / 10,
            completionNotes:
              completionNotes.trim() ||
              `Work completed. Net work time: ${Math.floor(netDurationMinutes / 60)}h ${netDurationMinutes % 60}m (${totalBreakMinutes}m breaks deducted).`,
          },
          token,
        );
        setIsTimerRunning(false);
        setActiveBreak(null);
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
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-violet-950/50 to-slate-900/80 border border-violet-500/25 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-violet-500/20 text-violet-400">
                  <Users className="w-4 h-4" />
                </span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-violet-300 block">Squad Team ({squadMembers.length} Workers)</span>
                  <span className="text-[11px] text-slate-400">കൂടെ ജോലി ചെയ്യുന്ന ടീം</span>
                </div>
              </div>
              <div className="space-y-1.5">
                {squadMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-black/30 border border-slate-800">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-7 h-7 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                        <User className="w-3.5 h-3.5 text-violet-300" />
                      </span>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-white block truncate">{member.name}</span>
                        {member.role && (
                          <span className="text-[10px] text-violet-300/70">{member.role}</span>
                        )}
                      </div>
                    </div>
                    {member.phone && (
                      <a
                        href={`tel:${member.phone}`}
                        className="shrink-0 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
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

              {isCompleted ? (
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Wage Payout</span>
                  <span className="font-mono text-base font-black text-[#34d399]">
                    ₹{(localJob.totalCalculatedWage || liveCalculatedWage).toLocaleString('en-IN')}
                  </span>
                </div>
              ) : (
                <span className="text-[10px] text-slate-500 italic bg-slate-800/60 px-2 py-1 rounded-lg border border-slate-700">
                  Wage after completion
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
              {isCompleted ? (
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  ₹{(localJob.totalCalculatedWage || liveCalculatedWage).toLocaleString('en-IN')}
                </span>
              ) : (
                <span className="text-[10px] text-slate-500 italic bg-slate-800/60 px-2 py-1 rounded-lg border border-slate-700">
                  Wage after completion
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
                  const totalBreakMins = breaks.reduce((acc: number, b: any) => acc + (b.durationMinutes || 0), 0);
                  return totalBreakMins > 0 ? `${totalBreakMins}m breaks` : 'No breaks yet';
                })()}
              </span>
            </div>

            {/* Break Controls — only when timer is running and not on break */}
            {isInProgress && !isCompleted && isTimerRunning && !activeBreak && !showBreakSelector && (
              <button
                type="button"
                onClick={() => setShowBreakSelector(true)}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause for Break</span>
              </button>
            )}

            {/* Break Type Selector */}
            {showBreakSelector && !activeBreak && (
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold block text-left">Select Break Reason:</span>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { key: 'LUNCH', icon: <Utensils className="w-4 h-4" />, label: 'Lunch', ml: 'ഉച്ചഭക്ഷണം' },
                    { key: 'BREAKFAST', icon: <Coffee className="w-4 h-4" />, label: 'Tea Break', ml: 'ചായ' },
                    { key: 'EMERGENCY', icon: <AlertTriangle className="w-4 h-4" />, label: 'Emergency', ml: 'അടിയന്തരം' },
                  ] as const).map(({ key, icon, label, ml }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => { handlePauseForBreak(key); setShowBreakSelector(false); }}
                      disabled={isSubmittingAction}
                      className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-orange-900/30 hover:bg-orange-900/50 border border-orange-500/30 text-orange-300 hover:text-orange-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-60"
                    >
                      {icon}
                      <span>{label}</span>
                      <span className="text-[9px] text-orange-400/60">{ml}</span>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setShowBreakSelector(false)}
                  className="text-[10px] text-slate-500 hover:text-slate-400 underline cursor-pointer w-full"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Breaks Log */}
            {(() => {
              const spec = (localJob.specificationDetails as any) || {};
              const breaks = Array.isArray(spec.breaks) ? spec.breaks : [];
              if (breaks.length === 0) return null;
              return (
                <div className="text-left border-t border-slate-700/40 pt-2 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Break Log:</span>
                  {breaks.map((b: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{b.reason === 'LUNCH' ? '🍱 Lunch' : b.reason === 'BREAKFAST' ? '☕ Tea' : '🚨 Emergency'}</span>
                      <span className="font-mono text-slate-500">{b.durationMinutes ? `${b.durationMinutes}m` : 'Ongoing'}</span>
                    </div>
                  ))}
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
              {isCompleted ? (
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  ₹{(localJob.totalCalculatedWage || liveCalculatedWage).toLocaleString('en-IN')}
                </span>
              ) : (
                <span className="text-[10px] text-slate-500 italic bg-slate-800/60 px-2 py-1 rounded-lg border border-slate-700">
                  Wage after completion
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

            {/* 3a. If in progress & hourly & timer running: "Pause for Break" */}
            {isInProgress && isHourly && isTimerRunning && !activeBreak && (
              <button
                type="button"
                onClick={() => setShowBreakSelector(true)}
                className="bg-orange-800/80 hover:bg-orange-700 text-orange-200 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </button>
            )}

            {/* 3b. If on break: "Resume Work" shortcut */}
            {isInProgress && isHourly && activeBreak && (
              <button
                type="button"
                onClick={handleResumeFromBreak}
                disabled={isSubmittingAction}
                className="bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Resume</span>
              </button>
            )}

            {/* 3c. If in progress: "Complete Work & Submit Specifications" */}
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
