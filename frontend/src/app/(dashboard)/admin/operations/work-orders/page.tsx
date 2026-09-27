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
} from 'lucide-react';
import { EnquiryService, ServiceEnquiry, WorkerWithAvailability } from '@/services';
import { CreateWorkModal } from '@/components/OfficeStaff/CreateWorkModal';
import { AssignWorkerModal } from '@/components/OfficeStaff/AssignWorkerModal';
import { UpdateJobPayModal } from '@/components/OfficeStaff/UpdateJobPayModal';
import { AdminDropdown, AdminDropdownOption } from '@/components/Admin/admin-dropdown';

export default function AdminWorkOrdersPage() {
  const { token, user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [workOrders, setWorkOrders] = useState<ServiceEnquiry[]>([]);
  const [workers, setWorkers] = useState<WorkerWithAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ServiceEnquiry | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payOrder, setPayOrder] = useState<ServiceEnquiry | null>(null);

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

  const filteredOrders = useMemo(() => {
    return workOrders.filter((item) => {
      const matchSearch =
        searchTerm === '' ||
        item.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customerPhone.includes(searchTerm);

      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [workOrders, searchTerm, statusFilter]);

  const metrics = useMemo(() => {
    const total = workOrders.length;
    const assigned = workOrders.filter((w) => w.status === 'ASSIGNED').length;
    const inProgress = workOrders.filter((w) => w.status === 'IN_PROGRESS').length;
    const completed = workOrders.filter((w) => w.status === 'COMPLETED').length;
    return { total, assigned, inProgress, completed };
  }, [workOrders]);

  const statusDropdownOptions: AdminDropdownOption[] = [
    { value: 'ALL', label: 'All Work Orders', badge: `${metrics.total}` },
    {
      value: 'PENDING',
      label: 'Pending Assignment',
      badge: `${workOrders.filter((w) => w.status === 'PENDING').length}`,
      badgeColor: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
      icon: Clock,
    },
    {
      value: 'ASSIGNED',
      label: 'Squad Assigned',
      badge: `${metrics.assigned}`,
      badgeColor: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
      icon: HardHat,
    },
    {
      value: 'IN_PROGRESS',
      label: 'In Execution',
      badge: `${metrics.inProgress}`,
      badgeColor: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
      icon: Sparkles,
    },
    {
      value: 'COMPLETED',
      label: 'Completed Works',
      badge: `${metrics.completed}`,
      badgeColor: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
      icon: CheckCircle2,
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#14151A] border border-gray-800/80 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by code, customer, service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-xs text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-[#7B4DFF] transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="w-56">
            <AdminDropdown
              options={statusDropdownOptions}
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              variant="purple"
              size="md"
            />
          </div>

          <div className="flex items-center bg-[#1A1C23] border border-gray-800 rounded-xl p-1 shrink-0">
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

                    <span
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border ${theme.bg} ${theme.text} ${theme.border} uppercase tracking-wider shrink-0`}
                    >
                      {order.status.replace('_', ' ')}
                    </span>
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
                <div className="flex items-center justify-between pt-2 gap-2">
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
                    <div className="flex items-center gap-2 w-full">
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
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${theme.bg} ${theme.text} ${theme.border}`}
                        >
                          {order.status}
                        </span>
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
                            <button
                              type="button"
                              onClick={() => {
                                setPayOrder(order);
                                setIsPayModalOpen(true);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                order.totalCalculatedWage
                                  ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40'
                              }`}
                            >
                              {order.totalCalculatedWage ? `₹${order.totalCalculatedWage}` : 'Finalize Pay'}
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
    </div>
  );
}
