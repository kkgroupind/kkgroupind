'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  X,
  Phone,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Clock,
  Send,
  User,
  MapPin,
  ExternalLink,
  HardHat,
  Search,
  Sparkles,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { EnquiryService, ServiceEnquiry, WorkerWithAvailability } from '@/services';
import { AdminDropdown, AdminDropdownOption } from '@/components/Admin/admin-dropdown';

const ASSIGN_WAGE_TYPE_OPTIONS: AdminDropdownOption[] = [
  { value: 'PER_TREE', label: '🌴 Tree Count (Coconut / Palm Plucking)' },
  { value: 'HOURLY', label: '⏱️ Hourly Meter (JCB / Heavy Equipment)' },
  { value: 'PER_SQFT', label: '📐 Square Feet Area (Painting / Tiling)' },
  { value: 'PER_POINT', label: '⚡ Electrical Points (Concealed Wiring)' },
  { value: 'PER_FOOT', label: '📏 Foot Depth (Borewell Drilling)' },
  { value: 'DAILY_WAGE', label: '📅 Daily Shift (Masonry / Construction)' },
  { value: 'FIXED_VISIT', label: '🔧 Fixed Visit (Plumbing / Inspection)' },
];

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

  // Multi-Worker Squad Dispatch state
  const [isSquadMode, setIsSquadMode] = useState(false);
  const [selectedSquadWorkerIds, setSelectedSquadWorkerIds] = useState<string[]>([]);
  const [leadWorkerId, setLeadWorkerId] = useState<string | null>(null);

  // Wage billing toggle — hidden by default, set after completion
  const [showWageBilling, setShowWageBilling] = useState(false);

  // Dispatch parameters
  const [mapUrl, setMapUrl] = useState('');
  const [locationRemarks, setLocationRemarks] = useState('');
  const [notes, setNotes] = useState('');
  const [wageType, setWageType] = useState('HOURLY');
  const [unitLabel, setUnitLabel] = useState('Hour');
  const [unitRate, setUnitRate] = useState<number | ''>('');
  const [workerUnitWage, setWorkerUnitWage] = useState<number | ''>('');
  const [estimatedUnits, setEstimatedUnits] = useState<number | ''>('');
  const [deadline, setDeadline] = useState('');

  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && token) {
      fetchWorkers();
      setSelectedWorkerId(null);
      setSelectedSquadWorkerIds([]);
      setLeadWorkerId(null);
      setIsSquadMode(false);
      setShowWageBilling(false);
      setError(null);
      setWorkerSearch('');

      if (enquiry) {
        setMapUrl(enquiry.mapUrl || '');
        setLocationRemarks(enquiry.locationRemarks || '');
        setNotes(enquiry.notes || '');

        const sName = (enquiry.serviceName || '').toLowerCase();
        let detectedType = enquiry.wageType || 'HOURLY';
        let detectedUnit = enquiry.unitLabel || 'Hour';
        let defaultCustRate: number | '' = enquiry.unitRate ?? enquiry.hourlyRate ?? '';
        let defaultWageRate: number | '' = enquiry.workerUnitWage ?? '';
        let defaultEstUnits: number | '' = enquiry.estimatedUnits ?? '';

        const isMachinery =
          sName.includes('jcb') ||
          sName.includes('excavat') ||
          sName.includes('loader') ||
          sName.includes('crane') ||
          sName.includes('earthmov') ||
          sName.includes('tractor');

        const shouldAutoClassify =
          !enquiry.wageType ||
          (enquiry.wageType === 'HOURLY' && !isMachinery);

        if (shouldAutoClassify) {
          if (sName.includes('cococare') || sName.includes('coconut') || sName.includes('palm') || sName.includes('tree')) {
            detectedType = 'PER_TREE';
            detectedUnit = 'Tree';
            defaultCustRate = defaultCustRate || 120;
            defaultEstUnits = defaultEstUnits || 10;
          } else if (isMachinery) {
            detectedType = 'HOURLY';
            detectedUnit = 'Hour';
            defaultCustRate = defaultCustRate || 1600;
            defaultEstUnits = defaultEstUnits || 4;
          } else if (sName.includes('paint') || sName.includes('tile') || sName.includes('marble') || sName.includes('granite')) {
            detectedType = 'PER_SQFT';
            detectedUnit = 'Sq. Ft.';
            defaultCustRate = defaultCustRate || (sName.includes('tile') ? 45 : 24);
            defaultEstUnits = defaultEstUnits || 300;
          } else if (sName.includes('electr') || sName.includes('wir')) {
            detectedType = 'PER_POINT';
            detectedUnit = 'Point';
            defaultCustRate = defaultCustRate || 450;
            defaultEstUnits = defaultEstUnits || 8;
          } else if (sName.includes('bore') || sName.includes('drill')) {
            detectedType = 'PER_FOOT';
            detectedUnit = 'Foot';
            defaultCustRate = defaultCustRate || 115;
            defaultEstUnits = defaultEstUnits || 200;
          } else if (sName.includes('mason') || sName.includes('brick')) {
            detectedType = 'DAILY_WAGE';
            detectedUnit = 'Day / Shift';
            defaultCustRate = defaultCustRate || 1600;
            defaultEstUnits = defaultEstUnits || 2;
          } else if (sName.includes('plumb')) {
            detectedType = 'FIXED_VISIT';
            detectedUnit = 'Visit / Inspection';
            defaultCustRate = defaultCustRate || 350;
            defaultEstUnits = defaultEstUnits || 1;
          }
        }

        setWageType(detectedType);
        setUnitLabel(detectedUnit);
        setUnitRate(defaultCustRate);
        setWorkerUnitWage(defaultWageRate);
        setEstimatedUnits(defaultEstUnits);
        setDeadline(enquiry.deadline ? enquiry.deadline.split('T')[0] : '');
      }
    }
  }, [isOpen, token, enquiry]);

  const fetchWorkers = async () => {
    if (!token) return;
    setLoadingWorkers(true);
    try {
      const res = await EnquiryService.getActiveWorkers(token);
      setWorkers(res.workers || []);
    } catch (err) {
      console.error('Failed to load workers for assignment', err);
    } finally {
      setLoadingWorkers(false);
    }
  };

  const filteredWorkers = useMemo(() => {
    return workers.filter((w) => {
      const q = workerSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        (w.name || '').toLowerCase().includes(q) ||
        (w.username || '').toLowerCase().includes(q) ||
        (w.phone || '').includes(q)
      );
    });
  }, [workers, workerSearch]);

  if (!isOpen || !enquiry) return null;

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSquadMode) {
      if (selectedSquadWorkerIds.length === 0) {
        setError('Please select at least one operative for the squad.');
        return;
      }
      const unavailable = workers.find(
        (w) => selectedSquadWorkerIds.includes(w.id) && w.workerStatus !== 'AVAILABLE',
      );
      if (unavailable) {
        setError(`Operative ${unavailable.name || unavailable.username} is currently unavailable.`);
        return;
      }
    } else {
      if (!selectedWorkerId) {
        setError('Please select an operative from the available list.');
        return;
      }
      const worker = workers.find((w) => w.id === selectedWorkerId);
      if (!worker || worker.workerStatus !== 'AVAILABLE') {
        setError('The selected operative is currently unavailable.');
        return;
      }
    }

    setAssigning(true);
    setError(null);

    try {
      const isHourly = wageType === 'HOURLY';
      const effectiveWorkerId = isSquadMode
        ? leadWorkerId || selectedSquadWorkerIds[0]
        : selectedWorkerId!;

      await EnquiryService.assignWorker(
        enquiry.id,
        {
          workerId: effectiveWorkerId,
          squadWorkerIds: isSquadMode ? selectedSquadWorkerIds : undefined,
          notes: notes.trim() || undefined,
          mapUrl: mapUrl.trim() || undefined,
          locationRemarks: locationRemarks.trim() || undefined,
          isHourlyCalculated: isHourly,
          hourlyRate: isHourly && unitRate !== '' ? Number(unitRate) : undefined,
          wageType,
          unitLabel: unitLabel.trim() || 'Unit',
          unitRate: unitRate === '' ? undefined : Number(unitRate),
          workerUnitWage: workerUnitWage === '' ? undefined : Number(workerUnitWage),
          estimatedUnits: estimatedUnits === '' ? undefined : Number(estimatedUnits),
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

  const generatedMapSearchUrl =
    mapUrl.trim() ||
    (enquiry.location
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${enquiry.location}, Kerala, India`,
        )}`
      : '');

  if (enquiry?.status === 'COMPLETED') {
    return (
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      >
        <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
        <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 z-10 text-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-[#091540]">Work Already Completed</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Work order <strong className="font-mono text-[#1B2CC1]">{enquiry.trackingNumber}</strong> has already been completed by operative <strong className="text-emerald-700">{enquiry.worker?.name || enquiry.worker?.username || 'assigned worker'}</strong>. Completed work orders cannot be reassigned.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-[#091540] hover:bg-[#15239E] text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-4xl bg-white border border-[#7692FF]/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 text-slate-800">
        {/* Top subtle glow line matching brand palette */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#1B2CC1]/50 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1B2CC1]/10 border border-[#1B2CC1]/20 flex items-center justify-center text-[#1B2CC1]">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#091540]">Dispatch Work Order</h2>
                <span className="font-mono text-xs font-bold text-[#1B2CC1] bg-[#1B2CC1]/10 px-2.5 py-0.5 rounded-lg border border-[#1B2CC1]/20">
                  {enquiry.trackingNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Assign operative, review location specifics, and configure wage parameters
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={assigning}
            className="p-2 text-slate-400 hover:text-[#091540] bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* LEFT COLUMN: Job Overview & Location (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Job Specification Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Order Details
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#091540]">
                    {enquiry.serviceName}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-700">{enquiry.customerName}</span>
                    <span>•</span>
                    <span className="font-mono">{enquiry.customerPhone}</span>
                  </div>
                </div>

                {/* Customer Privacy Notice */}
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-start gap-2.5 text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <strong className="font-bold text-emerald-950 block">Customer Privacy Active</strong>
                    <p className="text-[11px] text-emerald-800 leading-normal">
                      Client name &amp; contact remain confidential to the office desk. Dispatched workers receive work location, map directions, and office desk coordinator contact only.
                    </p>
                  </div>
                </div>

                {enquiry.message && (
                  <div className="pt-2 border-t border-slate-200 text-xs">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                      Customer Scope
                    </span>
                    <p className="text-slate-700 text-xs italic bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                      &ldquo;{enquiry.message}&rdquo;
                    </p>
                  </div>
                )}
              </div>

              {/* Site Location & Instructions */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#1B2CC1]" />
                    <span>Site Location (Kerala)</span>
                  </span>
                  {generatedMapSearchUrl && (
                    <a
                      href={generatedMapSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#1B2CC1] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="text-xs text-slate-800 font-medium bg-white p-2.5 rounded-lg border border-slate-200">
                  {enquiry.location || `${enquiry.city || ''}, ${enquiry.district || 'Kerala'}`}
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5">
                    Google Maps Link (Optional)
                  </label>
                  <input
                    type="text"
                    value={mapUrl}
                    onChange={(e) => setMapUrl(e.target.value)}
                    placeholder="https://maps.app.goo.gl/..."
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-[#091540] placeholder-slate-400 focus:outline-none focus:border-[#1B2CC1] transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5">
                    Landmark &amp; Road Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={locationRemarks}
                    onChange={(e) => setLocationRemarks(e.target.value)}
                    placeholder="e.g. Near bridge, wide road for JCB entry..."
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-[#091540] placeholder-slate-400 focus:outline-none focus:border-[#1B2CC1] transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Operative Roster & Wage Setup (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Select Operative Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                {/* Multi-Worker Squad Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#EAF4EE]/90 border border-[#88B793]/40">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#2A835F]/10 border border-[#2A835F]/20 flex items-center justify-center text-[#2A835F]">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#091540] flex items-center gap-1.5">
                        <span>Needs More Workers (Squad Deployment)</span>
                        {isSquadMode && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.2 rounded-md bg-[#134B4C] text-white">
                            {selectedSquadWorkerIds.length} Selected
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        കൂടുതൽ തൊഴിലാളികൾ ആവശ്യമാണ് (Big job requiring multiple workers)
                      </div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSquadMode}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setIsSquadMode(checked);
                        if (checked) {
                          if (selectedWorkerId && !selectedSquadWorkerIds.includes(selectedWorkerId)) {
                            setSelectedSquadWorkerIds([selectedWorkerId]);
                            setLeadWorkerId(selectedWorkerId);
                          }
                        } else {
                          if (selectedSquadWorkerIds.length > 0) {
                            setSelectedWorkerId(leadWorkerId || selectedSquadWorkerIds[0]);
                          }
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2A835F]" />
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#091540] flex items-center gap-1.5">
                    <HardHat className="w-4 h-4 text-[#1B2CC1]" />
                    <span>
                      {isSquadMode
                        ? 'Select Squad Members (Tick all needed workers) *'
                        : 'Select Operative *'}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={fetchWorkers}
                    className="text-xs text-[#1B2CC1] hover:underline cursor-pointer font-medium"
                  >
                    Refresh List
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
                    className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-xs text-[#091540] placeholder-slate-400 focus:outline-none focus:border-[#1B2CC1] transition-all"
                  />
                </div>

                {/* Worker List */}
                {loadingWorkers ? (
                  <div className="p-6 flex items-center justify-center gap-2 text-slate-400 text-xs">
                    <Loader2 className="w-4 h-4 animate-spin text-[#1B2CC1]" />
                    <span>Checking worker availability...</span>
                  </div>
                ) : filteredWorkers.length === 0 ? (
                  <div className="p-6 text-center rounded-xl bg-white border border-slate-200 text-slate-500 text-xs">
                    No matching operatives found.
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {filteredWorkers.map((worker) => {
                      const isAvailable = worker.workerStatus === 'AVAILABLE';
                      const isSelectedInSingle = !isSquadMode && selectedWorkerId === worker.id;
                      const isSelectedInSquad = isSquadMode && selectedSquadWorkerIds.includes(worker.id);
                      const isLead = isSquadMode && (leadWorkerId === worker.id || (!leadWorkerId && selectedSquadWorkerIds[0] === worker.id));

                      return (
                        <div
                          key={worker.id}
                          onClick={() => {
                            if (!isAvailable) return;
                            if (isSquadMode) {
                              if (selectedSquadWorkerIds.includes(worker.id)) {
                                const remaining = selectedSquadWorkerIds.filter((id) => id !== worker.id);
                                setSelectedSquadWorkerIds(remaining);
                                if (leadWorkerId === worker.id) {
                                  setLeadWorkerId(remaining[0] || null);
                                }
                              } else {
                                const updated = [...selectedSquadWorkerIds, worker.id];
                                setSelectedSquadWorkerIds(updated);
                                if (!leadWorkerId) {
                                  setLeadWorkerId(worker.id);
                                }
                              }
                              setError(null);
                            } else {
                              setSelectedWorkerId(worker.id);
                              setError(null);
                            }
                          }}
                          className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                            !isAvailable
                              ? 'opacity-50 cursor-not-allowed bg-slate-100 border-slate-200'
                              : isSelectedInSquad || isSelectedInSingle
                              ? 'bg-[#1B2CC1]/10 border-[#1B2CC1] text-[#091540] shadow-xs cursor-pointer'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {isSquadMode && (
                              <input
                                type="checkbox"
                                checked={isSelectedInSquad}
                                readOnly
                                className="w-4 h-4 rounded text-[#2A835F] focus:ring-0"
                              />
                            )}
                            <div className="w-9 h-9 rounded-xl bg-[#1B2CC1]/10 border border-[#1B2CC1]/20 flex items-center justify-center font-bold text-xs text-[#1B2CC1] shrink-0">
                              {worker.name ? worker.name.charAt(0).toUpperCase() : 'W'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-[#091540] text-xs">
                                  {worker.name || worker.username}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  @{worker.username}
                                </span>
                              </div>
                              {worker.phone && (
                                <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                                  {worker.phone}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isSquadMode && isSelectedInSquad && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLeadWorkerId(worker.id);
                                }}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                                  isLead
                                    ? 'bg-[#134B4C] text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {isLead ? '👑 Squad Leader' : 'Set Lead'}
                              </button>
                            )}

                            {isAvailable ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Ready
                              </span>
                            ) : worker.workerStatus === 'BUSY' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-700 border border-amber-500/30">
                                <Clock className="w-3 h-3" />
                                On Site
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                                Off Duty
                              </span>
                            )}

                            {isSelectedInSingle && (
                              <CheckCircle2 className="w-4 h-4 text-[#1B2CC1]" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Squad Summary Strip — shows selected members when in squad mode */}
              {isSquadMode && selectedSquadWorkerIds.length > 0 && (
                <div className="p-3 rounded-xl bg-[#EAF4EE]/80 border border-[#88B793]/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#134B4C] uppercase tracking-wider">
                      Selected Squad ({selectedSquadWorkerIds.length} Operatives)
                    </span>
                    <button
                      type="button"
                      onClick={() => { setSelectedSquadWorkerIds([]); setLeadWorkerId(null); }}
                      className="text-[10px] text-rose-500 hover:text-rose-700 font-semibold cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSquadWorkerIds.map((id) => {
                      const w = workers.find((x) => x.id === id);
                      const isLdr = leadWorkerId === id || (!leadWorkerId && selectedSquadWorkerIds[0] === id);
                      return (
                        <span
                          key={id}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            isLdr
                              ? 'bg-[#134B4C] text-white border-[#134B4C]'
                              : 'bg-white text-[#091540] border-slate-300'
                          }`}
                        >
                          {isLdr && <span>👑</span>}
                          <span>{w?.name || w?.username || id.slice(0, 6)}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const remaining = selectedSquadWorkerIds.filter((x) => x !== id);
                              setSelectedSquadWorkerIds(remaining);
                              if (leadWorkerId === id) setLeadWorkerId(remaining[0] || null);
                            }}
                            className="ml-0.5 hover:text-rose-500 cursor-pointer font-bold leading-none"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                  {selectedSquadWorkerIds.length > 1 && !leadWorkerId && (
                    <p className="text-[10px] text-amber-600">⚠️ Tap &ldquo;Set Lead&rdquo; on one worker to assign them as squad leader.</p>
                  )}
                </div>
              )}

              {/* Wage & Billing Parameters */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                {/* Section Header — always visible with toggle */}
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#1B2CC1]" />
                    <div>
                      <h4 className="font-bold text-[#091540] text-xs">Wage &amp; Billing</h4>
                      <span className="text-[10px] text-slate-400">Set rates now or finalize after completion</span>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer" title="Enable pre-fill wage & billing">
                    <span className="text-[10px] font-semibold text-slate-500">
                      {showWageBilling ? 'Pre-fill enabled' : 'Post-completion'}
                    </span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={showWageBilling}
                        onChange={(e) => setShowWageBilling(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1B2CC1]" />
                    </div>
                  </label>
                </div>

                {/* Always-visible: Wage Model + Target Date */}
                <div className="p-4 space-y-3 bg-white">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Wage Model (for worker tracking)
                      </label>
                      <AdminDropdown
                        options={ASSIGN_WAGE_TYPE_OPTIONS}
                        value={wageType}
                        onChange={(newType) => {
                          setWageType(newType);
                          if (newType === 'PER_TREE') { setUnitLabel('Tree'); setUnitRate(120); setEstimatedUnits(10); }
                          else if (newType === 'HOURLY') { setUnitLabel('Hour'); setUnitRate(1600); setEstimatedUnits(4); }
                          else if (newType === 'PER_SQFT') { setUnitLabel('Sq. Ft.'); setUnitRate(28); setEstimatedUnits(300); }
                          else if (newType === 'PER_POINT') { setUnitLabel('Point'); setUnitRate(450); setEstimatedUnits(8); }
                          else if (newType === 'PER_FOOT') { setUnitLabel('Foot'); setUnitRate(115); setEstimatedUnits(200); }
                          else if (newType === 'DAILY_WAGE') { setUnitLabel('Day / Shift'); setUnitRate(1600); setEstimatedUnits(2); }
                          else if (newType === 'FIXED_VISIT') { setUnitLabel('Visit'); setUnitRate(350); setEstimatedUnits(1); }
                        }}
                        variant="blue"
                        size="sm"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Target Completion Date
                      </label>
                      <input
                        type="date"
                        value={deadline}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-[#091540] focus:outline-none focus:border-[#1B2CC1]"
                      />
                    </div>
                  </div>

                  {/* Collapsed state: info message */}
                  {!showWageBilling && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-800">
                      <span className="text-base leading-none mt-0.5">💡</span>
                      <span>
                        <strong>Rates set after work completion.</strong> Worker wages and client billing will be finalized via{' '}
                        <span className="font-bold text-amber-900">&quot;Finalize Payout&quot;</span> once the job is marked complete.
                        Workers only see their task type &amp; location — never client rates.
                      </span>
                    </div>
                  )}

                  {/* Expanded state: full billing fields */}
                  {showWageBilling && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            Est. Units ({unitLabel})
                          </label>
                          <input
                            type="number"
                            value={estimatedUnits}
                            onChange={(e) => setEstimatedUnits(e.target.value === '' ? '' : Number(e.target.value))}
                            placeholder="e.g. 15"
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-[#091540] placeholder-slate-400 focus:outline-none focus:border-[#1B2CC1]"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                            Worker Pay (₹/{unitLabel})
                          </label>
                          <input
                            type="number"
                            value={workerUnitWage}
                            onChange={(e) => setWorkerUnitWage(e.target.value === '' ? '' : Number(e.target.value))}
                            placeholder="Optional"
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-emerald-700 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[#1B2CC1] uppercase tracking-wider block mb-1">
                            Client Rate (₹/{unitLabel})
                          </label>
                          <input
                            type="number"
                            value={unitRate}
                            onChange={(e) => setUnitRate(e.target.value === '' ? '' : Number(e.target.value))}
                            placeholder="e.g. 120"
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-[#1B2CC1] placeholder-slate-400 focus:outline-none focus:border-[#1B2CC1]"
                          />
                        </div>
                      </div>

                      {/* Calculation Preview */}
                      {estimatedUnits !== '' && (workerUnitWage !== '' || unitRate !== '') && (
                        <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs">
                          <div className="text-emerald-700 font-semibold">
                            <span>Worker Wage: </span>
                            <span className="font-bold">
                              ₹{Math.round(Number(estimatedUnits) * Number(workerUnitWage || 0)).toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="text-[#1B2CC1] font-semibold">
                            <span>Client Billable: </span>
                            <span className="font-bold">
                              ₹{Math.round(Number(estimatedUnits) * Number(unitRate || 0)).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Notes for Worker */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Instructions for Operative (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special instructions, required equipment, safety gear or arrival timing..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-[#091540] placeholder-slate-400 focus:outline-none focus:border-[#1B2CC1] resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pinned Footer matching brand styling */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 shrink-0 flex items-center justify-between">
          <span className="text-xs text-slate-500 hidden sm:inline">
            {isSquadMode && selectedSquadWorkerIds.length > 0
              ? `👥 Squad of ${selectedSquadWorkerIds.length} will receive the job and co-worker details.`
              : 'The assigned operative will receive mobile notification and job navigation.'}
          </span>
          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={assigning}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleAssign}
              disabled={assigning || (isSquadMode ? selectedSquadWorkerIds.length === 0 : !selectedWorkerId)}
              className="px-6 py-2.5 rounded-xl bg-[#1B2CC1] hover:bg-[#15239E] text-white text-sm font-bold shadow-md shadow-[#1B2CC1]/25 hover:shadow-[#1B2CC1]/40 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {assigning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Dispatching...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Confirm Dispatch</span>
                </>
              )}
              {!assigning && (
                <span className="text-[11px] font-semibold text-blue-100/80">
                  {isSquadMode && selectedSquadWorkerIds.length > 0
                    ? `Dispatch ${selectedSquadWorkerIds.length} workers`
                    : ''}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
