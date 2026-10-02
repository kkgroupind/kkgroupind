'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CalendarClock,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  MessageCircle,
  DollarSign,
  User,
  Shield,
  Trash2,
  Pencil,
  Briefcase,
  ExternalLink,
  ChevronRight,
  Layers,
  Sparkles,
  Calendar,
  Check,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { api, User as UserType } from '@/services';
import {
  getServiceImage,
  getMalayalamLabel,
  formatFrequencyShort,
  ServiceSelectDropdown,
  ServiceSelectOption,
} from './ServiceSelectDropdown';
import { SetupReminderModal } from './SetupReminderModal';
import { ConfirmationModal } from './confirmation-modal';
import { EditPersonModal } from './edit-person-modal';

interface CustomerDetailViewProps {
  username: string;
  backHref?: string;
}

export function CustomerDetailView({
  username,
  backHref = '/admin/people/customers',
}: CustomerDetailViewProps) {
  const { token, user: currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ENQUIRIES' | 'COMPLETED' | 'REMINDERS' | 'INFO'>('ENQUIRIES');

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderServiceName, setReminderServiceName] = useState('');
  const [isRecordServiceModalOpen, setIsRecordServiceModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Record service form state (inside modal)
  const [serviceName, setServiceName] = useState('');
  const [serviceDate, setServiceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [serviceStatus, setServiceStatus] = useState<'COMPLETED' | 'IN_PROGRESS' | 'PENDING'>('COMPLETED');
  const [serviceCost, setServiceCost] = useState<string>('');
  const [serviceNotes, setServiceNotes] = useState('');
  const [assignWorker, setAssignWorker] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [workers, setWorkers] = useState<any[]>([]);
  const [isSubmittingService, setIsSubmittingService] = useState(false);

  // Available services for dropdown
  const [serviceConfigs, setServiceConfigs] = useState<ServiceSelectOption[]>([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadCustomer = useCallback(
    async (showRefreshIndicator = false) => {
      if (!token || !username) return;
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setErrorMessage(null);

      try {
        const data = await api.getPersonByUsername(username, token);
        if (data.role !== 'CUSTOMER') {
          router.replace(`${backHref}`);
          return;
        }
        setCustomer(data);
      } catch (err: any) {
        console.error('Failed to load customer profile:', err);
        setErrorMessage(err.message || 'Failed to load customer profile.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [token, username, router, backHref],
  );

  useEffect(() => {
    if (!authLoading && token) {
      loadCustomer();

      // Fetch workers and services for record service modal
      api
        .getActiveWorkers(token)
        .then((res) => setWorkers(res?.workers || []))
        .catch(() => null);

      api.reminder
        .listServiceConfigs(token)
        .then((res) => setServiceConfigs(res.services))
        .catch(() => null);
    }
  }, [authLoading, token, loadCustomer]);

  const handleDeleteCustomer = async () => {
    if (!token || !customer) return;
    setIsDeleting(true);
    try {
      await api.deletePerson(customer.id, token);
      router.push(backHref);
    } catch (err: any) {
      console.error('Failed to delete customer:', err);
      showToast(err.message || 'Failed to delete customer');
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleRecordServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !customer) return;
    if (!serviceName.trim()) {
      alert('Please select a service');
      return;
    }

    setIsSubmittingService(true);
    try {
      const res = await api.feedCustomer(
        {
          name: customer.name || customer.username,
          mobileNumber: customer.phone,
          email: customer.email || undefined,
          address: customer.address || undefined,
          addService: true,
          serviceName: serviceName.trim(),
          serviceDate: new Date(serviceDate).toISOString(),
          serviceStatus,
          serviceCost: serviceCost ? Number(serviceCost) : undefined,
          serviceNotes: serviceNotes.trim() || undefined,
          addWorker: assignWorker && Boolean(selectedWorkerId),
          workerId: assignWorker && selectedWorkerId ? selectedWorkerId : undefined,
        },
        token,
      );

      showToast(res.message || 'Service recorded and reminder scheduled successfully');
      setIsRecordServiceModalOpen(false);
      setServiceName('');
      setServiceCost('');
      setServiceNotes('');
      setAssignWorker(false);
      setSelectedWorkerId('');
      loadCustomer(true);
    } catch (err: any) {
      console.error('Failed to record service:', err);
      alert(err.message || 'Failed to record service');
    } finally {
      setIsSubmittingService(false);
    }
  };

  const cleanPhone = customer?.phone?.replace(/\D/g, '') || '';
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`}?text=${encodeURIComponent(
        `നമസ്കാരം ${customer?.name || ''}, KK Group Kerala-ൽ നിന്നുള്ള അറിയിപ്പ്. താങ്കളുടെ സർവീസ് സംബന്ധിച്ച വിവരങ്ങൾ അറിയുവാനായി ബന്ധപ്പെടുന്നു.`,
      )}`
    : '#';

  const enquiries = useMemo(() => customer?.customerEnquiries || [], [customer]);
  const completedEnquiries = useMemo(
    () => enquiries.filter((e: any) => e.status === 'COMPLETED'),
    [enquiries],
  );
  const reminders = useMemo(() => customer?.customerReminders || [], [customer]);
  const stats = useMemo(() => {
    const totalEnq = enquiries.length;
    const completed = completedEnquiries.length;
    const spent = completedEnquiries.reduce(
      (acc: number, cur: any) => acc + (cur.totalCalculatedCost || 0),
      0,
    );
    const activeRem = reminders.filter((r: any) => r.status !== 'COMPLETED').length;
    return { totalEnq, completed, spent, activeRem };
  }, [enquiries, completedEnquiries, reminders]);

  if (isLoading || authLoading) {
    return (
      <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
        <div className="bg-[#14151A] rounded-2xl border border-gray-800 p-12 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#7B4DFF] mb-3" />
          <p className="text-sm font-semibold text-gray-300">Loading customer profile...</p>
        </div>
      </div>
    );
  }

  if (errorMessage || !customer) {
    return (
      <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
        <div className="bg-[#14151A] rounded-2xl border border-rose-500/30 p-8 text-center">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
          <p className="text-base font-bold text-gray-100">{errorMessage || 'Customer not found'}</p>
          <NextLink
            href={backHref}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#1A1C23] hover:bg-gray-800 border border-gray-800 rounded-xl text-xs text-gray-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Customers</span>
          </NextLink>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <NextLink
            href={backHref}
            className="p-2 rounded-xl bg-[#14151A] hover:bg-[#1A1C23] border border-gray-800 text-gray-400 hover:text-white transition-colors"
            title="Back to Customers"
          >
            <ArrowLeft className="w-5 h-5" />
          </NextLink>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono tracking-wider text-[#7B4DFF]">
                Customer Profile Hub
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-600" />
              <span className="text-xs text-gray-500 font-mono">@{customer.username}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2 mt-0.5">
              <span>{customer.name || customer.username}</span>
              {customer.isActive && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Active
                </span>
              )}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Refresh */}
          <button
            type="button"
            onClick={() => loadCustomer(true)}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-[#14151A] hover:bg-[#1A1C23] border border-gray-800 text-gray-300 hover:text-white transition-colors"
            title="Reload profile"
          >
            <RefreshCw className={`w-4 h-4 text-[#7B4DFF] ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Record Service Button */}
          <button
            type="button"
            onClick={() => setIsRecordServiceModalOpen(true)}
            className="flex items-center gap-2 bg-[#7B4DFF] hover:bg-[#6A3DEE] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-[0_0_15px_rgba(123,77,255,0.3)] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Record Service</span>
          </button>

          {/* Setup Reminder Button */}
          <button
            type="button"
            onClick={() => setIsReminderModalOpen(true)}
            className="flex items-center gap-2 bg-[#1A1C23] hover:bg-[#222530] border border-gray-800 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-gray-200 hover:text-white transition-all"
          >
            <CalendarClock className="w-4 h-4 text-[#7B4DFF]" />
            <span>Setup Reminder</span>
          </button>

          {/* Edit Profile */}
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="p-2.5 rounded-xl bg-[#14151A] hover:bg-[#1A1C23] border border-gray-800 text-gray-300 hover:text-white transition-colors"
            title="Edit Profile"
          >
            <Pencil className="w-4 h-4 text-gray-400" />
          </button>

          {/* Delete Profile */}
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 transition-colors"
            title="Delete Customer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Customer Hero Card */}
      <div className="bg-[#14151A] rounded-2xl border border-gray-800 p-5 sm:p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#7B4DFF]/60 to-transparent" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7B4DFF] to-emerald-500 p-[2px] shadow-lg">
                <div className="w-full h-full bg-[#1A1C23] rounded-[14px] flex items-center justify-center text-xl font-bold text-gray-100 overflow-hidden">
                  {customer.avatar ? (
                    <img src={customer.avatar} alt={customer.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{(customer.name || customer.username || 'C')[0].toUpperCase()}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-gray-100">{customer.name || 'Unnamed Client'}</h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                {customer.phone && (
                  <span className="flex items-center gap-1.5 font-mono text-gray-300">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{customer.phone}</span>
                  </span>
                )}
                {customer.email && (
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <Mail className="w-3.5 h-3.5 text-[#7B4DFF]" />
                    <span>{customer.email}</span>
                  </span>
                )}
                {customer.address && (
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span className="line-clamp-1">{customer.address}</span>
                  </span>
                )}
              </div>

              <div className="text-[11px] text-gray-500 pt-1">
                <span>Member since: </span>
                <span className="text-gray-400">
                  {customer.createdAt
                    ? new Date(customer.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Client Outreach Channels */}
          <div className="flex items-center gap-2.5 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-gray-800">
            {cleanPhone && (
              <>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold transition-all shadow-sm"
                  title="Open WhatsApp chat"
                >
                  <MessageCircle className="w-4 h-4 fill-emerald-400/20" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={`tel:${cleanPhone}`}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-[#1A1C23] hover:bg-[#222530] text-gray-300 hover:text-white border border-gray-800 text-xs font-bold transition-all"
                  title="Call Customer"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>Call</span>
                </a>
              </>
            )}

            {customer.email && (
              <a
                href={`mailto:${customer.email}`}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-[#1A1C23] hover:bg-[#222530] text-gray-300 hover:text-white border border-gray-800 text-xs font-bold transition-all"
                title="Send Email"
              >
                <Mail className="w-4 h-4 text-[#7B4DFF]" />
                <span>Email</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Top 4 Metrics Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Bookings */}
        <div className="bg-[#14151A] rounded-2xl border border-gray-800/80 p-4">
          <div className="text-xs text-gray-500 font-medium">Total Bookings</div>
          <div className="text-2xl font-bold text-gray-100 mt-1">{stats.totalEnq}</div>
          <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
            <Layers className="w-3 h-3 text-[#7B4DFF]" />
            <span>Enquiries &amp; Orders</span>
          </div>
        </div>

        {/* Completed Works */}
        <div className="bg-[#14151A] rounded-2xl border border-gray-800/80 p-4">
          <div className="text-xs text-gray-500 font-medium">Completed Works</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{stats.completed}</div>
          <div className="text-[11px] text-emerald-400/80 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Serviced &amp; finalized</span>
          </div>
        </div>

        {/* Total Spend */}
        <div className="bg-[#14151A] rounded-2xl border border-gray-800/80 p-4">
          <div className="text-xs text-gray-500 font-medium">Total Spend (₹)</div>
          <div className="text-2xl font-bold text-gray-100 font-mono mt-1">
            ₹{stats.spent.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-emerald-400" />
            <span>Lifetime client value</span>
          </div>
        </div>

        {/* Active Reminders */}
        <div className="bg-[#14151A] rounded-2xl border border-gray-800/80 p-4">
          <div className="text-xs text-gray-500 font-medium">Active Reminders</div>
          <div className="text-2xl font-bold text-[#A580FF] mt-1">{stats.activeRem}</div>
          <div className="text-[11px] text-[#A580FF]/80 mt-1 flex items-center gap-1">
            <CalendarClock className="w-3 h-3 text-[#7B4DFF]" />
            <span>Scheduled cycles</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-2 overflow-x-auto custom-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('ENQUIRIES')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'ENQUIRIES'
              ? 'bg-[#7B4DFF] text-white shadow-[0_0_15px_rgba(123,77,255,0.3)]'
              : 'bg-[#14151A] text-gray-400 hover:text-gray-200 border border-gray-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Job Orders &amp; Enquiries ({stats.totalEnq})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('COMPLETED')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'COMPLETED'
              ? 'bg-[#7B4DFF] text-white shadow-[0_0_15px_rgba(123,77,255,0.3)]'
              : 'bg-[#14151A] text-gray-400 hover:text-gray-200 border border-gray-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Completed Works History ({stats.completed})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('REMINDERS')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'REMINDERS'
              ? 'bg-[#7B4DFF] text-white shadow-[0_0_15px_rgba(123,77,255,0.3)]'
              : 'bg-[#14151A] text-gray-400 hover:text-gray-200 border border-gray-800'
          }`}
        >
          <CalendarClock className="w-4 h-4" />
          <span>Recurring Reminders ({reminders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('INFO')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'INFO'
              ? 'bg-[#7B4DFF] text-white shadow-[0_0_15px_rgba(123,77,255,0.3)]'
              : 'bg-[#14151A] text-gray-400 hover:text-gray-200 border border-gray-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Customer &amp; Property Details</span>
        </button>
      </div>

      {/* Tab 1: All Enquiries / Bookings */}
      {activeTab === 'ENQUIRIES' && (
        <div className="space-y-4">
          {enquiries.length === 0 ? (
            <div className="bg-[#14151A] rounded-2xl border border-gray-800 p-12 text-center">
              <Layers className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-200">No service bookings recorded yet</p>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Record the first service order for this customer with the button below.
              </p>
              <button
                type="button"
                onClick={() => setIsRecordServiceModalOpen(true)}
                className="mt-4 px-4 py-2 bg-[#7B4DFF] text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Record Service Order</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enquiries.map((enq: any) => {
                const imageSrc = getServiceImage(enq.serviceName);
                const malayalamBadge = getMalayalamLabel(enq.serviceName);

                return (
                  <div
                    key={enq.id}
                    className="bg-[#14151A] rounded-2xl border border-gray-800/80 p-5 hover:border-gray-700 transition-all flex flex-col justify-between group shadow-sm"
                  >
                    <div>
                      {/* Top row: Tracking + Status */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="font-mono text-xs font-bold text-[#7B4DFF]">
                          {enq.trackingNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                            enq.status === 'COMPLETED'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : enq.status === 'IN_PROGRESS'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}
                        >
                          {enq.status}
                        </span>
                      </div>

                      {/* Service info with image */}
                      <div className="flex items-start gap-3.5 mb-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-gray-800 shadow-md bg-gray-950">
                          <img
                            src={imageSrc}
                            alt={enq.serviceName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-gray-100 truncate block">
                            {enq.serviceName}
                          </h4>
                          {malayalamBadge && (
                            <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
                              {malayalamBadge}
                            </span>
                          )}
                          <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-gray-500" />
                            <span>
                              {enq.preferredDate
                                ? new Date(enq.preferredDate).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : 'Date not specified'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Location, Enquiry Details, Worker, and Measurements */}
                      <div className="space-y-2 p-3.5 rounded-xl bg-[#1A1C23] border border-gray-800/60 text-xs">
                        {/* Location */}
                        {enq.location && (
                          <div className="flex items-start gap-1.5 text-gray-300">
                            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{enq.location}</span>
                          </div>
                        )}

                        {/* Customer Enquiry Message */}
                        {enq.message && (
                          <div className="p-2 rounded-lg bg-[#14151A] text-[11px] text-gray-300 border border-gray-800/50">
                            <span className="text-[10px] text-gray-500 font-semibold block uppercase tracking-wider mb-0.5">
                              Enquiry Details:
                            </span>
                            <p className="line-clamp-3 italic">"{enq.message}"</p>
                          </div>
                        )}

                        {/* Work Scope / Measurements */}
                        {(enq.completedUnits || enq.estimatedUnits) && (
                          <div className="flex items-center justify-between text-gray-300 pt-1.5 border-t border-gray-800/40">
                            <span className="text-gray-500 text-[11px]">Work Measurement:</span>
                            <span className="font-semibold text-emerald-300">
                              {enq.completedUnits || enq.estimatedUnits} {enq.unitLabel || 'Units'}
                              {enq.unitRate ? ` @ ₹${enq.unitRate}/${enq.unitLabel || 'Unit'}` : ''}
                            </span>
                          </div>
                        )}

                        {/* Time Duration */}
                        {enq.workDurationMinutes ? (
                          <div className="flex items-center justify-between text-gray-300 pt-1 border-t border-gray-800/40">
                            <span className="text-gray-500 text-[11px]">Time Worked:</span>
                            <span className="font-mono text-gray-300">{enq.workDurationMinutes} mins</span>
                          </div>
                        ) : null}

                        {/* Assigned Worker */}
                        {enq.worker ? (
                          <div className="flex items-center justify-between text-gray-300 pt-1.5 border-t border-gray-800/40">
                            <span className="text-gray-500 text-[11px]">Assigned Specialist:</span>
                            <span className="font-semibold text-gray-200 flex items-center gap-1.5">
                              <User className="w-3 h-3 text-[#7B4DFF]" />
                              <span>{enq.worker.name || enq.worker.username}</span>
                              {enq.worker.phone && (
                                <span className="text-[10px] text-gray-500 font-mono">({enq.worker.phone})</span>
                              )}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-gray-500 text-[11px] pt-1.5 border-t border-gray-800/40">
                            <span>Assigned Specialist:</span>
                            <span className="text-amber-500/80 font-medium">Pending Assignment</span>
                          </div>
                        )}

                        {/* Coordinator Office Staff */}
                        {enq.officeStaff && (
                          <div className="flex items-center justify-between text-gray-300 pt-1 border-t border-gray-800/40">
                            <span className="text-gray-500 text-[11px]">Dispatch Desk:</span>
                            <span className="text-gray-300 text-[11px]">{enq.officeStaff.name || enq.officeStaff.username}</span>
                          </div>
                        )}

                        {/* Billed Amount */}
                        {enq.totalCalculatedCost !== undefined && enq.totalCalculatedCost > 0 && (
                          <div className="flex items-center justify-between text-gray-300 pt-1.5 border-t border-gray-800/40">
                            <span className="text-gray-500 text-[11px]">Billed Amount:</span>
                            <span className="font-bold text-emerald-400 font-mono text-sm">
                              ₹{enq.totalCalculatedCost.toLocaleString('en-IN')}
                            </span>
                          </div>
                        )}

                        {/* Financial Transactions if recorded */}
                        {enq.financialTransactions && enq.financialTransactions.length > 0 && (
                          <div className="flex items-center justify-between text-gray-300 pt-1 border-t border-gray-800/40">
                            <span className="text-gray-500 text-[11px]">Payment Recorded:</span>
                            <span className="text-emerald-400 font-mono font-semibold text-[11px]">
                              ₹{enq.financialTransactions.reduce((acc: number, t: any) => acc + (t.amount || 0), 0).toLocaleString('en-IN')}
                              {enq.financialTransactions[0]?.paymentMethod ? ` (${enq.financialTransactions[0].paymentMethod})` : ''}
                            </span>
                          </div>
                        )}

                        {/* Contact on Ticket */}
                        {enq.customerPhone && (
                          <div className="text-[10px] text-gray-500 pt-1 border-t border-gray-800/40 flex items-center justify-between font-mono">
                            <span>Contact on Ticket:</span>
                            <span className="text-gray-400">{enq.customerPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-gray-800/60 flex items-center justify-between text-xs">
                      <span className="text-gray-500 text-[10px]">
                        Recorded:{' '}
                        {new Date(enq.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>

                      <NextLink
                        href={`/admin/operations/enquiries/${enq.id}`}
                        className="text-xs text-[#7B4DFF] hover:text-[#9B75FF] font-semibold flex items-center gap-1"
                      >
                        <span>View Order Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </NextLink>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Completed Works History */}
      {activeTab === 'COMPLETED' && (
        <div className="space-y-4">
          {completedEnquiries.length === 0 ? (
            <div className="bg-[#14151A] rounded-2xl border border-gray-800 p-12 text-center">
              <CheckCircle2 className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-200">No completed jobs yet</p>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Completed jobs will automatically appear here with their billed amounts and linked cyclic reminders.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedEnquiries.map((enq: any) => {
                const imageSrc = getServiceImage(enq.serviceName);
                const malayalamBadge = getMalayalamLabel(enq.serviceName);
                const completionDate = enq.completedAt || enq.preferredDate || enq.updatedAt;

                return (
                  <div
                    key={enq.id}
                    className="bg-[#14151A] rounded-2xl border border-emerald-500/20 p-5 hover:border-emerald-500/40 transition-all flex flex-col justify-between group shadow-sm relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

                    <div>
                      {/* Top row: Tracking + Completed Badge */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="font-mono text-xs font-bold text-[#7B4DFF]">
                          {enq.trackingNumber}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>COMPLETED</span>
                        </span>
                      </div>

                      {/* Service info with image */}
                      <div className="flex items-start gap-3.5 mb-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-gray-800 shadow-md bg-gray-950">
                          <img
                            src={imageSrc}
                            alt={enq.serviceName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-gray-100 truncate block">
                            {enq.serviceName}
                          </h4>
                          {malayalamBadge && (
                            <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
                              {malayalamBadge}
                            </span>
                          )}
                          <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-emerald-400" />
                            <span>
                              Completed on{' '}
                              {completionDate
                                ? new Date(completionDate).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : 'Recent date'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Location, Enquiry Details, Worker, and Measurements */}
                      <div className="space-y-2 p-3.5 rounded-xl bg-[#1A1C23] border border-gray-800/60 text-xs">
                        {/* Location */}
                        {enq.location && (
                          <div className="flex items-start gap-1.5 text-gray-300">
                            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{enq.location}</span>
                          </div>
                        )}

                        {/* Customer Message / Notes */}
                        {enq.message && (
                          <div className="p-2 rounded-lg bg-[#14151A] text-[11px] text-gray-300 border border-gray-800/50">
                            <span className="text-[10px] text-gray-500 font-semibold block uppercase tracking-wider mb-0.5">
                              Work Notes &amp; Scope:
                            </span>
                            <p className="line-clamp-3 italic">"{enq.message}"</p>
                          </div>
                        )}

                        {/* Work Scope / Measurements */}
                        {(enq.completedUnits || enq.estimatedUnits) && (
                          <div className="flex items-center justify-between text-gray-300 pt-1.5 border-t border-gray-800/40">
                            <span className="text-gray-500 text-[11px]">Units Serviced:</span>
                            <span className="font-semibold text-emerald-300">
                              {enq.completedUnits || enq.estimatedUnits} {enq.unitLabel || 'Units'}
                              {enq.unitRate ? ` @ ₹${enq.unitRate}/${enq.unitLabel || 'Unit'}` : ''}
                            </span>
                          </div>
                        )}

                        {/* Time Duration */}
                        {enq.workDurationMinutes ? (
                          <div className="flex items-center justify-between text-gray-300 pt-1 border-t border-gray-800/40">
                            <span className="text-gray-500 text-[11px]">Time Worked:</span>
                            <span className="font-mono text-gray-300">{enq.workDurationMinutes} mins</span>
                          </div>
                        ) : null}

                        {/* Assigned Worker Specialist */}
                        {enq.worker && (
                          <div className="flex items-center justify-between text-gray-300 pt-1.5 border-t border-gray-800/40">
                            <span className="text-gray-500 text-[11px]">Serviced By:</span>
                            <span className="font-semibold text-gray-200 flex items-center gap-1.5">
                              <User className="w-3 h-3 text-emerald-400" />
                              <span>{enq.worker.name || enq.worker.username}</span>
                              {enq.worker.phone && (
                                <span className="text-[10px] text-gray-500 font-mono">({enq.worker.phone})</span>
                              )}
                            </span>
                          </div>
                        )}

                        {/* Coordinator Office Staff */}
                        {enq.officeStaff && (
                          <div className="flex items-center justify-between text-gray-300 pt-1 border-t border-gray-800/40">
                            <span className="text-gray-500 text-[11px]">Coordinated By:</span>
                            <span className="text-gray-300 text-[11px]">{enq.officeStaff.name || enq.officeStaff.username}</span>
                          </div>
                        )}

                        {/* Billed Amount */}
                        {enq.totalCalculatedCost !== undefined && enq.totalCalculatedCost > 0 && (
                          <div className="flex items-center justify-between text-gray-300 pt-1.5 border-t border-gray-800/40">
                            <span className="text-gray-500 text-[11px]">Final Amount:</span>
                            <span className="font-bold text-emerald-400 font-mono text-sm">
                              ₹{enq.totalCalculatedCost.toLocaleString('en-IN')}
                            </span>
                          </div>
                        )}

                        {/* Payment Transactions */}
                        {enq.financialTransactions && enq.financialTransactions.length > 0 && (
                          <div className="flex items-center justify-between text-gray-300 pt-1 border-t border-gray-800/40">
                            <span className="text-gray-500 text-[11px]">Payment Collected:</span>
                            <span className="text-emerald-400 font-mono font-semibold text-[11px]">
                              ₹{enq.financialTransactions.reduce((acc: number, t: any) => acc + (t.amount || 0), 0).toLocaleString('en-IN')}
                              {enq.financialTransactions[0]?.paymentMethod ? ` (${enq.financialTransactions[0].paymentMethod})` : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-gray-800/60 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setReminderServiceName(enq.serviceName);
                          setIsReminderModalOpen(true);
                        }}
                        className="text-[11px] text-[#7B4DFF] hover:text-[#9B75FF] font-semibold flex items-center gap-1"
                      >
                        <CalendarClock className="w-3.5 h-3.5" />
                        <span>Schedule Next Cycle</span>
                      </button>

                      <NextLink
                        href={`/admin/operations/enquiries/${enq.id}`}
                        className="px-3 py-1 bg-[#1A1C23] hover:bg-gray-800 text-gray-200 border border-gray-800 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
                      >
                        <span>View Work Order</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </NextLink>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Recurring Reminders */}
      {activeTab === 'REMINDERS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-200">
              Recurring Maintenance Reminders for {customer.name || customer.username}
            </h3>
            <button
              type="button"
              onClick={() => setIsReminderModalOpen(true)}
              className="px-3.5 py-1.5 bg-[#7B4DFF] hover:bg-[#6A3DEE] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule New Reminder</span>
            </button>
          </div>

          {reminders.length === 0 ? (
            <div className="bg-[#14151A] rounded-2xl border border-gray-800 p-12 text-center">
              <CalendarClock className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-200">No recurring reminders scheduled</p>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Completed service orders automatically schedule reminders (e.g. Coconut tree plucking every 3 months), or schedule one manually now.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reminders.map((rem: any) => {
                const imageSrc = getServiceImage(rem.serviceName);
                const isCompleted = rem.status === 'COMPLETED';

                const dueDate = new Date(rem.dueDate);
                const now = new Date();
                const diffDays = Math.ceil(
                  (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
                );

                const remWaUrl = cleanPhone
                  ? `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`}?text=${encodeURIComponent(
                      `നമസ്കാരം ${customer?.name || ''},\n\nKK Group-ൽ നിന്നുള്ള ഓർമ്മപ്പെടുത്തൽ: താങ്കളുടെ ${rem.serviceName} അടുത്ത ഷെഡ്യൂൾ ചെയ്ത തീയതി ${dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} ആണ്. ഈ ആഴ്ച ടീമിനെ അയക്കേണ്ടതുണ്ടോ എന്ന് ദയവായി അറിയിക്കുമല്ലോ.`,
                    )}`
                  : '#';

                return (
                  <div
                    key={rem.id}
                    className="p-5 rounded-2xl bg-[#14151A] border border-gray-800 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                            isCompleted
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : diffDays < 0
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : diffDays <= 7
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                              : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          }`}
                        >
                          {isCompleted
                            ? 'Completed'
                            : diffDays < 0
                            ? `Overdue by ${Math.abs(diffDays)}d`
                            : diffDays === 0
                            ? 'Due Today'
                            : `Due in ${diffDays} days`}
                        </span>

                        <span className="text-xs text-gray-400 font-mono">
                          {formatFrequencyShort(rem.frequency, rem.customIntervalDays)}
                        </span>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-gray-800 bg-gray-950">
                          <img src={imageSrc} alt={rem.serviceName} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-100">{rem.serviceName}</h4>
                          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                            <CalendarClock className="w-3.5 h-3.5 text-[#7B4DFF]" />
                            <span>
                              Scheduled Due:{' '}
                              <strong>
                                {dueDate.toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </strong>
                            </span>
                          </p>
                        </div>
                      </div>

                      {rem.notes && (
                        <p className="text-xs text-gray-500 mt-3 p-2.5 rounded-xl bg-[#1A1C23] border border-gray-800/60 line-clamp-2">
                          {rem.notes}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-800/60 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-gray-500">Outreach:</span>
                      <div className="flex items-center gap-2">
                        {cleanPhone && (
                          <a
                            href={remWaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5 transition-all"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp Reminder</span>
                          </a>
                        )}
                        <NextLink
                          href="/admin/operations/reminders"
                          className="px-3 py-1.5 rounded-xl bg-[#1A1C23] hover:bg-gray-800 text-gray-300 text-xs font-semibold border border-gray-800"
                        >
                          View in Reminders
                        </NextLink>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Customer Details & Info */}
      {activeTab === 'INFO' && (
        <div className="bg-[#14151A] rounded-2xl border border-gray-800 p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <span className="text-xs uppercase font-semibold text-gray-500 block mb-1">
                Full Legal Name
              </span>
              <p className="text-sm font-bold text-gray-100">{customer.name || 'Not provided'}</p>
            </div>

            <div>
              <span className="text-xs uppercase font-semibold text-gray-500 block mb-1">
                Username Identifier
              </span>
              <p className="text-sm font-mono text-[#7B4DFF]">@{customer.username}</p>
            </div>

            <div>
              <span className="text-xs uppercase font-semibold text-gray-500 block mb-1">
                Primary Phone Number
              </span>
              <p className="text-sm font-mono text-gray-100 flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>{customer.phone || 'N/A'}</span>
              </p>
            </div>

            <div>
              <span className="text-xs uppercase font-semibold text-gray-500 block mb-1">
                Email Address
              </span>
              <p className="text-sm text-gray-100 flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#7B4DFF]" />
                <span>{customer.email || 'N/A'}</span>
              </p>
            </div>

            <div className="sm:col-span-2">
              <span className="text-xs uppercase font-semibold text-gray-500 block mb-1">
                Service Address / Property Location
              </span>
              <p className="text-sm text-gray-200 flex items-center gap-2 bg-[#1A1C23] p-3 rounded-xl border border-gray-800">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{customer.address || 'Kerala Residence (Default)'}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Record Service Order directly for Customer */}
      {isRecordServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-[#14151A] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95">
            <div className="p-5 bg-[#1A1C23] border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#14151A] border border-gray-800 rounded-xl">
                  <Sparkles className="w-5 h-5 text-[#7B4DFF]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-100">
                    Record Service Order for {customer.name || customer.username}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Feed completed or scheduled service with automatic cyclic reminder scheduling
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRecordServiceModalOpen(false)}
                className="text-gray-400 hover:text-gray-200 text-sm p-1.5"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordServiceSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
              {/* Service Selection Image Dropdown */}
              <ServiceSelectDropdown
                label="Choose Service"
                services={serviceConfigs}
                selectedServiceId={serviceName}
                onSelect={(val) => {
                  const match = serviceConfigs.find((s) => s.id === val || s.name === val);
                  setServiceName(match ? match.name : val);
                }}
                placeholder="Select service (Coconut, Well, Solar, JCB, Electrical...)"
              />

              {/* Service Date & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Service Date
                  </label>
                  <input
                    type="date"
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#7B4DFF]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Job Status
                  </label>
                  <select
                    value={serviceStatus}
                    onChange={(e) => setServiceStatus(e.target.value as any)}
                    className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#7B4DFF]"
                  >
                    <option value="COMPLETED">Completed (Triggers Reminder)</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="PENDING">Scheduled / Pending</option>
                  </select>
                </div>
              </div>

              {/* Cost / Billed Amount */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Billed Amount / Service Fee (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={serviceCost}
                    onChange={(e) => setServiceCost(e.target.value)}
                    placeholder="e.g. 1500"
                    className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl pl-8 pr-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#7B4DFF]"
                  />
                </div>
              </div>

              {/* Assign Worker Toggle */}
              <div className="p-3.5 rounded-xl bg-[#1A1C23] border border-gray-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#7B4DFF]" />
                    <span className="text-xs font-bold text-gray-200">Assign Worker Who Attended</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={assignWorker}
                    onChange={(e) => setAssignWorker(e.target.checked)}
                    className="w-4 h-4 rounded text-[#7B4DFF] focus:ring-0 bg-gray-800 border-gray-700"
                  />
                </div>

                {assignWorker && (
                  <div className="pt-2 border-t border-gray-800/60 animate-in fade-in">
                    <label className="block text-[11px] text-gray-400 mb-1">Select Worker</label>
                    <select
                      value={selectedWorkerId}
                      onChange={(e) => setSelectedWorkerId(e.target.value)}
                      className="w-full bg-[#14151A] border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#7B4DFF]"
                    >
                      <option value="">-- Choose active worker --</option>
                      {workers.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name || w.phone} ({w.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Service Notes / Specifications
                </label>
                <textarea
                  value={serviceNotes}
                  onChange={(e) => setServiceNotes(e.target.value)}
                  placeholder="e.g. Harvested 12 coconut trees. Crown cleaning done."
                  rows={2}
                  className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#7B4DFF]"
                />
              </div>

              <div className="pt-3 border-t border-gray-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsRecordServiceModalOpen(false)}
                  className="px-4 py-2 bg-[#1A1C23] hover:bg-gray-800 text-gray-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingService}
                  className="px-4 py-2 bg-[#7B4DFF] hover:bg-[#6A3DEE] text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmittingService && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save &amp; Record Order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Setup Reminder */}
      <SetupReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => {
          setIsReminderModalOpen(false);
          setReminderServiceName('');
        }}
        onSuccess={(msg) => {
          showToast(msg);
          loadCustomer(true);
        }}
        token={token || ''}
        services={serviceConfigs}
        prefilledCustomer={
          customer
            ? {
                id: customer.id,
                name: customer.name,
                phone: customer.phone,
                email: customer.email,
                address: customer.address,
              }
            : null
        }
        prefilledServiceName={reminderServiceName}
      />

      {/* MODAL: Edit Person */}
      <EditPersonModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        person={customer}
        token={token || ''}
        onSuccess={() => {
          showToast('Customer profile updated');
          loadCustomer(true);
        }}
      />

      {/* MODAL: Delete Person */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Customer Profile?"
        message={`Are you sure you want to delete "${customer.name || customer.username}"? This will not delete their historical invoices.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete Customer'}
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteCustomer}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}
