'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  Layers,
  CheckCircle2,
  Activity,
  Award,
  ThermometerSnowflake,
  Wheat,
  TrendingUp,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '@/context/language-context';

export function PoultryFarmingSection() {
  const { language } = useLanguage();
  const isMl = language === 'ml';

  const poultryFeatures = [
    {
      id: 'farming',
      badgeEn: 'Bio-Secure Rearing',
      badgeMl: 'അത്യാധുനിക ഫാം',
      titleEn: 'Commercial High-Tech Poultry Farming',
      titleMl: 'വാണിജ്യ അടിസ്ഥാനത്തിലുള്ള ബ്രോയിലർ & നാടൻ കോഴി വളർത്തൽ',
      descEn:
        'State-of-the-art climate-controlled shed architecture equipped with automated pan feeding, nipple drinking pipelines, evaporative cooling pads, and strict veterinary disease prevention protocols.',
      descMl:
        'ഓട്ടോമേറ്റഡ് ഫീഡിംഗ്, നിപ്പിൾ വാട്ടർ സിസ്റ്റം, ക്ലൈമറ്റ് കൺട്രോൾ ഫാനുകൾ എന്നിവയോടുകൂടിയ രോഗവിമുക്തമായ ഹൈടെക് ബ്രോയിലർ ഫാം സംവിധാനം.',
      image: '/images/chicken_poultry_farm.jpg',
      metrics: [
        { labelEn: 'Annual Capacity', labelMl: 'വാർഷിക ഉൽപ്പാദനം', value: '150,000+ Birds' },
        { labelEn: 'Biosecurity Grade', labelMl: 'ബയോ-സെക്യൂരിറ്റി', value: 'Grade A Zero-Infection' },
      ],
      pointsEn: [
        'Automated temperature & humidity management',
        'Balanced natural light cycles and sanitized deep litter bed',
        'Daily veterinary checks and weight progression monitoring',
      ],
      pointsMl: [
        'കൃത്യമായ താപനിലയും വായുസഞ്ചാരവും ഉറപ്പാക്കുന്ന ഷെഡ്ഡുകൾ',
        'ദിവസേനയുള്ള വെറ്റിനറി പരിശോധനയും ആരോഗ്യ സംരക്ഷണവും',
        'ശുചിത്വമുള്ള ഓർഗാനിക് ലിറ്റർ സംസ്കരണ സംവിധാനം',
      ],
    },
    {
      id: 'feed',
      badgeEn: 'Nutritional Feed Mill',
      badgeMl: 'പ്രീമിയം തീറ്റ പെല്ലറ്റുകൾ',
      titleEn: 'High-Protein Nutritional Chicken Feed Pellets',
      titleMl: 'ശാസ്ത്രീയമായി തയ്യാറാക്കിയ കോഴിത്തീറ്റ പെല്ലറ്റുകൾ',
      descEn:
        'Premium extruded pelletized poultry feed manufactured with steam conditioning. Balanced formulations for Pre-Starter, Starter, and Finisher stages with fortified amino acids, essential vitamins, and zero harmful growth additives.',
      descMl:
        'പ്രീ-സ്റ്റാർട്ടർ, സ്റ്റാർട്ടർ, ഫിനിഷർ ഘട്ടങ്ങൾക്കനുയോജ്യമായ പ്രോട്ടീൻ സമ്പുഷ്ടമായ തീറ്റ പെല്ലറ്റുകൾ. മികച്ച FCR നിരക്കും വേഗത്തിലുള്ള ആരോഗ്യകരമായ വളർച്ചയും.',
      image: '/images/chicken_feed_pellets.jpg',
      metrics: [
        { labelEn: 'Daily Output', labelMl: 'പ്രതിദിന ഉത്പാദനം', value: '25+ Metric Tons' },
        { labelEn: 'Protein Density', labelMl: 'പ്രോട്ടീൻ സാന്ദ്രത', value: '18% - 22% CP' },
      ],
      pointsEn: [
        'Optimum Feed Conversion Ratio (FCR < 1.55)',
        'Extruded pellets preventing feed wastage & dust inhalation',
        'Fortified with Lysine, Methionine, Vitamin Premixes & Calcium',
      ],
      pointsMl: [
        'തീറ്റ പാഴാകാതിരിക്കാൻ സഹായിക്കുന്ന ഗുണമേന്മയുള്ള പെല്ലറ്റുകൾ',
        'രോഗപ്രതിരോധശേഷി വർദ്ധിപ്പിക്കുന്ന വിറ്റാമിനുകളും ധാതുക്കളും',
        'കേരളത്തിലെവിടെയും വിശ്വസ്തമായ മൊത്തവിതരണം',
      ],
    },
    {
      id: 'transport',
      badgeEn: 'Logistics Fleet',
      badgeMl: 'സുരക്ഷിത ട്രാൻസ്‌പോർട്ട്',
      titleEn: 'Specialized Ventilated Live Bird Transport Fleet',
      titleMl: 'ശീതികരിച്ച എയറേറ്റഡ് കോഴി കടത്ത് & ലൈവ് ട്രാൻസ്‌പോർട്ട്',
      descEn:
        'Dedicated fleet of custom-fabricated transport vehicles featuring perforated high-aeration crates, heat-dissipating bodies, and GPS telemetry for stress-free rapid distribution across Kerala districts.',
      descMl:
        'പ്രത്യേകം തയ്യാറാക്കിയ സുഷിരങ്ങളുള്ള ക്രേറ്റുകളും വായുസഞ്ചാരവുമുള്ള അത്യാധുനിക ട്രാൻസ്‌പോർട്ട് വാഹനങ്ങൾ. ക്ഷീണമില്ലാതെ വേഗത്തിലുള്ള സംസ്ഥാനതല വിതരണം.',
      image: '/images/chicken_transport_truck.jpg',
      metrics: [
        { labelEn: 'Network Coverage', labelMl: 'സർവീസ് പരിധി', value: '14 Kerala Districts' },
        { labelEn: 'Transit Transit Rate', labelMl: 'സുരക്ഷിത കടത്ത്', value: '99.8% Stress-Free' },
      ],
      pointsEn: [
        'Continuous ambient airflow design preventing bird mortality',
        'Prompt early-morning farm-to-destination scheduled dispatches',
        'Strict vehicle sanitization & disinfectant wash between every trip',
      ],
      pointsMl: [
        'മരണനിരക്ക് കുറയ്ക്കുന്ന ശാസ്ത്രീയ എയർ-ഫ്ലോ രൂപകൽപ്പന',
        'കൃത്യസമയത്ത് ഫാമുകളിൽ നിന്ന് ലക്ഷ്യസ്ഥാനങ്ങളിലേക്ക് എത്തിക്കൽ',
        'ഓരോ ട്രിപ്പിലും വാഹനങ്ങൾ അണുവിമുക്തമാക്കുന്ന രീതി',
      ],
    },
  ];

  return (
    <section className="w-full py-16 sm:py-24 bg-gradient-to-b from-white via-[#F8FAF9] to-white relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-[#2A835F]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EBF6F1] border border-[#C3E6D5] text-[#2A835F] text-xs font-black uppercase tracking-wider mb-3.5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#2A835F]" />
            <span>
              {isMl
                ? 'കെ.കെ അഗ്രോ & പോൾട്രി ഡിവിഷൻ'
                : 'KK AGRO & COMMERCIAL POULTRY DIVISION'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {isMl
              ? 'അത്യാധുനിക കോഴി വളർത്തൽ, പ്രീമിയം തീറ്റ പെല്ലറ്റുകൾ & സുരക്ഷിത ട്രാൻസ്‌പോർട്ട്'
              : 'Commercial Poultry Farming, High-Protein Feed Pellets & Bio-Secure Logistics'}
          </h2>

          <p className="mt-3.5 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
            {isMl
              ? 'കേരളത്തിലെ കാർഷിക-പോൾട്രി മേഖലയിൽ വർഷങ്ങളുടെ പാരമ്പര്യമുള്ള കെ.കെ ഗ്രൂപ്പ്, അത്യാധുനിക സാങ്കേതികവിദ്യയും ഉയർന്ന നിലവാരമുള്ള തീറ്റയും സജ്ജമാക്കി രോഗവിമുക്തമായ കോഴി വളർത്തലും വിതരണവും നിർവ്വഹിക്കുന്നു.'
              : 'KK Group pioneers modern scientific poultry operations across Kerala — combining automated biosecure shed architecture, high-protein extruded feed pellets, and temperature-controlled live bird transit networks.'}
          </p>
        </div>

        {/* 3 Pillars Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {poultryFeatures.map((item, index) => (
            <div
              key={item.id}
              className="group bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-[#2A835F]/40 transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* Image Frame */}
              <div className="relative w-full h-56 sm:h-64 overflow-hidden bg-slate-900">
                <img
                  src={item.image}
                  alt={isMl ? item.titleMl : item.titleEn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/10" />

                {/* Floating Top Badge */}
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-900 text-[11px] font-black tracking-wide border border-white/40 shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2A835F]" />
                    {isMl ? item.badgeMl : item.badgeEn}
                  </span>
                </div>

                {/* Metrics Pill on bottom of image */}
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between gap-2 text-white">
                  {item.metrics.map((m, mIdx) => (
                    <div
                      key={mIdx}
                      className="px-2.5 py-1 rounded-xl bg-black/45 backdrop-blur-md border border-white/15 text-[10.5px]"
                    >
                      <span className="text-emerald-300 font-bold block">{m.value}</span>
                      <span className="text-slate-300 text-[9.5px]">
                        {isMl ? m.labelMl : m.labelEn}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-[#2A835F] transition-colors leading-snug">
                    {isMl ? item.titleMl : item.titleEn}
                  </h3>

                  <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {isMl ? item.descMl : item.descEn}
                  </p>

                  {/* Bullet Highlights */}
                  <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                    {(isMl ? item.pointsMl : item.pointsEn).map((point, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-[#2A835F] shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card Footer Link */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">
                    {isMl ? 'കെ.കെ പോൾട്രി നിലവാരം' : 'KK Agro Standard'}
                  </span>
                  <Link
                    href="/services"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2A835F] group-hover:text-emerald-700 transition-colors"
                  >
                    <span>{isMl ? 'വിശദാംശങ്ങൾ കാണുക' : 'Explore Division'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Turnkey Farm Setup & Infrastructure Banner */}
        <div className="mt-10 sm:mt-12 bg-gradient-to-r from-slate-900 via-[#101F18] to-slate-950 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-xl border border-slate-800">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-[#2A835F]/20 to-transparent pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-center relative z-10">
            <div className="lg:col-span-2 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2A835F]/20 border border-[#2A835F]/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Wheat className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {isMl ? 'ടേൺകീ പോൾട്രി ഫാം നിർമ്മാണം' : 'Turnkey Poultry Farm Engineering & Supply'}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                {isMl
                  ? 'നിങ്ങളുടെ പുരയിടത്തിലോ തോട്ടങ്ങളിലോ ഹൈടെക് പോൾട്രി ഫാം ആരംഭിക്കണോ?'
                  : 'Looking to set up a Modern Climate-Controlled Commercial Poultry Unit?'}
              </h3>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
                {isMl
                  ? 'സ്റ്റീൽ ട്രസ്സ് ഷെഡ് നിർമ്മാണം, ഓട്ടോമേറ്റഡ് ഫീഡറുകൾ, നിപ്പിൾ ഡ്രിങ്കറുകൾ, പെല്ലറ്റ് ഫീഡ് സ്റ്റോറേജ്, വായുസഞ്ചാര സംവിധാനങ്ങൾ എന്നിവയെല്ലാം ഒരൊറ്റ കുടക്കീഴിൽ കെ.കെ ഗ്രൂപ്പ് പൂർത്തിയാക്കുന്നു.'
                  : 'From structural steel truss sheds, exhaust ventilation, and cooling pads to bulk feed delivery and livestock transit logistics — KK Group provides complete commercial infrastructure across Kerala.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 justify-end lg:items-end">
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#2A835F] hover:bg-[#236D4F] text-white text-xs sm:text-sm font-bold shadow-lg shadow-[#2A835F]/30 transition-all text-center"
              >
                <span>{isMl ? 'പോൾട്രി സേവനങ്ങൾ കാണുക' : 'View Poultry Services'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/projects"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs sm:text-sm font-semibold transition-all text-center"
              >
                <span>{isMl ? 'വിജയകരമായ ഫാം പ്രൊജക്റ്റുകൾ' : 'Completed Farm Setups'}</span>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
