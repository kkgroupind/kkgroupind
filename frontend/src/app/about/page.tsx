'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Award,
  Users,
  Clock,
  ArrowRight,
  Phone,
  CheckCircle2,
  MapPin,
  Sparkles,
  Zap,
  Target,
  Compass,
} from 'lucide-react';
import { Navbar } from '@/components/Home/Navbar';
import { Footer } from '@/components/Home/Footer';
import { EnquiryBox } from '@/components/Home/EnquiryBox';
import { useLanguage } from '@/context/language-context';
import { pageTranslations } from '@/utils/page-translations';

export default function AboutPage() {
  const { language } = useLanguage();
  const t = pageTranslations[language].about;
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | undefined>(undefined);

  const handleOpenEnquiry = (serviceName?: string) => {
    setSelectedService(serviceName);
    setIsEnquiryOpen(true);
  };

  const handleCloseEnquiry = () => {
    setIsEnquiryOpen(false);
    setSelectedService(undefined);
  };

  return (
    <div className="w-full min-h-screen bg-white text-[#0F172A] font-sans antialiased selection:bg-[#2A835F] selection:text-white flex flex-col scroll-smooth">
      {/* Fixed Navbar with Enquire Button */}
      <Navbar onOpenEnquiry={() => handleOpenEnquiry()} />

      <main className="w-full pt-20 sm:pt-24 pb-16 flex flex-col gap-12 sm:gap-16 lg:gap-20">
        {/* ========================================================
            1. HERO SECTION: Cinematic Bento Chassis with Brand Accents
        ======================================================== */}
        {/* ========================================================
            1. PAGE HEADER: Clean Light Header with Key Stats
        ======================================================== */}
        <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pt-2 sm:pt-4">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EBF6F1] border border-[#C3E6D5] self-start text-[#2A835F] text-xs font-bold uppercase tracking-wider">
                <span>{t.kicker}</span>
              </div>
              <h1
                className={`font-black tracking-tight text-slate-900 ${
                  language === 'ml'
                    ? 'text-2xl sm:text-3xl lg:text-4xl leading-tight'
                    : 'text-3xl sm:text-4xl lg:text-5xl leading-tight'
                }`}
              >
                {t.headline}
              </h1>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {t.subheadline}
              </p>
            </div>

            {/* Quick Metrics Bar on Light Canvas */}
            <div className="pt-6 border-t border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              <div className="flex flex-col gap-0.5">
                <span className="text-2xl sm:text-3xl font-black text-[#2A835F]">
                  {t.stats.districts}
                </span>
                <span className="text-xs sm:text-sm text-slate-500 font-medium">
                  {t.stats.districtsLabel}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-2xl sm:text-3xl font-black text-[#2A835F]">
                  {t.stats.operatives}
                </span>
                <span className="text-xs sm:text-sm text-slate-500 font-medium">
                  {t.stats.operativesLabel}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-2xl sm:text-3xl font-black text-[#2A835F]">
                  {t.stats.projects}
                </span>
                <span className="text-xs sm:text-sm text-slate-500 font-medium">
                  {t.stats.projectsLabel}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-2xl sm:text-3xl font-black text-[#2A835F]">
                  {t.stats.uptime}
                </span>
                <span className="text-xs sm:text-sm text-slate-500 font-medium">
                  {t.stats.uptimeLabel}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            2. THE FOUNDING STORY & VISION (Bento Duo Layout)
        ======================================================== */}
        <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Story Card */}
            <div className="lg:col-span-7 bg-[#EBF6F1]/50 border-2 border-[#C3E6D5] rounded-3xl sm:rounded-[40px] p-6 sm:p-10 flex flex-col justify-between gap-6 shadow-sm">
              <div className="flex flex-col gap-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#C3E6D5] text-[#2A835F] text-xs font-bold uppercase tracking-wider self-start shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#2A835F]" />
                  <span>{t.storyBadge}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
                  {t.storyTitle}
                </h2>

                <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                  {t.storyP1}
                </p>

                <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                  {t.storyP2}
                </p>
              </div>

              <div className="pt-4 border-t border-[#C3E6D5]/60 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#2A835F] text-white flex items-center justify-center font-black text-sm">
                    KK
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">KK Group Operations Ltd.</h4>
                    <p className="text-[11px] text-slate-500">Palakkad • Ernakulam • Kozhikode • Thrissur</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-[#2A835F]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>100% Verified Fieldwork</span>
                </div>
              </div>
            </div>

            {/* Visual Feature Card */}
            <div className="lg:col-span-5 relative rounded-3xl sm:rounded-[40px] overflow-hidden min-h-[380px] shadow-lg border border-slate-200">
              <img
                src="/images/about_gardener.jpg"
                alt="KK Group Certified Workforce"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent p-6 sm:p-8 flex flex-col justify-end text-white">
                <span className="text-xs font-bold uppercase tracking-widest text-[#A3E5C7] mb-1">
                  Safety First Philosophy
                </span>
                <h3 className="text-xl sm:text-2xl font-bold leading-tight">
                  Modern Climbing Harnesses & Field Telemetry
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-2">
                  Eliminating manual risks with industrial safety compliance, specialized training camps, and on-site supervisor oversight.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            3. OPERATIONAL PILLARS (4 Bento Cards Grid)
        ======================================================== */}
        <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col gap-4 text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF6F1] border border-[#C3E6D5] text-[#2A835F] text-xs font-bold uppercase tracking-wider self-center">
              <Target className="w-3.5 h-3.5 text-[#2A835F]" />
              <span>{t.pillarsBadge}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              {t.pillarsTitle}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {t.pillarsSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.pillars.map((pillar, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200/90 hover:border-[#2A835F] rounded-3xl p-6 sm:p-7 flex flex-col justify-between gap-6 shadow-xs hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#EBF6F1] text-[#2A835F] group-hover:bg-[#2A835F] group-hover:text-white transition-colors flex items-center justify-center font-black text-lg">
                    {idx === 0 && <ShieldCheck className="w-6 h-6" />}
                    {idx === 1 && <Award className="w-6 h-6" />}
                    {idx === 2 && <Zap className="w-6 h-6" />}
                    {idx === 3 && <Clock className="w-6 h-6" />}
                  </div>

                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#2A835F]">
                    {pillar.tag}
                  </span>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#2A835F] transition-colors leading-snug">
                    {pillar.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {pillar.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-[#2A835F] group-hover:translate-x-1 transition-transform">
                  <span>KK Group Standard</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================
            4. LEADERSHIP & FIELD COMMANDERS
        ======================================================== */}
        <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="bg-slate-900 rounded-3xl sm:rounded-[48px] p-6 sm:p-10 lg:p-14 text-white">
            <div className="flex flex-col gap-3 mb-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#A3E5C7] text-xs font-bold uppercase tracking-wider self-start">
                <Users className="w-3.5 h-3.5 text-[#A3E5C7]" />
                <span>{t.leadershipBadge}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                {t.leadershipTitle}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {t.leaders.map((leader, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/80 border border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col gap-5 hover:border-[#2A835F]/60 transition-all shadow-md group"
                >
                  <div className="w-full aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden relative">
                    <img
                      src={leader.image}
                      alt={leader.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-bold text-[#A3E5C7]">
                      {leader.district}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-lg font-bold text-white group-hover:text-[#A3E5C7] transition-colors">
                      {leader.name}
                    </h3>
                    <p className="text-xs font-semibold text-[#2A835F] uppercase tracking-wide">
                      {leader.role}
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed mt-2">
                      {leader.bio}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================
            5. FINAL CALL TO ACTION BENTO BANNER
        ======================================================== */}
        <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="w-full bg-gradient-to-br from-[#2A835F] via-[#236D4F] to-[#1C553E] rounded-3xl sm:rounded-[48px] p-8 sm:p-12 lg:p-16 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col gap-3 max-w-xl text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                {t.ctaTitle}
              </h2>
              <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
                {t.ctaSubtitle}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full md:w-auto">
              <button
                type="button"
                onClick={() => handleOpenEnquiry()}
                className="w-full sm:w-auto bg-white text-[#2A835F] hover:bg-slate-100 px-8 py-4 rounded-full font-black text-sm inline-flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all cursor-pointer active:scale-95"
              >
                <span>{t.ctaBtn}</span>
                <ArrowRight className="w-4 h-4 text-[#2A835F]" />
              </button>

              <a
                href="tel:+919447012345"
                className="w-full sm:w-auto bg-black/30 hover:bg-black/40 border border-white/30 text-white px-6 py-4 rounded-full font-bold text-sm inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Phone className="w-4 h-4 text-[#A3E5C7]" />
                <span>{t.callBtn}</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Master Footer with Curvy Top Edges */}
      <Footer />

      {/* Hero-Styled Enquiry Modal */}
      <EnquiryBox
        isOpen={isEnquiryOpen}
        onClose={handleCloseEnquiry}
        initialService={selectedService}
      />
    </div>
  );
}
