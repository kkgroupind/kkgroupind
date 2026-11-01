'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Briefcase,
  IndianRupee,
  Clock,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Building,
  User,
  MapPin,
  Phone,
  Navigation,
  ChevronLeft,
  PlayCircle,
  TreePalm,
  Timer,
  Layers,
} from 'lucide-react';
import { ServiceEnquiry } from '@/services';
import { useWorkerLanguage } from '@/context/worker-language-context';

export interface WorkerWorkOrderDetailModalProps {
  job: ServiceEnquiry | any | null;
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  onUpdateStatus?: (jobId: string, status: 'IN_PROGRESS' | 'COMPLETED') => Promise<void>;
  isActing?: boolean;
  onJobUpdated?: () => void;
}

export function WorkerWorkOrderDetailModal({
  job,
  isOpen,
  onClose,
  onBack,
  onUpdateStatus,
  isActing = false,
  onJobUpdated,
}: WorkerWorkOrderDetailModalProps) {
  const router = useRouter();
  const { language, t, translateService } = useWorkerLanguage();
  const [copied, setCopied] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  if (!isOpen || !job) return null;

  const handleCopyReference = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const trackingNumber = job.trackingNumber || `KK-WO-${(job.id || '9021').slice(-6).toUpperCase()}`;
  const serviceName = job.serviceName || 'Field Service Operation';
  const serviceDisplayName = translateService ? translateService(serviceName) : serviceName;

  const sName = serviceName.toLowerCase();
  const sCat = (job.serviceCategory || '').toLowerCase();
  const isCoconut =
    sName.includes('coconut') ||
    sName.includes('palm') ||
    sCat.includes('coconut') ||
    sCat.includes('palm') ||
    job.unitLabel === 'Tree';

  const isHourly =
    job.isHourlyCalculated ||
    job.wageType === 'HOURLY' ||
    sName.includes('jcb') ||
    sName.includes('machine') ||
    sName.includes('equipment') ||
    job.unitLabel === 'Hour';

  const isAssigned = job.status === 'ASSIGNED';
  const isInProgress = job.status === 'IN_PROGRESS';
  const isCompleted = job.status === 'COMPLETED';

  // Format scheduled/created date
  const formattedDate = (() => {
    try {
      const dateVal = job.preferredDate || job.deadline || job.createdAt || new Date().toISOString();
      const d = new Date(dateVal);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Scheduled On-Duty';
    }
  })();

  // Render Wage or Hero Amount
  const wageRate = job.workerUnitWage || (isCoconut ? 80 : isHourly ? 900 : null);
  const totalEarned = job.totalCalculatedWage || job.totalCalculatedCost;

  const wageDisplay = totalEarned && totalEarned > 0
    ? `₹${Number(totalEarned).toLocaleString('en-IN')}`
    : wageRate
    ? `₹${Number(wageRate).toLocaleString('en-IN')} / ${isCoconut ? 'Tree' : isHourly ? 'Hr' : job.unitLabel || 'Unit'}`
    : null;

  const wageRateText = totalEarned && totalEarned > 0
    ? `₹${Number(totalEarned).toLocaleString('en-IN')} (Calculated Payout)`
    : wageRate
    ? `₹${Number(wageRate).toLocaleString('en-IN')} per ${isCoconut ? 'Tree' : isHourly ? 'Hour' : job.unitLabel || 'Unit'}`
    : 'Standard Field Operative Scale';

  // Google Maps query URL
  const mapQuery = job.mapUrl || job.location
    ? `${job.location || ''}, ${job.city || ''}, ${job.district || 'Kerala'}, India`
    : 'Kerala, India';
  const mapUrl = job.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

  // Coordinator info
  const spec = (job.specificationDetails as any) || {};
  const coordinatorName =
    job.officeStaff?.name ||
    job.officeStaff?.username ||
    spec.coordinatorName ||
    'KK Group Kerala Field Desk';

  // Hero Icon rendering matching WorkerNotificationDetailModal
  const renderHeroIcon = () => {
    if (isCoconut) {
      return (
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0F8A5F] to-[#055B3E] text-white flex items-center justify-center shadow-lg shadow-emerald-700/20">
          <TreePalm className="w-8 h-8 stroke-[2]" />
        </div>
      );
    }
    if (isHourly) {
      return (
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0D9488] to-[#085F57] text-white flex items-center justify-center shadow-lg shadow-teal-500/20">
          <Timer className="w-8 h-8 stroke-[2]" />
        </div>
      );
    }
    return (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0F8A5F] to-[#055B3E] text-white flex items-center justify-center shadow-lg shadow-emerald-700/20">
        <Briefcase className="w-8 h-8 stroke-[2]" />
      </div>
    );
  };

  // Status badge styling
  const statusBadge = (() => {
    if (isInProgress) {
      return {
        containerClass: 'bg-amber-50 border-amber-200 text-amber-800',
        dotClass: 'bg-amber-500 animate-pulse',
        text: 'Work in Progress (Active)',
      };
    }
    if (isCompleted) {
      return {
        containerClass: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        dotClass: 'bg-emerald-500',
        text: 'Completed & Verified',
      };
    }
    return {
      containerClass: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      dotClass: 'bg-emerald-500 animate-pulse',
      text: 'Assigned & Action Ready',
    };
  })();

  // Primary Action handler: launch active field workspace or start job
  const handlePrimaryAction = async () => {
    if (isAssigned && onUpdateStatus && job.id && !job.id.startsWith('mock-')) {
      setIsStarting(true);
      try {
        await onUpdateStatus(job.id, 'IN_PROGRESS');
        if (onJobUpdated) onJobUpdated();
        onClose();
        router.push('/worker');
      } catch (err) {
        console.error('Failed to start job:', err);
      } finally {
        setIsStarting(false);
      }
    } else if (isCompleted) {
      onClose();
      router.push('/worker/jobs');
    } else {
      // In progress or demo - jump directly to active workspace
      onClose();
      router.push('/worker');
    }
  };

  const instructions = job.notes || job.locationRemarks || job.message;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-t-[32px] sm:rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 flex flex-col gap-5 text-slate-800 relative max-h-[92vh] overflow-y-auto">
        
        {/* Mobile drag handle */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto sm:hidden -mt-1 mb-1" />

        {/* Top Header with title, back button, and close button */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                title="Back to Alert"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Work Order Details
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hero Section: Icon, Main Value / Title, Status Pill */}
        <div className="flex flex-col items-center text-center gap-2 pt-1">
          {renderHeroIcon()}

          {/* Amount or Main Title */}
          {wageDisplay ? (
            <div className="text-3xl font-black text-[#0F8A5F] tracking-tight mt-1">
              {wageDisplay}
            </div>
          ) : (
            <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
              {serviceDisplayName}
            </h2>
          )}

          {/* Subtitle / Customer & Site */}
          <p className="text-xs text-slate-500 font-medium max-w-xs">
            {job.customerName || 'Direct Booking'} • {job.location || job.city || job.district || 'Kerala, India'}
          </p>

          {/* Status Pill */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold mt-1 ${statusBadge.containerClass}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dotClass}`} />
            <span>{statusBadge.text}</span>
          </div>
        </div>

        {/* Receipt Details Card (Finora style breakdown) */}
        <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 space-y-3 divide-y divide-slate-200/60 text-xs">
          
          {/* Tracking ID with Copy Button */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Tracking ID</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
                {trackingNumber}
              </span>
              <button
                type="button"
                onClick={() => handleCopyReference(trackingNumber)}
                className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                title="Copy tracking number"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Service Name */}
          <div className="flex items-center justify-between pt-2.5">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              <span>Service</span>
            </span>
            <span className="font-bold text-slate-800 text-right">
              {serviceDisplayName}
            </span>
          </div>

          {/* Customer with quick call button */}
          <div className="flex items-center justify-between pt-2.5">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Customer</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">
                {job.customerName || 'Direct Booking'}
              </span>
              {job.customerPhone && (
                <a
                  href={`tel:${job.customerPhone}`}
                  className="p-1 rounded-md bg-emerald-50 text-[#0F8A5F] hover:bg-emerald-100 transition-colors cursor-pointer"
                  title={`Call ${job.customerPhone}`}
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Site Location with Directions */}
          <div className="flex items-start justify-between pt-2.5">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5 pt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Work Site</span>
            </span>
            <div className="flex flex-col items-end gap-1 text-right max-w-[210px]">
              <span className="font-bold text-slate-800 leading-snug">
                {job.location || `${job.city || ''}, ${job.district || 'Kerala'}`}
              </span>
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0F8A5F] hover:underline"
              >
                <Navigation className="w-3 h-3" />
                <span>Get Directions</span>
                <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
              </a>
            </div>
          </div>

          {/* Target Scheduled Date */}
          <div className="flex items-center justify-between pt-2.5">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Target Schedule</span>
            </span>
            <span className="font-bold text-slate-800">
              {formattedDate}
            </span>
          </div>

          {/* Operative Wage / Rate Breakdown */}
          <div className="flex items-center justify-between pt-2.5">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
              <span>Worker Wage</span>
            </span>
            <span className="font-bold text-slate-800 text-right">
              {wageRateText}
            </span>
          </div>

          {/* Operations Hub / Coordinator */}
          <div className="flex items-center justify-between pt-2.5">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>Operations Desk</span>
            </span>
            <span className="font-bold text-slate-800">
              {coordinatorName}
            </span>
          </div>

          {/* Special Instructions / Site Remarks */}
          {instructions && (
            <div className="pt-2.5">
              <span className="text-slate-400 font-semibold block mb-1">
                Site Remarks &amp; Instructions
              </span>
              <p className="text-slate-700 font-normal leading-relaxed text-[11px] bg-white p-2.5 rounded-xl border border-slate-200/70">
                {instructions}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-1">
          {/* Primary Action Button */}
          <button
            type="button"
            onClick={handlePrimaryAction}
            disabled={isStarting || isActing}
            className="w-full py-3.5 px-6 rounded-full bg-[#0F563F] hover:bg-[#0C4834] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isStarting || isActing ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                <span>Launching Field Workspace...</span>
              </>
            ) : isAssigned ? (
              <>
                <PlayCircle className="w-4 h-4" />
                <span>Start Work Order &amp; Launch Workspace →</span>
              </>
            ) : isInProgress ? (
              <>
                <Clock className="w-4 h-4" />
                <span>Open Active Chronometer Workspace →</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>View in Work Orders History →</span>
              </>
            )}
          </button>

          {/* Call Customer Quick Action if phone is available */}
          {job.customerPhone && (
            <a
              href={`tel:${job.customerPhone}`}
              className="w-full py-3 px-6 rounded-full bg-emerald-50 hover:bg-emerald-100 text-[#0F8A5F] font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-200/80"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Direct Call Customer ({job.customerPhone})</span>
            </a>
          )}

          {/* Footer Actions: Back & Close */}
          <div className="flex items-center gap-2 mt-1">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="py-2.5 px-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer text-center"
              >
                Back to Alert
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer text-center"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

