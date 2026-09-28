'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MapPin, Search, ChevronDown, Check, Edit3, Sparkles } from 'lucide-react';

export const KERALA_DISTRICTS: string[] = [
  'Kasaragod',
  'Kannur',
  'Wayanad',
  'Kozhikode',
  'Malappuram',
  'Palakkad',
  'Thrissur',
  'Ernakulam',
  'Idukki',
  'Kottayam',
  'Alappuzha',
  'Pathanamthitta',
  'Kollam',
  'Thiruvananthapuram',
];

export const DISTRICT_CITIES: Record<string, string[]> = {
  Kasaragod: [
    'Kasaragod Town',
    'Kanhangad',
    'Nileshwar',
    'Cheruvathur',
    'Uppala',
    'Manjeshwar',
    'Kumbla',
    'Bekal',
    'Trikaripur',
    'Chittarikkal',
    'Badiadka',
    'Mulleria',
    'Kalnad',
    'Chemnad',
    'Udma',
    'Padne',
    'Pilicode',
    'Periye',
    'Vellarikundu',
    'Panathur',
    'Bandadka',
  ],
  Kannur: [
    'Kannur City',
    'Thalassery',
    'Payyanur',
    'Taliparamba',
    'Mattannur',
    'Iritty',
    'Panoor',
    'Alakode',
  ],
  Kozhikode: [
    'Kozhikode City',
    'Vadakara',
    'Koyilandy',
    'Feroke',
    'Ramanattukara',
    'Balussery',
    'Thamarassery',
  ],
  Wayanad: [
    'Kalpetta',
    'Sulthan Bathery',
    'Mananthavady',
    'Meppadi',
    'Vythiri',
  ],
  Malappuram: [
    'Malappuram',
    'Manjeri',
    'Perinthalmanna',
    'Tirur',
    'Ponnani',
    'Kottakkal',
    'Nilambur',
  ],
  Palakkad: [
    'Palakkad',
    'Ottapalam',
    'Shoranur',
    'Chittur',
    'Mannarkkad',
    'Alathur',
  ],
  Thrissur: [
    'Thrissur City',
    'Chalakudy',
    'Kodungallur',
    'Guruvayur',
    'Kunnamkulam',
    'Irinjalakuda',
  ],
  Ernakulam: [
    'Kochi / Ernakulam',
    'Aluva',
    'Angamaly',
    'Perumbavoor',
    'Muvattupuzha',
    'Kothamangalam',
    'Tripunithura',
  ],
  Idukki: [
    'Thodupuzha',
    'Munnar',
    'Kattappana',
    'Nedumkandam',
    'Adimali',
  ],
  Kottayam: [
    'Kottayam',
    'Changanassery',
    'Pala',
    'Kanjirappally',
    'Vaikom',
  ],
  Alappuzha: [
    'Alappuzha Town',
    'Cherthala',
    'Kayamkulam',
    'Mavelikkara',
    'Chengannur',
  ],
  Pathanamthitta: [
    'Pathanamthitta',
    'Thiruvalla',
    'Adoor',
    'Ranni',
    'Konni',
  ],
  Kollam: [
    'Kollam City',
    'Karunagappally',
    'Punalur',
    'Kottarakkara',
    'Paravur',
  ],
  Thiruvananthapuram: [
    'Thiruvananthapuram City',
    'Neyyattinkara',
    'Attingal',
    'Nedumangad',
    'Varkala',
  ],
};

export interface KeralaLocationSelectProps {
  district: string;
  city: string;
  onDistrictChange: (district: string) => void;
  onCityChange: (city: string) => void;
  disabled?: boolean;
  className?: string;
  showStateBadge?: boolean;
  theme?: 'light' | 'dark';
  language?: 'en' | 'ml';
}

