'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  CalendarClock,
  Sparkles,
  TreePalm,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Settings2,
  Check,
  Zap,
} from 'lucide-react';
import {
  reminderService,
  ServiceReminderConfig,
  ReminderFrequency,
} from '@/services/reminder.service';
import { ServiceSelectDropdown } from './ServiceSelectDropdown';

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

        // Select initial service if provided or pick first
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

  // When selected service changes, populate fields
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
  const isCoconut = currentService?.name.toLowerCase().includes('coco');

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#14151A] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 bg-[#1A1C23] border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#14151A] border border-gray-800 rounded-xl">
              <Settings2 className="w-5 h-5 text-[#7B4DFF]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-100 flex items-center gap-2">
                <span>Service Reminder Automation Rule</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#7B4DFF]/10 text-[#7B4DFF] border border-[#7B4DFF]/20">
                  Auto-Schedule
                </span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Automatically schedule a reminder when a client's booked job is marked completed
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

        {/* Informational Guidance Banner */}
        <div className="p-3.5 mx-5 mt-4 rounded-xl bg-[#7B4DFF]/10 border border-[#7B4DFF]/20 flex items-start gap-2.5 text-xs text-purple-200">
          <Sparkles className="w-4 h-4 text-[#7B4DFF] shrink-0 mt-0.5" />
          <span>
            When a customer books this service and the work order is marked <strong>COMPLETED</strong>,
            Antigravity automatically calculates the next due date and registers the reminder in your
            reminders list with direct 1-click WhatsApp outreach.
          </span>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* 1. Select Service */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Select Service to Configure <span className="text-[#7B4DFF]">*</span>
            </label>

            {isLoadingServices ? (
              <div className="p-3 bg-[#1A1C23] border border-gray-800 rounded-xl flex items-center justify-center gap-2 text-xs text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin text-[#7B4DFF]" />
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
          <div className="p-4 rounded-xl bg-[#1A1C23] border border-gray-800 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-gray-200 flex items-center gap-2">
                <span>Auto-Create Reminder on Job Completion</span>
                {hasReminder && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Automatically add completed clients to the cyclic follow-up queue
              </p>
            </div>

            <button
              type="button"
              onClick={() => setHasReminder(!hasReminder)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                hasReminder ? 'bg-[#7B4DFF]' : 'bg-gray-800'
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
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
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
                      className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'bg-[#7B4DFF]/10 border-[#7B4DFF] text-white shadow-sm'
                          : 'bg-[#1A1C23] border-gray-800 text-gray-300 hover:border-gray-700'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isSelected ? (
                          <div className="w-4 h-4 rounded-full bg-[#7B4DFF] flex items-center justify-center text-white">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-gray-700" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-gray-100 flex items-center gap-2">
                          <span>{opt.label}</span>
                          {opt.value === 'EVERY_3_MONTHS' && (
                            <span className="text-[10px] text-emerald-400 font-mono font-semibold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                              Coconut Default
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                          {opt.sublabel}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Interval Input if CUSTOM_DAYS is selected */}
              {frequency === 'CUSTOM_DAYS' && (
                <div className="p-3 bg-[#1A1C23] rounded-xl border border-gray-800 mt-2 space-y-1.5">
                  <label className="text-[11px] text-gray-400 font-medium block">
                    Interval in Days (e.g. 90 = 3 months, 180 = 6 months)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="730"
                    value={customDays}
                    onChange={(e) => setCustomDays(Number(e.target.value))}
                    className="w-full bg-[#14151A] border border-gray-800 focus:border-[#7B4DFF] rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none transition-colors"
                  />
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-gray-800/80 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#1A1C23] hover:bg-gray-800 text-gray-400 hover:text-white rounded-xl text-xs font-medium border border-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoadingServices}
              className="px-5 py-2 bg-[#7B4DFF] hover:bg-[#6A3DEE] text-white rounded-xl text-xs font-bold shadow-[0_0_15px_rgba(123,77,255,0.3)] transition-all flex items-center gap-2 disabled:opacity-50"
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
