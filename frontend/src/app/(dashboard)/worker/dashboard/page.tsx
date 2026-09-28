'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  Calendar,
  Clock,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  Navigation,
  ExternalLink,
  ChevronRight,
  HardHat,
  Filter,
  Layers,
  ArrowRight,
  History,
  Timer,
  Play,
  Pause,
  StopCircle,
  TreePalm,
  Plus,
  Minus,
  IndianRupee,
  Loader2,
  Sparkles,
  Search,
  ChevronDown,
  ChevronUp,
  Droplets,
  Tractor,
  Maximize2,
  LocateFixed,
  Sliders,
  Compass,
  Paintbrush,
  Zap,
  Wrench,
} from 'lucide-react';
import { useWorker } from '@/context/worker-context';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { useWorkerLanguage } from '@/context/worker-language-context';
import { useWorkerMap, TILE_PROVIDERS } from '@/context/worker-map-context';
import { WorkerShell } from '@/components/Worker';
import { ServiceEnquiry, EnquiryService } from '@/services';
import Image from 'next/image';
import { getServiceBanner } from '@/utils/service-options';

// Dynamic import with SSR disabled for Leaflet Map Core
const WorkerLeafletMapCore = dynamic(
  () => import('@/components/Worker/WorkerLeafletMapCore'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[170px] bg-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-2 text-xs">
        <Compass className="w-6 h-6 animate-spin text-[#2A835F]" />
        <span>Loading Leaflet Map Engine...</span>
      </div>
    ),
  }
);

