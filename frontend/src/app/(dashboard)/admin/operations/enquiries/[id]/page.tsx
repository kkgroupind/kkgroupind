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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchEnquiryDetails();
  };

  const handleCopyTracking = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  // Parsing Telemetry & Specification details
  const specs = useMemo(() => {
    if (!enquiry?.specificationDetails) return {};
    return typeof enquiry.specificationDetails === 'object'
      ? (enquiry.specificationDetails as Record<string, any>)
      : {};
  }, [enquiry?.specificationDetails]);

  // Break logs
  const breakLog: Array<{
    reason: string;
    startedAt: string;
    endedAt?: string;
    durationMinutes?: number;
    notes?: string;
  }> = useMemo(() => {
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
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Dispatch or Re-assign Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsAssignModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#7B4DFF] hover:bg-[#6839EF] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#7B4DFF]/25 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isPending ? 'Dispatch Squad' : 'Reassign / Add Workers'}</span>
          </button>

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
    </div>
  );
}
