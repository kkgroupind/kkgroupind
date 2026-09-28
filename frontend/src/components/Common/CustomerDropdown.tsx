'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { getServiceMalayalamName, getServiceBanner } from '@/utils/service-options';

export interface CustomerDropdownOption {
  id: string;
  name: string;
  nameMl?: string;
  subtitle?: string;
  image?: string;
  tag?: string;
}

export interface CustomerDropdownProps {
  options: CustomerDropdownOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  menuClassName?: string;
  disabled?: boolean;
  language?: 'en' | 'ml';
}

export function CustomerDropdown({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select required service...',
  className = '',
  menuClassName = '',
  disabled = false,
  language = 'en',
}: CustomerDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.id === value) || options[0];

  const getDisplayName = (opt: CustomerDropdownOption | undefined) => {
    if (!opt) return placeholder;
    if (language === 'ml') {
      return opt.nameMl || getServiceMalayalamName(opt.name);
    }
    return opt.name;
  };

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative select-none w-full ${className}`}>
      {/* Optional Top Label */}
      {label && (
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 truncate">
          {label}
        </label>
      )}

      {/* Trigger Button with Big Image & Two-Line Text */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-3 p-2.5 sm:p-3 bg-white hover:bg-slate-50 border-2 rounded-2xl sm:rounded-3xl transition-all cursor-pointer shadow-xs text-left ${
          isOpen
            ? 'border-[#2A835F] ring-2 ring-[#2A835F]/15'
            : 'border-slate-200/90 hover:border-slate-300'
        } disabled:opacity-60 disabled:cursor-not-allowed`}
      >
        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
          {/* Big Image Thumbnail */}
          {(selectedOption?.image || (selectedOption && getServiceBanner(selectedOption.name))) && (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 border border-slate-200 bg-slate-100 flex items-center justify-center shadow-xs">
              <img
                src={selectedOption.image || getServiceBanner(selectedOption.name)}
                alt={selectedOption.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Full Service Title (Name shown fully, no truncation) */}
          <div className="flex flex-col justify-center min-w-0 flex-1 py-0.5">
            <span className="text-xs sm:text-sm font-bold text-slate-900 leading-snug break-words whitespace-normal">
              {getDisplayName(selectedOption)}
            </span>
          </div>
        </div>

        {/* Clean Chevron Indicator */}
        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 ml-1">
          <ChevronDown
            className={`w-4 h-4 text-slate-600 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-[#2A835F]' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute left-0 right-0 mt-2 w-full max-h-[380px] overflow-y-auto bg-white border-2 border-slate-200/90 rounded-2xl sm:rounded-3xl p-2 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] z-50 animate-in fade-in zoom-in-95 duration-150 scrollbar-thin scrollbar-thumb-slate-200 ${menuClassName}`}
        >
          <div className="flex flex-col gap-1.5">
            {options.map((option) => {
              const isSelected = option.id === value;
              const optionImage = option.image || getServiceBanner(option.name);
              return (
                <div
                  key={option.id}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.id)}
                  className={`flex items-center justify-between gap-3.5 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#EBF6F1] border border-[#C3E6D5]'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3.5 sm:gap-3.5 min-w-0 flex-1">
                    {/* Big Image Thumbnail */}
                    {optionImage && (
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 border border-slate-200 bg-slate-100 flex items-center justify-center shadow-xs">
                        <img
                          src={optionImage}
                          alt={option.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Only Full Service Title Shown (No hours, no subtitles, no category tags) */}
                    <div className="flex flex-col justify-center min-w-0 flex-1 py-0.5">
                      <span
                        className={`text-xs sm:text-sm leading-snug break-words whitespace-normal ${
                          isSelected
                            ? 'font-bold text-[#2A835F]'
                            : 'font-semibold text-slate-900'
                        }`}
                      >
                        {getDisplayName(option)}
                      </span>
                    </div>
                  </div>

                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-[#2A835F] text-white flex items-center justify-center shrink-0 shadow-xs ml-2">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
