'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import NextLink from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  User as UserIcon,
  HardHat,
  Users,
  Compass,
  Navigation,
  Calendar,
  CreditCard,
  DollarSign,
  Coffee,
  Activity,
  Send,
  ExternalLink,
  ShieldCheck,
  Building,
  Sparkles,
  Layers,
  FileText,
  BadgeCheck,
  Check,
  Copy,
  ChevronRight,
  TrendingUp,
  Play,
  Pause,
  Loader2,
  StopCircle,
  Timer,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { EnquiryService, ServiceEnquiry } from '@/services';
import { AssignWorkerModal } from '@/components/OfficeStaff/AssignWorkerModal';
import { UpdateJobPayModal } from '@/components/OfficeStaff/UpdateJobPayModal';

export default function AdminEnquiryDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { token, user: currentUser, isLoading: authLoading } = useAuth();

  const [enquiry, setEnquiry] = useState<ServiceEnquiry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedTracking, setCopiedTracking] = useState(false);

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  // Live timer ticker
  const [nowTimestamp, setNowTimestamp] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNowTimestamp(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Admin timer action modals
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const [adminPauseReason, setAdminPauseReason] = useState('Lunch Break');
  const [adminPauseNotes, setAdminPauseNotes] = useState('');
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [completeUnits, setCompleteUnits] = useState<number | ''>('');
  const [completeNotes, setCompleteNotes] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Admin Timer Override Modal
  const [isModifyTimeModalOpen, setIsModifyTimeModalOpen] = useState(false);
  const [editWorkDurationMinutes, setEditWorkDurationMinutes] = useState<number | ''>('');
  const [editTotalBreakMinutes, setEditTotalBreakMinutes] = useState<number | ''>('');

  const fetchEnquiryDetails = useCallback(async () => {
    if (!token || !params.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await EnquiryService.getEnquiryById(params.id, token);
      if (!data) {
        throw new Error('Work Order record not found');
      }
      setEnquiry(data);
    } catch (err: any) {
      console.error('Failed to load work order', err);
      setError(err?.message || 'Could not load work order details');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [token, params.id]);

  useEffect(() => {
    if (!authLoading) {
      if (!token) {
        router.push('/admin/login');
      } else {
        fetchEnquiryDetails();
      }
    }
  }, [authLoading, token, fetchEnquiryDetails, router]);

  // Auto-refresh every 5 seconds when the enquiry is IN_PROGRESS
  useEffect(() => {
    if (enquiry?.status !== 'IN_PROGRESS') return;
    const interval = setInterval(() => {
      fetchEnquiryDetails();
    }, 5000);
    return () => clearInterval(interval);
  }, [enquiry?.status, fetchEnquiryDetails]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchEnquiryDetails();
  };

  const handleCopyTracking = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  // Helper: format seconds to HH:MM:SS
  const formatSecondsToHMS = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Compute live timer data for this enquiry
  const liveTimerData = useMemo(() => {
    if (!enquiry || enquiry.status !== 'IN_PROGRESS' || !enquiry.workStartedAt) return null;
    const spec = (enquiry.specificationDetails as any) || {};
    const isBreakActive = Boolean(spec.activeBreak || spec.isTimerPaused);
    const activeBreak = spec.activeBreak;
    const startMs = new Date(enquiry.workStartedAt).getTime();
    const pastBreaks = Array.isArray(spec.breaks) ? spec.breaks : [];
    const pastBreaksSeconds = pastBreaks.reduce(
      (acc: number, b: any) => acc + (b.durationSeconds || (b.durationMinutes || 0) * 60),
      0
    );
    let workSeconds = 0;
    let breakSeconds = 0;
    if (isBreakActive && activeBreak?.startedAt) {
      const breakStartMs = new Date(activeBreak.startedAt).getTime();
      breakSeconds = Math.max(0, Math.floor((nowTimestamp - breakStartMs) / 1000));
      workSeconds = Math.max(0, Math.floor((breakStartMs - startMs) / 1000) - pastBreaksSeconds);
    } else {
      workSeconds = Math.max(0, Math.floor((nowTimestamp - startMs) / 1000) - pastBreaksSeconds);
    }
    return {
      isOnBreak: isBreakActive,
      activeBreakReason: activeBreak?.reason || 'General Break',
      workSeconds,
      breakSeconds,
      workTimeFormatted: formatSecondsToHMS(workSeconds),
      breakTimeFormatted: formatSecondsToHMS(breakSeconds),
    };
  }, [enquiry, nowTimestamp]);

  // Admin timer handlers
  const handleAdminPause = async () => {
    if (!enquiry || !token) return;
    setIsSubmittingAction(true);
    try {
      await EnquiryService.pauseWorkTimer(
        enquiry.id,
        { reason: adminPauseReason, notes: adminPauseNotes.trim() || undefined },
        token
      );
      setIsPauseModalOpen(false);
      setAdminPauseNotes('');
      await fetchEnquiryDetails();
    } catch (err: any) {
      alert(err?.message || 'Failed to pause timer');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleAdminResume = async () => {
    if (!enquiry || !token) return;
    setIsSubmittingAction(true);
    try {
      await EnquiryService.resumeWorkTimer(enquiry.id, {}, token);
      setIsResumeModalOpen(false);
      await fetchEnquiryDetails();
    } catch (err: any) {
      alert(err?.message || 'Failed to resume timer');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleAdminComplete = async () => {
    if (!enquiry || !token) return;
    setIsSubmittingAction(true);
    try {
      const durationMinutes = liveTimerData
        ? Math.max(1, Math.round(liveTimerData.workSeconds / 60))
        : undefined;
      await EnquiryService.stopWorkTimer(
        enquiry.id,
        {
          durationMinutes,
          completedUnits: completeUnits === '' ? undefined : Number(completeUnits),
          completionNotes: completeNotes.trim() || undefined,
        },
        token
      );
      setIsCompleteModalOpen(false);
      await fetchEnquiryDetails();
    } catch (err: any) {
      alert(err?.message || 'Failed to complete work');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleModifyTime = async () => {
    if (!enquiry || !token) return;
    setIsSubmittingAction(true);
    try {
      await EnquiryService.updateJobPay(
        enquiry.id,
        {
          workDurationMinutes: editWorkDurationMinutes === '' ? undefined : Number(editWorkDurationMinutes),
          totalBreakMinutes: editTotalBreakMinutes === '' ? undefined : Number(editTotalBreakMinutes),
        },
        token
      );
      setIsModifyTimeModalOpen(false);
      await fetchEnquiryDetails();
    } catch (err: any) {
      alert(err?.message || 'Failed to modify time details');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Parsing Telemetry & Specification details
  const specs = useMemo(() => {
    if (!enquiry?.specificationDetails) return {};
    return typeof enquiry.specificationDetails === 'object'
      ? (enquiry.specificationDetails as Record<string, any>)
      : {};
  }, [enquiry?.specificationDetails]);

  // Break logs – check both canonical keys ('breaks' and legacy 'breakLog')
  const breakLog: Array<{
    reason: string;
    startedAt: string;
    endedAt?: string;
    durationMinutes?: number;
    notes?: string;
  }> = useMemo(() => {
    if (Array.isArray(specs.breaks)) {
      return specs.breaks;
    }
    if (Array.isArray(specs.breakLog)) {
      return specs.breakLog;
    }
    return [];
  }, [specs]);

  const totalBreakMinutes = useMemo(() => {
    return breakLog.reduce((acc, b) => acc + (b.durationMinutes || 0), 0);
  }, [breakLog]);

  // Squad Members
  const squadMembers: Array<{
    id: string;
    name: string;
    username?: string;
    phone?: string;
    role?: string;
    isLeader?: boolean;
  }> = useMemo(() => {
    if (Array.isArray(specs.squadMembers)) {
      return specs.squadMembers;
    }
    return [];
  }, [specs]);

  // Format active work duration
  const formattedWorkDuration = useMemo(() => {
    if (enquiry?.workDurationMinutes) {
      const hours = Math.floor(enquiry.workDurationMinutes / 60);
      const mins = enquiry.workDurationMinutes % 60;
      if (hours > 0) {
        return `${hours} hr${hours > 1 ? 's' : ''} ${mins > 0 ? `${mins} min` : ''}`;
      }
      return `${mins} minutes`;
    }
    if (enquiry?.workStartedAt && enquiry.status === 'IN_PROGRESS') {
      const start = new Date(enquiry.workStartedAt).getTime();
      const now = Date.now();
      const elapsedMins = Math.max(0, Math.floor((now - start) / 60000) - totalBreakMinutes);
      const hours = Math.floor(elapsedMins / 60);
      const mins = elapsedMins % 60;
      if (hours > 0) {
        return `${hours} hr${hours > 1 ? 's' : ''} ${mins} min (Active)`;
      }
      return `${mins} min (Active)`;
    }
    return 'Not Started';
  }, [enquiry?.workDurationMinutes, enquiry?.workStartedAt, enquiry?.status, totalBreakMinutes]);

  if (authLoading || (isLoading && !enquiry)) {
    return (
      <div className="max-w-[1550px] mx-auto space-y-6 pb-12 animate-pulse">
        <div className="h-10 w-48 bg-[#14151A] rounded-xl border border-gray-800" />
        <div className="h-28 bg-[#14151A] rounded-3xl border border-gray-800" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-[#14151A] rounded-2xl border border-gray-800" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 h-[500px] bg-[#14151A] rounded-3xl border border-gray-800" />
          <div className="lg:col-span-5 h-[500px] bg-[#14151A] rounded-3xl border border-gray-800" />
        </div>
      </div>
    );
  }

  if (error || !enquiry) {
    return (
      <div className="max-w-[1100px] mx-auto space-y-6 pb-12">
        <NextLink
          href="/admin/operations/enquiries"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Enquiries
        </NextLink>

        <div className="bg-[#14151A] rounded-3xl border border-gray-800 p-12 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-gray-100 mb-2">Work Order Not Found</h2>
          <p className="text-gray-500 text-sm max-w-md mb-6">
            {error || 'The requested work order could not be located.'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-[#1A1C23] hover:bg-gray-800 text-gray-300 rounded-xl border border-gray-800 text-sm font-medium transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <NextLink
              href="/admin/operations/enquiries"
              className="px-4 py-2 bg-[#7B4DFF] hover:bg-[#6A3DEE] text-white rounded-xl text-sm font-medium transition-colors"
            >
              Return to Enquiries
            </NextLink>
          </div>
        </div>
      </div>
    );
  }

  const isCompleted = enquiry.status === 'COMPLETED';
  const isInProgress = enquiry.status === 'IN_PROGRESS';
  const isAssigned = enquiry.status === 'ASSIGNED';
  const isPending = enquiry.status === 'PENDING';

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-14 select-none">
      {/* ========================================================
          1. TOP BREADCRUMB & HEADER CONTROLS
      ======================================================== */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <NextLink
            href="/admin/operations/enquiries"
            className="p-2.5 rounded-2xl bg-[#14151A] hover:bg-[#1A1C23] text-gray-400 hover:text-white border border-gray-800 transition-all shadow-sm"
            title="Back to Enquiries"
          >
            <ArrowLeft className="w-4 h-4" />
          </NextLink>
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <NextLink href="/admin/dashboard" className="hover:text-gray-300 transition-colors">
                Admin
              </NextLink>
              <span>/</span>
              <NextLink href="/admin/operations/enquiries" className="hover:text-gray-300 transition-colors">
                Work Orders
              </NextLink>
              <span>/</span>
              <span className="font-mono text-[#7B4DFF]">{enquiry.trackingNumber}</span>
            </div>
            <h1 className="text-2xl font-black text-gray-100 tracking-tight flex items-center gap-3 mt-0.5">
              <span>{enquiry.serviceName}</span>
              <span
                className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
                  isCompleted
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : isInProgress
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : isAssigned
                    ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                    : 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                }`}
              >
                {enquiry.status.replace('_', ' ')}
              </span>
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          {/* Dispatch or Re-assign Modal Trigger — hidden for IN_PROGRESS */}
          {!isInProgress && (
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-[#7B4DFF] hover:bg-[#6839EF] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#7B4DFF]/25 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isPending ? 'Dispatch Squad' : 'Reassign / Add Workers'}</span>
            </button>
          )}

          {/* Modify Time Trigger */}
          {(isCompleted || isInProgress) && (
            <button
              type="button"
              onClick={() => {
                setEditWorkDurationMinutes(enquiry.workDurationMinutes ?? '');
                const spec = (enquiry.specificationDetails as any) || {};
                const breakMins = spec.totalBreakMinutes ?? (Array.isArray(spec.breaks) ? spec.breaks.reduce((acc: number, b: any) => acc + (b.durationMinutes || 0), 0) : 0);
                setEditTotalBreakMinutes(breakMins || '');
                setIsModifyTimeModalOpen(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2 bg-[#1A1C23] hover:bg-gray-800 border border-gray-800 text-gray-300 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Modify Time Logs</span>
            </button>
          )}

          {/* Live Timer Controls — only for IN_PROGRESS */}
          {isInProgress && (
            <>
              {liveTimerData?.isOnBreak ? (
                <button
                  type="button"
                  onClick={() => setIsResumeModalOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/25 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Resume Work</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAdminPauseReason('Lunch Break');
                    setAdminPauseNotes('');
                    setIsPauseModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Work</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setCompleteUnits(enquiry.completedUnits ?? enquiry.estimatedUnits ?? 1);
                  setCompleteNotes('');
                  setIsCompleteModalOpen(true);
                }}
                className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/25 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Complete Work</span>
              </button>
            </>
          )}

          {/* Settle Wage / Billing */}
          <button
            type="button"
            onClick={() => setIsPayModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>Adjust Wage & Billing</span>
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-2 bg-[#14151A] hover:bg-[#1A1C23] border border-gray-800 text-gray-300 hover:text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#7B4DFF] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          LIVE CHRONOMETER BANNER (shown only when IN_PROGRESS)
      ======================================================== */}
      {isInProgress && liveTimerData && (
        <div
          className={`relative overflow-hidden rounded-2xl border p-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${
            liveTimerData.isOnBreak
              ? 'bg-amber-500/10 border-amber-500/40'
              : 'bg-emerald-500/10 border-emerald-500/40'
          }`}
        >
          {/* Animated top bar */}
          <div
            className={`absolute top-0 left-0 right-0 h-[2px] ${
              liveTimerData.isOnBreak
                ? 'bg-gradient-to-r from-transparent via-amber-400 to-transparent'
                : 'bg-gradient-to-r from-transparent via-emerald-400 to-transparent'
            }`}
          />

          {/* Left: status label */}
          <div className="flex items-center gap-3">
            <span
              className={`relative flex h-3.5 w-3.5`}
            >
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  liveTimerData.isOnBreak ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-3.5 w-3.5 ${
                  liveTimerData.isOnBreak ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
              />
            </span>
            <div>
              <div className={`text-sm font-black ${
                liveTimerData.isOnBreak ? 'text-amber-300' : 'text-emerald-300'
              }`}>
                {liveTimerData.isOnBreak
                  ? `☕ On Break — ${liveTimerData.activeBreakReason}`
                  : '⏱️ Work Timer Running'}
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5">
                {liveTimerData.isOnBreak
                  ? `Work logged before break: ${liveTimerData.workTimeFormatted}`
                  : `Started at ${enquiry.workStartedAt ? new Date(enquiry.workStartedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}`}
              </div>
            </div>
          </div>

          {/* Centre: counters */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className={`font-mono font-black text-2xl tracking-widest ${
                liveTimerData.isOnBreak ? 'text-amber-100/60' : 'text-emerald-100'
              }`}>
                {liveTimerData.workTimeFormatted}
              </div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Net Work Time</div>
            </div>
            {liveTimerData.isOnBreak && (
              <>
                <div className="w-px h-10 bg-gray-700" />
                <div className="text-center">
                  <div className="font-mono font-black text-2xl tracking-widest text-amber-300">
                    {liveTimerData.breakTimeFormatted}
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Break Time</div>
                </div>
              </>
            )}
          </div>

          {/* Right: quick controls */}
          <div className="flex items-center gap-2 shrink-0">
            {liveTimerData.isOnBreak ? (
              <button
                type="button"
                onClick={() => setIsResumeModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black transition-all shadow-md cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Resume
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAdminPauseReason('Lunch Break');
                  setAdminPauseNotes('');
                  setIsPauseModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-500/30 hover:bg-amber-500/50 border border-amber-500/40 text-amber-200 rounded-xl text-xs font-black transition-all cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5" />
                Pause
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setCompleteUnits(enquiry.completedUnits ?? enquiry.estimatedUnits ?? 1);
                setCompleteNotes('');
                setIsCompleteModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all shadow-md cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Complete
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          2. KEY METRIC KPI BENTO CARDS
      ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Work Duration & Site Arrival */}
        <div className="bg-[#14151A] rounded-2xl border border-gray-800/80 p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
              On-Site Execution Time
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-[#A78BFA] border border-purple-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-gray-100 tracking-tight mt-2">
            {formattedWorkDuration}
          </div>
          <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1.5">
            {specs.siteReachedAt ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>
                  Reached Site at{' '}
                  {new Date(specs.siteReachedAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </span>
            ) : (
              <span>Site arrival not yet recorded</span>
            )}
          </div>
        </div>

        {/* Metric 2: Quantity & Work Units */}
        <div className="bg-[#14151A] rounded-2xl border border-gray-800/80 p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
              Completed Units / Volume
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-gray-100 tracking-tight mt-2">
            {enquiry.completedUnits !== null && enquiry.completedUnits !== undefined ? (
              <span>
                {enquiry.completedUnits}{' '}
                <span className="text-xs font-bold text-gray-400">
                  {enquiry.unitLabel || 'Units'}
                </span>
              </span>
            ) : (
              <span className="text-gray-500 text-sm">
                Estimated: {enquiry.estimatedUnits || 1} {enquiry.unitLabel || 'Units'}
              </span>
            )}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            Model:{' '}
            <strong className="text-emerald-400 uppercase">
              {enquiry.wageType || 'STANDARD'}
            </strong>
          </div>
        </div>

        {/* Metric 3: Wage & Billing */}
        <div className="bg-[#14151A] rounded-2xl border border-gray-800/80 p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
              Worker Compensation
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-emerald-400 tracking-tight mt-2">
            {enquiry.totalCalculatedWage !== null && enquiry.totalCalculatedWage !== undefined ? (
              <span>₹{enquiry.totalCalculatedWage.toLocaleString('en-IN')}</span>
            ) : enquiry.workerUnitWage ? (
              <span className="text-sm">
                ₹{enquiry.workerUnitWage} / {enquiry.unitLabel || 'Unit'}
              </span>
            ) : (
              <span className="text-gray-500 text-sm">To be settled upon finish</span>
            )}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            Client Billable:{' '}
            <strong className="text-gray-200">
              {enquiry.totalCalculatedCost ? `₹${enquiry.totalCalculatedCost.toLocaleString('en-IN')}` : 'Pending'}
            </strong>
          </div>
        </div>

        {/* Metric 4: Break & Downtime Logs */}
        <div className="bg-[#14151A] rounded-2xl border border-gray-800/80 p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
              Total Breaks Taken
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Coffee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-gray-100 tracking-tight mt-2">
            {totalBreakMinutes > 0 ? (
              <span>
                {totalBreakMinutes} <span className="text-xs font-bold text-gray-400">Minutes</span>
              </span>
            ) : (
              <span className="text-gray-400 text-sm">0 Breaks</span>
            )}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            {breakLog.length > 0 ? (
              <span>{breakLog.length} Pause session{breakLog.length > 1 ? 's' : ''} logged</span>
            ) : (
              <span>Continuous field execution</span>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          3. MAIN DETAILS LAYOUT: LEFT & RIGHT COLUMNS
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================
            LEFT COLUMN (7 cols): EXECUTION TIMELINE & LOGS
        ======================================================== */}
        <div className="lg:col-span-7 space-y-6">
          {/* Work Execution Timeline */}
          <div className="bg-[#14151A] rounded-3xl border border-gray-800/80 p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#7B4DFF]/15 border border-[#7B4DFF]/30 flex items-center justify-center text-[#A78BFA]">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-100 tracking-tight leading-tight">
                    Operations Lifecycle & Telemetry
                  </h3>
                  <p className="text-[11px] font-semibold text-gray-400 mt-0.5">
                    Real-time field events, arrival timestamps, breaks, and completion notes
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCopyTracking(enquiry.trackingNumber)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A1C23] hover:bg-gray-800 border border-gray-800 font-mono text-xs font-bold text-gray-300 transition-colors cursor-pointer"
                title="Copy Tracking ID"
              >
                <span>{enquiry.trackingNumber}</span>
                {copiedTracking ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-gray-500" />
                )}
              </button>
            </div>

            {/* Stepper Timeline */}
            <div className="space-y-4 relative pl-6 border-l-2 border-gray-800 ml-3">
              {/* Event 1: Work Order Created */}
              <div className="relative">
                <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-[#14151A] flex items-center justify-center text-[9px] font-black text-black">
                  ✓
                </span>
                <div className="text-xs font-bold text-gray-200">Enquiry Initiated & Registered</div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  Logged on{' '}
                  <strong className="text-gray-300">
                    {new Date(enquiry.createdAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </strong>{' '}
                  by <span className="text-[#A78BFA] font-bold">{enquiry.createdByRole}</span>
                </div>
              </div>

              {/* Event 2: Worker / Squad Dispatched */}
              {enquiry.assignedAt ? (
                <div className="relative">
                  <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-blue-500 ring-4 ring-[#14151A] flex items-center justify-center text-[9px] font-black text-white">
                    ✓
                  </span>
                  <div className="text-xs font-bold text-gray-200">
                    Dispatched to Workforce
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    Assigned on{' '}
                    <strong className="text-gray-300">
                      {new Date(enquiry.assignedAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </strong>
                    {enquiry.officeStaff?.name && (
                      <span>
                        {' '}
                        by coordinator <span className="text-gray-200 font-semibold">{enquiry.officeStaff.name}</span>
                      </span>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Event 3: Workers Reached Site */}
              {specs.siteReachedAt ? (
                <div className="relative">
                  <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-[#14151A] flex items-center justify-center text-[9px] font-black text-black">
                    ✓
                  </span>
                  <div className="text-xs font-bold text-emerald-400">
                    Squad Reached Work Location
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    Site arrival verified at{' '}
                    <strong className="text-gray-200 font-mono">
                      {new Date(specs.siteReachedAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </strong>{' '}
                    &bull; Location: {enquiry.location || 'Site Coordinates Logged'}
                  </div>
                </div>
              ) : null}

              {/* Event 4: Work Started */}
              {enquiry.workStartedAt ? (
                <div className="relative">
                  <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-amber-400 ring-4 ring-[#14151A] flex items-center justify-center text-[9px] font-black text-black">
                    ✓
                  </span>
                  <div className="text-xs font-bold text-gray-200">
                    Work Timer Started on Site
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    Started at{' '}
                    <strong className="text-amber-300 font-mono">
                      {new Date(enquiry.workStartedAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </strong>
                  </div>
                </div>
              ) : null}

              {/* Event 5: Break Logs */}
              {breakLog.map((b, idx) => (
                <div key={idx} className="relative">
                  <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-purple-500 ring-4 ring-[#14151A] flex items-center justify-center text-[8px] font-bold text-white">
                    ☕
                  </span>
                  <div className="text-xs font-bold text-purple-300">
                    Break Paused: {b.reason || 'Rest Break'}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    {new Date(b.startedAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    {b.endedAt ? (
                      <span>
                        to{' '}
                        {new Date(b.endedAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        ({b.durationMinutes || 0} mins)
                      </span>
                    ) : (
                      <span className="text-amber-400 font-semibold">(Currently Paused)</span>
                    )}
                  </div>
                </div>
              ))}

              {/* Event 6: Work Completed */}
              {enquiry.completedAt || enquiry.workEndedAt ? (
                <div className="relative">
                  <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-emerald-400 ring-4 ring-[#14151A] flex items-center justify-center text-[9px] font-black text-black">
                    ★
                  </span>
                  <div className="text-xs font-bold text-emerald-400">
                    Work Completed & Signed Off
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    Concluded at{' '}
                    <strong className="text-gray-200 font-mono">
                      {new Date(enquiry.completedAt || enquiry.workEndedAt!).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </strong>{' '}
                    &bull; Final Units:{' '}
                    <strong className="text-emerald-400">
                      {enquiry.completedUnits} {enquiry.unitLabel || 'Units'}
                    </strong>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Break Details & Notes Breakdown */}
          {breakLog.length > 0 && (
            <div className="bg-[#14151A] rounded-3xl border border-gray-800/80 p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-black text-gray-200 flex items-center gap-2">
                <Coffee className="w-4 h-4 text-purple-400" />
                <span>Shift Pauses & Break Ledger</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#1A1C23] text-gray-400 font-semibold border-b border-gray-800">
                    <tr>
                      <th className="py-2.5 px-3">Reason</th>
                      <th className="py-2.5 px-3">Start Time</th>
                      <th className="py-2.5 px-3">Resume Time</th>
                      <th className="py-2.5 px-3 text-right">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 text-gray-300">
                    {breakLog.map((b, i) => (
                      <tr key={i} className="hover:bg-[#1A1C23]/40">
                        <td className="py-2.5 px-3 font-semibold text-gray-200">
                          {b.reason}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">
                          {new Date(b.startedAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">
                          {b.endedAt
                            ? new Date(b.endedAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Ongoing'}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-purple-300 text-right">
                          {b.durationMinutes ? `${b.durationMinutes} mins` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Work Requirements & Message */}
          <div className="bg-[#14151A] rounded-3xl border border-gray-800/80 p-6 shadow-xl space-y-3">
            <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">
              Customer Work Description & Requirements
            </h3>
            <p className="text-sm text-gray-200 leading-relaxed bg-[#1A1C23] p-4 rounded-2xl border border-gray-800/60">
              {enquiry.message || 'No additional specifications provided.'}
            </p>
            {enquiry.notes && (
              <div className="text-xs text-gray-400 bg-[#1A1C23]/60 p-3.5 rounded-2xl border border-gray-800/50">
                <span className="font-bold text-gray-300">Office Notes:</span> {enquiry.notes}
              </div>
            )}
          </div>

          {/* Time & Break Audit Section */}
          {(() => {
            const actualMins: number = (specs.actualWorkMinutes ?? enquiry.workDurationMinutes ?? 0) as number;
            const breakMins: number = (specs.totalBreakMinutes ??
              breakLog.reduce((acc, b) => acc + (b.durationMinutes || 0), 0)) as number;
            const grossMins: number = (specs.grossDurationMinutes ?? (actualMins + breakMins)) as number;
            const hasData = actualMins > 0 || breakMins > 0 || breakLog.length > 0;
            if (!hasData) return null;
            return (
              <div className="bg-[#14151A] rounded-3xl border border-gray-800/80 p-6 shadow-xl space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-800/80">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-gray-100 tracking-tight leading-tight">
                      Time & Break Audit
                    </h3>
                    <p className="text-[11px] font-semibold text-gray-400 mt-0.5">
                      Comprehensive labor vs. downtime breakdown
                    </p>
                  </div>
                </div>

                {/* Three-column metrics */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider mb-1">Net Labor</div>
                    <div className="text-xl font-black text-emerald-400 font-mono">{actualMins}<span className="text-xs font-bold text-emerald-600 ml-0.5">m</span></div>
                    <div className="text-[10px] text-gray-500 mt-0.5">Productive time</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
                    <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider mb-1">Break Deducted</div>
                    <div className="text-xl font-black text-amber-400 font-mono">{breakMins}<span className="text-xs font-bold text-amber-600 ml-0.5">m</span></div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{breakLog.length} pause session{breakLog.length !== 1 ? 's' : ''}</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center">
                    <div className="text-[10px] uppercase font-bold text-purple-400 tracking-wider mb-1">Gross On-Site</div>
                    <div className="text-xl font-black text-purple-400 font-mono">{grossMins}<span className="text-xs font-bold text-purple-600 ml-0.5">m</span></div>
                    <div className="text-[10px] text-gray-500 mt-0.5">Total site duration</div>
                  </div>
                </div>

                {/* Break log table */}
                {breakLog.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Break Archive</div>
                    <div className="overflow-x-auto rounded-2xl border border-gray-800/60">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#0D0E12] text-gray-400 font-semibold">
                          <tr>
                            <th className="py-2.5 px-3">#</th>
                            <th className="py-2.5 px-3">Reason</th>
                            <th className="py-2.5 px-3">Started</th>
                            <th className="py-2.5 px-3">Resumed</th>
                            <th className="py-2.5 px-3 text-right">Duration</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/60 text-gray-300">
                          {breakLog.map((b, i) => (
                            <tr key={i} className="hover:bg-[#1A1C23]/40">
                              <td className="py-2.5 px-3 text-gray-500 font-bold">{i + 1}</td>
                              <td className="py-2.5 px-3 font-semibold text-gray-200">
                                <span className="inline-flex items-center gap-1.5">
                                  <span>☕</span>
                                  <span>{b.reason || 'Rest Break'}</span>
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-mono text-[11px] text-gray-400">
                                {new Date(b.startedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-[11px]">
                                {b.endedAt
                                  ? <span className="text-emerald-400">{new Date(b.endedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                                  : <span className="text-amber-400 font-semibold animate-pulse">Ongoing</span>}
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-purple-300">
                                {b.durationMinutes ? `${b.durationMinutes} min` : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-[#0D0E12] border-t border-gray-800">
                          <tr>
                            <td colSpan={4} className="py-2 px-3 text-[11px] text-gray-500 font-semibold">Total Break Time</td>
                            <td className="py-2 px-3 text-right text-[11px] font-black text-amber-400">{breakMins} min</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* ========================================================
            RIGHT COLUMN (5 cols): WORKFORCE, SITE, CLIENT DETAILS
        ======================================================== */}
        <div className="lg:col-span-5 space-y-6">
          {/* Site Location Card with Maps */}
          <div className="bg-[#14151A] rounded-3xl border border-gray-800/80 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Kerala Site Coordinates</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                {enquiry.district || 'Kasaragod'}
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-black text-gray-100">
                {enquiry.location || 'Local Kerala Work Site'}
              </h4>
              <p className="text-xs text-gray-400">
                {[enquiry.city, enquiry.district, enquiry.state || 'Kerala']
                  .filter(Boolean)
                  .join(', ')}
              </p>
              {enquiry.locationRemarks && (
                <div className="text-xs text-gray-400 italic pt-1">
                  Landmark: {enquiry.locationRemarks}
                </div>
              )}
            </div>

            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(
                (enquiry.location || enquiry.city || 'Kasaragod') + ', Kerala, India'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 cursor-pointer"
            >
              <Navigation className="w-4 h-4 fill-white rotate-45" />
              <span>Launch Google Maps GPS</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>

          {/* Assigned Workforce & Squad Card */}
          <div className="bg-[#14151A] rounded-3xl border border-gray-800/80 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800/80">
              <span className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                <HardHat className="w-4 h-4 text-amber-400" />
                <span>Field Operatives Dispatched</span>
              </span>
              <span className="text-[11px] font-bold text-gray-400">
                {squadMembers.length > 0 ? `${squadMembers.length} Members` : '1 Assigned'}
              </span>
            </div>

            {/* Primary Worker / Lead */}
            {enquiry.worker ? (
              <div className="p-3.5 rounded-2xl bg-[#1A1C23] border border-gray-800/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                    {enquiry.worker.name?.charAt(0) || 'W'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <NextLink
                        href={`/admin/people/workers/${enquiry.worker.username}`}
                        className="text-sm font-bold text-gray-100 hover:text-emerald-400 transition-colors truncate"
                      >
                        {enquiry.worker.name}
                      </NextLink>
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400">
                        Lead
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 font-mono">
                      @{enquiry.worker.username} &bull; {enquiry.worker.phone || 'No phone'}
                    </div>
                  </div>
                </div>

                <NextLink
                  href={`/admin/people/workers/${enquiry.worker.username}`}
                  className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
                  title="View Worker Profile"
                >
                  <ChevronRight className="w-4 h-4" />
                </NextLink>
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-gray-500 bg-[#1A1C23]/40 rounded-2xl border border-gray-800/50">
                No workers assigned yet.
              </div>
            )}

            {/* Co-Workers / Squad Teammates */}
            {squadMembers.length > 1 && (
              <div className="space-y-2 pt-2">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                  Squad Co-Workers
                </span>
                <div className="space-y-2">
                  {squadMembers
                    .filter((m) => m.id !== enquiry.workerId)
                    .map((m) => (
                      <div
                        key={m.id}
                        className="p-2.5 rounded-xl bg-[#1A1C23] border border-gray-800/60 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-gray-200">
                            {m.username ? (
                              <NextLink
                                href={`/admin/people/workers/${m.username}`}
                                className="hover:text-emerald-400 transition-colors"
                              >
                                {m.name}
                              </NextLink>
                            ) : (
                              m.name
                            )}
                          </div>
                          {m.phone && <div className="text-gray-400 font-mono text-[11px]">{m.phone}</div>}
                        </div>
                        {m.username && (
                          <NextLink
                            href={`/admin/people/workers/${m.username}`}
                            className="text-[11px] text-[#A78BFA] hover:text-white"
                          >
                            Profile &rarr;
                          </NextLink>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Customer & Coordinator Snapshot */}
          <div className="bg-[#14151A] rounded-3xl border border-gray-800/80 p-6 shadow-xl space-y-4">
            {/* Customer Box */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-sky-400" />
                <span>Client Information</span>
              </span>
              <div className="p-3.5 rounded-2xl bg-[#1A1C23] border border-gray-800/80 space-y-2">
                <div className="font-bold text-sm text-gray-100">{enquiry.customerName}</div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {enquiry.customerPhone && (
                    <a
                      href={`tel:${enquiry.customerPhone}`}
                      className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{enquiry.customerPhone}</span>
                    </a>
                  )}
                  {enquiry.customerEmail && (
                    <a
                      href={`mailto:${enquiry.customerEmail}`}
                      className="px-2.5 py-1 rounded-xl bg-[#7B4DFF]/20 text-[#A78BFA] hover:bg-[#7B4DFF]/30 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                    >
                      <Mail className="w-3 h-3" />
                      <span>Email Client</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Office Coordinator Box */}
            <div className="space-y-2 pt-2 border-t border-gray-800/60">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#A78BFA]" />
                <span>Office Coordinator</span>
              </span>
              <div className="p-3.5 rounded-2xl bg-[#1A1C23] border border-gray-800/80">
                <div className="font-bold text-sm text-gray-100">
                  {enquiry.officeStaff?.name || 'KK Group Central Dispatch'}
                </div>
                {enquiry.officeStaff?.username && (
                  <div className="text-xs text-[#A78BFA] font-mono mt-0.5">
                    @{enquiry.officeStaff.username}
                  </div>
                )}
                {enquiry.officeStaff?.phone && (
                  <div className="text-xs text-gray-400 font-mono mt-1">
                    Phone: {enquiry.officeStaff.phone}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Assign / Squad Dispatch Modal */}
      <AssignWorkerModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        enquiry={enquiry}
        token={token}
        onAssignedSuccess={() => {
          setIsAssignModalOpen(false);
          fetchEnquiryDetails();
        }}
      />

      {/* Embedded Wage & Billing Pay Modal */}
      <UpdateJobPayModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        enquiry={enquiry}
        token={token}
        onPayUpdatedSuccess={() => {
          setIsPayModalOpen(false);
          fetchEnquiryDetails();
        }}
      />

      {/* ── PAUSE CONFIRMATION MODAL ───────────────────────────── */}
      {isPauseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#14151A] rounded-3xl border border-gray-800 shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Pause className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-100">Pause Work Timer</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Select the reason for this break</p>
                </div>
              </div>
              <button onClick={() => setIsPauseModalOpen(false)} className="p-1.5 rounded-xl bg-[#1A1C23] hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-800 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {/* Quick-select reason pills */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Break Reason</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Lunch Break', 'Breakfast', 'Tea / Snack', 'Prayer Break', 'Rest Break', 'Other'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setAdminPauseReason(r)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        adminPauseReason === r
                          ? 'bg-amber-500/25 border-amber-500/60 text-amber-300'
                          : 'bg-[#1A1C23] border-gray-800 text-gray-400 hover:text-gray-200 hover:border-gray-700'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              {/* Optional notes */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Additional Notes <span className="text-gray-600 normal-case font-medium">(optional)</span></label>
                <textarea
                  rows={2}
                  value={adminPauseNotes}
                  onChange={(e) => setAdminPauseNotes(e.target.value)}
                  placeholder="e.g. Customer requested a short wait..."
                  className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-amber-500/60 resize-none transition-colors"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsPauseModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#1A1C23] hover:bg-gray-800 text-gray-300 border border-gray-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAdminPause}
                  disabled={isSubmittingAction}
                  className="flex-1 py-2.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-black transition-all shadow-md shadow-amber-500/25 disabled:opacity-60 cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  {isSubmittingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Pause className="w-3.5 h-3.5" />}
                  {isSubmittingAction ? 'Pausing...' : 'Confirm Pause'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── RESUME CONFIRMATION MODAL ──────────────────────────── */}
      {isResumeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#14151A] rounded-3xl border border-gray-800 shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Play className="w-5 h-5 fill-blue-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-100">Resume Work Timer</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Confirm the squad is back on-site</p>
                </div>
              </div>
              <button onClick={() => setIsResumeModalOpen(false)} className="p-1.5 rounded-xl bg-[#1A1C23] hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-800 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-gray-300 mb-5">
                This will end the current break and resume the work timer for{' '}
                <strong className="text-white">{enquiry.serviceName}</strong>.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsResumeModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#1A1C23] hover:bg-gray-800 text-gray-300 border border-gray-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAdminResume}
                  disabled={isSubmittingAction}
                  className="flex-1 py-2.5 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md shadow-blue-600/25 disabled:opacity-60 cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  {isSubmittingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                  {isSubmittingAction ? 'Resuming...' : 'Resume Work'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── COMPLETE WORK CONFIRMATION MODAL ───────────────────── */}
      {isCompleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#14151A] rounded-3xl border border-gray-800 shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-100">Mark Work as Complete</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Finalise the on-site execution record</p>
                </div>
              </div>
              <button onClick={() => setIsCompleteModalOpen(false)} className="p-1.5 rounded-xl bg-[#1A1C23] hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-800 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {/* Timer summary */}
              {liveTimerData && (
                <div className="p-3.5 rounded-2xl bg-[#1A1C23] border border-gray-800 flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-semibold">Net Work Time</span>
                  <span className="font-mono font-black text-emerald-400 text-base">{liveTimerData.workTimeFormatted}</span>
                </div>
              )}
              {/* Units field */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Units Completed <span className="text-gray-600 normal-case font-medium">({enquiry.unitLabel || 'Units'})</span>
                </label>
                <input
                  type="number"
                  min={0}
                  value={completeUnits}
                  onChange={(e) => setCompleteUnits(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-emerald-500/60 transition-colors"
                  placeholder={`e.g. ${enquiry.estimatedUnits || 1}`}
                />
              </div>
              {/* Completion notes */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Completion Notes <span className="text-gray-600 normal-case font-medium">(optional)</span></label>
                <textarea
                  rows={2}
                  value={completeNotes}
                  onChange={(e) => setCompleteNotes(e.target.value)}
                  placeholder="e.g. All palm trees cleared, site cleaned up..."
                  className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/60 resize-none transition-colors"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCompleteModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#1A1C23] hover:bg-gray-800 text-gray-300 border border-gray-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAdminComplete}
                  disabled={isSubmittingAction}
                  className="flex-1 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-600/25 disabled:opacity-60 cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  {isSubmittingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  {isSubmittingAction ? 'Completing...' : 'Confirm Complete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODIFY TIME LOGS MODAL ───────────────────────────────── */}
      {isModifyTimeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#14151A] rounded-3xl border border-gray-800 shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-300">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-100">Modify Time Logs</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Adjust recorded duration and breaks</p>
                </div>
              </div>
              <button onClick={() => setIsModifyTimeModalOpen(false)} className="p-1.5 rounded-xl bg-[#1A1C23] hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-800 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Net Work Duration (Minutes)</label>
                <input
                  type="number"
                  min={0}
                  value={editWorkDurationMinutes}
                  onChange={(e) => setEditWorkDurationMinutes(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#7B4DFF]/60 transition-colors"
                  placeholder="Total effective work minutes"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Break Time (Minutes)</label>
                <input
                  type="number"
                  min={0}
                  value={editTotalBreakMinutes}
                  onChange={(e) => setEditTotalBreakMinutes(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#7B4DFF]/60 transition-colors"
                  placeholder="Total break minutes"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsModifyTimeModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#1A1C23] hover:bg-gray-800 text-gray-300 border border-gray-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleModifyTime}
                  disabled={isSubmittingAction}
                  className="flex-1 py-2.5 rounded-xl text-xs font-black bg-[#7B4DFF] hover:bg-[#6839EF] text-white transition-all shadow-md shadow-[#7B4DFF]/25 disabled:opacity-60 cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  {isSubmittingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  {isSubmittingAction ? 'Saving...' : 'Save Time Logs'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
