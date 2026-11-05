'use client';

import React from 'react';
import {
  Sparkles,
  Pencil,
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
import { useAdminTheme } from '@/context/admin-theme-context';

interface ServiceCardProps {
  service: ServiceItem;
  onEdit: (service: ServiceItem) => void;
  onDelete?: (id: string, name: string) => void;
  onToggleStatus: (id: string) => void;
  isToggling?: boolean;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Agriculture: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
  },
  'Agriculture & Cococare': {
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
  'Civil & Masonry Works': {
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    border: 'border-orange-500/20',
  },
  'Plastering & Wall Rendering': {
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/20',
  },
  'Finishing & Renovation': {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/20',
  },
  'Surface Finishing & Painting': {
    bg: 'bg-pink-500/10',
    text: 'text-pink-400',
    border: 'border-pink-500/20',
  },
  'Flooring & Surfaces': {
    bg: 'bg-teal-500/10',
    text: 'text-teal-400',
    border: 'border-teal-500/20',
  },
  'Flooring & Tile Works': {
    bg: 'bg-teal-500/10',
    text: 'text-teal-400',
    border: 'border-teal-500/20',
  },
  'Electrical & Power Systems': {
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    border: 'border-yellow-500/20',
  },
  'Plumbing & Sanitary Utilities': {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/20',
  },
  'Water Engineering & Borewells': {
    bg: 'bg-sky-500/10',
    text: 'text-sky-400',
    border: 'border-sky-500/20',
  },
  'Facility Maintenance': {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    border: 'border-indigo-500/20',
  },
};

const getCategoryIcon = (category?: string) => {
  switch (category) {
    case 'Agriculture':
    case 'Agriculture & Cococare':
      return <Sparkles className="w-5 h-5 text-emerald-400" />;
    case 'Excavation & Heavy Equipment':
      return <Tractor className="w-5 h-5 text-amber-400" />;
    case 'Civil & Construction':
    case 'Civil & Masonry Works':
    case 'Plastering & Wall Rendering':
      return <Wrench className="w-5 h-5 text-orange-400" />;
    case 'Finishing & Renovation':
    case 'Surface Finishing & Painting':
      return <Paintbrush className="w-5 h-5 text-pink-400" />;
    case 'Flooring & Surfaces':
    case 'Flooring & Tile Works':
      return <Sparkles className="w-5 h-5 text-teal-400" />;
    case 'Electrical & Power Systems':
      return <Zap className="w-5 h-5 text-yellow-400" />;
    case 'Plumbing & Sanitary Utilities':
      return <Wrench className="w-5 h-5 text-cyan-400" />;
    case 'Water Engineering & Borewells':
      return <Droplets className="w-5 h-5 text-sky-400" />;
    default:
      return <Layers className="w-5 h-5 text-zinc-400" />;
  }
};

export function ServiceCard({
  service,
  onEdit,
  onToggleStatus,
  isToggling = false,
}: ServiceCardProps) {
  const { isDark } = useAdminTheme();
  const [copied, setCopied] = React.useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(service.serviceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const catStyle =
    CATEGORY_COLORS[service.category || ''] || {
      bg: isDark ? 'bg-white/[0.06]' : 'bg-slate-100',
      text: isDark ? 'text-zinc-300' : 'text-slate-600',
      border: isDark ? 'border-white/[0.08]' : 'border-slate-200',
    };

  return (
    <div
      className={`group relative rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden p-5 sm:p-6 ${
        isDark
          ? service.isActive
            ? 'bg-[#181A20] border-white/[0.06] hover:border-white/[0.14] hover:shadow-xl'
            : 'bg-[#14151B] border-white/[0.04] opacity-75'
          : service.isActive
          ? 'bg-white border-slate-200/90 hover:border-slate-300 shadow-sm hover:shadow-md'
          : 'bg-slate-50 border-slate-200 opacity-75'
      }`}
    >
      <div>
        {/* Header with Avatar and Details */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            {/* Avatar with Gradient Ring */}
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF5C38]/30 via-emerald-500/20 to-indigo-500/20 p-[2px] shadow-xs">
                <div
                  className={`w-full h-full rounded-[14px] flex items-center justify-center overflow-hidden ${
                    isDark ? 'bg-[#121318]' : 'bg-white'
                  }`}
                >
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover rounded-[14px]"
                    />
                  ) : (
                    getCategoryIcon(service.category || undefined)
                  )}
                </div>
              </div>
              {/* Status Indicator Dot */}
              <span
                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 ${
                  isDark ? 'border-[#181A20]' : 'border-white'
                } shadow-xs ${
                  service.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
            </div>

            {/* Title & Service ID */}
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={handleCopyId}
                  title="Click to copy Service ID"
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold transition-colors border ${
                    isDark
                      ? 'bg-white/[0.04] border-white/[0.08] text-zinc-300 hover:text-[#FF5C38] hover:border-[#FF5C38]/40'
                      : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-[#FF5C38]'
                  }`}
                >
                  <span>{service.serviceId}</span>
                  {copied ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3 text-zinc-400 opacity-60 group-hover:opacity-100" />
                  )}
                </button>

                {service.category && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                  >
                    {service.category}
                  </span>
                )}
              </div>

              <h3
                className={`text-sm font-bold tracking-tight leading-snug transition-colors mt-1.5 ${
                  isDark ? 'text-white group-hover:text-[#FF5C38]' : 'text-slate-900 group-hover:text-[#FF5C38]'
                }`}
              >
                {service.name}
              </h3>
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border shrink-0 ${
              service.isActive
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25'
                : 'bg-rose-500/10 text-rose-500 border-rose-500/25'
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

        {/* Description */}
        {service.description && (
          <p className={`text-xs mt-2 line-clamp-2 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
            {service.description}
          </p>
        )}

        {/* Pricing & Worker Wage Strip */}
        <div
          className={`mt-4 p-3 rounded-2xl border flex items-center justify-between gap-3 ${
            isDark ? 'bg-[#121318] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="min-w-0">
            <span className="text-[10px] text-emerald-500 uppercase tracking-wider font-bold block">
              Worker Pay
            </span>
            <span className={`font-mono text-xs font-black truncate block mt-0.5 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
              {service.baseWorkerWage != null ? (
                <>₹{service.baseWorkerWage} <span className={`text-[10px] font-normal ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>/{service.unitLabel || 'Unit'}</span></>
              ) : (
                <span className="text-zinc-500 font-normal">Not set</span>
              )}
            </span>
          </div>

          <div className={`h-7 w-px shrink-0 ${isDark ? 'bg-white/[0.08]' : 'bg-slate-200'}`} />

          <div className="text-right min-w-0">
            <span className="text-[10px] text-[#6366F1] uppercase tracking-wider font-bold block">
              Customer Rate
            </span>
            <span className={`font-mono text-xs font-black truncate block mt-0.5 ${isDark ? 'text-[#818CF8]' : 'text-indigo-700'}`}>
              {service.baseCustomerRate != null ? (
                <>₹{service.baseCustomerRate} <span className={`text-[10px] font-normal ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>/{service.unitLabel || 'Unit'}</span></>
              ) : (
                <span className="text-zinc-500 font-normal">Not set</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Action Bar */}
      <div className={`mt-5 pt-3.5 border-t flex items-center justify-between gap-2.5 ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
        <button
          onClick={() => onToggleStatus(service.id)}
          disabled={isToggling}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
            service.isActive
              ? isDark
                ? 'bg-white/[0.04] hover:bg-rose-500/10 text-zinc-300 hover:text-rose-400 border-white/[0.06] hover:border-rose-500/30'
                : 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border-slate-200 hover:border-rose-200'
              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          <span>{service.isActive ? 'Deactivate' : 'Activate'}</span>
        </button>

        <button
          onClick={() => onEdit(service)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full border transition-colors text-xs font-semibold cursor-pointer ${
            isDark
              ? 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 hover:text-white border-white/[0.06]'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
          }`}
          title="Edit Service"
        >
          <Pencil className="w-3.5 h-3.5 text-zinc-400" />
          <span>Edit</span>
        </button>
      </div>
    </div>
  );
}
