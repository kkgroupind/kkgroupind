'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import {
  Inbox,
  Search,
  RefreshCw,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  UserCheck,
  ChevronRight,
  Send,
  Eye,
  X,
  Plus,
  Navigation,
  ExternalLink,
  Timer,
  HardHat,
  Shield,
  Building,
} from 'lucide-react';
import { EnquiryService, ServiceEnquiry, WorkerWithAvailability } from '@/services';
import { AssignWorkerModal } from '@/components/OfficeStaff/AssignWorkerModal';
import { CreateWorkModal } from '@/components/OfficeStaff/CreateWorkModal';

export default function AdminEnquiriesPage() {
  const { token, user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [enquiries, setEnquiries] = useState<ServiceEnquiry[]>([]);
  const [workers, setWorkers] = useState<WorkerWithAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [selectedEnquiry, setSelectedEnquiry] = useState<ServiceEnquiry | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((item) => {
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

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10 text-slate-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-[#0c1310] border border-emerald-500/30 rounded-xl">
              <Inbox className="w-6 h-6 text-emerald-400" />
            </div>
            Customer Enquiries &amp; Dispatch Queue
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Review service requests, verify creator attribution, and assign to available field operatives
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-2 bg-[#0c1310] hover:bg-[#121f18] border border-emerald-500/30 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
            title="Reload data"
          >
            <RefreshCw
              className={`w-4 h-4 text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            <span>{isRefreshing ? 'Refreshing...' : 'Reload'}</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-[#2A835F] hover:bg-[#236D4F] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white shadow-lg transition-all ml-auto sm:ml-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Enquiry</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#0c1310] border border-emerald-500/20">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Total Enquiries</span>
          <div className="text-2xl font-black text-white mt-1">{metrics.total}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Registered in Kerala hub</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c1310] border border-amber-500/20">
          <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider">Pending Assignment</span>
          <div className="text-2xl font-black text-amber-400 mt-1">{metrics.pending}</div>
          <span className="text-[11px] text-amber-500/80 mt-1 block">Awaiting worker allocation</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c1310] border border-emerald-500/30">
          <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">Ready Workers</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {metrics.availableWorkers}{' '}
            <span className="text-xs text-slate-400 font-normal">/ {metrics.totalWorkers} total</span>
          </div>
          <span className="text-[11px] text-emerald-500/80 mt-1 block">Ready for immediate dispatch</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c1310] border border-blue-500/20">
          <span className="text-[11px] text-blue-400 font-bold uppercase tracking-wider">Active Missions</span>
          <div className="text-2xl font-black text-blue-400 mt-1">{metrics.inProgress}</div>
          <span className="text-[11px] text-blue-400/80 mt-1 block">Dispatched or in progress</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-[#0c1310] border border-emerald-500/20">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search code, customer, service, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-black/30 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#0c1310] rounded-2xl border border-emerald-500/20 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#101b15] text-slate-400 font-bold border-b border-emerald-500/20">
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
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-400" />
                    <span>Loading enquiries...</span>
                  </td>
                </tr>
              ) : filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No enquiries found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map((enquiry) => (
                  <tr key={enquiry.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Tracking Number */}
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 whitespace-nowrap">
                      {enquiry.trackingNumber}
                      {enquiry.isHourlyCalculated && (
                        <span className="ml-1.5 text-[9px] font-sans font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                          ⏱️ Hourly Meter
                        </span>
                      )}
                    </td>

                    {/* Service Name */}
                    <td className="py-3.5 px-4 font-semibold text-white whitespace-nowrap">
                      {enquiry.serviceName}
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">{enquiry.customerName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{enquiry.customerPhone}</div>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 max-w-[180px] truncate">
                      <div className="flex items-center gap-1 text-slate-200">
                        <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">
                          {enquiry.city || enquiry.district || enquiry.location || 'Kerala'}
                        </span>
                      </div>
                      {enquiry.deadline && (
                        <div className="text-[10px] text-amber-400/90 font-medium mt-0.5">
                          Deadline: {new Date(enquiry.deadline).toLocaleDateString()}
                        </div>
                      )}
                    </td>

                    {/* Source / Creator Attribution Flag */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {enquiry.createdByRole === 'OFFICE_STAFF' ? (
                        <div className="flex flex-col">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 w-fit">
                            🏢 Office Staff
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            {enquiry.creator?.name || 'Staff Member'}
                          </span>
                        </div>
                      ) : enquiry.createdByRole === 'SUPER_ADMIN' ? (
                        <div className="flex flex-col">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 w-fit">
                            👑 Super Admin
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            {enquiry.creator?.name || 'Admin'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 w-fit">
                            🌐 Customer Web
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            Self-Service
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          enquiry.status === 'COMPLETED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : enquiry.status === 'IN_PROGRESS'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse'
                            : enquiry.status === 'ASSIGNED'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {enquiry.status.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Assigned Worker */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {enquiry.worker ? (
                        <div className="flex flex-col">
                          <span className="font-semibold text-white">
                            {enquiry.worker.name || enquiry.worker.username}
                          </span>
                          {enquiry.workerAcceptance && (
                            <span className="text-[10px] text-emerald-400 font-medium">
                              ✓ Accepted
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-amber-400 font-semibold text-[11px]">Unassigned</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEnquiry(enquiry);
                            setIsDetailsModalOpen(true);
                          }}
                          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="View Full Details"
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
                            className="px-3 py-1 rounded-xl bg-[#2A835F] hover:bg-[#236D4F] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                          >
                            Assign
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {isDetailsModalOpen && selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-xl bg-[#0c1310] rounded-3xl border border-emerald-500/30 p-6 space-y-4 text-xs text-slate-300 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Inbox className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Work Order Dossier</h3>
                  <span className="font-mono text-emerald-400 text-xs font-bold">
                    {selectedEnquiry.trackingNumber}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Creator Flag & Status */}
              <div className="p-3 rounded-2xl bg-[#121f18] border border-emerald-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Origin &amp; Creator</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    {selectedEnquiry.createdByRole === 'OFFICE_STAFF' ? (
                      <span className="text-purple-300 font-semibold">
                        🏢 Office Staff: {selectedEnquiry.creator?.name || 'Staff Member'}
                      </span>
                    ) : selectedEnquiry.createdByRole === 'SUPER_ADMIN' ? (
                      <span className="text-amber-300 font-semibold">
                        👑 Super Admin: {selectedEnquiry.creator?.name || 'Admin'}
                      </span>
                    ) : (
                      <span className="text-emerald-300 font-semibold">
                        🌐 Customer Self-Service (Web)
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block text-right">Status</span>
                  <span className="font-bold text-emerald-400 block text-right">{selectedEnquiry.status}</span>
                </div>
              </div>

              {/* Service & Client Grid */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#121f18] border border-white/5">
                <div>
                  <span className="text-slate-400 block mb-0.5 text-[10px] font-bold uppercase">Service</span>
                  <span className="font-bold text-white text-sm">{selectedEnquiry.serviceName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 text-[10px] font-bold uppercase">Preferred Schedule</span>
                  <span className="font-semibold text-slate-200">
                    {selectedEnquiry.preferredDate
                      ? new Date(selectedEnquiry.preferredDate).toLocaleDateString()
                      : 'Immediate Dispatch'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 text-[10px] font-bold uppercase">Customer Name</span>
                  <span className="text-white font-medium">{selectedEnquiry.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 text-[10px] font-bold uppercase">Phone</span>
                  <a
                    href={`tel:${selectedEnquiry.customerPhone}`}
                    className="text-emerald-400 font-bold hover:underline"
                  >
                    {selectedEnquiry.customerPhone}
                  </a>
                </div>
              </div>

              {/* Location & GPS Link */}
              <div className="p-3.5 rounded-2xl bg-[#121f18] border border-white/5 space-y-2">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Location &amp; GPS</span>
                <div className="text-white font-medium flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{selectedEnquiry.location || `${selectedEnquiry.city || ''}, ${selectedEnquiry.district || 'Kasaragod'}, Kerala`}</span>
                </div>

                {selectedEnquiry.mapUrl && (
                  <div className="pt-2 border-t border-white/5">
                    <a
                      href={selectedEnquiry.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30 transition-all"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Open GPS Pin in Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {selectedEnquiry.locationRemarks && (
                  <div className="pt-1 text-slate-300">
                    <strong className="text-slate-400">Road / Access Remarks: </strong>
                    {selectedEnquiry.locationRemarks}
                  </div>
                )}
              </div>

              {/* Machinery & Hourly Calculation */}
              {selectedEnquiry.isHourlyCalculated && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                    <Timer className="w-4 h-4" />
                    <span>Hourly Meter Active (JCB / Equipment Work)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-300 pt-1">
                    {selectedEnquiry.hourlyRate && (
                      <div>
                        <span className="text-slate-400 block text-[10px]">Hourly Rate:</span>
                        <span className="font-bold text-white">₹{selectedEnquiry.hourlyRate} / Hr</span>
                      </div>
                    )}
                    {selectedEnquiry.workDurationMinutes && (
                      <div>
                        <span className="text-slate-400 block text-[10px]">Logged Duration:</span>
                        <span className="font-bold text-white">
                          {Math.floor(selectedEnquiry.workDurationMinutes / 60)}h {selectedEnquiry.workDurationMinutes % 60}m
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Message */}
              <div className="p-3.5 rounded-2xl bg-[#121f18] border border-white/5">
                <span className="text-slate-400 block mb-0.5 text-[10px] font-bold uppercase">Customer Requirements</span>
                <p className="text-slate-200 italic">&ldquo;{selectedEnquiry.message}&rdquo;</p>
              </div>

              {/* Assigned Worker */}
              {selectedEnquiry.worker && (
                <div className="p-3.5 rounded-2xl bg-[#121f18] border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block mb-0.5 text-[10px] font-bold uppercase">Assigned Field Operative</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      {selectedEnquiry.worker.name || selectedEnquiry.worker.username}
                    </span>
                    {selectedEnquiry.workerAcceptance && (
                      <span className="block text-[10px] text-slate-300 mt-0.5">
                        Acceptance: {selectedEnquiry.workerAcceptance}
                      </span>
                    )}
                  </div>
                  <a
                    href={`tel:${selectedEnquiry.worker.phone}`}
                    className="text-xs font-bold text-slate-300 hover:text-white"
                  >
                    {selectedEnquiry.worker.phone || 'No phone'}
                  </a>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold cursor-pointer"
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
                  className="px-5 py-2 rounded-xl bg-[#2A835F] hover:bg-[#236D4F] text-white font-bold cursor-pointer"
                >
                  Dispatch to Worker
                </button>
              )}
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
    </div>
  );
}
