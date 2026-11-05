'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ChevronDown,
  Search,
  Check,
  CalendarClock,
  Layers,
} from 'lucide-react';
import { ReminderFrequency } from '@/services/reminder.service';
import { useAdminTheme } from '@/context/admin-theme-context';

export interface ServiceSelectOption {
  id: string;
  name: string;
  category?: string | null;
  image?: string | null;
  hasReminder?: boolean;
  reminderFrequency?: ReminderFrequency;
  reminderIntervalDays?: number | null;
  activeReminderCount?: number;
}

interface ServiceSelectDropdownProps {
  services: ServiceSelectOption[];
  selectedServiceId: string;
  onSelect: (serviceId: string) => void;
  label?: string;
  placeholder?: string;
  includeAllOption?: boolean;
  allOptionLabel?: string;
  showFrequencyBadge?: boolean;
  showClientCount?: boolean;
  className?: string;
}

export function getServiceImage(serviceName: string, serviceImage?: string | null): string {
  if (serviceImage && (serviceImage.startsWith('/') || serviceImage.startsWith('http'))) {
    return serviceImage;
  }
  const lower = serviceName.toLowerCase();
  if (lower.includes('coco') || lower.includes('palm') || lower.includes('tree') || lower.includes('തേങ്ങ')) {
    return '/Banners/coco.png';
  }
  if (lower.includes('well') || lower.includes('borewell') || lower.includes('കിണർ')) {
    return '/Banners/borewell.png';
  }
  if (lower.includes('jcb') || lower.includes('excavat') || lower.includes('trench')) {
    return '/Banners/jcb.png';
  }
  if (lower.includes('paint') || lower.includes('wall finish')) {
    return '/Banners/painting.png';
  }
  if (lower.includes('plaster') || lower.includes('cement')) {
    return '/Banners/plastering.png';
  }
  if (lower.includes('electr') || lower.includes('mep') || lower.includes('wiring') || lower.includes('solar')) {
    return '/Banners/electrical.png';
  }
  if (lower.includes('plumb') || lower.includes('pipe') || lower.includes('sanitary')) {
    return '/Banners/plumbing.png';
  }
  if (lower.includes('tile') || lower.includes('granite') || lower.includes('marble')) {
    return '/Banners/tiling.png';
  }
  if (lower.includes('mason') || lower.includes('brick')) {
    return '/Banners/masonry.png';
  }
  return '/Banners/coco.png';
}

export function getMalayalamLabel(serviceName: string): string | null {
  const lower = serviceName.toLowerCase();
  if (lower.includes('coco') || lower.includes('palm') || lower.includes('tree') || lower.includes('തേങ്ങ')) {
    return 'തേങ്ങയിടൽ';
  }
  if (lower.includes('well') || lower.includes('borewell') || lower.includes('കിണർ')) {
    return 'കിണർ ശുചീകരണം';
  }
  if (lower.includes('lawn') || lower.includes('grass') || lower.includes('garden') || lower.includes('പുല്ല്')) {
    return 'പുല്ലുവെട്ട് & തോട്ടം';
  }
  if (lower.includes('solar') || lower.includes('panel')) {
    return 'സോളാർ മെയിന്റനൻസ്';
  }
  if (lower.includes('electr') || lower.includes('wiring') || lower.includes('വൈദ്യുതി')) {
    return 'ഇലക്ട്രിക്കൽ വർക്ക്';
  }
  if (lower.includes('plumb') || lower.includes('pipe') || lower.includes('പ്ലംബിംഗ്')) {
    return 'പ്ലംബിംഗ് സർവീസ്';
  }
  if (lower.includes('paint') || lower.includes('പെയിന്റ്')) {
    return 'പെയിന്റിംഗ്';
  }
  if (lower.includes('jcb') || lower.includes('excavat') || lower.includes('മണ്ണുമാന്തി')) {
    return 'ജെസിബി & മണ്ണുമാന്തി';
  }
  return null;
}

export function formatFrequencyShort(freq?: ReminderFrequency, days?: number | null): string {
  switch (freq) {
    case 'EVERY_3_MONTHS':
      return 'Every 3 Mos';
    case 'EVERY_6_MONTHS':
      return 'Every 6 Mos';
    case 'EVERY_2_MONTHS':
      return 'Every 2 Mos';
    case 'MONTHLY':
      return 'Monthly';
    case 'YEARLY':
      return 'Annual';
    case 'CUSTOM_DAYS':
      return `${days || 90} Days`;
    case 'ONCE':
      return 'One-Time';
    default:
      return '3 Months';
  }
}

const QUICK_FILTER_TAGS = [
  { label: 'All', value: '' },
  { label: '🌴 Coconut', value: 'coco' },
  { label: '💧 Well / Bore', value: 'well' },
  { label: '🚜 JCB & Plant', value: 'jcb' },
  { label: '⚡ Electrical', value: 'electr' },
  { label: '🔧 Plumbing', value: 'plumb' },
  { label: '🧱 Plaster/Civil', value: 'plaster' },
];

