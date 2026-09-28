'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  HardHat,
  Phone,
  Navigation,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  Plus,
  Minus,
  IndianRupee,
  Loader2,
  RefreshCw,
  LogOut,
  Calendar,
  Users,
  Briefcase,
  History,
  User as UserIcon,
  HelpCircle,
  Globe,
  MapPin,
  Banknote,
  QrCode,
  Building2,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';
import { useWorker } from '@/context/worker-context';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { useWorkerLanguage } from '@/context/worker-language-context';
import { WorkerShell } from '@/components/Worker';
import { ServiceEnquiry, EnquiryService } from '@/services';

export default function WorkerDashboardPage() {
  const { user, token, logout } = useAuth();
  const toast = useToast();
  const {
    jobs,
    loadingJobs,
    refreshJobs,
    isOnDuty,
    confirmDutyChange,
    togglingDuty,
    updateJobStatus,
  } = useWorker();

  const { language, setLanguage, t } = useWorkerLanguage();

  // Navigation tab: 'ACTIVE' | 'HISTORY' | 'PROFILE'
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY' | 'PROFILE'>('ACTIVE');

  // Active / Ongoing Job determination
  const ongoingJob = jobs.find((j) => j.status === 'IN_PROGRESS');
  const newlyAssignedJob = jobs.find((j) => j.status === 'ASSIGNED');
  const currentWork = ongoingJob || newlyAssignedJob;

  // Completed jobs
  const completedJobs = useMemo(
    () => jobs.filter((j) => j.status === 'COMPLETED'),
    [jobs]
  );

  // Total wages earned
  const totalEarned = useMemo(
    () =>
      completedJobs.reduce(
        (sum, j) => sum + (Number(j.totalCalculatedWage) || 0),
        0
      ),
    [completedJobs]
  );

  // Live Stopwatch Chronometer State
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [submittingAction, setSubmittingAction] = useState(false);

  // Completion Modal State
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [completionUnits, setCompletionUnits] = useState<number | ''>('');
  const [completionNotes, setCompletionNotes] = useState('');

  // Sync timer when in-progress job changes
  useEffect(() => {
    if (currentWork && currentWork.status === 'IN_PROGRESS') {
      const spec = (currentWork.specificationDetails as any) || {};
      const breakLogs = spec.breakLogs || [];
      const lastBreak = breakLogs[breakLogs.length - 1];
      const currentlyOnBreak = lastBreak && !lastBreak.resumedAt;
      setIsOnBreak(Boolean(currentlyOnBreak));

      // Calculate elapsed seconds from workStartedAt
      if (currentWork.workStartedAt) {
        const startMs = new Date(currentWork.workStartedAt).getTime();
        const nowMs = Date.now();
        const totalElapsedSec = Math.max(0, Math.floor((nowMs - startMs) / 1000));
        setTimerSeconds(totalElapsedSec);
      } else {
        setTimerSeconds((currentWork.workDurationMinutes || 0) * 60);
      }

      setCompletionUnits(currentWork.completedUnits ?? currentWork.estimatedUnits ?? 1);
    } else if (currentWork && currentWork.status === 'ASSIGNED') {
      setTimerSeconds(0);
      setIsOnBreak(false);
      setCompletionUnits(currentWork.completedUnits ?? currentWork.estimatedUnits ?? 1);
    }
  }, [currentWork]);

  // Live timer interval
  useEffect(() => {
    if (!currentWork || currentWork.status !== 'IN_PROGRESS' || isOnBreak) return;

    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentWork, isOnBreak]);

  // Format seconds into HH:MM:SS
  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Toggle Duty handler
  const handleToggleDuty = async () => {
    const targetStatus = isOnDuty ? 'OFF_DUTY' : 'AVAILABLE';
    await confirmDutyChange(targetStatus);
  };

  // Start Work On Site
  const handleStartWork = async (job: ServiceEnquiry) => {
    if (!token) return;
    setSubmittingAction(true);
    try {
      await EnquiryService.startWorkTimer(
        job.id,
        { notes: 'Worker started work timer on site' },
        token
      );
      toast.success(
        language === 'ml' ? 'പണി ആരംഭിച്ചു!' : 'Work Started!',
        language === 'ml'
          ? 'സൈറ്റിൽ പണി ആരംഭിച്ചു. ടൈമർ ഓടുന്നു.'
          : 'Work timer started on site.'
      );
      await refreshJobs();
    } catch (err: any) {
      toast.error('Failed to start work', err?.message || 'Could not start timer');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Pause / Break
  const handlePauseWork = async (job: ServiceEnquiry) => {
    if (!token) return;
    setSubmittingAction(true);
    try {
      await EnquiryService.pauseWorkTimer(
        job.id,
        { reason: 'Lunch / Tea Break' },
        token
      );
      setIsOnBreak(true);
      toast.info(
        language === 'ml' ? 'ബ്രേക്ക് എടുത്തു' : 'On Break',
        language === 'ml' ? 'ടൈമർ താൽക്കാലികമായി നിർത്തി.' : 'Timer paused for break.'
      );
      await refreshJobs();
    } catch (err: any) {
      toast.error('Failed to pause timer', err?.message);
    } finally {
      setSubmittingAction(false);
    }
  };

  // Resume Work
  const handleResumeWork = async (job: ServiceEnquiry) => {
    if (!token) return;
    setSubmittingAction(true);
    try {
      await EnquiryService.resumeWorkTimer(job.id, {}, token);
      setIsOnBreak(false);
      toast.success(
        language === 'ml' ? 'പണി തുടരുന്നു' : 'Work Resumed',
        language === 'ml' ? 'ബ്രേക്ക് കഴിഞ്ഞ് പണി പുനരാരംഭിച്ചു.' : 'Timer resumed.'
      );
      await refreshJobs();
    } catch (err: any) {
      toast.error('Failed to resume timer', err?.message);
    } finally {
      setSubmittingAction(false);
    }
  };

  // Confirm Complete Work
  const handleConfirmComplete = async () => {
    if (!currentWork || !token) return;
    setSubmittingAction(true);
    try {
      const durationMinutes = Math.max(1, Math.round(timerSeconds / 60));
      await EnquiryService.stopWorkTimer(
        currentWork.id,
        {
          durationMinutes,
          completedUnits: completionUnits === '' ? undefined : Number(completionUnits),
          completionNotes: completionNotes.trim() || undefined,
        },
        token
      );

      toast.success(
        language === 'ml' ? 'പണി പൂർത്തിയായി!' : 'Work Completed!',
        language === 'ml'
          ? 'പണി വിജയകരമായി രേഖപ്പെടുത്തി. ഓഫീസ് പരിശോധിച്ച് വേതനം നൽകും.'
          : 'Work recorded! Office staff will review and assign payout.'
      );
      setIsCompletionModalOpen(false);
      await refreshJobs();
      setActiveTab('HISTORY');
    } catch (err: any) {
      toast.error('Failed to complete work', err?.message || 'Could not complete work order');
    } finally {
      setSubmittingAction(false);
    }
  };

  const unitLabel = currentWork?.unitLabel || 'Units';
  const squadMembers = (currentWork?.specificationDetails as any)?.squadMembers || [];

  return (
    <WorkerShell activeTab="home" hideHeader={true}>
      <div className="w-full space-y-4 max-w-xl mx-auto">
        {/* ========================================================
            1. SIMPLE WORKER STATUS & DUTY HEADER
        ======================================================== */}
        <div className="bg-gradient-to-br from-[#091540] to-[#122263] rounded-3xl p-4 sm:p-5 text-white shadow-lg border border-white/10 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white shadow-inner">
                <HardHat className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-slate-300">
                  {language === 'ml' ? 'നമസ്കാരം,' : 'Welcome back,'}
                </p>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                  {user?.name || user?.username || 'Field Operative'}
                </h2>
              </div>
            </div>

            {/* Language Switcher */}
            <button
              type="button"
              onClick={() => setLanguage(language === 'ml' ? 'en' : 'ml')}
              className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-white/20 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-300" />
              <span>{language === 'ml' ? 'മലയാളം' : 'English'}</span>
            </button>
          </div>

          {/* Duty Switcher Strip */}
          <div className="pt-2 border-t border-white/15 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  isOnDuty ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
                }`}
              />
              <span className="text-xs font-bold">
                {isOnDuty
                  ? language === 'ml'
                    ? 'ഡ്യൂട്ടിയിലാണ് (On Duty)'
                    : 'On Duty • Ready for Work'
                  : language === 'ml'
                  ? 'ഓഫ് ഡ്യൂട്ടി (Off Duty)'
                  : 'Off Duty • Standby'}
              </span>
            </div>

            <button
              type="button"
              disabled={togglingDuty}
              onClick={handleToggleDuty}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md flex items-center gap-1.5 ${
                isOnDuty
                  ? 'bg-rose-500/90 hover:bg-rose-600 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              }`}
            >
              {togglingDuty ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : isOnDuty ? (
                language === 'ml'
                  ? 'ഓഫ് ചെയ്യുക'
                  : 'Go Off Duty'
              ) : (
                language === 'ml'
                  ? 'ഡ്യൂട്ടി എടുക്കുക'
                  : 'Go On Duty'
              )}
            </button>
          </div>
        </div>

        {/* ========================================================
            2. SIMPLE 3-TAB SEGMENT CONTROL
        ======================================================== */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-200/90 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('ACTIVE')}
            className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'ACTIVE'
                ? 'bg-white text-[#091540] shadow-sm'
                : 'text-slate-600 hover:text-[#091540]'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>{language === 'ml' ? 'ഇന്നത്തെ പണി' : 'Active Job'}</span>
            {currentWork && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('HISTORY')}
            className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'HISTORY'
                ? 'bg-white text-[#091540] shadow-sm'
                : 'text-slate-600 hover:text-[#091540]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{language === 'ml' ? 'കഴിഞ്ഞ പണികൾ' : 'History'}</span>
            {completedJobs.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                {completedJobs.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PROFILE')}
            className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'PROFILE'
                ? 'bg-white text-[#091540] shadow-sm'
                : 'text-slate-600 hover:text-[#091540]'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>{language === 'ml' ? 'പ്രൊഫൈൽ' : 'Profile'}</span>
          </button>
        </div>

        {/* ========================================================
            3. TAB CONTENT: ACTIVE JOB (CORE WORKER LOOP)
        ======================================================== */}
        {activeTab === 'ACTIVE' && (
          <div className="space-y-4">
            {/* If NO active work */}
            {!currentWork && (
              <div className="bg-white rounded-3xl p-6 text-center border border-slate-200/80 shadow-sm space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <HardHat className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    {language === 'ml'
                      ? 'ഇപ്പോൾ പുതിയ പണികൾ ഇല്ല'
                      : 'No Jobs Assigned Right Now'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    {language === 'ml'
                      ? 'നിങ്ങൾ ഡ്യൂട്ടിയിലാണ്. ഓഫീസ് സ്റ്റാഫ് പുതിയ ജോലി ഏൽപ്പിക്കുമ്പോൾ ഇവിടെ കാണാം.'
                      : 'You are on duty. When office staff assigns you a work order, it will appear here immediately.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => refreshJobs()}
                  disabled={loadingJobs}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingJobs ? 'animate-spin' : ''}`} />
                  <span>{language === 'ml' ? 'പുതുക്കുക' : 'Check for New Work'}</span>
                </button>
              </div>
            )}

            {/* If WORK IS ASSIGNED OR IN PROGRESS */}
            {currentWork && (
              <div className="bg-white rounded-3xl border-2 border-emerald-500/40 p-5 shadow-lg space-y-4">
                {/* Header Banner */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 ${
                        currentWork.status === 'IN_PROGRESS'
                          ? 'bg-blue-600 text-white animate-pulse'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>
                        {currentWork.status === 'IN_PROGRESS'
                          ? language === 'ml'
                            ? 'പണി നടക്കുന്നു...'
                            : 'Work In Progress'
                          : language === 'ml'
                          ? 'പുതിയ ജോലി ലഭിച്ചു!'
                          : 'New Job Assigned'}
                      </span>
                    </span>

                    <span className="font-mono text-[11px] font-bold text-slate-500 px-2 py-0.5 rounded-lg bg-slate-100">
                      {currentWork.trackingNumber}
                    </span>
                  </div>

                  {currentWork.preferredDate && (
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {new Date(currentWork.preferredDate).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Service Title */}
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#091540] leading-snug">
                    {currentWork.serviceName}
                  </h3>
                  {currentWork.message && (
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                      {currentWork.message}
                    </p>
                  )}
                </div>

                {/* Customer Details Box (Very clear call & route buttons) */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {language === 'ml' ? 'ഉപഭോക്താവ്' : 'Customer'}
                      </span>
                      <p className="text-sm font-bold text-slate-800">
                        {currentWork.customerName}
                      </p>
                    </div>

                    {/* Big Call Button */}
                    {currentWork.customerPhone && (
                      <a
                        href={`tel:${currentWork.customerPhone}`}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{language === 'ml' ? 'വിളിക്കുക' : 'Call'}</span>
                      </a>
                    )}
                  </div>

                  {/* Location & Map Route */}
                  <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-start gap-1.5 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span>
                        {[currentWork.location, currentWork.city, currentWork.district]
                          .filter(Boolean)
                          .join(', ') || 'Kerala, India'}
                      </span>
                    </div>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        [currentWork.location, currentWork.city, currentWork.district]
                          .filter(Boolean)
                          .join(', ') || 'Kerala'
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold flex items-center gap-1 text-[11px] self-start sm:self-auto transition-colors"
                    >
                      <Navigation className="w-3 h-3 text-blue-600" />
                      <span>{language === 'ml' ? 'റൂട്ട് കാണുക' : 'Open Google Maps'}</span>
                    </a>
                  </div>
                </div>

                {/* Squad Members (If multiple workers) */}
                {squadMembers.length > 0 && (
                  <div className="p-3 rounded-2xl bg-purple-50/80 border border-purple-200/80 space-y-2">
                    <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>
                        {language === 'ml' ? 'സഹപ്രവർത്തകർ (Squad)' : 'Co-Workers On This Job'}
                      </span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                      {squadMembers.map((m: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-purple-100"
                        >
                          <span className="font-semibold text-slate-700">
                            {m.name || 'Operative'}
                          </span>
                          {m.phone && (
                            <a
                              href={`tel:${m.phone}`}
                              className="text-emerald-600 hover:underline font-bold text-[11px] flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" />
                              <span>Call</span>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ========================================================
                    LIVE STOPWATCH CHRONOMETER (If IN_PROGRESS)
                ======================================================== */}
                {currentWork.status === 'IN_PROGRESS' && (
                  <div className="p-4 rounded-2xl bg-[#091540] text-white text-center space-y-2 shadow-inner">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400">
                      {isOnBreak
                        ? language === 'ml'
                          ? '☕ ഭക്ഷണ / ചായ ബ്രേക്കിലാണ്'
                          : '☕ ON BREAK (PAUSED)'
                        : language === 'ml'
                        ? '⏱️ ജോലി സമയം (LIVE RUNTIME)'
                        : '⏱️ LIVE ON-SITE STOPWATCH'}
                    </span>
                    <div className="font-mono text-3xl sm:text-4xl font-black text-white tracking-wider">
                      {formatTimer(timerSeconds)}
                    </div>
                    <p className="text-[11px] text-slate-300">
                      {language === 'ml'
                        ? 'പണി പൂർത്തിയാകുമ്പോൾ താഴെയുള്ള ബട്ടൺ അമർത്തുക'
                        : 'Tap Complete Work below once the task is finished.'}
                    </p>
                  </div>
                )}

                {/* ========================================================
                    ACTION BUTTONS (Simple & Typical)
                ======================================================== */}
                <div className="pt-2 space-y-2">
                  {currentWork.status === 'ASSIGNED' && (
                    <button
                      type="button"
                      disabled={submittingAction}
                      onClick={() => handleStartWork(currentWork)}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 text-white font-black text-sm sm:text-base shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                    >
                      {submittingAction ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Play className="w-5 h-5 fill-white" />
                      )}
                      <span>
                        {language === 'ml'
                          ? 'പണി ആരംഭിക്കുക (START WORK)'
                          : 'START WORK ON SITE'}
                      </span>
                    </button>
                  )}

                  {currentWork.status === 'IN_PROGRESS' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* Break / Resume Button */}
                      <button
                        type="button"
                        disabled={submittingAction}
                        onClick={() =>
                          isOnBreak
                            ? handleResumeWork(currentWork)
                            : handlePauseWork(currentWork)
                        }
                        className={`py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                          isOnBreak
                            ? 'bg-blue-600 text-white border-blue-500 hover:bg-blue-700'
                            : 'bg-amber-500/10 text-amber-700 border-amber-400 hover:bg-amber-500/20'
                        }`}
                      >
                        {isOnBreak ? (
                          <>
                            <Play className="w-4 h-4 fill-white" />
                            <span>{language === 'ml' ? 'പണി തുടരുക (Resume)' : 'Resume Work'}</span>
                          </>
                        ) : (
                          <>
                            <Pause className="w-4 h-4" />
                            <span>{language === 'ml' ? 'ബ്രേക്ക് എടുക്കുക' : 'Take Break'}</span>
                          </>
                        )}
                      </button>

                      {/* Complete Work Button */}
                      <button
                        type="button"
                        onClick={() => setIsCompletionModalOpen(true)}
                        className="py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {language === 'ml'
                            ? 'പണി പൂർത്തിയായി (Complete)'
                            : 'COMPLETE WORK'}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            4. TAB CONTENT: WORK HISTORY & EARNINGS
        ======================================================== */}
        {activeTab === 'HISTORY' && (
          <div className="space-y-4">
            {/* Earnings Summary Banner */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-5 text-white shadow-md flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">
                  {language === 'ml' ? 'ആകെ ലഭിച്ച വേതനം' : 'Total Earnings Received'}
                </span>
                <div className="text-2xl sm:text-3xl font-black mt-0.5">
                  ₹{totalEarned.toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">
                  {language === 'ml' ? 'പൂർത്തിയായ പണികൾ' : 'Completed Jobs'}
                </span>
                <div className="text-2xl sm:text-3xl font-black mt-0.5">
                  {completedJobs.length}
                </div>
              </div>
            </div>

            {/* List of completed works */}
            {completedJobs.length === 0 ? (
              <div className="bg-white rounded-3xl p-6 text-center border border-slate-200 text-slate-500 text-xs">
                {language === 'ml'
                  ? 'പൂർത്തിയായ പണികളുടെ വിവരങ്ങൾ ഇവിടെ കാണാം.'
                  : 'Completed jobs and wage details will be displayed here.'}
              </div>
            ) : (
              <div className="space-y-3">
                {completedJobs.map((job) => {
                  const spec = (job.specificationDetails as any) || {};
                  const isPaid = Boolean(job.totalCalculatedWage);
                  const payMode = spec.paymentMode || 'CASH';

                  return (
                    <div
                      key={job.id}
                      className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono text-[10px] font-bold text-slate-400">
                            {job.trackingNumber}
                          </span>
                          <h4 className="text-sm font-bold text-slate-800 leading-snug">
                            {job.serviceName}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {job.customerName} • {job.city || job.location || 'Kerala'}
                          </p>
                        </div>

                        {job.workDurationMinutes ? (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 flex items-center gap-1 shrink-0">
                            <Clock className="w-3 h-3" />
                            {Math.floor(job.workDurationMinutes / 60)}h{' '}
                            {job.workDurationMinutes % 60}m
                          </span>
                        ) : null}
                      </div>

                      {/* Units Reported */}
                      {job.completedUnits ? (
                        <div className="text-xs text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg inline-block font-semibold">
                          {language === 'ml' ? 'ചെയ്ത അളവ്' : 'Units'}: {job.completedUnits}{' '}
                          {job.unitLabel || 'Units'}
                        </div>
                      ) : null}

                      {/* Payment / Wage Status */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        {isPaid ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              <span>₹{job.totalCalculatedWage}</span>
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {payMode === 'CASH'
                                ? 'Cash (നേരിട്ട് പണം)'
                                : payMode === 'UPI'
                                ? 'UPI / GPay'
                                : payMode === 'BANK_TRANSFER'
                                ? 'Bank Transfer'
                                : 'Company Pay'}
                            </span>
                            {spec.paymentRef && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                Ref: {spec.paymentRef}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg text-xs font-semibold">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>
                              {language === 'ml'
                                ? 'പണി പൂർത്തിയായി • ഓഫീസ് വേതനം നൽകാൻ കാത്തിരിക്കുന്നു'
                                : 'Completed • Payout Pending Office Confirmation'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            5. TAB CONTENT: WORKER PROFILE & HELPDESK
        ======================================================== */}
        {activeTab === 'PROFILE' && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-[#091540] text-emerald-400 flex items-center justify-center text-xl font-black shadow-md">
                {(user?.name || user?.username || 'W').charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  {user?.name || user?.username}
                </h3>
                <p className="text-xs text-slate-500">{user?.phone || 'Kerala Operative'}</p>
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  KK Group Field Operative
                </span>
              </div>
            </div>

            {/* Helpline Box */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>{language === 'ml' ? 'ഓഫീസ് ഹെൽപ്പ് ഡെസ്ക്' : 'Office Support'}</span>
              </span>
              <p className="text-xs text-slate-600">
                {language === 'ml'
                  ? 'വേതനം, ജോലി സംശയങ്ങൾ എന്നിവയ്ക്ക് താഴെ വിളിക്കുക:'
                  : 'For duty adjustments or payout assistance, contact dispatch office:'}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <a
                  href="tel:+919447000000"
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>+91 94470 00000</span>
                </a>
              </div>
            </div>

            {/* Logout */}
            <button
              type="button"
              onClick={() => logout()}
              className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-rose-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{language === 'ml' ? 'ലോഗ് ഔട്ട്' : 'Sign Out'}</span>
            </button>
          </div>
        )}

        {/* ========================================================
            6. QUICK COMPLETION MODAL / POPUP
        ======================================================== */}
        {isCompletionModalOpen && currentWork && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 text-slate-800">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {language === 'ml'
                        ? 'പണി പൂർത്തിയായി സ്ഥിരീകരിക്കുക'
                        : 'Confirm Work Completion'}
                    </h4>
                    <span className="font-mono text-[10px] text-slate-500">
                      {currentWork.trackingNumber}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCompletionModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-3">
                {/* Completed Units */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    {language === 'ml'
                      ? `പൂർത്തിയാക്കിയ അളവ് (${unitLabel})`
                      : `Completed Units (${unitLabel})`}
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setCompletionUnits((prev) =>
                          Math.max(1, (Number(prev) || 1) - 1)
                        )
                      }
                      className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={completionUnits}
                      onChange={(e) =>
                        setCompletionUnits(
                          e.target.value === '' ? '' : Number(e.target.value)
                        )
                      }
                      className="flex-1 text-center py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-black text-slate-800 focus:outline-none focus:border-emerald-500"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setCompletionUnits((prev) => (Number(prev) || 0) + 1)
                      }
                      className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Completion Notes */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    {language === 'ml' ? 'കുറിപ്പുകൾ (ഓപ്ഷണൽ)' : 'Remarks / Notes (Optional)'}
                  </label>
                  <textarea
                    rows={2}
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    placeholder={
                      language === 'ml'
                        ? 'e.g. പണി പൂർത്തിയായി, വേസ്റ്റ് മാറ്റി.'
                        : 'e.g. Work finished, site cleaned.'
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Information banner */}
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    {language === 'ml'
                      ? 'പണി പൂർത്തിയായതായി സ്ഥിരീകരിച്ച ശേഷം ഓഫീസ് സ്റ്റാഫ് വേതനം നൽകും.'
                      : 'Office coordinator will verify work and assign your payout upon confirmation.'}
                  </span>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCompletionModalOpen(false)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
                  >
                    {language === 'ml' ? 'റദ്ദാക്കുക' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    disabled={submittingAction}
                    onClick={handleConfirmComplete}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {submittingAction ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {language === 'ml'
                        ? 'സ്ഥിരീകരിക്കുക'
                        : 'Confirm & Complete'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </WorkerShell>
  );
}
