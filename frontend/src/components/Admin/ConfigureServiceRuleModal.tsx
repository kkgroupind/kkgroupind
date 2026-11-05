'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Settings2,
  Check,
} from 'lucide-react';
import {
  reminderService,
  ServiceReminderConfig,
  ReminderFrequency,
} from '@/services/reminder.service';
import { ServiceSelectDropdown } from './ServiceSelectDropdown';
import { useAdminTheme } from '@/context/admin-theme-context';

interface ConfigureServiceRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  token: string;
  initialServiceId?: string | null;
}

const FREQUENCY_OPTIONS: {
  value: ReminderFrequency;
  label: string;
  sublabel: string;
}[] = [
  {
    value: 'EVERY_3_MONTHS',
    label: 'Every 3 Months (Quarterly)',
    sublabel: 'Standard cycle for Coconut tree plucking & crown maintenance (തേങ്ങയിടൽ)',
  },
  {
    value: 'EVERY_6_MONTHS',
    label: 'Every 6 Months (Semi-Annual)',
    sublabel: 'Recommended for traditional well cleaning & water tank sanitization (കിണർ ശുചീകരണം)',
  },
  {
    value: 'EVERY_2_MONTHS',
    label: 'Every 2 Months (Bi-Monthly)',
    sublabel: 'Ideal for lawn grass cutting, garden trimming & weed clearing (പുല്ലുവെട്ട്)',
  },
  {
    value: 'MONTHLY',
    label: 'Monthly (Every Month)',
    sublabel: 'Frequent checkups, equipment filtration & high-turnover servicing',
  },
  {
    value: 'YEARLY',
    label: 'Yearly (Annual)',
    sublabel: 'Annual weather-shield repainting, structural & deep monsoon inspection',
  },
  {
    value: 'CUSTOM_DAYS',
    label: 'Custom Interval (Specify Days)',
    sublabel: 'Specify exact recurrence interval in days (e.g. 45 or 90 days)',
  },
];

