'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  ChevronDown,
  Search,
  Check,
  TreePalm,
  CalendarClock,
  Sparkles,
  Layers,
} from 'lucide-react';
import { ReminderFrequency } from '@/services/reminder.service';

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
  if (lower.includes('plaster') || lower.includes('പ്ലാസ്റ്ററിംഗ്')) {
    return 'പ്ലാസ്റ്ററിംഗ്';
  }
  if (lower.includes('tile') || lower.includes('granite') || lower.includes('ടൈൽ')) {
    return 'ടൈലിംഗ് വർക്ക്';
  }
  if (lower.includes('mason') || lower.includes('brick') || lower.includes('മേസൻ')) {
    return 'മേസൺ വർക്ക്';
  }
  return null;
}

export function formatFrequencyShort(freq?: ReminderFrequency, days?: number | null): string {
  switch (freq) {
    case 'EVERY_3_MONTHS':
      return 'Every 3 Months';
    case 'EVERY_6_MONTHS':
      return 'Every 6 Months';
    case 'EVERY_2_MONTHS':
      return 'Every 2 Months';
    case 'MONTHLY':
      return 'Monthly';
    case 'YEARLY':
      return 'Yearly';
    case 'CUSTOM_DAYS':
      return `Every ${days || 30}d`;
    default:
      return '3 Months';
  }
}

const QUICK_FILTER_TAGS = [
  { label: 'All', value: '' },
  { label: '🌴 Coconut', value: 'coco' },
  { label: '💧 Well', value: 'well' },
  { label: '⚡ Electrical', value: 'electr' },
  { label: '🔧 Plumbing', value: 'plumb' },
  { label: '🎨 Painting', value: 'paint' },
  { label: '🚜 JCB', value: 'jcb' },
  { label: '🌿 Garden', value: 'grass' },
];

