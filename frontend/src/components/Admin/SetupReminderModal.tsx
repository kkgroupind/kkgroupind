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
  Sparkles,
  TreePalm,
  Calendar,
  FileText,
  Loader2,
  CheckCircle2,
  Search,
  Check,
} from 'lucide-react';
import {
  reminderService,
  ServiceReminder,
  ReminderFrequency,
  ReminderStatus,
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
  getServiceImage,
} from './ServiceSelectDropdown';

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
    icon: TreePalm,
    description: 'Quarterly harvesting, crown clearing & pest safety check (Every 3 Months)',
  },
  {
    name: 'Well Cleaning & Disinfection',
    label: 'Well Cleaning & Chlorination (കിണർ ശുചീകരണം)',
    defaultFrequency: 'EVERY_6_MONTHS' as ReminderFrequency,
    icon: CalendarClock,
    description: 'Deep well sludge removal & sanitization (Every 6 Months)',
  },
  {
    name: 'Lawn, Grass Cutting & Garden Maintenance',
    label: 'Garden & Lawn Trimming (പുല്ലുവെട്ട്)',
    defaultFrequency: 'EVERY_2_MONTHS' as ReminderFrequency,
    icon: CalendarClock,
    description: 'Bi-monthly grass trimming, bush shaping & weeding (Every 2 Months)',
  },
  {
    name: 'Solar Panel Cleaning & Maintenance',
    label: 'Solar Panel Wash & Electrical Audit',
    defaultFrequency: 'EVERY_3_MONTHS' as ReminderFrequency,
    icon: CalendarClock,
    description: 'Dust & bird-droppings clearing for solar efficiency (Every 3 Months)',
  },
  {
    name: 'Electrical & Plumbing Preventive Inspection',
    label: 'Home Electrical & Plumbing Safety Audit',
    defaultFrequency: 'EVERY_6_MONTHS' as ReminderFrequency,
    icon: CalendarClock,
    description: 'Semi-annual leak check, MCB test & water motor maintenance',
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

  // Helper to format Date to YYYY-MM-DD input string
  const formatDateToInput = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Prefill or reset on open
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
      // Determine initial service: prefilled or default
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

      // Customer info from prefilledCustomer if provided
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

      // Default due date: exactly 3 months from today
      const defaultNext = new Date();
      defaultNext.setMonth(defaultNext.getMonth() + 3);
      setDueDate(formatDateToInput(defaultNext));

      const today = new Date();
      setLastServicedDate(formatDateToInput(today));
      setNotes('Automated maintenance cycle. Team equipment required.');
      setFeedCustomer(true);
    }
  }, [isOpen, reminderToEdit, dropdownServices, prefilledCustomer, prefilledServiceName]);

  // Handle service change
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

  // Quick preset shortcuts for Due Date
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#14151A] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 bg-[#1A1C23] border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#14151A] border border-gray-800 rounded-xl">
              <CalendarClock className="w-5 h-5 text-[#7B4DFF]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-100 flex items-center gap-2">
                <span>{isEditing ? 'Modify Service Reminder' : 'Setup Service Reminder'}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#7B4DFF]/10 text-[#7B4DFF] border border-[#7B4DFF]/20">
                  Recurring Task
                </span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Automate periodic maintenance cycles like coconut tree plucking every 3 months.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
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
              <div className="mt-2.5 p-3 rounded-xl bg-[#1A1C23] border border-gray-800 space-y-1.5 animate-in fade-in duration-150">
                <label className="text-[11px] font-semibold text-gray-400">
                  Custom Service Name (Specify exact service)
                </label>
                <input
                  type="text"
                  value={customServiceName}
                  onChange={(e) => setCustomServiceName(e.target.value)}
                  placeholder="e.g. Roof Tile Cleaning & Water Proofing..."
                  className="w-full bg-[#14151A] border border-gray-800 focus:border-[#7B4DFF] rounded-xl px-3.5 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none transition-colors"
                />
              </div>
            )}
          </div>

          {/* 2. Client / Customer Details */}
          <div className="p-4 rounded-xl bg-[#1A1C23] border border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-200 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#7B4DFF]" />
                <span>Client &amp; Property Information</span>
              </span>
              <span className="text-[10px] text-gray-400">Search existing or feed new</span>
            </div>

            {/* Quick Search & Select Client */}
            <div className="relative">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="🔍 Quick Search &amp; Select existing client (by Name or Mobile)..."
                  className="w-full bg-[#14151A] border border-gray-800 focus:border-[#7B4DFF] rounded-xl pl-9 pr-8 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none transition-colors"
                />
                {isSearching && (
                  <Loader2 className="w-3.5 h-3.5 text-[#7B4DFF] animate-spin absolute right-3 top-2.5" />
                )}
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && searchQuery.trim().length >= 2 && (
                <div className="absolute z-30 left-0 right-0 mt-1 max-h-52 overflow-y-auto rounded-xl bg-[#171922] border border-gray-700 shadow-2xl custom-scrollbar py-1 divide-y divide-gray-800">
                  {searchResults.length === 0 && !isSearching ? (
                    <div className="p-3 text-center text-xs text-gray-400">
                      No matching clients found in directory. You can enter details below to feed new client.
                    </div>
                  ) : (
                    searchResults.map((cust) => (
                      <button
                        key={cust.id}
                        type="button"
                        onClick={() => handleSelectCustomer(cust)}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-[#252836] flex items-center justify-between gap-3 transition-colors group"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white group-hover:text-[#9E7BFF] transition-colors truncate">
                            {cust.name || 'Unnamed Client'}
                          </p>
                          <div className="text-[11px] text-gray-400 flex items-center gap-2.5 mt-0.5">
                            <span>📞 {cust.phone || 'No phone'}</span>
                            {cust.address && <span className="truncate">📍 {cust.address}</span>}
                          </div>
                        </div>
                        <span className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#7B4DFF]/15 text-[#9E7BFF] border border-[#7B4DFF]/30">
                          Auto Fill
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {selectedCustomer && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#7B4DFF]/10 border border-[#7B4DFF]/30 text-xs text-[#E0D7FE] animate-in fade-in duration-150">
                <div className="flex items-center gap-2 truncate">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate">
                    Selected Existing Client: <strong className="text-white">{selectedCustomer.name || 'Client'}</strong> ({selectedCustomer.phone || 'No phone'})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleClearSelectedCustomer}
                  className="text-[11px] text-red-400 hover:text-red-300 ml-2 shrink-0 underline"
                >
                  Clear Selection
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Client Full Name *</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Suresh Kumar"
                    className="w-full bg-[#14151A] border border-gray-800 focus:border-[#7B4DFF] rounded-xl pl-9 pr-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Phone Number (WhatsApp) *</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. +91 94470 12345"
                    className="w-full bg-[#14151A] border border-gray-800 focus:border-[#7B4DFF] rounded-xl pl-9 pr-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Email Address (Optional)</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. suresh@example.com"
                    className="w-full bg-[#14151A] border border-gray-800 focus:border-[#7B4DFF] rounded-xl pl-9 pr-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Location / Landmark (Kerala)</label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="e.g. Cheruvathur, Near Railway Station"
                    className="w-full bg-[#14151A] border border-gray-800 focus:border-[#7B4DFF] rounded-xl pl-9 pr-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Auto feed customer checkbox */}
            <label className="flex items-center gap-2 cursor-pointer pt-1 text-gray-400 text-[11px]">
              <input
                type="checkbox"
                checked={feedCustomer}
                onChange={(e) => setFeedCustomer(e.target.checked)}
                className="w-4 h-4 rounded text-[#7B4DFF] focus:ring-[#7B4DFF] border-gray-800 bg-[#14151A]"
              />
              <span className="flex items-center gap-1 font-medium">
                <span>Automatically sync &amp; list this client in the Admin Customers directory</span>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              </span>
            </label>
          </div>

          {/* 3. Recurrence & Frequency Setup */}
          <div className="p-4 rounded-xl bg-[#1A1C23] border border-gray-800 space-y-3">
            <span className="text-xs font-semibold text-gray-200 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#7B4DFF]" />
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
                  className={`p-2 rounded-xl border text-center transition-all ${
                    frequency === opt.val
                      ? 'bg-[#7B4DFF]/15 border-[#7B4DFF] text-white shadow-sm font-semibold'
                      : 'bg-[#14151A] border-gray-800 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <div className="text-[11px] leading-tight">{opt.label}</div>
                  <div className="text-[9px] text-[#7B4DFF] font-mono mt-0.5">{opt.badge}</div>
                </button>
              ))}
            </div>

            {frequency === 'CUSTOM_DAYS' && (
              <div className="flex items-center gap-2 pt-1">
                <label className="text-[11px] text-gray-400">Repeat every:</label>
                <input
                  type="number"
                  min="1"
                  max="730"
                  value={customIntervalDays}
                  onChange={(e) => setCustomIntervalDays(Number(e.target.value))}
                  className="w-24 bg-[#14151A] border border-gray-800 rounded-lg px-2.5 py-1 text-xs text-gray-200"
                />
                <span className="text-[11px] text-gray-500">days</span>
              </div>
            )}
          </div>

          {/* 4. Dates Scheduling */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-[#1A1C23] border border-gray-800 space-y-2">
              <label className="text-xs font-semibold text-gray-200 flex items-center justify-between">
                <span>Next Scheduled Due Date *</span>
                <span className="text-[10px] text-[#7B4DFF] font-mono">Reminder Target</span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[#14151A] border border-gray-800 focus:border-[#7B4DFF] rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none transition-colors"
              />
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => applyQuickDueDate(1)}
                  className="px-2 py-0.5 rounded text-[10px] bg-[#14151A] hover:bg-gray-800 text-gray-400 hover:text-gray-200 border border-gray-800"
                >
                  +1 Month
                </button>
                <button
                  type="button"
                  onClick={() => applyQuickDueDate(3)}
                  className="px-2 py-0.5 rounded text-[10px] bg-[#7B4DFF]/10 text-[#7B4DFF] hover:bg-[#7B4DFF]/20 border border-[#7B4DFF]/30 font-semibold"
                >
                  +3 Months (Coconut)
                </button>
                <button
                  type="button"
                  onClick={() => applyQuickDueDate(6)}
                  className="px-2 py-0.5 rounded text-[10px] bg-[#14151A] hover:bg-gray-800 text-gray-400 hover:text-gray-200 border border-gray-800"
                >
                  +6 Months
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#1A1C23] border border-gray-800 space-y-2">
              <label className="text-xs font-semibold text-gray-200 flex items-center justify-between">
                <span>Last Serviced Date (Optional)</span>
                <button
                  type="button"
                  onClick={() => setLastServicedDate(formatDateToInput(new Date()))}
                  className="text-[10px] text-[#7B4DFF] hover:underline"
                >
                  Serviced Today
                </button>
              </label>
              <input
                type="date"
                value={lastServicedDate}
                onChange={(e) => setLastServicedDate(e.target.value)}
                className="w-full bg-[#14151A] border border-gray-800 focus:border-[#7B4DFF] rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none transition-colors"
              />
              <p className="text-[10px] text-gray-500">
                Helps calculate the exact gap between plucking and trimming cycles.
              </p>
            </div>
          </div>

          {/* 5. Custom Notes & Tree Specs */}
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-gray-500" />
              <span>Special Notes &amp; Compound Specifications</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 18 coconut trees on eastern plot, prefers Ratheesh worker, call morning 8-10 AM..."
              className="w-full bg-[#1A1C23] border border-gray-800 focus:border-[#7B4DFF] rounded-xl px-3.5 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-gray-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-[#1A1C23] hover:bg-gray-800 border border-gray-800 text-gray-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-[#7B4DFF] hover:bg-[#6A3DEE] text-white text-xs font-medium shadow-[0_0_15px_rgba(123,77,255,0.3)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
