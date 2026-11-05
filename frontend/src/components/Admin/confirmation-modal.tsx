'use client';

import React, { useEffect } from 'react';
import {
  AlertTriangle,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Info,
  X,
  Loader2,
} from 'lucide-react';
import { useAdminTheme } from '@/context/admin-theme-context';

export type ConfirmationVariant = 'danger' | 'warning' | 'info' | 'success';

export interface ConfirmationDetail {
  label: string;
  value: string | number | null | undefined;
}

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmationVariant;
  isLoading?: boolean;
  itemDetails?: ConfirmationDetail[];
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
  itemDetails,
}: ConfirmationModalProps) {
  const { isDark } = useAdminTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: Trash2,
      iconColor: 'text-rose-500',
      iconBg: isDark
        ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        : 'bg-rose-50 border-rose-200 text-rose-600',
      buttonBg: 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/25',
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
      iconBg: isDark
        ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
        : 'bg-amber-50 border-amber-200 text-amber-600',
      buttonBg: 'bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-500/25',
    },
    info: {
      icon: Info,
      iconColor: 'text-blue-500',
      iconBg: isDark
        ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
        : 'bg-blue-50 border-blue-200 text-blue-600',
      buttonBg: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25',
    },
    success: {
      icon: CheckCircle2,
      iconColor: 'text-emerald-500',
      iconBg: isDark
        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
        : 'bg-emerald-50 border-emerald-200 text-emerald-600',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/25',
    },
  }[variant];

  const IconComponent = variantStyles.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={() => {
          if (!isLoading) onClose();
        }}
      />

      <div
        className={`relative w-full max-w-md rounded-[28px] border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 z-10 ${
          isDark
            ? 'bg-[#12141A] border-white/[0.08] text-gray-100 shadow-[0_25px_50px_rgba(0,0,0,0.8)]'
            : 'bg-white border-slate-200 text-slate-900 shadow-[0_25px_50px_rgba(0,0,0,0.15)]'
        }`}
      >
        {/* Header bar */}
        <div
          className={`flex items-center justify-between p-5 border-b ${
            isDark ? 'border-white/[0.06] bg-[#161922]' : 'border-slate-100 bg-slate-50/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl border ${variantStyles.iconBg} shrink-0`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h2
                className={`text-base font-bold leading-tight ${
                  isDark ? 'text-gray-100' : 'text-slate-900'
                }`}
              >
                {title}
              </h2>
              <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                Please Confirm
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isLoading}
            type="button"
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isDark
                ? 'text-gray-400 hover:text-gray-100 bg-[#161922] hover:bg-[#1A1E29] border-white/[0.08]'
                : 'text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 border-slate-200'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          <p
            className={`text-sm leading-relaxed ${
              isDark ? 'text-gray-300' : 'text-slate-600'
            }`}
          >
            {message}
          </p>

          {/* Optional item details list */}
          {itemDetails && itemDetails.length > 0 && (
            <div
              className={`rounded-2xl border p-3.5 space-y-2 ${
                isDark ? 'bg-[#161922] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
              }`}
            >
              {itemDetails.map((detail, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between text-xs py-1 border-b last:border-0 ${
                    isDark ? 'border-white/[0.04]' : 'border-slate-200/60'
                  }`}
                >
                  <span className={isDark ? 'text-gray-400 font-medium' : 'text-slate-500 font-medium'}>{detail.label}</span>
                  <span
                    className={`font-semibold font-mono truncate max-w-[200px] ${
                      isDark ? 'text-gray-100' : 'text-slate-900'
                    }`}
                  >
                    {detail.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div
            className={`p-3 rounded-2xl border text-[11px] flex items-center gap-2 ${
              isDark
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
            <span>This change takes effect immediately across all records.</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          className={`flex items-center justify-end gap-3 p-4 px-6 border-t ${
            isDark ? 'border-white/[0.06] bg-[#161922]' : 'border-slate-100 bg-slate-50/80'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
              isDark
                ? 'bg-[#161922] hover:bg-[#1A1E29] border-white/[0.08] text-gray-300'
                : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={async () => {
              await onConfirm();
            }}
            disabled={isLoading}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer disabled:opacity-50 ${variantStyles.buttonBg}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
