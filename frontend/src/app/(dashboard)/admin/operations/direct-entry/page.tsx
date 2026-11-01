'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useAdminTheme } from '@/context/admin-theme-context';
import {
  EnquiryService,
  ServiceEnquiry,
  WorkerWithAvailability,
} from '@/services';
import {
  Zap,
  CheckCircle2,
  Clock,
  HardHat,
  IndianRupee,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  Plus,
  Minus,
  Sparkles,
  CheckCircle,
  AlertCircle,
  FileText,
  UserCheck,
  Building2,
  TreePalm,
  Timer,
  CreditCard,
  QrCode,
  Banknote,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { CUSTOMER_SERVICES, getServiceBanner } from '@/utils/service-options';

const KERALA_DISTRICTS = [
  'Kasaragod',
  'Kannur',
  'Wayanad',
  'Kozhikode',
  'Malappuram',
  'Palakkad',
  'Thrissur',
  'Ernakulam',
  'Idukki',
  'Kottayam',
  'Alappuzha',
  'Pathanamthitta',
  'Kollam',
  'Thiruvananthapuram',
];

interface ServicePreset {
  id: string;
  name: string;
  wageType: string;
  unitLabel: string;
  defaultWorkerWage: number;
  defaultCustomerRate: number;
  defaultUnits: number;
}

const SERVICE_PRESETS: ServicePreset[] = [
  {
    id: 'cococare',
    name: 'Cococare - Palm Harvesting & Crown Care',
    wageType: 'PER_TREE',
    unitLabel: 'Tree',
    defaultWorkerWage: 80,
    defaultCustomerRate: 120,
    defaultUnits: 12,
  },
  {
    id: 'jcb',
    name: 'JCB 3DX Heavy Excavation Squad',
    wageType: 'HOURLY',
    unitLabel: 'Hour',
    defaultWorkerWage: 900,
    defaultCustomerRate: 1500,
    defaultUnits: 4,
  },
  {
    id: 'grass',
    name: 'Weed, Shrub & Lawn Clearing',
    wageType: 'PER_SQFT',
    unitLabel: 'Sq. Ft.',
    defaultWorkerWage: 3,
    defaultCustomerRate: 5,
    defaultUnits: 800,
  },
  {
    id: 'well',
    name: 'Well De-silting, Deepening & Ring Work',
    wageType: 'PER_FOOT',
    unitLabel: 'Foot',
    defaultWorkerWage: 450,
    defaultCustomerRate: 750,
    defaultUnits: 15,
  },
  {
    id: 'plastering',
    name: 'Exterior & Interior Plastering Squads',
    wageType: 'PER_SQFT',
    unitLabel: 'Sq. Ft.',
    defaultWorkerWage: 18,
    defaultCustomerRate: 28,
    defaultUnits: 450,
  },
  {
    id: 'painting',
    name: 'Commercial & Residential Painting',
    wageType: 'PER_SQFT',
    unitLabel: 'Sq. Ft.',
    defaultWorkerWage: 12,
    defaultCustomerRate: 20,
    defaultUnits: 600,
  },
  {
    id: 'tile',
    name: 'Tile, Marble & Granite Precision Laying',
    wageType: 'PER_SQFT',
    unitLabel: 'Sq. Ft.',
    defaultWorkerWage: 25,
    defaultCustomerRate: 40,
    defaultUnits: 300,
  },
  {
    id: 'electrical',
    name: 'Industrial & Residential Electrical MEP',
    wageType: 'PER_POINT',
    unitLabel: 'Point',
    defaultWorkerWage: 150,
    defaultCustomerRate: 250,
    defaultUnits: 8,
  },
  {
    id: 'plumbing',
    name: 'Pipeline Trenching & Sanitary Plumbing',
    wageType: 'FIXED_VISIT',
    unitLabel: 'Visit',
    defaultWorkerWage: 600,
    defaultCustomerRate: 950,
    defaultUnits: 1,
  },
  {
    id: 'borewell',
    name: 'Precision Borewell Drilling & Water Scouting',
    wageType: 'PER_FOOT',
    unitLabel: 'Foot',
    defaultWorkerWage: 180,
    defaultCustomerRate: 320,
    defaultUnits: 200,
  },
];

type EntryPresetMode = 'COMPLETED_PAID' | 'COMPLETED_PENDING' | 'IN_PROGRESS' | 'RAW_ENQUIRY';

export default function AdminDirectEntryPage() {
  const router = useRouter();
  const { token, user } = useAuth();
  const { isDark } = useAdminTheme();

  // Workflow Preset Mode
  const [entryMode, setEntryMode] = useState<EntryPresetMode>('COMPLETED_PAID');

  // Active Workers List
  const [workers, setWorkers] = useState<WorkerWithAvailability[]>([]);
  const [isLoadingWorkers, setIsLoadingWorkers] = useState(false);

  // Form Fields - Customer & Location
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [district, setDistrict] = useState('Kasaragod');
  const [city, setCity] = useState('');
  const [location, setLocation] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [preferredDate, setPreferredDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Form Fields - Service Selection & Rate Config
  const [selectedServiceId, setSelectedServiceId] = useState(SERVICE_PRESETS[0].id);
  const selectedPreset = useMemo(
    () => SERVICE_PRESETS.find((s) => s.id === selectedServiceId) || SERVICE_PRESETS[0],
    [selectedServiceId]
  );

  const [wageType, setWageType] = useState(SERVICE_PRESETS[0].wageType);
  const [unitLabel, setUnitLabel] = useState(SERVICE_PRESETS[0].unitLabel);
  const [workerUnitWage, setWorkerUnitWage] = useState(SERVICE_PRESETS[0].defaultWorkerWage);
  const [unitRate, setUnitRate] = useState(SERVICE_PRESETS[0].defaultCustomerRate);

  // Whenever selected service changes, update rate configs
  useEffect(() => {
    setWageType(selectedPreset.wageType);
    setUnitLabel(selectedPreset.unitLabel);
    setWorkerUnitWage(selectedPreset.defaultWorkerWage);
    setUnitRate(selectedPreset.defaultCustomerRate);
    if (!completedUnits || completedUnits === 0) {
      setCompletedUnits(selectedPreset.defaultUnits);
    }
  }, [selectedPreset]);

  // Form Fields - Worker Assignment
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');

  // Form Fields - Work Execution & Metrics
  const [completedUnits, setCompletedUnits] = useState<number>(12);
  const [workDurationMinutes, setWorkDurationMinutes] = useState<number>(180);
  const [inTime, setInTime] = useState<string>('08:30');
  const [outTime, setOutTime] = useState<string>('12:30');
  const [totalBreakMinutes, setTotalBreakMinutes] = useState<number>(20);
  const [crownCleaningDone, setCrownCleaningDone] = useState(true);
  const [beetleMedicineApplied, setBeetleMedicineApplied] = useState(true);
  const [message, setMessage] = useState('');
  const [notes, setNotes] = useState('');

  // Form Fields - Payment & Finance Integration
  const [recordPayment, setRecordPayment] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE'>('UPI');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('Direct administrative entry on completion');

  // Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    enquiry: ServiceEnquiry;
    transaction?: any;
  } | null>(null);

  // Live Auto Calculations
  const computedWage = useMemo(() => {
    const units = Number(completedUnits) || 0;
    const rate = Number(workerUnitWage) || 0;
    return units * rate;
  }, [completedUnits, workerUnitWage]);

  const computedCost = useMemo(() => {
    const units = Number(completedUnits) || 0;
    const rate = Number(unitRate) || 0;
    return units * rate;
  }, [completedUnits, unitRate]);

  const grossMargin = computedCost - computedWage;
  const marginPercentage = computedCost > 0 ? Math.round((grossMargin / computedCost) * 100) : 0;

  // Auto-sync payment amount when computedCost updates and payment amount matches previous cost
  useEffect(() => {
    if (recordPayment && computedCost > 0) {
      setPaymentAmount(computedCost);
    }
  }, [computedCost, recordPayment]);

  // Load Active Workers
  useEffect(() => {
    if (!token) return;
    setIsLoadingWorkers(true);
    EnquiryService.getActiveWorkers(token)
      .then((res) => {
        setWorkers(res.workers || []);
        if (res.workers && res.workers.length > 0 && !selectedWorkerId) {
          setSelectedWorkerId(res.workers[0].id);
        }
      })
      .catch((err) => console.error('Failed to load workers for direct feed', err))
      .finally(() => setIsLoadingWorkers(false));
  }, [token]);

  // Handle Preset Mode Switches
  const applyPresetMode = (mode: EntryPresetMode) => {
    setEntryMode(mode);
    if (mode === 'COMPLETED_PAID') {
      setRecordPayment(true);
    } else if (mode === 'COMPLETED_PENDING') {
      setRecordPayment(false);
    } else if (mode === 'IN_PROGRESS') {
      setRecordPayment(false);
    } else if (mode === 'RAW_ENQUIRY') {
      setRecordPayment(false);
      setSelectedWorkerId('');
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!customerName.trim()) {
      setFormError('Please enter the customer name.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 7) {
      setFormError('Please enter a valid mobile number.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const targetStatus =
      entryMode === 'COMPLETED_PAID' || entryMode === 'COMPLETED_PENDING'
        ? 'COMPLETED'
        : entryMode === 'IN_PROGRESS'
        ? 'IN_PROGRESS'
        : entryMode === 'RAW_ENQUIRY'
        ? 'PENDING'
        : 'COMPLETED';

    const isCompleted = targetStatus === 'COMPLETED';

    try {
      const res = await EnquiryService.directWorkEntry(
        {
          serviceName: selectedPreset.name,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim() || undefined,
          district,
          city: city.trim() || undefined,
          location: location.trim() || undefined,
          mapUrl: mapUrl.trim() || undefined,
          preferredDate,
          message: message.trim() || `Direct entry: ${selectedPreset.name} for ${customerName}`,
          notes: notes.trim() || undefined,
          targetStatus: targetStatus as any,
          workerId: selectedWorkerId || undefined,
          wageType,
          unitLabel,
          workerUnitWage: Number(workerUnitWage),
          unitRate: Number(unitRate),
          completedUnits: isCompleted || targetStatus === 'IN_PROGRESS' ? Number(completedUnits) : undefined,
          workDurationMinutes: isCompleted ? Number(workDurationMinutes) : undefined,
          totalBreakMinutes: isCompleted ? Number(totalBreakMinutes) : undefined,
          inTime: isCompleted ? inTime : undefined,
          outTime: isCompleted ? outTime : undefined,
          specificationDetails: {
            serviceSlug: selectedPreset.id,
            inTime,
            outTime,
            totalBreakMinutes,
            crownCleaningDone,
            beetleMedicineApplied,
            directDataFeed: true,
          },
          recordPayment: isCompleted && recordPayment,
          paymentAmount: isCompleted && recordPayment ? Number(paymentAmount) : undefined,
          paymentMethod: isCompleted && recordPayment ? paymentMethod : undefined,
          paymentReference: isCompleted && recordPayment && paymentReference.trim() ? paymentReference.trim() : undefined,
          paymentNotes: isCompleted && recordPayment ? paymentNotes.trim() : undefined,
        },
        token
      );

      setSuccessResult({
        enquiry: res.enquiry,
        transaction: res.transaction,
      });
    } catch (err: any) {
      console.error('Direct work entry error:', err);
      setFormError(err?.message || 'Failed to record direct work order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form for new entry
  const handleResetForm = () => {
    setSuccessResult(null);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setCity('');
    setLocation('');
    setMapUrl('');
    setMessage('');
    setNotes('');
    setPaymentReference('');
    setFormError(null);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-16">
      {/* 1. Header Banner */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-[#14151A] border border-gray-800 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-10 h-10 rounded-2xl bg-[#2A835F]/20 text-[#2A835F] flex items-center justify-center font-bold">
              <Zap className="w-5 h-5 fill-[#2A835F]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-100 tracking-tight flex items-center gap-2">
                <span>Supreme Data Feeding Studio</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Direct Workflow Bypass
                </span>
              </h1>
              <p className="text-gray-400 text-xs mt-0.5">
                Feed offline logs, assign workers, log finished tree/hour metrics, and confirm client payments into the Finance ledger in 1 unified shot.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/admin/finance"
            className="flex items-center gap-2 bg-[#1A1C23] hover:bg-[#252830] border border-gray-800 hover:border-gray-700 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white transition-all shadow-xs"
          >
            <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
            <span>Open Finance Ledger</span>
          </Link>

          <Link
            href="/admin/operations/work-orders"
            className="flex items-center gap-2 bg-[#1A1C23] hover:bg-[#252830] border border-gray-800 hover:border-gray-700 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white transition-all shadow-xs"
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Work Orders</span>
          </Link>
        </div>
      </div>

      {/* 2. Workflow Target Mode Switcher */}
      <div className="bg-[#14151A] border border-gray-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Entry Workflow Target:</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 flex-1 max-w-4xl">
          {[
            {
              id: 'COMPLETED_PAID',
              label: 'Single-Shot: Completed & Paid',
              desc: 'Enquiry + Finish + Pay Ledger Sync',
              badge: 'Most Popular',
              icon: CheckCircle2,
              activeClass: 'bg-[#2A835F] text-white border-[#2A835F] shadow-sm',
            },
            {
              id: 'COMPLETED_PENDING',
              label: 'Completed - Pay Pending',
              desc: 'Work finished, payment uncollected',
              badge: 'Unpaid',
              icon: Clock,
              activeClass: 'bg-amber-600 text-white border-amber-500 shadow-sm',
            },
            {
              id: 'IN_PROGRESS',
              label: 'Dispatched & In-Progress',
              desc: 'Worker on site, meter ticking',
              badge: 'Active Site',
              icon: HardHat,
              activeClass: 'bg-blue-600 text-white border-blue-500 shadow-sm',
            },
            {
              id: 'RAW_ENQUIRY',
              label: 'Direct Lead / Raw Enquiry',
              desc: 'Standard initial booking enquiry',
              badge: 'Pending',
              icon: FileText,
              activeClass: 'bg-purple-600 text-white border-purple-500 shadow-sm',
            },
          ].map((mode) => {
            const Icon = mode.icon;
            const isSelected = entryMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => applyPresetMode(mode.id as EntryPresetMode)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? mode.activeClass
                    : 'bg-[#1A1C23] border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-black/30 text-white' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {mode.badge}
                  </span>
                </div>
                <div className="mt-2">
                  <div className="text-xs font-black leading-snug">{mode.label}</div>
                  <div className={`text-[10px] mt-0.5 truncate ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                    {mode.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Success Feedback Modal Banner */}
      {successResult && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#103E2E] to-[#14151A] border-2 border-[#2A835F] text-gray-100 space-y-4 shadow-xl animate-in zoom-in-95">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold shrink-0">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Work Order &amp; Finance Ingestion Successful!</h3>
                <p className="text-xs text-emerald-300/90 mt-0.5">
                  Record processed and fully synchronized across enquiries, worker ledger, and finance books.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleResetForm}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Feed Another Work Order</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-emerald-500/30 text-xs">
            <div className="bg-black/40 border border-emerald-500/30 p-3 rounded-xl">
              <span className="text-gray-400 block text-[10px] font-bold uppercase">Enquiry Ticket</span>
              <strong className="font-mono text-emerald-300 text-sm font-black">
                {successResult.enquiry.trackingNumber}
              </strong>
            </div>

            <div className="bg-black/40 border border-emerald-500/30 p-3 rounded-xl">
              <span className="text-gray-400 block text-[10px] font-bold uppercase">Customer</span>
              <strong className="text-white text-sm font-bold truncate block">
                {successResult.enquiry.customerName}
              </strong>
            </div>

            <div className="bg-black/40 border border-emerald-500/30 p-3 rounded-xl">
              <span className="text-gray-400 block text-[10px] font-bold uppercase">Auto Worker Payout</span>
              <strong className="font-mono text-emerald-400 text-sm font-black">
                ₹{successResult.enquiry.totalCalculatedWage || 0}
              </strong>
            </div>

            <div className="bg-black/40 border border-emerald-500/30 p-3 rounded-xl">
              <span className="text-gray-400 block text-[10px] font-bold uppercase">Finance Transaction</span>
              {successResult.transaction ? (
                <strong className="font-mono text-white text-sm font-black block truncate">
                  {successResult.transaction.transactionNumber} (₹{successResult.transaction.amount})
                </strong>
              ) : (
                <span className="text-amber-400 text-xs font-bold">Unpaid / No Txn</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Main Two-Column Feeding Studio Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Cards (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Customer Profile & Kerala Location */}
          <div className="bg-[#14151A] border border-gray-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-100">1. Customer &amp; Kerala Location Profile</h3>
                  <p className="text-[11px] text-gray-500">Contact details and job site coordinates</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-gray-400 bg-gray-800/60 px-2 py-0.5 rounded-md">
                Step 1 of 4
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1.5">
                  Customer Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Adv. Mohanan Nair"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-[#2A835F]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1.5">
                  Mobile Number (+91) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 98470 12345"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm font-mono text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-[#2A835F]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1.5">
                  Kerala District <span className="text-rose-500">*</span>
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-[#2A835F] cursor-pointer"
                >
                  {KERALA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1.5">
                  City / Town / Taluk
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kanhangad / Payyanur"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-[#2A835F]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1.5">
                  Work Date
                </label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-[#2A835F] font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1.5">
                  Specific Site Address / Landmark
                </label>
                <input
                  type="text"
                  placeholder="e.g. Near Temple Road, East Nada"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-[#2A835F]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1.5">
                  Customer Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="e.g. customer@gmail.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-[#2A835F]"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Service Selection & Rate Customization */}
          <div className="bg-[#14151A] border border-gray-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-100">2. Service Squad &amp; Rate Configuration</h3>
                  <p className="text-[11px] text-gray-500">Pick service squad and adjust billable rates</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-gray-400 bg-gray-800/60 px-2 py-0.5 rounded-md">
                Step 2 of 4
              </span>
            </div>

            {/* Service Grid Selection */}
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-2">
                Select Service Squad:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {SERVICE_PRESETS.map((s) => {
                  const isSelected = selectedServiceId === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedServiceId(s.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                        isSelected
                          ? 'bg-[#2A835F]/20 border-[#2A835F] text-emerald-300 shadow-md ring-1 ring-[#2A835F]'
                          : 'bg-[#1A1C23] border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        {s.id === 'cococare' ? (
                          <TreePalm className="w-5 h-5 text-emerald-400" />
                        ) : s.id === 'jcb' ? (
                          <Timer className="w-5 h-5 text-amber-400" />
                        ) : (
                          <Layers className="w-5 h-5 text-blue-400" />
                        )}
                        <span className="text-[10px] font-mono font-bold text-gray-500">
                          {s.unitLabel}
                        </span>
                      </div>
                      <div className="text-xs font-bold line-clamp-2 leading-tight">
                        {s.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Editable Rate Inputs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#1A1C23] border border-gray-800/80">
              <div>
                <label className="text-[11px] font-bold text-gray-400 block mb-1">
                  Wage Type:
                </label>
                <input
                  type="text"
                  value={wageType}
                  onChange={(e) => setWageType(e.target.value)}
                  className="w-full bg-[#14151A] border border-gray-800 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-gray-200 focus:outline-none focus:border-[#2A835F]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 block mb-1">
                  Unit Label:
                </label>
                <input
                  type="text"
                  value={unitLabel}
                  onChange={(e) => setUnitLabel(e.target.value)}
                  className="w-full bg-[#14151A] border border-gray-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-gray-200 focus:outline-none focus:border-[#2A835F]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-emerald-400 block mb-1">
                  Worker Wage (₹/unit):
                </label>
                <input
                  type="number"
                  min="0"
                  value={workerUnitWage}
                  onChange={(e) => setWorkerUnitWage(Number(e.target.value))}
                  className="w-full bg-[#14151A] border border-gray-800 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-[#2A835F]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-white block mb-1">
                  Customer Rate (₹/unit):
                </label>
                <input
                  type="number"
                  min="0"
                  value={unitRate}
                  onChange={(e) => setUnitRate(Number(e.target.value))}
                  className="w-full bg-[#14151A] border border-gray-800 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-[#2A835F]"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Field Worker Assignment */}
          <div className="bg-[#14151A] border border-gray-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold">
                  <HardHat className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-100">3. Field Worker Assignment</h3>
                  <p className="text-[11px] text-gray-500">Assign an operative or leave unassigned</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-gray-400 bg-gray-800/60 px-2 py-0.5 rounded-md">
                Step 3 of 4
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1.5">
                  Select Field Worker:
                </label>
                <select
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-[#2A835F] cursor-pointer"
                >
                  <option value="">-- Leave Unassigned (Company General Squad) --</option>
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.phone || 'No phone'}) - {w.workerStatus || 'AVAILABLE'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1.5">
                  Worker Status Note:
                </label>
                <div className="p-2.5 rounded-xl bg-[#1A1C23] border border-gray-800 text-xs text-gray-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    {selectedWorkerId
                      ? 'Worker will be marked as accepted without requiring mobile acceptance prompt.'
                      : 'No worker assigned. Can be dispatched later from Dispatch console.'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Work Completion Metrics & Execution */}
          {(entryMode === 'COMPLETED_PAID' || entryMode === 'COMPLETED_PENDING' || entryMode === 'IN_PROGRESS') && (
            <div className="bg-[#14151A] border border-gray-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-100">4. Work Execution &amp; Completed Metrics</h3>
                    <p className="text-[11px] text-gray-500">Feed exact units completed, shift timings, and breaks</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-gray-400 bg-gray-800/60 px-2 py-0.5 rounded-md">
                  Step 4 of 4
                </span>
              </div>

              {/* Units Counter */}
              <div className="p-4 rounded-2xl bg-[#1A1C23] border border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-gray-200 block uppercase tracking-wider">
                    Total {unitLabel}s Completed:
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Billed at ₹{unitRate}/{unitLabel} • Worker payout at ₹{workerUnitWage}/{unitLabel}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCompletedUnits(Math.max(1, completedUnits - 1))}
                    className="w-10 h-10 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold flex items-center justify-center cursor-pointer border border-gray-700 active:scale-95"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <div className="flex items-baseline gap-1 bg-black/60 px-4 py-2 rounded-xl border border-emerald-500/40">
                    <input
                      type="number"
                      min="1"
                      value={completedUnits}
                      onChange={(e) => setCompletedUnits(Math.max(1, Number(e.target.value)))}
                      className="w-16 bg-transparent text-center font-mono text-2xl font-black text-emerald-400 focus:outline-none"
                    />
                    <span className="text-xs font-bold text-emerald-400">{unitLabel}s</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCompletedUnits(completedUnits + 1)}
                    className="w-10 h-10 rounded-xl bg-[#2A835F] hover:bg-[#236D4F] text-white font-bold flex items-center justify-center cursor-pointer shadow-md active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Quick:</span>
                  {[5, 10, 20, 50].map((inc) => (
                    <button
                      key={inc}
                      type="button"
                      onClick={() => setCompletedUnits(completedUnits + inc)}
                      className="px-2 py-0.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-[10px] font-bold border border-gray-700 cursor-pointer"
                    >
                      +{inc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shift Timings & Break */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                    Shift In-Time:
                  </label>
                  <input
                    type="time"
                    value={inTime}
                    onChange={(e) => setInTime(e.target.value)}
                    className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-3 py-2 text-xs font-mono text-gray-100 focus:outline-none focus:border-[#2A835F]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                    Shift Out-Time:
                  </label>
                  <input
                    type="time"
                    value={outTime}
                    onChange={(e) => setOutTime(e.target.value)}
                    className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-3 py-2 text-xs font-mono text-gray-100 focus:outline-none focus:border-[#2A835F]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                    Total Work (Mins):
                  </label>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    value={workDurationMinutes}
                    onChange={(e) => setWorkDurationMinutes(Math.max(10, Number(e.target.value)))}
                    className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-gray-100 focus:outline-none focus:border-[#2A835F]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                    Break Time (Mins):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={totalBreakMinutes}
                    onChange={(e) => setTotalBreakMinutes(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-gray-100 focus:outline-none focus:border-[#2A835F]"
                  />
                </div>
              </div>

              {/* Service specific toggles */}
              {selectedServiceId === 'cococare' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-800/80 text-xs text-gray-300">
                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#1A1C23] border border-gray-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={crownCleaningDone}
                      onChange={(e) => setCrownCleaningDone(e.target.checked)}
                      className="rounded border-gray-700 text-emerald-600 focus:ring-emerald-500 bg-gray-900 w-4 h-4 cursor-pointer"
                    />
                    <span>Crown Cleaning &amp; Frond Pruning Performed</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#1A1C23] border border-gray-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={beetleMedicineApplied}
                      onChange={(e) => setBeetleMedicineApplied(e.target.checked)}
                      className="rounded border-gray-700 text-emerald-600 focus:ring-emerald-500 bg-gray-900 w-4 h-4 cursor-pointer"
                    />
                    <span>Rhinoceros Beetle Preventive Powder Applied</span>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Card 5: Payment Collection & Finance Sync */}
          {entryMode === 'COMPLETED_PAID' && (
            <div className="bg-[#14151A] border border-emerald-500/40 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">5. Client Payment &amp; Finance Books Sync</h3>
                    <p className="text-[11px] text-emerald-400/80">Instantly creates a verified transaction in Admin Finance</p>
                  </div>
                </div>

                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Auto-Synced to Ledger</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-gray-300">
                      Amount Collected (₹) <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setPaymentAmount(computedCost)}
                      className="text-[11px] text-emerald-400 hover:underline font-mono cursor-pointer"
                    >
                      Match Bill (₹{computedCost})
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(Number(e.target.value))}
                      className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl pl-8 pr-3.5 py-2.5 text-base font-mono font-black text-emerald-400 focus:outline-none focus:border-[#2A835F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1.5">
                    Payment Mode:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'CASH', label: 'Cash In Hand', icon: Banknote },
                      { id: 'UPI', label: 'GPay / UPI', icon: QrCode },
                      { id: 'BANK_TRANSFER', label: 'Bank Transfer', icon: CreditCard },
                      { id: 'CHEQUE', label: 'Cheque', icon: FileText },
                    ].map((m) => {
                      const Icon = m.icon;
                      const isSelected = paymentMethod === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPaymentMethod(m.id as any)}
                          className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                              : 'bg-[#1A1C23] border-gray-800 text-gray-400 hover:border-gray-700 hover:text-white'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1.5">
                    Reference # / UPI UTR / Cheque (Optional):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UPI Ref / GPay Txn / Cheque #"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-[#2A835F] font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1.5">
                    Finance Notes:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Collected on site by supervisor"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-[#2A835F]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Summary & Submission Console (4 Cols) */}
        <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-6">
          {/* Order Summary Card */}
          <div className="bg-[#14151A] border border-gray-800 rounded-3xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Work Order Calculation Strip
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Live Auto-Decided
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Customer:</span>
                <strong className="text-white font-bold truncate max-w-[180px]">
                  {customerName || '— (Awaiting Input)'}
                </strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Service:</span>
                <strong className="text-emerald-300 font-bold truncate max-w-[180px]">
                  {selectedPreset.name}
                </strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Location:</span>
                <strong className="text-gray-200">
                  {city ? `${city}, ` : ''}{district}
                </strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Work Quantity:</span>
                <span className="font-mono font-bold text-white bg-gray-800/60 px-2 py-0.5 rounded">
                  {completedUnits} {unitLabel}s
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Worker Assigned:</span>
                <strong className="text-gray-300 truncate max-w-[180px]">
                  {workers.find((w) => w.id === selectedWorkerId)?.name || 'General Company Squad'}
                </strong>
              </div>

              {/* Financial Box */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#103E2E] to-[#1A1C23] border border-emerald-500/30 space-y-2 pt-3">
                <div className="flex items-center justify-between text-xs text-gray-300">
                  <span>Worker Payout:</span>
                  <strong className="font-mono text-emerald-400 text-sm">
                    ₹{computedWage.toLocaleString('en-IN')}
                  </strong>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-200 border-t border-emerald-500/20 pt-2">
                  <span className="font-bold">Total Customer Bill:</span>
                  <strong className="font-mono text-white text-base font-black">
                    ₹{computedCost.toLocaleString('en-IN')}
                  </strong>
                </div>

                <div className="flex items-center justify-between text-[11px] text-emerald-300/80 border-t border-emerald-500/20 pt-1.5">
                  <span>Company Gross Margin:</span>
                  <strong className="font-mono text-emerald-300">
                    ₹{grossMargin.toLocaleString('en-IN')} ({marginPercentage}%)
                  </strong>
                </div>
              </div>

              {/* Payment Status Pill */}
              {entryMode === 'COMPLETED_PAID' && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span>Payment to be Recorded:</span>
                    <span className="font-mono text-emerald-400">₹{paymentAmount}</span>
                  </div>
                  <div className="text-[10px] text-emerald-400/80">
                    Mode: {paymentMethod} • Ref: {paymentReference || 'Direct Entry'}
                  </div>
                </div>
              )}
            </div>

            {/* Error Display */}
            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{formError}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#2A835F] hover:bg-[#236D4F] text-white text-sm font-black transition-all shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Processing Work Order &amp; Finance...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white" />
                    <span>
                      {entryMode === 'COMPLETED_PAID'
                        ? 'Feed & Record Completed Work'
                        : entryMode === 'COMPLETED_PENDING'
                        ? 'Record Completed (Unpaid)'
                        : 'Record Work Order'}
                    </span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleResetForm}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-[#1A1C23] hover:bg-[#252830] text-gray-400 hover:text-white text-xs font-bold transition-all border border-gray-800 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Form</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
