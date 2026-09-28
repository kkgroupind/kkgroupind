'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  MapPin,
  Clock,
  CheckCircle2,
  Sparkles,
  Layers,
  ChevronRight,
  Activity,
  Award,
} from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { translations } from '@/utils/translations';

interface CosmicConnectionsSectionProps {
  onOpenEnquiry?: (serviceName?: string) => void;
}

export function CosmicConnectionsSection({ onOpenEnquiry }: CosmicConnectionsSectionProps) {
  const { language } = useLanguage();
  const t = translations[language].cosmic;

  const [activeDivision, setActiveDivision] = useState<'malabar' | 'central' | 'south'>('central');

  const DIVISIONS = [
    {
      id: 'malabar',
      name: t.planets.jupiter,
      desc: t.planets.jupiterDesc,
      districts: 'Kanhangad • Nileshwar • Bekal • Cheruvathur • Trikaripur • Udma',
      activeSquads: '180+ Squads',
      leadTime: '15-Min Dispatch / 1-2h Arrival',
      image: '/Banners/coco.png',
      badge: language === 'ml' ? 'ഹോസ്ദുർഗ് & തെക്കൻ തീരദേശ ഹബ്ബ്' : 'Hosdurg Coastal & Agro Division',
    },
    {
      id: 'central',
      name: t.planets.mars,
      desc:
        language === 'ml'
          ? 'കാസർഗോഡ് ടൗൺ, കുമ്പള, കളനാട്, ചെമ്മനാട് സെൻട്രൽ ഇൻഫ്രാസ്ട്രക്ചർ കോറിഡോർ.'
          : 'Kasaragod Town, Kumbla, Kalnad & Chemnad central commercial fleet corridor.',
      districts: 'Kasaragod Town • Kumbla • Chemnad • Kalnad • Periye',
      activeSquads: '220+ Squads',
      leadTime: '15-Min Dispatch Notice',
      image: '/Banners/jcb.png',
      badge: language === 'ml' ? 'കാസർഗോഡ് ടൗൺ സെൻട്രൽ ഫ്ലീറ്റ് ഹബ്ബ്' : 'Kasaragod Town Central Fleet Hub',
    },
    {
      id: 'south',
      name: t.planets.neptune,
      desc: t.planets.neptuneDesc,
      districts: 'Manjeshwar • Uppala • Vellarikundu • Chittarikkal • Panathur',
      activeSquads: '150+ Squads',
      leadTime: '15-Min Dispatch / Rapid Arrival',
      image: '/Banners/borewell.png',
      badge: language === 'ml' ? 'വടക്കൻ & മലയോര കാർഷിക ഡിവിഷൻ' : 'Northern & Highland Agro Division',
    },
  ];

  const currentDiv = DIVISIONS.find((d) => d.id === activeDivision) || DIVISIONS[1];

  return (
    <section className="w-full relative py-14 lg:py-20 bg-white text-[#0F172A] overflow-hidden selection:bg-[#2A835F] selection:text-white">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10 flex flex-col gap-10 lg:gap-14">
        {/* ========================================================
            MAIN BENTO CHASSIS (Dark Cinematic Slate Matching Hero)
        ======================================================== */}
        <div className="w-full bg-slate-950 rounded-[36px] sm:rounded-[48px] md:rounded-[56px] relative overflow-hidden p-6 sm:p-10 lg:p-14 text-white shadow-2xl border border-slate-800/40">
          {/* Background Ambient Imagery with Cinematic Dark Gradients & Cross-fade */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            {DIVISIONS.map((div) => (
              <img
                key={div.id}
                src={div.image}
                alt={div.name}
                className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out ${
                  activeDivision === div.id
                    ? 'opacity-85 scale-100'
                    : 'opacity-0 scale-105 pointer-events-none'
                }`}
              />
            ))}

            {/* Cinematic Gradient Overlays tailored for readability and vivid background visibility */}
            {/* Desktop: Horizontal gradient shielding left text while revealing the vibrant site on the right */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/65 to-slate-950/25 hidden lg:block" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-slate-950/30 hidden lg:block" />
            {/* Mobile / Tablet: Balanced vertical gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/95 via-slate-950/70 to-slate-950/85 lg:hidden block" />

            {/* Subtle Brand Green Ambient Glow Accent */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#2A835F]/20 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Bento Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            {/* ----------------------------------------------------
                LEFT COLUMN: Network Kicker, Headline, Stats, CTA
            ---------------------------------------------------- */}
            <div className="lg:col-span-7 flex flex-col justify-between z-10">
              <div>
                {/* Network Kicker with 4-Pointed Sparkle Star */}
                <div className="inline-flex items-center gap-2 text-xs font-black tracking-widest text-[#2A835F] uppercase mb-3 sm:mb-4 bg-[#EBF6F1]/10 backdrop-blur-md px-3 py-1 rounded-full border border-[#2A835F]/30 w-fit">
                  <svg viewBox="0 0 24 24" fill="#2A835F" className="w-3.5 h-3.5 text-[#2A835F]">
                    <path d="M12 0L14.7 9.3L24 12L14.7 14.7L12 24L9.3 14.7L0 12L9.3 9.3L12 0Z" />
                  </svg>
                  <span>{t.kicker}</span>
                </div>

                {/* Big Bold Headline */}
                <h2
                  className={`text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.12] tracking-tight uppercase max-w-2xl ${
                    language === 'ml' ? 'leading-tight' : ''
                  }`}
                  style={{
                    fontFamily:
                      language === 'ml' ? 'var(--font-anek-malayalam)' : undefined,
                  }}
                >
                  {t.headlinePart1} <span className="text-[#2A835F]">{t.headlinePart2}</span>{' '}
                  {t.headlinePart3}
                </h2>

                {/* Subtitle Description */}
                <p className="text-slate-300 text-xs sm:text-sm lg:text-base font-medium leading-relaxed max-w-xl mt-4 mb-6">
                  {t.description}
                </p>

                {/* Operational Highlights Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                  <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 px-4 flex flex-col">
                    <span className="text-xl sm:text-2xl font-black text-[#2A835F]">500+</span>
                    <span className="text-[11px] font-bold text-slate-300">
                      {language === 'ml' ? 'സജീവ തൊഴിലാളികൾ' : 'Active Operatives'}
                    </span>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 px-4 flex flex-col">
                    <span className="text-xl sm:text-2xl font-black text-[#2A835F]">14</span>
                    <span className="text-[11px] font-bold text-slate-300">
                      {language === 'ml' ? 'ജില്ലകൾ ഉൾക്കൊള്ളുന്നു' : 'Districts Covered'}
                    </span>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 px-4 flex flex-col col-span-2 sm:col-span-1">
                    <span className="text-xl sm:text-2xl font-black text-[#2A835F]">15 Min</span>
                    <span className="text-[11px] font-bold text-slate-300">
                      {language === 'ml' ? 'ഡിസ്പാച്ച് സ്ഥിരീകരണം' : 'Dispatch Notice'}
                    </span>
                  </div>
                </div>

                {/* CTA Action Button */}
                <button
                  type="button"
                  onClick={() => onOpenEnquiry?.('Regional Fleet Deployment')}
                  className="bg-[#2A835F] hover:bg-[#236D4F] text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-wider inline-flex items-center gap-3 shadow-xl hover:shadow-2xl transition-all active:scale-95 cursor-pointer"
                >
                  <span>{t.discoverMore}</span>
                  <div className="w-6 h-6 rounded-full border border-white/30 flex items-center justify-center">
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </div>
                </button>
              </div>
            </div>

            {/* ----------------------------------------------------
                RIGHT COLUMN: Regional Division Selector & Live Hub Card
            ---------------------------------------------------- */}
            <div className="lg:col-span-5 flex flex-col gap-4 z-10">
              {/* Selector Tabs */}
              <div className="flex items-center gap-2 p-1.5 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl">
                {[
                  { id: 'malabar', label: language === 'ml' ? 'മലബാർ' : 'Malabar' },
                  { id: 'central', label: language === 'ml' ? 'മധ്യകേരളം' : 'Central' },
                  { id: 'south', label: language === 'ml' ? 'തെക്കൻ' : 'South' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveDivision(tab.id as any)}
                    className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      activeDivision === tab.id
                        ? 'bg-[#2A835F] text-white shadow-md'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Division Detail Glass Card */}
              <div className="bg-white/95 backdrop-blur-2xl rounded-3xl p-6 border-2 border-white/80 text-slate-800 shadow-2xl flex flex-col justify-between gap-5">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#2A835F] animate-pulse" />
                      <span className="text-[11px] font-black uppercase tracking-wider text-[#2A835F]">
                        {language === 'ml' ? 'സജീവ ഡിവിഷൻ' : 'Active Division'}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-black bg-[#EBF6F1] text-[#2A835F] px-2.5 py-0.5 rounded-full">
                      {currentDiv.activeSquads}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 mt-3">
                    {currentDiv.name}
                  </h3>
                  <p className="text-xs font-semibold text-slate-600 mt-1 leading-relaxed">
                    {currentDiv.desc}
                  </p>

                  <div className="mt-4 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-[#2A835F] shrink-0" />
                    <span className="text-xs font-bold text-slate-700 truncate">
                      {currentDiv.districts}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-[#2A835F]" />
                    <span>{currentDiv.leadTime}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenEnquiry?.(currentDiv.name)}
                    className="bg-[#2A835F] hover:bg-[#236D4F] text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-md"
                  >
                    <span>{language === 'ml' ? 'ബുക്ക് ചെയ്യുക' : 'Deploy Here'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
