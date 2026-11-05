'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { useAdminTheme } from '@/context/admin-theme-context';
import { useRouter } from 'next/navigation';
import {
  Layers,
  Search,
  Plus,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FolderSync,
  Tag,
  Hash,
} from 'lucide-react';
import { adminServicesService, ServiceItem } from '@/services/Admin/services';
import { ServiceCard } from '@/components/Admin/services/ServiceCard';
import { CreateServiceModal } from '@/components/Admin/services/CreateServiceModal';
import { EditServiceModal } from '@/components/Admin/services/EditServiceModal';
import { AdminDropdown, AdminDropdownOption } from '@/components/Admin/admin-dropdown';

export default function AdminServicesPage() {
  const { token, user, isLoading: authLoading } = useAuth();
  const { isDark } = useAdminTheme();
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
      label: 'Active',
      badge: 'Active',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    },
    {
      value: 'INACTIVE',
      label: 'Inactive',
      badge: 'Off',
      badgeColor: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    },
  ], []);

  const activeCount = useMemo(() => services.filter((s) => s.isActive).length, [services]);
  const inactiveCount = services.length - activeCount;

  return (
    <div className={`space-y-6 max-w-[1500px] mx-auto pb-14 ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
      {/* Feedback Toast */}
      {feedbackMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full border shadow-2xl text-xs font-semibold animate-in slide-in-from-bottom duration-300 ${
            feedbackMsg.type === 'success'
              ? isDark ? 'bg-[#181A20] border-emerald-500/30 text-emerald-400' : 'bg-white border-emerald-300 text-emerald-700 shadow-lg'
              : isDark ? 'bg-[#181A20] border-rose-500/30 text-rose-400' : 'bg-white border-rose-300 text-rose-700 shadow-lg'
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
          <h1 className={`text-2xl font-bold flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <div
              className={`p-2.5 rounded-[24px] border flex items-center justify-center ${
                isDark ? 'bg-[#12141A] border-white/[0.08] text-[#6366F1]' : 'bg-white border-slate-200 text-[#6366F1] shadow-xs'
              }`}
            >
              <Layers className="w-5 h-5" />
            </div>
            Services &amp; Pricing
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Manage all services you offer, set customer rates, and configure worker wages
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleSeedCatalog}
            disabled={isRefreshing}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border transition-all disabled:opacity-50 cursor-pointer ${
              isDark
                ? 'bg-[#12141A] hover:bg-[#161922] border-white/[0.08] text-zinc-300 hover:text-white'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-xs'
            }`}
            title="Populate standard KK Group services if empty"
          >
            <FolderSync className={`w-3.5 h-3.5 text-[#6366F1] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync Standard Services</span>
          </button>

          <button
            onClick={() => loadServices(true)}
            disabled={isRefreshing}
            className={`p-2.5 rounded-full border transition-all disabled:opacity-50 cursor-pointer ${
              isDark
                ? 'bg-[#12141A] hover:bg-[#161922] border-white/[0.08] text-zinc-400 hover:text-white'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 shadow-xs'
            }`}
            title="Refresh Services"
          >
            <RefreshCw className={`w-4 h-4 text-[#6366F1] ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#5254E0] text-white px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold shadow-md shadow-[#6366F1]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service</span>
          </button>
        </div>
      </div>

      {/* KPI Bento Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Registered */}
        <div
          className={`p-4 sm:p-5 rounded-3xl border transition-all flex flex-col justify-between ${
            isDark ? 'bg-[#181A20] border-white/[0.06]' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Total Registered
            </span>
            <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${isDark ? 'bg-[#121318] border-white/[0.06] text-[#FF5C38]' : 'bg-slate-50 border-slate-200 text-[#FF5C38]'}`}>
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {services.length}
          </div>
          <div className={`text-[11px] mt-1.5 flex items-center gap-1 ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
            <Hash className="w-3 h-3 text-[#FF5C38] shrink-0" />
            <span>Sequential Catalog Ledger</span>
          </div>
        </div>

        {/* Active Deployable */}
        <div
          className={`p-4 sm:p-5 rounded-3xl border transition-all flex flex-col justify-between ${
            isDark ? 'bg-[#181A20] border-white/[0.06]' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Active Deployable
            </span>
            <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold mt-2 text-emerald-400">
            {activeCount}
          </div>
          <div className={`text-[11px] mt-1.5 flex items-center gap-1.5 ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span>Available for booking</span>
          </div>
        </div>

        {/* Inactive / Draft */}
        <div
          className={`p-4 sm:p-5 rounded-3xl border transition-all flex flex-col justify-between ${
            isDark ? 'bg-[#181A20] border-white/[0.06]' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Inactive / Draft
            </span>
            <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${isDark ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-600'}`}>
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold mt-2 text-rose-400">
            {inactiveCount}
          </div>
          <div className={`text-[11px] mt-1.5 ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
            Hidden from customer portal
          </div>
        </div>

        {/* Operational Categories */}
        <div
          className={`p-4 sm:p-5 rounded-3xl border transition-all flex flex-col justify-between ${
            isDark ? 'bg-[#181A20] border-white/[0.06]' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Categories
            </span>
            <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${isDark ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-indigo-50 border-indigo-200 text-indigo-600'}`}>
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-bold mt-2 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
            {categories.length || '—'}
          </div>
          <div className={`text-[11px] mt-1.5 flex items-center gap-1 ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
            <span>Sector classifications</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Ribbon */}
      <div
        className={`p-4 rounded-3xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 ${
          isDark ? 'bg-[#181A20] border-white/[0.06]' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="relative flex-1 max-w-md">
          <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, ID (e.g. KKS-001), or description..."
            className={`w-full pl-10 pr-4 py-2.5 rounded-full text-xs sm:text-sm border transition-colors outline-none ${
              isDark
                ? 'bg-[#121318] border-white/[0.06] text-white placeholder-zinc-500 focus:border-[#FF5C38]/50'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#FF5C38]/50'
            }`}
          />
        </div>

        {/* Category & Status Filters using AdminDropdown */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="w-52">
            <AdminDropdown
              options={categoryOptions}
              value={selectedCategory}
              onChange={(val) => setSelectedCategory(val)}
              variant="coral"
              size="md"
              searchable={categories.length > 5}
            />
          </div>

          <div className="w-48">
            <AdminDropdown
              options={statusOptions}
              value={statusFilter}
              onChange={(val) => setStatusFilter(val as any)}
              variant="coral"
              size="md"
            />
          </div>
        </div>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#FF5C38] animate-spin" />
          <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Loading services catalog...</p>
        </div>
      ) : services.length === 0 ? (
        <div
          className={`p-12 rounded-3xl border text-center flex flex-col items-center justify-center space-y-4 ${
            isDark ? 'bg-[#181A20] border-white/[0.06]' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className={`w-14 h-14 rounded-full border flex items-center justify-center ${isDark ? 'bg-[#121318] border-white/[0.06] text-zinc-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <h3 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              No services match your criteria
            </h3>
            <p className={`text-xs max-w-sm mt-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              You can feed the standard KK Group services with one click or register a new custom service.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSeedCatalog}
              className={`px-4 py-2 rounded-full border text-xs font-semibold transition-all inline-flex items-center gap-2 cursor-pointer ${
                isDark ? 'bg-[#121318] hover:bg-[#1E2028] border-white/[0.08] text-white' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <FolderSync className="w-3.5 h-3.5 text-[#FF5C38]" />
              <span>Feed Standard Catalog</span>
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-2.5 rounded-full bg-[#FF5C38] hover:bg-[#FF6B4A] text-white text-xs font-semibold transition-all inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-[#FF5C38]/20"
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
    </div>
  );
}
