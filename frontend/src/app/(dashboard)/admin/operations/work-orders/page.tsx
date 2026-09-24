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
} from 'lucide-react';
import { EnquiryService, ServiceEnquiry, WorkerWithAvailability } from '@/services';
import { CreateWorkModal } from '@/components/OfficeStaff/CreateWorkModal';
import { AssignWorkerModal } from '@/components/OfficeStaff/AssignWorkerModal';

export default function AdminWorkOrdersPage() {
  const { token, user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [workOrders, setWorkOrders] = useState<ServiceEnquiry[]>([]);
  const [workers, setWorkers] = useState<WorkerWithAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ServiceEnquiry | null>(null);

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

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10 text-gray-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
            <div className="p-2 bg-[#1A1C23] border border-gray-800 rounded-xl">
              <Briefcase className="w-6 h-6 text-[#7B4DFF]" />
            </div>
            Work Orders
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Track operational job execution, schedules, and squad deployments
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
            <span>New Work Order</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#14151A] border border-gray-800">
          <span className="text-xs text-gray-500 font-medium">All Work Orders</span>
          <div className="text-2xl font-bold text-gray-100 mt-1">{metrics.total}</div>
          <span className="text-xs text-gray-500 mt-1 block">Full operations registry</span>
        </div>

        <div className="p-4 rounded-xl bg-[#14151A] border border-gray-800">
          <span className="text-xs text-gray-500 font-medium">Assigned Jobs</span>
          <div className="text-2xl font-bold text-purple-400 mt-1">{metrics.assigned}</div>
          <span className="text-xs text-purple-400/80 mt-1 block">Squad assigned</span>
        </div>

        <div className="p-4 rounded-xl bg-[#14151A] border border-gray-800">
          <span className="text-xs text-gray-500 font-medium">In Execution</span>
          <div className="text-2xl font-bold text-blue-400 mt-1">{metrics.inProgress}</div>
          <span className="text-xs text-blue-400/80 mt-1 block">On-field active progress</span>
        </div>

        <div className="p-4 rounded-xl bg-[#14151A] border border-gray-800">
          <span className="text-xs text-gray-500 font-medium">Completed Works</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{metrics.completed}</div>
          <span className="text-xs text-emerald-400/80 mt-1 block">Closed &amp; fulfilled</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-[#14151A] border border-gray-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by code, customer, service..."
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
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#7B4DFF]" />
                    <span>Loading work orders...</span>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No work orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#1A1C23]/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-gray-200">
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
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                          order.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : order.status === 'IN_PROGRESS'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : order.status === 'ASSIGNED'
                            ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
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
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
                        >
                          Assign
                        </button>
                      ) : (
                        <span className="text-xs text-gray-500">Dispatched</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Modal */}
      {isAssignModalOpen && selectedOrder && (
        <AssignWorkerModal
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setSelectedOrder(null);
          }}
          onAssignedSuccess={() => {
            loadData();
          }}
          enquiry={selectedOrder}
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