export function ServiceSelectDropdown({
  services,
  selectedServiceId,
  onSelect,
  label,
  placeholder = 'Select service...',
  includeAllOption = false,
  allOptionLabel = 'All Services',
  showFrequencyBadge = true,
  showClientCount = false,
  className = '',
}: ServiceSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  const selectedService = useMemo(() => {
    return services.find((s) => s.id === selectedServiceId || s.name === selectedServiceId);
  }, [services, selectedServiceId]);

  const filteredServices = useMemo(() => {
    let result = services;

    if (selectedTag) {
      const tagLower = selectedTag.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(tagLower) ||
          (s.category && s.category.toLowerCase().includes(tagLower)),
      );
    }

    const term = searchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          (s.category && s.category.toLowerCase().includes(term)),
      );
    }

    return result;
  }, [services, searchTerm, selectedTag]);

  const isAllSelected = includeAllOption && (selectedServiceId === 'ALL' || !selectedServiceId);
  const selectedMalayalam = selectedService ? getMalayalamLabel(selectedService.name) : null;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#7B4DFF]" />
          <span>{label}</span>
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-[#1A1C23] border hover:border-gray-700/80 rounded-2xl p-2 sm:p-2.5 transition-all duration-200 text-left flex items-center justify-between gap-3 group shadow-sm ${
          isOpen
            ? 'border-[#7B4DFF] shadow-[0_0_20px_rgba(123,77,255,0.25)] ring-1 ring-[#7B4DFF]/50'
            : 'border-gray-800 hover:bg-[#1C1F28]'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {isAllSelected ? (
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#7B4DFF]/20 to-[#14151A] border border-[#7B4DFF]/30 flex items-center justify-center shrink-0 shadow-sm">
              <Layers className="w-5 h-5 text-[#7B4DFF]" />
            </div>
          ) : selectedService ? (
            <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-gray-700/70 shadow-md bg-gray-950 group-hover:border-[#7B4DFF]/60 transition-colors">
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
            <div className="w-11 h-11 rounded-xl bg-[#14151A] border border-gray-800 flex items-center justify-center shrink-0">
              <CalendarClock className="w-5 h-5 text-gray-500" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-100 text-xs sm:text-sm truncate block group-hover:text-white">
                {isAllSelected
                  ? allOptionLabel
                  : selectedService?.name || placeholder}
              </span>

              {selectedMalayalam && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 hidden md:inline-block">
                  {selectedMalayalam}
                </span>
              )}

              {selectedService && showFrequencyBadge && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#7B4DFF]/15 text-[#A580FF] border border-[#7B4DFF]/30 shrink-0 hidden sm:inline-block">
                  {formatFrequencyShort(
                    selectedService.reminderFrequency,
                    selectedService.reminderIntervalDays,
                  )}
                </span>
              )}
            </div>

            <div className="text-[11px] text-gray-400 flex items-center gap-2 truncate mt-0.5">
              <span>
                {isAllSelected
                  ? `Showing all (${services.length} services)`
                  : selectedService?.category || 'KK Group Kerala Service'}
              </span>

              {selectedService?.hasReminder && (
                <>
                  <span className="text-gray-700">•</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Auto-Schedule ON</span>
                  </span>
                </>
              )}

              {showClientCount && selectedService?.activeReminderCount !== undefined && (
                <>
                  <span className="text-gray-700">•</span>
                  <span className="text-[#A580FF] font-mono font-bold">
                    {selectedService.activeReminderCount} active
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="p-1.5 rounded-xl bg-[#14151A] border border-gray-800 text-gray-400 group-hover:text-gray-200 shrink-0 transition-colors">
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-300 ${
              isOpen ? 'rotate-180 text-[#7B4DFF]' : ''
            }`}
          />
        </div>
      </button>

      {/* Flyout Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 rounded-2xl bg-[#14151A]/95 border border-gray-700/70 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(123,77,255,0.15)] backdrop-blur-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Bar inside Dropdown */}
          <div className="p-3 border-b border-gray-800/80 bg-[#1A1C23]/90 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search services (Coconut, Well, JCB, Solar, Electrical...)"
                className="w-full bg-[#14151A] border border-gray-800 focus:border-[#7B4DFF] rounded-xl pl-8.5 pr-8 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#7B4DFF]/40 transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs px-1"
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
                    className={`px-2 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-[#7B4DFF] text-white shadow-sm'
                        : 'bg-[#14151A] text-gray-400 hover:text-gray-200 border border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* List of Options */}
          <div className="max-h-72 overflow-y-auto custom-scrollbar p-2 space-y-1.5">
            {includeAllOption && !searchTerm && !selectedTag && (
              <button
                type="button"
                onClick={() => {
                  onSelect('ALL');
                  setIsOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl transition-all flex items-center justify-between text-left group ${
                  isAllSelected
                    ? 'bg-gradient-to-r from-[#7B4DFF]/20 via-[#7B4DFF]/10 to-transparent border border-[#7B4DFF]/40 text-white'
                    : 'hover:bg-[#1A1C23] text-gray-300 border border-transparent hover:border-gray-800'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#1A1C23] border border-gray-800 flex items-center justify-center shrink-0 group-hover:border-[#7B4DFF]/40 transition-colors">
                    <Layers className="w-5 h-5 text-[#7B4DFF]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-100 group-hover:text-white">
                      {allOptionLabel}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      Show reminders across all {services.length} services
                    </div>
                  </div>
                </div>

                {isAllSelected && (
                  <div className="w-5 h-5 rounded-full bg-[#7B4DFF] flex items-center justify-center text-white shrink-0 shadow-[0_0_10px_rgba(123,77,255,0.5)]">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            )}

            {filteredServices.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500 flex flex-col items-center gap-1.5">
                <Search className="w-5 h-5 text-gray-600 mb-1" />
                <span>No services found matching your search.</span>
                <span className="text-[10px] text-gray-600">Try clearing the search or tag filters</span>
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
                    className={`w-full p-2.5 rounded-xl transition-all duration-150 flex items-center justify-between text-left group ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#7B4DFF]/25 via-[#7B4DFF]/15 to-[#1A1C23]/60 border border-[#7B4DFF]/50 text-white shadow-sm'
                        : 'hover:bg-[#1A1C23] text-gray-300 border border-transparent hover:border-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Thumbnail Image with Banner Preview */}
                      <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-gray-800 group-hover:border-[#7B4DFF]/50 shadow-md bg-gray-950 transition-all">
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
                          <span className="text-xs font-bold text-gray-100 group-hover:text-white truncate">
                            {svc.name}
                          </span>

                          {malayalamBadge && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                              {malayalamBadge}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1 flex-wrap">
                          <span className="text-gray-500 truncate">{svc.category || 'General'}</span>
                          <span className="text-gray-700">•</span>
                          <span className="text-[#A580FF] font-mono font-medium">
                            {formatFrequencyShort(svc.reminderFrequency, svc.reminderIntervalDays)}
                          </span>

                          {svc.hasReminder && (
                            <>
                              <span className="text-gray-700">•</span>
                              <span className="text-emerald-400 font-medium">
                                Auto
                              </span>
                            </>
                          )}

                          {showClientCount && svc.activeReminderCount !== undefined && svc.activeReminderCount > 0 && (
                            <>
                              <span className="text-gray-700">•</span>
                              <span className="text-emerald-400 font-semibold font-mono bg-emerald-500/10 px-1 rounded">
                                {svc.activeReminderCount} booked
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {isSelected ? (
                      <div className="w-5 h-5 rounded-full bg-[#7B4DFF] flex items-center justify-center text-white shrink-0 shadow-[0_0_10px_rgba(123,77,255,0.6)] ml-2">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-gray-700/60 group-hover:border-gray-500 shrink-0 ml-2 transition-colors" />
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