export function KeralaLocationSelect({
  district = 'Kasaragod',
  city = '',
  onDistrictChange,
  onCityChange,
  disabled = false,
  className = '',
  showStateBadge = true,
  theme = 'light',
  language = 'en',
}: KeralaLocationSelectProps) {
  const isLight = theme === 'light';
  // District dropdown state
  const [districtOpen, setDistrictOpen] = useState(false);
  const [districtSearch, setDistrictSearch] = useState('');
  const districtRef = useRef<HTMLDivElement>(null);

  // City dropdown / combobox state
  const [cityOpen, setCityOpen] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const cityRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (districtRef.current && !districtRef.current.contains(event.target as Node)) {
        setDistrictOpen(false);
      }
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) {
        setCityOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered districts
  const filteredDistricts = useMemo(() => {
    if (!districtSearch.trim()) return KERALA_DISTRICTS;
    return KERALA_DISTRICTS.filter((d) =>
      d.toLowerCase().includes(districtSearch.toLowerCase()),
    );
  }, [districtSearch]);

  // Cities for current district
  const availableCities = useMemo(() => {
    return DISTRICT_CITIES[district] || DISTRICT_CITIES['Kasaragod'] || [];
  }, [district]);

  // Filtered cities based on search/typed text
  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return availableCities;
    return availableCities.filter((c) =>
      c.toLowerCase().includes(citySearch.toLowerCase()),
    );
  }, [availableCities, citySearch]);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* State & District Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* State Pill & District Select */}
        <div className="relative" ref={districtRef}>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            {language === 'ml' ? 'ജില്ല' : 'District'}{' '}
            <span className="text-[#2A835F] font-semibold">
              {language === 'ml' ? '(കാസർഗോഡ് - പ്രധാന കേന്ദ്രം)' : '(Kasaragod - Primary Hub)'}
            </span>
          </label>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setDistrictOpen(!districtOpen)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all focus:outline-none cursor-pointer disabled:opacity-50 ${
              isLight
                ? 'bg-slate-50 hover:bg-slate-100/80 border border-slate-300/90 text-slate-900 focus:border-[#2A835F] focus:ring-1 focus:ring-[#2A835F]/20'
                : 'bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/80 text-slate-200 focus:ring-1 focus:ring-emerald-500/50'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-[#2A835F] shrink-0" />
              <span className="truncate">{district || 'Select District'}</span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-500 transition-transform ${
                districtOpen ? 'rotate-180 text-[#2A835F]' : ''
              }`}
            />
          </button>

          {districtOpen && (
            <div
              className={`absolute top-full left-0 right-0 mt-1 max-h-60 rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95 ${
                isLight
                  ? 'bg-white border-2 border-slate-200'
                  : 'bg-[#0c1310] border border-emerald-500/30'
              }`}
            >
              <div
                className={`p-2 border-b ${
                  isLight ? 'bg-slate-50 border-slate-100' : 'bg-[#101b15] border-white/5'
                }`}
              >
                <div
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-xs border ${
                    isLight
                      ? 'bg-white border-slate-200 text-slate-900'
                      : 'bg-black/40 border-white/10 text-white'
                  }`}
                >
                  <Search className="w-3 h-3 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search Kerala district..."
                    value={districtSearch}
                    onChange={(e) => setDistrictSearch(e.target.value)}
                    className="w-full bg-transparent focus:outline-none text-xs"
                  />
                </div>
              </div>
              <div className="overflow-y-auto max-h-48 divide-y divide-slate-100">
                {filteredDistricts.map((d) => {
                  const isSelected = d === district;
                  const isKasaragod = d === 'Kasaragod';
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        onDistrictChange(d);
                        setDistrictOpen(false);
                        setDistrictSearch('');
                        if (DISTRICT_CITIES[d] && !DISTRICT_CITIES[d].includes(city)) {
                          onCityChange('');
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#EBF6F1] text-[#2A835F] font-bold'
                          : isLight
                          ? 'text-slate-800 hover:bg-slate-50'
                          : 'text-slate-300 hover:bg-emerald-500/10'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{d}</span>
                        {isKasaragod && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            {language === 'ml' ? 'പ്രധാന കേന്ദ്രം' : 'Primary Hub'}
                          </span>
                        )}
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#2A835F]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* City / Locality Combobox (Search, Select, OR Custom Type) */}
        <div className="relative" ref={cityRef}>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              {language === 'ml' ? `നഗരം / പ്രദേശം (${district})` : `City / Locality in ${district}`}
            </label>
            <span className="text-[10px] text-slate-400">
              {language === 'ml' ? 'തിരഞ്ഞെടുക്കുക അല്ലെങ്കിൽ ടൈപ്പ് ചെയ്യുക' : 'Select or type'}
            </span>
          </div>

          <div className="relative flex items-center">
            <input
              type="text"
              disabled={disabled}
              value={city}
              onChange={(e) => {
                onCityChange(e.target.value);
                setCitySearch(e.target.value);
                if (!cityOpen) setCityOpen(true);
              }}
              onFocus={() => {
                setCityOpen(true);
                setCitySearch(city);
              }}
              placeholder={`e.g. ${availableCities[0] || 'Type city/village...'}`}
              className={`w-full pl-3 pr-8 py-2.5 rounded-xl text-xs font-medium focus:outline-none transition-all disabled:opacity-50 ${
                isLight
                  ? 'bg-slate-50 hover:bg-slate-100/80 border border-slate-300/90 text-slate-900 placeholder-slate-400 focus:border-[#2A835F] focus:ring-1 focus:ring-[#2A835F]/20'
                  : 'bg-slate-900/60 border border-slate-700/80 text-slate-200 placeholder-slate-500 focus:ring-1 focus:ring-emerald-500/50'
              }`}
            />
            <button
              type="button"
              onClick={() => setCityOpen(!cityOpen)}
              className="absolute right-2 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  cityOpen ? 'rotate-180 text-[#2A835F]' : ''
                }`}
              />
            </button>
          </div>

          {cityOpen && (
            <div
              className={`absolute top-full left-0 right-0 mt-1 max-h-56 rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95 ${
                isLight
                  ? 'bg-white border-2 border-slate-200'
                  : 'bg-[#0c1310] border border-emerald-500/30'
              }`}
            >
              {/* Option to use custom typed text if not strictly in suggestions */}
              {city.trim() && !availableCities.includes(city.trim()) && (
                <div
                  className={`p-2 border-b ${
                    isLight ? 'bg-slate-50 border-slate-100' : 'bg-[#14231b] border-white/5'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setCityOpen(false);
                    }}
                    className="w-full flex items-center gap-1.5 text-left text-xs text-[#2A835F] font-semibold hover:underline cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3 text-[#2A835F] shrink-0" />
                    <span>
                      Use custom location: &ldquo;
                      <strong className="text-slate-900">{city}</strong>&rdquo;
                    </span>
                  </button>
                </div>
              )}

              <div className="overflow-y-auto max-h-48 divide-y divide-slate-100">
                {filteredCities.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-400">
                    No matching standard city in {district}. You can keep what you typed!
                  </div>
                ) : (
                  filteredCities.map((cityName) => {
                    const isSelected = cityName.toLowerCase() === city.trim().toLowerCase();
                    return (
                      <button
                        key={cityName}
                        type="button"
                        onClick={() => {
                          onCityChange(cityName);
                          setCityOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#EBF6F1] text-[#2A835F] font-bold'
                            : isLight
                            ? 'text-slate-800 hover:bg-slate-50'
                            : 'text-slate-300 hover:bg-emerald-500/10'
                        }`}
                      >
                        <span>{cityName}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#2A835F]" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
