'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  User,
  Phone,
  Mail,
  Lock,
  AtSign,
  MapPin,
  Briefcase,
} from 'lucide-react';
import { api } from '@/services';
import { useAdminTheme } from '@/context/admin-theme-context';
import {
  ServiceSelectDropdown,
  ServiceSelectOption,
} from './ServiceSelectDropdown';

interface CreatePersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'WORKER' | 'OFFICE_STAFF' | 'CUSTOMER';
  token: string;
  onSuccess: () => void;
}

export function CreatePersonModal({
  isOpen,
  onClose,
  role,
  token,
  onSuccess,
}: CreatePersonModalProps) {
  const { isDark } = useAdminTheme();

  // Standard fields
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Customer feeding enhanced fields
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('Kasaragod');
  const [autoCredentials, setAutoCredentials] = useState(true);

  // Service toggle & details
  const [addService, setAddService] = useState(false);
  const [serviceName, setServiceName] = useState('');
  const [serviceDate, setServiceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [serviceStatus, setServiceStatus] = useState<'COMPLETED' | 'IN_PROGRESS' | 'PENDING'>('COMPLETED');
  const [serviceCost, setServiceCost] = useState('');
  const [serviceNotes, setServiceNotes] = useState('');

  // Worker toggle & assignment
  const [addWorker, setAddWorker] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');

  // External data
  const [workers, setWorkers] = useState<any[]>([]);
  const [serviceConfigs, setServiceConfigs] = useState<ServiceSelectOption[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Real-time username check state
  const [usernameStatus, setUsernameStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'error'
  >('idle');
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const usernameDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Real-time email check state
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'error'>('idle');
  const emailDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Existing customer match
  const [existingCustomerMatch, setExistingCustomerMatch] = useState<{ id: string; name: string | null; email?: string | null; address?: string | null } | null>(null);

  const isCustomer = role === 'CUSTOMER';
  const roleLabel = role === 'WORKER' ? 'Worker' : role === 'OFFICE_STAFF' ? 'Office Staff' : 'Customer';

  // Load workers & service configs when customer modal is opened
  useEffect(() => {
    if (isCustomer && isOpen && token) {
      api.listPeople(token, { role: 'WORKER', limit: 100 }).then((res) => {
        setWorkers(res.data || []);
      }).catch(console.error);

      api.reminder
        .listServiceConfigs(token)
        .then((res: any) => setServiceConfigs(res.services || []))
        .catch(() => null);
    }
  }, [isCustomer, isOpen, token]);

  // Debounced username check
  useEffect(() => {
    if (usernameDebounceRef.current) {
      clearTimeout(usernameDebounceRef.current);
    }

    if (!username.trim() || username.length < 3 || (isCustomer && autoCredentials)) {
      setUsernameStatus('idle');
      setUsernameSuggestions([]);
      return;
    }

    setUsernameStatus('checking');

    usernameDebounceRef.current = setTimeout(async () => {
      try {
        const res = await api.checkUsername(username.trim(), token);
        if (res.isAvailable) {
          setUsernameStatus('available');
          setUsernameSuggestions([]);
        } else {
          setUsernameStatus('taken');
          setUsernameSuggestions(res.suggestions || []);
        }
      } catch {
        setUsernameStatus('error');
        setUsernameSuggestions([]);
      }
    }, 400);

    return () => {
      if (usernameDebounceRef.current) {
        clearTimeout(usernameDebounceRef.current);
      }
    };
  }, [username, token, isCustomer, autoCredentials]);

  // Debounced email check
  useEffect(() => {
    if (emailDebounceRef.current) {
      clearTimeout(emailDebounceRef.current);
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setEmailStatus('idle');
      return;
    }

    setEmailStatus('checking');

    emailDebounceRef.current = setTimeout(async () => {
      try {
        const res = await api.checkEmail(cleanEmail, token);
        if (res.isAvailable) {
          setEmailStatus('available');
        } else {
          setEmailStatus('taken');
        }
      } catch {
        setEmailStatus('error');
      }
    }, 400);

    return () => {
      if (emailDebounceRef.current) {
        clearTimeout(emailDebounceRef.current);
      }
    };
  }, [email, token]);

  // Live lookup to check if customer already exists by mobile number
  useEffect(() => {
    if (!isCustomer || !token || !isOpen) {
      setExistingCustomerMatch(null);
      return;
    }
    const cleanDigits = mobileNumber.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      setExistingCustomerMatch(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await api.searchCustomers(cleanDigits.slice(-10), token);
        const match = results?.find((c) => {
          const cDigits = (c.phone || '').replace(/\D/g, '');
          return cDigits.endsWith(cleanDigits.slice(-10)) || cleanDigits.endsWith(cDigits.slice(-10));
        });

        if (match) {
          setExistingCustomerMatch(match);
          setName((prev) => (!prev.trim() && match.name ? match.name : prev));
          setAddress((prev) => (!prev.trim() && match.address ? match.address : prev));
          setEmail((prev) => (!prev.trim() && match.email ? match.email : prev));
        } else {
          setExistingCustomerMatch(null);
        }
      } catch {
        setExistingCustomerMatch(null);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [mobileNumber, isCustomer, token, isOpen]);

  if (!isOpen) return null;

  const handleSelectSuggestion = (suggested: string) => {
    setUsername(suggested);
    setUsernameStatus('available');
    setUsernameSuggestions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const finalName = name.trim();
    const finalMobile = mobileNumber.trim();
    const finalEmail = email.trim().toLowerCase();

    if (!finalName) {
      setError('Full Name is required.');
      return;
    }

    if (!finalMobile) {
      setError('Mobile Number is required.');
      return;
    }

    const cleanPhoneDigits = finalMobile.replace(/\D/g, '');
    if (cleanPhoneDigits.length < 10) {
      setError('Please provide a valid 10-digit mobile number.');
      return;
    }

    const formatPhoneWithCountryCode = (raw: string) => {
      const digits = raw.replace(/\D/g, '');
      if (digits.length === 10) return `+91${digits}`;
      if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
      return raw.startsWith('+') ? raw : `+${digits}`;
    };

    setIsLoading(true);

    if (isCustomer) {
      try {
        const last10 = cleanPhoneDigits.slice(-10);
        const autoUser = autoCredentials
          ? `${finalName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'cust'}_${last10.slice(-4)}`
          : username.trim();
        const autoPass = autoCredentials ? `Pass@${last10.slice(-4)}` : password;

        const payload: any = {
          name: finalName,
          mobileNumber: formatPhoneWithCountryCode(finalMobile),
          email: finalEmail || undefined,
          address: address.trim() || undefined,
          district: district || undefined,
          username: autoUser,
          password: autoPass,
        };

        if (addService && serviceName.trim()) {
          payload.serviceDetails = {
            serviceName: serviceName.trim(),
            serviceDate: serviceDate || new Date().toISOString().split('T')[0],
            status: serviceStatus,
            cost: serviceCost ? parseFloat(serviceCost) : undefined,
            notes: serviceNotes.trim() || undefined,
            assignedWorkerId: addWorker && selectedWorkerId ? selectedWorkerId : undefined,
          };
        }

        await api.feedCustomer(payload, token);

        setName('');
        setMobileNumber('');
        setEmail('');
        setAddress('');
        setUsername('');
        setPassword('');
        setAddService(false);
        setServiceName('');
        setServiceCost('');
        setServiceNotes('');
        setAddWorker(false);
        setSelectedWorkerId('');
        onSuccess();
        onClose();
      } catch (err: any) {
        setError(err.message || 'Failed to feed customer');
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!username.trim()) {
        setError('Username is required.');
        setIsLoading(false);
        return;
      }
      if (!password || password.length < 8) {
        setError('Password must be at least 8 characters long.');
        setIsLoading(false);
        return;
      }

      try {
        const finalUsername = username.trim();
        await api.createPerson(
          {
            name: finalName,
            mobileNumber: formatPhoneWithCountryCode(finalMobile),
            username: finalUsername,
            password,
            role,
            email: finalEmail || undefined,
          },
          token,
        );

        setName('');
        setMobileNumber('');
        setEmail('');
        setUsername('');
        setPassword('');
        onSuccess();
        onClose();
      } catch (err: any) {
        setError(err.message || 'Failed to create person');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div
        className={`w-full ${
          isCustomer ? 'max-w-2xl' : 'max-w-lg'
        } overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-auto rounded-[28px] border ${
          isDark ? 'bg-[#12141A] border-white/[0.08]' : 'bg-white border-slate-200'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-5 sm:p-6 border-b ${
            isDark ? 'bg-[#161922] border-white/[0.06]' : 'bg-slate-50 border-slate-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-2xl border ${
                isDark ? 'bg-[#181A20] border-white/[0.08]' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <Sparkles className="w-5 h-5 text-[#6366F1]" />
            </div>
            <div>
              <h2
                className={`text-lg sm:text-xl font-bold flex items-center gap-2 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                <span>{isCustomer ? 'Add New Customer' : `Add New ${roleLabel}`}</span>
              </h2>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                {isCustomer
                  ? 'Create customer account, book initial service, or setup automatic reminders'
                  : `Add ${roleLabel.toLowerCase()} with credentials & phone`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className={`p-2 rounded-full transition-colors ${
              isDark
                ? 'text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08]'
                : 'text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Section: Customer Details */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 1. Name */}
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                  Full Name <span className="text-[#FF5C38]">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm transition-colors border focus:outline-none focus:border-[#FF5C38] focus:ring-1 focus:ring-[#FF5C38]/20 ${
                      isDark
                        ? 'bg-[#121318] border-white/[0.06] text-white placeholder-zinc-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                    placeholder="e.g. Ashraf K"
                    required
                  />
                </div>
              </div>

              {/* 2. Mobile Number */}
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                  Mobile Number <span className="text-[#FF5C38]">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm font-mono transition-colors border focus:outline-none focus:border-[#FF5C38] focus:ring-1 focus:ring-[#FF5C38]/20 ${
                      isDark
                        ? 'bg-[#121318] border-white/[0.06] text-white placeholder-zinc-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                    placeholder="e.g. +91 94470 12345"
                    required
                  />
                </div>
                {existingCustomerMatch && (
                  <div className="mt-1.5 p-2 rounded-xl bg-[#FF5C38]/10 border border-[#FF5C38]/20 text-[11px] text-[#FF5C38] flex items-center justify-between gap-2 animate-in fade-in duration-150">
                    <div className="flex items-center gap-1.5 truncate">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">
                        Existing Client Found: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{existingCustomerMatch.name || 'Client'}</strong>.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 3. Email */}
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                  Email Address {isCustomer && <span className="text-zinc-500 font-normal lowercase">(optional)</span>}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm transition-colors border focus:outline-none focus:border-[#FF5C38] focus:ring-1 focus:ring-[#FF5C38]/20 ${
                      isDark
                        ? 'bg-[#121318] border-white/[0.06] text-white placeholder-zinc-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                    placeholder="customer@example.com"
                  />
                </div>
              </div>

              {/* 4. Address */}
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                  Property / Residence Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm transition-colors border focus:outline-none focus:border-[#FF5C38] focus:ring-1 focus:ring-[#FF5C38]/20 ${
                      isDark
                        ? 'bg-[#121318] border-white/[0.06] text-white placeholder-zinc-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                    placeholder="e.g. Melparamba, Kasaragod"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CUSTOMER TOGGLE 1: Record Service / Job Order */}
          {isCustomer && (
            <div
              className={`p-4 rounded-2xl border space-y-3 ${
                isDark ? 'bg-[#121318] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#FF5C38]/10 text-[#FF5C38]">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <span className={`text-xs font-bold block ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
                      Record Service Selected (Work Order)
                    </span>
                    <span className={`text-[11px] block ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Feeds the completed job and automatically creates next cyclic reminder
                    </span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addService}
                    onChange={(e) => setAddService(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF5C38]"></div>
                </label>
              </div>

              {addService && (
                <div className={`space-y-3 pt-3 border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-200'} animate-in fade-in`}>
                  <ServiceSelectDropdown
                    label="Service Performed / Scheduled"
                    services={serviceConfigs}
                    selectedServiceId={serviceName}
                    onSelect={(val) => {
                      const match = serviceConfigs.find((s) => s.id === val || s.name === val);
                      setServiceName(match ? match.name : val);
                    }}
                    placeholder="Select service (Coconut, Well, Solar, JCB, Electrical...)"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Service Date */}
                    <div>
                      <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                        Service Date
                      </label>
                      <input
                        type="date"
                        value={serviceDate}
                        onChange={(e) => setServiceDate(e.target.value)}
                        className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none focus:border-[#FF5C38] ${
                          isDark ? 'bg-[#181A20] border-white/[0.08] text-white' : 'bg-white border-slate-200 text-slate-900'
                        }`}
                        required={addService}
                      />
                    </div>

                    {/* Job Status */}
                    <div>
                      <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                        Status
                      </label>
                      <select
                        value={serviceStatus}
                        onChange={(e) => setServiceStatus(e.target.value as any)}
                        className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none focus:border-[#FF5C38] ${
                          isDark ? 'bg-[#181A20] border-white/[0.08] text-white' : 'bg-white border-slate-200 text-slate-900'
                        }`}
                      >
                        <option value="COMPLETED">Completed (Triggers Reminder)</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="PENDING">Scheduled / Pending</option>
                      </select>
                    </div>

                    {/* Cost */}
                    <div>
                      <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                        Billed Fee (₹)
                      </label>
                      <input
                        type="number"
                        value={serviceCost}
                        onChange={(e) => setServiceCost(e.target.value)}
                        placeholder="e.g. 1200"
                        className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none focus:border-[#FF5C38] ${
                          isDark ? 'bg-[#181A20] border-white/[0.08] text-white' : 'bg-white border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                      Job Scope &amp; Notes
                    </label>
                    <input
                      type="text"
                      value={serviceNotes}
                      onChange={(e) => setServiceNotes(e.target.value)}
                      placeholder="e.g. Harvested 15 palm trees. Motor wire checked."
                      className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none focus:border-[#FF5C38] ${
                        isDark ? 'bg-[#181A20] border-white/[0.08] text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  {/* TOGGLE 2: Assign Worker Who Went */}
                  <div className={`p-3 rounded-xl border space-y-2 ${isDark ? 'bg-[#181A20] border-white/[0.06]' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-[#FF5C38]" />
                        <span className={`text-xs font-semibold ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                          Worker Who Went for the Service
                        </span>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={addWorker}
                          onChange={(e) => setAddWorker(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF5C38]"></div>
                      </label>
                    </div>

                    {addWorker && (
                      <div className={`pt-2 border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-100'} animate-in fade-in`}>
                        <select
                          value={selectedWorkerId}
                          onChange={(e) => setSelectedWorkerId(e.target.value)}
                          className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none focus:border-[#FF5C38] ${
                            isDark ? 'bg-[#121318] border-white/[0.06] text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        >
                          <option value="">-- Choose Assigned Worker --</option>
                          {workers.map((w) => (
                            <option key={w.id} value={w.id}>
                              {w.name || w.phone} ({w.phone})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Credentials Section */}
          {isCustomer ? (
            <div className={`p-4 rounded-2xl border space-y-2.5 ${isDark ? 'bg-[#121318] border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-zinc-400" />
                  <span className={`text-xs font-semibold ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                    Auto-Generate Customer Password &amp; Username
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={autoCredentials}
                  onChange={(e) => setAutoCredentials(e.target.checked)}
                  className="w-4 h-4 rounded text-[#FF5C38] accent-[#FF5C38] bg-zinc-800 border-zinc-700"
                />
              </div>

              {!autoCredentials && (
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-200'} animate-in fade-in`}>
                  <div>
                    <label className={`block text-[11px] mb-1 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. ashraf_k"
                      className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none focus:border-[#FF5C38] ${
                        isDark ? 'bg-[#181A20] border-white/[0.08] text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[11px] mb-1 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 8 chars"
                      className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none focus:border-[#FF5C38] ${
                        isDark ? 'bg-[#181A20] border-white/[0.08] text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Standard Username */}
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                  Username <span className="text-[#FF5C38]">*</span>
                </label>
                <div className="relative">
                  <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm transition-colors border focus:outline-none focus:border-[#FF5C38] focus:ring-1 focus:ring-[#FF5C38]/20 ${
                      isDark
                        ? 'bg-[#121318] border-white/[0.06] text-white placeholder-zinc-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                    placeholder="e.g. john_doe"
                    required
                  />
                </div>
                {usernameSuggestions.length > 0 && (
                  <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-zinc-400">Suggestions:</span>
                    {usernameSuggestions.map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => handleSelectSuggestion(sug)}
                        className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#FF5C38]/10 text-[#FF5C38] border border-[#FF5C38]/20 hover:bg-[#FF5C38]/20 transition-colors"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Standard Password */}
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                  Temporary Password <span className="text-[#FF5C38]">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm transition-colors border focus:outline-none focus:border-[#FF5C38] focus:ring-1 focus:ring-[#FF5C38]/20 ${
                      isDark
                        ? 'bg-[#121318] border-white/[0.06] text-white placeholder-zinc-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#FF5C38] hover:bg-[#FF6B4A] text-white font-semibold rounded-full transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#FF5C38]/25 disabled:opacity-50 cursor-pointer text-xs sm:text-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>
                  {isCustomer ? 'Onboard & Save Customer Profile' : `Create ${roleLabel} Account`}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
