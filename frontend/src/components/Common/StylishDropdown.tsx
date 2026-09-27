'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
  image?: string;
  subtitle?: string;
  badge?: string;
}

export interface StylishDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  variant?: 'inline' | 'boxed' | 'pill';
  className?: string;
  menuClassName?: string;
  align?: 'left' | 'right';
  icon?: React.ReactNode;
  disabled?: boolean;
}

export function StylishDropdown({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select option...',
  variant = 'boxed',
  className = '',
  menuClassName = '',
  align = 'left',
  icon,
  disabled = false,
}: StylishDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.id === value);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
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

  // Base Trigger Styling based on variant
  const getTriggerClasses = () => {
    if (variant === 'inline') {
      return 'w-full flex items-center justify-between text-left cursor-pointer bg-transparent focus:outline-none group';
    }

    if (variant === 'pill') {
      return `w-full flex items-center justify-between gap-2.5 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
        isOpen
          ? 'bg-[#EBF6F1] border-[#2A835F] text-[#2A835F] shadow-sm'
          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
      }`;
    }

    // Default 'boxed' variant
    return `w-full flex items-center justify-between gap-2 px-3 py-2 sm:py-2.5 rounded-xl border transition-all cursor-pointer ${
      isOpen
        ? 'bg-white border-[#2A835F] ring-2 ring-[#2A835F]/15 shadow-sm'
        : 'bg-slate-50/90 hover:bg-slate-100/90 border-slate-200/80 text-slate-800'
    }`;
  };

  return (
    <div
      ref={containerRef}
      className={`relative select-none w-full ${className}`}
    >
      {/* Optional Top Label */}
      {label && (
        <label className="block text-[10px] lg:text-[11px] font-black uppercase tracking-wider text-slate-400 mb-0.5 truncate">
          {label}
        </label>
      )}

      {/* Dropdown Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={getTriggerClasses()}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {selectedOption?.image ? (
            <div
              className={`w-8 h-8 rounded-lg overflow-hidden shrink-0 flex items-center justify-center shadow-xs border ${
                variant === 'inline'
                  ? 'border-emerald-500/30 bg-black/40'
                  : 'border-slate-300/80 bg-slate-100'
              }`}
            >
              <img
                src={selectedOption.image}
                alt={selectedOption.label}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <>
              {icon && (
                <span className="shrink-0 text-[#2A835F] flex items-center justify-center">
                  {icon}
                </span>
              )}
              {selectedOption?.icon && (
                <span className="shrink-0 flex items-center justify-center">
                  {selectedOption.icon}
                </span>
              )}
            </>
          )}

          <div className="flex flex-col text-left min-w-0 flex-1">
            <span
              className={`text-xs lg:text-sm font-bold truncate ${
                variant === 'inline'
                  ? 'text-slate-100 group-hover:text-white'
                  : 'text-slate-900'
              }`}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            {selectedOption?.subtitle && (
              <span className="text-[10px] font-semibold text-slate-400 truncate">
                {selectedOption.subtitle}
              </span>
            )}
          </div>
        </div>

        {/* Animated Chevron Indicator */}
        <ChevronDown
          className={`w-3.5 h-3.5 lg:w-4 lg:h-4 text-slate-400 shrink-0 ml-1.5 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#2A835F]' : 'group-hover:text-slate-600'
          }`}
        />
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } mt-2 w-full min-w-[220px] max-w-[340px] max-h-[290px] overflow-y-auto bg-white/98 backdrop-blur-2xl border-2 border-slate-200/90 rounded-2xl p-1.5 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.25)] z-50 animate-in fade-in zoom-in-95 duration-150 scrollbar-thin scrollbar-thumb-slate-200 ${menuClassName}`}
        >
          {options.map((option) => {
            const isSelected = option.id === value;
            return (
              <div
                key={option.id}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option.id)}
                className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#EBF6F1] text-[#2A835F] font-black'
                    : 'text-slate-800 hover:bg-slate-100 hover:text-slate-950 font-semibold'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {option.image ? (
                    <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100 flex items-center justify-center shadow-xs">
                      <img
                        src={option.image}
                        alt={option.label}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : option.icon ? (
                    <span className="shrink-0 flex items-center justify-center text-sm">
                      {option.icon}
                    </span>
                  ) : null}
                  <div className="flex flex-col text-left min-w-0 flex-1">
                    <span className="text-xs sm:text-[13px] leading-snug truncate">
                      {option.label}
                    </span>
                    {option.subtitle && (
                      <span className="text-[10px] text-slate-400 font-medium truncate">
                        {option.subtitle}
                      </span>
                    )}
                  </div>
                </div>

                {/* Selected Indicator / Badge */}
                <div className="flex items-center gap-2 shrink-0">
                  {option.badge && (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {option.badge}
                    </span>
                  )}
                  {isSelected && (
                    <Check className="w-4 h-4 text-[#2A835F] stroke-[2.5]" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
