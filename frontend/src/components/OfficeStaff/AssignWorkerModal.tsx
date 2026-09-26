'use client';

import React, { useEffect, useState, useMemo } from 'react';
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
  MapPin,
  ExternalLink,
  Navigation,
  Timer,
  Calendar,
  Layers,
  ShieldAlert,
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

  // Dispatch fields
  const [mapUrl, setMapUrl] = useState('');
  const [locationRemarks, setLocationRemarks] = useState('');
  const [notes, setNotes] = useState('');
  const [isHourlyCalculated, setIsHourlyCalculated] = useState(false);
  const [hourlyRate, setHourlyRate] = useState<number | ''>('');
  const [deadline, setDeadline] = useState('');

  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && token) {
      fetchWorkers();
      setSelectedWorkerId(null);
      setError(null);

      // Pre-fill from enquiry if existing
      if (enquiry) {
        setMapUrl(enquiry.mapUrl || '');
        setLocationRemarks(enquiry.locationRemarks || '');
        setNotes(enquiry.notes || '');
        setIsHourlyCalculated(
          enquiry.isHourlyCalculated ||
          enquiry.serviceName?.toLowerCase().includes('jcb') ||
          enquiry.serviceName?.toLowerCase().includes('excavat') ||
          false,
        );
        setHourlyRate(enquiry.hourlyRate || '');
        if (enquiry.deadline) {
          setDeadline(new Date(enquiry.deadline).toISOString().split('T')[0]);
        } else {
          setDeadline('');
        }
      }
    }
  }, [isOpen, token, enquiry]);

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

  const workerMetrics = useMemo(() => {
    const total = workers.length;
    const available = workers.filter((w) => w.workerStatus === 'AVAILABLE').length;
    const busy = workers.filter((w) => w.workerStatus === 'BUSY').length;
    const offDuty = workers.filter((w) => w.workerStatus === 'OFF_DUTY').length;
    return { total, available, busy, offDuty };
  }, [workers]);

  if (!isOpen || !enquiry) return null;

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkerId) {
      setError('Please select an available worker to assign');
      return;
    }

    const worker = workers.find((w) => w.id === selectedWorkerId);
    if (!worker || worker.workerStatus !== 'AVAILABLE') {
      setError('Selected worker is not available. You can only assign work to AVAILABLE workers.');
      return;
    }

    setAssigning(true);
    setError(null);

    try {
      await EnquiryService.assignWorker(
        enquiry.id,
        {
          workerId: selectedWorkerId,
          notes: notes.trim() || undefined,
          mapUrl: mapUrl.trim() || undefined,
          locationRemarks: locationRemarks.trim() || undefined,
          isHourlyCalculated,
          hourlyRate: hourlyRate === '' ? undefined : Number(hourlyRate),
          deadline: deadline || undefined,
        },
        undefined,
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

  // Generate Google Maps search URL from site location if no mapUrl is provided
  const generatedMapSearchUrl =
    mapUrl.trim() ||
    (enquiry.location
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${enquiry.location}, Kerala, India`,
        )}`
      : '');

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-in fade-in"
    >
      <div className="relative w-full max-w-2xl bg-[#0c1310] border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden text-slate-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-500/20 bg-[#101b15]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Dispatch Work Order</span>
                <span className="font-mono text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {enquiry.trackingNumber}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Configure field assignment, site GPS, and machinery parameters
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={assigning}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[78vh] overflow-y-auto custom-scrollbar text-xs">
          {/* Creator Attribution & Work Brief */}
          <div className="bg-[#121f18] border border-emerald-500/20 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white">
                {enquiry.serviceName}
              </span>
              {/* Creator Flag */}
              <div className="flex items-center gap-1.5">
                {enquiry.createdByRole === 'OFFICE_STAFF' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    🏢 Created by Office Staff: {enquiry.creator?.name || 'Staff Member'}
                  </span>
                ) : enquiry.createdByRole === 'SUPER_ADMIN' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    👑 Created by Super Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    🌐 Customer Web Enquiry
                  </span>
                )}
              </div>
            </div>

            <div className="text-slate-300 flex items-center gap-4">
              <span>
                <strong className="text-slate-400">Client: </strong>
                {enquiry.customerName} ({enquiry.customerPhone})
              </span>
              {enquiry.district && (
                <span>
                  <strong className="text-slate-400">District: </strong>
                  {enquiry.district} {enquiry.city ? `(${enquiry.city})` : ''}
                </span>
              )}
            </div>

            {enquiry.location && (
              <div className="text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{enquiry.location}</span>
              </div>
            )}
          </div>

          {/* Worker Availability Statistics Bar */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-[#121f18] border border-emerald-500/30 rounded-xl p-2.5 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">Available</span>
              <span className="text-base font-black text-emerald-300">{workerMetrics.available}</span>
            </div>
            <div className="bg-[#121f18] border border-amber-500/20 rounded-xl p-2.5 text-center">
              <span className="text-[10px] uppercase font-bold text-amber-400 block">Busy / On-Duty</span>
              <span className="text-base font-black text-amber-300">{workerMetrics.busy}</span>
            </div>
            <div className="bg-[#121f18] border border-slate-700/60 rounded-xl p-2.5 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Off Duty</span>
              <span className="text-base font-black text-slate-300">{workerMetrics.offDuty}</span>
            </div>
            <div className="bg-[#121f18] border border-white/10 rounded-xl p-2.5 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Roster</span>
              <span className="text-base font-black text-white">{workerMetrics.total}</span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAssign} className="space-y-4">
            {/* 1. Worker Selection (Strictly AVAILABLE only) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-slate-200">
                  Select Available Worker *
                </label>
                <button
                  type="button"
                  onClick={fetchWorkers}
                  className="text-xs text-emerald-400 hover:underline cursor-pointer"
                >
                  Refresh Roster
                </button>
              </div>

              {loadingWorkers ? (
                <div className="p-6 flex items-center justify-center gap-2 text-slate-400 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Checking worker availability...</span>
                </div>
              ) : workers.length === 0 ? (
                <div className="p-4 text-center rounded-xl bg-[#0c1310] border border-slate-800 text-slate-400">
                  No registered workers found in roster.
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
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
                        className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                          !isAvailable
                            ? 'opacity-40 cursor-not-allowed bg-black/20 border-white/5'
                            : isSelected
                            ? 'bg-emerald-500/20 border-emerald-400 text-white cursor-pointer shadow-md'
                            : 'bg-black/30 border-white/10 hover:border-emerald-500/40 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                              isSelected
                                ? 'bg-emerald-500 text-white'
                                : isAvailable
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {worker.name ? worker.name.charAt(0).toUpperCase() : 'W'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white">
                                {worker.name || worker.username}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                @{worker.username}
                              </span>
                            </div>
                            {worker.phone && (
                              <span className="text-[10px] text-slate-400 block">
                                {worker.phone}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isAvailable ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Ready for Work
                            </span>
                          ) : worker.workerStatus === 'BUSY' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              <Clock className="w-3 h-3" />
                              Busy on Site
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-white/5">
                              Off Duty
                            </span>
                          )}

                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Exact Map URL & Navigation Pinpoint */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Exact Site Location in Map (GPS / Google Maps URL)</span>
                </label>
                {generatedMapSearchUrl && (
                  <a
                    href={generatedMapSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>Test Map Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <input
                type="text"
                value={mapUrl}
                onChange={(e) => setMapUrl(e.target.value)}
                placeholder="Paste Google Maps pin link (https://maps.app.goo.gl/...)"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* 3. Location Remarks & Road Access */}
            <div>
              <label className="font-bold text-slate-300 block mb-1">
                Location Remarks (Landmarks, Road Width & Access Notes)
              </label>
              <textarea
                rows={2}
                value={locationRemarks}
                onChange={(e) => setLocationRemarks(e.target.value)}
                placeholder="e.g. Near Nileshwar bridge, narrow lane entry, gate code #4421, JCB can enter easily"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            {/* 4. Machinery & Hourly Calculation Toggle (JCB / Earth Excavator / Crane) */}
            <div className="bg-[#121f18] border border-emerald-500/20 rounded-2xl p-3.5 space-y-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isHourlyCalculated}
                  onChange={(e) => setIsHourlyCalculated(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-black/40 border-white/20"
                />
                <div className="flex flex-col">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Timer className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Hourly Working Calculation (e.g. JCB / Excavator Meter)</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Enables on-site live working hours tracker when the worker arrives
                  </span>
                </div>
              </label>

              {isHourlyCalculated && (
                <div className="pt-2 pl-6 border-t border-white/5 flex items-center gap-3 animate-in fade-in">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Hourly Rate (₹ / Hour) Optional
                    </label>
                    <input
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 1200"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Target Completion Date
                    </label>
                    <input
                      type="date"
                      value={deadline}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 [color-scheme:dark]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 5. Dispatch Instructions & Work Details */}
            <div>
              <label className="font-bold text-slate-300 block mb-1">
                Other Work Details & Instructions for Worker
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Specific operational instructions, tools required, or customer preferences..."
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                * Note: Field worker will receive site location, map navigation, and technical tasks.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-emerald-500/20">
              <button
                type="button"
                onClick={onClose}
                disabled={assigning}
                className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={assigning || !selectedWorkerId}
                className="flex items-center gap-2 bg-[#2A835F] hover:bg-[#236D4F] disabled:opacity-50 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-emerald-950/40 cursor-pointer"
              >
                {assigning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Assigning Dispatch...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Confirm & Dispatch</span>
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
