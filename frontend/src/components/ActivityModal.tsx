'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Clock,
  Layers,
  Copy,
  Check,
  X,
  User,
  Monitor,
  HardHat,
  Briefcase,
  UserCircle,
  Shield,
} from 'lucide-react';
import { AuditLogItem } from '@/services/audit.service';

interface ActivityModalProps {
  log: AuditLogItem | null;
  onClose: () => void;
  isDark?: boolean;
}

export function ActivityModal({ log, onClose, isDark = true }: ActivityModalProps) {
  const [copied, setCopied] = useState(false);

  if (!log) return null;

  const handleCopy = () => {
    let textToCopy = log.details || '';
    try {
      textToCopy = JSON.stringify(JSON.parse(log.details || '{}'), null, 2);
    } catch {
      // Keep raw
    }
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRoleBadge = (role?: string | null) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <Shield className="w-3 h-3" />
            Super Admin
          </span>
        );
      case 'OFFICE_STAFF':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Briefcase className="w-3 h-3" />
            Office Staff
          </span>
        );
      case 'WORKER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <HardHat className="w-3 h-3" />
            Worker
          </span>
        );
      case 'CUSTOMER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#2A835F]/10 text-[#2A835F] border border-[#2A835F]/20">
            <UserCircle className="w-3 h-3" />
            Customer
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400">
            System
          </span>
        );
    }
  };

  let parsedDetails: any = null;
  let isJson = false;
  try {
    if (log.details) {
      parsedDetails = JSON.parse(log.details);
      isJson = typeof parsedDetails === 'object' && parsedDetails !== null;
    }
  } catch {
    isJson = false;
  }

  const dateObj = new Date(log.createdAt);
  const formattedDate = dateObj.toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = dateObj.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div
        className={`relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 z-10 ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-200'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-5 sm:p-6 border-b shrink-0 ${
            isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-100 bg-slate-50/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2A835F]/15 border border-[#2A835F]/30 text-[#2A835F] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2A835F] block">
                Activity Audit Inspection
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate max-w-xs font-mono">
                Log #{log.id.slice(0, 13)}...
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl border transition-colors ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-900'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto text-xs sm:text-sm">
          {/* Action & Time Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Operation Action
              </div>
              <div className="font-mono font-bold text-sm text-[#2A835F] mt-0.5">
                {log.action}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Timestamp
              </div>
              <div className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                {formattedDate}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">{formattedTime}</div>
            </div>
          </div>

          {/* Actor & Role Details */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className={`p-3.5 rounded-2xl border ${
                isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50/70 border-slate-200'
              }`}
            >
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Actor Name / Identity
              </div>
              <div className="font-semibold text-slate-900 dark:text-white mt-1 truncate">
                {log.userName || log.userEmail || 'System'}
              </div>
              {log.userEmail && (
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {log.userEmail}
                </div>
              )}
            </div>

            <div
              className={`p-3.5 rounded-2xl border ${
                isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50/70 border-slate-200'
              }`}
            >
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Role Authorization
              </div>
              <div className="mt-1">{getRoleBadge(log.userRole)}</div>
            </div>
          </div>

          {/* Target Entity */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className={`p-3.5 rounded-2xl border ${
                isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50/70 border-slate-200'
              }`}
            >
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3 h-3 text-[#2A835F]" />
                <span>Entity Classification</span>
              </div>
              <div className="font-bold text-slate-800 dark:text-slate-200 mt-1">
                {log.entityType}
              </div>
            </div>

            <div
              className={`p-3.5 rounded-2xl border ${
                isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50/70 border-slate-200'
              }`}
            >
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Entity Record ID
              </div>
              <div className="font-mono text-xs text-slate-700 dark:text-slate-300 mt-1 truncate">
                {log.entityId || 'Global / N/A'}
              </div>
            </div>
          </div>

          {/* Client IP & User Agent (if captured) */}
          {(log.ipAddress || log.userAgent) && (
            <div
              className={`p-3.5 rounded-2xl border ${
                isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50/70 border-slate-200'
              }`}
            >
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Monitor className="w-3 h-3 text-slate-400" />
                <span>Client Origin &amp; Network</span>
              </div>
              <div className="mt-1 font-mono text-xs text-slate-600 dark:text-slate-400 truncate">
                {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                {log.userAgent && <span className="block text-[10px] mt-0.5">{log.userAgent}</span>}
              </div>
            </div>
          )}

          {/* Full Payload Details */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Detailed Activity Payload
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>

            {isJson ? (
              <pre
                className={`p-4 rounded-2xl font-mono text-xs overflow-x-auto border max-h-48 custom-scrollbar ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-emerald-400'
                    : 'bg-slate-50 border-slate-200 text-emerald-700'
                }`}
              >
                {JSON.stringify(parsedDetails, null, 2)}
              </pre>
            ) : (
              <div
                className={`p-3.5 rounded-2xl border font-mono text-xs ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-slate-300'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                {log.details || 'No additional payload stored.'}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-4 border-t flex justify-end shrink-0 ${
            isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-100 bg-slate-50/80'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#2A835F] hover:bg-[#236D4F] text-white transition-all shadow-sm"
          >
            Close Inspection
          </button>
        </div>
      </div>
    </div>
  );
}
