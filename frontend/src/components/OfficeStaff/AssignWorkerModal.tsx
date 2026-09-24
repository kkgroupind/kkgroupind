'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  UserCheck,
  Phone,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Clock,
  Send,
  User,
} from 'lucide-react';
import { EnquiryService, ServiceEnquiry, WorkerWithAvailability } from '@/services';

interface AssignWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  enquiry: ServiceEnquiry | null;
  token?: string | null;
  workers?: WorkerWithAvailability[];
  onAssignedSuccess: () => void;
}

export function AssignWorkerModal({
  isOpen,
  onClose,
  enquiry,
  token,
  onAssignedSuccess,
}: AssignWorkerModalProps) {
  const [workers, setWorkers] = useState<WorkerWithAvailability[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState(true);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && token) {
      fetchWorkers();
      setSelectedWorkerId(null);
      setNotes('');
      setError(null);
    }
  }, [isOpen, token]);

  const fetchWorkers = async () => {
    setLoadingWorkers(true);
    setError(null);
    try {
      const res = await EnquiryService.getActiveWorkers(token || '');
      setWorkers(res.workers || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load workers list');
    } finally {
      setLoadingWorkers(false);
    }
  };

  if (!isOpen || !enquiry) return null;

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkerId) {
      setError('Please select an available worker to assign');
      return;
    }

    const worker = workers.find((w) => w.id === selectedWorkerId);
    if (!worker || worker.workerStatus !== 'AVAILABLE') {
      setError('Selected worker is not available. Please pick an available worker.');
      return;
    }

    setAssigning(true);
    setError(null);

    try {
      await EnquiryService.assignWorker(
        enquiry.id,
        selectedWorkerId,
        notes.trim() || undefined,
        token || '',
      );
      onAssignedSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to assign worker. Please try again.');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative w-full max-w-lg bg-[#14161D] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden text-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-300">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-100">
                Assign Worker
              </h2>
              <p className="text-xs text-gray-400">
                Dispatch field personnel to this work order
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={assigning}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {/* Work Summary Box */}
          <div className="bg-[#0D0E12] border border-gray-800 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold text-emerald-400">
                {enquiry.trackingNumber}
              </span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700">
                {enquiry.serviceName}
              </span>
            </div>
            <div className="text-gray-300">
              <span className="font-medium text-gray-200">Customer: </span>
              {enquiry.customerName} ({enquiry.customerPhone})
            </div>
            {enquiry.location && (
              <div className="text-gray-400">
                <span className="font-medium text-gray-300">Location: </span>
                {enquiry.location}
              </div>
            )}
            <p className="text-gray-400 italic bg-[#14161D] p-2 rounded-lg border border-gray-800">
              &ldquo;{enquiry.message}&rdquo;
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAssign} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium text-gray-300">
                  Select Worker *
                </label>
                <button
                  type="button"
                  onClick={fetchWorkers}
                  className="text-xs text-blue-400 hover:underline"
                >
                  Refresh
                </button>
              </div>

              {loadingWorkers ? (
                <div className="p-6 flex items-center justify-center gap-2 text-gray-400 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  <span>Loading worker status...</span>
                </div>
              ) : workers.length === 0 ? (
                <div className="p-4 text-center rounded-xl bg-[#0D0E12] border border-gray-800 text-gray-400">
                  No registered workers found.
                </div>
              ) : (
                <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                  {workers.map((worker) => {
                    const isAvailable = worker.workerStatus === 'AVAILABLE';
                    const isSelected = selectedWorkerId === worker.id;

                    return (
                      <div
                        key={worker.id}
                        onClick={() => {
                          if (isAvailable) {
                            setSelectedWorkerId(worker.id);
                            setError(null);
                          }
                        }}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                          !isAvailable
                            ? 'opacity-40 cursor-not-allowed bg-[#0D0E12] border-gray-800'
                            : isSelected
                            ? 'bg-blue-950/30 border-blue-500/70 text-white cursor-pointer'
                            : 'bg-[#0D0E12] border-gray-800 hover:border-gray-700 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : isAvailable
                                ? 'bg-gray-800 text-emerald-400'
                                : 'bg-gray-900 text-gray-600'
                            }`}
                          >
                            {worker.name ? worker.name.charAt(0).toUpperCase() : 'W'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-200">
                                {worker.name || worker.username}
                              </span>
                              <span className="text-[11px] text-gray-500">
                                @{worker.username}
                              </span>
                            </div>
                            {worker.phone && (
                              <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                                <Phone className="w-3 h-3 text-gray-500" />
                                <span>{worker.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isAvailable ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              Available
                            </span>
                          ) : worker.workerStatus === 'BUSY' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <Clock className="w-3 h-3" />
                              Busy
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-800 text-gray-500 border border-gray-700/50">
                              Off Duty
                            </span>
                          )}

                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-blue-400" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-300">
                Dispatch Instructions (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Notes or instructions for the worker..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#0D0E12] border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-800">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium transition-colors border border-gray-700/60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={assigning || !selectedWorkerId}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {assigning ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Assigning...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Assign Worker</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
