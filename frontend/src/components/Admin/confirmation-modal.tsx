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
  // Close on Escape key
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
      iconColor: 'text-red-400',
      iconBg: 'bg-red-500/10 border-red-500/20 text-red-400',
      buttonBg: 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]',
      glow: 'shadow-[0_0_50px_rgba(239,68,68,0.15)]',
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      buttonBg: 'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)]',
      glow: 'shadow-[0_0_50px_rgba(245,158,11,0.15)]',
    },
    info: {
      icon: Info,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      buttonBg: 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]',
      glow: 'shadow-[0_0_50px_rgba(59,130,246,0.15)]',
    },
    success: {
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]',
      glow: 'shadow-[0_0_50px_rgba(16,185,129,0.15)]',
    },
  }[variant];

  const IconComponent = variantStyles.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={() => {
          if (!isLoading) onClose();
        }}
      />

      <div
        className={`relative w-full max-w-md bg-[#14151A] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 z-10 ${variantStyles.glow}`}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-[#14151A]">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border ${variantStyles.iconBg} shrink-0`}
            >
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-100">{title}</h2>
              <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                Action Confirmation
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isLoading}
            type="button"
            className="p-1.5 text-gray-400 hover:text-gray-200 transition-colors bg-[#1A1C23] hover:bg-[#232630] rounded-xl border border-gray-800 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-300 leading-relaxed">{message}</p>

          {/* Optional item details list */}
          {itemDetails && itemDetails.length > 0 && (
            <div className="bg-[#1A1C23] border border-gray-800/80 rounded-xl p-3.5 space-y-2">
              {itemDetails.map((detail, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1 border-b border-gray-800/50 last:border-0"
                >
                  <span className="text-gray-400 font-medium">{detail.label}</span>
                  <span className="text-gray-200 font-semibold font-mono truncate max-w-[200px]">
                    {detail.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl text-[12px] text-amber-300/90 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>This administrative operation will be logged to audit trails.</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-800 bg-[#1A1C23]/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-[#1A1C23] hover:bg-[#232630] border border-gray-800 rounded-xl text-xs font-semibold text-gray-300 hover:text-white transition-all disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={async () => {
              await onConfirm();
            }}
            disabled={isLoading}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 ${variantStyles.buttonBg}`}
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
