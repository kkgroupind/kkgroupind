'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  Search,
  RefreshCw,
  Plus,
  Clock,
  CheckCircle2,
  HardHat,
  MapPin,
  Calendar,
  AlertCircle,
  Eye,
  Send,
  X,
  FileText,
  LayoutGrid,
  List,
  Sparkles,
  User,
  IndianRupee,
  Play,
  Pause,
  Timer,
  Loader2,
  StopCircle,
} from 'lucide-react';
import { EnquiryService, ServiceEnquiry, WorkerWithAvailability } from '@/services';
import { CreateWorkModal } from '@/components/OfficeStaff/CreateWorkModal';
import { AssignWorkerModal } from '@/components/OfficeStaff/AssignWorkerModal';
import { UpdateJobPayModal } from '@/components/OfficeStaff/UpdateJobPayModal';

export default function AdminWorkOrdersPage() {
  const { token, user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [workOrders, setWorkOrders] = useState<ServiceEnquiry[]>([]);
  const [workers, setWorkers] = useState<WorkerWithAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ServiceEnquiry | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payOrder, setPayOrder] = useState<ServiceEnquiry | null>(null);

  // Live Chronometer Ticker for In-Progress Works
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
    (order: ServiceEnquiry) => {
      if (order.status !== 'IN_PROGRESS' || !order.workStartedAt) {
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
        activeBreakReason: activeBreak?.reason || 'General Break',
        workSeconds,
        breakSeconds,
        workTimeFormatted: formatSecondsToHMS(workSeconds),
        breakTimeFormatted: formatSecondsToHMS(breakSeconds),
      };
    },
    [nowTimestamp]
  );

  // Admin Operational Action Modals
  const [pauseTargetOrder, setPauseTargetOrder] = useState<ServiceEnquiry | null>(null);
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const [adminPauseReason, setAdminPauseReason] = useState('Lunch Break');
  const [adminPauseNotes, setAdminPauseNotes] = useState('');

  const [resumeTargetOrder, setResumeTargetOrder] = useState<ServiceEnquiry | null>(null);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

  const [completeTargetOrder, setCompleteTargetOrder] = useState<ServiceEnquiry | null>(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [completeUnits, setCompleteUnits] = useState<number | ''>('');
  const [completeNotes, setCompleteNotes] = useState('');

  const [isSubmittingAdminAction, setIsSubmittingAdminAction] = useState(false);

  const handleAdminPauseTimer = async () => {
    if (!pauseTargetOrder || !token) return;
    setIsSubmittingAdminAction(true);
    try {
      await EnquiryService.pauseWorkTimer(
        pauseTargetOrder.id,
        { reason: adminPauseReason, notes: adminPauseNotes.trim() || undefined },
        token
      );
      setIsPauseModalOpen(false);
      setPauseTargetOrder(null);
      setAdminPauseNotes('');
      await loadData(true);
    } catch (err: any) {
      alert(err?.message || 'Failed to pause timer');
    } finally {
      setIsSubmittingAdminAction(false);
    }
  };

  const handleAdminResumeTimer = async () => {
    if (!resumeTargetOrder || !token) return;
    setIsSubmittingAdminAction(true);
    try {
      await EnquiryService.resumeWorkTimer(resumeTargetOrder.id, {}, token);
      setIsResumeModalOpen(false);
      setResumeTargetOrder(null);
      await loadData(true);
    } catch (err: any) {
      alert(err?.message || 'Failed to resume timer');
    } finally {
      setIsSubmittingAdminAction(false);
    }
  };

  const handleAdminCompleteWork = async () => {
    if (!completeTargetOrder || !token) return;
    setIsSubmittingAdminAction(true);
    try {
      const timerData = getLiveTimerData(completeTargetOrder);
      const durationMinutes = timerData
        ? Math.max(1, Math.round(timerData.workSeconds / 60))
        : undefined;
      await EnquiryService.stopWorkTimer(
        completeTargetOrder.id,
        {
          durationMinutes,
          completedUnits: completeUnits === '' ? undefined : Number(completeUnits),
          completionNotes: completeNotes.trim() || undefined,
        },
        token
      );
      setIsCompleteModalOpen(false);
      setCompleteTargetOrder(null);
      await loadData(true);
    } catch (err: any) {
      alert(err?.message || 'Failed to complete work');
    } finally {
      setIsSubmittingAdminAction(false);
    }
  };

  const loadData = useCallback(
    async (showRefreshIndicator = false) => {
      if (!token) return;
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      try {
        const [ordersRes, workersRes] = await Promise.allSettled([
          EnquiryService.getAllEnquiries({}, token),
          EnquiryService.getActiveWorkers(token),
        ]);
        if (ordersRes.status === 'fulfilled') {
          setWorkOrders(ordersRes.value.enquiries || []);
        }
        if (workersRes.status === 'fulfilled') {
          setWorkers(workersRes.value.workers || []);
        }
      } catch (err) {
        console.error('Failed to load work orders', err);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [token],
  );

  useEffect(() => {
    if (!authLoading) {
      if (!token || user?.role !== 'SUPER_ADMIN') {
        router.push('/admin/login');
      } else {
        loadData();
      }
    }
  }, [authLoading, token, user, router, loadData]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const filter = new URLSearchParams(window.location.search).get('filter');
      if (filter) {
        setStatusFilter(filter);
      }
    }
  }, []);

  // Auto-refresh every 5 seconds when there are IN_PROGRESS orders
  useEffect(() => {
    const hasInProgress = workOrders.some((o) => o.status === 'IN_PROGRESS');
    if (!hasInProgress) return;
    const refreshInterval = setInterval(() => {
      loadData(false);
    }, 5000);
    return () => clearInterval(refreshInterval);
  }, [workOrders, loadData]);


  const pendingPayoutOrders = useMemo(() => {
    return workOrders
      .filter((w) => w.status === 'COMPLETED' && (!w.totalCalculatedWage || Number(w.totalCalculatedWage) === 0))
      .sort((a, b) => new Date(b.completedAt || b.updatedAt).getTime() - new Date(a.completedAt || a.updatedAt).getTime());
  }, [workOrders]);

  const getOrderPriority = (item: ServiceEnquiry): number => {
    // 1. PENDING assignment: needs squad allocation
    if (item.status === 'PENDING') return 1;
    // 2. PENDING payout: completed job requiring wage settlement
    if (item.status === 'COMPLETED' && (!item.totalCalculatedWage || Number(item.totalCalculatedWage) === 0)) return 2;
    // 3. IN_PROGRESS: active field tasks
    if (item.status === 'IN_PROGRESS') return 3;
    // 4. ASSIGNED: allocated squad
    if (item.status === 'ASSIGNED') return 4;
    // 5. COMPLETED: finalized & settled
    return 5;
  };

  const filteredOrders = useMemo(() => {
    const list = workOrders.filter((item) => {
      const matchSearch =
        searchTerm === '' ||
        item.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customerPhone.includes(searchTerm);

      const matchStatus =
        statusFilter === 'ALL'
          ? true
          : statusFilter === 'PENDING_PAYOUT'
          ? item.status === 'COMPLETED' && (!item.totalCalculatedWage || Number(item.totalCalculatedWage) === 0)
          : item.status === statusFilter;

      return matchSearch && matchStatus;
    });

    if (statusFilter === 'ALL') {
      return [...list].sort((a, b) => {
        const priorityDiff = getOrderPriority(a) - getOrderPriority(b);
        if (priorityDiff !== 0) return priorityDiff;
        const timeA = new Date(a.createdAt || a.updatedAt).getTime();
        const timeB = new Date(b.createdAt || b.updatedAt).getTime();
        return timeB - timeA;
      });
    }

    if (statusFilter === 'PENDING_PAYOUT') {
      return [...list].sort(
        (a, b) => new Date(b.completedAt || b.updatedAt).getTime() - new Date(a.completedAt || a.updatedAt).getTime(),
      );
    }
    return [...list].sort(
      (a, b) => new Date(b.createdAt || b.updatedAt).getTime() - new Date(a.createdAt || a.updatedAt).getTime(),
    );
  }, [workOrders, searchTerm, statusFilter]);

  const metrics = useMemo(() => {
    const total = workOrders.length;
    const assigned = workOrders.filter((w) => w.status === 'ASSIGNED').length;
    const inProgress = workOrders.filter((w) => w.status === 'IN_PROGRESS').length;
    const completed = workOrders.filter((w) => w.status === 'COMPLETED').length;
    const pendingPayout = pendingPayoutOrders.length;
    return { total, assigned, inProgress, completed, pendingPayout };
  }, [workOrders, pendingPayoutOrders]);

  const statusPills = [
    {
      value: 'PENDING',
      label: 'Pending Assignment',
      badge: `${workOrders.filter((w) => w.status === 'PENDING').length}`,
      icon: Clock,
      activeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.25)]',
    },
    {
      value: 'PENDING_PAYOUT',
      label: 'Payout Pending',
      badge: `${metrics.pendingPayout}`,
      icon: IndianRupee,
      activeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.25)]',
    },
    {
      value: 'IN_PROGRESS',
      label: 'In Execution',
      badge: `${metrics.inProgress}`,
      icon: Sparkles,
      activeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.25)]',
    },
    {
      value: 'ASSIGNED',
      label: 'Squad Assigned',
      badge: `${metrics.assigned}`,
      icon: HardHat,
      activeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.25)]',
    },
    {
      value: 'COMPLETED',
      label: 'Completed Works',
      badge: `${metrics.completed}`,
      icon: CheckCircle2,
      activeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
    },
    {
      value: 'ALL',
      label: 'All Work Orders',
      badge: `${metrics.total}`,
      icon: Briefcase,
      activeColor: 'bg-[#7B4DFF]/20 text-[#9E7BFF] border-[#7B4DFF]/50 shadow-[0_0_15px_rgba(123,77,255,0.25)]',
    },
  ];

  const getStatusTheme = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return {
          bg: 'bg-emerald-500/10',
          text: 'text-emerald-400',
          border: 'border-emerald-500/20',
          ring: 'from-emerald-500 to-teal-600',
          glow: 'group-hover:via-emerald-500/60',
        };
      case 'IN_PROGRESS':
        return {
          bg: 'bg-blue-500/10',
          text: 'text-blue-400',
          border: 'border-blue-500/20',
          ring: 'from-blue-500 to-cyan-600',
          glow: 'group-hover:via-blue-500/60',
        };
      case 'ASSIGNED':
        return {
          bg: 'bg-purple-500/10',
          text: 'text-purple-400',
          border: 'border-purple-500/20',
          ring: 'from-purple-500 to-indigo-600',
          glow: 'group-hover:via-[#7B4DFF]/60',
        };
      case 'PENDING':
      default:
        return {
          bg: 'bg-amber-500/10',
          text: 'text-amber-400',
          border: 'border-amber-500/20',
          ring: 'from-amber-500 to-orange-600',
          glow: 'group-hover:via-amber-500/60',
        };
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10 text-gray-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
            <div className="p-2.5 bg-[#14151A] border border-gray-800 rounded-2xl shadow-sm">
              <Briefcase className="w-6 h-6 text-[#7B4DFF]" />
            </div>
            Active Work Orders
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Dispatch, track, and manage ongoing field execution orders across Kerala regions
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-2 bg-[#14151A] hover:bg-[#1A1C23] border border-gray-800 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-gray-300 hover:text-white transition-all disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <RefreshCw
              className={`w-4 h-4 text-[#7B4DFF] ${isRefreshing ? 'animate-spin' : ''}`}
            />
            <span>{isRefreshing ? 'Refreshing...' : 'Reload'}</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-[#7B4DFF] hover:bg-[#6839EF] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-[0_0_20px_rgba(123,77,255,0.3)] transition-all ml-auto sm:ml-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Work Order</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="group p-5 rounded-2xl bg-[#14151A] border border-gray-800/80 hover:border-gray-700/80 transition-all duration-300 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gray-700/40 to-transparent group-hover:via-gray-500/60 transition-all duration-300" />
          <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
            Total Work Orders
          </span>
          <div className="text-2xl font-bold text-gray-100 mt-1">{metrics.total}</div>
          <span className="text-[11px] text-gray-500 mt-1 block">Lifecycle portfolio</span>
        </div>

        <div className="group p-5 rounded-2xl bg-[#14151A] border border-gray-800/80 hover:border-gray-700/80 transition-all duration-300 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent group-hover:via-purple-500/70 transition-all duration-300" />
          <span className="text-[11px] text-purple-400 font-semibold uppercase tracking-wider">
            Assigned Jobs
          </span>
          <div className="text-2xl font-bold text-purple-400 mt-1">{metrics.assigned}</div>
          <span className="text-[11px] text-purple-400/70 mt-1 block">Squad allocated</span>
        </div>

        <div className="group p-5 rounded-2xl bg-[#14151A] border border-gray-800/80 hover:border-gray-700/80 transition-all duration-300 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent group-hover:via-blue-500/70 transition-all duration-300" />
          <span className="text-[11px] text-blue-400 font-semibold uppercase tracking-wider">
            In Execution
          </span>
          <div className="text-2xl font-bold text-blue-400 mt-1">{metrics.inProgress}</div>
          <span className="text-[11px] text-blue-400/70 mt-1 block">On-field active progress</span>
        </div>

        <div className="group p-5 rounded-2xl bg-[#14151A] border border-gray-800/80 hover:border-gray-700/80 transition-all duration-300 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent group-hover:via-emerald-500/70 transition-all duration-300" />
          <span className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider">
            Completed Works
          </span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{metrics.completed}</div>
          <span className="text-[11px] text-emerald-400/70 mt-1 block">Closed &amp; fulfilled</span>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'PENDING_PAYOUT' ? 'ALL' : 'PENDING_PAYOUT')}
          className={`group p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden shadow-sm cursor-pointer ${
            metrics.pendingPayout > 0
              ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/60'
              : 'bg-[#14151A] border-gray-800/80 hover:border-gray-700/80'
          }`}
        >
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent group-hover:via-amber-500/80 transition-all duration-300" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider">
              Payout Pending
            </span>
            {metrics.pendingPayout > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{metrics.pendingPayout}</div>
          <span className="text-[11px] text-amber-400/70 mt-1 block">Awaiting wage finalization</span>
        </div>
      </div>

      {/* Finished Works Awaiting Payout Section */}
      {pendingPayoutOrders.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 shadow-lg flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-gray-100">
                    {pendingPayoutOrders.length} Completed {pendingPayoutOrders.length === 1 ? 'Work' : 'Works'} Awaiting Worker Payout
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                    Action Required
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Finished field tasks with unfinalized payouts. Review completed units and assign worker wages directly.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStatusFilter('PENDING_PAYOUT')}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span>View All Pending ({pendingPayoutOrders.length})</span>
            </button>
          </div>

          {/* Quick Cards of Latest Finished Works Without Payout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {pendingPayoutOrders.slice(0, 3).map((order) => (
              <div
                key={order.id}
                className="bg-[#14151A] rounded-xl p-4 border border-amber-500/30 hover:border-amber-500/60 shadow-md flex flex-col justify-between gap-3 transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#7B4DFF]">
                      {order.trackingNumber}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(order.completedAt || order.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-gray-200 truncate">
                    {order.serviceName}
                  </div>
                  <div className="text-[11px] text-gray-400 flex items-center gap-1">
                    <User className="w-3 h-3 text-gray-500" />
                    <span className="truncate">{order.customerName}</span>
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                    <HardHat className="w-3 h-3 text-emerald-400" />
                    <span>{order.worker?.name || order.worker?.username || 'Field Operative'}</span>
                  </div>
                  {order.completedUnits ? (
                    <div className="text-[11px] text-gray-400">
                      Units Logged: <strong className="text-gray-200">{order.completedUnits} {order.unitLabel || 'Units'}</strong>
                    </div>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPayOrder(order);
                    setIsPayModalOpen(true);
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <IndianRupee className="w-3.5 h-3.5" />
                  <span>Finalize Payment</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pill Navigation & Search Controls */}
      <div className="flex flex-col gap-3.5 p-3.5 rounded-2xl bg-[#14151A] border border-gray-800/80 shadow-sm">
        {/* Top: Status Pill Navs */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-1">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
            {statusPills.map((pill) => {
              const isActive = statusFilter === pill.value;
              const Icon = pill.icon;
              return (
                <button
                  key={pill.value}
                  type="button"
                  onClick={() => setStatusFilter(pill.value)}
                  className={`flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer select-none border ${
                    isActive
                      ? pill.activeColor
                      : 'bg-[#1A1C23] text-gray-400 hover:text-gray-200 border-gray-800/80 hover:border-gray-700/80 hover:bg-[#20232C]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? '' : 'text-gray-500'}`} />
                  <span>{pill.label}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border transition-colors ${
                      isActive
                        ? 'bg-black/30 border-current'
                        : 'bg-black/20 text-gray-500 border-gray-800'
                    }`}
                  >
                    {pill.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle (Desktop) */}
          <div className="hidden md:flex items-center bg-[#1A1C23] border border-gray-800 rounded-xl p-1 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#7B4DFF] text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#7B4DFF] text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom: Search Input & Mobile View Toggle */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by code, customer, service, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-xs text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-[#7B4DFF] transition-all"
            />
          </div>

          {/* View Mode Toggle (Mobile) */}
          <div className="md:hidden flex items-center bg-[#1A1C23] border border-gray-800 rounded-xl p-1 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#7B4DFF] text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#7B4DFF] text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content View */}
      {isLoading ? (
        <div className="bg-[#14151A] rounded-2xl border border-gray-800 p-16 text-center flex flex-col items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[#7B4DFF] mb-3" />
          <h3 className="text-gray-200 font-semibold text-base mb-1">Loading Work Orders...</h3>
          <p className="text-gray-500 text-xs">Fetching registered field execution tasks</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-[#14151A] rounded-2xl border border-gray-800 p-16 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-[#1A1C23] border border-gray-800 flex items-center justify-center text-gray-500 mb-4">
            <Briefcase className="w-7 h-7 text-gray-500" />
          </div>
          <h3 className="text-gray-200 font-semibold text-base mb-1">No Work Orders Found</h3>
          <p className="text-gray-500 text-xs max-w-sm">
            No active works match the chosen filter or search query.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Bento Card Grid Matching PeopleCards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrders.map((order) => {
            const theme = getStatusTheme(order.status);
            const dateStr = order.createdAt
              ? new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : 'Unknown';

            return (
              <div
                key={order.id}
                className="group bg-[#14151A] rounded-2xl border border-gray-800/80 hover:border-gray-700/80 p-5 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex flex-col justify-between relative overflow-hidden"
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gray-700/40 to-transparent ${theme.glow} transition-all duration-300`}
                />

                <div>
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative shrink-0">
                        <div
                          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${theme.ring} p-[2px] shadow-sm`}
                        >
                          <div className="w-full h-full bg-[#1A1C23] rounded-[14px] flex items-center justify-center font-bold text-base text-gray-100 overflow-hidden">
                            <Briefcase className="w-5 h-5 text-gray-200" />
                          </div>
                        </div>
                      </div>

                      <div className="min-w-0">
                        <h4 className="font-semibold text-gray-100 hover:text-[#7B4DFF] transition-colors truncate block text-base">
                          {order.serviceName}
                        </h4>
                        <span className="font-mono text-xs font-semibold text-[#7B4DFF]">
                          {order.trackingNumber}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border ${theme.bg} ${theme.text} ${theme.border} uppercase tracking-wider`}
                      >
                        {order.status.replace('_', ' ')}
                      </span>
                      {order.status === 'COMPLETED' && (!order.totalCalculatedWage || Number(order.totalCalculatedWage) === 0) && (
                        <span className="px-2 py-0.5 text-[9px] font-extrabold rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider animate-pulse">
                          PAYOUT NEEDED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Wage Model Tag */}
                  {order.wageType && (
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-[10px] font-bold bg-[#1A1C23] text-gray-300 px-2 py-0.5 rounded-lg border border-gray-800">
                        {order.wageType === 'PER_TREE'
                          ? '🌴 Tree Count Basis'
                          : order.wageType === 'HOURLY'
                          ? '⏱️ Hourly Meter'
                          : order.wageType === 'PER_SQFT'
                          ? '📐 Area / Sq Ft'
                          : `${order.unitLabel || 'Unit'} Basis`}
                      </span>
                      {order.unitRate ? (
                        <span className="text-[10px] font-mono text-gray-400">
                          ₹{order.unitRate} / {order.unitLabel || 'Unit'}
                        </span>
                      ) : null}
                    </div>
                  )}

                  {/* Middle Details (Border-y) */}
                  <div className="space-y-2 py-3 border-y border-gray-800/60 my-3 text-xs">
                    {/* Customer */}
                    <div className="flex items-center justify-between text-gray-400 gap-2">
                      <span className="flex items-center gap-2 text-gray-400 truncate">
                        <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate text-gray-200 font-medium">
                          {order.customerName}
                        </span>
                      </span>
                      <span className="text-gray-400 font-mono text-[11px] shrink-0">
                        {order.customerPhone}
                      </span>
                    </div>

                    {/* Assigned Operative */}
                    <div className="flex items-center justify-between text-gray-400 gap-2">
                      <span className="flex items-center gap-2 text-gray-400 truncate">
                        <HardHat className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">
                          {order.worker ? (
                            <span className="text-emerald-400 font-medium">
                              {order.worker.name || order.worker.username}
                            </span>
                          ) : (
                            <span className="text-amber-400 font-medium">Unassigned</span>
                          )}
                        </span>
                      </span>
                      {order.worker && (
                        <span className="text-[10px] text-gray-500 font-mono">
                          {order.worker.phone || ''}
                        </span>
                      )}
                    </div>

                    {/* Created Date */}
                    <div className="flex items-center justify-between text-gray-400">
                      <span className="flex items-center gap-2 text-gray-400">
                        <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>Registered</span>
                      </span>
                      <span className="text-gray-300 font-medium">{dateStr}</span>
                    </div>
                  </div>
                </div>

                {/* Live Chronometer Banner for Active Work Orders */}
                {order.status === 'IN_PROGRESS' && (() => {
                  const timerData = getLiveTimerData(order);
                  if (!timerData) return null;
                  return (
                    <div
                      className={`mb-3 p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                        timerData.isOnBreak
                          ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                          : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            timerData.isOnBreak ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-ping'
                          }`}
                        />
                        <div className="flex flex-col">
                          <span className="font-bold text-[11px] leading-tight">
                            {timerData.isOnBreak
                              ? `☕ Break: ${timerData.activeBreakReason}`
                              : '⏱️ Live Working Meter'}
                          </span>
                          {timerData.isOnBreak && (
                            <span className="text-[10px] text-gray-400">
                              Work Logged: {timerData.workTimeFormatted}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="font-mono font-black text-sm text-white bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
                        {timerData.isOnBreak ? timerData.breakTimeFormatted : timerData.workTimeFormatted}
                      </div>
                    </div>
                  );
                })()}

                {/* Time & Break Records Strip for Completed Works */}
                {order.status === 'COMPLETED' && (() => {
                  const specs = (order.specificationDetails as any) || {};
                  const breaks = Array.isArray(specs.breaks)
                    ? specs.breaks
                    : (Array.isArray(specs.breakLog) ? specs.breakLog : []);
                  const actualMins = specs.actualWorkMinutes ?? order.workDurationMinutes ?? 0;
                  const breakMins = specs.totalBreakMinutes ?? breaks.reduce((acc: number, b: any) => acc + (b.durationMinutes || 0), 0);
                  const breakCount = specs.breakCount ?? breaks.length;
                  const grossMins = specs.grossDurationMinutes ?? (actualMins + breakMins);

                  if (actualMins === 0 && breakMins === 0) return null;

                  return (
                    <div className="mb-3 p-2.5 rounded-xl bg-[#1A1C23] border border-gray-800/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-gray-300 font-medium">
                          Actual: <strong className="text-emerald-400 font-mono">{actualMins}m</strong>
                        </span>
                      </div>
                      {breakMins > 0 ? (
                        <span className="text-[10px] text-amber-300 font-mono font-semibold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          ☕ {breakMins}m break ({breakCount})
                        </span>
                      ) : (
                        grossMins > 0 && (
                          <span className="text-[10px] text-gray-500 font-mono">
                            Gross: {grossMins}m
                          </span>
                        )
                      )}
                    </div>
                  );
                })()}

                {/* Worker Payout Banner */}
                {order.worker && (
                  <div className="mb-2">
                    {order.totalCalculatedWage ? (
                      <div className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <span className="flex items-center gap-1 font-semibold">
                          <IndianRupee className="w-3 h-3" />
                          Final Worker Payout:
                        </span>
                        <span className="font-bold font-mono">₹{order.totalCalculatedWage.toLocaleString()}</span>
                      </div>
                    ) : order.status === 'COMPLETED' ? (
                      <div className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
                        <span className="font-semibold">Worker Payout:</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 px-2 py-0.5 rounded-md">Pending Finalization</span>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="flex flex-col gap-2 pt-2">
                  {!order.worker ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsAssignModalOpen(true);
                      }}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#7B4DFF] hover:bg-[#6839EF] text-white shadow-[0_0_15px_rgba(123,77,255,0.25)] transition-all cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Assign Worker</span>
                    </button>
                  ) : (
                    <div className="flex flex-col gap-2 w-full">
                      {/* Operational Timer Controls for In Progress */}
                      {order.status === 'IN_PROGRESS' && (() => {
                        const timerData = getLiveTimerData(order);
                        return (
                          <div className="grid grid-cols-2 gap-2 w-full">
                            {timerData?.isOnBreak ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setResumeTargetOrder(order);
                                  setIsResumeModalOpen(true);
                                }}
                                className="py-2 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                              >
                                <Play className="w-3.5 h-3.5 fill-white" />
                                <span>Resume</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setPauseTargetOrder(order);
                                  setAdminPauseReason('Lunch Break');
                                  setAdminPauseNotes('');
                                  setIsPauseModalOpen(true);
                                }}
                                className="py-2 px-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                              >
                                <Pause className="w-3.5 h-3.5" />
                                <span>Pause</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setCompleteTargetOrder(order);
                                setCompleteUnits(order.completedUnits ?? order.estimatedUnits ?? 1);
                                setCompleteNotes('');
                                setIsCompleteModalOpen(true);
                              }}
                              className="py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Complete</span>
                            </button>
                          </div>
                        );
                      })()}

                      {/* Secondary Management Row: Squad & Pay */}
                      <div className="flex items-center gap-2 w-full">
                        {order.status !== 'IN_PROGRESS' && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsAssignModalOpen(true);
                            }}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-[#1A1C23] hover:bg-[#252834] text-gray-300 hover:text-white border border-gray-800 transition-all cursor-pointer"
                          >
                            <HardHat className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Squad</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setPayOrder(order);
                            setIsPayModalOpen(true);
                          }}
                          className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            order.totalCalculatedWage
                              ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30'
                              : order.status === 'COMPLETED'
                              ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 animate-pulse'
                              : 'bg-[#1A1C23] hover:bg-[#252834] text-gray-300 border border-gray-800'
                          }`}
                        >
                          <IndianRupee className="w-3.5 h-3.5" />
                          <span>{order.totalCalculatedWage ? 'Update Pay' : 'Finalize Pay'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Alternative Table View */
        <div className="bg-[#14151A] rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#0D0E12] text-gray-400 font-semibold border-b border-gray-800">
                <tr>
                  <th className="py-3 px-4">Order Code</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Operative</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date Created</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredOrders.map((order) => {
                  const theme = getStatusTheme(order.status);
                  return (
                    <tr key={order.id} className="hover:bg-[#1A1C23]/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-[#7B4DFF]">
                        {order.trackingNumber}
                      </td>
                      <td className="py-3 px-4 text-gray-100 font-medium">{order.serviceName}</td>
                      <td className="py-3 px-4">
                        <div className="text-gray-200 font-medium">{order.customerName}</div>
                        <div className="text-[11px] text-gray-500">{order.customerPhone}</div>
                      </td>
                      <td className="py-3 px-4">
                        {order.worker ? (
                          <div className="flex items-center gap-1.5">
                            <HardHat className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="font-medium text-gray-200">
                              {order.worker.name || order.worker.username}
                            </span>
                          </div>
                        ) : (
                          <span className="text-amber-400 font-medium text-[11px]">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col items-start gap-1">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${theme.bg} ${theme.text} ${theme.border}`}
                          >
                            {order.status}
                          </span>
                          {order.status === 'COMPLETED' && (!order.totalCalculatedWage || Number(order.totalCalculatedWage) === 0) && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              Payout Due
                            </span>
                          )}
                          {order.status === 'COMPLETED' && (() => {
                            const specs = (order.specificationDetails as any) || {};
                            const breaks = Array.isArray(specs.breaks)
                              ? specs.breaks
                              : (Array.isArray(specs.breakLog) ? specs.breakLog : []);
                            const actualMins = specs.actualWorkMinutes ?? order.workDurationMinutes ?? 0;
                            const breakMins = specs.totalBreakMinutes ?? breaks.reduce((acc: number, b: any) => acc + (b.durationMinutes || 0), 0);

                            if (actualMins === 0 && breakMins === 0) return null;

                            return (
                              <div className="mt-0.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#14151A] border border-gray-800 text-gray-300">
                                <span className="text-emerald-400 font-bold">{actualMins}m work</span>
                                {breakMins > 0 && (
                                  <span className="text-amber-300">• ☕ {breakMins}m</span>
                                )}
                              </div>
                            );
                          })()}
                          {order.status === 'IN_PROGRESS' && (() => {
                            const timerData = getLiveTimerData(order);
                            if (!timerData) return null;
                            return (
                              <div className={`mt-0.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                                timerData.isOnBreak
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${timerData.isOnBreak ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-ping'}`} />
                                <span>{timerData.isOnBreak ? `Break: ${timerData.breakTimeFormatted}` : timerData.workTimeFormatted}</span>
                              </div>
                            );
                          })()}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!order.worker ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsAssignModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#7B4DFF] hover:bg-[#6839EF] text-white text-xs font-bold transition-all shadow-sm"
                          >
                            Assign
                          </button>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            {order.status === 'IN_PROGRESS' && (() => {
                              const timerData = getLiveTimerData(order);
                              return (
                                <>
                                  {timerData?.isOnBreak ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setResumeTargetOrder(order);
                                        setIsResumeModalOpen(true);
                                      }}
                                      className="px-2 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 text-[11px] font-bold cursor-pointer"
                                      title="Resume Timer"
                                    >
                                      Resume
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setPauseTargetOrder(order);
                                        setAdminPauseReason('Lunch Break');
                                        setAdminPauseNotes('');
                                        setIsPauseModalOpen(true);
                                      }}
                                      className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold cursor-pointer"
                                      title="Pause for Break"
                                    >
                                      Pause
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCompleteTargetOrder(order);
                                      setCompleteUnits(order.completedUnits ?? order.estimatedUnits ?? 1);
                                      setCompleteNotes('');
                                      setIsCompleteModalOpen(true);
                                    }}
                                    className="px-2 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold cursor-pointer"
                                    title="Complete Work"
                                  >
                                    Complete
                                  </button>
                                </>
                              );
                            })()}
                            {order.status !== 'COMPLETED' && order.status !== 'IN_PROGRESS' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setIsAssignModalOpen(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium transition-all"
                              >
                                Squad
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setPayOrder(order);
                                setIsPayModalOpen(true);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer ${
                                order.totalCalculatedWage
                                  ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 animate-pulse'
                              }`}
                            >
                              <IndianRupee className="w-3 h-3" />
                              <span>{order.totalCalculatedWage ? `₹${order.totalCalculatedWage}` : 'Finalize Pay'}</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {isAssignModalOpen && selectedOrder && (
        <AssignWorkerModal
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setSelectedOrder(null);
          }}
          onAssignedSuccess={() => {
            loadData(true);
          }}
          enquiry={selectedOrder}
          workers={workers}
          token={token || undefined}
        />
      )}

      {/* Update Pay Modal */}
      {isPayModalOpen && payOrder && (
        <UpdateJobPayModal
          isOpen={isPayModalOpen}
          onClose={() => {
            setIsPayModalOpen(false);
            setPayOrder(null);
          }}
          enquiry={payOrder}
          token={token || undefined}
          onPayUpdatedSuccess={() => {
            loadData(true);
          }}
        />
      )}

      {/* Create Modal */}
      <CreateWorkModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={() => {
          loadData(true);
        }}
        token={token}
        workers={workers}
      />

      {/* ========================================================
          ADMIN MODAL 1: PAUSE TIMER FOR OPERATIVE
      ======================================================== */}
      {isPauseModalOpen && pauseTargetOrder && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none">
          <div className="relative w-full max-w-md bg-[#16202E] rounded-3xl p-5 sm:p-6 border-2 border-amber-500/50 shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                <Pause className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Pause Work Timer</h3>
                <p className="text-xs text-amber-300/80">
                  {pauseTargetOrder.trackingNumber} • {pauseTargetOrder.worker?.name || 'Operative'}
                </p>
              </div>
            </div>

            {/* Active Time */}
            {(() => {
              const td = getLiveTimerData(pauseTargetOrder);
              return (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Recorded Working Time:</span>
                  <span className="font-mono text-base font-black text-amber-300">
                    {td ? td.workTimeFormatted : '00:00:00'}
                  </span>
                </div>
              );
            })()}

            {/* Reason Selection */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Select Break Reason:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'Breakfast / Morning Tea', icon: '☕', label: 'Breakfast / Tea' },
                  { key: 'Lunch Break', icon: '🍱', label: 'Lunch Break' },
                  { key: 'Evening Tea / Snacks', icon: '🫖', label: 'Evening Tea' },
                  { key: 'Machine / Fuel Refuel', icon: '⛽', label: 'Refuel / Repair' },
                  { key: 'Rain / Weather Delay', icon: '🌧️', label: 'Rain Delay' },
                  { key: 'Other Delay / Obstruction', icon: '❓', label: 'Other Delay' },
                ].map(({ key, icon, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setAdminPauseReason(key)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      adminPauseReason === key
                        ? 'bg-amber-500/20 border-amber-500 text-amber-200 ring-1 ring-amber-500/50'
                        : 'bg-slate-900/70 border-slate-750 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-base">{icon}</span>
                    <span className="text-xs font-bold truncate">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 block">
                Administrative Notes (Optional):
              </label>
              <input
                type="text"
                value={adminPauseNotes}
                onChange={(e) => setAdminPauseNotes(e.target.value)}
                placeholder="e.g. Authorized 30m lunch break on site"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="text-[11px] text-amber-200/80 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl">
              ⚠️ The live working meter will freeze immediately. Break minutes are non-billable to the customer.
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsPauseModalOpen(false);
                  setPauseTargetOrder(null);
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingAdminAction}
                onClick={handleAdminPauseTimer}
                className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isSubmittingAdminAction ? (
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

      {/* ========================================================
          ADMIN MODAL 2: RESUME TIMER FOR OPERATIVE
      ======================================================== */}
      {isResumeModalOpen && resumeTargetOrder && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none">
          <div className="relative w-full max-w-md bg-[#16202E] rounded-3xl p-5 sm:p-6 border-2 border-blue-500/50 shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0">
                <Play className="w-6 h-6 fill-blue-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Resume Work Timer?</h3>
                <p className="text-xs text-blue-300/80">
                  {resumeTargetOrder.trackingNumber} • {resumeTargetOrder.worker?.name || 'Operative'}
                </p>
              </div>
            </div>

            {/* Break Duration Strip */}
            {(() => {
              const td = getLiveTimerData(resumeTargetOrder);
              return (
                <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/30 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-300">Break Reason:</span>
                    <span className="font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/30">
                      {td ? td.activeBreakReason : 'General Break'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-300">Break Duration:</span>
                    <span className="font-mono text-base font-black text-blue-400">
                      {td ? td.breakTimeFormatted : '00:00:00'}
                    </span>
                  </div>
                </div>
              );
            })()}

            <div className="text-[11px] text-blue-200/80 bg-blue-950/40 border border-blue-500/30 p-2.5 rounded-xl">
              ℹ️ Live working chronometer will restart immediately. This break will be archived in the work audit trail.
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsResumeModalOpen(false);
                  setResumeTargetOrder(null);
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                Keep on Break
              </button>
              <button
                type="button"
                disabled={isSubmittingAdminAction}
                onClick={handleAdminResumeTimer}
                className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isSubmittingAdminAction ? (
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

      {/* ========================================================
          ADMIN MODAL 3: COMPLETE WORK ORDER
      ======================================================== */}
      {isCompleteModalOpen && completeTargetOrder && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none">
          <div className="relative w-full max-w-md bg-[#16202E] rounded-3xl p-5 sm:p-6 border-2 border-emerald-500/50 shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Complete Work Order</h3>
                <p className="text-xs text-emerald-300/80">
                  {completeTargetOrder.trackingNumber} • {completeTargetOrder.serviceName}
                </p>
              </div>
            </div>

            {/* Time Stats */}
            {(() => {
              const td = getLiveTimerData(completeTargetOrder);
              return (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Total Active Working Time:</span>
                  <span className="font-mono text-base font-black text-emerald-400">
                    {td ? td.workTimeFormatted : '00:00:00'}
                  </span>
                </div>
              );
            })()}

            {/* Completed Units */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Completed Units ({completeTargetOrder.unitLabel || 'Units'}):
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={completeUnits}
                onChange={(e) => setCompleteUnits(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 block">
                Completion Remarks (Optional):
              </label>
              <textarea
                rows={2}
                value={completeNotes}
                onChange={(e) => setCompleteNotes(e.target.value)}
                placeholder="e.g. Work inspected and verified complete by supervisor"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div className="text-[11px] text-emerald-200/80 bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-xl">
              ✓ Upon completion, status changes to COMPLETED. Wage settlement can be finalized immediately after.
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsCompleteModalOpen(false);
                  setCompleteTargetOrder(null);
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingAdminAction}
                onClick={handleAdminCompleteWork}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isSubmittingAdminAction ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>Finish Work</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