export function ServiceSelectDropdown({
  services,
  selectedServiceId,
  onSelect,
  label,
  placeholder = 'Select Service...',
  includeAllOption = false,
  allOptionLabel = 'All Services Catalog',
  showFrequencyBadge = true,
  showClientCount = false,
  className = '',
}: ServiceSelectDropdownProps) {
  const { isDark } = useAdminTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedService = useMemo(() => {
    return services.find(
      (s) => s.id === selectedServiceId || s.name === selectedServiceId,
    );
  }, [services, selectedServiceId]);

  const isAllSelected = selectedServiceId === 'ALL';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchTerm('');
      setSelectedTag('');
    }
  }, [isOpen]);

  const filteredServices = useMemo(() => {
    return services.filter((svc) => {
      const matchSearch =
        !searchTerm.trim() ||
        svc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (svc.category && svc.category.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchTag =
        !selectedTag ||
        svc.name.toLowerCase().includes(selectedTag.toLowerCase()) ||
        (svc.category && svc.category.toLowerCase().includes(selectedTag.toLowerCase()));

      return matchSearch && matchTag;
    });
  }, [services, searchTerm, selectedTag]);

  const selectedMalayalam = selectedService ? getMalayalamLabel(selectedService.name) : null;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-2.5 sm:p-3 rounded-2xl border flex items-center justify-between text-left transition-all duration-200 group cursor-pointer ${
          isDark
            ? isOpen
              ? 'bg-[#181A20] border-[#FF5C38] shadow-[0_0_20px_rgba(255,92,56,0.15)]'
              : 'bg-[#181A20] border-white/[0.08] hover:border-white/[0.14]'
            : isOpen
            ? 'bg-white border-[#FF5C38] ring-2 ring-[#FF5C38]/15 shadow-sm'
            : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {isAllSelected ? (
            <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm ${
              isDark ? 'bg-[#FF5C38]/10 border-[#FF5C38]/20 text-[#FF5C38]' : 'bg-[#FF5C38]/10 border-[#FF5C38]/20 text-[#FF5C38]'
            }`}>
              <Layers className="w-5 h-5" />
            </div>
          ) : selectedService ? (
            <div className={`relative w-11 h-11 rounded-2xl overflow-hidden shrink-0 border shadow-xs ${
              isDark ? 'border-white/[0.08] bg-zinc-900' : 'border-slate-200 bg-slate-100'
            }`}>
              <img
                src={getServiceImage(selectedService.name, selectedService.image)}
                alt={selectedService.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          ) : (
            <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${
              isDark ? 'bg-[#121318] border-white/[0.06] text-zinc-500' : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <CalendarClock className="w-5 h-5" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={`font-bold text-xs sm:text-sm truncate block group-hover:text-[#FF5C38] transition-colors ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                {isAllSelected
                  ? allOptionLabel
                  : selectedService?.name || placeholder}
              </span>

              {selectedMalayalam && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0 hidden md:inline-block">
                  {selectedMalayalam}
                </span>
              )}

              {selectedService && showFrequencyBadge && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#FF5C38]/10 text-[#FF5C38] border border-[#FF5C38]/20 shrink-0 hidden sm:inline-block">
                  {formatFrequencyShort(
                    selectedService.reminderFrequency,
                    selectedService.reminderIntervalDays,
                  )}
                </span>
              )}
            </div>

            <div className={`text-[11px] flex items-center gap-2 truncate mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              <span>
                {isAllSelected
                  ? `Showing all (${services.length} services)`
                  : selectedService?.category || 'KK Group Kerala Service'}
              </span>

              {selectedService?.hasReminder && (
                <>
                  <span className={isDark ? 'text-zinc-600' : 'text-slate-300'}>•</span>
                  <span className="text-emerald-500 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Auto-Schedule ON</span>
                  </span>
                </>
              )}

              {showClientCount && selectedService?.activeReminderCount !== undefined && (
                <>
                  <span className={isDark ? 'text-zinc-600' : 'text-slate-300'}>•</span>
                  <span className="text-[#FF5C38] font-mono font-bold">
                    {selectedService.activeReminderCount} active
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className={`p-1.5 rounded-xl border transition-colors ${
          isDark ? 'bg-white/[0.04] border-white/[0.08] text-zinc-400 group-hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-500 group-hover:text-slate-900'
        }`}>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-300 ${
              isOpen ? 'rotate-180 text-[#FF5C38]' : ''
            }`}
          />
        </div>
      </button>

      {/* Flyout Menu */}
      {isOpen && (
        <div
          className={`absolute z-50 left-0 right-0 mt-2 rounded-3xl border shadow-2xl backdrop-blur-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
            isDark ? 'bg-[#181A20] border-white/[0.1] text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Search Bar inside Dropdown */}
          <div className={`p-3 border-b space-y-2 ${isDark ? 'bg-[#14151B] border-white/[0.06]' : 'bg-slate-50 border-slate-100'}`}>
            <div className="relative">
              <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search services (Coconut, Well, JCB, Solar, Electrical...)"
                className={`w-full rounded-xl pl-8.5 pr-8 py-2 text-xs border focus:outline-none focus:border-[#FF5C38] ${
                  isDark ? 'bg-[#181A20] border-white/[0.08] text-white placeholder-zinc-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 text-xs px-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Filter Tag Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 custom-scrollbar text-[10px]">
              {QUICK_FILTER_TAGS.map((tag) => {
                const isActive = selectedTag === tag.value;
                return (
                  <button
                    key={tag.label}
                    type="button"
                    onClick={() => setSelectedTag(tag.value)}
                    className={`px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#FF5C38] text-white shadow-xs'
                        : isDark
                        ? 'bg-white/[0.04] text-zinc-400 hover:text-white border border-white/[0.06]'
                        : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                    }`}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* List of Options */}
          <div className="max-h-72 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {includeAllOption && !searchTerm && !selectedTag && (
              <button
                type="button"
                onClick={() => {
                  onSelect('ALL');
                  setIsOpen(false);
                }}
                className={`w-full p-2.5 rounded-2xl transition-all flex items-center justify-between text-left group cursor-pointer ${
                  isAllSelected
                    ? 'bg-[#FF5C38]/15 border border-[#FF5C38]/30 text-[#FF5C38]'
                    : isDark
                    ? 'hover:bg-white/[0.04] text-zinc-300'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 ${
                    isDark ? 'bg-white/[0.04] border-white/[0.08] text-[#FF5C38]' : 'bg-slate-100 border-slate-200 text-[#FF5C38]'
                  }`}>
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {allOptionLabel}
                    </div>
                    <div className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Show reminders across all {services.length} services
                    </div>
                  </div>
                </div>

                {isAllSelected && (
                  <div className="w-5 h-5 rounded-full bg-[#FF5C38] flex items-center justify-center text-white shrink-0 shadow-sm">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            )}

            {filteredServices.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-400 flex flex-col items-center gap-1.5">
                <Search className="w-5 h-5 text-zinc-500 mb-1" />
                <span>No services found matching your search.</span>
                <span className="text-[10px] text-zinc-500">Try clearing the search or tag filters</span>
              </div>
            ) : (
              filteredServices.map((svc) => {
                const isSelected = selectedServiceId === svc.id || selectedServiceId === svc.name;
                const imageSrc = getServiceImage(svc.name, svc.image);
                const malayalamBadge = getMalayalamLabel(svc.name);

                return (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => {
                      onSelect(svc.id);
                      setIsOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-2xl transition-all duration-150 flex items-center justify-between text-left group cursor-pointer ${
                      isSelected
                        ? 'bg-[#FF5C38]/15 border border-[#FF5C38]/30 text-white'
                        : isDark
                        ? 'hover:bg-white/[0.04] text-zinc-300 border border-transparent'
                        : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`relative w-11 h-11 rounded-2xl overflow-hidden shrink-0 border shadow-xs ${
                        isDark ? 'border-white/[0.08] bg-zinc-900' : 'border-slate-200 bg-slate-100'
                      }`}>
                        <img
                          src={imageSrc}
                          alt={svc.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-300"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      </div>

                      <div className="min-w-0 flex-1 pr-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {svc.name}
                          </span>

                          {malayalamBadge && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                              {malayalamBadge}
                            </span>
                          )}
                        </div>

                        <div className={`flex items-center gap-2 text-[10px] mt-1 flex-wrap ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                          <span className="truncate">{svc.category || 'General'}</span>
                          <span>•</span>
                          <span className="text-[#FF5C38] font-mono font-medium">
                            {formatFrequencyShort(svc.reminderFrequency, svc.reminderIntervalDays)}
                          </span>

                          {svc.hasReminder && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-500 font-medium">
                                Auto
                              </span>
                            </>
                          )}

                          {showClientCount && svc.activeReminderCount !== undefined && svc.activeReminderCount > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-500 font-semibold font-mono bg-emerald-500/10 px-1.5 rounded-full">
                                {svc.activeReminderCount} booked
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {isSelected ? (
                      <div className="w-5 h-5 rounded-full bg-[#FF5C38] flex items-center justify-center text-white shrink-0 shadow-sm ml-2">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    ) : (
                      <div className={`w-5 h-5 rounded-full border shrink-0 ml-2 ${isDark ? 'border-zinc-700' : 'border-slate-300'}`} />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
