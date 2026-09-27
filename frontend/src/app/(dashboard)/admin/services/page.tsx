'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import {
  Layers,
  Search,
  Plus,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Filter,
  SlidersHorizontal,
  FolderSync,
  Tag,
  Hash,
} from 'lucide-react';
import { adminServicesService, ServiceItem } from '@/services/Admin/services';
import { ServiceCard } from '@/components/Admin/services/ServiceCard';
import { CreateServiceModal } from '@/components/Admin/services/CreateServiceModal';
import { EditServiceModal } from '@/components/Admin/services/EditServiceModal';
import { ConfirmationModal } from '@/components/Admin/confirmation-modal';
import { AdminDropdown, AdminDropdownOption } from '@/components/Admin/admin-dropdown';

export default function AdminServicesPage() {
  const { token, user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Status Banner / Feedback
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const loadServices = useCallback(
    async (showRefreshIndicator = false) => {
      if (!token) return;
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const res = await adminServicesService.listServices(token, {
          search: searchTerm.trim() || undefined,
          category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
          isActive:
            statusFilter === 'ACTIVE' ? true : statusFilter === 'INACTIVE' ? false : undefined,
          limit: 100,
        });
        setServices(res.data || []);
      } catch (err) {
        console.error('Failed to load services', err);
        showFeedback('error', 'Failed to retrieve services catalog.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [token, searchTerm, selectedCategory, statusFilter],
  );

  useEffect(() => {
    if (!authLoading) {
      if (!token || user?.role !== 'SUPER_ADMIN') {
        router.push('/admin/login');
      } else {
        loadServices();
      }
    }
  }, [authLoading, token, user, router, loadServices]);

  const handleSeedCatalog = async () => {
    if (!token) return;
    setIsRefreshing(true);
    try {
      const res = await adminServicesService.seedServices(token);
      showFeedback(
        'success',
        res.count > 0
          ? `Successfully synchronized ${res.count} standard KK Group services!`
          : 'Standard catalog is already synchronized and up to date.',
      );
      loadServices();
    } catch (err: any) {
      console.error('Failed to seed services', err);
      showFeedback('error', err?.message || 'Failed to synchronize services catalog.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    if (!token) return;
    setTogglingId(id);
    try {
      const res = await adminServicesService.toggleServiceStatus(id, token);
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isActive: res.service.isActive } : s)),
      );
      showFeedback(
        'success',
        `Service status updated to ${res.service.isActive ? 'Active' : 'Inactive'}.`,
      );
    } catch (err: any) {
      console.error('Toggle status error', err);
      showFeedback('error', 'Failed to update service status.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteService = (id: string, name: string) => {
    setDeleteTarget({ id, name });
  };

  const handleConfirmDeleteService = async () => {
    if (!token || !deleteTarget) return;

    setIsDeleting(true);
    try {
      await adminServicesService.deleteService(deleteTarget.id, token);
      setServices((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      showFeedback('success', `Service "${deleteTarget.name}" was successfully removed.`);
      setDeleteTarget(null);
    } catch (err: any) {
      console.error('Delete service error', err);
      showFeedback('error', err?.message || 'Failed to delete service.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Derive available categories for filter
  const categories = useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return Array.from(set);
  }, [services]);

  const categoryOptions: AdminDropdownOption[] = useMemo(() => [
    { value: 'ALL', label: 'All Categories' },
    ...categories.map((cat) => ({ value: cat, label: cat })),
  ], [categories]);

  const statusOptions: AdminDropdownOption[] = useMemo(() => [
    { value: 'ALL', label: 'All Statuses' },
    {
      value: 'ACTIVE',
      label: 'Active Deployable',
      badge: 'Active',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    },
    {
      value: 'INACTIVE',
      label: 'Inactive / Draft',
      badge: 'Draft',
      badgeColor: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    },
  ], []);

  const activeCount = useMemo(() => services.filter((s) => s.isActive).length, [services]);
  const inactiveCount = services.length - activeCount;

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto pb-14 text-gray-200">
      {/* Feedback Toast */}
      {feedbackMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl border shadow-2xl text-xs animate-in slide-in-from-bottom duration-300 ${
            feedbackMsg.type === 'success'
              ? 'bg-[#14151A] border-emerald-500/30 text-emerald-400'
              : 'bg-[#14151A] border-rose-500/30 text-rose-400'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
            <div className="p-2.5 bg-[#14151A] border border-gray-800 rounded-2xl text-emerald-400 shadow-sm">
              <Layers className="w-6 h-6" />
            </div>
            Services Management
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Maintain the KK Group service catalog with sequential unique identifiers, feature capabilities, and operational parameters
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleSeedCatalog}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#14151A] hover:bg-[#1A1C23] border border-gray-800 text-gray-300 hover:text-white rounded-xl text-xs font-medium transition-all disabled:opacity-50"
            title="Populate standard KK Group services if empty"
          >
            <FolderSync className={`w-3.5 h-3.5 text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Feed / Sync Catalog</span>
          </button>

          <button
            onClick={() => loadServices(true)}
            disabled={isRefreshing}
            className="p-2 bg-[#14151A] hover:bg-[#1A1C23] border border-gray-800 text-gray-400 hover:text-white rounded-xl transition-all disabled:opacity-50"
            title="Refresh Services"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#7B4DFF] hover:bg-[#6A3CEB] text-white rounded-xl text-xs font-semibold shadow-[0_0_20px_rgba(123,77,255,0.4)] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Service</span>
          </button>
        </div>
      </div>

      {/* KPI Bento Cards with People styling */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Services */}
        <div className="p-5 rounded-2xl bg-[#14151A] border border-gray-800/80 shadow-md relative overflow-hidden group hover:border-gray-700/80 transition-all">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gray-700/40 to-transparent group-hover:via-[#7B4DFF]/60 transition-all duration-300" />
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Total Registered
            </div>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-[#7B4DFF]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white mt-1">
            {services.length}
          </div>
          <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1.5">
            <Hash className="w-3 h-3 text-[#7B4DFF]" />
            <span>Alphanumeric Sequential Ledger</span>
          </div>
        </div>

        {/* Active Deployments */}
        <div className="p-5 rounded-2xl bg-[#14151A] border border-gray-800/80 shadow-md relative overflow-hidden group hover:border-gray-700/80 transition-all">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gray-700/40 to-transparent group-hover:via-emerald-500/60 transition-all duration-300" />
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Active Deployable
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">
            {activeCount}
          </div>
          <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Available for live client enquiries</span>
          </div>
        </div>

        {/* Inactive / Archived */}
        <div className="p-5 rounded-2xl bg-[#14151A] border border-gray-800/80 shadow-md relative overflow-hidden group hover:border-gray-700/80 transition-all">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gray-700/40 to-transparent group-hover:via-rose-500/60 transition-all duration-300" />
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Inactive / Draft
            </div>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-400 mt-1">
            {inactiveCount}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            Hidden from customer dispatch booking
          </div>
        </div>

        {/* Operational Categories */}
        <div className="p-5 rounded-2xl bg-[#14151A] border border-gray-800/80 shadow-md relative overflow-hidden group hover:border-gray-700/80 transition-all">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gray-700/40 to-transparent group-hover:via-indigo-500/60 transition-all duration-300" />
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Categories
            </div>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-indigo-400 mt-1">
            {categories.length || '—'}
          </div>
          <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1.5">
            <Tag className="w-3 h-3 text-indigo-400" />
            <span>Sector classifications</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Ribbon */}
      <div className="p-4 bg-[#14151A] border border-gray-800 rounded-2xl shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, ID (e.g. KKS-001), or description..."
            className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#7B4DFF] transition-all"
          />
        </div>

        {/* Category & Status Filters using AdminDropdown */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Filter using AdminDropdown */}
          <div className="w-52">
            <AdminDropdown
              options={categoryOptions}
              value={selectedCategory}
              onChange={(val) => setSelectedCategory(val)}
              variant="purple"
              size="md"
              searchable={categories.length > 5}
            />
          </div>

          {/* Status Filter using AdminDropdown */}
          <div className="w-48">
            <AdminDropdown
              options={statusOptions}
              value={statusFilter}
              onChange={(val) => setStatusFilter(val as any)}
              variant="purple"
              size="md"
            />
          </div>
        </div>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#2A835F] animate-spin" />
          <p className="text-xs text-gray-500">Loading services catalog...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#14151A] border border-gray-800 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-gray-800/60 border border-gray-700/60 flex items-center justify-center text-gray-400">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-200">
              No services match your criteria
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mt-1">
              You can feed the standard KK Group services with one click or register a new service.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSeedCatalog}
              className="px-4 py-2 rounded-xl bg-[#1A1C23] hover:bg-gray-800 text-emerald-400 border border-gray-700 text-xs font-medium transition-colors inline-flex items-center gap-2"
            >
              <FolderSync className="w-3.5 h-3.5" />
              <span>Feed Standard Catalog</span>
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#2A835F] hover:bg-emerald-600 text-white text-xs font-medium transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Service</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onEdit={(srv) => setEditingService(srv)}
              onDelete={handleDeleteService}
              onToggleStatus={handleToggleStatus}
              isToggling={togglingId === service.id}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateServiceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        token={token || ''}
        onSuccess={(newSrv) => {
          setServices((prev) => [newSrv, ...prev]);
          showFeedback('success', `Service "${newSrv.name}" registered successfully with ID ${newSrv.serviceId}!`);
        }}
      />

      <EditServiceModal
        isOpen={!!editingService}
        onClose={() => setEditingService(null)}
        service={editingService}
        token={token || ''}
        onSuccess={(updatedSrv) => {
          setServices((prev) => prev.map((s) => (s.id === updatedSrv.id ? updatedSrv : s)));
          showFeedback('success', `Service "${updatedSrv.name}" updated successfully!`);
        }}
      />

      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDeleteService}
        title="Delete Service Offering"
        message={`Are you sure you want to permanently remove "${deleteTarget?.name || 'this service'}" from the catalog? Customers will no longer be able to select or request this service.`}
        confirmText="Delete Service"
        variant="danger"
        isLoading={isDeleting}
        itemDetails={
          deleteTarget
            ? [
                { label: 'Service Name', value: deleteTarget.name },
                { label: 'Service ID', value: deleteTarget.id },
              ]
            : undefined
        }
      />
    </div>
  );
}
