'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import {
  ClipboardCheck,
  Search,
  RefreshCw,
  HardHat,
  FolderKanban,
  MapPin,
  Calendar,
  Send,
  Phone,
  UserCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { EnquiryService, ServiceEnquiry, WorkerWithAvailability } from '@/services';
import { AssignWorkerModal } from '@/components/OfficeStaff/AssignWorkerModal';

export default function AdminAssignmentsPage() {
  const { token, user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [enquiries, setEnquiries] = useState<ServiceEnquiry[]>([]);
  const [workers, setWorkers] = useState<WorkerWithAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals
  const [selectedEnquiry, setSelectedEnquiry] = useState<ServiceEnquiry | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

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
        console.error('Failed to load assignments data', err);
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

  const pendingEnquiries = useMemo(
    () => enquiries.filter((e) => e.status === 'PENDING'),
    [enquiries],
  );

  const assignedEnquiries = useMemo(
    () => enquiries.filter((e) => e.workerId !== null),
    [enquiries],
  );

  const availableWorkers = useMemo(
    () => workers.filter((w) => w.workerStatus === 'AVAILABLE'),
    [workers],
  );

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10 text-gray-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
            <div className="p-2 bg-[#1A1C23] border border-gray-800 rounded-xl">
              <ClipboardCheck className="w-6 h-6 text-[#7B4DFF]" />
            </div>
            Workforce Assignments
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Dispatch open work orders to available field technicians and monitor assignment loads
          </p>
        </div>

        <button
          onClick={() => loadData(true)}
          disabled={isRefreshing || isLoading}
          className="flex items-center gap-2 bg-[#14151A] hover:bg-[#1A1C23] border border-gray-800 px-3.5 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-all disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 text-[#7B4DFF] ${isRefreshing ? 'animate-spin' : ''}`}
          />
          <span>{isRefreshing ? 'Refreshing...' : 'Reload Dispatch Board'}</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#14151A] border border-gray-800">
          <span className="text-xs text-gray-500 font-medium">Pending Jobs in Queue</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">{pendingEnquiries.length}</div>
          <span className="text-xs text-amber-500/80 mt-1 block">Requires operative dispatch</span>
        </div>

        <div className="p-4 rounded-xl bg-[#14151A] border border-gray-800">
          <span className="text-xs text-gray-500 font-medium">Available Technicians</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{availableWorkers.length}</div>
          <span className="text-xs text-emerald-400/80 mt-1 block">Ready for job dispatch</span>
        </div>

        <div className="p-4 rounded-xl bg-[#14151A] border border-gray-800">
          <span className="text-xs text-gray-500 font-medium">Active Dispatches</span>
          <div className="text-2xl font-bold text-purple-400 mt-1">{assignedEnquiries.length}</div>
          <span className="text-xs text-purple-400/80 mt-1 block">Currently assigned</span>
        </div>
      </div>

      {/* Two Column Dispatch Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Unassigned Jobs Queue */}
        <div className="bg-[#14151A] rounded-xl border border-gray-800 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <h3 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-amber-400" />
              <span>Jobs Awaiting Assignment</span>
            </h3>
            <span className="text-xs text-amber-400 font-medium">
              {pendingEnquiries.length} pending
            </span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
            {pendingEnquiries.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-xs italic">
                All jobs have been dispatched. No pending work orders.
              </div>
            ) : (
              pendingEnquiries.map((enq) => (
                <div
                  key={enq.id}
                  className="p-4 rounded-xl bg-[#0D0E12] border border-gray-800 hover:border-gray-700 transition-colors space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-medium text-emerald-400">
                        {enq.trackingNumber}
                      </span>
                      <h4 className="text-sm font-medium text-gray-100 mt-0.5">
                        {enq.serviceName}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEnquiry(enq);
                        setIsAssignModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors flex items-center gap-1.5"
                    >
                      <Send className="w-3 h-3" />
                      <span>Dispatch</span>
                    </button>
                  </div>

                  <div className="text-xs text-gray-300">
                    <span className="text-gray-500">Customer: </span>
                    {enq.customerName} ({enq.customerPhone})
                  </div>

                  {enq.location && (
                    <div className="text-[11px] text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-600" />
                      <span>{enq.location}</span>
                    </div>
                  )}

                  <p className="text-[11px] text-gray-400 italic bg-[#14161D] p-2 rounded-lg border border-gray-800/80">
                    &ldquo;{enq.message}&rdquo;
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Available Field Operatives */}
        <div className="bg-[#14151A] rounded-xl border border-gray-800 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <h3 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
              <HardHat className="w-4 h-4 text-emerald-400" />
              <span>Available Squad Members</span>
            </h3>
            <span className="text-xs text-emerald-400 font-medium">
              {availableWorkers.length} ready
            </span>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
            {availableWorkers.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-xs italic">
                No workers currently marked as available.
              </div>
            ) : (
              availableWorkers.map((worker) => (
                <div
                  key={worker.id}
                  className="p-3.5 rounded-xl bg-[#0D0E12] border border-gray-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-800 text-gray-200 font-medium flex items-center justify-center text-xs overflow-hidden shrink-0 border border-gray-700/60 shadow-sm">
                      {worker.avatar ? (
                        <img
                          src={worker.avatar}
                          alt={worker.name || worker.username || 'Worker avatar'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : null}
                      {!worker.avatar && (
                        <span>
                          {worker.name ? worker.name.charAt(0).toUpperCase() : 'W'}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-gray-100">
                        {worker.name || worker.username}
                      </h4>
                      <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                        <Phone className="w-3 h-3 text-gray-600" />
                        <span>{worker.phone || 'No phone'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Available
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Active Assignments History Ledger */}
      <div className="bg-[#14151A] rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-100">
            Active Assignment Records ({assignedEnquiries.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#0D0E12] text-gray-400 font-medium border-b border-gray-800">
              <tr>
                <th className="py-3 px-4">Tracking Code</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Assigned Worker</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {assignedEnquiries.map((item) => (
                <tr key={item.id} className="hover:bg-[#1A1C23]/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-emerald-400">
                    {item.trackingNumber}
                  </td>
                  <td className="py-3 px-4 text-gray-200">{item.serviceName}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-gray-800 flex items-center justify-center font-bold text-xs text-sky-400 overflow-hidden shrink-0 border border-gray-700/60 shadow-sm">
                        {item.customer?.avatar ? (
                          <img
                            src={item.customer.avatar}
                            alt="Customer"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : null}
                        {!item.customer?.avatar && (
                          <span>{(item.customerName || 'C').charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-100">{item.customerName}</div>
                        <div className="text-[11px] text-gray-500">{item.customerPhone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gray-800 flex items-center justify-center font-bold text-xs text-emerald-400 overflow-hidden shrink-0 border border-emerald-700/40 shadow-sm">
                        {item.worker?.avatar ? (
                          <img
                            src={item.worker.avatar}
                            alt="Worker"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : null}
                        {!item.worker?.avatar && (
                          <span>{((item.worker?.name || item.worker?.username) || 'W').charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <span className="font-medium text-emerald-400">
                        {item.worker?.name || item.worker?.username || 'Worker'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                        item.status === 'COMPLETED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : item.status === 'IN_PROGRESS'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-400">
                    {item.assignedAt ? new Date(item.assignedAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
    </div>
  );
}
