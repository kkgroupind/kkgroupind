'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import {
  Inbox,
  Search,
  RefreshCw,
  Plus,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Send,
  Eye,
  X,
  HardHat,
  Shield,
  Building,
  Sparkles,
  LayoutGrid,
  List,
  Clock,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  ChevronRight,
  User,
  FileText,
  Receipt,
} from 'lucide-react';
import { EnquiryService, ServiceEnquiry, WorkerWithAvailability } from '@/services';
import { AssignWorkerModal } from '@/components/OfficeStaff/AssignWorkerModal';
import { CreateWorkModal } from '@/components/OfficeStaff/CreateWorkModal';
import { QuotationModal } from '@/components/Quotation';
import { InvoiceModal } from '@/components/Invoice';

export default function AdminEnquiriesPage() {
  const { token, user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [enquiries, setEnquiries] = useState<ServiceEnquiry[]>([]);
  const [workers, setWorkers] = useState<WorkerWithAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals
  const [selectedEnquiry, setSelectedEnquiry] = useState<ServiceEnquiry | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEnquiryForQuotation, setSelectedEnquiryForQuotation] = useState<ServiceEnquiry | null>(null);
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [selectedEnquiryForInvoice, setSelectedEnquiryForInvoice] = useState<ServiceEnquiry | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const loadData = useCallback(
    async (showRefreshIndicator = false) => {
      if (!token) return;
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      try {
        const [enqRes, workersRes] = await Promise.allSettled([
          EnquiryService.getAllEnquiries({}, token),
          EnquiryService.getActiveWorkers(token),
        ]);
        if (enqRes.status === 'fulfilled') {
          setEnquiries(enqRes.value.enquiries || []);
        }
        if (workersRes.status === 'fulfilled') {
          setWorkers(workersRes.value.workers || []);
        }
      } catch (err) {
        console.error('Failed to load enquiries', err);
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

  const getEnquiryPriority = (item: ServiceEnquiry): number => {
    if (item.status === 'PENDING') return 1;
    if (item.status === 'IN_PROGRESS') return 2;
    if (item.status === 'ASSIGNED') return 3;
    if (item.status === 'COMPLETED') return 4;
    return 5;
  };

  const filteredEnquiries = useMemo(() => {
    const list = enquiries.filter((item) => {
      const matchSearch =
        searchTerm === '' ||
        item.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customerPhone.includes(searchTerm) ||
        (item.city && item.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.district && item.district.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });

    return [...list].sort((a, b) => {
      if (statusFilter === 'ALL') {
        const priorityDiff = getEnquiryPriority(a) - getEnquiryPriority(b);
        if (priorityDiff !== 0) return priorityDiff;
      }
      const timeA = new Date(a.createdAt || a.updatedAt).getTime();
      const timeB = new Date(b.createdAt || b.updatedAt).getTime();
      return timeB - timeA;
    });
  }, [enquiries, searchTerm, statusFilter]);

  const metrics = useMemo(() => {
    const total = enquiries.length;
    const pending = enquiries.filter((e) => e.status === 'PENDING').length;
    const inProgress = enquiries.filter(
      (e) => e.status === 'IN_PROGRESS' || e.status === 'ASSIGNED',
    ).length;
    const completed = enquiries.filter((e) => e.status === 'COMPLETED').length;

    // Worker availability metrics
    const totalWorkers = workers.length;
    const availableWorkers = workers.filter((w) => w.workerStatus === 'AVAILABLE').length;
    const busyWorkers = workers.filter((w) => w.workerStatus === 'BUSY').length;
    const offDutyWorkers = workers.filter((w) => w.workerStatus === 'OFF_DUTY').length;

    return {
      total,
      pending,
      inProgress,
      completed,
      totalWorkers,
      availableWorkers,
      busyWorkers,
      offDutyWorkers,
    };
  }, [enquiries, workers]);

  const statusPills = [
    {
      value: 'PENDING',
      label: 'Pending Assignment',
      badge: `${metrics.pending}`,
      icon: Clock,
      activeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.25)]',
    },
    {
      value: 'IN_PROGRESS',
      label: 'In Execution',
      badge: `${enquiries.filter((e) => e.status === 'IN_PROGRESS').length}`,
      icon: Sparkles,
      activeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.25)]',
    },
    {
      value: 'ASSIGNED',
      label: 'Squad Assigned',
      badge: `${enquiries.filter((e) => e.status === 'ASSIGNED').length}`,
      icon: HardHat,
      activeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.25)]',
    },
    {
      value: 'COMPLETED',
      label: 'Completed & Fulfilled',
      badge: `${metrics.completed}`,
      icon: CheckCircle2,
      activeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
    },
    {
      value: 'ALL',
      label: 'All Orders',
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
            <div className="p-2.5 bg-[#14151A] border border-gray-800 rounded-2xl shadow-sm">
              <Inbox className="w-6 h-6 text-[#7B4DFF]" />
            </div>
            Job Orders &amp; Enquiries
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Centralized operational management for client booking requests, field execution, and worker dispatch
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
          <Link
            href="/admin/operations/assignments"
            className="flex items-center gap-2 bg-[#14151A] hover:bg-[#1A1C23] border border-gray-800 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-gray-300 hover:text-white transition-all cursor-pointer shadow-sm"
          >
            <HardHat className="w-4 h-4 text-emerald-400" />
            <span>Workforce Dispatch</span>
          </Link>

          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-2 bg-[#14151A] hover:bg-[#1A1C23] border border-gray-800 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-gray-300 hover:text-white transition-all disabled:opacity-50 cursor-pointer shadow-sm"
            title="Reload data"
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
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="group p-5 rounded-2xl bg-[#14151A] border border-gray-800/80 hover:border-gray-700/80 transition-all duration-300 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gray-700/40 to-transparent group-hover:via-gray-500/60 transition-all duration-300" />
          <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
            Total Enquiries
          </span>
          <div className="text-2xl font-bold text-gray-100 mt-1">{metrics.total}</div>
          <span className="text-[11px] text-gray-500 mt-1 block">Registered in Kerala hub</span>
        </div>

        <div className="group p-5 rounded-2xl bg-[#14151A] border border-gray-800/80 hover:border-gray-700/80 transition-all duration-300 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent group-hover:via-amber-500/70 transition-all duration-300" />
          <span className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider">
            Pending Assignment
          </span>
          <div className="text-2xl font-bold text-amber-400 mt-1">{metrics.pending}</div>
          <span className="text-[11px] text-amber-400/70 mt-1 block">Awaiting worker allocation</span>
        </div>

        <div className="group p-5 rounded-2xl bg-[#14151A] border border-gray-800/80 hover:border-gray-700/80 transition-all duration-300 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent group-hover:via-emerald-500/70 transition-all duration-300" />
          <span className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider">
            Ready Workers
          </span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {metrics.availableWorkers}{' '}
            <span className="text-xs text-gray-400 font-normal">/ {metrics.totalWorkers} total</span>
          </div>
          <span className="text-[11px] text-emerald-400/70 mt-1 block">Ready for immediate dispatch</span>
        </div>

        <div className="group p-5 rounded-2xl bg-[#14151A] border border-gray-800/80 hover:border-gray-700/80 transition-all duration-300 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent group-hover:via-blue-500/70 transition-all duration-300" />
          <span className="text-[11px] text-blue-400 font-semibold uppercase tracking-wider">
            Active Missions
          </span>
          <div className="text-2xl font-bold text-blue-400 mt-1">{metrics.inProgress}</div>
          <span className="text-[11px] text-blue-400/70 mt-1 block">Dispatched or in execution</span>
        </div>
      </div>

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
              placeholder="Search code, customer, service, city..."
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

      {/* Main Content Area: Default Card Grid */}
      {isLoading ? (
        <div className="bg-[#14151A] rounded-2xl border border-gray-800 p-16 text-center flex flex-col items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[#7B4DFF] mb-3" />
          <h3 className="text-gray-200 font-semibold text-base mb-1">Loading Enquiries...</h3>
          <p className="text-gray-500 text-xs">Fetching registered Kerala operations tickets</p>
        </div>
      ) : filteredEnquiries.length === 0 ? (
        <div className="bg-[#14151A] rounded-2xl border border-gray-800 p-16 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-[#1A1C23] border border-gray-800 flex items-center justify-center text-gray-500 mb-4">
            <Inbox className="w-7 h-7 text-gray-500" />
          </div>
          <h3 className="text-gray-200 font-semibold text-base mb-1">No Enquiries Found</h3>
          <p className="text-gray-500 text-xs max-w-sm">
            No work requests match the chosen status filter or search keywords.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Bento Cards View (Matching PeopleCards Design System) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEnquiries.map((enquiry) => {
            const theme = getStatusTheme(enquiry.status);
            const dateStr = enquiry.createdAt
              ? new Date(enquiry.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : 'Unknown';

            return (
              <div
                key={enquiry.id}
                className="group bg-[#14151A] rounded-2xl border border-gray-800/80 hover:border-gray-700/80 p-5 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex flex-col justify-between relative overflow-hidden"
              >
                {/* Subtle top ambient glow */}
                <div
                  className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gray-700/40 to-transparent ${theme.glow} transition-all duration-300`}
                />

                <div>
                  {/* Top Header: Avatar/Icon, Service Name, Status Badge */}
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
                          {enquiry.serviceName}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-xs font-semibold text-[#7B4DFF]">
                            {enquiry.trackingNumber}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border ${theme.bg} ${theme.text} ${theme.border} uppercase tracking-wider shrink-0`}
                    >
                      {enquiry.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Wage Model & Rate Tag */}
                  <div className="mb-3 flex flex-wrap items-center gap-1.5">
                    {enquiry.wageType === 'PER_TREE' ? (
                      <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                        🌴 Tree Count Model
                      </span>
                    ) : enquiry.wageType === 'HOURLY' || enquiry.isHourlyCalculated ? (
                      <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-lg border border-amber-500/20">
                        ⏱️ Hourly Meter Model
                      </span>
                    ) : enquiry.wageType === 'PER_SQFT' ? (
                      <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-lg border border-blue-500/20">
                        📐 Sq. Ft. Model
                      </span>
                    ) : enquiry.wageType === 'PER_POINT' ? (
                      <span className="text-[10px] font-bold bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-lg border border-purple-500/20">
                        ⚡ Points Model
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-gray-800 text-gray-300 px-2 py-0.5 rounded-lg border border-gray-700">
                        {enquiry.unitLabel || 'Standard'} Basis
                      </span>
                    )}

                    {enquiry.unitRate ? (
                      <span className="text-[10px] font-mono text-gray-400 bg-[#1A1C23] px-2 py-0.5 rounded-lg border border-gray-800">
                        ₹{enquiry.unitRate} / {enquiry.unitLabel || 'Unit'}
                      </span>
                    ) : null}
                  </div>

                  {/* Details List (Exact PeopleCards Border-y Style) */}
                  <div className="space-y-2 py-3 border-y border-gray-800/60 my-3 text-xs">
                    {/* Customer */}
                    <div className="flex items-center justify-between text-gray-400 gap-2">
                      <span className="flex items-center gap-2 text-gray-400 truncate">
                        <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate text-gray-200 font-medium">
                          {enquiry.customerName}
                        </span>
                      </span>
                      <span className="text-gray-400 font-mono text-[11px] shrink-0">
                        {enquiry.customerPhone}
                      </span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center justify-between text-gray-400 gap-2">
                      <span className="flex items-center gap-2 text-gray-400 truncate">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">
                          {enquiry.city || enquiry.district || enquiry.location || 'Kerala'}
                        </span>
                      </span>
                      {enquiry.deadline && (
                        <span className="text-amber-400/90 text-[11px] shrink-0">
                          Due: {new Date(enquiry.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Assigned Operative */}
                    <div className="flex items-center justify-between text-gray-400 gap-2">
                      <span className="flex items-center gap-2 text-gray-400 truncate">
                        <HardHat className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">
                          {enquiry.worker ? (
                            <span className="text-emerald-400 font-medium">
                              {enquiry.worker.name || enquiry.worker.username}
                            </span>
                          ) : (
                            <span className="text-amber-400 font-medium">Unassigned</span>
                          )}
                        </span>
                      </span>
                      {enquiry.worker && (
                        <span className="text-[10px] text-gray-500 font-mono">
                          {enquiry.worker.phone || ''}
                        </span>
                      )}
                    </div>

                    {/* Source / Creator Attribution */}
                    <div className="flex items-center justify-between text-gray-400">
                      <span className="flex items-center gap-2 text-gray-400">
                        <Shield className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>Source</span>
                      </span>
                      <span>
                        {enquiry.createdByRole === 'OFFICE_STAFF' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            🏢 Office Staff ({enquiry.creator?.name || 'Staff'})
                          </span>
                        ) : enquiry.createdByRole === 'SUPER_ADMIN' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            👑 Super Admin
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            🌐 Customer Web
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="flex items-center justify-between pt-2 gap-2 flex-wrap sm:flex-nowrap">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEnquiry(enquiry);
                      setIsDetailsModalOpen(true);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-medium bg-[#1A1C23] hover:bg-[#252834] text-gray-200 hover:text-white border border-gray-800 transition-all group-hover:border-gray-700 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-gray-400" />
                    <span>Quick View</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEnquiryForQuotation(enquiry);
                      setIsQuotationModalOpen(true);
                    }}
                    className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl text-xs font-bold bg-[#2A835F]/20 hover:bg-[#2A835F]/35 text-[#A3E5C7] hover:text-white border border-[#2A835F]/40 transition-all cursor-pointer shadow-xs"
                    title="Generate Quotation PDF & WhatsApp"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#2A835F]" />
                    <span>Quotation</span>
                  </button>

                  {enquiry.status === 'COMPLETED' && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEnquiryForInvoice(enquiry);
                        setIsInvoiceModalOpen(true);
                      }}
                      className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl text-xs font-bold bg-teal-500/20 hover:bg-teal-500/35 text-teal-300 hover:text-white border border-teal-500/40 transition-all cursor-pointer shadow-xs"
                      title="Generate Official Tax Invoice PDF & WhatsApp"
                    >
                      <Receipt className="w-3.5 h-3.5 text-teal-400" />
                      <span>Invoice</span>
                    </button>
                  )}

                  <Link
                    href={`/admin/operations/enquiries/${enquiry.id}`}
                    className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl text-xs font-bold bg-[#7B4DFF]/15 hover:bg-[#7B4DFF]/25 border border-[#7B4DFF]/30 text-[#A78BFA] hover:text-white transition-all"
                    title="Full Work Order Page"
                  >
                    <span>Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>

                  {enquiry.status === 'PENDING' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEnquiry(enquiry);
                        setIsAssignModalOpen(true);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#7B4DFF] hover:bg-[#6839EF] text-white shadow-[0_0_15px_rgba(123,77,255,0.25)] transition-all cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch</span>
                    </button>
                  ) : null}
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
                  <th className="py-3.5 px-4">Tracking Code</th>
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Location (Kerala)</th>
                  <th className="py-3.5 px-4">Source / Creator</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Assigned Worker</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredEnquiries.map((enquiry) => {
                  const theme = getStatusTheme(enquiry.status);
                  return (
                    <tr key={enquiry.id} className="hover:bg-[#1A1C23]/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#7B4DFF] whitespace-nowrap">
                        {enquiry.trackingNumber}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-100 whitespace-nowrap">
                        {enquiry.serviceName}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-200">{enquiry.customerName}</div>
                        <div className="text-[11px] text-gray-400 font-mono">{enquiry.customerPhone}</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-[180px] truncate">
                        <div className="flex items-center gap-1 text-gray-200">
                          <MapPin className="w-3 h-3 text-[#7B4DFF] shrink-0" />
                          <span className="truncate">
                            {enquiry.city || enquiry.district || enquiry.location || 'Kerala'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {enquiry.createdByRole === 'OFFICE_STAFF' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            🏢 Office Staff
                          </span>
                        ) : enquiry.createdByRole === 'SUPER_ADMIN' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            👑 Super Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            🌐 Customer Web
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${theme.bg} ${theme.text} ${theme.border}`}
                        >
                          {enquiry.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {enquiry.worker ? (
                          <div className="flex items-center gap-1.5 text-gray-200 font-medium">
                            <HardHat className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{enquiry.worker.name || enquiry.worker.username}</span>
                          </div>
                        ) : (
                          <span className="text-amber-400 text-xs font-semibold">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedEnquiryForQuotation(enquiry);
                              setIsQuotationModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-[#2A835F]/20 hover:bg-[#2A835F]/35 text-[#A3E5C7] hover:text-white border border-[#2A835F]/40 transition-colors cursor-pointer"
                            title="Generate Quotation PDF & WhatsApp"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          {enquiry.status === 'COMPLETED' && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedEnquiryForInvoice(enquiry);
                                setIsInvoiceModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/35 text-teal-300 hover:text-white border border-teal-500/40 transition-colors cursor-pointer"
                              title="Generate Official Tax Invoice PDF & WhatsApp"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <Link
                            href={`/admin/operations/enquiries/${enquiry.id}`}
                            className="p-1.5 rounded-lg bg-[#7B4DFF]/15 hover:bg-[#7B4DFF]/25 text-[#A78BFA] hover:text-white border border-[#7B4DFF]/30 transition-colors"
                            title="Open Full Details Page"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedEnquiry(enquiry);
                              setIsDetailsModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-[#1A1C23] hover:bg-[#252834] text-gray-300 border border-gray-800 transition-colors"
                            title="Quick View"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {enquiry.status === 'PENDING' && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedEnquiry(enquiry);
                                setIsAssignModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#7B4DFF] hover:bg-[#6839EF] text-white text-[11px] font-bold shadow-sm"
                            >
                              Dispatch
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Enquiry Details Modal (100% Matching People Modal Styling) */}
      {isDetailsModalOpen && selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[#14151A] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Top ambient glow line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#7B4DFF]/60 to-transparent" />

            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-[#14151A]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#1A1C23] border border-gray-800 rounded-xl">
                  <Inbox className="w-5 h-5 text-[#7B4DFF]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
                    <span>Ticket Details</span>
                    <span className="font-mono text-xs text-[#7B4DFF] px-2 py-0.5 rounded-md bg-[#7B4DFF]/10 border border-[#7B4DFF]/20">
                      {selectedEnquiry.trackingNumber}
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400">
                    Registered request information and operations dispatch status
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-200 bg-[#1A1C23] hover:bg-[#232630] rounded-xl border border-gray-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
              {/* Service & Customer Stats Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#1A1C23] border border-gray-800/80">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">
                    Requested Service
                  </span>
                  <div className="font-bold text-gray-100 text-sm">
                    {selectedEnquiry.serviceName}
                  </div>
                  <span className="text-xs text-gray-400 block mt-0.5">
                    Category: {selectedEnquiry.serviceCategory || 'General Operations'}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#1A1C23] border border-gray-800/80">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">
                    Customer Information
                  </span>
                  <div className="font-bold text-gray-100 text-sm">
                    {selectedEnquiry.customerName}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                    <span className="font-mono">{selectedEnquiry.customerPhone}</span>
                    {selectedEnquiry.customerEmail && <span>• {selectedEnquiry.customerEmail}</span>}
                  </div>
                </div>
              </div>

              {/* Kerala Location Details */}
              <div className="p-4 rounded-xl bg-[#1A1C23] border border-gray-800/80 space-y-2">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
                  Location &amp; Coordinates (Kerala Operations)
                </span>
                <div className="flex items-center gap-2 text-gray-200 text-xs">
                  <MapPin className="w-4 h-4 text-[#7B4DFF] shrink-0" />
                  <span className="font-medium">
                    {[selectedEnquiry.location, selectedEnquiry.city, selectedEnquiry.district]
                      .filter(Boolean)
                      .join(', ') || 'Kerala, India'}
                  </span>
                </div>
                {selectedEnquiry.latitude && selectedEnquiry.longitude && (
                  <div className="text-[11px] text-gray-400 font-mono">
                    GPS Coordinates: {selectedEnquiry.latitude.toFixed(6)},{' '}
                    {selectedEnquiry.longitude.toFixed(6)}
                  </div>
                )}
              </div>

              {/* Wage Model Box */}
              {selectedEnquiry.wageType && (
                <div className="p-4 rounded-xl bg-[#1A1C23] border border-gray-800/80 space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-800/60 pb-2">
                    <span className="text-xs font-semibold text-gray-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#7B4DFF]" />
                      <span>Wage &amp; Billing Calculation Model</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-[#7B4DFF]/10 text-[#7B4DFF] border border-[#7B4DFF]/20">
                      Unit: {selectedEnquiry.unitLabel || 'Unit'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-gray-500 block text-[10px] uppercase font-bold">
                        Client Rate
                      </span>
                      <span className="font-bold text-gray-200">
                        ₹{selectedEnquiry.unitRate || selectedEnquiry.hourlyRate || '—'} /{' '}
                        {selectedEnquiry.unitLabel || 'Unit'}
                      </span>
                    </div>

                    <div>
                      <span className="text-emerald-400 block text-[10px] uppercase font-bold">
                        Worker Wage
                      </span>
                      <span className="font-bold text-emerald-400">
                        ₹{selectedEnquiry.workerUnitWage || '—'} / {selectedEnquiry.unitLabel || 'Unit'}
                      </span>
                    </div>

                    <div>
                      <span className="text-amber-400 block text-[10px] uppercase font-bold">
                        Quantity / Units
                      </span>
                      <span className="font-bold text-amber-300">
                        {selectedEnquiry.completedUnits !== null &&
                        selectedEnquiry.completedUnits !== undefined
                          ? `${selectedEnquiry.completedUnits} (Done)`
                          : selectedEnquiry.estimatedUnits
                          ? `${selectedEnquiry.estimatedUnits} (Est)`
                          : 'Pending'}
                      </span>
                    </div>

                    <div>
                      <span className="text-blue-400 block text-[10px] uppercase font-bold">
                        Worker Payout
                      </span>
                      <span className="font-bold text-blue-300">
                        {selectedEnquiry.totalCalculatedWage
                          ? `₹${selectedEnquiry.totalCalculatedWage.toLocaleString('en-IN')}`
                          : selectedEnquiry.completedUnits && selectedEnquiry.workerUnitWage
                          ? `₹${Math.round(
                              selectedEnquiry.completedUnits * selectedEnquiry.workerUnitWage,
                            ).toLocaleString('en-IN')}`
                          : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Message / Requirements */}
              <div className="p-4 rounded-xl bg-[#1A1C23] border border-gray-800/80">
                <span className="text-gray-500 block mb-1 text-[10px] font-bold uppercase tracking-wider">
                  Customer Requirements
                </span>
                <p className="text-gray-200 text-xs italic">&ldquo;{selectedEnquiry.message}&rdquo;</p>
              </div>

              {/* Assigned Worker */}
              {selectedEnquiry.worker && (
                <div className="p-4 rounded-xl bg-[#1A1C23] border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-gray-500 block mb-0.5 text-[10px] font-bold uppercase tracking-wider">
                      Assigned Field Operative
                    </span>
                    <span className="font-bold text-emerald-400 text-sm">
                      {selectedEnquiry.worker.name || selectedEnquiry.worker.username}
                    </span>
                    {selectedEnquiry.workerAcceptance && (
                      <span className="block text-[10px] text-gray-400 mt-0.5">
                        Acceptance: {selectedEnquiry.workerAcceptance}
                      </span>
                    )}
                  </div>
                  <a
                    href={`tel:${selectedEnquiry.worker.phone}`}
                    className="text-xs font-mono font-bold text-gray-300 hover:text-white px-3 py-1.5 bg-[#14151A] rounded-lg border border-gray-800"
                  >
                    {selectedEnquiry.worker.phone || 'No phone'}
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between gap-3 p-5 border-t border-gray-800 bg-[#14151A]">
              <Link
                href={`/admin/operations/enquiries/${selectedEnquiry.id}`}
                className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-[#A78BFA] hover:text-white font-bold text-xs border border-purple-500/30 transition-all flex items-center gap-1.5"
              >
                <span>Open Full Command Center</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedEnquiryForQuotation(selectedEnquiry);
                    setIsQuotationModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#2A835F] hover:bg-[#236D4F] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Create Quotation</span>
                </button>
                {selectedEnquiry.status === 'COMPLETED' && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEnquiryForInvoice(selectedEnquiry);
                      setIsInvoiceModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Generate Invoice</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#1A1C23] hover:bg-[#252834] text-gray-300 font-medium text-xs border border-gray-800 transition-colors cursor-pointer"
                >
                  Close
                </button>
                {selectedEnquiry.status === 'PENDING' && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsDetailsModalOpen(false);
                      setIsAssignModalOpen(true);
                    }}
                    className="px-5 py-2 rounded-xl bg-[#7B4DFF] hover:bg-[#6839EF] text-white font-bold text-xs shadow-[0_0_15px_rgba(123,77,255,0.3)] transition-all cursor-pointer"
                  >
                    Dispatch to Worker
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {isAssignModalOpen && selectedEnquiry && (
        <AssignWorkerModal
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setSelectedEnquiry(null);
          }}
          onAssignedSuccess={() => {
            loadData();
          }}
          enquiry={selectedEnquiry}
          workers={workers}
          token={token || undefined}
        />
      )}

      {/* Create Modal */}
      <CreateWorkModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={() => {
          loadData();
        }}
        token={token}
        workers={workers}
      />

      {/* Quotation Modal */}
      <QuotationModal
        isOpen={isQuotationModalOpen}
        onClose={() => {
          setIsQuotationModalOpen(false);
          setSelectedEnquiryForQuotation(null);
        }}
        enquiry={selectedEnquiryForQuotation}
        currentUserName={user?.name || user?.username || 'Super Admin'}
        currentUserRole="SUPER_ADMIN"
      />

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setSelectedEnquiryForInvoice(null);
        }}
        enquiry={selectedEnquiryForInvoice}
        currentUserName={user?.name || user?.username || 'Super Admin'}
        currentUserRole="SUPER_ADMIN"
      />
    </div>
  );
}
