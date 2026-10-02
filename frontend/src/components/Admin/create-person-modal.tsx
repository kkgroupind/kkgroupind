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
  const [emailStatus, setEmailStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'error'
  >('idle');
  const emailDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Existing customer match detection
  const [existingCustomerMatch, setExistingCustomerMatch] = useState<{
    id: string;
    name: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
  } | null>(null);

  const isCustomer = role === 'CUSTOMER';
  const roleLabel =
    role === 'WORKER'
      ? 'Worker'
      : role === 'OFFICE_STAFF'
      ? 'Office Staff'
      : 'Customer';

  const formatPhoneWithCountryCode = (phone: string): string => {
    const trimmed = phone.trim();
    if (!trimmed) return '';
    const digits = trimmed.replace(/\D/g, '');
    if (digits.length === 10) return `+91${digits}`;
    if (digits.length === 11 && digits.startsWith('0')) return `+91${digits.slice(1)}`;
    if (digits.length === 12 && digits.startsWith('91')) return `+91${digits.slice(2)}`;
    if (trimmed.startsWith('+')) return `+${digits}`;
    if (digits.length > 10) return `+91${digits.slice(-10)}`;
    return digits ? `+91${digits}` : trimmed;
  };

  // Load workers and services on modal open if customer
  useEffect(() => {
    if (!isOpen || !token || !isCustomer) return;

    api
      .getActiveWorkers(token)
      .then((res) => setWorkers(res?.workers || []))
      .catch(() => null);

    api.reminder
      .listServiceConfigs(token)
      .then((res) => setServiceConfigs(res.services))
      .catch(() => null);
  }, [isOpen, token, isCustomer]);

  // Debounced username check (if not auto-credentials)
  useEffect(() => {
    if (isCustomer && autoCredentials) return;

    if (usernameDebounceRef.current) {
      clearTimeout(usernameDebounceRef.current);
    }

    const clean = username.trim().toLowerCase();
    if (!clean || clean.length < 3) {
      setUsernameStatus('idle');
      setUsernameSuggestions([]);
      return;
    }

    setUsernameStatus('checking');

    usernameDebounceRef.current = setTimeout(async () => {
      try {
        const res = await api.checkUsername(clean, token);
        if (res.isAvailable) {
          setUsernameStatus('available');
          setUsernameSuggestions([]);
        } else {
          setUsernameStatus('taken');
          setUsernameSuggestions(res.suggestions || []);
        }
      } catch (err) {
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
      } catch (err) {
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
          // Autofill empty fields from existing profile
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
      setError('Please enter a full name.');
      return;
    }

    if (!finalMobile) {
      setError('Please enter a mobile phone number.');
      return;
    }

    if (isCustomer) {
      // CUSTOMER FEEDING FLOW
      if (addService && !serviceName.trim()) {
        setError('Please select a service from the service dropdown.');
        return;
      }

      if (!autoCredentials) {
        if (!username.trim() || username.trim().length < 3) {
          setError('Username must be at least 3 characters long.');
          return;
        }
        if (usernameStatus === 'taken') {
          setError('The chosen username is already taken. Please pick another.');
          return;
        }
        if (password.length < 8) {
          setError('Password must be at least 8 characters long.');
          return;
        }
      }

      const normalizedMobile = formatPhoneWithCountryCode(finalMobile);
      setIsLoading(true);
      try {
        await api.feedCustomer(
          {
            name: finalName,
            mobileNumber: normalizedMobile,
            email: finalEmail || undefined,
            address: address.trim() || undefined,
            district,
            username: autoCredentials ? undefined : username.trim().toLowerCase(),
            password: autoCredentials ? undefined : password,
            addService,
            serviceName: addService ? serviceName.trim() : undefined,
            serviceDate: addService && serviceDate ? new Date(serviceDate).toISOString() : undefined,
            serviceStatus: addService ? serviceStatus : undefined,
            serviceCost: addService && serviceCost ? Number(serviceCost) : undefined,
            serviceNotes: addService && serviceNotes.trim() ? serviceNotes.trim() : undefined,
            addWorker: addService && addWorker && Boolean(selectedWorkerId),
            workerId: addService && addWorker && selectedWorkerId ? selectedWorkerId : undefined,
          },
          token,
        );

        // Reset form
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
        setError(err.message || 'Failed to feed customer profile');
      } finally {
        setIsLoading(false);
      }
    } else {
      // STANDARD WORKER / STAFF CREATION
      const finalUsername = username.trim().toLowerCase();
      if (!finalUsername || finalUsername.length < 3) {
        setError('Username must be at least 3 characters long.');
        return;
      }

      if (usernameStatus === 'taken') {
        setError('The chosen username is already taken.');
        return;
      }

      if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
      }

      setIsLoading(true);
      try {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div
        className={`bg-[#14151A] border border-gray-800 rounded-2xl w-full ${
          isCustomer ? 'max-w-2xl' : 'max-w-lg'
        } overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-auto`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-800/60 bg-[#16181F]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#14151A] border border-gray-800 rounded-xl">
              <Sparkles className="w-5 h-5 text-[#7B4DFF]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-100 flex items-center gap-2">
                <span>{isCustomer ? 'Feed & Onboard Customer' : `Add New ${roleLabel}`}</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {isCustomer
                  ? 'Register customer profile with service order & auto-scheduled reminders'
                  : `Add ${roleLabel.toLowerCase()} with credentials & phone`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-gray-400 hover:text-gray-200 transition-colors bg-[#1A1C23] hover:bg-[#232630] rounded-xl border border-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Section: Customer Details */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 1. Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-[#7B4DFF]">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#1A1C23] border border-gray-800 rounded-xl text-xs sm:text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#7B4DFF] transition-colors"
                    placeholder="e.g. Ashraf K"
                    required
                  />
                </div>
              </div>

              {/* 2. Mobile Number */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Mobile Number <span className="text-[#7B4DFF]">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#1A1C23] border border-gray-800 rounded-xl text-xs sm:text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#7B4DFF] transition-colors font-mono"
                    placeholder="e.g. +91 94470 12345"
                    required
                  />
                </div>
                {existingCustomerMatch && (
                  <div className="mt-1.5 p-2 rounded-lg bg-[#7B4DFF]/15 border border-[#7B4DFF]/35 text-[11px] text-[#E0D7FE] flex items-center justify-between gap-2 animate-in fade-in duration-150">
                    <div className="flex items-center gap-1.5 truncate">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">
                        Existing Client Found: <strong className="text-white">{existingCustomerMatch.name || 'Client'}</strong>. Submitting will update profile &amp; record service under this account.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 3. Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Email Address {isCustomer && <span className="text-gray-500 font-normal lowercase">(optional)</span>}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#1A1C23] border border-gray-800 rounded-xl text-xs sm:text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#7B4DFF] transition-colors"
                    placeholder="customer@example.com"
                  />
                </div>
              </div>

              {/* 4. Address */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Property / Residence Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#1A1C23] border border-gray-800 rounded-xl text-xs sm:text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#7B4DFF] transition-colors"
                    placeholder="e.g. Melparamba, Kasaragod"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CUSTOMER TOGGLE 1: Record Service / Job Order */}
          {isCustomer && (
            <div className="p-4 rounded-2xl bg-[#1A1C23] border border-gray-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-[#7B4DFF]/15 text-[#7B4DFF]">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-100 block">
                      Record Service He Chose (Work Order)
                    </span>
                    <span className="text-[11px] text-gray-500 block">
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
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7B4DFF]"></div>
                </label>
              </div>

              {addService && (
                <div className="space-y-3 pt-3 border-t border-gray-800/80 animate-in fade-in">
                  {/* Service Selection Image Dropdown */}
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
                      <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                        Service Date
                      </label>
                      <input
                        type="date"
                        value={serviceDate}
                        onChange={(e) => setServiceDate(e.target.value)}
                        className="w-full bg-[#14151A] border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#7B4DFF]"
                        required={addService}
                      />
                    </div>

                    {/* Job Status */}
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                        Status
                      </label>
                      <select
                        value={serviceStatus}
                        onChange={(e) => setServiceStatus(e.target.value as any)}
                        className="w-full bg-[#14151A] border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#7B4DFF]"
                      >
                        <option value="COMPLETED">Completed (Triggers Reminder)</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="PENDING">Scheduled / Pending</option>
                      </select>
                    </div>

                    {/* Cost */}
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                        Billed Fee (₹)
                      </label>
                      <input
                        type="number"
                        value={serviceCost}
                        onChange={(e) => setServiceCost(e.target.value)}
                        placeholder="e.g. 1200"
                        className="w-full bg-[#14151A] border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#7B4DFF]"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                      Job Scope &amp; Notes
                    </label>
                    <input
                      type="text"
                      value={serviceNotes}
                      onChange={(e) => setServiceNotes(e.target.value)}
                      placeholder="e.g. Harvested 15 palm trees. Motor wire checked."
                      className="w-full bg-[#14151A] border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#7B4DFF]"
                    />
                  </div>

                  {/* TOGGLE 2: Assign Worker Who Went */}
                  <div className="p-3 rounded-xl bg-[#14151A] border border-gray-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-[#7B4DFF]" />
                        <span className="text-xs font-semibold text-gray-200">
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
                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#7B4DFF]"></div>
                      </label>
                    </div>

                    {addWorker && (
                      <div className="pt-2 border-t border-gray-800/60 animate-in fade-in">
                        <select
                          value={selectedWorkerId}
                          onChange={(e) => setSelectedWorkerId(e.target.value)}
                          className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#7B4DFF]"
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

          {/* Credentials Section for Customer vs Staff */}
          {isCustomer ? (
            <div className="p-3.5 rounded-xl bg-[#1A1C23] border border-gray-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs font-semibold text-gray-200">
                    Auto-Generate Customer Password &amp; Username
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={autoCredentials}
                  onChange={(e) => setAutoCredentials(e.target.checked)}
                  className="w-4 h-4 rounded text-[#7B4DFF] bg-gray-800 border-gray-700"
                />
              </div>

              {!autoCredentials && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-800/60 animate-in fade-in">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. ashraf_k"
                      className="w-full bg-[#14151A] border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#7B4DFF]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 8 chars"
                      className="w-full bg-[#14151A] border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#7B4DFF]"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Standard Username */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Username <span className="text-[#7B4DFF]">*</span>
                </label>
                <div className="relative">
                  <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#1A1C23] border border-gray-800 rounded-xl text-xs sm:text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#7B4DFF] transition-colors"
                    placeholder="e.g. john_doe"
                    required
                  />
                </div>
              </div>

              {/* Standard Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Temporary Password <span className="text-[#7B4DFF]">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#1A1C23] border border-gray-800 rounded-xl text-xs sm:text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#7B4DFF] transition-colors"
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
              className="w-full py-3 bg-[#7B4DFF] hover:bg-[#6A3DEE] text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(123,77,255,0.25)] disabled:opacity-50 cursor-pointer text-xs sm:text-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Feeding Customer Data...</span>
                </>
              ) : (
                <span>
                  {isCustomer ? 'Feed & Save Customer Profile' : `Create ${roleLabel} Account`}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
