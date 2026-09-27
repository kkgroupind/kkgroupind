'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

export interface AdminDropdownOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
  description?: string;
}

export interface AdminDropdownProps {
  options: AdminDropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  className?: string;
  menuClassName?: string;
  searchable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'purple' | 'emerald' | 'default';
}

export function AdminDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  label,
  icon: TriggerIcon,
  disabled = false,
  className = '',
  menuClassName = '',
  searchable = false,
  size = 'md',
  variant = 'purple',
}: AdminDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus search when opened
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen, searchable]);

  const filteredOptions = searchable && searchTerm.trim()
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opt.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (opt.description && opt.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : options;

  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-[11px] rounded-lg',
    md: 'px-3.5 py-2 text-xs rounded-xl',
    lg: 'px-4 py-2.5 text-sm rounded-xl',
  }[size];

  const variantBorderGlow = {
    purple: 'focus:border-[#7B4DFF] focus:shadow-[0_0_15px_rgba(123,77,255,0.25)]',
    emerald: 'focus:border-[#2A835F] focus:shadow-[0_0_15px_rgba(42,131,95,0.25)]',
    default: 'focus:border-gray-600 focus:shadow-none',
  }[variant];

  const activeOptionStyle = {
    purple: 'bg-[#7B4DFF]/15 text-[#A78BFA] border border-[#7B4DFF]/30 font-bold',
    emerald: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold',
    default: 'bg-gray-800 text-white font-bold',
  }[variant];

  const SelectedIcon = selectedOption?.icon || TriggerIcon;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2.5 bg-[#1A1C23] hover:bg-[#20232c] border ${
          isOpen ? 'border-[#7B4DFF]/70 shadow-[0_0_20px_rgba(123,77,255,0.2)]' : 'border-gray-800/80 hover:border-gray-700'
        } ${sizeClasses} text-gray-200 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none`}
      >
        <div className="flex items-center gap-2 truncate">
          {SelectedIcon && (
            <SelectedIcon className="w-4 h-4 text-gray-400 shrink-0" />
          )}
          <span className={`truncate ${!selectedOption ? 'text-gray-500' : 'text-gray-200 font-medium'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md shrink-0 ${
                selectedOption.badgeColor || 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
              }`}
            >
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#7B4DFF]' : ''
          }`}
        />
      </button>

      {/* Dropdown Floating Menu */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 z-50 mt-1.5 min-w-[200px] bg-[#14151A]/95 backdrop-blur-xl border border-gray-800/90 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.7)] p-1.5 animate-in fade-in zoom-in-95 duration-150 overflow-hidden ${menuClassName}`}
        >
          {/* Subtle top ambient glow */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#7B4DFF]/60 to-transparent" />

          {/* Search box if enabled */}
          {searchable && (
            <div className="p-1.5 pb-2 border-b border-gray-800/70 mb-1">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter options..."
                  className="w-full bg-[#1A1C23] border border-gray-800 rounded-lg pl-8 pr-7 py-1.5 text-xs text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-[#7B4DFF]"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-xs text-gray-500 italic">
                No matching options
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                const OptIcon = opt.icon;

                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer text-left ${
                      isSelected
                        ? activeOptionStyle
                        : 'text-gray-300 hover:bg-[#1A1C23] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {OptIcon && (
                        <OptIcon
                          className={`w-4 h-4 shrink-0 ${
                            isSelected ? 'text-[#7B4DFF]' : 'text-gray-500'
                          }`}
                        />
                      )}
                      <div className="min-w-0">
                        <div className="truncate font-medium">{opt.label}</div>
                        {opt.description && (
                          <div className="text-[10px] text-gray-500 truncate">
                            {opt.description}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {opt.badge && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            opt.badgeColor || 'bg-gray-800 text-gray-400 border border-gray-700'
                          }`}
                        >
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-[#7B4DFF] shrink-0" />
                      )}
                    </div>
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