export function ConfigureServiceRuleModal({
  isOpen,
  onClose,
  onSuccess,
  token,
  initialServiceId,
}: ConfigureServiceRuleModalProps) {
  const { isDark } = useAdminTheme();

  const [services, setServices] = useState<ServiceReminderConfig[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [hasReminder, setHasReminder] = useState<boolean>(true);
  const [frequency, setFrequency] = useState<ReminderFrequency>('EVERY_3_MONTHS');
  const [customDays, setCustomDays] = useState<number>(90);

  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch available services
  useEffect(() => {
    if (!isOpen || !token) return;

    let isMounted = true;
    setIsLoadingServices(true);
    setErrorMessage('');

    reminderService
      .listServiceConfigs(token)
      .then((res) => {
        if (!isMounted) return;
        setServices(res.services);

        const target = initialServiceId
          ? res.services.find((s) => s.id === initialServiceId || s.serviceId === initialServiceId)
          : res.services.find((s) => s.name.toLowerCase().includes('coco')) || res.services[0];

        if (target) {
          setSelectedServiceId(target.id);
          setHasReminder(target.hasReminder ?? true);
          setFrequency(target.reminderFrequency || 'EVERY_3_MONTHS');
          setCustomDays(target.reminderIntervalDays || 90);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to load services for reminder config:', err);
          setErrorMessage('Failed to load service list. Please check your connection.');
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingServices(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, token, initialServiceId]);

  const handleServiceChange = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const svc = services.find((s) => s.id === serviceId);
    if (svc) {
      setHasReminder(svc.hasReminder ?? true);
      setFrequency(svc.reminderFrequency || 'EVERY_3_MONTHS');
      setCustomDays(svc.reminderIntervalDays || 90);
    }
  };

  const currentService = services.find((s) => s.id === selectedServiceId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceId) {
      setErrorMessage('Please select a service.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await reminderService.updateServiceConfig(token, selectedServiceId, {
        hasReminder,
        reminderFrequency: frequency,
        reminderIntervalDays: frequency === 'CUSTOM_DAYS' ? Number(customDays) : undefined,
      });

      onSuccess(
        res.message ||
          `Reminder automation for ${currentService?.name || 'service'} configured successfully!`,
      );
      onClose();
    } catch (err: any) {
      console.error('Failed to save service reminder configuration:', err);
      setErrorMessage(err.message || 'Failed to update reminder rule. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div
        className={`relative w-full max-w-xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 rounded-[28px] border ${
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
              className={`p-2.5 rounded-2xl border flex items-center justify-center text-[#FF5C38] ${
                isDark ? 'bg-[#181A20] border-white/[0.08]' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <span>Reminder Rule for Service</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FF5C38]/10 text-[#FF5C38] border border-[#FF5C38]/20">
                  Auto-Schedule
                </span>
              </h3>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Automatically set a reminder for the customer when this service is completed
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

        {/* Informational Guidance Banner */}
        <div
          className={`p-3.5 mx-5 mt-4 rounded-2xl border flex items-start gap-2.5 text-xs ${
            isDark
              ? 'bg-[#FF5C38]/10 border-[#FF5C38]/20 text-[#FF8A65]'
              : 'bg-[#FF5C38]/5 border-[#FF5C38]/20 text-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#FF5C38] shrink-0 mt-0.5" />
          <span>
            When a customer books this service and the work order is marked <strong>COMPLETED</strong>,
            Antigravity automatically calculates the next due date and registers the reminder in your
            reminders list with direct 1-click WhatsApp outreach.
          </span>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-5 mt-3 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* 1. Select Service */}
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
              Select Service to Configure <span className="text-[#FF5C38]">*</span>
            </label>

            {isLoadingServices ? (
              <div
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs ${
                  isDark ? 'bg-[#121318] border-white/[0.06] text-zinc-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <Loader2 className="w-4 h-4 animate-spin text-[#FF5C38]" />
                <span>Loading available services...</span>
              </div>
            ) : (
              <ServiceSelectDropdown
                services={services}
                selectedServiceId={selectedServiceId}
                onSelect={handleServiceChange}
                placeholder="Choose a service to automate..."
                showFrequencyBadge={true}
                showClientCount={true}
              />
            )}
          </div>

          {/* 2. Automation Enable Toggle */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
              isDark ? 'bg-[#121318] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div>
              <div className={`text-xs font-bold flex items-center gap-2 ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                <span>Auto-Create Reminder on Job Completion</span>
                {hasReminder && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </div>
              <p className={`text-[11px] mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Automatically add completed clients to the cyclic follow-up queue
              </p>
            </div>

            <button
              type="button"
              onClick={() => setHasReminder(!hasReminder)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                hasReminder ? 'bg-[#FF5C38]' : isDark ? 'bg-zinc-700' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  hasReminder ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 3. Recurrence Interval Selector */}
          {hasReminder && (
            <div className="space-y-2">
              <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                Recurrence Cycle Frequency
              </label>

              <div className="grid grid-cols-1 gap-2">
                {FREQUENCY_OPTIONS.map((opt) => {
                  const isSelected = frequency === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFrequency(opt.value)}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'bg-[#FF5C38]/10 border-[#FF5C38] text-white shadow-sm'
                          : isDark
                          ? 'bg-[#121318] border-white/[0.06] text-zinc-300 hover:border-white/[0.12]'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isSelected ? (
                          <div className="w-4 h-4 rounded-full bg-[#FF5C38] flex items-center justify-center text-white">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-zinc-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className={`text-xs font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          <span>{opt.label}</span>
                          {opt.value === 'EVERY_3_MONTHS' && (
                            <span className="text-[10px] text-emerald-400 font-mono font-semibold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                              Coconut Default
                            </span>
                          )}
                        </div>
                        <div className={`text-[11px] mt-0.5 leading-snug ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                          {opt.sublabel}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Interval Input */}
              {frequency === 'CUSTOM_DAYS' && (
                <div
                  className={`p-3.5 rounded-2xl border mt-2 space-y-1.5 ${
                    isDark ? 'bg-[#121318] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <label className={`text-[11px] font-medium block ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                    Interval in Days (e.g. 90 = 3 months, 180 = 6 months)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="730"
                    value={customDays}
                    onChange={(e) => setCustomDays(Number(e.target.value))}
                    className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none focus:border-[#FF5C38] ${
                      isDark ? 'bg-[#181A20] border-white/[0.08] text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className={`pt-4 border-t flex items-center justify-end gap-3 ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-colors ${
                isDark
                  ? 'text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08]'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoadingServices}
              className="px-6 py-2.5 bg-[#FF5C38] hover:bg-[#FF6B4A] text-white rounded-full text-xs font-bold shadow-lg shadow-[#FF5C38]/25 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Rule...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save Automation Rule</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
