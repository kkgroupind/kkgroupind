'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import { useAdminTheme } from '@/context/admin-theme-context';

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
  variant?: 'purple' | 'emerald' | 'default' | 'blue' | 'coral';
  theme?: 'dark' | 'light';
  direction?: 'down' | 'up' | 'auto';
  align?: 'left' | 'right' | 'auto';
  usePortal?: boolean;
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
  variant = 'coral',
  theme,
  direction = 'auto',
  align = 'auto',
  usePortal = true,
}: AdminDropdownProps) {
  const { isDark: globalIsDark } = useAdminTheme();
  const isLight = theme ? theme === 'light' : !globalIsDark;

  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mounted, setMounted] = useState(false);
  const [menuCoords, setMenuCoords] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  }>({ top: 0, left: 0, width: 260, maxHeight: 260 });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  const updatePosition = useCallback(() => {
    if (!dropdownRef.current) return;
    const rect = dropdownRef.current.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const minMenuWidth = Math.max(260, rect.width);
    const maxAvailableWidth = windowWidth - 24;
    const desiredWidth = Math.min(minMenuWidth, maxAvailableWidth);

    let left = rect.left;
    const isRightHalf = rect.left + rect.width / 2 > windowWidth / 2;

    if (
      align === 'right' ||
      (align === 'auto' && (isRightHalf || rect.left + desiredWidth > windowWidth - 16))
    ) {
      left = Math.max(12, rect.right - desiredWidth);
    } else {
      left = Math.max(12, rect.left);
      if (left + desiredWidth > windowWidth - 12) {
        left = Math.max(12, windowWidth - desiredWidth - 12);
      }
    }

    const spaceBelow = windowHeight - rect.bottom;
    const spaceAbove = rect.top;

    let isUp = false;
    if (direction === 'up') {
      isUp = true;
    } else if (direction === 'down') {
      isUp = false;
    } else {
      isUp = spaceBelow < 240 && spaceAbove > spaceBelow;
    }

    setOpenUpward(isUp);

    const availableHeight = isUp ? spaceAbove - 24 : spaceBelow - 24;
    const maxHeight = Math.max(140, Math.min(280, availableHeight));

    setMenuCoords({
      top: isUp ? rect.top - 6 : rect.bottom + 6,
      left,
      width: desiredWidth,
      maxHeight,
    });
  }, [align, direction]);

  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    const handleScroll = (e: Event) => {
      if (menuRef.current && menuRef.current.contains(e.target as Node)) {
        return;
      }
      updatePosition();
    };

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        (!menuRef.current || !menuRef.current.contains(target))
      ) {
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus({ preventScroll: true });
      }, 50);
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
    sm: 'px-3 py-1.5 text-xs rounded-xl min-h-[36px]',
    md: 'px-4 py-2.5 text-xs sm:text-sm rounded-xl sm:rounded-2xl min-h-[42px]',
    lg: 'px-5 py-3 text-sm rounded-2xl min-h-[48px]',
  }[size];

  const activeOptionStyle = isLight
    ? 'bg-[#FF5C38]/10 text-[#FF5C38] border border-[#FF5C38]/25 font-bold shadow-xs'
    : {
        coral: 'bg-[#FF5C38]/15 text-[#FF6B4A] border border-[#FF5C38]/30 font-bold',
        purple: 'bg-[#FF5C38]/15 text-[#FF6B4A] border border-[#FF5C38]/30 font-bold',
        emerald: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold',
        blue: 'bg-[#6366F1]/15 text-[#818CF8] border border-[#6366F1]/30 font-bold',
        default: 'bg-white/[0.08] text-white font-bold',
      }[variant];

  const brandAccentColor = variant === 'emerald'
    ? 'text-[#10B981]'
    : variant === 'blue'
    ? 'text-[#6366F1]'
    : 'text-[#FF5C38]';

  const SelectedIcon = selectedOption?.icon || TriggerIcon;

  const triggerStyle = isLight
    ? isOpen
      ? 'bg-white border-[#FF5C38] ring-2 ring-[#FF5C38]/15 shadow-sm text-slate-900'
      : 'bg-white hover:bg-slate-50 border-slate-200/90 hover:border-slate-300 text-slate-800 shadow-xs'
    : isOpen
      ? 'bg-[#181A20] border-[#FF5C38]/80 shadow-[0_0_20px_rgba(255,92,56,0.15)] text-white'
      : 'bg-[#181A20] hover:bg-[#1E2028] border-white/[0.08] hover:border-white/[0.14] text-zinc-200';

  const menuElement = (
    <div
      ref={menuRef}
      data-radix-scroll-lock-ignore="true"
      onWheel={(e) => e.stopPropagation()}
      style={
        usePortal && mounted
          ? {
              position: 'fixed',
              top: openUpward ? undefined : `${menuCoords.top}px`,
              bottom: openUpward && typeof window !== 'undefined' ? `${window.innerHeight - menuCoords.top}px` : undefined,
              left: `${menuCoords.left}px`,
              width: `${menuCoords.width}px`,
              zIndex: 99999,
            }
          : undefined
      }
      className={`${
        usePortal && mounted
          ? ''
          : `absolute z-50 ${align === 'right' ? 'right-0' : 'left-0'} ${
              openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
            } min-w-full sm:min-w-[280px] max-w-[calc(100vw-32px)] sm:max-w-md`
      } rounded-2xl p-2 animate-in fade-in zoom-in-95 duration-150 overflow-hidden ${
        isLight
          ? 'bg-white border border-slate-200 shadow-[0_20px_45px_rgba(0,0,0,0.08)] ring-1 ring-black/5'
          : 'bg-[#181A20] border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.85)] ring-1 ring-white/10'
      } ${menuClassName}`}
    >
      {/* Search box if enabled */}
      {searchable && (
        <div
          className={`p-1.5 pb-2 mb-1 ${
            isLight ? 'border-b border-slate-100' : 'border-b border-white/[0.06]'
          }`}
        >
          <div className="relative">
            <Search
              className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 ${
                isLight ? 'text-slate-400' : 'text-zinc-500'
              }`}
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter options..."
              className={`w-full rounded-xl pl-8 pr-7 py-1.5 text-xs focus:outline-none ${
                isLight
                  ? 'bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#FF5C38] focus:ring-1 focus:ring-[#FF5C38]/20'
                  : 'bg-[#121318] border border-white/[0.06] text-white placeholder:text-zinc-500 focus:border-[#FF5C38] focus:ring-1 focus:ring-[#FF5C38]/30'
              }`}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className={`absolute right-2 top-1/2 -translate-y-1/2 ${
                  isLight
                    ? 'text-slate-400 hover:text-slate-600'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Options List */}
      <div
        data-radix-scroll-lock-ignore="true"
        onWheel={(e) => e.stopPropagation()}
        style={{
          maxHeight: `${menuCoords.maxHeight}px`,
          overscrollBehavior: 'contain',
          touchAction: 'pan-y',
        }}
        className="overflow-y-auto custom-scrollbar space-y-0.5"
      >
        {filteredOptions.length === 0 ? (
          <div
            className={`py-4 text-center text-xs italic ${
              isLight ? 'text-slate-400' : 'text-zinc-500'
            }`}
          >
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
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer text-left ${
                  isSelected
                    ? activeOptionStyle
                    : isLight
                    ? 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                    : 'text-zinc-300 hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {OptIcon && (
                    <OptIcon
                      className={`w-4 h-4 shrink-0 ${
                        isSelected
                          ? brandAccentColor
                          : isLight
                          ? 'text-slate-400'
                          : 'text-zinc-500'
                      }`}
                    />
                  )}
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <div className="font-semibold text-xs leading-snug truncate" title={opt.label}>
                      {opt.label}
                    </div>
                    {opt.description && (
                      <div
                        className={`text-[11px] leading-tight truncate mt-0.5 ${
                          isLight ? 'text-slate-500' : 'text-zinc-400'
                        }`}
                        title={opt.description}
                      >
                        {opt.description}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {opt.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        opt.badgeColor ||
                        (isLight
                          ? 'bg-slate-100 text-slate-600 border border-slate-200'
                          : 'bg-white/[0.06] text-zinc-400 border border-white/[0.06]')
                      }`}
                    >
                      {opt.badge}
                    </span>
                  )}
                  {isSelected && (
                    <Check
                      className={`w-3.5 h-3.5 shrink-0 ${brandAccentColor}`}
                    />
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className={`relative ${isOpen ? 'z-50' : 'z-auto'} ${className}`} ref={dropdownRef}>
      {label && (
        <label
          className={`block text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${
            isLight ? 'text-slate-600' : 'text-zinc-400'
          }`}
        >
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2.5 border ${triggerStyle} ${sizeClasses} transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {SelectedIcon && (
            <SelectedIcon
              className={`w-4 h-4 shrink-0 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}
            />
          )}
          <span
            className={`truncate ${
              !selectedOption
                ? isLight
                  ? 'text-slate-400'
                  : 'text-zinc-500'
                : isLight
                ? 'text-slate-900 font-semibold'
                : 'text-zinc-100 font-medium'
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md shrink-0 ${
                selectedOption.badgeColor ||
                (isLight
                  ? 'bg-slate-100 text-slate-700 border border-slate-200'
                  : 'bg-white/[0.06] text-zinc-300 border border-white/[0.08]')
              }`}
            >
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
            isOpen
              ? `rotate-180 ${brandAccentColor}`
              : isLight
              ? 'text-slate-400'
              : 'text-zinc-400'
          }`}
        />
      </button>

      {/* Dropdown Floating Menu */}
      {isOpen && (
        usePortal && mounted && typeof document !== 'undefined'
          ? createPortal(menuElement, document.body)
          : menuElement
      )}
    </div>
  );
}
