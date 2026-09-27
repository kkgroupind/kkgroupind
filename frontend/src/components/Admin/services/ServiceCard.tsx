'use client';

import React from 'react';
import {
  Sparkles,
  Clock,
  IndianRupee,
  CheckCircle2,
  Pencil,
  Trash2,
  Copy,
  Check,
  Power,
  Layers,
  Wrench,
  Paintbrush,
  Droplets,
  Tractor,
  Zap,
} from 'lucide-react';
import { ServiceItem } from '@/services/Admin/services';

interface ServiceCardProps {
  service: ServiceItem;
  onEdit: (service: ServiceItem) => void;
  onDelete: (id: string, name: string) => void;
  onToggleStatus: (id: string) => void;
  isToggling?: boolean;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Agriculture: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
  },
  'Excavation & Heavy Equipment': {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
  },
  'Civil & Construction': {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/20',
  },
  'Finishing & Renovation': {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/20',
  },
  'Flooring & Surfaces': {
    bg: 'bg-teal-500/10',
    text: 'text-teal-400',
    border: 'border-teal-500/20',
  },
  'MEP & Utilities': {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    border: 'border-indigo-500/20',
  },
  'Water & Irrigation': {
    bg: 'bg-sky-500/10',
    text: 'text-sky-400',
    border: 'border-sky-500/20',
  },
};

export function ServiceCard({
  service,
  onEdit,
  onDelete,
  onToggleStatus,
  isToggling = false,
}: ServiceCardProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(service.serviceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const catStyle =
    CATEGORY_COLORS[service.category || ''] || {
      bg: 'bg-gray-800/60',
      text: 'text-gray-300',
      border: 'border-gray-700/50',
    };

  return (
    <div
      className={`group relative rounded-2xl bg-[#14151A] border transition-all duration-300 flex flex-col justify-between overflow-hidden p-5 shadow-lg ${
        service.isActive
          ? 'border-gray-800/80 hover:border-gray-700 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)]'
          : 'border-gray-800/40 opacity-75 bg-[#121317]'
      }`}
    >
      {/* Top ambient color edge */}
      <div
        className={`absolute top-0 left-0 right-0 h-[2px] transition-all duration-300 ${
          service.isActive
            ? 'bg-gradient-to-r from-transparent via-[#2A835F]/60 to-transparent group-hover:via-[#10B981]'
            : 'bg-gray-800'
        }`}
      />

      <div>
        {/* Header: Service ID, Category & Status Pill */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            {/* Unique Sequential Alphanumeric ID Badge */}
            <button
              onClick={handleCopyId}
              title="Click to copy Service ID"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1A1C23] border border-gray-700/80 font-mono text-xs font-bold text-white hover:text-emerald-400 hover:border-emerald-500/40 transition-colors shadow-sm"
            >
              <span>{service.serviceId}</span>
              {copied ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3 text-gray-500 opacity-60 group-hover:opacity-100" />
              )}
            </button>

            {service.category && (
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
              >
                {service.category}
              </span>
            )}

            {/* Wage & Billing Unit Badge */}
            {service.wageType && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
                {service.wageType === 'PER_TREE'
                  ? '🌴 Tree Count'
                  : service.wageType === 'HOURLY'
                  ? '⏱️ Hourly Meter'
                  : service.wageType === 'PER_SQFT'
                  ? '📐 Sq. Ft. Area'
                  : service.wageType === 'PER_POINT'
                  ? '⚡ Point Basis'
                  : service.wageType === 'PER_FOOT'
                  ? '📏 Foot Depth'
                  : service.wageType === 'DAILY_WAGE'
                  ? '📅 Daily Wage'
                  : '🔧 Visit Fee'}
              </span>
            )}
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
              service.isActive
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                service.isActive ? 'bg-emerald-400' : 'bg-rose-400'
              }`}
            />
            {service.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-gray-100 tracking-tight leading-snug group-hover:text-emerald-400 transition-colors">
          {service.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-400 mt-2 line-clamp-3 leading-relaxed">
          {service.description}
        </p>

        {/* Key Features Chips */}
        {service.features && service.features.length > 0 && (
          <div className="mt-3.5 pt-3 border-t border-gray-800/60">
            <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2">
              Key Features & Capabilities
            </div>
            <div className="flex flex-wrap gap-1.5">
              {service.features.map((feat, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[11px] text-gray-300 bg-[#1A1C23] border border-gray-800 px-2 py-0.5 rounded-md"
                >
                  <CheckCircle2 className="w-3 h-3 text-[#2A835F] shrink-0" />
                  <span className="truncate max-w-[220px]">{feat}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info & Action Bar */}
      <div className="mt-4 pt-3 border-t border-gray-800/60 space-y-2">
        {/* Unit-Based Wage & Billing Specifications Box */}
        {(service.baseCustomerRate || service.baseWorkerWage || service.unitLabel) && (
          <div className="bg-[#181A22] border border-gray-800/80 rounded-xl p-2.5 flex items-center justify-between text-[11px]">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                Customer Rate
              </span>
              <span className="font-bold text-white flex items-center gap-0.5">
                <span>₹{service.baseCustomerRate ?? '—'}</span>
                <span className="text-gray-400 font-normal">/ {service.unitLabel || 'Unit'}</span>
              </span>
            </div>

            <div className="h-6 w-[1px] bg-gray-800" />

            <div className="flex flex-col">
              <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">
                Worker Wage Pay
              </span>
              <span className="font-bold text-emerald-300 flex items-center gap-0.5">
                <span>₹{service.baseWorkerWage ?? '—'}</span>
                <span className="text-gray-400 font-normal">/ {service.unitLabel || 'Unit'}</span>
              </span>
            </div>

            {service.minUnits && service.minUnits > 1 && (
              <>
                <div className="h-6 w-[1px] bg-gray-800" />
                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-amber-400 uppercase tracking-wider font-semibold">
                    Min Units
                  </span>
                  <span className="font-bold text-amber-200">
                    {service.minUnits} {service.unitLabel}s
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400 mb-1">
          {service.priceRange && (
            <div className="flex items-center gap-1.5 text-gray-300 font-medium text-[11px]">
              <IndianRupee className="w-3.5 h-3.5 text-[#2A835F]" />
              <span>{service.priceRange}</span>
            </div>
          )}

          {service.duration && (
            <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
              <Clock className="w-3 h-3 text-gray-500" />
              <span>{service.duration}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          {/* Toggle status button */}
          <button
            onClick={() => onToggleStatus(service.id)}
            disabled={isToggling}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              service.isActive
                ? 'bg-gray-800/40 hover:bg-rose-500/10 text-gray-300 hover:text-rose-400 border-gray-700/60 hover:border-rose-500/30'
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            }`}
          >
            <Power className="w-3 h-3" />
            <span>{service.isActive ? 'Deactivate' : 'Activate'}</span>
          </button>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onEdit(service)}
              className="p-1.5 rounded-xl bg-[#1A1C23] hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-800 transition-colors"
              title="Edit Service"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(service.id, service.name)}
              className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 transition-colors"
              title="Delete Service"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
