'use client';

import React from 'react';
import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { translations } from '@/utils/translations';
import { SettingsService, SiteSettings } from '@/services/settings.service';

export function Footer() {
  const { language } = useLanguage();
  const t = translations[language].footer;
  const [siteSettings, setSiteSettings] = React.useState<SiteSettings | null>(null);

  React.useEffect(() => {
    SettingsService.getPublicSettings().then(setSiteSettings).catch(() => {});
  }, []);

  return (
    <div className="w-full bg-white">
      <footer className="w-full relative bg-slate-950 text-white overflow-hidden rounded-t-[40px] sm:rounded-t-[56px] lg:rounded-t-[64px] border-t-2 border-slate-850 shadow-[0_-25px_60px_-15px_rgba(0,0,0,0.3)] selection:bg-[#2A835F] selection:text-white pt-14 lg:pt-20 pb-12">
        {/* Top Edge Ambient Curved Accent */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#2A835F]/50 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[180px] bg-[#2A835F]/10 blur-[120px] pointer-events-none" />

        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10 flex flex-col gap-12 lg:gap-16">
          {/* ========================================================
              1. MASTER BRANDING & DIRECTORY NAVIGATION
          ======================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
            {/* Brand Info */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <Link href="/" className="inline-block">
                <img
                  src="/logos/named-logo-bg.png"
                  alt="KK Group Logo"
                  className="h-9 sm:h-10 w-auto object-contain brightness-110"
                />
              </Link>

              <p className="text-xs sm:text-sm text-slate-400 font-normal leading-relaxed max-w-sm">
                {t.blurb}
              </p>

              <div className="flex flex-col gap-2.5 pt-2 text-xs font-semibold text-slate-300">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#EBF6F1]/10 flex items-center justify-center text-[#2A835F] shrink-0 border border-[#2A835F]/20">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <a
                    href={`tel:${(siteSettings?.contactPhone || '+919447012345').replace(/\s+/g, '')}`}
                    className="hover:text-emerald-400 transition-colors"
                  >
                    {siteSettings?.contactPhone || t.operationsDesk}
                  </a>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#EBF6F1]/10 flex items-center justify-center text-[#2A835F] shrink-0 border border-[#2A835F]/20">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <span>{siteSettings?.officeAddress || t.centralHQ}</span>
                </div>
              </div>
            </div>

            {/* Column 2: Specialized Services */}
            <div className="lg:col-span-3 flex flex-col gap-3">
              <h4 className="text-xs font-black tracking-widest text-[#2A835F] uppercase mb-1">
                {t.servicesTitle}
              </h4>
              <ul className="flex flex-col gap-2.5 text-xs font-medium text-slate-400">
                {Object.entries(t.servicesList).map(([key, val]) => (
                  <li key={key}>
                    <Link
                      href={`/services#${key}`}
                      className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-1.5"
                    >
                      <ChevronRight className="w-3 h-3 text-[#2A835F]" />
                      <span>{val}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Portals & Roles */}
            <div className="lg:col-span-2 flex flex-col gap-3">
              <h4 className="text-xs font-black tracking-widest text-[#2A835F] uppercase mb-1">
                {t.companyTitle}
              </h4>
              <ul className="flex flex-col gap-2.5 text-xs font-medium text-slate-400">
                <li>
                  <Link href="/auth/login" className="hover:text-white transition-colors">
                    {t.companyList.customer}
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="hover:text-white transition-colors">
                    {t.companyList.worker}
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="hover:text-white transition-colors">
                    {t.companyList.staff}
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    {t.companyList.about}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Regional Deployment Hubs */}
            <div className="lg:col-span-3 flex flex-col gap-3">
              <h4 className="text-xs font-black tracking-widest text-[#2A835F] uppercase mb-1">
                {language === 'ml' ? 'കാസർഗോഡ് ഹബ്ബുകൾ' : 'Kasaragod Hubs'}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {language === 'ml'
                  ? 'കാസർഗോഡ് ടൗൺ, കാഞ്ഞങ്ങാട്, നീലേശ്വരം, ഉപ്പള, തൃക്കരിപ്പൂർ മേഖലകളിൽ സജീവമായ സേവന ശൃംഖല.'
                  : 'Dedicated coordination yards operating round the clock across Kasaragod Town, Kanhangad, Nileshwaram, Uppala, and Trikaripur.'}
              </p>

              <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl mt-2 flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2A835F] animate-ping" />
                <span className="text-xs font-bold text-slate-200">
                  {language === 'ml' ? 'ഓപ്പറേഷൻസ് കൺട്രോൾ റൂം സജീവം' : 'Central Control Active'}
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================
              2. BOTTOM LEGAL / COPYRIGHT BAR
          ======================================================== */}
          <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-semibold text-slate-500">
            <span>
              © {new Date().getFullYear()} KK Group Operations Ltd. All rights reserved.
            </span>

            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-slate-300 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-slate-300 transition-colors">
                Terms of Service
              </Link>
              <Link href="/security" className="hover:text-slate-300 transition-colors">
                Security Protocol
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
