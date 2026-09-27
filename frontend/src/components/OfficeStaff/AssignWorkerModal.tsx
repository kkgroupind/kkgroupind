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
            defaultWageRate = defaultWageRate || 80;
            defaultEstUnits = defaultEstUnits || 10;
          } else if (isMachinery) {
            detectedType = 'HOURLY';
            detectedUnit = 'Hour';
            defaultCustRate = defaultCustRate || 1600;
            defaultWageRate = defaultWageRate || 900;
            defaultEstUnits = defaultEstUnits || 4;
          } else if (sName.includes('paint') || sName.includes('tile') || sName.includes('marble') || sName.includes('granite')) {
            detectedType = 'PER_SQFT';
            detectedUnit = 'Sq. Ft.';
            defaultCustRate = defaultCustRate || (sName.includes('tile') ? 45 : 24);
            defaultWageRate = defaultWageRate || (sName.includes('tile') ? 28 : 14);
            defaultEstUnits = defaultEstUnits || 300;
          } else if (sName.includes('electr') || sName.includes('wir')) {
            detectedType = 'PER_POINT';
            detectedUnit = 'Point';
            defaultCustRate = defaultCustRate || 450;
            defaultWageRate = defaultWageRate || 260;
            defaultEstUnits = defaultEstUnits || 8;
          } else if (sName.includes('bore') || sName.includes('drill')) {
            detectedType = 'PER_FOOT';
            detectedUnit = 'Foot';
            defaultCustRate = defaultCustRate || 115;
            defaultWageRate = defaultWageRate || 65;
            defaultEstUnits = defaultEstUnits || 200;
          } else if (sName.includes('mason') || sName.includes('brick')) {
            detectedType = 'DAILY_WAGE';
            detectedUnit = 'Day / Shift';
            defaultCustRate = defaultCustRate || 1600;
            defaultWageRate = defaultWageRate || 1100;
            defaultEstUnits = defaultEstUnits || 2;
          } else if (sName.includes('plumb')) {
            detectedType = 'FIXED_VISIT';
            detectedUnit = 'Visit / Inspection';
            defaultCustRate = defaultCustRate || 350;
            defaultWageRate = defaultWageRate || 220;
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
    if (!selectedWorkerId) {
      setError('Please select an operative from the available list.');
      return;
    }

    const worker = workers.find((w) => w.id === selectedWorkerId);
    if (!worker || worker.workerStatus !== 'AVAILABLE') {
      setError('The selected operative is currently unavailable.');
      return;
    }

    setAssigning(true);
    setError(null);

    try {
      const isHourly = wageType === 'HOURLY';
      await EnquiryService.assignWorker(
        enquiry.id,
        {
          workerId: selectedWorkerId,
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
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#091540] flex items-center gap-1.5">
                    <HardHat className="w-4 h-4 text-[#1B2CC1]" />
                    <span>Select Operative *</span>
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
                              ? 'opacity-50 cursor-not-allowed bg-slate-100 border-slate-200'
                              : isSelected
                              ? 'bg-[#1B2CC1]/10 border-[#1B2CC1] text-[#091540] shadow-xs cursor-pointer'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center gap-3">
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

                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-[#1B2CC1]" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Wage & Billing Parameters */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#1B2CC1]" />
                    <h4 className="font-bold text-[#091540] text-xs">
                      Wage &amp; Billing Calculation
                    </h4>
                  </div>
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-800 border border-amber-500/20">
                    {wageType}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Wage Model
                    </label>
                    <AdminDropdown
                      options={ASSIGN_WAGE_TYPE_OPTIONS}
                      value={wageType}
                      onChange={(newType) => {
                        setWageType(newType);
                        if (newType === 'PER_TREE') { setUnitLabel('Tree'); setUnitRate(120); setWorkerUnitWage(80); setEstimatedUnits(10); }
                        else if (newType === 'HOURLY') { setUnitLabel('Hour'); setUnitRate(1600); setWorkerUnitWage(900); setEstimatedUnits(4); }
                        else if (newType === 'PER_SQFT') { setUnitLabel('Sq. Ft.'); setUnitRate(28); setWorkerUnitWage(16); setEstimatedUnits(300); }
                        else if (newType === 'PER_POINT') { setUnitLabel('Point'); setUnitRate(450); setWorkerUnitWage(260); setEstimatedUnits(8); }
                        else if (newType === 'PER_FOOT') { setUnitLabel('Foot'); setUnitRate(115); setWorkerUnitWage(65); setEstimatedUnits(200); }
                        else if (newType === 'DAILY_WAGE') { setUnitLabel('Day / Shift'); setUnitRate(1600); setWorkerUnitWage(1100); setEstimatedUnits(2); }
                        else if (newType === 'FIXED_VISIT') { setUnitLabel('Visit'); setUnitRate(350); setWorkerUnitWage(220); setEstimatedUnits(1); }
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
                      placeholder="e.g. 80"
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
            The assigned operative will receive mobile notification and job navigation.
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
              disabled={assigning || !selectedWorkerId}
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
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
