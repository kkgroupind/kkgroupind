'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

export interface CountryItem {
  code: string; // ISO 2 code e.g. IN
  name: string;
  dialCode: string; // e.g. +91
  flag: string;
}

export const POPULAR_COUNTRIES: CountryItem[] = [
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦' },
  { code: 'QA', name: 'Qatar', dialCode: '+974', flag: '🇶🇦' },
  { code: 'KW', name: 'Kuwait', dialCode: '+965', flag: '🇰🇼' },
  { code: 'OM', name: 'Oman', dialCode: '+968', flag: '🇴🇲' },
  { code: 'BH', name: 'Bahrain', dialCode: '+973', flag: '🇧🇭' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬' },
  { code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹' },
  { code: 'NZ', name: 'New Zealand', dialCode: '+64', flag: '🇳🇿' },
  { code: 'LK', name: 'Sri Lanka', dialCode: '+94', flag: '🇱🇰' },
  { code: 'NP', name: 'Nepal', dialCode: '+977', flag: '🇳🇵' },
  { code: 'BD', name: 'Bangladesh', dialCode: '+880', flag: '🇧🇩' },
  { code: 'PK', name: 'Pakistan', dialCode: '+92', flag: '🇵🇰' },
  { code: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦' },
  { code: 'IE', name: 'Ireland', dialCode: '+353', flag: '🇮🇪' },
  { code: 'CH', name: 'Switzerland', dialCode: '+41', flag: '🇨🇭' },
  { code: 'SE', name: 'Sweden', dialCode: '+46', flag: '🇸🇪' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷' },
  { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳' },
];

interface CountryCodeSelectProps {
  value: string; // e.g. "+91"
  onChange: (dialCode: string) => void;
  className?: string;
  disabled?: boolean;
  theme?: 'dark' | 'light';
  variant?: 'emerald' | 'blue';
}

export function CountryCodeSelect({
  value = '+91',
  onChange,
  className = '',
  disabled = false,
  theme,
  variant,
}: CountryCodeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [countries, setCountries] = useState<CountryItem[]>(POPULAR_COUNTRIES);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isLight = theme === 'light' || variant === 'blue';

  // Optional: fetch external public API to augment with all world countries
  useEffect(() => {
    let isMounted = true;
    fetch('https://restcountries.com/v3.1/all?fields=name,cca2,idd,flag')
      .then((res) => res.json())
      .then((data: any[]) => {
        if (!isMounted || !Array.isArray(data)) return;
        const mapped: CountryItem[] = [];
        data.forEach((c) => {
          const root = c.idd?.root || '';
          const suffixes = c.idd?.suffixes || [];
          if (!root) return;
          // if single suffix, append; if many, root is base
          const dialCode = suffixes.length === 1 ? `${root}${suffixes[0]}` : root;
          mapped.push({
            code: c.cca2,
            name: c.name?.common || '',
            dialCode,
            flag: c.flag || '🌐',
          });
        });

        // Put India at the very top, followed by GCC, then alphabetical
        const india = mapped.find((c) => c.code === 'IN');
        const others = mapped.filter((c) => c.code !== 'IN');
        others.sort((a, b) => a.name.localeCompare(b.name));
        const combined = india ? [india, ...others] : mapped;
        if (combined.length > 20) {
          setCountries(combined);
        }
      })
      .catch(() => {
        // Silently fallback to POPULAR_COUNTRIES
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Close when clicking outside
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

  const selectedCountry = useMemo(() => {
    return countries.find((c) => c.dialCode === value) || {
      code: 'IN',
      name: 'India',
      dialCode: value || '+91',
      flag: '🇮🇳',
    };
  }, [countries, value]);

  const filtered = useMemo(() => {
    if (!search.trim()) return countries;
    const q = search.toLowerCase();
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase().includes(q),
    );
  }, [countries, search]);

  const accentText = isLight ? 'text-[#1B2CC1]' : 'text-emerald-400';

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-medium transition-all focus:outline-none disabled:opacity-50 cursor-pointer h-full ${
          isLight
            ? 'bg-slate-50 hover:bg-slate-100/90 border-slate-200 text-[#091540] focus:ring-1 focus:ring-[#1B2CC1]/30'
            : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-700/80 text-slate-200 focus:ring-1 focus:ring-emerald-500/50'
        }`}
      >
        <span className="text-base leading-none">{selectedCountry.flag}</span>
        <span className={`font-mono font-bold text-xs ${accentText}`}>
          {selectedCountry.dialCode}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${
            isLight
              ? isOpen
                ? 'rotate-180 text-[#1B2CC1]'
                : 'text-slate-400'
              : isOpen
              ? 'rotate-180 text-emerald-400'
              : 'text-slate-400'
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute top-full left-0 mt-1.5 w-64 max-h-72 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95 ${
            isLight
              ? 'bg-white/98 backdrop-blur-xl border border-[#7692FF]/30 shadow-[0_16px_40px_rgba(9,21,64,0.14)]'
              : 'bg-[#0c1310] border border-emerald-500/30'
          }`}
        >
          {/* Search bar */}
          <div
            className={`p-2 border-b ${
              isLight ? 'border-slate-100 bg-slate-50' : 'border-white/5 bg-[#101b15]'
            }`}
          >
            <div
              className={`flex items-center gap-2 px-2.5 py-1.5 border rounded-xl text-xs ${
                isLight ? 'bg-white border-slate-200' : 'bg-black/40 border-white/10'
              }`}
            >
              <Search
                className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-slate-400' : 'text-slate-400'}`}
              />
              <input
                type="text"
                autoFocus
                placeholder="Search country / code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full bg-transparent focus:outline-none text-xs ${
                  isLight
                    ? 'text-[#091540] placeholder-slate-400'
                    : 'text-white placeholder-slate-500'
                }`}
              />
            </div>
          </div>

          {/* List */}
          <div
            className={`overflow-y-auto max-h-56 divide-y ${
              isLight ? 'divide-slate-100' : 'divide-white/[0.03]'
            }`}
          >
            {filtered.length === 0 ? (
              <div
                className={`p-3 text-center text-xs ${
                  isLight ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                No matching country
              </div>
            ) : (
              filtered.map((item) => {
                const isSelected = item.dialCode === value;
                return (
                  <button
                    key={`${item.code}-${item.dialCode}`}
                    type="button"
                    onClick={() => {
                      onChange(item.dialCode);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                      isLight
                        ? isSelected
                          ? 'bg-[#1B2CC1]/10 text-[#1B2CC1] font-semibold'
                          : 'text-slate-700 hover:bg-slate-100/80'
                        : isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                        : 'text-slate-300 hover:bg-emerald-500/10'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="text-base">{item.flag}</span>
                      <span className="truncate">{item.name}</span>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 shrink-0 font-mono text-[11px] font-medium ${accentText}`}
                    >
                      <span>{item.dialCode}</span>
                      {isSelected && <Check className={`w-3.5 h-3.5 ${accentText}`} />}
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
