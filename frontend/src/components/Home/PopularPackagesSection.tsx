'use client';

import React, { useState } from 'react';
import {
  Calendar,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  MapPin,
  Clock,
  Star,
  Users,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { translations } from '@/utils/translations';
import { StylishDropdown } from '@/components/Common/StylishDropdown';

export interface KasaragodServiceItem {
  id: string;
  category: 'agriculture' | 'machinery' | 'masonry' | 'finishing' | 'utilities';
  titleEn: string;
  titleMl: string;
  locationEn: string;
  locationMl: string;
  towns: string[];
  durationEn: string;
  durationMl: string;
  rating: string;
  image: string;
  tagEn: string;
  tagMl: string;
  highlightEn: string;
  highlightMl: string;
}

export const KASARAGOD_SERVICES: KasaragodServiceItem[] = [
  {
    id: 'cococare',
    category: 'agriculture',
    titleEn: 'Cococare Elite Palm Squad',
    titleMl: 'തെങ്ങ് കയറ്റവും തെങ്ങ് വൃത്തിയാക്കലും',
    locationEn: 'Kanhangad • Nileshwar • Cheruvathur • Hosdurg',
    locationMl: 'കാഞ്ഞങ്ങാട് • നീലേശ്വരം • ചെറുവത്തൂർ • ഹോസ്ദുർഗ്',
    towns: ['kanhangad', 'nileshwar', 'cheruvathur', 'trikaripur', 'hosdurg', 'all'],
    durationEn: 'Certified Climbers + Safety Harness',
    durationMl: 'സുരക്ഷാ ബെൽറ്റ് ധരിച്ച വിദഗ്ദ്ധ തൊഴിലാളികൾ',
    rating: '4.9',
    image: '/Banners/coco.png',
    tagEn: 'Agriculture Care',
    tagMl: 'കാർഷിക പരിചരണം',
    highlightEn: 'Mechanical climbing, crown cleaning, beetle eradication, and coconut harvesting.',
    highlightMl: 'മെക്കാനിക്കൽ തെങ്ങുകയറ്റം, മണ്ട വൃത്തിയാക്കൽ, കൊമ്പൻചെല്ലി നിവാരണം, തേങ്ങയിടൽ.',
  },
  {
    id: 'poultry-farming',
    category: 'agriculture',
    titleEn: 'KK Commercial Poultry & Broiler Units',
    titleMl: 'ഹൈടെക് പോൾട്രി & കോഴി വളർത്തൽ യൂണിറ്റ്',
    locationEn: 'Kanhangad • Kasaragod • Nileshwar • Panathur',
    locationMl: 'കാഞ്ഞങ്ങാട് • കാസർഗോഡ് • നീലേശ്വരം • പാണത്തൂർ',
    towns: ['kanhangad', 'kasaragod', 'nileshwar', 'all'],
    durationEn: 'Bio-Secure Sheds + Climate Control',
    durationMl: 'ക്ലൈമറ്റ് കൺട്രോൾ ഷെഡ്ഡും ശാസ്ത്രീയ പരിചരണവും',
    rating: '4.9',
    image: '/images/chicken_poultry_farm.jpg',
    tagEn: 'Poultry & Livestock',
    tagMl: 'പോൾട്രി & കോഴിവളർത്തൽ',
    highlightEn: 'Commercial broiler & country bird rearing, automated feeding, nipple drinkers, and biosecure farm architecture.',
    highlightMl: 'വാണിജ്യ അടിസ്ഥാനത്തിലുള്ള ബ്രോയിലർ & നാടൻ കോഴി വളർത്തൽ, ഓട്ടോമേറ്റഡ് ഫീഡറുകൾ, രോഗവിമുക്ത ഷെഡ്ഡുകൾ.',
  },
  {
    id: 'feed-pellets',
    category: 'agriculture',
    titleEn: 'KK Premium Chicken Feed Pellets & Logistics',
    titleMl: 'പ്രീമിയം കോഴിത്തീറ്റ പെല്ലറ്റുകളും കടത്തും',
    locationEn: 'District-Wide Delivery • All North Kerala Hubs',
    locationMl: 'എല്ലാ വടക്കൻ കേരളാ കേന്ദ്രങ്ങളിലും മൊത്തവിതരണം',
    towns: ['kanhangad', 'kasaragod', 'nileshwar', 'cheruvathur', 'all'],
    durationEn: 'High-Protein Pellets + Aerated Transit Fleet',
    durationMl: 'ഉയർന്ന പ്രോട്ടീൻ പെല്ലറ്റുകളും സുരക്ഷിത ട്രാൻസ്‌പോർട്ടും',
    rating: '4.9',
    image: '/images/chicken_feed_pellets.jpg',
    tagEn: 'Poultry Nutrition',
    tagMl: 'പോൾട്രി തീറ്റ വിതരണം',
    highlightEn: 'Steam-extruded starter and finisher feed pellets with optimal FCR and live bird ventilated transport fleet.',
    highlightMl: 'മികച്ച FCR നൽകുന്ന കോഴിത്തീറ്റ പെല്ലറ്റുകൾ, വെന്റിലേറ്റഡ് ക്രേറ്റ് വാഹനങ്ങളിലുള്ള കോഴി കടത്ത്.',
  },
  {
    id: 'jcb',
    category: 'machinery',
    titleEn: 'JCB 3DX Heavy Excavation Fleet',
    titleMl: 'ജെസിബി മണ്ണെടുപ്പും നിരപ്പാക്കലും',
    locationEn: 'Kasaragod Town • Kumbla • Uppala • Udma',
    locationMl: 'കാസർഗോഡ് ടൗൺ • കുമ്പള • ഉപ്പള • ഉദുമ',
    towns: ['kasaragod', 'kumbla', 'uppala', 'udma', 'all'],
    durationEn: 'Modern JCB 3DX + Certified Machine Pilot',
    durationMl: 'പരിചയസമ്പന്നനായ പൈലറ്റോടുകൂടിയ JCB 3DX',
    rating: '4.9',
    image: '/Banners/jcb.png',
    tagEn: 'Heavy Machinery',
    tagMl: 'ഹെവി മെഷിനറി',
    highlightEn: 'Foundation trenching, plot leveling, boundary clearance, and bulk soil transport.',
    highlightMl: 'അടിത്തറ കുഴിയെടുക്കൽ, പുരയിടം നിരപ്പാക്കൽ, മണ്ണ് മാറ്റൽ, റോഡ് നിർമ്മാണം.',
  },
  {
    id: 'plastering',
    category: 'masonry',
    titleEn: 'Exterior & Interior Plastering Squads',
    titleMl: 'തേപ്പ് പണിയും കട്ടകെട്ടും (പ്ലാസ്റ്ററിംഗ്)',
    locationEn: 'Kanhangad • Bekal • Kasaragod • Chittarikkal',
    locationMl: 'കാഞ്ഞങ്ങാട് • ബേക്കൽ • കാസർഗോഡ് • ചിറ്റാരിക്കാൽ',
    towns: ['kanhangad', 'bekal', 'kasaragod', 'chittarikkal', 'all'],
    durationEn: 'Senior Master Masons & Helpers',
    durationMl: 'പ്രധാന മേസൺമാരും സഹായികളും അടങ്ങുന്ന ടീം',
    rating: '4.8',
    image: '/Banners/plastering.png',
    tagEn: 'Civil Masonry',
    tagMl: 'സിവിൽ നിർമ്മാണം',
    highlightEn: 'Smooth sponge plastering, AAC block masonry, and laser-straight wall rendering.',
    highlightMl: 'വീടുകൾക്കും കെട്ടിടങ്ങൾക്കും സ്മൂത്ത് പ്ലാസ്റ്ററിംഗ്, കട്ടകെട്ടൽ, സിമന്റ് ഫിനിഷിംഗ്.',
  },
  {
    id: 'painting',
    category: 'finishing',
    titleEn: 'Commercial & Residential Painting',
    titleMl: 'വീടും കെട്ടിടങ്ങളും പെയിന്റിംഗ് പണികൾ',
    locationEn: 'Kasaragod Town • Nileshwaram • Kanhangad • Uppala',
    locationMl: 'കാസർഗോഡ് ടൗൺ • നീലേശ്വരം • കാഞ്ഞങ്ങാട് • ഉപ്പള',
    towns: ['kasaragod', 'nileshwar', 'kanhangad', 'uppala', 'all'],
    durationEn: 'Airless Spray & Precision Roller Crew',
    durationMl: 'എയർലെസ്സ് സ്പ്രേ മെഷീനും റോളർ പെയിന്റിംഗും',
    rating: '4.9',
    image: '/Banners/painting.png',
    tagEn: 'Surface Finishing',
    tagMl: 'സർഫേസ് ഫിനിഷിംഗ്',
    highlightEn: 'Monsoon anti-fungal weatherproofing, luxury interior emulsions, and damp barrier priming.',
    highlightMl: 'മഴക്കാല ഈർപ്പ പ്രതിരോധ പെയിന്റിംഗ്, ഇന്റീരിയർ റോയൽ എമൽഷൻ, സ്പ്രേ പെയിന്റിംഗ്.',
  },
  {
    id: 'tile',
    category: 'finishing',
    titleEn: 'Tile, Marble & Granite Precision Laying',
    titleMl: 'ടൈൽ, മാർബിൾ & ഗ്രാനൈറ്റ് ഒട്ടിക്കൽ',
    locationEn: 'Bekal • Kanhangad • Kasaragod • Trikaripur',
    locationMl: 'ബേക്കൽ • കാഞ്ഞങ്ങാട് • കാസർഗോഡ് • തൃക്കരിപ്പൂർ',
    towns: ['bekal', 'kanhangad', 'kasaragod', 'trikaripur', 'kalnad', 'all'],
    durationEn: 'Master Tiler + Laser Leveling Equipment',
    durationMl: 'പ്രധാന ടൈൽ മേസ്തിരി + ലേസർ ലെവലർ സംവിധാനം',
    rating: '4.9',
    image: '/Banners/tiling.png',
    tagEn: 'Precision Flooring',
    tagMl: 'ടൈൽ & മാർബിൾ',
    highlightEn: 'Large-format porcelain slabs, Italian marble polishing, and stain-proof epoxy grouting.',
    highlightMl: 'ലാർജ് ഫോർമാറ്റ് ടൈലുകൾ, മാർബിൾ പോളിഷിംഗ്, എപോക്സി വാട്ടർപ്രൂഫ് ഗ്രൗട്ടിംഗ്.',
  },
  {
    id: 'electrical',
    category: 'utilities',
    titleEn: 'Industrial & Domestic Electrical MEP',
    titleMl: 'ഇലക്ട്രിക്കൽ വയറിംഗും ഫിറ്റിംഗും',
    locationEn: 'Kasaragod • Uppala • Manjeshwar • Kanhangad',
    locationMl: 'കാസർഗോഡ് • ഉപ്പള • മഞ്ചേശ്വരം • കാഞ്ഞങ്ങാട്',
    towns: ['kasaragod', 'uppala', 'manjeshwar', 'kanhangad', 'all'],
    durationEn: 'Licensed A/B Grade Electricians',
    durationMl: 'KSEB അംഗീകൃത ലൈസൻസുള്ള ഇലക്ട്രീഷ്യൻമാർ',
    rating: '4.8',
    image: '/Banners/electrical.png',
    tagEn: 'Licensed MEP',
    tagMl: 'ലൈസൻസ്ഡ് ഇലക്ട്രിക്കൽ',
    highlightEn: '3-phase commercial DB panels, residential conduit wiring, inverters, and lighting automation.',
    highlightMl: '3-ഫേസ് പാനൽ ബോർഡ്, ഗാർഹിക വയറിംഗ്, ഇൻവെർട്ടർ & സോളാർ കണക്ഷനുകൾ.',
  },
  {
    id: 'plumbing',
    category: 'utilities',
    titleEn: 'Pipeline Trenching & Sanitary Plumbing',
    titleMl: 'പ്ലംബിംഗ് & പൈപ്പ് ലൈൻ പണികൾ',
    locationEn: 'Nileshwaram • Kasaragod Town • Kanhangad • Cheruvathur',
    locationMl: 'നീലേശ്വരം • കാസർഗോഡ് ടൗൺ • കാഞ്ഞങ്ങാട് • ചെറുവത്തൂർ',
    towns: ['nileshwar', 'kasaragod', 'kanhangad', 'cheruvathur', 'all'],
    durationEn: 'Master Plumbers + Trenching Crew',
    durationMl: 'പ്രധാന പ്ലംബർ + ട്രെഞ്ചിംഗ് സഹായികൾ',
    rating: '4.9',
    image: '/Banners/plumbing.png',
    tagEn: 'Infrastructure MEP',
    tagMl: 'പ്ലംബിംഗ് & ഡ്രെയിനേജ്',
    highlightEn: 'Septic lines, UPVC/CPVC high-pressure water supply, multi-story drainage, and pumps.',
    highlightMl: 'ഭൂഗർഭ പൈപ്പ് ലൈൻ, സെപ്റ്റിക് ടാങ്ക് കണക്ഷൻ, ഡ്രെയിനേജ് ട്രെഞ്ചുകൾ, പമ്പ് ഫിറ്റിംഗ്.',
  },
  {
    id: 'borewell',
    category: 'utilities',
    titleEn: 'Precision Borewell Drilling & Water Survey',
    titleMl: 'കുഴൽക്കിണർ നിർമ്മാണവും വെള്ളം കണ്ടെത്തലും',
    locationEn: 'Vellarikundu • Panathur • Badiyadka • Kasaragod',
    locationMl: 'വെള്ളരിക്കുണ്ട് • പനത്തൂർ • ബദിയടുക്ക • കാസർഗോഡ്',
    towns: ['vellarikundu', 'panathur', 'badiyadka', 'bandadka', 'kasaragod', 'all'],
    durationEn: 'High-Pressure Rotary Rig & Hydro-Geologist',
    durationMl: 'ഹൈഡ്രോളിക് റോട്ടറി റിഗ് + ജിയോളജിസ്റ്റ് സംഘം',
    rating: '4.9',
    image: '/Banners/borewell.png',
    tagEn: 'Water Engineering',
    tagMl: 'വാട്ടർ എൻജിനീയറിംഗ്',
    highlightEn: 'Geophysical aquifer mapping, deep rock hydraulic rotary drilling, and PVC casing pipes.',
    highlightMl: 'ശാസ്ത്രീയ ഭൂഗർഭ ജല പരിശോധന, കരിമ്പാറകളിലും ശക്തമായ ഡ്രില്ലിംഗ് റിഗ്ഗുകൾ.',
  },
];

const KASARAGOD_TOWNS = [
  { id: 'all', nameEn: 'All Kasaragod District', nameMl: 'എല്ലാ പ്രദേശങ്ങളും' },
  { id: 'kanhangad', nameEn: 'Kanhangad (കാഞ്ഞങ്ങാട്)', nameMl: 'കാഞ്ഞങ്ങാട്' },
  { id: 'kasaragod', nameEn: 'Kasaragod Town (കാസർഗോഡ്)', nameMl: 'കാസർഗോഡ് ടൗൺ' },
  { id: 'nileshwar', nameEn: 'Nileshwar (നീലേശ്വരം)', nameMl: 'നീലേശ്വരം' },
  { id: 'uppala', nameEn: 'Uppala (ഉപ്പള)', nameMl: 'ഉപ്പള' },
  { id: 'bekal', nameEn: 'Bekal (ബേക്കൽ)', nameMl: 'ബേക്കൽ' },
  { id: 'cheruvathur', nameEn: 'Cheruvathur (ചെറുവത്തൂർ)', nameMl: 'ചെറുവത്തൂർ' },
  { id: 'manjeshwar', nameEn: 'Manjeshwar (മഞ്ചേശ്വരം)', nameMl: 'മഞ്ചേശ്വരം' },
  { id: 'trikaripur', nameEn: 'Trikaripur (തൃക്കരിപ്പൂർ)', nameMl: 'തൃക്കരിപ്പൂർ' },
  { id: 'vellarikundu', nameEn: 'Vellarikundu (വെള്ളരിക്കുണ്ട്)', nameMl: 'വെള്ളരിക്കുണ്ട്' },
  { id: 'badiyadka', nameEn: 'Badiyadka (ബദിയടുക്ക)', nameMl: 'ബദിയടുക്ക' },
  { id: 'kumbla', nameEn: 'Kumbla (കുമ്പള)', nameMl: 'കുമ്പള' },
];

interface PopularPackagesSectionProps {
  onSelectPackage?: (packageName: string) => void;
}

export function PopularPackagesSection({ onSelectPackage }: PopularPackagesSectionProps) {
  const { language } = useLanguage();
  const t = translations[language].popularPackages;

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedTown, setSelectedTown] = useState<string>('all');

  const filteredServices = KASARAGOD_SERVICES.filter((svc) => {
    const matchesCategory =
      activeCategory === 'all' ||
      svc.category === activeCategory ||
      svc.id === activeCategory;

    const matchesTown =
      selectedTown === 'all' ||
      svc.towns.includes(selectedTown);

    return matchesCategory && matchesTown;
  });

  return (
    <section className="w-full relative py-16 lg:py-24 bg-white text-[#0F172A] overflow-hidden selection:bg-[#2A835F] selection:text-white">
      {/* Subtle Ambient Emerald Glow in Background */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#EBF6F1]/60 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-10 left-0 w-[450px] h-[450px] bg-[#2A835F]/5 rounded-full blur-[100px] pointer-events-none z-0" />

      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10 flex flex-col gap-10 lg:gap-14">
        {/* ========================================================
            1. SECTION HEADER: Kasaragod District Pride
        ======================================================== */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-slate-100">
          <div className="flex flex-col">
            {/* Sparkle Badge */}
            <div className="inline-flex items-center gap-2 text-xs font-black tracking-widest text-[#2A835F] uppercase mb-2">
              <svg viewBox="0 0 24 24" fill="#2A835F" className="w-4 h-4 text-[#2A835F] shrink-0">
                <path d="M12 0L14.7 9.3L24 12L14.7 14.7L12 24L9.3 14.7L0 12L9.3 9.3L12 0Z" />
              </svg>
              <span>{t.badge}</span>
            </div>

            {/* Main Headline */}
            <h2
              className={`font-black text-[#0F172A] tracking-tight uppercase ${
                language === 'ml'
                  ? 'text-2xl sm:text-4xl lg:text-[42px] leading-tight'
                  : 'text-3xl sm:text-5xl lg:text-[48px] leading-[1.05]'
              }`}
              style={{
                fontFamily:
                  language === 'ml' ? 'var(--font-anek-malayalam)' : undefined,
              }}
            >
              {t.headline}
            </h2>

            {/* Subtitle */}
            <p className="text-slate-600 font-semibold text-xs sm:text-sm lg:text-base max-w-2xl mt-2 leading-relaxed">
              {t.description}
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 bg-[#EBF6F1] border border-[#C3E6D5] rounded-2xl p-3 px-5 w-fit shrink-0 shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2A835F] animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[11px] font-black uppercase text-[#2A835F] tracking-wider">
                {language === 'ml' ? 'കാസർഗോഡ് തത്സമയ വിന്യാസം' : 'Kasaragod Live Fleet'}
              </span>
              <span className="text-xs font-extrabold text-slate-800">
                {language === 'ml'
                  ? '4 താലൂക്കുകളിലും സജീവം'
                  : 'All 4 Taluks Active'}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================
            2. FILTER CONTROLS: Category Tabs + Kasaragod Town Selector
        ======================================================== */}
        <div className="flex flex-col gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: 'all', label: language === 'ml' ? 'എല്ലാ സേവനങ്ങളും (8)' : 'All Services (8)' },
              { id: 'agriculture', label: language === 'ml' ? 'തെങ്ങുകയറ്റം (കൊക്കോ കെയർ)' : 'Palm Care (Cococare)' },
              { id: 'machinery', label: language === 'ml' ? 'ജെസിബി & മണ്ണുമാന്തി' : 'JCB & Earthmoving' },
              { id: 'masonry', label: language === 'ml' ? 'പ്ലാസ്റ്ററിംഗ് & കട്ടകെട്ട്' : 'Plastering & Masonry' },
              { id: 'finishing', label: language === 'ml' ? 'ടൈൽ, മാർബിൾ & പെയിന്റിംഗ്' : 'Tiles & Painting' },
              { id: 'utilities', label: language === 'ml' ? 'പ്ലംബിംഗ്, ഇലക്ട്രിക്കൽ, ബോർവെൽ' : 'MEP & Borewell' },
            ].map((tab) => {
              const isSelected = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-4 sm:px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#2A835F] text-white shadow-md shadow-[#2A835F]/20 ring-2 ring-[#2A835F]/30'
                      : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Quick Town Filter Bar */}
          <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <MapPin className="w-4 h-4 text-[#2A835F] shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                {language === 'ml' ? 'കാസർഗോട്ടെ പ്രദേശം തിരഞ്ഞെടുക്കൂ:' : 'Filter by Kasaragod Area:'}
              </span>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto flex-1 max-w-md">
              <select
                value={selectedTown}
                onChange={(e) => setSelectedTown(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#2A835F] cursor-pointer"
              >
                {KASARAGOD_TOWNS.map((town) => (
                  <option key={town.id} value={town.id}>
                    {language === 'ml' ? town.nameMl : town.nameEn}
                  </option>
                ))}
              </select>

              {selectedTown !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedTown('all')}
                  className="text-[11px] font-bold text-[#2A835F] hover:underline whitespace-nowrap px-2"
                >
                  {language === 'ml' ? 'റീസെറ്റ്' : 'Reset'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================
            3. ALL KASARAGOD SERVICES BENTO GRID (Zero Price Tags)
        ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredServices.map((svc) => {
            const title = language === 'ml' ? svc.titleMl : svc.titleEn;
            const location = language === 'ml' ? svc.locationMl : svc.locationEn;
            const duration = language === 'ml' ? svc.durationMl : svc.durationEn;
            const tag = language === 'ml' ? svc.tagMl : svc.tagEn;
            const highlight = language === 'ml' ? svc.highlightMl : svc.highlightEn;

            return (
              <div
                key={svc.id}
                className="bg-white rounded-[28px] sm:rounded-[32px] border-2 border-slate-200/80 overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5"
              >
                {/* Card Image Stage with Banners Photo */}
                <div className="relative w-full h-48 overflow-hidden bg-slate-900">
                  <img
                    src={svc.image}
                    alt={title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                    <span className="bg-white/95 backdrop-blur-md text-[#2A835F] px-2.5 py-1 rounded-full text-[11px] font-extrabold shadow-sm">
                      {tag}
                    </span>
                    <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-[11px] font-bold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{svc.rating}</span>
                    </div>
                  </div>

                  {/* Bottom Kasaragod Location Tag */}
                  <div className="absolute bottom-2.5 left-3 right-3 text-white">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-[#A3E5C7] shrink-0" />
                      <span className="text-[11px] font-bold text-white/95 truncate">
                        {location}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Content Stage */}
                <div className="p-5 flex flex-col justify-between flex-1 gap-4">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug group-hover:text-[#2A835F] transition-colors">
                      {title}
                    </h3>

                    <p className="text-xs font-medium text-slate-600 line-clamp-2 leading-relaxed">
                      {highlight}
                    </p>

                    <div className="flex items-center gap-2 mt-1 text-[11px] font-semibold text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <Clock className="w-3.5 h-3.5 text-[#2A835F] shrink-0" />
                      <span className="truncate">{duration}</span>
                    </div>
                  </div>

                  {/* Action CTA Button (No Prices, Direct Service Booking) */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-[#2A835F] uppercase tracking-wider">
                      {language === 'ml' ? 'കാസർഗോഡ് ലഭ്യം' : 'Kasaragod Wide'}
                    </span>

                    <button
                      type="button"
                      onClick={() => onSelectPackage?.(title)}
                      className="bg-[#0F172A] group-hover:bg-[#2A835F] text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      <span>{t.reserveBtn}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ========================================================
            4. FOUR PERKS BANNER (Emerald Tints & Clean Vectors)
        ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {[
            {
              icon: ShieldCheck,
              title: t.features.f1Title,
              desc: t.features.f1Desc,
            },
            {
              icon: Clock,
              title: t.features.f2Title,
              desc: t.features.f2Desc,
            },
            {
              icon: CheckCircle2,
              title: t.features.f3Title,
              desc: t.features.f3Desc,
            },
            {
              icon: Briefcase,
              title: t.features.f4Title,
              desc: t.features.f4Desc,
            },
          ].map((f, idx) => {
            const IconComponent = f.icon;
            return (
              <div
                key={idx}
                className="bg-[#F7FCF9] border border-[#C3E6D5] rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EBF6F1] flex items-center justify-center shrink-0 border border-[#C3E6D5]/60">
                  <IconComponent className="w-5 h-5 text-[#2A835F]" />
                </div>
                <div className="flex flex-col">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                    {f.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-1 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
