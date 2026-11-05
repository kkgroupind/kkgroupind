'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Briefcase,
  DollarSign,
  Layers,
  Calculator,
  Save,
} from 'lucide-react';
import { EnquiryService, ServiceEnquiry, ServiceStatus } from '@/services';
import { useAdminTheme } from '@/context/admin-theme-context';

interface ModifyWorkerJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: ServiceEnquiry | null;
  token: string;
  onSuccess: (updatedJob?: ServiceEnquiry) => void;
  workerName?: string;
}

const STATUS_OPTIONS: { value: ServiceStatus; label: string; color: string }[] = [
  { value: 'IN_PROGRESS', label: 'In Progress (Active On Site)', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { value: 'COMPLETED', label: 'Completed (Signed Off)', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  { value: 'ASSIGNED', label: 'Assigned (Dispatched)', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  { value: 'PENDING', label: 'Pending (Queue)', color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
];

const PAYMENT_MODES = [
  { value: 'CASH', label: 'Cash Payment (നേരിട്ട് പണം)' },
  { value: 'UPI', label: 'Google Pay / PhonePe (UPI)' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer (NEFT/IMPS)' },
  { value: 'CHEQUE', label: 'Cheque' },
];

export function ModifyWorkerJobModal({
  isOpen,
  onClose,
  job,
  token,
  onSuccess,
  workerName = 'Worker',
}: ModifyWorkerJobModalProps) {
  const { isDark } = useAdminTheme();

  // Form state
  const [durationHours, setDurationHours] = useState<number>(0);
  const [durationMins, setDurationMins] = useState<number>(0);
  const [breakDurationMins, setBreakDurationMins] = useState<number>(0);
  const [completedUnits, setCompletedUnits] = useState<string>('');
  const [unitLabel, setUnitLabel] = useState<string>('Units');
  const [workerUnitWage, setWorkerUnitWage] = useState<string>('');
  const [totalCalculatedWage, setTotalCalculatedWage] = useState<string>('');
  const [unitRate, setUnitRate] = useState<string>('');
  const [totalCalculatedCost, setTotalCalculatedCost] = useState<string>('');
  const [status, setStatus] = useState<ServiceStatus>('COMPLETED');
  const [paymentMode, setPaymentMode] = useState<string>('CASH');
  const [paymentRef, setPaymentRef] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [autoCalculate, setAutoCalculate] = useState(true);

  // Populate data when job changes
  useEffect(() => {
    if (job && isOpen) {
      const totalMinutes = job.workDurationMinutes || 0;
      setDurationHours(Math.floor(totalMinutes / 60));
      setDurationMins(totalMinutes % 60);

      setCompletedUnits(job.completedUnits !== null && job.completedUnits !== undefined ? String(job.completedUnits) : '');
      setUnitLabel(job.unitLabel || 'Units');
      setWorkerUnitWage(job.workerUnitWage !== null && job.workerUnitWage !== undefined ? String(job.workerUnitWage) : '');
      setTotalCalculatedWage(job.totalCalculatedWage !== null && job.totalCalculatedWage !== undefined ? String(job.totalCalculatedWage) : '');
      setUnitRate(job.unitRate !== null && job.unitRate !== undefined ? String(job.unitRate) : '');
      setTotalCalculatedCost(job.totalCalculatedCost !== null && job.totalCalculatedCost !== undefined ? String(job.totalCalculatedCost) : '');
      setStatus((job.status as ServiceStatus) || 'COMPLETED');
      setNotes(job.notes || '');

      const specs = (job.specificationDetails as Record<string, any>) || {};
      setBreakDurationMins(specs.totalBreakMinutes || 0);
      setPaymentMode(specs.paymentMode || 'CASH');
      setPaymentRef(specs.paymentRef || '');

      setError('');
      setSuccessMessage('');
      setAutoCalculate(true);
    }
  }, [job, isOpen]);

  // Recalculate totals automatically when units or rates change if autoCalculate is on
  useEffect(() => {
    if (!autoCalculate) return;
    const units = parseFloat(completedUnits) || 0;
    const wWage = parseFloat(workerUnitWage) || 0;
    const cRate = parseFloat(unitRate) || 0;

    if (units > 0 && wWage > 0) {
      setTotalCalculatedWage(String(Math.round(units * wWage)));
    }
    if (units > 0 && cRate > 0) {
      setTotalCalculatedCost(String(Math.round(units * cRate)));
    }
  }, [completedUnits, workerUnitWage, unitRate, autoCalculate]);

  if (!isOpen || !job) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const totalMinutes = durationHours * 60 + durationMins;
      const parsedUnits = completedUnits !== '' ? parseFloat(completedUnits) : undefined;
      const parsedWorkerWage = workerUnitWage !== '' ? parseFloat(workerUnitWage) : undefined;
      const parsedTotalWage = totalCalculatedWage !== '' ? parseFloat(totalCalculatedWage) : undefined;
      const parsedUnitRate = unitRate !== '' ? parseFloat(unitRate) : undefined;
      const parsedTotalCost = totalCalculatedCost !== '' ? parseFloat(totalCalculatedCost) : undefined;

      const payload = {
        workDurationMinutes: totalMinutes >= 0 ? totalMinutes : undefined,
        totalBreakMinutes: breakDurationMins >= 0 ? breakDurationMins : undefined,
        completedUnits: parsedUnits,
        unitLabel: unitLabel.trim() || undefined,
        workerUnitWage: parsedWorkerWage,
        totalCalculatedWage: parsedTotalWage,
        unitRate: parsedUnitRate,
        totalCalculatedCost: parsedTotalCost,
        status,
        notes: notes.trim() || undefined,
        paymentMode,
        paymentRef: paymentRef.trim() || undefined,
      };

      const res = await EnquiryService.updateJobPay(job.id, payload, token);

      setSuccessMessage('Work order log successfully modified & persisted.');
      setTimeout(() => {
        onSuccess(res.enquiry);
        onClose();
      }, 700);
    } catch (err: any) {
      console.error('Failed to modify job log:', err);
      setError(err?.message || 'Failed to update work order data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl relative custom-scrollbar p-6 space-y-5 rounded-[28px] border ${
          isDark ? 'bg-[#12141A] border-white/[0.08]' : 'bg-white border-slate-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-start justify-between pb-4 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-2xl border flex items-center justify-center text-[#6366F1] ${
                isDark ? 'bg-[#161922] border-white/[0.08]' : 'bg-slate-50 border-slate-200 shadow-xs'
              }`}
            >
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-base sm:text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Edit Job Details &amp; Worker Pay
              </h2>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Adjust hours worked, completed units, and wages for <strong className="text-[#6366F1]">{workerName}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              isDark
                ? 'text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08]'
                : 'text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Service Details Glance */}
        <div
          className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
            isDark ? 'bg-[#121318] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div>
            <span className={`text-[10px] uppercase font-bold block ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Service</span>
            <div className={`font-bold mt-0.5 ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>{job.serviceName}</div>
          </div>
          <div>
            <span className={`text-[10px] uppercase font-bold block ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Client</span>
            <div className={`font-bold mt-0.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>{job.customerName}</div>
          </div>
          <div>
            <span className={`text-[10px] uppercase font-bold block ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Site Location</span>
            <div className={`font-bold mt-0.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>{job.location || 'Kerala Site'}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section 1: Worked Time (Duration) */}
          <div
            className={`p-4 rounded-2xl border space-y-3 ${
              isDark ? 'bg-[#121318] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <label className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                <Clock className="w-4 h-4 text-[#FF5C38]" />
                <span>Time Worked by Operative (ജോലി ചെയ്ത സമയം)</span>
              </label>
              <span className={`text-[11px] font-mono ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Total: {durationHours * 60 + durationMins} mins
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className={`text-[10px] font-bold uppercase block ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Actual Hours (മണിക്കൂർ)</span>
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={durationHours}
                  onChange={(e) => setDurationHours(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="0"
                  className={`w-full mt-1 px-3.5 py-2.5 rounded-xl font-mono text-sm border focus:outline-none focus:border-[#FF5C38] ${
                    isDark ? 'bg-[#181A20] border-white/[0.08] text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <span className={`text-[10px] font-bold uppercase block ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Actual Mins (മിനിറ്റ്)</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={durationMins}
                  onChange={(e) => setDurationMins(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  placeholder="0"
                  className={`w-full mt-1 px-3.5 py-2.5 rounded-xl font-mono text-sm border focus:outline-none focus:border-[#FF5C38] ${
                    isDark ? 'bg-[#181A20] border-white/[0.08] text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <span className="text-[10px] font-bold text-amber-500 uppercase block">Break Time (ഇടവേള മിനിറ്റ്)</span>
                <input
                  type="number"
                  min={0}
                  max={600}
                  value={breakDurationMins}
                  onChange={(e) => setBreakDurationMins(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="0"
                  className={`w-full mt-1 px-3.5 py-2.5 rounded-xl font-mono text-sm border focus:outline-none focus:border-amber-400 ${
                    isDark ? 'bg-[#181A20] border-amber-500/30 text-amber-300' : 'bg-white border-amber-300 text-amber-800'
                  }`}
                />
              </div>
            </div>

            <div className={`pt-2 text-[11px] flex items-center justify-between border-t ${isDark ? 'border-white/[0.06] text-zinc-400' : 'border-slate-200 text-slate-500'}`}>
              <span>Net Labor: <strong className="text-emerald-400 font-mono">{durationHours * 60 + durationMins}m</strong></span>
              <span>Break Deducted: <strong className="text-amber-400 font-mono">{breakDurationMins}m</strong></span>
              <span>Gross On-Site: <strong className={isDark ? 'text-zinc-200 font-mono' : 'text-slate-800 font-mono'}>{durationHours * 60 + durationMins + breakDurationMins}m</strong></span>
            </div>
          </div>

          {/* Section 2: Tree Count / Completed Units & Measure */}
          <div
            className={`p-4 rounded-2xl border space-y-3 ${
              isDark ? 'bg-[#121318] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <label className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                <Layers className="w-4 h-4 text-sky-400" />
                <span>Tree Count / Units Completed (ചെയ്ത അളവ് / എണ്ണം)</span>
              </label>
              <span className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                e.g. Tree count for Cococare, hours for JCB
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className={`text-[10px] font-bold uppercase block ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Completed Count (എണ്ണം) *
                </span>
                <input
                  type="number"
                  step="any"
                  min={0}
                  value={completedUnits}
                  onChange={(e) => setCompletedUnits(e.target.value)}
                  placeholder="e.g. 15, 25, 120"
                  className={`w-full mt-1 px-3.5 py-2.5 rounded-xl font-mono text-sm border focus:outline-none focus:border-sky-400 ${
                    isDark ? 'bg-[#181A20] border-white/[0.08] text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <span className={`text-[10px] font-bold uppercase block ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Unit Label (യൂണിറ്റ് തരം)
                </span>
                <input
                  type="text"
                  value={unitLabel}
                  onChange={(e) => setUnitLabel(e.target.value)}
                  placeholder="Trees, Hours, Sq. Ft., Loads"
                  className={`w-full mt-1 px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:border-sky-400 ${
                    isDark ? 'bg-[#181A20] border-white/[0.08] text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Wages & Pricing Calculation */}
          <div
            className={`p-4 rounded-2xl border space-y-3 ${
              isDark ? 'bg-[#121318] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <label className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Worker Wage &amp; Customer Billing Rates (കൂലി &amp; ചാർജ്)</span>
              </label>
              <button
                type="button"
                onClick={() => setAutoCalculate((prev) => !prev)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 transition-colors cursor-pointer ${
                  autoCalculate
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : isDark
                    ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
              >
                <Calculator className="w-3 h-3" />
                <span>{autoCalculate ? 'Auto-Calc: ON' : 'Manual Override'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Worker Wage per Unit */}
              <div>
                <span className={`text-[10px] font-bold uppercase block ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Worker Rate Per Unit (₹ / {unitLabel || 'Unit'})
                </span>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2.5 text-zinc-500 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    step="any"
                    min={0}
                    value={workerUnitWage}
                    onChange={(e) => setWorkerUnitWage(e.target.value)}
                    placeholder="80"
                    className={`w-full pl-7 pr-3 py-2.5 rounded-xl font-mono text-sm border focus:outline-none focus:border-emerald-400 ${
                      isDark ? 'bg-[#181A20] border-white/[0.08] text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Total Worker Wage */}
              <div>
                <span className="text-[10px] font-bold text-emerald-500 uppercase block">
                  Total Worker Payout (ആകെ കൂലി)
                </span>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2.5 text-emerald-500 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    step="any"
                    min={0}
                    value={totalCalculatedWage}
                    onChange={(e) => {
                      setAutoCalculate(false);
                      setTotalCalculatedWage(e.target.value);
                    }}
                    placeholder="1200"
                    className={`w-full pl-7 pr-3 py-2.5 rounded-xl font-mono text-sm font-bold border focus:outline-none focus:border-emerald-400 ${
                      isDark ? 'bg-[#181A20] border-emerald-500/40 text-emerald-400' : 'bg-white border-emerald-300 text-emerald-700'
                    }`}
                  />
                </div>
              </div>

              {/* Customer Rate per Unit */}
              <div>
                <span className={`text-[10px] font-bold uppercase block ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Customer Rate Per Unit (₹ / {unitLabel || 'Unit'})
                </span>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2.5 text-zinc-500 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    step="any"
                    min={0}
                    value={unitRate}
                    onChange={(e) => setUnitRate(e.target.value)}
                    placeholder="120"
                    className={`w-full pl-7 pr-3 py-2.5 rounded-xl font-mono text-sm border focus:outline-none focus:border-zinc-500 ${
                      isDark ? 'bg-[#181A20] border-white/[0.08] text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Total Customer Cost */}
              <div>
                <span className={`text-[10px] font-bold uppercase block ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Total Customer Bill (ആകെ തുക)
                </span>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2.5 text-zinc-500 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    step="any"
                    min={0}
                    value={totalCalculatedCost}
                    onChange={(e) => {
                      setAutoCalculate(false);
                      setTotalCalculatedCost(e.target.value);
                    }}
                    placeholder="1800"
                    className={`w-full pl-7 pr-3 py-2.5 rounded-xl font-mono text-sm border focus:outline-none focus:border-zinc-500 ${
                      isDark ? 'bg-[#181A20] border-white/[0.08] text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Work Order Status & Payment Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`text-xs font-bold block mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                Work Order Status (സ്റ്റാറ്റസ്) *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ServiceStatus)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border focus:outline-none focus:border-[#FF5C38] cursor-pointer ${
                  isDark ? 'bg-[#121318] border-white/[0.06] text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`text-xs font-bold block mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                Payment Mode (പെയ്മെന്റ് രീതി)
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border focus:outline-none focus:border-[#FF5C38] cursor-pointer ${
                  isDark ? 'bg-[#121318] border-white/[0.06] text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                {PAYMENT_MODES.map((pm) => (
                  <option key={pm.value} value={pm.value}>
                    {pm.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Reference ID (optional) */}
          <div>
            <label className={`text-xs font-bold block mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
              Payment Reference / UPI Transaction ID (ഓപ്ഷണൽ)
            </label>
            <input
              type="text"
              value={paymentRef}
              onChange={(e) => setPaymentRef(e.target.value)}
              placeholder="e.g. UPI-9847123450-TXN or Receipt #102"
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono border focus:outline-none focus:border-[#FF5C38] ${
                isDark ? 'bg-[#121318] border-white/[0.06] text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />
          </div>

          {/* Section 5: Notes */}
          <div>
            <label className={`text-xs font-bold block mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
              Adjustment Notes &amp; Audit Log Remarks (കുറിപ്പ്)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Corrected tree count from 12 to 15 after field measurement. Added 45 min overtime."
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:border-[#FF5C38] resize-none ${
                isDark ? 'bg-[#121318] border-white/[0.06] text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />
          </div>

          {/* Action Buttons */}
          <div className={`flex items-center justify-end gap-3 pt-4 border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
            <button
              type="button"
              onClick={onClose}
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
              disabled={isLoading}
              className="px-6 py-2.5 rounded-full bg-[#FF5C38] hover:bg-[#FF6B4A] text-white text-xs font-bold transition-all shadow-lg shadow-[#FF5C38]/25 cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save &amp; Update Work Log</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
