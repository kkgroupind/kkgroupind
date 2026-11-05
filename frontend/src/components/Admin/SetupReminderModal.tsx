'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  CalendarClock,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  FileText,
  Loader2,
  CheckCircle2,
  Search,
} from 'lucide-react';
import {
  reminderService,
  ServiceReminder,
  ReminderFrequency,
  CreateReminderInput,
  UpdateReminderInput,
} from '@/services/reminder.service';
import {
  peopleService,
  SearchCustomerResult,
} from '@/services/Admin/people/people.service';
import {
  ServiceSelectDropdown,
  ServiceSelectOption,
} from './ServiceSelectDropdown';
import { useAdminTheme } from '@/context/admin-theme-context';

interface SetupReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  token: string;
  reminderToEdit?: ServiceReminder | null;
  services?: ServiceSelectOption[];
  prefilledCustomer?: {
    id?: string;
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
  } | null;
  prefilledServiceName?: string;
}

const PRESET_SERVICES = [
  {
    name: 'Cococare - Palm Tree Harvesting & Maintenance',
    label: 'Coconut Plucking & Tree Care (തേങ്ങയിടൽ)',
    defaultFrequency: 'EVERY_3_MONTHS' as ReminderFrequency,
  },
  {
    name: 'Well Cleaning & Disinfection',
    label: 'Well Cleaning & Chlorination (കിണർ ശുചീകരണം)',
    defaultFrequency: 'EVERY_6_MONTHS' as ReminderFrequency,
  },
  {
    name: 'Lawn, Grass Cutting & Garden Maintenance',
    label: 'Garden & Lawn Trimming (പുല്ലുവെട്ട്)',
    defaultFrequency: 'EVERY_2_MONTHS' as ReminderFrequency,
  },
  {
    name: 'Solar Panel Cleaning & Maintenance',
    label: 'Solar Panel Wash & Electrical Audit',
    defaultFrequency: 'EVERY_3_MONTHS' as ReminderFrequency,
  },
  {
    name: 'Electrical & Plumbing Preventive Inspection',
    label: 'Home Electrical & Plumbing Safety Audit',
    defaultFrequency: 'EVERY_6_MONTHS' as ReminderFrequency,
  },
];

