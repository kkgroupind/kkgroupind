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
  Search,
  HardHat,
  Briefcase,
  FileText,
  Compass,
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
  const [workerSearch, setWorkerSearch] = useState('');

  // Dispatch parameters
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
      setWorkerSearch('');

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
      setError(err?.message || 'Failed to load workers roster');
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

  const filteredWorkers = useMemo(() => {
    if (!workerSearch.trim()) return workers;
    const q = workerSearch.toLowerCase().trim();
    return workers.filter(
      (w) =>
        (w.name && w.name.toLowerCase().includes(q)) ||
        (w.username && w.username.toLowerCase().includes(q)) ||
        (w.phone && w.phone.includes(q)),
    );
  }, [workers, workerSearch]);

  if (!isOpen || !enquiry) return null;

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkerId) {
      setError('Please select an operative from the available roster.');
      return;
    }

    const worker = workers.find((w) => w.id === selectedWorkerId);
    if (!worker || worker.workerStatus !== 'AVAILABLE') {
      setError('Selected operative is currently not available for assignment.');
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
      setError(err?.message || 'Failed to dispatch work order. Please try again.');
    } finally {
      setAssigning(false);
    }
  };

  // Google Maps preview URL
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-4xl bg-[#111827] border border-slate-700/80 rounded-[28px] shadow-[0_25px_70px_rgba(0,0,0,0.65)] overflow-hidden text-slate-200 my-auto z-10 flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0F172A]/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2A835F]/15 border border-[#2A835F]/30 flex items-center justify-center text-[#2A835F] shadow-inner">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Dispatch Work Order
                </h2>
                <span className="font-mono text-xs font-bold text-[#2A835F] bg-[#2A835F]/15 px-2.5 py-0.5 rounded-full border border-[#2A835F]/30">
                  {enquiry.trackingNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Review site specifics, configure machinery parameters, and assign an active operative
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={assigning}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Balanced 2-Column Bento Layout */}
        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* ========================================================
                LEFT COLUMN (5 Cols): Work Order Context & Location
            ======================================================== */}
            <div className="lg:col-span-5 space-y-4">
              {/* Service & Creator Card */}
              <div className="bg-[#1E293B]/60 border border-slate-750/70 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Service Order
                  </span>
                  {/* Origin Badge */}
                  {enquiry.createdByRole === 'OFFICE_STAFF' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                      🏢 Office Staff: {enquiry.creator?.name || 'Staff Member'}
                    </span>
                  ) : enquiry.createdByRole === 'SUPER_ADMIN' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      👑 Super Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#2A835F]/15 text-[#34d399] border border-[#2A835F]/30">
                      🌐 Customer Web
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white leading-snug">
                    {enquiry.serviceName}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium">{enquiry.customerName}</span>
                    <span className="text-slate-500">•</span>
                    <span className="font-mono text-slate-400">{enquiry.customerPhone}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-700/50 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Customer Requirements
                  </span>
                  <p className="text-slate-300 italic bg-black/20 p-2.5 rounded-xl border border-white/5 leading-relaxed">
                    &ldquo;{enquiry.message}&rdquo;
                  </p>
                </div>
              </div>

              {/* Site Location & GPS Directions */}
              <div className="bg-[#1E293B]/60 border border-slate-750/70 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#2A835F]" />
                    <span>Site Location (Kerala)</span>
                  </span>
                  {generatedMapSearchUrl && (
                    <a
                      href={generatedMapSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#34d399] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>Preview Pin</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="text-xs text-slate-200 font-semibold bg-black/20 p-2.5 rounded-xl border border-white/5">
                  {enquiry.location || `${enquiry.city || ''}, ${enquiry.district || 'Kasaragod'}, Kerala`}
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Map GPS URL or Coordinates
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={mapUrl}
                      onChange={(e) => setMapUrl(e.target.value)}
                      placeholder="Paste Google Maps URL (https://maps.app.goo.gl/...)"
                      className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2A835F] focus:ring-1 focus:ring-[#2A835F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Road Access &amp; Landmark Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={locationRemarks}
                    onChange={(e) => setLocationRemarks(e.target.value)}
                    placeholder="e.g. Near Nileshwar bridge, narrow lane entry, gate code #4421, JCB can enter easily"
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2A835F] focus:ring-1 focus:ring-[#2A835F] resize-none"
                  />
                </div>
              </div>
            </div>

            {/* ========================================================
                RIGHT COLUMN (7 Cols): Operative Selection & Dispatch
            ======================================================== */}
            <div className="lg:col-span-7 space-y-4">
              {/* Roster Availability Statistics Pills */}
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-[#1E293B]/70 border border-[#2A835F]/30 rounded-2xl p-2.5 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#34d399] block">
                    Available
                  </span>
                  <span className="text-lg font-black text-white">{workerMetrics.available}</span>
                </div>
                <div className="bg-[#1E293B]/70 border border-amber-500/30 rounded-2xl p-2.5 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                    Busy
                  </span>
                  <span className="text-lg font-black text-white">{workerMetrics.busy}</span>
                </div>
                <div className="bg-[#1E293B]/70 border border-slate-750 rounded-2xl p-2.5 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Off Duty
                  </span>
                  <span className="text-lg font-black text-slate-300">{workerMetrics.offDuty}</span>
                </div>
                <div className="bg-[#1E293B]/70 border border-slate-750 rounded-2xl p-2.5 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Total
                  </span>
                  <span className="text-lg font-black text-slate-300">{workerMetrics.total}</span>
                </div>
              </div>

              {/* Operative Selection Box */}
              <div className="bg-[#1E293B]/60 border border-slate-750/70 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <HardHat className="w-3.5 h-3.5 text-[#2A835F]" />
                    <span>Select Available Operative *</span>
                  </label>
                  <button
                    type="button"
                    onClick={fetchWorkers}
                    className="text-[11px] text-[#34d399] hover:underline cursor-pointer font-medium"
                  >
                    Refresh Roster
                  </button>
                </div>

                {/* Search in workers */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by worker name, username, or phone..."
                    value={workerSearch}
                    onChange={(e) => setWorkerSearch(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2A835F]"
                  />
                </div>

                {/* Worker Cards Grid / Scroll Area */}
                {loadingWorkers ? (
                  <div className="p-8 flex items-center justify-center gap-2 text-slate-400 text-xs">
                    <Loader2 className="w-4 h-4 animate-spin text-[#2A835F]" />
                    <span>Checking operative availability...</span>
                  </div>
                ) : filteredWorkers.length === 0 ? (
                  <div className="p-6 text-center rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs">
                    No matching operatives found.
                  </div>
                ) : (
                  <div className="max-h-52 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {filteredWorkers.map((worker) => {
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
                              ? 'opacity-40 cursor-not-allowed bg-slate-900/30 border-slate-800/60'
                              : isSelected
                              ? 'bg-[#2A835F]/20 border-[#2A835F] text-white shadow-md cursor-pointer'
                              : 'bg-slate-900/70 border-slate-750 hover:border-slate-600 hover:bg-slate-800/80 cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                                isSelected
                                  ? 'bg-[#2A835F] text-white'
                                  : isAvailable
                                  ? 'bg-[#2A835F]/15 text-[#34d399]'
                                  : 'bg-slate-800 text-slate-500'
                              }`}
                            >
                              {worker.name ? worker.name.charAt(0).toUpperCase() : 'W'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-white text-xs">
                                  {worker.name || worker.username}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  @{worker.username}
                                </span>
                              </div>
                              {worker.phone && (
                                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                                  {worker.phone}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isAvailable ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#2A835F]/15 text-[#34d399] border border-[#2A835F]/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse" />
                                Ready
                              </span>
                            ) : worker.workerStatus === 'BUSY' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                <Clock className="w-3 h-3" />
                                On Site
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                                Off Duty
                              </span>
                            )}

                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-[#34d399]" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Machinery & Hourly Calculation Card (JCB / Earth Equipment) */}
              <div className="bg-[#1E293B]/60 border border-slate-750/70 rounded-2xl p-4 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isHourlyCalculated}
                    onChange={(e) => setIsHourlyCalculated(e.target.checked)}
                    className="w-4 h-4 rounded text-[#2A835F] focus:ring-[#2A835F] bg-slate-900 border-slate-600"
                  />
                  <div className="flex flex-col">
                    <span className="font-bold text-white text-xs flex items-center gap-1.5">
                      <Timer className="w-3.5 h-3.5 text-[#34d399]" />
                      <span>Hourly Meter Calculation (e.g. JCB / Excavator)</span>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Activates on-site chronometer for heavy equipment work
                    </span>
                  </div>
                </label>

                {isHourlyCalculated && (
                  <div className="pt-3 border-t border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Hourly Rate (₹ / Hour)
                      </label>
                      <input
                        type="number"
                        value={hourlyRate}
                        onChange={(e) =>
                          setHourlyRate(e.target.value === '' ? '' : Number(e.target.value))
                        }
                        placeholder="e.g. 1200"
                        className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2A835F]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Target Completion Date
                      </label>
                      <input
                        type="date"
                        value={deadline}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#2A835F] [color-scheme:dark]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Dispatch Operational Notes */}
              <div className="bg-[#1E293B]/60 border border-slate-750/70 rounded-2xl p-4 space-y-2">
                <label className="text-xs font-bold text-white block">
                  Instructions for Operative (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special instructions, equipment to bring, safety gear or arrival timing..."
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2A835F] resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-[#0F172A]/90 backdrop-blur-md shrink-0">
          <p className="text-[11px] text-slate-400 hidden sm:block">
            * Field operative will receive GPS navigation, site instructions, and operational scope.
          </p>

          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={assigning}
              className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleAssign}
              disabled={assigning || !selectedWorkerId}
              className="flex items-center gap-2 bg-[#2A835F] hover:bg-[#236D4F] disabled:opacity-50 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-[#2A835F]/20 active:scale-95 cursor-pointer text-xs"
            >
              {assigning ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Assigning Dispatch...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Confirm &amp; Dispatch</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
