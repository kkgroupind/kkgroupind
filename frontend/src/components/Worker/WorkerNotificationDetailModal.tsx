'use client';

import React, { useState } from 'react';
import {
  X,
  Briefcase,
  IndianRupee,
  Clock,
  AlertCircle,
  Bell,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Building,
  User,
  MapPin,
  Trash2,
  Share2,
} from 'lucide-react';

export interface NotificationDetailData {
  id: string;
  title: string;
  subtitle: string;
  fullMessage?: string;
  type: string;
  isRead: boolean;
  timestamp: string;
  displayTime?: string;
  dateKey?: string;
  amount?: string;
  referenceId?: string;
  sender?: string;
  link?: string | null;
  jobData?: any;
  metadata?: any;
}

interface WorkerNotificationDetailModalProps {
  notification: NotificationDetailData | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenJob?: (job: any) => void;
  onDelete?: (id: string) => void;
}

export function WorkerNotificationDetailModal({
  notification,
  isOpen,
  onClose,
  onOpenJob,
  onDelete,
}: WorkerNotificationDetailModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !notification) return null;

  const handleCopyReference = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format full date time
  const formattedDateTime = (() => {
    try {
      const d = new Date(notification.timestamp);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return notification.timestamp;
    }
  })();

  const isFinance = notification.type === 'FINANCE';
  const isJob = notification.type === 'JOB_DISPATCH' || notification.type === 'ASSIGNMENT' || notification.type === 'ENQUIRY';
  const isDuty = notification.type === 'DUTY' || notification.type === 'SHIFT_UPDATE';
  const isWarning = notification.type === 'URGENT' || notification.type === 'WARNING';

  // Render hero icon
  const renderHeroIcon = () => {
    if (isFinance) {
      return (
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#0F8A5F] text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <IndianRupee className="w-8 h-8 stroke-[2.2]" />
        </div>
      );
    }
    if (isJob) {
      return (
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0F8A5F] to-[#055B3E] text-white flex items-center justify-center shadow-lg shadow-emerald-700/20">
          <Briefcase className="w-8 h-8 stroke-[2]" />
        </div>
      );
    }
    if (isDuty) {
      return (
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0D9488] to-[#085F57] text-white flex items-center justify-center shadow-lg shadow-teal-500/20">
          <Clock className="w-8 h-8 stroke-[2]" />
        </div>
      );
    }
    if (isWarning) {
      return (
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#EF4444] to-[#B91C1C] text-white flex items-center justify-center shadow-lg shadow-red-500/20">
          <AlertCircle className="w-8 h-8 stroke-[2]" />
        </div>
      );
    }
    return (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] text-white flex items-center justify-center shadow-lg shadow-slate-900/20">
        <Bell className="w-8 h-8 stroke-[2]" />
      </div>
    );
  };

  const referenceCode =
    notification.referenceId ||
    notification.jobData?.trackingNumber ||
    `KKN-${notification.id.slice(-6).toUpperCase()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-t-[32px] sm:rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 flex flex-col gap-5 text-slate-800 relative max-h-[92vh] overflow-y-auto">
        
        {/* Mobile drag handle */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto sm:hidden -mt-1 mb-1" />

        {/* Top Header with title and close button */}
        <div className="flex items-center justify-between pb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Alert Details
          </span>
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
          {notification.amount ? (
            <div className="text-3xl font-black text-[#0F8A5F] tracking-tight mt-1">
              {notification.amount}
            </div>
          ) : isFinance ? (
            <div className="text-3xl font-black text-[#0F8A5F] tracking-tight mt-1">
              + ₹1,200.00
            </div>
          ) : (
            <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
              {notification.title}
            </h2>
          )}

          {/* Subtitle / Service */}
          <p className="text-xs text-slate-500 font-medium max-w-xs">
            {notification.subtitle}
          </p>

          {/* Status Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {isFinance
                ? 'Credited to Operative Account'
                : isJob
                ? 'Dispatched & Action Ready'
                : isDuty
                ? 'Attendance Status Recorded'
                : 'Delivered & Logged'}
            </span>
          </div>
        </div>

        {/* Receipt Details Card (Finora style breakdown) */}
        <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 space-y-3 divide-y divide-slate-200/60 text-xs">
          
          {/* Timestamp */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Date &amp; Time</span>
            </span>
            <span className="font-bold text-slate-800 text-right">
              {formattedDateTime}
            </span>
          </div>

          {/* Category */}
          <div className="flex items-center justify-between pt-2.5">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>Category</span>
            </span>
            <span className="font-bold text-slate-800">
              {isFinance
                ? 'Finance & Field Wage'
                : isJob
                ? 'Work Order Dispatch'
                : isDuty
                ? 'Shift Attendance'
                : 'Operations Notice'}
            </span>
          </div>

          {/* Coordinator / Sender */}
          <div className="flex items-center justify-between pt-2.5">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Coordinator</span>
            </span>
            <span className="font-bold text-slate-800">
              {notification.sender || 'KK Group Thrissur Ops'}
            </span>
          </div>

          {/* Reference Number with Copy Button */}
          <div className="flex items-center justify-between pt-2.5">
            <span className="text-slate-400 font-semibold">Reference ID</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
                {referenceCode}
              </span>
              <button
                type="button"
                onClick={() => handleCopyReference(referenceCode)}
                className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                title="Copy reference code"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Full Message / Instructions */}
          {notification.fullMessage && notification.fullMessage !== notification.subtitle && (
            <div className="pt-2.5">
              <span className="text-slate-400 font-semibold block mb-1">
                Detailed Message
              </span>
              <p className="text-slate-700 font-normal leading-relaxed text-[11px] bg-white p-2.5 rounded-xl border border-slate-200/70">
                {notification.fullMessage}
              </p>
            </div>
          )}

          {/* Attached Job Preview (if any) */}
          {notification.jobData && (
            <div className="pt-2.5">
              <span className="text-slate-400 font-semibold block mb-1">
                Site Location &amp; Customer
              </span>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 space-y-1">
                <div className="font-bold text-slate-800">
                  {notification.jobData.customerName}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#0F8A5F] shrink-0" />
                  <span>
                    {notification.jobData.location || notification.jobData.district || 'Kerala, India'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-1">
          {/* Primary Action: Open Job Modal if connected */}
          {notification.jobData && onOpenJob && (
            <button
              type="button"
              onClick={() => {
                onOpenJob(notification.jobData);
              }}
              className="w-full py-3.5 px-6 rounded-full bg-[#0F563F] hover:bg-[#0C4834] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.99]"
            >
              <Briefcase className="w-4 h-4" />
              <span>Open Work Order Details →</span>
            </button>
          )}

          {/* External Link */}
          {notification.link && (
            <a
              href={notification.link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>View Related Link</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          {/* Footer Actions: Delete & Close */}
          <div className="flex items-center gap-2 mt-1">
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(notification.id);
                  onClose();
                }}
                className="py-2.5 px-4 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                title="Delete alert"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Dismiss</span>
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