export function SetupReminderModal({
  isOpen,
  onClose,
  onSuccess,
  token,
  reminderToEdit,
  services = [],
  prefilledCustomer,
  prefilledServiceName,
}: SetupReminderModalProps) {
  const { isDark } = useAdminTheme();
  const isEditing = Boolean(reminderToEdit);

  // Form State
  const [serviceName, setServiceName] = useState('');
  const [customServiceName, setCustomServiceName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [frequency, setFrequency] = useState<ReminderFrequency>('EVERY_3_MONTHS');
  const [customIntervalDays, setCustomIntervalDays] = useState<number>(90);
  const [dueDate, setDueDate] = useState('');
  const [lastServicedDate, setLastServicedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [feedCustomer, setFeedCustomer] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Customer Search & Autocomplete
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchCustomerResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<SearchCustomerResult | null>(null);

  // Reset search when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setShowSuggestions(false);
      setSelectedCustomer(null);
    }
  }, [isOpen]);

  // Debounced search for clients
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q || q.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await peopleService.searchCustomers(q, token);
        setSearchResults(results || []);
      } catch (err) {
        console.error('Failed to search customers:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, token]);

  const handleSelectCustomer = (cust: SearchCustomerResult) => {
    setSelectedCustomer(cust);
    setCustomerName(cust.name || '');
    setCustomerPhone(cust.phone || '');
    if (cust.email) setCustomerEmail(cust.email);
    if (cust.address) setCustomerAddress(cust.address);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleClearSelectedCustomer = () => {
    setSelectedCustomer(null);
  };

  // Available services list for the dropdown
  const dropdownServices: ServiceSelectOption[] = useMemo(() => {
    const list: ServiceSelectOption[] = [];

    if (services && services.length > 0) {
      services.forEach((s) => {
        list.push({
          id: s.id || s.name,
          name: s.name,
          category: s.category,
          image: s.image,
          hasReminder: s.hasReminder,
          reminderFrequency: s.reminderFrequency,
          reminderIntervalDays: s.reminderIntervalDays,
          activeReminderCount: s.activeReminderCount,
        });
      });
    } else {
      PRESET_SERVICES.forEach((p) => {
        list.push({
          id: p.name,
          name: p.name,
          category: p.label,
          reminderFrequency: p.defaultFrequency,
        });
      });
    }

    list.push({
      id: 'CUSTOM',
      name: 'Custom / Other Service...',
      category: 'Manual Service Entry',
    });

    return list;
  }, [services]);

  const formatDateToInput = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (!isOpen) return;

    setErrorMessage(null);

    if (reminderToEdit) {
      const isKnown = dropdownServices.some(
        (s) => s.name.toLowerCase() === reminderToEdit.serviceName.toLowerCase() && s.id !== 'CUSTOM',
      );
      if (isKnown) {
        setServiceName(reminderToEdit.serviceName);
        setCustomServiceName('');
      } else {
        setServiceName('CUSTOM');
        setCustomServiceName(reminderToEdit.serviceName);
      }

      setCustomerName(reminderToEdit.customerName || '');
      setCustomerPhone(reminderToEdit.customerPhone || '');
      setCustomerEmail(reminderToEdit.customerEmail || '');
      setCustomerAddress(reminderToEdit.customerAddress || '');
      setFrequency(reminderToEdit.frequency || 'EVERY_3_MONTHS');
      setCustomIntervalDays(reminderToEdit.customIntervalDays || 90);

      if (reminderToEdit.dueDate) {
        setDueDate(formatDateToInput(new Date(reminderToEdit.dueDate)));
      } else {
        setDueDate('');
      }

      if (reminderToEdit.lastServicedDate) {
        setLastServicedDate(formatDateToInput(new Date(reminderToEdit.lastServicedDate)));
      } else {
        setLastServicedDate('');
      }

      setNotes(reminderToEdit.notes || '');
      setFeedCustomer(true);
    } else {
      const defaultSvc = dropdownServices.find((s) => s.id !== 'CUSTOM') || dropdownServices[0];
      const targetServiceName = prefilledServiceName || (defaultSvc ? defaultSvc.name : PRESET_SERVICES[0].name);
      const matchedSvc = dropdownServices.find(
        (s) => s.name.toLowerCase() === targetServiceName.toLowerCase() && s.id !== 'CUSTOM',
      );

      if (matchedSvc) {
        setServiceName(matchedSvc.name);
        setCustomServiceName('');
        setFrequency(matchedSvc.reminderFrequency || 'EVERY_3_MONTHS');
        setCustomIntervalDays(matchedSvc.reminderIntervalDays || 90);
      } else if (prefilledServiceName) {
        setServiceName('CUSTOM');
        setCustomServiceName(prefilledServiceName);
        setFrequency('EVERY_3_MONTHS');
        setCustomIntervalDays(90);
      } else {
        setServiceName(defaultSvc ? defaultSvc.name : PRESET_SERVICES[0].name);
        setCustomServiceName('');
        setFrequency(defaultSvc?.reminderFrequency || 'EVERY_3_MONTHS');
        setCustomIntervalDays(defaultSvc?.reminderIntervalDays || 90);
      }

      if (prefilledCustomer) {
        setCustomerName(prefilledCustomer.name || '');
        setCustomerPhone(prefilledCustomer.phone || '');
        setCustomerEmail(prefilledCustomer.email || '');
        setCustomerAddress(prefilledCustomer.address || '');
        if (prefilledCustomer.id) {
          setSelectedCustomer({
            id: prefilledCustomer.id,
            name: prefilledCustomer.name || '',
            phone: prefilledCustomer.phone || '',
            email: prefilledCustomer.email || null,
            address: prefilledCustomer.address || null,
          });
        }
      } else {
        setCustomerName('');
        setCustomerPhone('');
        setCustomerEmail('');
        setCustomerAddress('');
        setSelectedCustomer(null);
      }

      const defaultNext = new Date();
      defaultNext.setMonth(defaultNext.getMonth() + 3);
      setDueDate(formatDateToInput(defaultNext));

      const today = new Date();
      setLastServicedDate(formatDateToInput(today));
      setNotes('Automated maintenance cycle. Team equipment required.');
      setFeedCustomer(true);
    }
  }, [isOpen, reminderToEdit, dropdownServices, prefilledCustomer, prefilledServiceName]);

  const handleServiceSelect = (selectedId: string) => {
    if (selectedId === 'CUSTOM') {
      setServiceName('CUSTOM');
      return;
    }

    const matched = dropdownServices.find((s) => s.id === selectedId || s.name === selectedId);
    if (matched) {
      setServiceName(matched.name);
      setCustomServiceName('');
      const targetFreq = matched.reminderFrequency || 'EVERY_3_MONTHS';
      setFrequency(targetFreq);
      if (matched.reminderIntervalDays) {
        setCustomIntervalDays(matched.reminderIntervalDays);
      }

      if (!isEditing) {
        const next = new Date();
        if (targetFreq === 'EVERY_3_MONTHS') {
          next.setMonth(next.getMonth() + 3);
        } else if (targetFreq === 'EVERY_6_MONTHS') {
          next.setMonth(next.getMonth() + 6);
        } else if (targetFreq === 'EVERY_2_MONTHS') {
          next.setMonth(next.getMonth() + 2);
        } else if (targetFreq === 'MONTHLY') {
          next.setMonth(next.getMonth() + 1);
        } else if (targetFreq === 'YEARLY') {
          next.setFullYear(next.getFullYear() + 1);
        } else if (targetFreq === 'CUSTOM_DAYS') {
          next.setDate(next.getDate() + (matched.reminderIntervalDays || 90));
        }
        setDueDate(formatDateToInput(next));
      }
    }
  };

  const applyQuickDueDate = (monthsOffset: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthsOffset);
    setDueDate(formatDateToInput(d));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const finalService =
      serviceName === 'CUSTOM' ? customServiceName.trim() : serviceName.trim();

    if (!finalService) {
      setErrorMessage('Please select or specify a service name.');
      return;
    }
    if (!customerName.trim()) {
      setErrorMessage('Client/Customer name is required.');
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMessage('Client phone number is required.');
      return;
    }
    if (!dueDate) {
      setErrorMessage('Please select a scheduled next due date.');
      return;
    }

    const formatIndianPhone = (raw: string): string => {
      const trimmed = raw.trim();
      if (!trimmed) return '';
      const digits = trimmed.replace(/\D/g, '');
      if (digits.length === 10) return `+91${digits}`;
      if (digits.length === 11 && digits.startsWith('0')) return `+91${digits.slice(1)}`;
      if (digits.length === 12 && digits.startsWith('91')) return `+91${digits.slice(2)}`;
      if (trimmed.startsWith('+')) return `+${digits}`;
      if (digits.length > 10) return `+91${digits.slice(-10)}`;
      return digits ? `+91${digits}` : trimmed;
    };

    const normalizedPhone = formatIndianPhone(customerPhone);

    setIsSubmitting(true);
    try {
      if (isEditing && reminderToEdit) {
        const updatePayload: UpdateReminderInput = {
          serviceName: finalService,
          customerName: customerName.trim(),
          customerPhone: normalizedPhone,
          customerEmail: customerEmail.trim() || undefined,
          customerAddress: customerAddress.trim() || undefined,
          frequency,
          customIntervalDays: frequency === 'CUSTOM_DAYS' ? Number(customIntervalDays) : undefined,
          dueDate: new Date(dueDate).toISOString(),
          lastServicedDate: lastServicedDate ? new Date(lastServicedDate).toISOString() : undefined,
          notes: notes.trim() || undefined,
          feedCustomer,
        };

        const res = await reminderService.updateReminder(token, reminderToEdit.id, updatePayload);
        onSuccess(res.message || 'Service reminder modified successfully');
        onClose();
      } else {
        const createPayload: CreateReminderInput = {
          serviceName: finalService,
          customerName: customerName.trim(),
          customerPhone: normalizedPhone,
          customerEmail: customerEmail.trim() || undefined,
          customerAddress: customerAddress.trim() || undefined,
          frequency,
          customIntervalDays: frequency === 'CUSTOM_DAYS' ? Number(customIntervalDays) : undefined,
          dueDate: new Date(dueDate).toISOString(),
          lastServicedDate: lastServicedDate ? new Date(lastServicedDate).toISOString() : undefined,
          notes: notes.trim() || undefined,
          feedCustomer,
        };

        const res = await reminderService.createReminder(token, createPayload);
        onSuccess(res.message || 'Service reminder scheduled successfully');
        onClose();
      }
    } catch (err: any) {
      console.error('Error submitting reminder:', err);
      setErrorMessage(err.message || 'Failed to save service reminder. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div
        className={`relative w-full max-w-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 rounded-[28px] border ${
          isDark ? 'bg-[#12141A] border-white/[0.08]' : 'bg-white border-slate-200'
        }`}
      >
        {/* Header */}
        <div
          className={`p-5 sm:p-6 border-b flex items-center justify-between ${
            isDark ? 'bg-[#161922] border-white/[0.06]' : 'bg-slate-50 border-slate-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-2xl border flex items-center justify-center text-[#6366F1] ${
                isDark ? 'bg-[#181A20] border-white/[0.08]' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <span>{isEditing ? 'Edit Service Reminder' : 'Set Up Service Reminder'}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#6366F1]/10 text-[#A78BFA] border border-[#6366F1]/20">
                  Recurring Task
                </span>
              </h3>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Automate periodic maintenance cycles like coconut tree plucking every 3 months.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDark
                ? 'text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08]'
                : 'text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <span className="font-bold">Error:</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* 1. Service Selection with Image Dropdown */}
          <div className="space-y-2">
            <ServiceSelectDropdown
              label="Select Service to Automate"
              services={dropdownServices}
              selectedServiceId={serviceName}
              onSelect={handleServiceSelect}
              placeholder="Choose a service (Coconut, Well, Solar, JCB, Electrical...)"
              showFrequencyBadge={true}
              showClientCount={false}
            />

            {serviceName === 'CUSTOM' && (
              <div
                className={`mt-2.5 p-3.5 rounded-2xl border space-y-1.5 animate-in fade-in duration-150 ${
                  isDark ? 'bg-[#121318] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <label className={`text-[11px] font-semibold block ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  Custom Service Name (Specify exact service)
                </label>
                <input
                  type="text"
                  value={customServiceName}
                  onChange={(e) => setCustomServiceName(e.target.value)}
                  placeholder="e.g. Roof Tile Cleaning & Water Proofing..."
                  className={`w-full rounded-xl px-3.5 py-2 text-xs border focus:outline-none focus:border-[#FF5C38] ${
                    isDark ? 'bg-[#181A20] border-white/[0.08] text-white placeholder-zinc-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
            )}
          </div>

          {/* 2. Client / Customer Details */}
          <div
            className={`p-4 rounded-2xl border space-y-3 ${
              isDark ? 'bg-[#121318] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold flex items-center gap-1.5 ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                <User className="w-3.5 h-3.5 text-[#FF5C38]" />
                <span>Client &amp; Property Information</span>
              </span>
              <span className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Search existing or feed new</span>
            </div>

            {/* Quick Search & Select Client */}
            <div className="relative">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="🔍 Quick Search &amp; Select existing client (by Name or Mobile)..."
                  className={`w-full rounded-xl pl-9 pr-8 py-2 text-xs border focus:outline-none focus:border-[#FF5C38] ${
                    isDark ? 'bg-[#181A20] border-white/[0.08] text-white placeholder-zinc-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
                {isSearching && (
                  <Loader2 className="w-3.5 h-3.5 text-[#FF5C38] animate-spin absolute right-3 top-2.5" />
                )}
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && searchQuery.trim().length >= 2 && (
                <div
                  className={`absolute z-30 left-0 right-0 mt-1 max-h-52 overflow-y-auto rounded-2xl border shadow-2xl custom-scrollbar py-1 divide-y ${
                    isDark ? 'bg-[#181A20] border-white/[0.12] divide-white/[0.06]' : 'bg-white border-slate-200 divide-slate-100'
                  }`}
                >
                  {searchResults.length === 0 && !isSearching ? (
                    <div className="p-3 text-center text-xs text-zinc-400">
                      No matching clients found in directory. You can enter details below to feed new client.
                    </div>
                  ) : (
                    searchResults.map((cust) => (
                      <button
                        key={cust.id}
                        type="button"
                        onClick={() => handleSelectCustomer(cust)}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-3 transition-colors group cursor-pointer ${
                          isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className={`text-xs font-semibold group-hover:text-[#FF5C38] transition-colors truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {cust.name || 'Unnamed Client'}
                          </p>
                          <div className={`text-[11px] flex items-center gap-2.5 mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                            <span>📞 {cust.phone || 'No phone'}</span>
                            {cust.address && <span className="truncate">📍 {cust.address}</span>}
                          </div>
                        </div>
                        <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FF5C38]/10 text-[#FF5C38] border border-[#FF5C38]/20">
                          Auto Fill
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {selectedCustomer && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FF5C38]/10 border border-[#FF5C38]/20 text-xs text-[#FF8A65] animate-in fade-in duration-150">
                <div className="flex items-center gap-2 truncate">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate">
                    Selected Existing Client: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{selectedCustomer.name || 'Client'}</strong> ({selectedCustomer.phone || 'No phone'})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleClearSelectedCustomer}
                  className="text-[11px] text-rose-400 hover:text-rose-300 ml-2 shrink-0 underline cursor-pointer"
                >
                  Clear Selection
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={`text-[11px] block mb-1 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>Client Full Name *</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Suresh Kumar"
                    className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs border focus:outline-none focus:border-[#FF5C38] ${
                      isDark ? 'bg-[#181A20] border-white/[0.08] text-white placeholder-zinc-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`text-[11px] block mb-1 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>Phone Number (WhatsApp) *</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. +91 94470 12345"
                    className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs font-mono border focus:outline-none focus:border-[#FF5C38] ${
                      isDark ? 'bg-[#181A20] border-white/[0.08] text-white placeholder-zinc-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`text-[11px] block mb-1 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>Email Address (Optional)</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. suresh@example.com"
                    className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs border focus:outline-none focus:border-[#FF5C38] ${
                      isDark ? 'bg-[#181A20] border-white/[0.08] text-white placeholder-zinc-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`text-[11px] block mb-1 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>Location / Landmark (Kerala)</label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="e.g. Cheruvathur, Near Railway Station"
                    className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs border focus:outline-none focus:border-[#FF5C38] ${
                      isDark ? 'bg-[#181A20] border-white/[0.08] text-white placeholder-zinc-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Auto feed customer checkbox */}
            <label className={`flex items-center gap-2 cursor-pointer pt-1 text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              <input
                type="checkbox"
                checked={feedCustomer}
                onChange={(e) => setFeedCustomer(e.target.checked)}
                className="w-4 h-4 rounded text-[#FF5C38] accent-[#FF5C38] border-zinc-700 bg-zinc-800"
              />
              <span className="flex items-center gap-1 font-medium">
                <span>Automatically sync &amp; list this client in the Admin Customers directory</span>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              </span>
            </label>
          </div>

          {/* 3. Recurrence & Frequency Setup */}
          <div
            className={`p-4 rounded-2xl border space-y-3 ${
              isDark ? 'bg-[#121318] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <span className={`text-xs font-semibold flex items-center gap-1.5 ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
              <Clock className="w-3.5 h-3.5 text-[#FF5C38]" />
              <span>Recurrence Frequency (ആവർത്തന ഇടവേള)</span>
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { val: 'EVERY_3_MONTHS', label: 'Every 3 Months', badge: 'Coconut Plucking' },
                { val: 'MONTHLY', label: 'Monthly', badge: 'Every 30 Days' },
                { val: 'EVERY_2_MONTHS', label: 'Every 2 Months', badge: 'Garden / Lawn' },
                { val: 'EVERY_6_MONTHS', label: 'Every 6 Months', badge: 'Well / Plumbing' },
                { val: 'YEARLY', label: 'Yearly', badge: 'Annual Audit' },
                { val: 'CUSTOM_DAYS', label: 'Custom Interval', badge: 'Set Days' },
                { val: 'ONCE', label: 'One-Time Only', badge: 'Single Task' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setFrequency(opt.val as ReminderFrequency)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    frequency === opt.val
                      ? 'bg-[#FF5C38]/15 border-[#FF5C38] text-white shadow-sm font-semibold'
                      : isDark
                      ? 'bg-[#181A20] border-white/[0.08] text-zinc-400 hover:text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <div className="text-[11px] leading-tight">{opt.label}</div>
                  <div className="text-[9px] text-[#FF5C38] font-mono mt-0.5">{opt.badge}</div>
                </button>
              ))}
            </div>

            {frequency === 'CUSTOM_DAYS' && (
              <div className="flex items-center gap-2 pt-1">
                <label className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>Repeat every:</label>
                <input
                  type="number"
                  min="1"
                  max="730"
                  value={customIntervalDays}
                  onChange={(e) => setCustomIntervalDays(Number(e.target.value))}
                  className={`w-24 rounded-lg px-2.5 py-1 text-xs border focus:outline-none focus:border-[#FF5C38] ${
                    isDark ? 'bg-[#181A20] border-white/[0.08] text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />
                <span className={`text-[11px] ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>days</span>
              </div>
            )}
          </div>

          {/* 4. Dates Scheduling */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              className={`p-4 rounded-2xl border space-y-2 ${
                isDark ? 'bg-[#121318] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <label className={`text-xs font-semibold flex items-center justify-between ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                <span>Next Scheduled Due Date *</span>
                <span className="text-[10px] text-[#FF5C38] font-mono">Reminder Target</span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none focus:border-[#FF5C38] ${
                  isDark ? 'bg-[#181A20] border-white/[0.08] text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
              />
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => applyQuickDueDate(1)}
                  className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                    isDark
                      ? 'bg-[#181A20] hover:bg-white/[0.08] text-zinc-400 hover:text-white border-white/[0.08]'
                      : 'bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200'
                  }`}
                >
                  +1 Month
                </button>
                <button
                  type="button"
                  onClick={() => applyQuickDueDate(3)}
                  className="px-2 py-0.5 rounded text-[10px] bg-[#FF5C38]/10 text-[#FF5C38] hover:bg-[#FF5C38]/20 border border-[#FF5C38]/30 font-semibold"
                >
                  +3 Months (Coconut)
                </button>
                <button
                  type="button"
                  onClick={() => applyQuickDueDate(6)}
                  className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                    isDark
                      ? 'bg-[#181A20] hover:bg-white/[0.08] text-zinc-400 hover:text-white border-white/[0.08]'
                      : 'bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200'
                  }`}
                >
                  +6 Months
                </button>
              </div>
            </div>

            <div
              className={`p-4 rounded-2xl border space-y-2 ${
                isDark ? 'bg-[#121318] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <label className={`text-xs font-semibold flex items-center justify-between ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                <span>Last Serviced Date (Optional)</span>
                <button
                  type="button"
                  onClick={() => setLastServicedDate(formatDateToInput(new Date()))}
                  className="text-[10px] text-[#FF5C38] hover:underline cursor-pointer"
                >
                  Serviced Today
                </button>
              </label>
              <input
                type="date"
                value={lastServicedDate}
                onChange={(e) => setLastServicedDate(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none focus:border-[#FF5C38] ${
                  isDark ? 'bg-[#181A20] border-white/[0.08] text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
              />
              <p className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                Helps calculate the exact gap between plucking and trimming cycles.
              </p>
            </div>
          </div>

          {/* 5. Custom Notes */}
          <div>
            <label className={`text-xs font-semibold block mb-1.5 flex items-center gap-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              <span>Special Notes &amp; Compound Specifications</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 18 coconut trees on eastern plot, prefers Ratheesh worker, call morning 8-10 AM..."
              className={`w-full rounded-xl px-3.5 py-2 text-xs border focus:outline-none focus:border-[#FF5C38] resize-none ${
                isDark ? 'bg-[#121318] border-white/[0.06] text-white placeholder-zinc-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Modal Footer */}
          <div className={`pt-4 border-t flex items-center justify-end gap-3 ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                isDark
                  ? 'text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08]'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-full bg-[#FF5C38] hover:bg-[#FF6B4A] text-white text-xs font-bold shadow-lg shadow-[#FF5C38]/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Reminder...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Save Changes' : 'Confirm & Schedule Reminder'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