export default function WorkerDashboardPage() {
  const { token, user } = useAuth();
  const toast = useToast();
  const {
    jobs,
    loadingJobs,
    refreshJobs,
    isOnDuty,
    requestToggleDuty,
    togglingDuty,
    openJobModal,
    updateJobStatus,
  } = useWorker();

  const { language, t, translateService } = useWorkerLanguage();
  const {
    settings,
    updateSettings,
    setIsMapSettingsOpen,
    setIsFullMapOpen,
    requestGpsLocation,
    isLocating,
  } = useWorkerMap();

  const [searchQuery, setSearchQuery] = useState('');
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'THIS_MONTH'>('ALL');
  const [showHistoryWhenActive, setShowHistoryWhenActive] = useState(false);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Active / Ongoing Job determination
  const ongoingJob = jobs.find((j) => j.status === 'IN_PROGRESS');
  const newlyAssignedJob = jobs.find((j) => j.status === 'ASSIGNED');
  const currentWork = ongoingJob || newlyAssignedJob;

  // ========================================================
  // 1. SERVICE CLASSIFICATION & SPECIFICATIONS
  // Each work is classified and calculated as per its domain:
  // - HOURLY: JCB, Excavator, Crane, Earthmoving
  // - PER_TREE: Coconut harvesting, palm pruning
  // - PER_SQFT: Painting, putty, tile, marble laying
  // - PER_POINT: Electrical wiring, points installation
  // - PER_FOOT: Borewell drilling, piling
  // - DAILY_WAGE: Masonry, brick construction, structural shifts
  // - FIXED_VISIT: Plumbing, inspection, home repair
  // ========================================================
  const sName = (currentWork?.serviceName || '').toLowerCase();

  const isMachinery =
    sName.includes('jcb') ||
    sName.includes('excavat') ||
    sName.includes('crane') ||
    sName.includes('earthmoving') ||
    sName.includes('trench') ||
    sName.includes('grader') ||
    sName.includes('loader') ||
    sName.includes('ജെസിബി') ||
    sName.includes('എസ്കവേറ്റർ') ||
    sName.includes('ക്രെയിൻ') ||
    sName.includes('മണ്ണെടുക്കൽ');

  const isTreeService =
    sName.includes('coconut') ||
    sName.includes('cococare') ||
    sName.includes('palm') ||
    sName.includes('tree') ||
    sName.includes('കയറ്റം') ||
    sName.includes('തെങ്ങ്');

  const isPaintOrTile =
    sName.includes('paint') ||
    sName.includes('putty') ||
    sName.includes('tile') ||
    sName.includes('marble') ||
    sName.includes('granite') ||
    sName.includes('പെയിന്റിംഗ്') ||
    sName.includes('ടൈൽ') ||
    sName.includes('മാർബിൾ');

  const isElectrical =
    sName.includes('electr') ||
    sName.includes('wire') ||
    sName.includes('wiring') ||
    sName.includes('kseb') ||
    sName.includes('ഇലക്ട്രിക്കൽ') ||
    sName.includes('വയറിംഗ്');

  const isBorewell =
    sName.includes('bore') ||
    sName.includes('drill') ||
    sName.includes('piling') ||
    sName.includes('കുഴൽക്കിണർ') ||
    sName.includes('ഡ്രില്ലിംഗ്');

  const isMasonry =
    sName.includes('mason') ||
    sName.includes('brick') ||
    sName.includes('concrete') ||
    sName.includes('plaster') ||
    sName.includes('കൊത്തുപണി') ||
    sName.includes('മേസ്തിരി');

  // Exact Wage Type
  const wageType =
    currentWork?.wageType && currentWork.wageType !== 'HOURLY'
      ? currentWork.wageType
      : isMachinery
      ? 'HOURLY'
      : isTreeService
      ? 'PER_TREE'
      : isPaintOrTile
      ? 'PER_SQFT'
      : isElectrical
      ? 'PER_POINT'
      : isBorewell
      ? 'PER_FOOT'
      : isMasonry
      ? 'DAILY_WAGE'
      : currentWork?.wageType || 'FIXED_VISIT';

  const isHourly = wageType === 'HOURLY';
  const isCoconut = wageType === 'PER_TREE';
  const isSqFt = wageType === 'PER_SQFT';
  const isPoint = wageType === 'PER_POINT';
  const isFoot = wageType === 'PER_FOOT';
  const isDaily = wageType === 'DAILY_WAGE';
  const isVisit = wageType === 'FIXED_VISIT';

  const unitLabel =
    currentWork?.unitLabel ||
    (isCoconut
      ? 'Tree'
      : isHourly
      ? 'Hour'
      : isSqFt
      ? 'Sq. Ft.'
      : isPoint
      ? 'Point'
      : isFoot
      ? 'Foot'
      : isDaily
      ? 'Day / Shift'
      : 'Visit');

  const workerRate =
    currentWork?.workerUnitWage ||
    (isCoconut
      ? 80
      : isHourly
      ? 900
      : isSqFt
      ? sName.includes('tile') || sName.includes('marble')
        ? 28
        : 14
      : isPoint
      ? 260
      : isFoot
      ? 65
      : isDaily
      ? 1100
      : 220);

  // Live Timer Chronometer State (for Hourly machinery ONLY)
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Units state (for per-tree count, sqft, points, feet, days)
  const [unitCount, setUnitCount] = useState<number>(10);
  const [crownCleaningDone, setCrownCleaningDone] = useState(true);
  const [beetleMedicineApplied, setBeetleMedicineApplied] = useState(true);

  // Synchronize state when active work changes
  useEffect(() => {
    if (currentWork) {
      // Default unit count based on classification
      const defaultUnits =
        currentWork.completedUnits ??
        currentWork.estimatedUnits ??
        (isCoconut ? 12 : isSqFt ? 250 : isPoint ? 6 : isFoot ? 150 : isDaily ? 1 : 1);
      setUnitCount(defaultUnits);

      // Initialize chronometer if this is an hourly machinery job in progress
      if (isHourly && currentWork.status === 'IN_PROGRESS' && currentWork.workStartedAt) {
        const startMs = new Date(currentWork.workStartedAt).getTime();
        const elapsedSeconds = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
        setTimerSeconds(elapsedSeconds);
        setIsTimerRunning(true);
      } else {
        setTimerSeconds(0);
        setIsTimerRunning(false);
      }
    } else {
      setTimerSeconds(0);
      setIsTimerRunning(false);
    }
  }, [currentWork?.id, currentWork?.status, currentWork?.workStartedAt, isHourly, isCoconut, isSqFt, isPoint, isFoot, isDaily]);

  // Live timer interval ticking (Hourly only)
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTimerRunning]);

  // Format chronometer seconds into HH:MM:SS
  const formatTimer = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // State flags for acceptance & on-site arrival
  const workerAcceptance = currentWork?.workerAcceptance || '';
  const isAccepted =
    workerAcceptance === 'ACCEPTED' ||
    workerAcceptance === 'ACCEPTED_SAME_DAY' ||
    workerAcceptance === 'REACHED_SITE' ||
    currentWork?.status === 'IN_PROGRESS';

  const hasReachedSite =
    workerAcceptance === 'REACHED_SITE' ||
    currentWork?.status === 'IN_PROGRESS';

  // ========================================================
  // 2. ACTION HANDLERS
  // ========================================================

  // Accept Work Order
  const handleAcceptJob = async () => {
    if (!currentWork || !token || isSubmittingAction) return;
    setIsSubmittingAction(true);
    try {
      await EnquiryService.acceptWorkerJob(
        currentWork.id,
        {
          workerAcceptance: 'ACCEPTED',
          notes: 'Operative accepted work order and is preparing to dispatch to site',
        },
        token
      );
      toast.success(
        language === 'ml' ? 'ജോലി സ്വീകരിച്ചു' : 'Work Order Accepted',
        language === 'ml'
          ? 'സൈറ്റിലേക്ക് പുറപ്പെടാൻ തയ്യാറെടുക്കുക.'
          : 'Work accepted. Proceed to client work site.'
      );
      await refreshJobs();
    } catch (err: any) {
      toast.error('Failed to Accept', err?.message || 'Unable to accept work');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Mark Reached Work Site
  const handleReachedSite = async () => {
    if (!currentWork || !token || isSubmittingAction) return;
    setIsSubmittingAction(true);
    try {
      await EnquiryService.markReachedSite(
        currentWork.id,
        token,
        'Operative arrived at customer site location'
      );
      toast.success(
        language === 'ml' ? 'സൈറ്റിൽ എത്തി' : 'Arrived at Work Site',
        language === 'ml'
          ? 'വർക്ക് സൈറ്റിൽ എത്തിയതായി രേഖപ്പെടുത്തി. ഇനി ടൈമർ അല്ലെങ്കിൽ ജോലി ആരംഭിക്കാം.'
          : 'Site arrival recorded. Timer / work execution unlocked.'
      );
      await refreshJobs();
    } catch (err: any) {
      toast.error('Failed to record arrival', err?.message || 'Unable to record arrival');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Start Hourly Timer (e.g. for JCB)
  const handleStartHourlyTimer = async () => {
    if (!currentWork || !token || isSubmittingAction) return;
    setIsSubmittingAction(true);
    try {
      await EnquiryService.startWorkTimer(
        currentWork.id,
        { notes: 'Operative arrived on site and started equipment chronometer' },
        token
      );
      setIsTimerRunning(true);
      toast.success(
        'ടൈമർ ആരംഭിച്ചു / Chronometer Started',
        'Live equipment hourly tracking is now ticking.'
      );
      await refreshJobs();
    } catch (err: any) {
      toast.error('Failed to Start Timer', err?.message || 'Unable to start timer');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Pause / Resume Hourly Timer
  const handleTogglePauseTimer = () => {
    setIsTimerRunning((prev) => !prev);
  };

  // Stop Timer and Complete Hourly Work
  const handleStopTimerAndComplete = async () => {
    if (!currentWork || !token || isSubmittingAction) return;
    setIsSubmittingAction(true);
    try {
      const durationMinutes = Math.max(1, Math.round(timerSeconds / 60));
      const hoursLogged = Math.round((durationMinutes / 60) * 10) / 10;
      await EnquiryService.stopWorkTimer(
        currentWork.id,
        {
          durationMinutes,
          completedUnits: hoursLogged,
          completionNotes: `Equipment work completed on site. Total recorded runtime: ${Math.floor(
            durationMinutes / 60
          )}h ${durationMinutes % 60}m.`,
        },
        token
      );
      setIsTimerRunning(false);
      toast.success(
        'ജോലി പൂർത്തിയായി / Work Order Completed',
        `Successfully logged ${hoursLogged} hours. Wage record updated.`
      );
      await refreshJobs();
    } catch (err: any) {
      toast.error('Failed to Complete Work', err?.message || 'Unable to complete work');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Start Job for Unit-based or Fixed services
  const handleStartGeneralWork = async () => {
    if (!currentWork || !token || isSubmittingAction) return;
    setIsSubmittingAction(true);
    try {
      await EnquiryService.updateWorkerJobStatus(
        currentWork.id,
        'IN_PROGRESS',
        'Operative arrived on site and started work',
        token
      );
      toast.success(
        'ജോലി ആരംഭിച്ചു / Work Started',
        'Status changed to IN PROGRESS.'
      );
      await refreshJobs();
    } catch (err: any) {
      toast.error('Failed to Start', err?.message || 'Unable to update status');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Submit Unit Count (Tree count, Sqft, Points, Feet, Days, Visits)
  const handleSubmitUnitsAndComplete = async () => {
    if (!currentWork || !token || isSubmittingAction) return;
    setIsSubmittingAction(true);
    try {
      const units = Number(unitCount) || 1;
      let notes = '';

      if (isCoconut) {
        notes = `Harvested ${units} coconut trees. ${
          crownCleaningDone ? 'Crown cleaned & fronds pruned.' : ''
        } ${beetleMedicineApplied ? 'Beetle medicine applied.' : ''}`;
      } else if (isSqFt) {
        notes = `Completed surface work of ${units} Sq. Ft. Clean finish and inspected.`;
      } else if (isPoint) {
        notes = `Installed and tested ${units} electrical points.`;
      } else if (isFoot) {
        notes = `Completed borewell drilling of ${units} feet depth.`;
      } else if (isDaily) {
        notes = `Completed ${units} daily masonry/construction shift(s).`;
      } else {
        notes = `Completed on-site visit and required service.`;
      }

      await EnquiryService.updateWorkerJobStatus(
        currentWork.id,
        'COMPLETED',
        notes,
        token,
        {
          completedUnits: units,
          specificationDetails: isCoconut
            ? { crownCleaningDone, beetleMedicineApplied }
            : undefined,
        }
      );

      toast.success(
        'ജോലി പൂർത്തിയായി / Work Completed',
        `Successfully logged ${units} ${unitLabel}s. Worker wage updated.`
      );
      await refreshJobs();
    } catch (err: any) {
      toast.error('Failed to Complete Work', err?.message || 'Unable to complete work');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // ========================================================
  // 3. DATE & LOCALIZATION FORMATTING
  // ========================================================
  const today = new Date();

  const monthMalayalamMap: Record<number, string> = {
    0: 'ജനുവരി',
    1: 'ഫെബ്രുവരി',
    2: 'മാർച്ച്',
    3: 'ഏപ്രിൽ',
    4: 'മേയ്',
    5: 'ജൂൺ',
    6: 'ജൂലൈ',
    7: 'ഓഗസ്റ്റ്',
    8: 'സെപ്റ്റംബർ',
    9: 'ഒക്ടോബർ',
    10: 'നവംബർ',
    11: 'ഡിസംബർ',
  };

  const dayMalayalamMap: Record<number, string> = {
    0: 'ഞായർ',
    1: 'തിങ്കൾ',
    2: 'ചൊവ്വ',
    3: 'ബുധൻ',
    4: 'വ്യാഴം',
    5: 'വെള്ളി',
    6: 'ശനി',
  };

  const primaryDateFormatted =
    language === 'hi'
      ? today.toLocaleDateString('hi-IN', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : language === 'ml'
      ? `${dayMalayalamMap[today.getDay()]}, ${today.getDate()} ${
          monthMalayalamMap[today.getMonth()]
        }`
      : today.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        });

  // Filter previous completed works
  const previousWorks = useMemo(() => {
    let list = jobs.filter((j) => j.status === 'COMPLETED');

    if (historyFilter === 'THIS_MONTH') {
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      list = list.filter((j) => {
        const d = new Date(j.completedAt || j.updatedAt || j.createdAt);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (j) =>
          j.serviceName.toLowerCase().includes(q) ||
          j.trackingNumber.toLowerCase().includes(q) ||
          (j.location && j.location.toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => {
      const dateA = new Date(a.completedAt || a.updatedAt || a.createdAt).getTime();
      const dateB = new Date(b.completedAt || b.updatedAt || b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [jobs, historyFilter, searchQuery, today]);

  // Google Maps direct URL
  const googleMapsUrl =
    currentWork?.mapUrl ||
    (currentWork?.location
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
          `${currentWork.location}, Kerala, India`
        )}`
      : 'https://maps.google.com');

  const officePhone =
    currentWork?.officeStaff?.phone ||
    (currentWork as any)?.creator?.phone ||
    '+91 94000 00000';

  const officeCoordinatorName =
    currentWork?.officeStaff?.name ||
    currentWork?.officeStaff?.username ||
    (currentWork as any)?.creator?.name ||
    (language === 'ml' ? 'ഓഫീസ് ഡിസ്പാച്ച്' : 'Office Coordinator');

  return (
    <WorkerShell
      activeTab="home"
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    >
      <div className="w-full flex flex-col gap-4 select-none pb-4">
        {/* ========================================================
            TOP MOBILE BAR: GREETING & ATTENDANCE TOGGLE
        ======================================================== */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-white shadow-sm border border-slate-700/60 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 truncate">
                {primaryDateFormatted}
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-white tracking-tight truncate">
              {language === 'ml' ? 'നമസ്കാരം' : 'Hello'}, {user?.name?.split(' ')[0] || 'Operative'}!
            </h1>
          </div>

          {/* Quick Duty Toggle Pill */}
          <button
            type="button"
            onClick={requestToggleDuty}
            disabled={togglingDuty}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer border ${
              isOnDuty
                ? 'bg-emerald-500 hover:bg-emerald-400 text-white border-emerald-400/40'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOnDuty ? 'bg-white animate-ping' : 'bg-slate-400'
              }`}
            />
            <span>{isOnDuty ? (language === 'ml' ? 'ഡ്യൂട്ടിയിൽ' : 'Available') : (language === 'ml' ? 'അവധി' : 'Off Duty')}</span>
          </button>
        </div>

        {/* ========================================================
            CASE A: CURRENT WORK ORDER IS ASSIGNED OR IN PROGRESS
            "only shows the current work there"
        ======================================================== */}
        {currentWork ? (
          <div className="w-full flex flex-col gap-4">
            <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-purple-200/80 flex flex-col gap-4 relative overflow-hidden">
              
              {/* Header: Service Name, Status Badge & Classification Tag with Service Image */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden shrink-0 border border-slate-200 shadow-xs bg-slate-100">
                    <Image
                      src={getServiceBanner(currentWork.serviceName)}
                      alt={currentWork.serviceName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                          currentWork.status === 'IN_PROGRESS'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-blue-50 text-blue-800 border-blue-300'
                        }`}
                      >
                        {currentWork.status === 'IN_PROGRESS'
                          ? '● ' + (language === 'ml' ? 'നടക്കുന്നു' : 'In Progress')
                          : '● ' + (language === 'ml' ? 'പുതിയ ജോലി' : 'New Assignment')}
                      </span>

                      <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {currentWork.trackingNumber}
                      </span>

                      {/* Service Classification Pill */}
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md">
                        {isHourly
                          ? 'Hourly / JCB'
                          : isCoconut
                          ? 'Per Tree'
                          : isSqFt
                          ? 'Sq. Ft.'
                          : isPoint
                          ? 'Per Point'
                          : isFoot
                          ? 'Per Foot'
                          : isDaily
                          ? 'Daily Wage'
                          : 'Fixed Visit'}
                      </span>
                    </div>

                    <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight truncate">
                      {translateService(currentWork.serviceName)}
                    </h2>
                  </div>
                </div>
              </div>

              {/* 1-Tap Mobile Action Row: Call Office for Doubts & Turn-by-Turn GPS */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* 1-Tap Call Office / Admin Desk */}
                <a
                  href={`tel:${officePhone}`}
                  className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs shadow-sm transition-all"
                  title="Call Office Coordinator for site doubts"
                >
                  <Phone className="w-4 h-4 fill-current shrink-0" />
                  <span className="truncate">{language === 'ml' ? 'ഓഫീസിലേക്ക് വിളിക്കുക' : 'Call Office Desk'}</span>
                </a>

                {/* 1-Tap Google Navigation to Site */}
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs shadow-sm transition-all"
                >
                  <Navigation className="w-4 h-4 fill-current shrink-0" />
                  <span className="truncate">{language === 'ml' ? 'റൂട്ട് മാപ്പ്' : 'Directions'}</span>
                </a>
              </div>

              {/* Staff / Admin Instructions & Office Helpline Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">
                    {language === 'ml' ? 'ഓഫീസ് കോർഡിനേറ്റർ' : 'Office Coordinator'}:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <strong className="text-slate-900 font-bold">{officeCoordinatorName}</strong>
                    <a
                      href={`tel:${officePhone}`}
                      className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-0.5 ml-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{officePhone}</span>
                    </a>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">{t('site')}:</span>
                  <span className="text-slate-800 font-bold truncate max-w-[200px]">
                    {currentWork.location || `${currentWork.city || ''}, ${currentWork.district || 'Kerala'}`}
                  </span>
                </div>

                {/* Instructions from Staff / Admin */}
                {currentWork.locationRemarks && (
                  <div className="text-[11px] text-slate-600 pt-1.5 border-t border-slate-200/60 bg-white/80 p-2 rounded-xl">
                    <span className="font-bold text-[#2A835F] block mb-0.5">
                      {language === 'ml' ? 'ഓഫീസ് നിർദ്ദേശങ്ങൾ' : 'Office Dispatch Guidelines'}:
                    </span>
                    {currentWork.locationRemarks}
                  </div>
                )}

                {currentWork.message && (
                  <div className="text-[11px] text-slate-600 bg-white/80 p-2 rounded-xl">
                    <span className="font-bold text-slate-700 block mb-0.5">
                      {language === 'ml' ? 'ജോലി വിവരങ്ങൾ' : 'Work Order Instructions'}:
                    </span>
                    {currentWork.message}
                  </div>
                )}

                {/* Doubts Notice */}
                <div className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-200/60 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
                  <span>
                    {language === 'ml'
                      ? 'എന്തെങ്കിലും സംശയങ്ങൾ ഉണ്ടെങ്കിൽ ഓഫീസിലേക്ക് വിളിക്കുക.'
                      : 'For site doubts or assistance, contact office dispatch directly.'}
                  </span>
                </div>
              </div>

              {/* ========================================================
                  THE EMBEDDED REACT LEAFLET MAP CARD (MOBILE VISIBLE!)
              ======================================================== */}
              <div className="relative w-full rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs bg-slate-100 flex flex-col">
                <div className="px-3 py-2 bg-white border-b border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-[11px] font-bold text-slate-800 truncate">
                      {language === 'ml' ? 'തത്സമയ മാപ്പ്' : 'Live Field Map'}: {currentWork.district || 'Kerala'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const order: ('STREET' | 'SATELLITE' | 'DARK' | 'TERRAIN')[] = ['STREET', 'SATELLITE', 'DARK', 'TERRAIN'];
                        const nextIndex = (order.indexOf(settings.tileLayer) + 1) % order.length;
                        updateSettings({ tileLayer: order[nextIndex] });
                      }}
                      className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Layers className="w-3 h-3 text-emerald-600" />
                      <span>{TILE_PROVIDERS[settings.tileLayer]?.name.split(' ')[0] || 'Map'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsFullMapOpen(true)}
                      className="p-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Open Fullscreen"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="relative w-full h-44 sm:h-52">
                  <div className="absolute top-2 right-2 z-10">
                    <button
                      type="button"
                      onClick={requestGpsLocation}
                      disabled={isLocating}
                      className="p-1.5 rounded-lg bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm text-slate-700 hover:text-emerald-600 active:scale-95 transition-all"
                      title="Recalibrate GPS"
                    >
                      <LocateFixed className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-emerald-600' : 'text-slate-700'}`} />
                    </button>
                  </div>

                  <WorkerLeafletMapCore
                    activeJob={currentWork}
                    operatives={[]}
                    height="100%"
                    zoom={13}
                    interactive={true}
                  />
                </div>
              </div>

              {/* ========================================================
                  BESPOKE CLASSIFICATION HUD
                  - ONLY Hourly Machinery gets the timer!
                  - Per-Tree gets Tree Counter HUD
                  - Per-Sq.Ft. gets Area Measurement HUD
                  - Per-Point gets Electrical Points HUD
                  - Per-Foot gets Borewell Depth HUD
                  - Daily gets Day Shifts HUD
                  - Fixed Visit gets Visit Confirmation HUD
              ======================================================== */}
              {/* ========================================================
                  3-STEP WORK LIFECYCLE PROGRESS STEPPER
                  1. Work Assigned -> Accept
                  2. Accepted -> Reached Work Site
                  3. At Site -> Start Timer / Start Work & Complete
              ======================================================== */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-1.5 sm:gap-3">
                {/* Step 1: Work Assigned */}
                <div
                  className={`flex-1 flex flex-col items-center text-center p-2 rounded-xl transition-all ${
                    !isAccepted
                      ? 'bg-amber-100/90 text-amber-950 border border-amber-300 font-bold shadow-xs'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200/70'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                        isAccepted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-600 text-white animate-pulse'
                      }`}
                    >
                      {isAccepted ? '✓' : '1'}
                    </span>
                    <span className="text-[11px] font-black truncate">
                      {language === 'ml' ? 'ജോലി നൽകി' : 'Assigned'}
                    </span>
                  </div>
                  <span className="text-[9px] font-medium text-slate-500">
                    {isAccepted
                      ? language === 'ml'
                        ? 'സ്വീകരിച്ചു'
                        : 'Accepted'
                      : language === 'ml'
                      ? 'സ്വീകരിക്കുക'
                      : 'Pending'}
                  </span>
                </div>

                <div className="text-slate-300 font-bold text-xs">→</div>

                {/* Step 2: Reached Site */}
                <div
                  className={`flex-1 flex flex-col items-center text-center p-2 rounded-xl transition-all ${
                    isAccepted && !hasReachedSite
                      ? 'bg-blue-100/90 text-blue-950 border border-blue-300 font-bold shadow-xs animate-pulse'
                      : hasReachedSite
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/70'
                      : 'bg-slate-100/70 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                        hasReachedSite
                          ? 'bg-emerald-600 text-white'
                          : isAccepted
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-400 text-white'
                      }`}
                    >
                      {hasReachedSite ? '✓' : '2'}
                    </span>
                    <span className="text-[11px] font-black truncate">
                      {language === 'ml' ? 'സൈറ്റിൽ എത്തി' : 'Reached Site'}
                    </span>
                  </div>
                  <span className="text-[9px] font-medium text-slate-500">
                    {hasReachedSite
                      ? language === 'ml'
                        ? 'സൈറ്റിൽ'
                        : 'At Site'
                      : language === 'ml'
                      ? 'യാത്രയിലാണ്'
                      : 'En Route'}
                  </span>
                </div>

                <div className="text-slate-300 font-bold text-xs">→</div>

                {/* Step 3: Start Timer / Work */}
                <div
                  className={`flex-1 flex flex-col items-center text-center p-2 rounded-xl transition-all ${
                    hasReachedSite && currentWork.status !== 'COMPLETED'
                      ? 'bg-emerald-100/90 text-emerald-950 border border-emerald-300 font-bold shadow-xs'
                      : currentWork.status === 'COMPLETED'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/70'
                      : 'bg-slate-100/70 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                        currentWork.status === 'COMPLETED'
                          ? 'bg-emerald-600 text-white'
                          : currentWork.status === 'IN_PROGRESS'
                          ? 'bg-emerald-600 text-white animate-spin'
                          : hasReachedSite
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-400 text-white'
                      }`}
                    >
                      {currentWork.status === 'COMPLETED' ? '✓' : '3'}
                    </span>
                    <span className="text-[11px] font-black truncate">
                      {isHourly
                        ? language === 'ml'
                          ? 'ടൈമർ'
                          : 'Timer'
                        : language === 'ml'
                          ? 'ജോലി'
                          : 'Work'}
                    </span>
                  </div>
                  <span className="text-[9px] font-medium text-slate-500">
                    {currentWork.status === 'IN_PROGRESS'
                      ? language === 'ml'
                        ? 'നടക്കുന്നു'
                        : 'Running'
                      : language === 'ml'
                      ? 'ആരംഭിക്കുക'
                      : 'Start'}
                  </span>
                </div>
              </div>

              {/* STEP 1 ACTION CARD: Accept Work Order */}
              {!isAccepted && (
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-200 flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm font-black text-lg">
                      1
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-black text-amber-900">
                        {language === 'ml' ? 'ഘട്ടം 1: ജോലി സ്വീകരിക്കുക' : 'Step 1: Accept Work Order'}
                      </h3>
                      <p className="text-xs text-amber-800/90 mt-0.5">
                        {language === 'ml'
                          ? 'ഈ ജോലി നിങ്ങൾക്ക് നൽകിയിരിക്കുന്നു. വിവരങ്ങൾ പരിശോധിച്ച് താഴെ ക്ലിക്ക് ചെയ്ത് സ്വീകരിക്കുക.'
                          : 'This work order is assigned to you. Review instructions and accept to proceed to the site.'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isSubmittingAction}
                    onClick={handleAcceptJob}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
                  >
                    {isSubmittingAction ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>
                      {language === 'ml' ? 'ജോലി സ്വീകരിക്കുക (Accept Work)' : 'Accept Work Order'}
                    </span>
                  </button>
                </div>
              )}

              {/* STEP 2 ACTION CARD: Mark Reached Work Site */}
              {isAccepted && !hasReachedSite && (
                <div className="p-4 sm:p-5 rounded-2xl bg-blue-50 border-2 border-blue-200 flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm font-black text-lg">
                      2
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-black text-blue-900">
                        {language === 'ml' ? 'ഘട്ടം 2: വർക്ക് സൈറ്റിൽ എത്തിച്ചേരുക' : 'Step 2: Reach Work Site'}
                      </h3>
                      <p className="text-xs text-blue-800/90 mt-0.5">
                        {language === 'ml'
                          ? 'നിങ്ങൾ ജോലി സ്വീകരിച്ചു. വർക്ക് സൈറ്റിൽ എത്തിയ ശേഷം താഴെ ക്ലിക്ക് ചെയ്യുക (അപ്പോൾ ടൈമർ / ജോലി ആരംഭിക്കാൻ സാധിക്കും).'
                          : 'Work accepted. When you arrive at the client site, click below to confirm arrival and unlock the timer/work.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="py-3 px-4 rounded-xl bg-white border border-blue-200 text-blue-700 font-bold text-xs flex items-center justify-center gap-2 hover:bg-blue-50 transition-all shadow-xs"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>{language === 'ml' ? 'റൂട്ട് കാണുക' : 'GPS Directions'}</span>
                    </a>

                    <button
                      type="button"
                      disabled={isSubmittingAction}
                      onClick={handleReachedSite}
                      className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
                    >
                      {isSubmittingAction ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                      <span>
                        {language === 'ml' ? 'വർക്ക് സൈറ്റിൽ എത്തിച്ചേർന്നു' : 'I Have Reached Work Site'}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* ========================================================
                  STEP 3: WORK EXECUTION & BESPOKE HUD
                  - ONLY Hourly Machinery gets the timer!
                  - Per-Tree gets Tree Counter HUD
                  - Per-Sq.Ft. gets Area Measurement HUD
                  - Per-Point gets Electrical Points HUD
                  - Per-Foot gets Borewell Depth HUD
                  - Daily gets Day Shifts HUD
                  - Fixed Visit gets Visit Confirmation HUD
              ======================================================== */}
              <div>
                {/* 1. HOURLY PAY (JCB, EXCAVATOR, MACHINERY ONLY) */}
                {isHourly && (
                  <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Timer className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-extrabold text-white">
                          {language === 'ml' ? 'മെഷീൻ ടൈമർ (മണിക്കൂർ നിരക്ക്)' : 'Hourly Machinery Chronometer'}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {currentWork.totalCalculatedWage && currentWork.totalCalculatedWage > 0
                          ? `₹${currentWork.totalCalculatedWage}`
                          : (language === 'ml' ? 'ഓഫീസ് പേഔട്ട്' : 'Post-Work Payout')}
                      </span>
                    </div>

                    <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 text-center flex flex-col items-center justify-center gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isTimerRunning ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
                          }`}
                        />
                        {isTimerRunning
                          ? language === 'ml'
                            ? 'ടൈമർ പ്രവർത്തിക്കുന്നു (ഓൺ-സൈറ്റ്)'
                            : 'Running on Site'
                          : language === 'ml'
                          ? 'ടൈമർ നിർത്തിയിരിക്കുന്നു'
                          : 'Timer Stopped / Paused'}
                      </span>

                      <div className="text-4xl sm:text-5xl font-black font-mono tracking-wider text-emerald-400">
                        {formatTimer(timerSeconds)}
                      </div>

                      <div className="mt-2 text-xs font-semibold text-slate-300 flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/50">
                        <IndianRupee className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>
                          {currentWork.totalCalculatedWage && currentWork.totalCalculatedWage > 0
                            ? `${language === 'ml' ? 'നിശ്ചയിച്ച വേതനം' : 'Finalized Payout'}: ₹${currentWork.totalCalculatedWage}`
                            : (language === 'ml'
                                ? 'വേതനം ജോലി പൂർത്തിയായ ശേഷം അഡ്മിൻ / ഓഫീസ് സ്റ്റാഫ് നിശ്ചയിക്കും'
                                : 'Payout will be updated by Admin / Office Staff after work finishes')}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {currentWork.status === 'ASSIGNED' ? (
                        <button
                          type="button"
                          disabled={isSubmittingAction || !hasReachedSite}
                          onClick={handleStartHourlyTimer}
                          className={`w-full py-3.5 px-4 rounded-xl font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 active:scale-98 ${
                            hasReachedSite
                              ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white cursor-pointer'
                              : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                          }`}
                        >
                          {isSubmittingAction ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Play className="w-4 h-4 fill-current" />
                          )}
                          <span>
                            {hasReachedSite
                              ? language === 'ml'
                                ? 'ടൈമർ ആരംഭിക്കുക (Start Timer)'
                                : 'Start Machine & Timer'
                              : language === 'ml'
                              ? 'സൈറ്റിൽ എത്തിയ ശേഷം ടൈമർ ആരംഭിക്കുക'
                              : 'Reach Site to Start Timer'}
                          </span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleTogglePauseTimer}
                            className={`py-3.5 px-3.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                              isTimerRunning
                                ? 'bg-slate-800 text-amber-300 border-amber-500/30'
                                : 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
                            }`}
                          >
                            {isTimerRunning ? (
                              <>
                                <Pause className="w-3.5 h-3.5" />
                                <span>{language === 'ml' ? 'പോസ്' : 'Pause'}</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>{language === 'ml' ? 'തുടങ്ങുക' : 'Resume'}</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            disabled={isSubmittingAction}
                            onClick={handleStopTimerAndComplete}
                            className="flex-1 py-3.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 text-white font-black text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 truncate"
                          >
                            {isSubmittingAction ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <StopCircle className="w-4 h-4 shrink-0" />
                            )}
                            <span className="truncate">
                              {language === 'ml' ? 'നിർത്തി പൂർത്തിയാക്കുക' : 'Stop & Complete Work'}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. PER TREE PAY (COCONUT PLUCKING & CROWN CLEANING) */}
                {isCoconut && (
                  <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 text-white rounded-2xl p-4 sm:p-5 border border-emerald-800/80 shadow-md flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TreePalm className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-extrabold text-white">
                          {language === 'ml' ? 'തെങ്ങുകളുടെ എണ്ണം' : 'Coconut Tree Counter'}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {currentWork.totalCalculatedWage && currentWork.totalCalculatedWage > 0
                          ? `₹${currentWork.totalCalculatedWage}`
                          : (language === 'ml' ? 'ഓഫീസ് പേഔട്ട്' : 'Post-Work Payout')}
                      </span>
                    </div>

                    <div className="bg-slate-900/90 rounded-xl p-4 border border-emerald-900/70 text-center flex flex-col items-center justify-center gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                        {language === 'ml' ? 'കയറിയ തെങ്ങുകൾ കൂട്ടുക' : 'Trees Climbed / Harvested'}
                      </span>

                      <div className="flex items-center justify-center gap-3 sm:gap-5">
                        <button
                          type="button"
                          onClick={() => setUnitCount((prev) => Math.max(1, prev - 1))}
                          className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white flex items-center justify-center border border-slate-700 transition-all cursor-pointer shadow-sm text-lg font-bold"
                          title="Subtract 1 tree"
                        >
                          <Minus className="w-5 h-5 text-slate-200" />
                        </button>

                        <div className="flex flex-col items-center">
                          <input
                            type="number"
                            min="1"
                            max="500"
                            value={unitCount}
                            onChange={(e) => setUnitCount(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-24 sm:w-28 text-center text-4xl sm:text-5xl font-black font-mono text-emerald-400 bg-transparent border-b-2 border-emerald-500/60 focus:outline-hidden py-0.5"
                          />
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {language === 'ml' ? 'തെങ്ങ്' : 'Trees'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setUnitCount((prev) => prev + 1)}
                          className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white flex items-center justify-center border border-emerald-400 transition-all cursor-pointer shadow-sm text-lg font-bold"
                          title="Add 1 tree"
                        >
                          <Plus className="w-5 h-5 text-white" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setUnitCount((prev) => prev + 1)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                        >
                          +1
                        </button>
                        <button
                          type="button"
                          onClick={() => setUnitCount((prev) => prev + 5)}
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-300 border border-emerald-500/30 transition-colors cursor-pointer"
                        >
                          +5
                        </button>
                        <button
                          type="button"
                          onClick={() => setUnitCount((prev) => prev + 10)}
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-300 border border-emerald-500/30 transition-colors cursor-pointer"
                        >
                          +10
                        </button>
                      </div>

                      <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-emerald-900/40">
                        <IndianRupee className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>
                          {currentWork.totalCalculatedWage && currentWork.totalCalculatedWage > 0
                            ? `${language === 'ml' ? 'നിശ്ചയിച്ച വേതനം' : 'Finalized Payout'}: ₹${currentWork.totalCalculatedWage}`
                            : (language === 'ml'
                                ? 'വേതനം ജോലി പൂർത്തിയായ ശേഷം അഡ്മിൻ / ഓഫീസ് സ്റ്റാഫ് നിശ്ചയിക്കും'
                                : 'Payout finalized by Admin / Office Staff upon completion')}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={crownCleaningDone}
                          onChange={(e) => setCrownCleaningDone(e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="font-semibold text-slate-200 truncate">
                          {language === 'ml' ? 'തല വെട്ടി' : 'Crown Cleaned'}
                        </span>
                      </label>

                      <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={beetleMedicineApplied}
                          onChange={(e) => setBeetleMedicineApplied(e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="font-semibold text-slate-200 truncate">
                          {language === 'ml' ? 'മരുന്ന് ഇട്ടു' : 'Medicine Applied'}
                        </span>
                      </label>
                    </div>

                    <div>
                      {currentWork.status === 'ASSIGNED' ? (
                        <button
                          type="button"
                          disabled={isSubmittingAction || !hasReachedSite}
                          onClick={handleStartGeneralWork}
                          className={`w-full py-3.5 px-4 rounded-xl font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 active:scale-98 ${
                            hasReachedSite
                              ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 text-white cursor-pointer'
                              : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                          }`}
                        >
                          {isSubmittingAction ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Play className="w-4 h-4 fill-current" />
                          )}
                          <span>
                            {hasReachedSite
                              ? language === 'ml'
                                ? 'ജോലി ആരംഭിക്കുക'
                                : 'Start Tree Harvesting'
                              : language === 'ml'
                              ? 'സൈറ്റിൽ എത്തിയ ശേഷം ജോലി തുടങ്ങുക'
                              : 'Reach Site to Start Work'}
                          </span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isSubmittingAction}
                          onClick={handleSubmitUnitsAndComplete}
                          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 text-white font-black text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                        >
                          {isSubmittingAction ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                          <span>
                            {language === 'ml'
                              ? `പൂർത്തിയായി (${unitCount} തെങ്ങ് സമർപ്പിക്കുക)`
                              : `Submit ${unitCount} Trees & Complete`}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. PER SQFT PAY (PAINTING, TILE, MARBLE LAYING) */}
                {isSqFt && (
                  <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 border border-indigo-800/80 shadow-md flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Paintbrush className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-extrabold text-white">
                          {language === 'ml' ? 'വിസ്തീർണ്ണം (ചതുരശ്ര അടി)' : 'Area Measurement (Sq. Ft.)'}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {currentWork.totalCalculatedWage && currentWork.totalCalculatedWage > 0
                          ? `₹${currentWork.totalCalculatedWage}`
                          : (language === 'ml' ? 'ഓഫീസ് പേഔട്ട്' : 'Post-Work Payout')}
                      </span>
                    </div>

                    <div className="bg-slate-900/90 rounded-xl p-4 border border-indigo-900/70 text-center flex flex-col items-center justify-center gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                        {language === 'ml' ? 'പൂർത്തിയായ വിസ്തീർണ്ണം' : 'Completed Surface Area'}
                      </span>

                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => setUnitCount((prev) => Math.max(10, prev - 50))}
                          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white border border-slate-700 text-xs font-bold"
                        >
                          -50
                        </button>

                        <div className="flex flex-col items-center">
                          <input
                            type="number"
                            min="1"
                            step="10"
                            value={unitCount}
                            onChange={(e) => setUnitCount(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-28 text-center text-3xl sm:text-4xl font-black font-mono text-indigo-300 bg-transparent border-b-2 border-indigo-500/60 focus:outline-hidden py-0.5"
                          />
                          <span className="text-[10px] text-slate-400 font-semibold">Sq. Ft.</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setUnitCount((prev) => prev + 50)}
                          className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white border border-indigo-400 text-xs font-bold"
                        >
                          +50
                        </button>
                        <button
                          type="button"
                          onClick={() => setUnitCount((prev) => prev + 100)}
                          className="px-3 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-600 active:scale-95 text-white border border-indigo-500 text-xs font-bold"
                        >
                          +100
                        </button>
                      </div>

                      <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-indigo-900/40">
                        <IndianRupee className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>
                          {currentWork.totalCalculatedWage && currentWork.totalCalculatedWage > 0
                            ? `${language === 'ml' ? 'നിശ്ചയിച്ച വേതനം' : 'Finalized Payout'}: ₹${currentWork.totalCalculatedWage}`
                            : (language === 'ml'
                                ? 'വേതനം ജോലി പൂർത്തിയായ ശേഷം അഡ്മിൻ / ഓഫീസ് സ്റ്റാഫ് നിശ്ചയിക്കും'
                                : 'Payout finalized by Admin / Office Staff upon completion')}
                        </span>
                      </div>
                    </div>

                    <div>
                      {currentWork.status === 'ASSIGNED' ? (
                        <button
                          type="button"
                          disabled={isSubmittingAction || !hasReachedSite}
                          onClick={handleStartGeneralWork}
                          className={`w-full py-3.5 px-4 rounded-xl font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 active:scale-98 ${
                            hasReachedSite
                              ? 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer'
                              : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                          }`}
                        >
                          <span>
                            {hasReachedSite
                              ? language === 'ml'
                                ? 'ജോലി ആരംഭിക്കുക'
                                : 'Start Surface Work'
                              : language === 'ml'
                              ? 'സൈറ്റിൽ എത്തിയ ശേഷം ജോലി തുടങ്ങുക'
                              : 'Reach Site to Start Work'}
                          </span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isSubmittingAction}
                          onClick={handleSubmitUnitsAndComplete}
                          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 text-white font-black text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                        >
                          <span>
                            {language === 'ml'
                              ? `പൂർത്തിയായി (${unitCount} Sq.Ft. സമർപ്പിക്കുക)`
                              : `Submit ${unitCount} Sq.Ft. & Complete`}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. PER POINT PAY (ELECTRICAL WIRING) */}
                {isPoint && (
                  <div className="bg-gradient-to-br from-amber-950 via-slate-900 to-amber-950 text-white rounded-2xl p-4 sm:p-5 border border-amber-800/80 shadow-md flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-extrabold text-white">
                          {language === 'ml' ? 'പോയിന്റുകളുടെ എണ്ണം' : 'Electrical Points Installed'}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {currentWork.totalCalculatedWage && currentWork.totalCalculatedWage > 0
                          ? `₹${currentWork.totalCalculatedWage}`
                          : (language === 'ml' ? 'ഓഫീസ് പേഔട്ട്' : 'Post-Work Payout')}
                      </span>
                    </div>

                    <div className="bg-slate-900/90 rounded-xl p-4 border border-amber-900/70 text-center flex flex-col items-center justify-center gap-3">
                      <div className="flex items-center justify-center gap-4">
                        <button
                          type="button"
                          onClick={() => setUnitCount((prev) => Math.max(1, prev - 1))}
                          className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-lg font-bold"
                        >
                          -1
                        </button>
                        <div className="flex flex-col items-center">
                          <input
                            type="number"
                            min="1"
                            value={unitCount}
                            onChange={(e) => setUnitCount(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-24 text-center text-4xl font-black font-mono text-amber-400 bg-transparent border-b-2 border-amber-500/60 focus:outline-hidden py-0.5"
                          />
                          <span className="text-[10px] text-slate-400 font-semibold">Points</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setUnitCount((prev) => prev + 1)}
                          className="w-12 h-12 rounded-xl bg-amber-600 hover:bg-amber-500 text-white border border-amber-400 text-lg font-bold"
                        >
                          +1
                        </button>
                      </div>

                      <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-amber-900/40">
                        <IndianRupee className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>
                          {currentWork.totalCalculatedWage && currentWork.totalCalculatedWage > 0
                            ? `${language === 'ml' ? 'നിശ്ചയിച്ച വേതനം' : 'Finalized Payout'}: ₹${currentWork.totalCalculatedWage}`
                            : (language === 'ml'
                                ? 'വേതനം ജോലി പൂർത്തിയായ ശേഷം അഡ്മിൻ / ഓഫീസ് സ്റ്റാഫ് നിശ്ചയിക്കും'
                                : 'Payout finalized by Admin / Office Staff upon completion')}
                        </span>
                      </div>
                    </div>

                    <div>
                      {currentWork.status === 'ASSIGNED' ? (
                        <button
                          type="button"
                          disabled={isSubmittingAction || !hasReachedSite}
                          onClick={handleStartGeneralWork}
                          className={`w-full py-3.5 px-4 rounded-xl font-black text-sm transition-all shadow-md ${
                            hasReachedSite
                              ? 'bg-amber-600 hover:bg-amber-500 text-white cursor-pointer'
                              : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                          }`}
                        >
                          <span>
                            {hasReachedSite
                              ? 'Start Electrical Work'
                              : language === 'ml'
                              ? 'സൈറ്റിൽ എത്തിയ ശേഷം ജോലി തുടങ്ങുക'
                              : 'Reach Site to Start Work'}
                          </span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isSubmittingAction}
                          onClick={handleSubmitUnitsAndComplete}
                          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-emerald-600 text-white font-black text-xs sm:text-sm shadow-md"
                        >
                          <span>Submit {unitCount} Points & Complete</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 5. PER FOOT PAY (BOREWELL DRILLING & PILING) */}
                {isFoot && (
                  <div className="bg-gradient-to-br from-cyan-950 via-slate-900 to-cyan-950 text-white rounded-2xl p-4 sm:p-5 border border-cyan-800/80 shadow-md flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-extrabold text-white">
                          {language === 'ml' ? 'ഡ്രില്ലിംഗ് ആഴം (അടി)' : 'Borewell Drilling Depth (Feet)'}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {currentWork.totalCalculatedWage && currentWork.totalCalculatedWage > 0
                          ? `₹${currentWork.totalCalculatedWage}`
                          : (language === 'ml' ? 'ഓഫീസ് പേഔട്ട്' : 'Post-Work Payout')}
                      </span>
                    </div>

                    <div className="bg-slate-900/90 rounded-xl p-4 border border-cyan-900/70 text-center flex flex-col items-center justify-center gap-3">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => setUnitCount((prev) => Math.max(10, prev - 25))}
                          className="px-3 py-2 rounded-xl bg-slate-800 text-white border border-slate-700 text-xs font-bold"
                        >
                          -25 Ft
                        </button>
                        <div className="flex flex-col items-center">
                          <input
                            type="number"
                            min="10"
                            step="10"
                            value={unitCount}
                            onChange={(e) => setUnitCount(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-28 text-center text-3xl font-black font-mono text-cyan-300 bg-transparent border-b-2 border-cyan-500/60 focus:outline-hidden py-0.5"
                          />
                          <span className="text-[10px] text-slate-400 font-semibold">Feet Depth</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setUnitCount((prev) => prev + 25)}
                          className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-400 text-xs font-bold"
                        >
                          +25 Ft
                        </button>
                      </div>

                      <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-cyan-900/40">
                        <IndianRupee className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>
                          {currentWork.totalCalculatedWage && currentWork.totalCalculatedWage > 0
                            ? `${language === 'ml' ? 'നിശ്ചയിച്ച വേതനം' : 'Finalized Payout'}: ₹${currentWork.totalCalculatedWage}`
                            : (language === 'ml'
                                ? 'വേതനം ജോലി പൂർത്തിയായ ശേഷം അഡ്മിൻ / ഓഫീസ് സ്റ്റാഫ് നിശ്ചയിക്കും'
                                : 'Payout finalized by Admin / Office Staff upon completion')}
                        </span>
                      </div>
                    </div>

                    <div>
                      {currentWork.status === 'ASSIGNED' ? (
                        <button
                          type="button"
                          disabled={isSubmittingAction || !hasReachedSite}
                          onClick={handleStartGeneralWork}
                          className={`w-full py-3.5 px-4 rounded-xl font-black text-sm shadow-md ${
                            hasReachedSite
                              ? 'bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer'
                              : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                          }`}
                        >
                          <span>
                            {hasReachedSite
                              ? 'Start Drilling Work'
                              : language === 'ml'
                              ? 'സൈറ്റിൽ എത്തിയ ശേഷം ജോലി തുടങ്ങുക'
                              : 'Reach Site to Start Work'}
                          </span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isSubmittingAction}
                          onClick={handleSubmitUnitsAndComplete}
                          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 text-white font-black text-xs sm:text-sm shadow-md"
                        >
                          <span>Submit {unitCount} Feet & Complete</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 6. DAILY WAGE (MASONRY, BRICK CONSTRUCTION) */}
                {isDaily && (
                  <div className="bg-gradient-to-br from-rose-950 via-slate-900 to-rose-950 text-white rounded-2xl p-4 sm:p-5 border border-rose-800/80 shadow-md flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HardHat className="w-4 h-4 text-rose-400" />
                        <span className="text-xs font-extrabold text-white">
                          {language === 'ml' ? 'ദിവസങ്ങൾ / ഷിഫ്റ്റുകൾ' : 'Daily Construction Shift'}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {currentWork.totalCalculatedWage && currentWork.totalCalculatedWage > 0
                          ? `₹${currentWork.totalCalculatedWage}`
                          : (language === 'ml' ? 'ഓഫീസ് പേഔട്ട്' : 'Post-Work Payout')}
                      </span>
                    </div>

                    <div className="bg-slate-900/90 rounded-xl p-4 border border-rose-900/70 text-center flex flex-col items-center justify-center gap-2">
                      <span className="text-xs text-slate-300 font-semibold">
                        Day Shift Standard: 8 Hours + Bata
                      </span>
                      <div className="text-3xl font-black font-mono text-rose-300">
                        {unitCount} {unitCount > 1 ? 'Days' : 'Day / Shift'}
                      </div>
                      <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-rose-900/40">
                        <IndianRupee className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>
                          {currentWork.totalCalculatedWage && currentWork.totalCalculatedWage > 0
                            ? `${language === 'ml' ? 'നിശ്ചയിച്ച വേതനം' : 'Finalized Payout'}: ₹${currentWork.totalCalculatedWage}`
                            : (language === 'ml'
                                ? 'വേതനം ജോലി പൂർത്തിയായ ശേഷം അഡ്മിൻ / ഓഫീസ് സ്റ്റാഫ് നിശ്ചയിക്കും'
                                : 'Payout finalized by Admin / Office Staff upon completion')}
                        </span>
                      </div>
                    </div>

                    <div>
                      {currentWork.status === 'ASSIGNED' ? (
                        <button
                          type="button"
                          disabled={isSubmittingAction || !hasReachedSite}
                          onClick={handleStartGeneralWork}
                          className={`w-full py-3.5 px-4 rounded-xl font-black text-sm shadow-md ${
                            hasReachedSite
                              ? 'bg-rose-600 hover:bg-rose-500 text-white cursor-pointer'
                              : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                          }`}
                        >
                          <span>
                            {hasReachedSite
                              ? 'Start Daily Shift'
                              : language === 'ml'
                              ? 'സൈറ്റിൽ എത്തിയ ശേഷം ജോലി തുടങ്ങുക'
                              : 'Reach Site to Start Work'}
                          </span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isSubmittingAction}
                          onClick={handleSubmitUnitsAndComplete}
                          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-emerald-600 text-white font-black text-xs sm:text-sm shadow-md"
                        >
                          <span>Complete Shift ({unitCount} Days)</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 7. FIXED VISIT / INSPECTION (PLUMBING, REPAIR) */}
                {isVisit && (
                  <div className="bg-gradient-to-br from-teal-950 via-slate-900 to-teal-950 text-white rounded-2xl p-4 sm:p-5 border border-teal-800/80 shadow-md flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-teal-400" />
                        <span className="text-xs font-extrabold text-white">
                          {language === 'ml' ? 'സർവീസ് വിസിറ്റ്' : 'Service Inspection & Repair'}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        {currentWork.totalCalculatedWage && currentWork.totalCalculatedWage > 0
                          ? `₹${currentWork.totalCalculatedWage}`
                          : (language === 'ml' ? 'ഓഫീസ് പേഔട്ട്' : 'Post-Work Payout')}
                      </span>
                    </div>

                    <div className="bg-slate-900/90 rounded-xl p-4 border border-teal-900/70 text-center flex flex-col items-center justify-center gap-2">
                      <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-teal-900/40">
                        <IndianRupee className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span>
                          {currentWork.totalCalculatedWage && currentWork.totalCalculatedWage > 0
                            ? `${language === 'ml' ? 'നിശ്ചയിച്ച വേതനം' : 'Finalized Payout'}: ₹${currentWork.totalCalculatedWage}`
                            : (language === 'ml'
                                ? 'വേതനം ജോലി പൂർത്തിയായ ശേഷം അഡ്മിൻ / ഓഫീസ് സ്റ്റാഫ് നിശ്ചയിക്കും'
                                : 'Payout finalized by Admin / Office Staff upon completion')}
                        </span>
                      </div>
                    </div>

                    <div>
                      {currentWork.status === 'ASSIGNED' ? (
                        <button
                          type="button"
                          disabled={isSubmittingAction || !hasReachedSite}
                          onClick={handleStartGeneralWork}
                          className={`w-full py-3.5 px-4 rounded-xl font-black text-sm shadow-md ${
                            hasReachedSite
                              ? 'bg-teal-600 hover:bg-teal-500 text-white cursor-pointer'
                              : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                          }`}
                        >
                          <span>
                            {hasReachedSite
                              ? 'Start Site Visit'
                              : language === 'ml'
                              ? 'സൈറ്റിൽ എത്തിയ ശേഷം ജോലി തുടങ്ങുക'
                              : 'Reach Site to Start Work'}
                          </span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isSubmittingAction}
                          onClick={handleSubmitUnitsAndComplete}
                          className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-md"
                        >
                          <span>Confirm Visit Completed</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* View Full Job Details shortcut */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>{language === 'ml' ? 'മുഴുവൻ വിവരങ്ങൾ' : 'Full Work Order Sheet'}</span>
                <button
                  type="button"
                  onClick={() => openJobModal(currentWork)}
                  className="font-bold text-[#5E42B4] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{t('viewDetails')}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Collapsible Previous Work History when active */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setShowHistoryWhenActive((prev) => !prev)}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 py-1.5 px-3 rounded-xl bg-slate-200/70 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <History className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  {showHistoryWhenActive
                    ? language === 'ml'
                      ? 'പഴയ ജോലികൾ മറയ്ക്കുക'
                      : 'Hide Past History'
                    : language === 'ml'
                    ? `കഴിഞ്ഞ ജോലികൾ കാണുക (${previousWorks.length})`
                    : `View Past Work (${previousWorks.length})`}
                </span>
                {showHistoryWhenActive ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================
              CASE B: NO ACTIVE WORK ASSIGNED (STANDBY MOBILE VIEW)
              "if no work is aassigned then previous datas, only, and only these much things we neede"
          ======================================================== */
          <div className="w-full flex flex-col gap-4">
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 text-center flex flex-col items-center justify-center gap-2.5">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <h2 className="text-base font-black text-slate-900">
                {language === 'ml'
                  ? 'നിലവിൽ ആക്റ്റീവ് ജോലികൾ ഇല്ല (സ്റ്റാൻഡ്‌ബൈ)'
                  : 'No Work Currently Assigned • Standby'}
              </h2>
              <p className="text-xs text-slate-500 max-w-sm">
                {language === 'ml'
                  ? 'ഓഫീസിൽ നിന്ന് പുതിയ ജോലി അനുവദിക്കുമ്പോൾ ഇവിടെ ദൃശ്യമാകും.'
                  : 'You are on standby. New dispatches will appear here immediately.'}
              </p>
            </div>

            {/* Standby Location Map: Shows worker's current area */}
            <div className="relative w-full rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs bg-slate-100 flex flex-col">
              <div className="px-3 py-2 bg-white border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800">
                    {language === 'ml' ? 'ഫീൽഡ് ഏരിയ' : 'Field Operations Area'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFullMapOpen(true)}
                  className="p-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center gap-1"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>{language === 'ml' ? 'മാപ്പ്' : 'Expand'}</span>
                </button>
              </div>

              <div className="relative w-full h-36">
                <WorkerLeafletMapCore
                  operatives={[]}
                  height="100%"
                  zoom={12}
                  interactive={true}
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            PREVIOUS WORK HISTORY (MOBILE FEED)
            - Visible when no work is assigned
            - Or expanded if worker toggles it while active
        ======================================================== */}
        {(!currentWork || showHistoryWhenActive) && (
          <div className="w-full bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                  {t('previousWorks')}
                </h3>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setHistoryFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    historyFilter === 'ALL'
                      ? 'bg-[#5E42B4] text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {t('allFilter')} ({jobs.filter((j) => j.status === 'COMPLETED').length})
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryFilter('THIS_MONTH')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    historyFilter === 'THIS_MONTH'
                      ? 'bg-[#5E42B4] text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {t('thisMonthFilter')}
                </button>
              </div>
            </div>

            {/* Mobile History Feed */}
            {loadingJobs ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Loading work records...
              </div>
            ) : previousWorks.length > 0 ? (
              <div className="space-y-2.5">
                {previousWorks.map((job) => {
                  const completedDate = new Date(job.completedAt || job.updatedAt || job.createdAt);
                  const formattedDate = completedDate.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  });

                  const jobSName = (job.serviceName || '').toLowerCase();
                  const jobIsCoconut =
                    job.wageType === 'PER_TREE' ||
                    jobSName.includes('coconut') ||
                    jobSName.includes('cococare') ||
                    jobSName.includes('palm') ||
                    jobSName.includes('തെങ്ങ്');
                  const jobIsHourly =
                    job.wageType === 'HOURLY' ||
                    jobSName.includes('jcb') ||
                    jobSName.includes('excavat') ||
                    jobSName.includes('crane') ||
                    jobSName.includes('ജെസിബി');

                  return (
                    <div
                      key={job.id}
                      onClick={() => openJobModal(job)}
                      className="p-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 active:scale-99 transition-all cursor-pointer shadow-xs flex flex-col gap-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-slate-100">
                            <Image
                              src={getServiceBanner(job.serviceName)}
                              alt={job.serviceName}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-extrabold text-xs sm:text-sm text-slate-900 block truncate">
                              {translateService(job.serviceName)}
                            </span>
                            <span className="text-[11px] text-slate-500 block truncate">
                              Ref: #{job.trackingNumber} • {job.location || job.district || 'Kerala'}
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                          {formattedDate}
                        </span>
                      </div>

                      {/* Units badge & Earned Wage */}
                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-xs">
                        <div>
                          {jobIsCoconut && job.completedUnits ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                              🌴 {job.completedUnits} {language === 'ml' ? 'തെങ്ങ്' : 'Trees'}
                            </span>
                          ) : jobIsHourly && (job.workDurationMinutes || job.completedUnits) ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                              ⏱️ {job.workDurationMinutes ? `${Math.floor(job.workDurationMinutes / 60)}h ${job.workDurationMinutes % 60}m` : `${job.completedUnits} hrs`}
                            </span>
                          ) : job.completedUnits ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200">
                              {job.completedUnits} {job.unitLabel || 'Units'}
                            </span>
                          ) : null}
                        </div>

                        {job.workerUnitWage && job.completedUnits ? (
                          <span className="font-black text-emerald-700 text-xs">
                            ₹{Math.round(job.completedUnits * job.workerUnitWage)}
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-[#5E42B4]">
                            {t('viewDetails')} →
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center rounded-xl bg-slate-50 text-slate-400 text-xs">
                {t('noPreviousWorkTitle')}
              </div>
            )}
          </div>
        )}
      </div>
    </WorkerShell>
  );
}
