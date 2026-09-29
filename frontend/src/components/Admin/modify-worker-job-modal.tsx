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
  Calendar,
  FileText,
  CreditCard,
  Sparkles,
  Calculator,
  Save,
} from 'lucide-react';
import { EnquiryService, ServiceEnquiry, ServiceStatus } from '@/services';

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
  { value: 'PENDING', label: 'Pending (Queue)', color: 'text-slate-400 bg-slate-500/10 border-slate-500/30' },
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
  const [notes, setNotes] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<string>('CASH');
  const [paymentRef, setPaymentRef] = useState<string>('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Auto-calculation toggle
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
      setStatus(job.status || 'COMPLETED');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#111318] border border-gray-800 text-gray-200 shadow-2xl p-6 sm:p-7 space-y-6 custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-800/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-gray-100 tracking-tight">
                  Modify Work Order Log
                </h3>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#7B4DFF]/15 text-[#A78BFA] border border-[#7B4DFF]/30">
                  {job.trackingNumber}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Adjust worked time, tree count / units, wages, and status for{' '}
                <strong className="text-gray-200 font-bold">{workerName}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-200 hover:bg-gray-800/60 transition-colors cursor-pointer"
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
        <div className="p-3.5 rounded-2xl bg-[#171922] border border-gray-800/70 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-500">Service</span>
            <div className="font-bold text-gray-200">{job.serviceName}</div>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-500">Client</span>
            <div className="font-bold text-gray-300">{job.customerName}</div>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-500">Site Location</span>
            <div className="font-bold text-gray-300">{job.location || 'Kerala Site'}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section 1: Worked Time (Duration) */}
          <div className="p-4 rounded-2xl bg-[#171922] border border-gray-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Time Worked by Operative (ജോലി ചെയ്ത സമയം)</span>
              </label>
              <span className="text-[11px] font-mono text-gray-400">
                Total: {durationHours * 60 + durationMins} mins
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Actual Hours (മണിക്കൂർ)</span>
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={durationHours}
                  onChange={(e) => setDurationHours(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="0"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-[#0D0E12] border border-gray-800 text-gray-100 font-mono text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Actual Mins (മിനിറ്റ്)</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={durationMins}
                  onChange={(e) => setDurationMins(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  placeholder="0"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-[#0D0E12] border border-gray-800 text-gray-100 font-mono text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase">Break Time (ഇടവേള മിനിറ്റ്)</span>
                <input
                  type="number"
                  min={0}
                  max={600}
                  value={breakDurationMins}
                  onChange={(e) => setBreakDurationMins(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="0"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-[#0D0E12] border border-amber-500/30 text-amber-300 font-mono text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="pt-1 text-[11px] text-gray-400 flex items-center justify-between border-t border-gray-800/60">
              <span>Net Labor: <strong className="text-emerald-400 font-mono">{durationHours * 60 + durationMins}m</strong></span>
              <span>Break Deducted: <strong className="text-amber-400 font-mono">{breakDurationMins}m</strong></span>
              <span>Gross On-Site: <strong className="text-gray-200 font-mono">{durationHours * 60 + durationMins + breakDurationMins}m</strong></span>
            </div>
          </div>

          {/* Section 2: Tree Count / Completed Units & Measure */}
          <div className="p-4 rounded-2xl bg-[#171922] border border-gray-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-sky-400" />
                <span>Tree Count / Units Completed (ചെയ്ത അളവ് / എണ്ണം)</span>
              </label>
              <span className="text-[10px] text-gray-400">
                e.g. Tree count for Cococare, hours for JCB
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  Completed Count (എണ്ണം) *
                </span>
                <input
                  type="number"
                  step="any"
                  min={0}
                  value={completedUnits}
                  onChange={(e) => setCompletedUnits(e.target.value)}
                  placeholder="e.g. 15, 25, 120"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-[#0D0E12] border border-gray-800 text-gray-100 font-mono text-sm focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  Unit Label (യൂണിറ്റ് തരം)
                </span>
                <input
                  type="text"
                  value={unitLabel}
                  onChange={(e) => setUnitLabel(e.target.value)}
                  placeholder="Trees, Hours, Sq. Ft., Loads"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-[#0D0E12] border border-gray-800 text-gray-100 text-sm focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Wages & Pricing Calculation */}
          <div className="p-4 rounded-2xl bg-[#171922] border border-gray-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Worker Wage &amp; Customer Billing Rates (കൂലി &amp; ചാർജ്)</span>
              </label>
              <button
                type="button"
                onClick={() => setAutoCalculate((prev) => !prev)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 transition-colors cursor-pointer ${
                  autoCalculate
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-gray-800 text-gray-400 border-gray-700'
                }`}
              >
                <Calculator className="w-3 h-3" />
                <span>{autoCalculate ? 'Auto-Calc: ON' : 'Manual Override'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Worker Wage per Unit */}
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  Worker Rate Per Unit (₹ / {unitLabel || 'Unit'})
                </span>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2.5 text-gray-500 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    step="any"
                    min={0}
                    value={workerUnitWage}
                    onChange={(e) => setWorkerUnitWage(e.target.value)}
                    placeholder="80"
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-[#0D0E12] border border-gray-800 text-gray-100 font-mono text-sm focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Total Worker Wage */}
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase">
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
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-[#0D0E12] border border-emerald-500/40 text-emerald-300 font-mono text-sm font-bold focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Customer Rate per Unit */}
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  Customer Rate Per Unit (₹ / {unitLabel || 'Unit'})
                </span>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2.5 text-gray-500 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    step="any"
                    min={0}
                    value={unitRate}
                    onChange={(e) => setUnitRate(e.target.value)}
                    placeholder="120"
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-[#0D0E12] border border-gray-800 text-gray-100 font-mono text-sm focus:outline-none focus:border-gray-500"
                  />
                </div>
              </div>

              {/* Total Customer Cost */}
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  Total Customer Bill (ആകെ തുക)
                </span>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2.5 text-gray-500 font-bold text-sm">₹</span>
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
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-[#0D0E12] border border-gray-800 text-gray-200 font-mono text-sm focus:outline-none focus:border-gray-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Work Order Status & Payment Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Status Selector */}
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">
                Work Order Status (സ്റ്റാറ്റസ്) *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ServiceStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#171922] border border-gray-800 text-gray-200 text-xs font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Mode */}
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">
                Payment Mode (പെയ്മെന്റ് രീതി)
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#171922] border border-gray-800 text-gray-200 text-xs font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
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
            <label className="text-xs font-bold text-gray-300 block mb-1">
              Payment Reference / UPI Transaction ID (ഓപ്ഷണൽ)
            </label>
            <input
              type="text"
              value={paymentRef}
              onChange={(e) => setPaymentRef(e.target.value)}
              placeholder="e.g. UPI-9847123450-TXN or Receipt #102"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#171922] border border-gray-800 text-gray-200 text-xs font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Section 5: Notes & Modification Remarks */}
          <div>
            <label className="text-xs font-bold text-gray-300 block mb-1">
              Adjustment Notes &amp; Audit Log Remarks (കുറിപ്പ്)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Corrected tree count from 12 to 15 after field measurement. Added 45 min overtime."
              className="w-full px-3.5 py-2 rounded-xl bg-[#171922] border border-gray-800 text-gray-200 text-xs focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-800/80 hover:bg-gray-800 text-gray-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shadow-lg shadow-emerald-600/30 cursor-pointer disabled:opacity-50 flex items-center gap-2"
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
