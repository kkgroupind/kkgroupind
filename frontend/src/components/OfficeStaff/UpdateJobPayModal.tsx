'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Loader2,
  HardHat,
  Clock,
  Calculator,
  Banknote,
  QrCode,
  Building2,
  ShieldCheck,
  Coffee,
} from 'lucide-react';
import { EnquiryService, ServiceEnquiry } from '@/services';
import { useToast } from '@/context/toast-context';

interface UpdateJobPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  enquiry: ServiceEnquiry | null;
  token?: string | null;
  onPayUpdatedSuccess: () => void;
}

const PAYMENT_MODES = [
  { id: 'CASH', label: 'Cash on Site', sub: 'നേരിട്ട് പണം', icon: Banknote },
  { id: 'UPI', label: 'UPI / GPay', sub: 'യു.പി.ഐ / ഗൂഗിൾ പേ', icon: QrCode },
  { id: 'BANK_TRANSFER', label: 'Bank Transfer', sub: 'ബാങ്ക് ട്രാൻസ്ഫർ', icon: Building2 },
  { id: 'COMPANY_PAY', label: 'Company Payroll', sub: 'കമ്പനി പേ ഔട്ട്', icon: ShieldCheck },
];

export function UpdateJobPayModal({
  isOpen,
  onClose,
  enquiry,
  token,
  onPayUpdatedSuccess,
}: UpdateJobPayModalProps) {
  const toast = useToast();

  const [totalCalculatedWage, setTotalCalculatedWage] = useState<number | ''>('');
  const [completedUnits, setCompletedUnits] = useState<number | ''>('');
  const [workerUnitWage, setWorkerUnitWage] = useState<number | ''>('');
  const [totalCalculatedCost, setTotalCalculatedCost] = useState<number | ''>('');
  const [unitRate, setUnitRate] = useState<number | ''>('');
  const [paymentMode, setPaymentMode] = useState<string>('CASH');
  const [paymentRef, setPaymentRef] = useState<string>('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && enquiry) {
      setTotalCalculatedWage(enquiry.totalCalculatedWage ?? '');
      setCompletedUnits(enquiry.completedUnits ?? enquiry.estimatedUnits ?? '');
      setWorkerUnitWage(enquiry.workerUnitWage ?? '');
      setTotalCalculatedCost(enquiry.totalCalculatedCost ?? '');
      setUnitRate(enquiry.unitRate ?? '');
      const spec = (enquiry.specificationDetails as any) || {};
      setPaymentMode(spec.paymentMode || 'CASH');
      setPaymentRef(spec.paymentRef || '');
      setNotes(enquiry.notes || '');
      setError(null);
    }
  }, [isOpen, enquiry]);

  if (!isOpen || !enquiry) return null;

  const unitLabel = enquiry.unitLabel || 'Unit';
  const isWorkCompleted = enquiry.status === 'COMPLETED';

  // Quick auto-calc worker wage
  const handleAutoCalculateWage = () => {
    const units = Number(completedUnits);
    const rate = Number(workerUnitWage);
    if (!isNaN(units) && units > 0 && !isNaN(rate) && rate > 0) {
      setTotalCalculatedWage(Math.round(units * rate));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!isWorkCompleted) {
      setError('Payment can only be assigned after the job has been completed by workers.');
      return;
    }

    if (totalCalculatedWage === '' && workerUnitWage === '') {
      setError('Please provide at least a Final Worker Payout or Unit Wage Rate.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await EnquiryService.updateJobPay(
        enquiry.id,
        {
          totalCalculatedWage: totalCalculatedWage === '' ? undefined : Number(totalCalculatedWage),
          workerUnitWage: workerUnitWage === '' ? undefined : Number(workerUnitWage),
          completedUnits: completedUnits === '' ? undefined : Number(completedUnits),
          totalCalculatedCost: totalCalculatedCost === '' ? undefined : Number(totalCalculatedCost),
          unitRate: unitRate === '' ? undefined : Number(unitRate),
          paymentMode,
          paymentRef: paymentRef.trim() || undefined,
          notes: notes.trim() || undefined,
        },
        token,
      );

      toast.success(
        'Worker Payout Assigned',
        `Successfully assigned ₹${Number(totalCalculatedWage || 0).toLocaleString()} via ${paymentMode} for ${enquiry.trackingNumber}.`,
      );
      onPayUpdatedSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update job pay. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-[#14151A] border border-gray-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl text-white animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-100 flex items-center gap-2">
                <span>Assign Payment Upon Work Completion</span>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-[#7B4DFF]/15 text-[#7B4DFF] border border-[#7B4DFF]/30">
                  {enquiry.trackingNumber}
                </span>
              </h3>
              <p className="text-[11px] text-gray-400">
                Assign worker payout &amp; payment method for completed service
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Completion Status Alert */}
          {!isWorkCompleted && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-amber-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <p className="font-bold text-amber-200">Work In Progress / Not Completed</p>
                <p className="text-[11px] text-amber-300/80 mt-0.5">
                  Payment can only be assigned after the field worker finishes work and marks it as completed. Current job status: <span className="font-mono font-bold text-white px-1.5 py-0.5 rounded bg-black/40 border border-amber-500/40">{enquiry.status}</span>.
                </p>
              </div>
            </div>
          )}

          {/* Job & Operative Summary Banner */}
          <div className="p-3.5 rounded-2xl bg-[#1A1C23] border border-gray-800/80 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Service:</span>
              <span className="font-bold text-gray-200">{enquiry.serviceName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Customer:</span>
              <span className="text-gray-300">{enquiry.customerName} ({enquiry.customerPhone})</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Assigned Operative:</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <HardHat className="w-3.5 h-3.5" />
                {enquiry.worker?.name || enquiry.worker?.username || 'Field Operative'}
              </span>
            </div>
            {(() => {
              const spec = (enquiry.specificationDetails as any) || {};
              const breaks = Array.isArray(spec.breaks)
                ? spec.breaks
                : (Array.isArray(spec.breakLog) ? spec.breakLog : []);
              const actualMins = spec.actualWorkMinutes ?? enquiry.workDurationMinutes ?? 0;
              const breakMins = spec.totalBreakMinutes ?? breaks.reduce((acc: number, b: any) => acc + (b.durationMinutes || 0), 0);
              const grossMins = spec.grossDurationMinutes ?? (actualMins + breakMins);

              if (actualMins === 0 && breakMins === 0) return null;

              return (
                <div className="pt-2 border-t border-gray-800 space-y-1 text-[11px]">
                  <div className="flex items-center justify-between text-emerald-400">
                    <span className="flex items-center gap-1 font-semibold">
                      <Clock className="w-3 h-3 text-emerald-400" />
                      Net Labor Time:
                    </span>
                    <span className="font-mono font-bold">
                      {Math.floor(actualMins / 60) > 0 ? `${Math.floor(actualMins / 60)}h ` : ''}{actualMins % 60}m ({actualMins} mins)
                    </span>
                  </div>

                  {breakMins > 0 && (
                    <div className="flex items-center justify-between text-amber-300">
                      <span className="flex items-center gap-1 font-semibold">
                        <Coffee className="w-3 h-3 text-amber-400" />
                        Break Time Deducted:
                      </span>
                      <span className="font-mono font-bold">
                        {breakMins}m ({breaks.length} breaks)
                      </span>
                    </div>
                  )}

                  {grossMins > actualMins && (
                    <div className="flex items-center justify-between text-gray-400 text-[10px]">
                      <span>Gross Elapsed On-Site:</span>
                      <span className="font-mono">{grossMins} mins</span>
                    </div>
                  )}
                </div>
              );
            })()}
            {enquiry.completedUnits ? (
              <div className="flex items-center justify-between text-[11px] text-purple-300">
                <span>Reported Units:</span>
                <span className="font-mono font-bold">
                  {enquiry.completedUnits} {unitLabel}s
                </span>
              </div>
            ) : null}
          </div>

          {/* Payment Mode Selection */}
          <div>
            <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block mb-2">
              Payment Mode (പെയ്മെന്റ് രീതി) *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_MODES.map((mode) => {
                const IconComponent = mode.icon;
                const isSelected = paymentMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    disabled={!isWorkCompleted}
                    onClick={() => setPaymentMode(mode.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-xs'
                        : 'bg-[#1A1C23] border-gray-800 text-gray-400 hover:text-gray-200 hover:border-gray-700'
                    } ${!isWorkCompleted ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-bold leading-tight ${isSelected ? 'text-emerald-400' : 'text-gray-200'}`}>
                        {mode.label}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">{mode.sub}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Reference ID (e.g. UPI Ref / Cash voucher) */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Payment Ref / Transaction ID (Optional)
            </label>
            <input
              type="text"
              disabled={!isWorkCompleted}
              value={paymentRef}
              onChange={(e) => setPaymentRef(e.target.value)}
              placeholder="e.g. UPI Ref / UTR / Cash Voucher No."
              className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
            />
          </div>

          {/* Input Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Final Worker Payout */}
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                <span>Final Worker Payout (₹) *</span>
                {Number(completedUnits) > 0 && Number(workerUnitWage) > 0 && isWorkCompleted && (
                  <button
                    type="button"
                    onClick={handleAutoCalculateWage}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer font-semibold underline"
                  >
                    <Calculator className="w-3 h-3" />
                    Auto-Calc: {completedUnits} × ₹{workerUnitWage}
                  </button>
                )}
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                <input
                  type="number"
                  min="0"
                  step="1"
                  disabled={!isWorkCompleted}
                  value={totalCalculatedWage}
                  onChange={(e) =>
                    setTotalCalculatedWage(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="e.g. 1500"
                  className="w-full bg-[#1A1C23] border border-emerald-500/40 rounded-xl pl-9 pr-3 py-2.5 text-sm font-black text-emerald-400 focus:outline-none focus:border-emerald-400 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Completed Units */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Completed Units ({unitLabel})
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                disabled={!isWorkCompleted}
                value={completedUnits}
                onChange={(e) =>
                  setCompletedUnits(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="e.g. 12"
                className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#7B4DFF] disabled:opacity-50"
              />
            </div>

            {/* Worker Unit Wage */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Worker Unit Wage (₹/{unitLabel})
              </label>
              <input
                type="number"
                min="0"
                step="1"
                disabled={!isWorkCompleted}
                value={workerUnitWage}
                onChange={(e) =>
                  setWorkerUnitWage(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="e.g. 80"
                className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#7B4DFF] disabled:opacity-50"
              />
            </div>

            {/* Final Customer Billing Cost (Optional) */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Customer Billing (₹)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                disabled={!isWorkCompleted}
                value={totalCalculatedCost}
                onChange={(e) =>
                  setTotalCalculatedCost(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="Optional"
                className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#7B4DFF] disabled:opacity-50"
              />
            </div>

            {/* Client Unit Rate */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Client Rate (₹/{unitLabel})
              </label>
              <input
                type="number"
                min="0"
                step="1"
                disabled={!isWorkCompleted}
                value={unitRate}
                onChange={(e) => setUnitRate(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Optional"
                className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#7B4DFF] disabled:opacity-50"
              />
            </div>
          </div>

          {/* Payment Notes */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Payment Remarks / Notes
            </label>
            <textarea
              rows={2}
              disabled={!isWorkCompleted}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Verified work completion. Handed cash on site."
              className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#7B4DFF] disabled:opacity-50"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !isWorkCompleted}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>{isWorkCompleted ? 'Assign & Finalize Payment' : 'Cannot Pay (Work In Progress)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

