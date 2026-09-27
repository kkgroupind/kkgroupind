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
  Briefcase,
  User,
  LayoutGrid,
  List,
} from 'lucide-react';
import { EnquiryService, ServiceEnquiry, WorkerWithAvailability } from '@/services';
import { AssignWorkerModal } from '@/components/OfficeStaff/AssignWorkerModal';
import { AdminDropdown, AdminDropdownOption } from '@/components/Admin/admin-dropdown';

export default function AdminAssignmentsPage() {
  const { token, user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [enquiries, setEnquiries] = useState<ServiceEnquiry[]>([]);
  const [workers, setWorkers] = useState<WorkerWithAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeLedgerView, setActiveLedgerView] = useState<'grid' | 'table'>('grid');

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
            <div className="p-2.5 bg-[#14151A] border border-gray-800 rounded-2xl shadow-sm">
              <ClipboardCheck className="w-6 h-6 text-[#7B4DFF]" />
            </div>
            Workforce Assignments &amp; Dispatch
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Dispatch open work orders to available field technicians and monitor assignment loads
          </p>
        </div>

        <button
          onClick={() => loadData(true)}
          disabled={isRefreshing || isLoading}
          className="flex items-center gap-2 bg-[#14151A] hover:bg-[#1A1C23] border border-gray-800 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-gray-300 hover:text-white transition-all disabled:opacity-50 cursor-pointer shadow-sm"
        >
          <RefreshCw
            className={`w-4 h-4 text-[#7B4DFF] ${isRefreshing ? 'animate-spin' : ''}`}
          />
          <span>{isRefreshing ? 'Refreshing...' : 'Reload Dispatch Board'}</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="group p-5 rounded-2xl bg-[#14151A] border border-gray-800/80 hover:border-gray-700/80 transition-all duration-300 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent group-hover:via-amber-500/70 transition-all duration-300" />
          <span className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider">
            Pending Jobs in Queue
          </span>
          <div className="text-2xl font-bold text-amber-400 mt-1">{pendingEnquiries.length}</div>
          <span className="text-[11px] text-amber-400/70 mt-1 block">Requires operative dispatch</span>
        </div>

        <div className="group p-5 rounded-2xl bg-[#14151A] border border-gray-800/80 hover:border-gray-700/80 transition-all duration-300 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent group-hover:via-emerald-500/70 transition-all duration-300" />
          <span className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider">
            Available Technicians
          </span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{availableWorkers.length}</div>
          <span className="text-[11px] text-emerald-400/70 mt-1 block">Ready for job dispatch</span>
        </div>

        <div className="group p-5 rounded-2xl bg-[#14151A] border border-gray-800/80 hover:border-gray-700/80 transition-all duration-300 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent group-hover:via-purple-500/70 transition-all duration-300" />
          <span className="text-[11px] text-purple-400 font-semibold uppercase tracking-wider">
            Active Dispatches
          </span>
          <div className="text-2xl font-bold text-purple-400 mt-1">{assignedEnquiries.length}</div>
          <span className="text-[11px] text-purple-400/70 mt-1 block">Currently on-field</span>
        </div>
      </div>

      {/* Two Column Dispatch Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Unassigned Jobs Queue Cards */}
        <div className="bg-[#14151A] rounded-2xl border border-gray-800/80 p-5 space-y-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <h3 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-amber-400" />
              <span>Jobs Awaiting Assignment</span>
            </h3>
            <span className="text-xs text-amber-400 font-semibold px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              {pendingEnquiries.length} pending
            </span>
          </div>

          <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1 custom-scrollbar">
            {pendingEnquiries.length === 0 ? (
              <div className="p-12 text-center text-gray-500 text-xs italic">
                All jobs have been dispatched. No pending work orders.
              </div>
            ) : (
              pendingEnquiries.map((enq) => (
                <div
                  key={enq.id}
                  className="group p-4 rounded-xl bg-[#1A1C23] border border-gray-800/80 hover:border-gray-700 transition-all space-y-2.5 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent group-hover:via-amber-500/60 transition-all" />

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-semibold text-amber-400">
                        {enq.trackingNumber}
                      </span>
                      <h4 className="text-sm font-semibold text-gray-100 mt-0.5">
                        {enq.serviceName}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEnquiry(enq);
                        setIsAssignModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#7B4DFF] hover:bg-[#6839EF] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(123,77,255,0.25)] cursor-pointer shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch</span>
                    </button>
                  </div>

                  {/* Wage Model & Rate */}
                  {enq.wageType && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold bg-[#14151A] text-gray-300 px-2 py-0.5 rounded border border-gray-800">
                        {enq.wageType === 'PER_TREE'
                          ? '🌴 Tree Count'
                          : enq.wageType === 'HOURLY'
                          ? '⏱️ Hourly Meter'
                          : `${enq.unitLabel || 'Unit'} Basis`}
                      </span>
                      {enq.unitRate && (
                        <span className="text-[10px] font-mono text-gray-400">
                          ₹{enq.unitRate} / {enq.unitLabel || 'Unit'}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="text-xs text-gray-400 flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    <span className="text-gray-200 font-medium">{enq.customerName}</span>
                    <span className="font-mono text-gray-500 text-[11px]">({enq.customerPhone})</span>
                  </div>

                  {enq.location && (
                    <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#7B4DFF] shrink-0" />
                      <span>{enq.location}</span>
                    </div>
                  )}

                  {enq.message && (
                    <p className="text-[11px] text-gray-300 italic bg-[#14151A] p-2.5 rounded-lg border border-gray-800/80">
                      &ldquo;{enq.message}&rdquo;
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Available Field Operatives Cards */}
        <div className="bg-[#14151A] rounded-2xl border border-gray-800/80 p-5 space-y-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <h3 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
              <HardHat className="w-4 h-4 text-emerald-400" />
              <span>Available Squad Members</span>
            </h3>
            <span className="text-xs text-emerald-400 font-semibold px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              {availableWorkers.length} ready
            </span>
          </div>

          <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1 custom-scrollbar">
            {availableWorkers.length === 0 ? (
              <div className="p-12 text-center text-gray-500 text-xs italic">
                No workers currently marked as available.
              </div>
            ) : (
              availableWorkers.map((worker) => (
                <div
                  key={worker.id}
                  className="group p-4 rounded-xl bg-[#1A1C23] border border-gray-800/80 hover:border-gray-700 transition-all flex items-center justify-between relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent group-hover:via-emerald-500/60 transition-all" />

                  <div className="flex items-center gap-3.5">
                    {/* Deterministic Gradient Ring Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-[2px] shadow-sm">
                        <div className="w-full h-full bg-[#14151A] rounded-[14px] flex items-center justify-center font-bold text-xs text-gray-100 overflow-hidden">
                          {worker.avatar ? (
                            <img
                              src={worker.avatar}
                              alt={worker.name || worker.username || 'Worker avatar'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <span>{worker.name ? worker.name.charAt(0).toUpperCase() : 'W'}</span>
                          )}
                        </div>
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#1A1C23] bg-emerald-500" />
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-gray-100">
                        {worker.name || worker.username}
                      </h4>
                      <div className="text-[11px] text-gray-400 flex items-center gap-2 mt-0.5">
                        <Phone className="w-3 h-3 text-gray-500" />
                        <span className="font-mono">{worker.phone || 'No phone'}</span>
                      </div>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Available
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Active Assignments Records (Default Bento Cards) */}
      <div className="bg-[#14151A] rounded-2xl border border-gray-800/80 p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div>
            <h3 className="text-base font-semibold text-gray-100">
              Active Assignment Records ({assignedEnquiries.length})
            </h3>
            <p className="text-xs text-gray-400">
              Current on-field dispatches and worker task fulfillment
            </p>
          </div>

          <div className="flex items-center bg-[#1A1C23] border border-gray-800 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setActiveLedgerView('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                activeLedgerView === 'grid'
                  ? 'bg-[#7B4DFF] text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setActiveLedgerView('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                activeLedgerView === 'table'
                  ? 'bg-[#7B4DFF] text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {assignedEnquiries.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-xs italic">
            No active workforce dispatches recorded yet.
          </div>
        ) : activeLedgerView === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedEnquiries.map((item) => (
              <div
                key={item.id}
                className="group bg-[#1A1C23] rounded-2xl border border-gray-800/80 hover:border-gray-700/80 p-4 transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
              >
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#7B4DFF]/40 to-transparent group-hover:via-[#7B4DFF]/80 transition-all" />

                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="font-mono text-xs font-semibold text-[#7B4DFF]">
                        {item.trackingNumber}
                      </span>
                      <h4 className="text-sm font-semibold text-gray-100 mt-0.5">
                        {item.serviceName}
                      </h4>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${
                        item.status === 'COMPLETED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : item.status === 'IN_PROGRESS'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                      }`}
                    >
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-2 py-2.5 border-y border-gray-800/60 my-2.5 text-xs">
                    <div className="flex items-center justify-between text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-gray-500" />
                        <span>Client</span>
                      </span>
                      <span className="text-gray-200 font-medium truncate max-w-[150px]">
                        {item.customerName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <HardHat className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Operative</span>
                      </span>
                      <span className="text-emerald-400 font-medium truncate max-w-[150px]">
                        {item.worker?.name || item.worker?.username || 'Assigned'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                        <span>Dispatched</span>
                      </span>
                      <span className="text-gray-300">
                        {item.assignedAt ? new Date(item.assignedAt).toLocaleDateString() : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEnquiry(item);
                      setIsAssignModalOpen(true);
                    }}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#14151A] hover:bg-[#20232c] text-gray-300 hover:text-white border border-gray-800 transition-all cursor-pointer"
                  >
                    <span>Reassign Squad</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#0D0E12] text-gray-400 font-semibold border-b border-gray-800">
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
                    <td className="py-3 px-4 font-mono font-semibold text-[#7B4DFF]">
                      {item.trackingNumber}
                    </td>
                    <td className="py-3 px-4 text-gray-200">{item.serviceName}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-100">{item.customerName}</div>
                      <div className="text-[11px] text-gray-500 font-mono">{item.customerPhone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                        <HardHat className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{item.worker?.name || item.worker?.username || 'Worker'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${
                          item.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : item.status === 'IN_PROGRESS'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
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
        )}
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
