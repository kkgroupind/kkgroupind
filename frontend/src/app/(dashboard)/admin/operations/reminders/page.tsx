'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import {
  CalendarClock,
  Plus,
  RefreshCw,
  Search,
  Phone,
  MessageCircle,
  TreePalm,
  User,
  MapPin,
  Clock,
  CheckCircle2,
  Calendar,
  Trash2,
  RotateCw,
  Sparkles,
  LayoutGrid,
  List,
  Check,
  Pencil,
  AlertTriangle,
  Mail,
  Shield,
  Loader2,
  Settings2,
  SlidersHorizontal,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  reminderService,
  ServiceReminder,
  ServiceReminderConfig,
  ReminderFrequency,
  ReminderStatus,
  ReminderStats,
} from '@/services/reminder.service';
import { SetupReminderModal } from '@/components/Admin/SetupReminderModal';
import { ConfigureServiceRuleModal } from '@/components/Admin/ConfigureServiceRuleModal';
import { ServiceSelectDropdown } from '@/components/Admin/ServiceSelectDropdown';
import { ConfirmationModal } from '@/components/Admin/confirmation-modal';

export default function AdminRemindersPage() {
  const { token, user: authUser, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [reminders, setReminders] = useState<ServiceReminder[]>([]);
  const [stats, setStats] = useState<ReminderStats>({
    total: 0,
    upcoming: 0,
    due: 0,
    overdue: 0,
    completed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // View Modes and Sections
  const [activeSection, setActiveSection] = useState<'CLIENT_REMINDERS' | 'SERVICE_RULES'>('CLIENT_REMINDERS');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [serviceConfigs, setServiceConfigs] = useState<ServiceReminderConfig[]>([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'OVERDUE' | 'DUE_TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'COMPLETED'>('ALL');
  const [serviceFilter, setServiceFilter] = useState<string>('ALL');

  // Modals
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [ruleServiceId, setRuleServiceId] = useState<string | null>(null);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<ServiceReminder | null>(null);
  const [reminderToDelete, setReminderToDelete] = useState<ServiceReminder | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Auth guard
  useEffect(() => {
    if (!authLoading) {
      if (!token || (authUser?.role !== 'SUPER_ADMIN' && authUser?.role !== 'OFFICE_STAFF')) {
        router.push('/admin/login');
      }
    }
  }, [authLoading, token, authUser, router]);

  // Fetch reminders
  const loadReminders = useCallback(async (showIndicator = false) => {
    if (!token) return;
    if (showIndicator) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    try {
      const selectedSvc = serviceConfigs.find((s) => s.id === serviceFilter);
      const effectiveServiceName = selectedSvc
        ? selectedSvc.name
        : serviceFilter !== 'ALL'
        ? serviceFilter
        : undefined;

      const [res, configsRes] = await Promise.all([
        reminderService.listReminders(token, {
          search: searchTerm.trim() || undefined,
          dueFilter: activeTab !== 'ALL' && activeTab !== 'COMPLETED' ? activeTab : undefined,
          status: activeTab === 'COMPLETED' ? 'COMPLETED' : undefined,
          serviceName: effectiveServiceName,
          limit: 100,
        }),
        reminderService.listServiceConfigs(token).catch(() => ({ services: [] })),
      ]);

      setReminders(res.data);
      if (res.stats) {
        setStats(res.stats);
      }
      if (configsRes?.services) {
        setServiceConfigs(configsRes.services);
      }
    } catch (err: any) {
      console.error('Failed to load reminders:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [token, searchTerm, activeTab, serviceFilter]);

  useEffect(() => {
    if (!authLoading && token) {
      loadReminders();
    }
  }, [authLoading, token, loadReminders]);

  const handleReload = () => {
    loadReminders(true);
  };

  // Complete Cycle & Advance to next interval
  const handleCompleteCycle = async (reminder: ServiceReminder) => {
    if (!token) return;
    setReschedulingId(reminder.id);
    try {
      const res = await reminderService.completeCycle(token, reminder.id);
      showToast(res.message || 'Cycle completed! Next reminder has been scheduled.');
      loadReminders(true);
    } catch (err: any) {
      console.error('Failed to complete cycle:', err);
      showToast(err.message || 'Failed to advance cycle.');
    } finally {
      setReschedulingId(null);
    }
  };

  // Delete reminder
  const handleDeleteReminder = async () => {
    if (!token || !reminderToDelete) return;
    setIsDeleting(true);
    try {
      await reminderService.deleteReminder(token, reminderToDelete.id);
      showToast('Reminder deleted successfully');
      setReminderToDelete(null);
      loadReminders(true);
    } catch (err: any) {
      console.error('Failed to delete reminder:', err);
      showToast(err.message || 'Failed to delete reminder.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Build WhatsApp URL with bilingual text
  const getWhatsAppUrl = (reminder: ServiceReminder): string => {
    const rawPhone = reminder.customerPhone.replace(/[^0-9]/g, '');
    const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;

    const formattedDate = new Date(reminder.dueDate).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const isCoconut = reminder.serviceName.toLowerCase().includes('coco') || reminder.serviceName.toLowerCase().includes('palm');

    const serviceNameText = isCoconut
      ? 'Coconut Plucking & Maintenance (തേങ്ങയിടൽ)'
      : reminder.serviceName;

    const text = `നമസ്കാരം ${reminder.customerName},\n\nKK Group-ൽ നിന്നുള്ള ഓർമ്മപ്പെടുത്തൽ: താങ്കളുടെ ${serviceNameText} അടുത്ത ഷെഡ്യൂൾ ചെയ്ത തീയതി ${formattedDate} ആണ്. ഈ ആഴ്ച വർക്കർമാരെ അയക്കേണ്ടതുണ്ടോ എന്ന് ദയവായി അറിയിക്കുമല്ലോ.\n\nNamaskaram, this is KK Group Kerala. Your recurring ${serviceNameText} maintenance is due on ${formattedDate}. Would you like us to schedule the team this week?`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  // Relative due status calculation
  const getRelativeDueText = (dueDateStr: string, status: ReminderStatus) => {
    if (status === 'COMPLETED') {
      return {
        text: 'Completed',
        badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        ring: 'from-emerald-500 to-teal-600',
      };
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(dueDateStr);
    const diffTime = target.getTime() - startOfToday.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        text: `Overdue by ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'day' : 'days'}`,
        badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        ring: 'from-rose-500 to-red-600',
      };
    }
    if (diffDays === 0) {
      return {
        text: 'Due Today',
        badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse',
        ring: 'from-amber-500 to-orange-600',
      };
    }
    if (diffDays <= 3) {
      return {
        text: `Due in ${diffDays} days`,
        badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        ring: 'from-amber-500 to-yellow-600',
      };
    }
    if (diffDays <= 7) {
      return {
        text: `Due this week (${diffDays}d)`,
        badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        ring: 'from-blue-500 to-cyan-600',
      };
    }
    return {
      text: `In ${diffDays} days`,
      badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      ring: 'from-purple-500 to-indigo-600',
    };
  };

  // Format frequency label
  const getFrequencyLabel = (freq: ReminderFrequency, customDays?: number | null) => {
    switch (freq) {
      case 'EVERY_3_MONTHS':
        return 'Every 3 Months';
      case 'MONTHLY':
        return 'Monthly';
      case 'EVERY_2_MONTHS':
        return 'Every 2 Months';
      case 'EVERY_6_MONTHS':
        return 'Every 6 Months';
      case 'YEARLY':
        return 'Yearly';
      case 'CUSTOM_DAYS':
        return `Every ${customDays || 30} Days`;
      case 'ONCE':
        return 'One-Time';
      default:
        return freq;
    }
  };

  // Distinct service names for filter
  const distinctServices = useMemo(() => {
    const set = new Set<string>();
    reminders.forEach((r) => {
      if (r.serviceName) set.add(r.serviceName);
    });
    return Array.from(set);
  }, [reminders]);

  if (authLoading) {
    return (
      <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
        <div className="bg-[#14151A] rounded-2xl border border-gray-800 p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#7B4DFF] mb-3" />
          <p className="text-sm font-semibold text-gray-300">Loading service reminders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
            <div className="p-2 bg-[#1A1C23] border border-gray-800 rounded-xl">
              <CalendarClock className="w-6 h-6 text-[#7B4DFF]" />
            </div>
            Service Reminders &amp; Recurring Maintenance
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Automate periodic maintenance cycles like coconut plucking every 3 months with one-tap client outreach
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Refetch Button */}
          <button
            type="button"
            onClick={handleReload}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-2 bg-[#14151A] hover:bg-[#1A1C23] border border-gray-800 px-3.5 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-all disabled:opacity-50"
            title="Reload reminders"
          >
            <RefreshCw
              className={`w-4 h-4 text-[#7B4DFF] ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            />
            <span>{isRefreshing ? 'Refetching...' : 'Reload'}</span>
          </button>

          {/* Configure Service Automation Rule Button */}
          <button
            type="button"
            onClick={() => {
              setRuleServiceId(null);
              setIsRuleModalOpen(true);
            }}
            className="flex items-center gap-2 bg-[#7B4DFF] hover:bg-[#6A3DEE] px-4 py-2 rounded-xl text-sm font-medium text-white shadow-[0_0_15px_rgba(123,77,255,0.3)] transition-all"
            title="Configure service recurrence rules"
          >
            <Settings2 className="w-4 h-4" />
            <span>Configure Service Rules</span>
          </button>

          {/* Manual Reminder Button */}
          <button
            type="button"
            onClick={() => {
              setEditingReminder(null);
              setIsSetupModalOpen(true);
            }}
            className="flex items-center gap-2 bg-[#14151A] hover:bg-[#1A1C23] border border-gray-800 px-3.5 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-all"
            title="Manually create a client reminder"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Manual Reminder</span>
          </button>
        </div>
      </div>

      {/* Top 5 Metrics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Reminders */}
        <div className="bg-[#14151A] rounded-2xl border border-gray-800/80 p-4">
          <div className="text-xs text-gray-500 font-medium">Total Reminders</div>
          <div className="text-2xl font-bold text-gray-100 mt-1">{stats.total}</div>
          <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
            <CalendarClock className="w-3 h-3 text-[#7B4DFF]" />
            <span>Recurring setups</span>
          </div>
        </div>

        {/* Overdue */}
        <div className={`rounded-2xl border p-4 transition-all ${
          stats.overdue > 0
            ? 'bg-rose-500/10 border-rose-500/20'
            : 'bg-[#14151A] border-gray-800/80'
        }`}>
          <div className="text-xs text-rose-400 font-medium flex items-center justify-between">
            <span>Overdue</span>
            {stats.overdue > 0 && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
          </div>
          <div className="text-2xl font-bold text-rose-300 mt-1">{stats.overdue}</div>
          <div className="text-[11px] text-rose-400/80 mt-1">Requires client contact</div>
        </div>

        {/* Due Soon / Today */}
        <div className="bg-[#14151A] rounded-2xl border border-gray-800/80 p-4">
          <div className="text-xs text-amber-400 font-medium">Due in 3 Days</div>
          <div className="text-2xl font-bold text-amber-300 mt-1">{stats.due}</div>
          <div className="text-[11px] text-gray-500 mt-1">Ready for dispatch</div>
        </div>

        {/* Upcoming */}
        <div className="bg-[#14151A] rounded-2xl border border-gray-800/80 p-4">
          <div className="text-xs text-blue-400 font-medium">Upcoming Cycles</div>
          <div className="text-2xl font-bold text-blue-300 mt-1">{stats.upcoming}</div>
          <div className="text-[11px] text-gray-500 mt-1">Future target dates</div>
        </div>

        {/* Completed */}
        <div className="bg-[#14151A] rounded-2xl border border-gray-800/80 p-4 col-span-2 sm:col-span-1">
          <div className="text-xs text-emerald-400 font-medium">Completed Cycles</div>
          <div className="text-2xl font-bold text-emerald-300 mt-1">{stats.completed}</div>
          <div className="text-[11px] text-gray-500 mt-1">Rolled over to next</div>
        </div>
      </div>

      {/* Main Section Switcher: Scheduled Client Reminders vs Service Automation Setup */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-gray-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSection('CLIENT_REMINDERS')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeSection === 'CLIENT_REMINDERS'
                ? 'bg-[#7B4DFF] text-white shadow-[0_0_15px_rgba(123,77,255,0.3)]'
                : 'bg-[#14151A] text-gray-400 hover:text-gray-200 border border-gray-800'
            }`}
          >
            <CalendarClock className="w-4 h-4" />
            <span>Scheduled Client Reminders ({stats.total})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('SERVICE_RULES')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeSection === 'SERVICE_RULES'
                ? 'bg-[#7B4DFF] text-white shadow-[0_0_15px_rgba(123,77,255,0.3)]'
                : 'bg-[#14151A] text-gray-400 hover:text-gray-200 border border-gray-800'
            }`}
          >
            <Settings2 className="w-4 h-4" />
            <span>Service Automation Rules ({serviceConfigs.length})</span>
          </button>
        </div>

        {activeSection === 'CLIENT_REMINDERS' && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Auto-scheduled on booking completion</span>
          </div>
        )}
      </div>

      {activeSection === 'SERVICE_RULES' ? (
        /* ================= SERVICE AUTOMATION RULES VIEW ================= */
        <div className="space-y-5">
          {/* Explanatory Banner */}
          <div className="p-4 rounded-2xl bg-[#14151A] border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#7B4DFF]/10 border border-[#7B4DFF]/20 flex items-center justify-center text-[#7B4DFF] shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-100">
                  Service Automation Rules &amp; Completion Hooks
                </h3>
                <p className="text-xs text-gray-400 mt-0.5 max-w-2xl leading-relaxed">
                  Configure recurrence intervals per service (e.g. Coconut plucking every 3 months, Well cleaning every 6 months).
                  When a client books and the work order is marked <strong>COMPLETED</strong>, Antigravity automatically schedules the client reminder for that target date.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setRuleServiceId(null);
                setIsRuleModalOpen(true);
              }}
              className="px-4 py-2 bg-[#7B4DFF] hover:bg-[#6A3DEE] text-white text-xs font-bold rounded-xl shadow-[0_0_15px_rgba(123,77,255,0.3)] transition-all shrink-0 flex items-center gap-2"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Modify Service Rule</span>
            </button>
          </div>

          {/* Grid of Services with Reminder Configs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {serviceConfigs.map((svc) => {
              const isCoconut = svc.name.toLowerCase().includes('coco') || svc.name.toLowerCase().includes('palm');
              const isWell = svc.name.toLowerCase().includes('well');
              const isEnabled = svc.hasReminder ?? (isCoconut || isWell);

              return (
                <div
                  key={svc.id}
                  className="group bg-[#14151A] rounded-2xl border border-gray-800/80 hover:border-gray-700/80 p-5 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex flex-col justify-between relative overflow-hidden"
                >
                  {/* Subtle top ambient glow */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gray-700/40 to-transparent group-hover:via-[#7B4DFF]/60 transition-all duration-300" />

                  <div>
                    {/* Header: Service Icon, Name, Category */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="relative shrink-0">
                        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${
                          isEnabled ? 'from-[#7B4DFF] to-emerald-500' : 'from-gray-700 to-gray-800'
                        } p-[2px] shadow-sm`}>
                          <div className="w-full h-full bg-[#1A1C23] rounded-[14px] flex items-center justify-center font-bold text-gray-100 overflow-hidden">
                            {isCoconut ? (
                              <TreePalm className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <CalendarClock className="w-5 h-5 text-[#7B4DFF]" />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono font-semibold text-[#7B4DFF] block uppercase tracking-wider">
                            {svc.category || 'Service'}
                          </span>

                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                            isEnabled
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-gray-800 text-gray-500 border-gray-700'
                          }`}>
                            {isEnabled ? 'Auto-Schedule ON' : 'Disabled'}
                          </span>
                        </div>

                        <h4
                          className="font-bold text-gray-100 hover:text-[#7B4DFF] transition-colors truncate block text-sm mt-0.5"
                          title={svc.name}
                        >
                          {svc.name}
                        </h4>
                      </div>
                    </div>

                    {/* Recurrence Rule Card Details */}
                    <div className="space-y-2 py-3 border-y border-gray-800/60 my-3 text-xs bg-[#1A1C23]/60 rounded-xl p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#7B4DFF]" />
                          <span>Recurrence Cycle:</span>
                        </span>
                        <span className="font-semibold text-gray-200">
                          {getFrequencyLabel(svc.reminderFrequency || (isCoconut ? 'EVERY_3_MONTHS' : 'EVERY_6_MONTHS'), svc.reminderIntervalDays)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-gray-500" />
                          <span>Active Clients:</span>
                        </span>
                        <span className="font-mono font-bold text-emerald-400">
                          {svc.activeReminderCount} scheduled
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-800/40">
                        <span>Trigger:</span>
                        <span className="text-gray-300">On Job Order COMPLETED</span>
                      </div>
                    </div>
                  </div>

                  {/* Modify Rule Action */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRuleServiceId(svc.id);
                        setIsRuleModalOpen(true);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-[#1A1C23] hover:bg-gray-800 text-gray-200 hover:text-white border border-gray-800 text-xs font-medium transition-all flex items-center justify-center gap-2"
                    >
                      <Settings2 className="w-3.5 h-3.5 text-[#7B4DFF]" />
                      <span>Configure Service Rule</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ================= CLIENT REMINDERS VIEW ================= */
        <>
          {/* Search, Filters and View Toggle */}
      <div className="bg-[#14151A] p-4 rounded-2xl border border-gray-800 space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by client, phone, coconut, well, address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#1A1C23] border border-gray-800 rounded-xl text-xs sm:text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#7B4DFF] transition-colors"
            />
          </div>

          {/* Cool Service Filter Dropdown with Images */}
          <div className="w-full sm:w-80">
            <ServiceSelectDropdown
              services={
                serviceConfigs.length > 0
                  ? serviceConfigs
                  : distinctServices.map((name) => ({ id: name, name }))
              }
              selectedServiceId={serviceFilter}
              onSelect={(val) => setServiceFilter(val)}
              includeAllOption={true}
              allOptionLabel="All Service Types"
              placeholder="Filter by service..."
              showFrequencyBadge={false}
              showClientCount={true}
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
            <span className="text-xs text-gray-500">
              Total: <span className="text-gray-300 font-medium">{stats.total}</span>
            </span>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#1A1C23] border border-gray-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-[#7B4DFF] text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all ${
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

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-800/60">
          {[
            { id: 'ALL', label: `All (${stats.total})` },
            { id: 'OVERDUE', label: `Overdue (${stats.overdue})` },
            { id: 'DUE_TODAY', label: 'Due Today' },
            { id: 'THIS_WEEK', label: 'This Week' },
            { id: 'THIS_MONTH', label: 'This Month' },
            { id: 'COMPLETED', label: `Completed (${stats.completed})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-[#7B4DFF] text-white shadow-sm'
                  : 'bg-[#1A1C23] text-gray-400 hover:text-gray-200 hover:bg-gray-800 border border-gray-800/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Cards Grid or Table */}
      {isLoading && !isRefreshing ? (
        <div className="bg-[#14151A] rounded-2xl border border-gray-800 p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#7B4DFF] mb-3" />
          <p className="text-sm font-semibold text-gray-300">Loading service reminders...</p>
        </div>
      ) : reminders.length === 0 ? (
        <div className="bg-[#14151A] rounded-2xl border border-gray-800 p-12 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-[#1A1C23] border border-gray-800 flex items-center justify-center text-gray-500 mb-4">
            <TreePalm className="w-7 h-7 text-[#7B4DFF]" />
          </div>
          <h3 className="text-gray-200 font-semibold text-base mb-1">No service reminders found</h3>
          <p className="text-gray-500 text-sm max-w-sm mb-4">
            {searchTerm || activeTab !== 'ALL'
              ? 'No reminders match the selected criteria.'
              : 'Setup your first recurring reminder for coconut tree plucking or well maintenance.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setEditingReminder(null);
              setIsSetupModalOpen(true);
            }}
            className="flex items-center gap-2 bg-[#7B4DFF] hover:bg-[#6A3DEE] px-4 py-2 rounded-xl text-sm font-medium text-white shadow-[0_0_15px_rgba(123,77,255,0.3)] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Setup New Reminder</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW: Same structure and styling as people-cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reminders.map((reminder) => {
            const isCoconut =
              reminder.serviceName.toLowerCase().includes('coco') ||
              reminder.serviceName.toLowerCase().includes('palm');
            const relative = getRelativeDueText(reminder.dueDate, reminder.status);
            const isAdvancePending = reschedulingId === reminder.id;

            return (
              <div
                key={reminder.id}
                className="group bg-[#14151A] rounded-2xl border border-gray-800/80 hover:border-gray-700/80 p-5 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex flex-col justify-between relative overflow-hidden"
              >
                {/* Subtle top ambient glow */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gray-700/40 to-transparent group-hover:via-[#7B4DFF]/60 transition-all duration-300" />

                <div>
                  {/* Header: Service Icon, Service Name, Badges placed cleanly below title */}
                  <div className="flex items-start gap-3 mb-3">
                    {/* Service Icon with gradient ring */}
                    <div className="relative shrink-0">
                      <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${relative.ring} p-[2px] shadow-sm`}>
                        <div className="w-full h-full bg-[#1A1C23] rounded-[14px] flex items-center justify-center font-bold text-gray-100 overflow-hidden">
                          {isCoconut ? (
                            <TreePalm className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <CalendarClock className="w-5 h-5 text-[#7B4DFF]" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono font-semibold text-[#7B4DFF] block uppercase tracking-wider">
                          {isCoconut ? 'Palm / Coconut' : 'Cyclic Service'}
                        </span>
                        {reminder.status === 'OVERDUE' && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-rose-400 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                            Overdue
                          </span>
                        )}
                      </div>

                      <h4
                        className="font-semibold text-gray-100 hover:text-[#7B4DFF] transition-colors truncate block text-sm mt-0.5"
                        title={reminder.serviceName}
                      >
                        {reminder.serviceName}
                      </h4>

                      {/* Due Date & Frequency Badges placed cleanly below the title */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {/* Due Date Badge */}
                        <span
                          className={`px-2 py-0.5 text-[11px] font-semibold rounded-lg border tracking-wide inline-flex items-center gap-1 shrink-0 ${relative.badge}`}
                        >
                          <CalendarClock className="w-3 h-3 shrink-0" />
                          <span>{relative.text}</span>
                        </span>

                        {/* Frequency Pill */}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-[#1A1C23] text-gray-300 border border-gray-800 shrink-0">
                          <Clock className="w-3 h-3 text-[#7B4DFF] shrink-0" />
                          <span>{getFrequencyLabel(reminder.frequency, reminder.customIntervalDays)}</span>
                        </span>

                        {/* Synced Client Pill */}
                        {reminder.customer && (
                          <Link
                            href="/admin/people/customers"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-colors shrink-0"
                            title="View client in Customers directory"
                          >
                            <User className="w-2.5 h-2.5 shrink-0" />
                            <span>Client Synced</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Details List (matching People cards) */}
                  <div className="space-y-2 py-3 border-y border-gray-800/60 my-3 text-xs">
                    {/* Client Name */}
                    <div className="flex items-center justify-between text-gray-400 gap-2">
                      <span className="flex items-center gap-2 text-gray-300 font-medium truncate">
                        <User className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        <span className="truncate">{reminder.customerName}</span>
                      </span>
                      {reminder.customerPhone && (
                        <span className="shrink-0 font-mono text-emerald-400 font-medium">
                          {reminder.customerPhone}
                        </span>
                      )}
                    </div>

                    {/* Email if available */}
                    {reminder.customerEmail && (
                      <div className="flex items-center gap-2 text-gray-400 truncate">
                        <Mail className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        <span className="truncate">{reminder.customerEmail}</span>
                      </div>
                    )}

                    {/* Location */}
                    {reminder.customerAddress && (
                      <div className="flex items-center gap-2 text-gray-400 truncate">
                        <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        <span className="truncate">{reminder.customerAddress}</span>
                      </div>
                    )}

                    {/* Scheduled Due Date */}
                    <div className="flex items-center justify-between text-gray-400 pt-1">
                      <span className="flex items-center gap-1.5 text-gray-400">
                        <Calendar className="w-3.5 h-3.5 text-[#7B4DFF]" />
                        <span>Next Scheduled:</span>
                      </span>
                      <span className="font-semibold text-gray-200">
                        {new Date(reminder.dueDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    {/* Last Serviced Date */}
                    {reminder.lastServicedDate && (
                      <div className="flex items-center justify-between text-gray-400">
                        <span className="flex items-center gap-1.5 text-gray-500">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Last Serviced:</span>
                        </span>
                        <span className="text-gray-400">
                          {new Date(reminder.lastServicedDate).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Notes snippet */}
                  {reminder.notes && (
                    <p className="text-xs text-gray-500 line-clamp-2 italic bg-[#1A1C23] p-2.5 rounded-xl border border-gray-800/80 mb-3">
                      "{reminder.notes}"
                    </p>
                  )}
                </div>

                {/* Footer Controls: WhatsApp, Call, Advance Cycle, Edit, Delete */}
                <div className="pt-2 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {/* WhatsApp Action Button */}
                    <a
                      href={getWhatsAppUrl(reminder)}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-current" />
                      <span>WhatsApp</span>
                    </a>

                    {/* Call Button */}
                    <a
                      href={`tel:${reminder.customerPhone}`}
                      className="py-2 px-3 rounded-xl bg-[#1A1C23] hover:bg-gray-800 border border-gray-800 text-gray-200 hover:text-white text-xs font-medium transition-all flex items-center justify-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#7B4DFF]" />
                      <span>Call Client</span>
                    </a>
                  </div>

                  <div className="flex items-center justify-between gap-1.5 pt-1">
                    {/* Mark Done & Next Cycle Button */}
                    <button
                      type="button"
                      disabled={isAdvancePending}
                      onClick={() => handleCompleteCycle(reminder)}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-medium transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                      title="Log as serviced today and advance next due date"
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${isAdvancePending ? 'animate-spin' : ''}`} />
                      <span>Mark Done &amp; Next Cycle</span>
                    </button>

                    {/* Edit Reminder */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingReminder(reminder);
                        setIsSetupModalOpen(true);
                      }}
                      className="p-2 rounded-xl bg-[#1A1C23] hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-800 transition-colors"
                      title="Modify reminder setup"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Reminder */}
                    <button
                      type="button"
                      onClick={() => setReminderToDelete(reminder)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                      title="Delete reminder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW: Same structure and styling as people-table */
        <div className="bg-[#14151A] rounded-2xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm text-left text-gray-400">
              <thead className="text-xs text-gray-500 bg-[#1A1C23] border-b border-gray-800/50">
                <tr>
                  <th scope="col" className="px-6 py-4 font-medium">Service / Task</th>
                  <th scope="col" className="px-6 py-4 font-medium">Client / Contact</th>
                  <th scope="col" className="px-6 py-4 font-medium">Frequency</th>
                  <th scope="col" className="px-6 py-4 font-medium">Next Due Date</th>
                  <th scope="col" className="px-6 py-4 font-medium text-center">Status</th>
                  <th scope="col" className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reminders.map((reminder) => {
                  const isCoconut =
                    reminder.serviceName.toLowerCase().includes('coco') ||
                    reminder.serviceName.toLowerCase().includes('palm');
                  const relative = getRelativeDueText(reminder.dueDate, reminder.status);
                  const isAdvancePending = reschedulingId === reminder.id;

                  return (
                    <tr
                      key={reminder.id}
                      className="hover:bg-[#1A1C23] transition-colors border-b border-gray-800/30 last:border-0"
                    >
                      {/* Service */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#1A1C23] border border-gray-800 flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                            {isCoconut ? (
                              <TreePalm className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <CalendarClock className="w-4 h-4 text-[#7B4DFF]" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-gray-200 block truncate max-w-[200px]">
                              {reminder.serviceName}
                            </span>
                            <span className="text-xs text-gray-500 truncate block">
                              {reminder.customerAddress || 'Kerala'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Client */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-200">{reminder.customerName}</span>
                          <span className="text-xs text-emerald-400 font-mono">{reminder.customerPhone}</span>
                        </div>
                      </td>

                      {/* Frequency */}
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-300">
                          {getFrequencyLabel(reminder.frequency, reminder.customIntervalDays)}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-200">
                            {new Date(reminder.dueDate).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="text-xs text-gray-500">
                            {relative.text}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-lg border uppercase tracking-wider ${relative.badge}`}
                        >
                          {relative.text}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <a
                            href={getWhatsAppUrl(reminder)}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
                            title="WhatsApp Client"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                          <a
                            href={`tel:${reminder.customerPhone}`}
                            className="p-1.5 rounded-lg bg-[#1A1C23] hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 transition-colors"
                            title="Call Client"
                          >
                            <Phone className="w-4 h-4 text-[#7B4DFF]" />
                          </a>
                          <button
                            type="button"
                            disabled={isAdvancePending}
                            onClick={() => handleCompleteCycle(reminder)}
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors disabled:opacity-50"
                            title="Mark Done & Next Cycle"
                          >
                            <RotateCw className={`w-4 h-4 ${isAdvancePending ? 'animate-spin' : ''}`} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingReminder(reminder);
                              setIsSetupModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-[#1A1C23] hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-800 transition-colors"
                            title="Modify Reminder"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setReminderToDelete(reminder)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                            title="Delete Reminder"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
      </>
      )}

      {/* SERVICE RULE CONFIGURATION MODAL */}
      <ConfigureServiceRuleModal
        isOpen={isRuleModalOpen}
        onClose={() => {
          setIsRuleModalOpen(false);
          setRuleServiceId(null);
        }}
        onSuccess={(msg) => {
          showToast(msg);
          loadReminders(true);
        }}
        token={token || ''}
        initialServiceId={ruleServiceId}
      />

      {/* SETUP / MODIFY REMINDER MODAL */}
      <SetupReminderModal
        isOpen={isSetupModalOpen}
        onClose={() => {
          setIsSetupModalOpen(false);
          setEditingReminder(null);
        }}
        onSuccess={(msg) => {
          showToast(msg);
          loadReminders(true);
        }}
        token={token || ''}
        reminderToEdit={editingReminder}
        services={serviceConfigs}
      />

      {/* DELETE CONFIRMATION MODAL */}
      {reminderToDelete && (
        <ConfirmationModal
          isOpen={Boolean(reminderToDelete)}
          title="Delete Service Reminder?"
          message={`Are you sure you want to remove the recurring reminder for "${reminderToDelete.customerName}" (${reminderToDelete.serviceName})? This action cannot be undone.`}
          confirmText={isDeleting ? 'Deleting...' : 'Delete Reminder'}
          variant="danger"
          isLoading={isDeleting}
          onConfirm={handleDeleteReminder}
          onClose={() => setReminderToDelete(null)}
        />
      )}
    </div>
  );
}
