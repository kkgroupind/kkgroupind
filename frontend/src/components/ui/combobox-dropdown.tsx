'use client';

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { cn } from '@/lib/utils';
import { useAdminTheme } from '@/context/admin-theme-context';

export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
  badge?: string;
  badgeColor?: string;
}

interface ComboboxDropdownProps {
  options: ComboboxOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  align?: 'start' | 'center' | 'end';
  className?: string;
  disabled?: boolean;
}

export function ComboboxDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  searchable = true,
  align = 'start',
  className,
  disabled = false,
}: ComboboxDropdownProps) {
  const { isDark } = useAdminTheme();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [triggerWidth, setTriggerWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (open) {
      if (triggerRef.current) {
        setTriggerWidth(triggerRef.current.offsetWidth);
      }
      if (searchable) {
        setTimeout(() => {
          searchInputRef.current?.focus({ preventScroll: true });
        }, 50);
      }
    } else {
      setSearchTerm('');
    }
  }, [open, searchable]);

  // Robust wheel and touch scrolling inside Radix UI Dialog modals
  useEffect(() => {
    const el = listRef.current;
    if (!el || !open) return;

    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation();
      const hasScroll = el.scrollHeight > el.clientHeight;
      if (hasScroll) {
        el.scrollTop += e.deltaY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.stopPropagation();
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('touchmove', handleTouchMove);
    };
  }, [open, searchTerm, options]);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = searchable && searchTerm.trim()
    ? options.filter(
        (opt) =>
          opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opt.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (opt.description && opt.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : options;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          className={cn(
            'flex min-h-[42px] w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm transition-all focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
            isDark
              ? 'bg-[#181A20] border-white/[0.08] text-white focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]/30'
              : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]/30',
            className
          )}
        >
          <span className="truncate text-left flex-1 min-w-0 font-medium">
            {selectedOption ? (
              <span className={isDark ? 'text-white' : 'text-slate-900'}>{selectedOption.label}</span>
            ) : (
              <span className={isDark ? 'text-zinc-500' : 'text-slate-400'}>{placeholder}</span>
            )}
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 ml-2 transition-transform duration-200',
              isDark ? 'text-zinc-400' : 'text-slate-500',
              open && 'rotate-180 text-[#6366F1]'
            )}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align={align}
        data-radix-scroll-lock-ignore="true"
        style={{ width: triggerWidth ? `${Math.max(triggerWidth, 280)}px` : undefined }}
        className={cn(
          'p-1.5 max-w-[calc(100vw-32px)] rounded-2xl shadow-2xl border',
          isDark
            ? 'bg-[#14151A] border-white/[0.1] text-gray-200'
            : 'bg-white border-slate-200 text-slate-900 shadow-xl'
        )}
      >
        {searchable && (
          <div
            className={cn(
              'p-1.5 pb-2 mb-1 border-b',
              isDark ? 'border-white/[0.06]' : 'border-slate-100'
            )}
          >
            <div className="relative">
              <Search className={cn('w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2', isDark ? 'text-zinc-500' : 'text-slate-400')} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className={cn(
                  'w-full rounded-xl pl-8 pr-7 py-1.5 text-xs focus:outline-none transition-colors',
                  isDark
                    ? 'bg-[#1A1C23] border border-white/[0.08] text-white placeholder:text-zinc-500 focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]/30'
                    : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]/30'
                )}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className={cn(
                    'absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded cursor-pointer',
                    isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'
                  )}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        <div
          ref={listRef}
          data-radix-scroll-lock-ignore="true"
          onWheel={(e) => {
            e.stopPropagation();
            if (listRef.current) {
              listRef.current.scrollTop += e.deltaY;
            }
          }}
          style={{
            maxHeight: '260px',
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            touchAction: 'pan-y',
          }}
          className="custom-scrollbar space-y-0.5"
        >
          {filteredOptions.length === 0 ? (
            <div className={cn('py-4 text-center text-xs italic', isDark ? 'text-zinc-500' : 'text-slate-400')}>
              No matching options
            </div>
          ) : (
            filteredOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left',
                    isSelected
                      ? 'bg-[#6366F1]/15 text-[#818CF8] font-bold border border-[#6366F1]/30'
                      : isDark
                      ? 'text-zinc-300 hover:bg-white/[0.05] hover:text-white'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <div className="font-semibold text-xs leading-snug truncate" title={opt.label}>
                      {opt.label}
                    </div>
                    {opt.description && (
                      <div
                        className={cn(
                          'text-[11px] leading-tight truncate mt-0.5',
                          isSelected ? 'text-[#818CF8]/80' : isDark ? 'text-zinc-400' : 'text-slate-500'
                        )}
                        title={opt.description}
                      >
                        {opt.description}
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-[#6366F1] shrink-0 ml-2" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
