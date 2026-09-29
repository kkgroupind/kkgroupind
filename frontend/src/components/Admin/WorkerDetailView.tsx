'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  Calendar,
  Shield,
  Mail,
  Phone,
  User as UserIcon,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Briefcase,
  ExternalLink,
  Users,
  Building,
  Sparkles,
  Award,
  Clock,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  HardHat,
  Search,
  Filter,
  Pencil,
  Activity,
  Layers,
  FileText,
  BadgeCheck,
  MapPin,
  Navigation,
  Compass,
  PhoneCall,
  CheckCircle,
  Timer,
  AlertCircle,
  Coffee,
  DollarSign,
  CreditCard,
  Play,
  Pause,
  Loader2,
  StopCircle,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { api, User, AttendanceRecord, ServiceEnquiry, EnquiryService } from '@/services';
import { EditPersonModal } from './edit-person-modal';
import { ModifyWorkerJobModal } from './modify-worker-job-modal';

interface WorkerDetailViewProps {
  username: string;
  backHref?: string;
  categoryLabel?: string;
}

type WorkerTabType = 'current-work' | 'activities' | 'profile' | 'history' | 'security';

export function WorkerDetailView({
  username,
  backHref = '/admin/people/workers',
  categoryLabel = 'Workers',
}: WorkerDetailViewProps) {
  const { token, user: currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [person, setPerson] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedJobToModify, setSelectedJobToModify] = useState<ServiceEnquiry | null>(null);
  const [isModifyJobModalOpen, setIsModifyJobModalOpen] = useState(false);

  const handleOpenModifyJob = (job: ServiceEnquiry) => {
    setSelectedJobToModify(job);
    setIsModifyJobModalOpen(true);
  };

  // Active Pill Tab (Default to 'current-work' for instant visibility into ongoing jobs!)
  const [activeTab, setActiveTab] = useState<WorkerTabType>('current-work');

  // Calendar State
  const today = useMemo(() => new Date(), []);
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });

  // History search & filter
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState<string>('ALL');

  const fetchWorkerDetails = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getPersonByUsername(username, token);
      if (!data) {
        throw new Error('Worker record not found');
      }
      setPerson(data);
    } catch (err: any) {
      console.error('Failed to load worker details', err);
      setError(err?.message || 'Could not load worker profile');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [token, username]);

  useEffect(() => {
    if (!authLoading) {
      if (!token) {
        router.push('/admin/login');
      } else {
        fetchWorkerDetails();
      }
    }
  }, [authLoading, token, fetchWorkerDetails, router]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchWorkerDetails();
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleDelete = async () => {
    if (!person || !token) return;
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete Worker "${person.name || person.username}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await api.deletePerson(person.id, token);
      router.push(backHref);
    } catch (err: any) {
      console.error('Failed to delete worker', err);
      alert(err?.message || 'Failed to delete worker');
      setIsDeleting(false);
    }
  };

  // Find ongoing or currently active work order
  const ongoingJob = useMemo(() => {
    if (!person?.workerAssignments) return null;
    return (
      person.workerAssignments.find((j) => j.status === 'IN_PROGRESS') ||
      person.workerAssignments.find((j) => j.status === 'ASSIGNED') ||
      null
    );
  }, [person?.workerAssignments]);

  // Live Chronometer Ticker for Ongoing Work Orders
  const [nowTimestamp, setNowTimestamp] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => {
      setNowTimestamp(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatSecondsToHMS = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getLiveTimerData = useCallback(
    (order: ServiceEnquiry | null) => {
      if (!order || order.status !== 'IN_PROGRESS' || !order.workStartedAt) {
        return null;
      }
      const spec = (order.specificationDetails as any) || {};
      const isBreakActive = Boolean(spec.activeBreak || spec.isTimerPaused);
      const activeBreak = spec.activeBreak;

      const startMs = new Date(order.workStartedAt).getTime();
      const nowMs = nowTimestamp;
      const breaks = Array.isArray(spec.breaks) ? spec.breaks : [];
      const pastBreaksSeconds = breaks.reduce(
        (acc: number, b: any) =>
          acc + (b.durationSeconds || (b.durationMinutes || 0) * 60),
        0
      );

      let workSeconds = 0;
      let breakSeconds = 0;

      if (isBreakActive && activeBreak?.startedAt) {
        const breakStartMs = new Date(activeBreak.startedAt).getTime();
        breakSeconds = Math.max(0, Math.floor((nowMs - breakStartMs) / 1000));
        workSeconds = Math.max(
          0,
          Math.floor((breakStartMs - startMs) / 1000) - pastBreaksSeconds
        );
      } else {
        workSeconds = Math.max(
          0,
          Math.floor((nowMs - startMs) / 1000) - pastBreaksSeconds
        );
      }

      return {
        isOnBreak: isBreakActive,
        activeBreakReason: activeBreak?.reason || 'Break',
        workSeconds,
        breakSeconds,
        workTimeFormatted: formatSecondsToHMS(workSeconds),
        breakTimeFormatted: formatSecondsToHMS(breakSeconds),
      };
    },
    [nowTimestamp]
  );

  // Admin Operational Action Modals (Pause, Resume, Complete)
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const [adminPauseReason, setAdminPauseReason] = useState('Lunch Break');
  const [adminPauseNotes, setAdminPauseNotes] = useState('');

  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [completeUnits, setCompleteUnits] = useState<number | ''>('');
  const [completeNotes, setCompleteNotes] = useState('');

  const [isSubmittingAdminAction, setIsSubmittingAdminAction] = useState(false);

  const handleAdminPauseTimer = async () => {
    if (!ongoingJob || !token) return;
    setIsSubmittingAdminAction(true);
    try {
      await EnquiryService.pauseWorkTimer(
        ongoingJob.id,
        { reason: adminPauseReason, notes: adminPauseNotes.trim() || undefined },
        token
      );
      setIsPauseModalOpen(false);
      setAdminPauseNotes('');
      await fetchWorkerDetails();
    } catch (err: any) {
      alert(err?.message || 'Failed to pause timer');
    } finally {
      setIsSubmittingAdminAction(false);
    }
  };

  const handleAdminResumeTimer = async () => {
    if (!ongoingJob || !token) return;
    setIsSubmittingAdminAction(true);
    try {
      await EnquiryService.resumeWorkTimer(ongoingJob.id, {}, token);
      setIsResumeModalOpen(false);
      await fetchWorkerDetails();
    } catch (err: any) {
      alert(err?.message || 'Failed to resume timer');
    } finally {
      setIsSubmittingAdminAction(false);
    }
  };

  const handleAdminCompleteWork = async () => {
    if (!ongoingJob || !token) return;
    setIsSubmittingAdminAction(true);
    try {
      const timerData = getLiveTimerData(ongoingJob);
      const durationMinutes = timerData
        ? Math.max(1, Math.round(timerData.workSeconds / 60))
        : undefined;
      await EnquiryService.stopWorkTimer(
        ongoingJob.id,
        {
          durationMinutes,
          completedUnits: completeUnits === '' ? undefined : Number(completeUnits),
          completionNotes: completeNotes.trim() || undefined,
        },
        token
      );
      setIsCompleteModalOpen(false);
      await fetchWorkerDetails();
    } catch (err: any) {
      alert(err?.message || 'Failed to complete work');
    } finally {
      setIsSubmittingAdminAction(false);
    }
  };

  // Calendar calculations
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth(); // 0-indexed

  const monthName = currentMonthDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // First day of current month (0: Sun, 1: Mon, ..., 6: Sat)
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  // Adjust so Monday is 0, Sunday is 6
  const startDayOffset = (firstDayOfWeek + 6) % 7;

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setCurrentMonthDate(new Date(now.getFullYear(), now.getMonth(), 1));
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    setSelectedDateStr(`${y}-${m}-${d}`);
  };

  // Map of attendances by date (YYYY-MM-DD)
  const attendanceMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    if (person?.attendances) {
      for (const att of person.attendances) {
        map.set(att.date, att);
      }
    }
    return map;
  }, [person?.attendances]);

  // Map of jobs by date (YYYY-MM-DD from createdAt)
  const jobsByDate = useMemo(() => {
    const map = new Map<string, ServiceEnquiry[]>();
    if (person?.workerAssignments) {
      for (const job of person.workerAssignments) {
        if (job.createdAt) {
          const dateStr = job.createdAt.split('T')[0];
          const existing = map.get(dateStr) || [];
          existing.push(job);
          map.set(dateStr, existing);
        }
      }
    }
    return map;
  }, [person?.workerAssignments]);

  // Data for the currently selected date
  const selectedAttendance = attendanceMap.get(selectedDateStr);
  const selectedJobs = jobsByDate.get(selectedDateStr) || [];

  const todayStr = useMemo(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [today]);

  const isSelectedDateToday = selectedDateStr === todayStr;

  // Formatted date string for header
  const formattedSelectedDate = useMemo(() => {
    const [y, m, d] = selectedDateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [selectedDateStr]);

  // Filtered jobs in the History tab
  const filteredJobs = useMemo(() => {
    const list = person?.workerAssignments || [];
    return list.filter((job) => {
      const matchesFilter = historyFilter === 'ALL' || job.status === historyFilter;
      const q = historySearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        job.serviceName.toLowerCase().includes(q) ||
        job.trackingNumber.toLowerCase().includes(q) ||
        (job.customerName && job.customerName.toLowerCase().includes(q)) ||
        (job.location && job.location.toLowerCase().includes(q));
      return matchesFilter && matchesSearch;
    });
  }, [person?.workerAssignments, historyFilter, historySearch]);

  if (authLoading || (isLoading && !person)) {
    return (
      <div className="max-w-[1550px] mx-auto space-y-6 pb-12 animate-pulse">
        <div className="h-10 w-48 bg-[#14151A] rounded-xl border border-gray-800" />
        <div className="h-28 bg-[#14151A] rounded-3xl border border-gray-800" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 h-[600px] bg-[#14151A] rounded-3xl border border-gray-800" />
          <div className="lg:col-span-8 h-[600px] bg-[#14151A] rounded-3xl border border-gray-800" />
        </div>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="max-w-[1100px] mx-auto space-y-6 pb-12">
        <NextLink
          href={backHref}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {categoryLabel}
        </NextLink>

        <div className="bg-[#14151A] rounded-3xl border border-gray-800 p-12 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-gray-100 mb-2">Worker Not Found</h2>
          <p className="text-gray-500 text-sm max-w-md mb-6">
            {error || `The operative @${username} does not exist or has been removed.`}
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
              href={backHref}
              className="px-4 py-2 bg-[#7B4DFF] hover:bg-[#6A3DEE] text-white rounded-xl text-sm font-medium transition-colors"
            >
              Return to {categoryLabel}
            </NextLink>
          </div>
        </div>
      </div>
    );
  }

  const displayName = person.name || person.username || 'Field Operative';
  const initial = displayName.charAt(0).toUpperCase();
  const workerStatus = person.workerStatus || 'AVAILABLE';

  const completedJobsCount = (person.workerAssignments || []).filter((j) => j.status === 'COMPLETED').length;

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-14 select-none">
      {/* ========================================================
          1. TOP BREADCRUMB & ACTION BAR
      ======================================================== */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <NextLink
            href={backHref}
            className="p-2.5 rounded-2xl bg-[#14151A] hover:bg-[#1A1C23] text-gray-400 hover:text-white border border-gray-800 transition-all shadow-sm"
            title="Back to Workers List"
          >
            <ArrowLeft className="w-4 h-4" />
          </NextLink>
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <NextLink href="/admin/dashboard" className="hover:text-gray-300 transition-colors">
                Admin
              </NextLink>
              <span>/</span>
              <NextLink href={backHref} className="hover:text-gray-300 transition-colors">
                {categoryLabel}
              </NextLink>
              <span>/</span>
              <span className="text-[#A78BFA] font-mono">@{person.username}</span>
            </div>
            <h1 className="text-2xl font-black text-gray-100 tracking-tight flex items-center gap-2.5 mt-0.5">
              <span>{displayName}</span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/25">
                Field Operations Specialist
              </span>
            </h1>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#7B4DFF]/15 hover:bg-[#7B4DFF]/25 border border-[#7B4DFF]/30 text-[#A78BFA] hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Modify Account</span>
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#14151A] hover:bg-[#1A1C23] border border-gray-800 text-gray-300 hover:text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#7B4DFF] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Data'}</span>
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 hover:text-rose-300 rounded-xl text-xs font-bold transition-all disabled:opacity-50 ml-auto md:ml-0 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Removing...' : 'Delete Profile'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          2. MAIN BODY: LEFT PROFILE CARD + RIGHT PILL NAVS CONTAINER
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================
            LEFT COLUMN: THE PROFILE HERO CARD (KEPT RIGHT HERE)
        ======================================================== */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          <div className="bg-[#14151A] rounded-3xl border border-gray-800/80 overflow-hidden shadow-xl relative group">
            {/* Top decorative gradient banner */}
            <div className="h-32 bg-gradient-to-br from-emerald-600/35 via-teal-950/40 to-transparent relative p-4 flex justify-between items-start">
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-gray-200 border border-white/10 shadow-xs">
                OPERATIVE ID
              </span>
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold shadow-xs ${
                  person.isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    person.isActive ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'
                  }`}
                />
                <span>{person.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>

            <div className="px-5 pb-5 -mt-16 relative">
              {/* Avatar with Gradient Squircle Frame */}
              <div className="relative inline-block mb-3">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-[#7B4DFF] p-[3px] shadow-[0_8px_25px_rgba(42,131,95,0.35)]">
                  <div className="w-full h-full bg-[#1A1C23] rounded-[21px] flex items-center justify-center text-3xl font-black text-white overflow-hidden">
                    {person.avatar ? (
                      <img
                        src={person.avatar}
                        alt={displayName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : null}
                    {!person.avatar && <span>{initial}</span>}
                  </div>
                </div>
              </div>

              {/* Names & Position */}
              <h2 className="text-xl font-black text-gray-100 tracking-tight leading-snug">
                {displayName}
              </h2>
              <p className="text-xs font-semibold text-gray-400 mt-0.5">
                Field Operations & Agricultural Services
              </p>
              <p className="text-xs text-emerald-400 font-mono mt-1">@{person.username}</p>

              {/* Field Duty / Operational Status Pill */}
              <div className="mt-4 p-3 rounded-2xl bg-[#1A1C23] border border-gray-800/80 flex items-center justify-between shadow-xs">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    Field Duty Status
                  </span>
                  <span className="text-xs font-extrabold text-white mt-0.5 flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        workerStatus === 'BUSY'
                          ? 'bg-amber-400 animate-ping'
                          : workerStatus === 'AVAILABLE'
                          ? 'bg-emerald-400 animate-pulse'
                          : 'bg-slate-400'
                      }`}
                    />
                    <span>
                      {workerStatus === 'BUSY'
                        ? 'On Ongoing Job'
                        : workerStatus === 'AVAILABLE'
                        ? 'Available for Dispatch'
                        : 'Off Duty / On Leave'}
                    </span>
                  </span>
                </div>
                <div
                  className={`p-2 rounded-xl text-white shadow-sm ${
                    workerStatus === 'BUSY'
                      ? 'bg-amber-500'
                      : workerStatus === 'AVAILABLE'
                      ? 'bg-emerald-600'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  <HardHat className="w-4 h-4" />
                </div>
              </div>

              {/* Contact Snapshot */}
              <div className="mt-4 space-y-2 text-xs">
                {person.email && (
                  <div className="flex items-center gap-2.5 text-gray-300 bg-[#1A1C23] p-2.5 rounded-xl border border-gray-800/60">
                    <Mail className="w-4 h-4 text-gray-500 shrink-0" />
                    <span className="truncate">{person.email}</span>
                  </div>
                )}
                {person.phone && (
                  <a
                    href={`tel:${person.phone}`}
                    className="flex items-center gap-2.5 text-gray-300 hover:text-white bg-[#1A1C23] hover:bg-gray-800/80 p-2.5 rounded-xl border border-gray-800/60 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-gray-500 shrink-0" />
                    <span>{person.phone}</span>
                  </a>
                )}
              </div>

              {/* Quick Details Snapshot */}
              <div className="mt-4 pt-4 border-t border-gray-800/60 space-y-2 text-xs text-gray-400">
                <div className="flex justify-between items-center py-1">
                  <span>UUID</span>
                  <button
                    type="button"
                    onClick={() => handleCopyId(person.id)}
                    className="inline-flex items-center gap-1 font-mono text-gray-300 hover:text-white cursor-pointer"
                  >
                    <span>{person.id.slice(0, 8)}...</span>
                    {copiedId ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-gray-500" />
                    )}
                  </button>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-gray-800/40">
                  <span>Completed Jobs</span>
                  <span className="font-extrabold text-emerald-400">{completedJobsCount} Orders</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-gray-800/40">
                  <span>Total Assigned</span>
                  <span className="font-bold text-gray-200">
                    {person._count?.workerAssignments || person.workerAssignments?.length || 0} Orders
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-gray-800/40">
                  <span>Attendance Records</span>
                  <span className="font-bold text-gray-200">
                    {person._count?.attendances || person.attendances?.length || 0} Days
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            RIGHT COLUMN: PILL NAVS + DYNAMIC CONTENT PANEL
        ======================================================== */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          {/* ====================================================
              TOP PILL NAVIGATION BAR
          ==================================================== */}
          <div className="bg-[#14151A] rounded-2xl sm:rounded-3xl p-2 border border-gray-800/80 shadow-lg flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('current-work')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl sm:rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'current-work'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-[1.02]'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#1A1C23]'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Current Work</span>
                {ongoingJob && (
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('activities')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl sm:rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'activities'
                    ? 'bg-[#7B4DFF] text-white shadow-md shadow-[#7B4DFF]/30 scale-[1.02]'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#1A1C23]'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Activities & Calendar</span>
                {person.attendances && person.attendances.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-white text-[10px] font-black">
                    {person.attendances.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl sm:rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'history'
                    ? 'bg-[#7B4DFF] text-white shadow-md shadow-[#7B4DFF]/30 scale-[1.02]'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#1A1C23]'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Work Orders</span>
                {person.workerAssignments && person.workerAssignments.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[10px] font-black">
                    {person.workerAssignments.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl sm:rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'profile'
                    ? 'bg-[#7B4DFF] text-white shadow-md shadow-[#7B4DFF]/30 scale-[1.02]'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#1A1C23]'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                <span>Profile Details</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl sm:rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'security'
                    ? 'bg-[#7B4DFF] text-white shadow-md shadow-[#7B4DFF]/30 scale-[1.02]'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#1A1C23]'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Security</span>
              </button>
            </div>

            {/* Quick date indicator badge */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1A1C23] border border-gray-800 text-[11px] text-gray-400">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Today: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>

          {/* ====================================================
              TAB 1: CURRENT WORK (ONGOING DISPATCH & LOCATION)
          ==================================================== */}
          {activeTab === 'current-work' && (
            <div className="space-y-6">
              {ongoingJob ? (
                <div className="bg-[#14151A] rounded-3xl border border-gray-800/80 p-6 sm:p-7 shadow-xl space-y-6 relative overflow-hidden">
                  {/* Subtle decorative glow */}
                  <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

                  {/* Top Status Banner */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-gray-800/80">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
                        <Activity className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                            Ongoing Work Order
                          </span>
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-black text-gray-100 tracking-tight mt-0.5">
                          {ongoingJob.serviceName}
                        </h3>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {ongoingJob.trackingNumber}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-xl text-xs font-black border ${
                          ongoingJob.status === 'IN_PROGRESS'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        }`}
                      >
                        {ongoingJob.status === 'IN_PROGRESS' ? 'In Progress On Site' : 'Assigned & Dispatched'}
                      </span>

                      {/* Admin Live Operational Action Buttons */}
                      {ongoingJob.status === 'IN_PROGRESS' && (() => {
                        const timerData = getLiveTimerData(ongoingJob);
                        const isOnBreak = timerData?.isOnBreak;

                        return (
                          <>
                            {isOnBreak ? (
                              <button
                                type="button"
                                onClick={() => setIsResumeModalOpen(true)}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all shadow-xs cursor-pointer animate-pulse"
                                title="Resume timer after worker break"
                              >
                                <Play className="w-3.5 h-3.5 fill-emerald-300" />
                                <span>Resume Timer</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setIsPauseModalOpen(true)}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all shadow-xs cursor-pointer"
                                title="Pause timer for break (Breakfast, Lunch, etc.)"
                              >
                                <Pause className="w-3.5 h-3.5" />
                                <span>Pause Timer</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setCompleteUnits(ongoingJob.completedUnits ?? '');
                                setIsCompleteModalOpen(true);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-bold transition-all shadow-xs cursor-pointer"
                              title="Finish and finalize this job"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Complete Work</span>
                            </button>
                          </>
                        );
                      })()}

                      <button
                        type="button"
                        onClick={() => handleOpenModifyJob(ongoingJob)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all shadow-xs cursor-pointer"
                        title="Modify worked hours, tree counts, wages, or status"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Modify Work Log</span>
                      </button>
                    </div>
                  </div>

                  {/* Live Field Telemetry Metrics Strip */}
                  {(() => {
                    const ongoingSpecs = (ongoingJob.specificationDetails as Record<string, any>) || {};
                    const siteReachedAt = ongoingSpecs.siteReachedAt;
                    const squadMembers = Array.isArray(ongoingSpecs.squadMembers) ? ongoingSpecs.squadMembers : [];
                    const interimUnits = ongoingSpecs.interimUnits ?? ongoingJob.completedUnits;
                    const timerData = getLiveTimerData(ongoingJob);

                    return (
                      <div className="space-y-4">
                        {/* Live Counting Chronometer Hero Banner */}
                        {ongoingJob.status === 'IN_PROGRESS' && timerData && (
                          <div
                            className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-lg ${
                              timerData.isOnBreak
                                ? 'bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-purple-950/40 border-amber-500/30'
                                : 'bg-gradient-to-r from-emerald-950/40 via-emerald-900/20 to-teal-950/40 border-emerald-500/30'
                            }`}
                          >
                            <div className="flex items-center gap-3.5">
                              <div
                                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                                  timerData.isOnBreak
                                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                                    : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                }`}
                              >
                                {timerData.isOnBreak ? (
                                  <Coffee className="w-5 h-5 animate-pulse" />
                                ) : (
                                  <Timer className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`w-2 h-2 rounded-full ${
                                      timerData.isOnBreak ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-ping'
                                    }`}
                                  />
                                  <span
                                    className={`text-[11px] font-black uppercase tracking-wider ${
                                      timerData.isOnBreak ? 'text-amber-400' : 'text-emerald-400'
                                    }`}
                                  >
                                    {timerData.isOnBreak
                                      ? `Break in Progress: ${timerData.activeBreakReason}`
                                      : 'Live On-Site Work Chronometer'}
                                  </span>
                                </div>
                                <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white mt-0.5">
                                  {timerData.isOnBreak
                                    ? timerData.breakTimeFormatted
                                    : timerData.workTimeFormatted}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                              {timerData.isOnBreak ? (
                                <div className="text-right">
                                  <div className="text-[10px] uppercase font-bold text-gray-400">Accrued Work Time</div>
                                  <div className="text-sm font-black font-mono text-emerald-400">
                                    {timerData.workTimeFormatted}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-right">
                                  <div className="text-[10px] uppercase font-bold text-gray-400">Started At</div>
                                  <div className="text-xs font-bold font-mono text-gray-300">
                                    {ongoingJob.workStartedAt
                                      ? new Date(ongoingJob.workStartedAt).toLocaleTimeString('en-US', {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                          second: '2-digit',
                                        })
                                      : 'In Progress'}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#1A1C23] border border-gray-800/80">
                          {/* Site Arrival */}
                          <div className="p-3 rounded-xl bg-[#14151A] border border-gray-800/60">
                            <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Site Arrival</span>
                            </span>
                            <div className="text-xs font-bold text-gray-200 mt-1">
                              {siteReachedAt ? (
                                <span className="text-emerald-400 font-mono">
                                  {new Date(siteReachedAt).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              ) : (
                                <span className="text-gray-500">In Transit</span>
                              )}
                            </div>
                          </div>

                          {/* Work Started */}
                          <div className="p-3 rounded-xl bg-[#14151A] border border-gray-800/60">
                            <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1.5">
                              <Timer className="w-3.5 h-3.5 text-amber-400" />
                              <span>Work Started</span>
                            </span>
                            <div className="text-xs font-bold text-gray-200 mt-1">
                              {ongoingJob.workStartedAt ? (
                                <span className="text-amber-300 font-mono">
                                  {new Date(ongoingJob.workStartedAt).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              ) : (
                                <span className="text-gray-500">Timer Off</span>
                              )}
                            </div>
                          </div>

                          {/* Break Status */}
                          <div className="p-3 rounded-xl bg-[#14151A] border border-gray-800/60">
                            <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1.5">
                              <Coffee className="w-3.5 h-3.5 text-purple-400" />
                              <span>Break Status</span>
                            </span>
                            <div className="text-xs font-bold mt-1">
                              {timerData?.isOnBreak ? (
                                <span className="text-purple-300 flex items-center gap-1 animate-pulse">
                                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                                  <span>{timerData.activeBreakReason} ({timerData.breakTimeFormatted})</span>
                                </span>
                              ) : (
                                <span className="text-emerald-400 flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                  <span>Active on Site</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Units Logged */}
                          <div className="p-3 rounded-xl bg-[#14151A] border border-gray-800/60">
                            <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1.5">
                              <Activity className="w-3.5 h-3.5 text-sky-400" />
                              <span>Completed / Draft</span>
                            </span>
                            <div className="text-xs font-bold text-gray-200 mt-1">
                              {interimUnits !== undefined && interimUnits !== null ? (
                                <span className="text-sky-300 font-mono">
                                  {interimUnits} {ongoingJob.unitLabel || 'Units'}
                                </span>
                              ) : (
                                <span className="text-gray-500">0 Logged</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Squad Members Assigned */}
                        {squadMembers.length > 1 && (
                          <div className="p-4 rounded-2xl bg-[#1A1C23] border border-gray-800/80 space-y-2">
                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-amber-400" />
                              <span>Squad Teammates ({squadMembers.length} Workers Assigned)</span>
                            </span>
                            <div className="flex flex-wrap gap-2 pt-1">
                              {squadMembers.map((m: any) => (
                                <div
                                  key={m.id}
                                  className="px-3 py-1.5 rounded-xl bg-[#14151A] border border-gray-800 text-xs flex items-center gap-2"
                                >
                                  <span className="font-bold text-gray-200">{m.name}</span>
                                  {m.isLeader && (
                                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400">
                                      Lead
                                    </span>
                                  )}
                                  {m.phone && <span className="text-gray-500 font-mono text-[11px]">{m.phone}</span>}
                                  {m.username && m.username !== username && (
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

                        {/* Break Records & Time Audit Log */}
                        {(() => {
                          const breaks = Array.isArray(ongoingSpecs.breaks)
                            ? ongoingSpecs.breaks
                            : (Array.isArray(ongoingSpecs.breakLog) ? ongoingSpecs.breakLog : []);
                          const totalBreakMins = ongoingSpecs.totalBreakMinutes ?? breaks.reduce((acc: number, b: any) => acc + (b.durationMinutes || 0), 0);
                          const actualMins = ongoingSpecs.actualWorkMinutes ?? ongoingJob.workDurationMinutes ?? 0;
                          const grossMins = ongoingSpecs.grossDurationMinutes ?? (actualMins + totalBreakMins);

                          if (breaks.length === 0 && !timerData?.isOnBreak && totalBreakMins === 0) return null;

                          return (
                            <div className="p-4 rounded-2xl bg-[#1A1C23] border border-gray-800/80 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1.5">
                                  <Coffee className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Time Audit &amp; Break Records ({breaks.length} Logged)</span>
                                </span>
                                <div className="flex items-center gap-2 text-[10px] font-mono">
                                  <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                    Net: {timerData ? timerData.workTimeFormatted : `${actualMins}m`}
                                  </span>
                                  <span className="text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                    Breaks: {totalBreakMins}m
                                  </span>
                                  {grossMins > 0 && (
                                    <span className="text-gray-400 bg-gray-800 px-2 py-0.5 rounded">
                                      Gross: {grossMins}m
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                                {breaks.map((b: any, bIdx: number) => {
                                  const startStr = b.startedAt ? new Date(b.startedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
                                  const endStr = b.endedAt ? new Date(b.endedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
                                  const dur = b.durationMinutes !== undefined ? `${b.durationMinutes}m` : 'Ongoing';

                                  return (
                                    <div
                                      key={bIdx}
                                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#14151A] border border-gray-800/80 text-xs"
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                                        <div className="min-w-0">
                                          <span className="font-bold text-gray-200 block truncate">
                                            {b.reason || 'Rest Break'}
                                          </span>
                                          {(startStr || endStr) && (
                                            <span className="text-[10px] text-gray-500 font-mono block">
                                              {startStr} {endStr ? `→ ${endStr}` : '(In Progress)'}
                                            </span>
                                          )}
                                          {b.notes && (
                                            <span className="text-[10px] text-gray-400 italic block truncate">
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
                    );
                  })()}

                  {/* Location & GPS Navigation Banner */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-[#1A1C23] via-[#1E202A] to-[#1A1C23] border border-gray-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-[#A78BFA] shrink-0 mt-0.5">
                        <MapPin className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                          Site Location &amp; Coordinates
                        </span>
                        <h4 className="text-sm sm:text-base font-black text-gray-100 mt-0.5">
                          {ongoingJob.location || 'Kerala Operations Sector'}
                        </h4>
                        <span className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                          <Compass className="w-3.5 h-3.5 text-gray-500" />
                          <span>Direct GPS Navigation Ready</span>
                        </span>
                      </div>
                    </div>

                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(
                        (ongoingJob.location || 'Kerala') + ', Kerala, India'
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
                    >
                      <Navigation className="w-4 h-4 fill-white rotate-45" />
                      <span>Open in Google Maps</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                    </a>
                  </div>

                  {/* Detailed Information Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Customer Details Box */}
                    <div className="p-4 rounded-2xl bg-[#1A1C23] border border-gray-800/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-sky-400" />
                          <span>Client Information</span>
                        </span>
                        {ongoingJob.customerPhone && (
                          <a
                            href={`tel:${ongoingJob.customerPhone}`}
                            className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[11px] font-bold transition-colors inline-flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Call Client</span>
                          </a>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="text-sm font-bold text-gray-100">
                          {ongoingJob.customerName || 'Customer'}
                        </div>
                        {ongoingJob.customerPhone && (
                          <div className="text-gray-300 font-mono">{ongoingJob.customerPhone}</div>
                        )}
                        {ongoingJob.customerEmail && (
                          <div className="text-gray-400 truncate">{ongoingJob.customerEmail}</div>
                        )}
                      </div>
                    </div>

                    {/* Dispatch Coordinator Box */}
                    <div className="p-4 rounded-2xl bg-[#1A1C23] border border-gray-800/80 space-y-3">
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-[#A78BFA]" />
                        <span>Office Coordinator</span>
                      </span>

                      <div className="space-y-1">
                        <div className="text-sm font-bold text-gray-100">
                          {ongoingJob.officeStaff?.name || 'KK Group Central Operations'}
                        </div>
                        {ongoingJob.officeStaff?.username && (
                          <div className="text-[#A78BFA] font-mono text-xs">
                            @{ongoingJob.officeStaff.username}
                          </div>
                        )}
                        {ongoingJob.officeStaff?.phone && (
                          <div className="text-gray-400 font-mono text-xs">
                            Phone: {ongoingJob.officeStaff.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Message & Special Instructions */}
                  {ongoingJob.message && (
                    <div className="p-4 rounded-2xl bg-[#1A1C23] border border-gray-800/80 space-y-1 text-xs">
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        Work Order Requirements &amp; Notes
                      </span>
                      <p className="text-gray-200 mt-1 leading-relaxed">{ongoingJob.message}</p>
                    </div>
                  )}

                  {/* Timestamps & Action Footer */}
                  <div className="pt-3 border-t border-gray-800/60 flex flex-wrap items-center justify-between text-xs text-gray-400 gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span>
                        Order Initiated:{' '}
                        <strong className="text-gray-200">
                          {new Date(ongoingJob.createdAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </strong>
                      </span>
                      {ongoingJob.preferredDate && (
                        <span>
                          Preferred Date:{' '}
                          <strong className="text-emerald-400">
                            {new Date(ongoingJob.preferredDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </strong>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleOpenModifyJob(ongoingJob)}
                        className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 hover:text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Modify Log & Metrics</span>
                      </button>

                      <NextLink
                        href={`/admin/operations/enquiries/${ongoingJob.id}`}
                        className="px-4 py-2 rounded-xl bg-[#7B4DFF] hover:bg-[#6839EF] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                      >
                        <span>Full Work Order Command Center</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </NextLink>
                    </div>
                  </div>
                </div>
              ) : (
                /* Standby Operational State */
                <div className="bg-[#14151A] rounded-3xl border border-gray-800/80 p-8 sm:p-12 text-center shadow-xl flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shadow-md">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="max-w-md">
                    <h3 className="text-lg font-black text-gray-100 tracking-tight">
                      Operative Currently on Standby
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      {displayName} does not have any active work order in progress right now. The operative is{' '}
                      <strong className="text-emerald-400 font-bold">
                        {workerStatus === 'AVAILABLE' ? 'Available for new dispatches' : 'marked Off Duty'}
                      </strong>
                      .
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('history')}
                      className="px-4 py-2 rounded-xl bg-[#1A1C23] hover:bg-gray-800 text-gray-300 text-xs font-bold transition-colors border border-gray-800 cursor-pointer"
                    >
                      View Past Work Orders
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('activities')}
                      className="px-4 py-2 rounded-xl bg-[#7B4DFF] hover:bg-[#6A3DEE] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      Check Shift Activities
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ====================================================
              TAB 2: ACTIVITIES (CALENDAR & DATE INSPECTION)
          ==================================================== */}
          {activeTab === 'activities' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                {/* CALENDAR WIDGET (span 7) */}
                <div className="xl:col-span-7 bg-[#14151A] rounded-3xl border border-gray-800/80 p-5 sm:p-6 shadow-xl space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-800/80">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#7B4DFF]/15 border border-[#7B4DFF]/30 flex items-center justify-center text-[#A78BFA]">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-gray-100 tracking-tight leading-tight">
                          {monthName}
                        </h3>
                        <p className="text-[11px] font-semibold text-gray-400 mt-0.5">
                          Inspect worker shift attendance & jobs worked
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleJumpToToday}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border shadow-xs ${
                          isSelectedDateToday
                            ? 'bg-[#7B4DFF] text-white border-[#7B4DFF]'
                            : 'bg-[#1A1C23] hover:bg-gray-800 text-gray-300 border-gray-800'
                        }`}
                      >
                        Today
                      </button>

                      <button
                        type="button"
                        onClick={handlePrevMonth}
                        aria-label="Previous Month"
                        className="w-8 h-8 rounded-xl bg-[#1A1C23] hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={handleNextMonth}
                        aria-label="Next Month"
                        className="w-8 h-8 rounded-xl bg-[#1A1C23] hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Day Names Row */}
                  <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-gray-500 py-1 uppercase tracking-wider">
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                    <div>Sat</div>
                    <div>Sun</div>
                  </div>

                  {/* Month Days Matrix */}
                  <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                    {Array.from({ length: startDayOffset }).map((_, idx) => (
                      <div key={`empty-${idx}`} className="h-12 sm:h-14 rounded-2xl opacity-20 pointer-events-none" />
                    ))}

                    {Array.from({ length: daysInMonth }).map((_, idx) => {
                      const dayNum = idx + 1;
                      const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                      const isSelected = selectedDateStr === dayStr;
                      const isToday = todayStr === dayStr;

                      const hasAttendance = attendanceMap.has(dayStr);
                      const attendanceRecord = attendanceMap.get(dayStr);
                      const hasJobs = jobsByDate.has(dayStr);

                      return (
                        <button
                          key={dayStr}
                          type="button"
                          onClick={() => setSelectedDateStr(dayStr)}
                          className={`h-12 sm:h-14 rounded-2xl p-1.5 sm:p-2 flex flex-col items-center justify-between transition-all cursor-pointer relative group ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/40 ring-2 ring-emerald-300 scale-105 z-10'
                              : isToday
                              ? 'bg-[#1A1C23] text-emerald-400 ring-2 ring-emerald-500/50 hover:bg-[#20222D]'
                              : 'bg-[#1A1C23]/60 text-gray-300 hover:bg-[#1A1C23] hover:text-white border border-gray-800/40'
                          }`}
                        >
                          <span
                            className={`text-xs font-black leading-none ${
                              isSelected ? 'text-white' : isToday ? 'text-emerald-400' : ''
                            }`}
                          >
                            {dayNum}
                          </span>

                          <div className="flex items-center gap-1">
                            {hasAttendance && (
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isSelected
                                    ? 'bg-white'
                                    : attendanceRecord?.status === 'PRESENT'
                                    ? 'bg-emerald-400'
                                    : 'bg-amber-400'
                                }`}
                                title={`Attendance: ${attendanceRecord?.status}`}
                              />
                            )}
                            {hasJobs && (
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isSelected ? 'bg-purple-200' : 'bg-[#7B4DFF]'
                                }`}
                                title="Jobs Assigned"
                              />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Calendar Legend */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-800/60 text-[11px] text-gray-400">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>Present Shift</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#7B4DFF]" />
                        <span>Job Assigned</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span>Leave</span>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-500">Click any day to inspect</span>
                  </div>
                </div>

                {/* INSPECTOR: ACTIVITIES ON SELECTED DATE (span 5) */}
                <div className="xl:col-span-5 space-y-4">
                  <div className="bg-[#14151A] rounded-3xl border border-gray-800/80 p-5 shadow-xl space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-800/80">
                      <div>
                        <span className="text-[10px] uppercase font-black text-emerald-400 tracking-wider">
                          {isSelectedDateToday ? "TODAY'S OPERATIVE ACTIVITY" : 'DATE INSPECTION'}
                        </span>
                        <h4 className="text-sm sm:text-base font-black text-gray-100 tracking-tight mt-0.5">
                          {formattedSelectedDate}
                        </h4>
                      </div>
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-xl bg-[#1A1C23] text-gray-300 border border-gray-800">
                        {selectedDateStr}
                      </span>
                    </div>

                    {/* Attendance on that day */}
                    <div className="p-4 rounded-2xl bg-[#1A1C23] border border-gray-800/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <HardHat className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-black text-gray-200">Field Duty Check-in</span>
                        </div>
                        {selectedAttendance ? (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                              selectedAttendance.status === 'PRESENT'
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            }`}
                          >
                            {selectedAttendance.status}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-800 text-gray-400">
                            No Attendance Logged
                          </span>
                        )}
                      </div>

                      {selectedAttendance ? (
                        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                          <div className="bg-[#14151A] p-2.5 rounded-xl border border-gray-800/60">
                            <span className="text-[10px] uppercase font-bold text-gray-500 block">Check In</span>
                            <span className="font-mono font-bold text-gray-200 text-xs mt-0.5 block">
                              {new Date(selectedAttendance.checkInAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <div className="bg-[#14151A] p-2.5 rounded-xl border border-gray-800/60">
                            <span className="text-[10px] uppercase font-bold text-gray-500 block">Check Out</span>
                            <span className="font-mono font-bold text-gray-200 text-xs mt-0.5 block">
                              {selectedAttendance.checkOutAt
                                ? new Date(selectedAttendance.checkOutAt).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : 'On Duty'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 italic">
                          Worker was not checked in on this date.
                        </p>
                      )}

                      {selectedAttendance?.notes && (
                        <div className="text-[11px] text-gray-400 pt-1 border-t border-gray-800/60">
                          <span className="font-bold text-gray-300">Notes:</span> {selectedAttendance.notes}
                        </div>
                      )}
                    </div>

                    {/* Jobs Assigned on this day */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-gray-200 flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Orders Worked ({selectedJobs.length})</span>
                        </span>
                      </div>

                      {selectedJobs.length > 0 ? (
                        <div className="space-y-2.5 max-h-[320px] overflow-y-auto scrollbar-none pr-1">
                          {selectedJobs.map((job) => {
                            const jobSpecs = (job.specificationDetails as Record<string, any>) || {};
                            const squad = Array.isArray(jobSpecs.squadMembers) ? jobSpecs.squadMembers : [];

                            return (
                              <div
                                key={job.id}
                                className="p-3.5 rounded-2xl bg-[#1A1C23] border border-gray-800/80 hover:border-emerald-500/30 transition-all space-y-2"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <NextLink
                                    href={`/admin/operations/enquiries/${job.id}`}
                                    className="text-xs font-bold text-gray-100 hover:text-emerald-400 transition-colors truncate"
                                  >
                                    {job.serviceName}
                                  </NextLink>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenModifyJob(job)}
                                      className="px-2 py-0.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 hover:text-amber-200 font-bold text-[10px] transition-all flex items-center gap-1 cursor-pointer"
                                      title="Modify work time, tree count, or wages"
                                    >
                                      <Pencil className="w-2.5 h-2.5" />
                                      <span>Modify</span>
                                    </button>
                                    <NextLink
                                      href={`/admin/operations/enquiries/${job.id}`}
                                      className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 hover:underline"
                                    >
                                      {job.trackingNumber}
                                    </NextLink>
                                  </div>
                                </div>

                                <div className="text-[11px] text-gray-400 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span>{job.location || 'Kerala Site'}</span>
                                    <span className="text-emerald-400 font-semibold">{job.status}</span>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] text-gray-400">
                                    {jobSpecs.siteReachedAt && (
                                      <span className="text-emerald-300 font-mono">
                                        📍 Reached:{' '}
                                        {new Date(jobSpecs.siteReachedAt).toLocaleTimeString('en-US', {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })}
                                      </span>
                                    )}
                                    {job.workStartedAt && (
                                      <span className="text-amber-300 font-mono">
                                        ⏱️ Started:{' '}
                                        {new Date(job.workStartedAt).toLocaleTimeString('en-US', {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })}
                                      </span>
                                    )}
                                    {job.completedUnits !== null && job.completedUnits !== undefined && (
                                      <span className="text-sky-300 font-bold">
                                        🌴 {job.completedUnits} {job.unitLabel || 'Units'}
                                      </span>
                                    )}
                                    {job.totalCalculatedWage && (
                                      <span className="text-emerald-400 font-bold">
                                        💰 ₹{job.totalCalculatedWage}
                                      </span>
                                    )}
                                    {squad.length > 1 && (
                                      <span className="text-amber-300 font-bold">
                                        👥 Squad ({squad.length})
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="py-6 text-center text-xs text-gray-500 bg-[#1A1C23]/40 rounded-2xl border border-gray-800/50">
                          No work orders dispatched on this date.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hourly Chronological Timeline on this Date */}
                  <div className="bg-[#14151A] rounded-3xl border border-gray-800/80 p-5 shadow-xl space-y-3.5">
                    <h5 className="text-xs font-black text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Shift &amp; Operations Timeline</span>
                    </h5>

                    <div className="space-y-3 relative pl-4 border-l border-gray-800">
                      {selectedAttendance ? (
                        <div className="relative">
                          <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-[#14151A]" />
                          <div className="text-xs font-bold text-gray-200">Field Check-in Logged</div>
                          <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                            {new Date(selectedAttendance.checkInAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })} &bull; Status: {selectedAttendance.status}
                          </div>
                        </div>
                      ) : null}

                      {selectedJobs.map((job) => {
                        const jSpecs = (job.specificationDetails as Record<string, any>) || {};
                        const jBreaks = Array.isArray(jSpecs.breaks)
                          ? jSpecs.breaks
                          : (Array.isArray(jSpecs.breakLog) ? jSpecs.breakLog : []);

                        return (
                          <React.Fragment key={job.id}>
                            <div className="relative">
                              <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#7B4DFF] ring-4 ring-[#14151A]" />
                              <div className="text-xs font-bold text-gray-200">
                                Dispatched: {job.serviceName}
                              </div>
                              <div className="text-[11px] text-gray-400 mt-0.5">
                                Site: {job.location || 'Kerala Site'} &bull; Client: {job.customerName}
                              </div>
                            </div>

                            {jSpecs.siteReachedAt && (
                              <div className="relative">
                                <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-[#14151A]" />
                                <div className="text-xs font-bold text-emerald-400">Reached Work Site</div>
                                <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                                  {new Date(jSpecs.siteReachedAt).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </div>
                              </div>
                            )}

                            {job.workStartedAt && (
                              <div className="relative">
                                <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-4 ring-[#14151A]" />
                                <div className="text-xs font-bold text-amber-300">Started Work Timer</div>
                                <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                                  {new Date(job.workStartedAt).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </div>
                              </div>
                            )}

                            {jBreaks.map((b: any, bIdx: number) => (
                              <div key={bIdx} className="relative">
                                <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-purple-400 ring-4 ring-[#14151A]" />
                                <div className="text-xs font-bold text-purple-300">
                                  Break: {b.reason || 'Rest'}
                                </div>
                                <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                                  {new Date(b.startedAt).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}{' '}
                                  {b.durationMinutes ? `(${b.durationMinutes} mins)` : ''}
                                </div>
                              </div>
                            ))}

                            {(job.completedAt || job.workEndedAt) && (
                              <div className="relative">
                                <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-[#14151A]" />
                                <div className="text-xs font-bold text-emerald-400">Completed Work</div>
                                <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                                  {new Date(job.completedAt || job.workEndedAt!).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}{' '}
                                  &bull; {job.completedUnits || 0} {job.unitLabel || 'Units'}
                                </div>
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}

                      {selectedAttendance?.checkOutAt ? (
                        <div className="relative">
                          <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-sky-400 ring-4 ring-[#14151A]" />
                          <div className="text-xs font-bold text-gray-200">Field Check-out Recorded</div>
                          <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                            {new Date(selectedAttendance.checkOutAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      ) : null}

                      {!selectedAttendance && selectedJobs.length === 0 && (
                        <div className="text-xs text-gray-500 italic">
                          No timeline events logged for this date.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ====================================================
              TAB 3: WORK ORDERS HISTORY
          ==================================================== */}
          {activeTab === 'history' && (
            <div className="bg-[#14151A] rounded-3xl border border-gray-800/80 p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-800/80">
                <div>
                  <h3 className="text-base font-black text-gray-100 tracking-tight flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-400" />
                    <span>Work Orders Dispatched to {displayName}</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Field dispatches, ongoing site tasks, and completed orders.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-[#1A1C23] p-1 rounded-2xl border border-gray-800 text-xs font-bold">
                  {['ALL', 'IN_PROGRESS', 'ASSIGNED', 'COMPLETED', 'PENDING'].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setHistoryFilter(f)}
                      className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                        historyFilter === f
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {f === 'ALL' ? 'All' : f.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by service, tracking code, client, or site..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1A1C23] border border-gray-800 rounded-2xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Jobs List */}
              {filteredJobs.length > 0 ? (
                <div className="space-y-3">
                  {filteredJobs.map((job) => {
                    const isCompleted = job.status === 'COMPLETED';
                    const isInProgress = job.status === 'IN_PROGRESS';
                    const isAssigned = job.status === 'ASSIGNED';

                    const jobSpecs = (job.specificationDetails as Record<string, any>) || {};
                    const squad = Array.isArray(jobSpecs.squadMembers) ? jobSpecs.squadMembers : [];
                    const breaks = Array.isArray(jobSpecs.breaks)
                      ? jobSpecs.breaks
                      : (Array.isArray(jobSpecs.breakLog) ? jobSpecs.breakLog : []);
                    const totalBreakMins = jobSpecs.totalBreakMinutes ?? breaks.reduce((acc: number, b: any) => acc + (b.durationMinutes || 0), 0);
                    const actualMins = jobSpecs.actualWorkMinutes ?? job.workDurationMinutes ?? 0;
                    const grossMins = jobSpecs.grossDurationMinutes ?? (actualMins + totalBreakMins);

                    let durationStr = '';
                    if (actualMins > 0) {
                      const h = Math.floor(actualMins / 60);
                      const m = actualMins % 60;
                      durationStr = `${h > 0 ? `${h}h ` : ''}${m}m`;
                    }

                    return (
                          <div
                            key={job.id}
                            className="p-4 rounded-2xl bg-[#1A1C23] border border-gray-800/80 hover:border-emerald-500/40 transition-all space-y-3"
                          >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <NextLink
                                    href={`/admin/operations/enquiries/${job.id}`}
                                    className="text-sm font-bold text-gray-100 hover:text-emerald-400 transition-colors truncate"
                                  >
                                    {job.serviceName}
                                  </NextLink>
                                  <NextLink
                                    href={`/admin/operations/enquiries/${job.id}`}
                                    className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:underline"
                                  >
                                    {job.trackingNumber}
                                  </NextLink>
                                </div>
                                <div className="text-xs text-gray-400 flex flex-wrap items-center gap-3">
                                  <span>
                                    Client: <strong className="text-gray-200">{job.customerName}</strong> ({job.customerPhone})
                                  </span>
                                  {job.location && (
                                    <span className="flex items-center gap-1 text-emerald-300">
                                      <MapPin className="w-3 h-3 text-emerald-400" />
                                      {job.location}
                                    </span>
                                  )}
                                  <span>
                                    &bull; Logged:{' '}
                                    {new Date(job.createdAt).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2.5 shrink-0">
                                {job.location && (
                                  <a
                                    href={`https://maps.google.com/?q=${encodeURIComponent(job.location + ', Kerala')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2.5 py-1 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 text-xs font-bold transition-colors inline-flex items-center gap-1"
                                  >
                                    <Navigation className="w-3 h-3" />
                                    <span>GPS</span>
                                  </a>
                                )}
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-black border ${
                                    isCompleted
                                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                      : isInProgress
                                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                      : isAssigned
                                      ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                                      : 'bg-gray-800 text-gray-400 border-gray-700'
                                  }`}
                                >
                                  {job.status.replace('_', ' ')}
                                </span>
                              </div>
                            </div>

                            {/* Telemetry Strip for Work Order */}
                            <div className="p-3 rounded-xl bg-[#14151A] border border-gray-800/60 flex flex-wrap items-center justify-between gap-3 text-[11px]">
                              <div className="flex flex-wrap items-center gap-3 text-gray-400">
                                {jobSpecs.siteReachedAt && (
                                  <span className="flex items-center gap-1 text-emerald-400">
                                    <MapPin className="w-3 h-3" />
                                    <span>
                                      Reached:{' '}
                                      {new Date(jobSpecs.siteReachedAt).toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </span>
                                  </span>
                                )}

                                {job.workStartedAt && (
                                  <span className="flex items-center gap-1 text-amber-300 font-mono">
                                    <Timer className="w-3 h-3" />
                                    <span>
                                      Started:{' '}
                                      {new Date(job.workStartedAt).toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </span>
                                  </span>
                                )}

                                {durationStr && (
                                  <span className="flex items-center gap-1 text-emerald-400 font-bold font-mono">
                                    <Clock className="w-3 h-3 text-emerald-400" />
                                    <span>Net Work: {durationStr}</span>
                                  </span>
                                )}

                                {totalBreakMins > 0 && (
                                  <span className="flex items-center gap-1 text-amber-300 font-mono font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                    <Coffee className="w-3 h-3" />
                                    <span>Break: {totalBreakMins}m ({breaks.length})</span>
                                  </span>
                                )}

                                {grossMins > actualMins && grossMins > 0 && (
                                  <span className="text-gray-400 font-mono text-[10px]">
                                    Gross: {grossMins}m
                                  </span>
                                )}

                                {job.completedUnits !== null && job.completedUnits !== undefined && (
                                  <span className="font-bold text-sky-300">
                                    🌴 Units: {job.completedUnits} {job.unitLabel || 'Units'}
                                  </span>
                                )}

                                {job.totalCalculatedWage && (
                                  <span className="font-bold text-emerald-400">
                                    💰 Payout: ₹{job.totalCalculatedWage.toLocaleString('en-IN')}
                                  </span>
                                )}

                                {squad.length > 1 && (
                                  <span className="flex items-center gap-1 text-amber-300">
                                    <Users className="w-3 h-3" />
                                    <span>Squad: {squad.length} Workers</span>
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-2 ml-auto">
                                <button
                                  type="button"
                                  onClick={() => handleOpenModifyJob(job)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 hover:text-amber-200 font-bold transition-all text-xs cursor-pointer shadow-xs"
                                  title="Modify time, counts, wages, or status"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                  <span>Modify Log</span>
                                </button>
                                <NextLink
                                  href={`/admin/operations/enquiries/${job.id}`}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#7B4DFF]/15 hover:bg-[#7B4DFF]/25 border border-[#7B4DFF]/30 text-[#A78BFA] hover:text-white font-bold transition-all text-xs"
                                >
                                  <span>Full Order Page</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </NextLink>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
              ) : (
                <div className="py-12 text-center text-xs text-gray-500 bg-[#1A1C23]/40 rounded-3xl border border-gray-800/50">
                  No work orders found matching the filter.
                </div>
              )}
            </div>
          )}

          {/* ====================================================
              TAB 4: PROFILE DETAILS
          ==================================================== */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-[#14151A] rounded-3xl border border-gray-800/80 p-5 shadow-lg flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <Building className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                      Operational Hub
                    </span>
                    <h4 className="text-sm font-black text-gray-100 truncate mt-0.5">
                      Kerala Field Squad
                    </h4>
                    <span className="text-[11px] text-gray-400">South Sector</span>
                  </div>
                </div>

                <div className="bg-[#14151A] rounded-3xl border border-gray-800/80 p-5 shadow-lg flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-[#A78BFA] shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                      Skill Specialization
                    </span>
                    <h4 className="text-sm font-black text-gray-100 truncate mt-0.5">
                      Master Agriculturalist
                    </h4>
                    <span className="text-[11px] text-[#A78BFA] font-semibold">Certified Operative</span>
                  </div>
                </div>

                <div className="bg-[#14151A] rounded-3xl border border-gray-800/80 p-5 shadow-lg flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                      Completed Orders
                    </span>
                    <h4 className="text-sm font-black text-gray-100 truncate mt-0.5">
                      {completedJobsCount} Successes
                    </h4>
                    <span className="text-[11px] text-gray-400">Logged in ledger</span>
                  </div>
                </div>
              </div>

              {/* Detailed Personal & Professional Record */}
              <div className="bg-[#14151A] rounded-3xl border border-gray-800/80 p-6 shadow-lg space-y-6">
                <div>
                  <h3 className="text-base font-black text-gray-100 tracking-tight flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-emerald-400" />
                    <span>Operative Master File</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Verified workforce registry data in the KK Group operational database.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-[#1A1C23] border border-gray-800/70 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-500">Legal Name</span>
                    <div className="font-bold text-gray-200 text-sm">{person.name || 'Not Specified'}</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#1A1C23] border border-gray-800/70 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-500">System Username</span>
                    <div className="font-mono font-bold text-emerald-400 text-sm">@{person.username}</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#1A1C23] border border-gray-800/70 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-500">Registered Email</span>
                    <div className="font-semibold text-gray-200 text-sm truncate">{person.email || 'None'}</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#1A1C23] border border-gray-800/70 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-500">Phone Hotline</span>
                    <div className="font-semibold text-gray-200 text-sm">{person.phone || 'None'}</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#1A1C23] border border-gray-800/70 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-500">Registration Date</span>
                    <div className="font-semibold text-gray-300">
                      {new Date(person.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#1A1C23] border border-gray-800/70 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-500">Last Ledger Update</span>
                    <div className="font-semibold text-gray-300">
                      {new Date(person.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ====================================================
              TAB 5: SECURITY & ACCESS
          ==================================================== */}
          {activeTab === 'security' && (
            <div className="bg-[#14151A] rounded-3xl border border-gray-800/80 p-6 shadow-xl space-y-6">
              <div>
                <h3 className="text-base font-black text-gray-100 tracking-tight flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Field Security & Credentials</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Access permissions, portal credentials, and operational activation status.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-[#1A1C23] border border-gray-800/70 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-gray-200">Role Authorization Level</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      Assigned role: <span className="text-emerald-400 font-mono font-bold">{person.role}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                    Field Operative
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#1A1C23] border border-gray-800/70 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-gray-200">Email Verification</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      {person.isEmailVerified
                        ? 'Authenticated through OTP verification.'
                        : 'Pending email verification.'}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-xl font-bold border ${
                      person.isEmailVerified
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {person.isEmailVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#1A1C23] border border-gray-800/70 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-gray-200">Portal Dispatch Account State</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      {person.isActive
                        ? 'Active and eligible for automated job allocations.'
                        : 'Deactivated.'}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-xl font-bold border ${
                      person.isActive
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {person.isActive ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Person Modal */}
      <EditPersonModal
        isOpen={isEditModalOpen}
        person={person}
        onClose={() => setIsEditModalOpen(false)}
        token={token!}
        onSuccess={(updated) => {
          if (updated) {
            setPerson(updated);
          } else {
            handleRefresh();
          }
        }}
      />

      {/* Modify Worker Job Order Modal (Time, Tree Count, Wages, Status) */}
      <ModifyWorkerJobModal
        isOpen={isModifyJobModalOpen}
        onClose={() => {
          setIsModifyJobModalOpen(false);
          setSelectedJobToModify(null);
        }}
        job={selectedJobToModify}
        token={token || ''}
        workerName={person?.name || person?.username || undefined}
        onSuccess={() => {
          handleRefresh();
        }}
      />

      {/* ========================================================
          ADMIN ACTION MODALS: PAUSE, RESUME, COMPLETE
      ======================================================== */}
      {/* 1. Admin Pause Timer Modal */}
      {isPauseModalOpen && ongoingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#14151A] border border-gray-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-gray-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Pause className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Pause Work Timer</h3>
                  <p className="text-xs text-gray-400">Select reason for pausing the field timer</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPauseModalOpen(false)}
                className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#1A1C23] border border-gray-800 text-xs">
                <div className="text-gray-400">Work Order:</div>
                <div className="font-bold text-gray-100 text-sm mt-0.5">{ongoingJob.serviceName}</div>
                <div className="text-[11px] font-mono text-purple-300 mt-0.5">{ongoingJob.trackingNumber}</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-2">
                  Select Break Reason <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'Breakfast', label: 'Breakfast Break', icon: '🍳' },
                    { id: 'Lunch Break', label: 'Lunch Break', icon: '🍱' },
                    { id: 'Evening Tea', label: 'Evening Tea Break', icon: '☕' },
                    { id: 'Equipment Refuel', label: 'Equipment / Fuel', icon: '⛽' },
                    { id: 'Rain Delay', label: 'Rain / Weather Delay', icon: '🌧️' },
                    { id: 'Other Break', label: 'Other Operational Break', icon: '🏷️' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setAdminPauseReason(r.label)}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                        adminPauseReason === r.label
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 shadow-sm'
                          : 'bg-[#1A1C23] border-gray-800 text-gray-400 hover:text-gray-200 hover:border-gray-700'
                      }`}
                    >
                      <span className="text-lg">{r.icon}</span>
                      <span className="text-xs font-bold">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={adminPauseNotes}
                  onChange={(e) => setAdminPauseNotes(e.target.value)}
                  placeholder="e.g. Workers stepped out for noon meal at local mess..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#1A1C23] border border-gray-800 text-gray-200 placeholder-gray-500 text-xs focus:outline-none focus:border-amber-500/50 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800/80">
              <button
                type="button"
                onClick={() => setIsPauseModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-800 text-xs font-bold text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdminPauseTimer}
                disabled={isSubmittingAdminAction}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-black text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-amber-600/30 cursor-pointer disabled:opacity-50"
              >
                {isSubmittingAdminAction ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Pausing...</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Confirm Pause</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Admin Resume Timer Modal */}
      {isResumeModalOpen && ongoingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#14151A] border border-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-gray-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Play className="w-5 h-5 fill-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Resume Work Timer</h3>
                  <p className="text-xs text-gray-400">Restart live timer for this work order</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsResumeModalOpen(false)}
                className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#1A1C23] border border-gray-800 space-y-2">
                <div className="text-xs text-gray-400">Active Break Reason:</div>
                <div className="text-sm font-black text-amber-300">
                  {getLiveTimerData(ongoingJob)?.activeBreakReason || 'Break in Progress'}
                </div>
                {getLiveTimerData(ongoingJob)?.breakTimeFormatted && (
                  <div className="text-xs font-mono text-gray-300">
                    Duration: <span className="text-amber-400 font-bold">{getLiveTimerData(ongoingJob)?.breakTimeFormatted}</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                Resuming will conclude the current break log and resume counting on-site labor minutes toward the final ledger.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800/80">
              <button
                type="button"
                onClick={() => setIsResumeModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-800 text-xs font-bold text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdminResumeTimer}
                disabled={isSubmittingAdminAction}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer disabled:opacity-50"
              >
                {isSubmittingAdminAction ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Resuming...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Confirm Resume</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Admin Complete Work Order Modal */}
      {isCompleteModalOpen && ongoingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#14151A] border border-gray-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-gray-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Complete Work Order</h3>
                  <p className="text-xs text-gray-400">Finalize on-site execution and record hours</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCompleteModalOpen(false)}
                className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#1A1C23] border border-gray-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Job:</span>
                  <span className="font-bold text-gray-200">{ongoingJob.serviceName}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Total Work Duration:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {getLiveTimerData(ongoingJob)?.workTimeFormatted || 'Calculating...'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Completed Units ({ongoingJob.unitLabel || 'Trees / Units'})
                </label>
                <input
                  type="number"
                  min={0}
                  value={completeUnits}
                  onChange={(e) => setCompleteUnits(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder={`e.g. ${ongoingJob.estimatedUnits || 10}`}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#1A1C23] border border-gray-800 text-gray-200 placeholder-gray-500 text-xs focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Completion Remarks (Optional)
                </label>
                <textarea
                  rows={2}
                  value={completeNotes}
                  onChange={(e) => setCompleteNotes(e.target.value)}
                  placeholder="e.g. Work completed satisfactorily, customer signed off..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#1A1C23] border border-gray-800 text-gray-200 placeholder-gray-500 text-xs focus:outline-none focus:border-purple-500/50 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800/80">
              <button
                type="button"
                onClick={() => setIsCompleteModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-800 text-xs font-bold text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdminCompleteWork}
                disabled={isSubmittingAdminAction}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer disabled:opacity-50"
              >
                {isSubmittingAdminAction ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Completing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm Completion</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
