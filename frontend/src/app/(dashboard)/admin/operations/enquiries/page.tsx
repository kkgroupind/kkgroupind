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
        item.customerPhone.includes(searchTerm);

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
    return { total, pending, inProgress, completed };
  }, [enquiries]);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10 text-gray-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
            <div className="p-2 bg-[#1A1C23] border border-gray-800 rounded-xl">
              <Inbox className="w-6 h-6 text-[#7B4DFF]" />
            </div>
            Customer Enquiries
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Review customer service requests and dispatch them to active field teams
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-2 bg-[#14151A] hover:bg-[#1A1C23] border border-gray-800 px-3.5 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-all disabled:opacity-50"
            title="Reload data"
          >
            <RefreshCw
              className={`w-4 h-4 text-[#7B4DFF] ${isRefreshing ? 'animate-spin' : ''}`}
            />
            <span>{isRefreshing ? 'Refreshing...' : 'Reload'}</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-[#7B4DFF] hover:bg-[#6A3DEE] px-4 py-2 rounded-xl text-sm font-medium text-white shadow-[0_0_15px_rgba(123,77,255,0.3)] transition-all ml-auto sm:ml-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Enquiry</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#14151A] border border-gray-800">
          <span className="text-xs text-gray-500 font-medium">Total Inquiries</span>
          <div className="text-2xl font-bold text-gray-100 mt-1">{metrics.total}</div>
          <span className="text-xs text-gray-500 mt-1 block">Registered in system</span>
        </div>

        <div className="p-4 rounded-xl bg-[#14151A] border border-gray-800">
          <span className="text-xs text-gray-500 font-medium">Pending Review</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">{metrics.pending}</div>
          <span className="text-xs text-amber-500/80 mt-1 block">Awaiting assignment</span>
        </div>

        <div className="p-4 rounded-xl bg-[#14151A] border border-gray-800">
          <span className="text-xs text-gray-500 font-medium">Active &amp; In Progress</span>
          <div className="text-2xl font-bold text-blue-400 mt-1">{metrics.inProgress}</div>
          <span className="text-xs text-blue-400/80 mt-1 block">Field team dispatched</span>
        </div>

        <div className="p-4 rounded-xl bg-[#14151A] border border-gray-800">
          <span className="text-xs text-gray-500 font-medium">Completed</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{metrics.completed}</div>
          <span className="text-xs text-emerald-400/80 mt-1 block">Successfully resolved</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-[#14151A] border border-gray-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by code, customer, service, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0D0E12] border border-gray-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-gray-700"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-[#1A1C23] text-white border border-gray-700'
                  : 'bg-[#0D0E12] text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#14151A] rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#0D0E12] text-gray-400 font-medium border-b border-gray-800">
              <tr>
                <th className="py-3 px-4">Tracking Code</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned Worker</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#7B4DFF]" />
                    <span>Loading customer enquiries...</span>
                  </td>
                </tr>
              ) : filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No enquiries found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map((enquiry) => (
                  <tr key={enquiry.id} className="hover:bg-[#1A1C23]/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-emerald-400">
                      {enquiry.trackingNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-100">{enquiry.customerName}</div>
                      <div className="text-[11px] text-gray-500">{enquiry.customerPhone}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-200">{enquiry.serviceName}</td>
                    <td className="py-3 px-4 text-gray-400 max-w-[180px] truncate">
                      {enquiry.location || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                          enquiry.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : enquiry.status === 'IN_PROGRESS'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : enquiry.status === 'ASSIGNED'
                            ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {enquiry.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {enquiry.worker ? (
                        <span className="font-medium text-gray-200">
                          {enquiry.worker.name || enquiry.worker.username}
                        </span>
                      ) : (
                        <span className="text-amber-400 font-medium text-[11px]">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEnquiry(enquiry);
                            setIsDetailsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-[#0D0E12] hover:bg-gray-800 text-gray-400 hover:text-white transition-colors border border-gray-800"
                          title="View Details"
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
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#14161D] rounded-2xl border border-gray-800 p-6 space-y-4 text-xs text-gray-300 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-200">
                  <Inbox className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-100">Enquiry Details</h3>
                  <span className="font-mono text-emerald-400 text-xs">
                    {selectedEnquiry.trackingNumber}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#0D0E12] border border-gray-800">
                <div>
                  <span className="text-gray-500 block mb-0.5">Service</span>
                  <span className="font-semibold text-gray-100">{selectedEnquiry.serviceName}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-0.5">Status</span>
                  <span className="font-semibold text-gray-200">{selectedEnquiry.status}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-0.5">Customer Name</span>
                  <span className="text-gray-200">{selectedEnquiry.customerName}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-0.5">Phone</span>
                  <span className="text-gray-200">{selectedEnquiry.customerPhone}</span>
                </div>
              </div>

              {selectedEnquiry.location && (
                <div className="p-3 rounded-xl bg-[#0D0E12] border border-gray-800">
                  <span className="text-gray-500 block mb-0.5">Site Location</span>
                  <span className="text-gray-200">{selectedEnquiry.location}</span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-[#0D0E12] border border-gray-800">
                <span className="text-gray-500 block mb-0.5">Requirements / Message</span>
                <p className="text-gray-300 italic">&ldquo;{selectedEnquiry.message}&rdquo;</p>
              </div>

              {selectedEnquiry.worker && (
                <div className="p-3 rounded-xl bg-[#0D0E12] border border-gray-800 flex items-center justify-between">
                  <div>
                    <span className="text-gray-500 block mb-0.5">Assigned Operative</span>
                    <span className="font-medium text-emerald-400">
                      {selectedEnquiry.worker.name || selectedEnquiry.worker.username}
                    </span>
                  </div>
                  <span className="text-gray-400">{selectedEnquiry.worker.phone || 'No phone'}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium"
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
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                >
                  Assign Worker
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
