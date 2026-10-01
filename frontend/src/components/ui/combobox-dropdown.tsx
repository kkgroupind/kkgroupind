'use client';

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { cn } from '@/lib/utils';

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
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
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
            'flex min-h-[42px] w-full items-center justify-between rounded-xl border border-gray-800 bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-gray-200 focus:outline-none focus:border-[#2A835F] focus:ring-1 focus:ring-[#2A835F]/30 disabled:cursor-not-allowed disabled:opacity-50 transition-all cursor-pointer',
            className
          )}
        >
          <span className="truncate text-left flex-1 min-w-0 font-medium">
            {selectedOption ? (
              <span className="text-gray-100">{selectedOption.label}</span>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 ml-2 text-gray-400 transition-transform duration-200',
              open && 'rotate-180 text-[#2A835F]'
            )}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align={align}
        style={{ width: triggerWidth ? `${Math.max(triggerWidth, 280)}px` : undefined }}
        className="p-1.5 max-w-[calc(100vw-32px)]"
      >
        {searchable && (
          <div className="p-1.5 pb-2 mb-1 border-b border-gray-800/80">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-lg bg-[#1A1C23] border border-gray-800 text-gray-200 placeholder:text-gray-500 pl-8 pr-7 py-1.5 text-xs focus:outline-none focus:border-[#2A835F] focus:ring-1 focus:ring-[#2A835F]/30"
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

        <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-0.5">
          {filteredOptions.length === 0 ? (
            <div className="py-4 text-center text-xs italic text-gray-500">
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
                      ? 'bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30'
                      : 'text-gray-300 hover:bg-[#1A1C23] hover:text-white'
                  )}
                >
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <div className="font-semibold text-xs leading-snug truncate" title={opt.label}>
                      {opt.label}
                    </div>
                    {opt.description && (
                      <div
                        className="text-[11px] leading-tight truncate text-emerald-400/80 mt-0.5"
                        title={opt.description}
                      >
                        {opt.description}
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-[#2A835F] shrink-0 ml-2" />
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
