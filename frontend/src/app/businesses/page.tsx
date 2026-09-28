'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Briefcase,
  Layers,
  Truck,
  ShieldCheck,
  Building2,
  Droplets,
  Phone,
} from 'lucide-react';
import { Navbar } from '@/components/Home/Navbar';
import { Footer } from '@/components/Home/Footer';
import { EnquiryBox } from '@/components/Home/EnquiryBox';
import { useLanguage } from '@/context/language-context';
import { pageTranslations } from '@/utils/page-translations';

export default function BusinessesPage() {
  const { language } = useLanguage();
  const t = pageTranslations[language].businesses;
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
            1. PAGE HEADER: Clean Light Header
        ======================================================== */}
        <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pt-2 sm:pt-4">
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
        </section>

        {/* ========================================================
            2. THE FOUR ENTERPRISE DIVISIONS (Full Bento Cards)
        ======================================================== */}
        <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col gap-10">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF6F1] border border-[#C3E6D5] text-[#2A835F] text-xs font-bold uppercase tracking-wider self-start">
              <Briefcase className="w-3.5 h-3.5 text-[#2A835F]" />
              <span>{t.divisionsBadge}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              {t.divisionsTitle}
            </h2>
          </div>

          <div className="flex flex-col gap-12">
            {t.divisions.map((division, idx) => {
              const isEven = idx % 2 === 1;
              return (
                <div
                  key={division.id}
                  id={division.id}
                  className="bg-white border-2 border-slate-200/90 hover:border-[#2A835F] rounded-3xl sm:rounded-[44px] overflow-hidden p-6 sm:p-10 shadow-xs hover:shadow-xl transition-all duration-300"
                >
                  <div
                    className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center ${
                      isEven ? 'lg:flex-row-reverse' : ''
                    }`}
                  >
                    {/* Visual Column */}
                    <div
                      className={`lg:col-span-5 relative rounded-2xl sm:rounded-3xl overflow-hidden min-h-[300px] sm:min-h-[360px] bg-slate-900 ${
                        isEven ? 'lg:order-2' : ''
                      }`}
                    >
                      <img
                        src={division.image}
                        alt={division.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                      <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-[#EBF6F1]/95 text-[#2A835F] text-xs font-black uppercase tracking-wider shadow-sm">
                        {division.divisionTag}
                      </div>

                      {/* Floating Key Metrics inside Image */}
                      <div className="absolute bottom-4 inset-x-4 grid grid-cols-2 gap-3 text-white">
                        <div className="p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10">
                          <span className="text-xl sm:text-2xl font-black text-[#A3E5C7] block">
                            {division.metrics.val1}
                          </span>
                          <span className="text-[10px] sm:text-xs text-slate-300">
                            {division.metrics.lbl1}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10">
                          <span className="text-xl sm:text-2xl font-black text-[#A3E5C7] block">
                            {division.metrics.val2}
                          </span>
                          <span className="text-[10px] sm:text-xs text-slate-300">
                            {division.metrics.lbl2}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content Column */}
                    <div
                      className={`lg:col-span-7 flex flex-col gap-5 ${
                        isEven ? 'lg:order-1' : ''
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#2A835F] mb-1 block">
                          Division 0{idx + 1}
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                          {division.name}
                        </h3>
                        <p className="text-sm font-semibold text-slate-500 mt-1">
                          {division.tagline}
                        </p>
                      </div>

                      <p className="text-sm text-slate-600 leading-relaxed font-normal">
                        {division.desc}
                      </p>

                      {/* Key Highlights Checklist */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-100">
                        {division.highlights.map((h, hIdx) => (
                          <div key={hIdx} className="flex items-start gap-2 text-xs text-slate-700">
                            <CheckCircle2 className="w-4 h-4 text-[#2A835F] shrink-0 mt-0.5" />
                            <span className="font-medium">{h}</span>
                          </div>
                        ))}
                      </div>

                      {/* Fleet & Target Details */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-2 text-xs">
                        <div>
                          <strong className="text-slate-800">Primary Fleet & Gear: </strong>
                          <span className="text-slate-600">{division.leadFleet}</span>
                        </div>
                        <div>
                          <strong className="text-slate-800">Target Clientele: </strong>
                          <span className="text-slate-600">{division.serviceTarget}</span>
                        </div>
                      </div>

                      {/* Button */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEnquiry(division.id)}
                          className="bg-[#2A835F] hover:bg-[#236D4F] text-white px-6 py-3 rounded-full text-xs font-bold inline-flex items-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-95"
                        >
                          <span>Inquire for {division.name.split('&')[0]}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================
            3. SYNERGY ADVANTAGE BENTO
        ======================================================== */}
        <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="bg-[#EBF6F1]/50 border-2 border-[#C3E6D5] rounded-3xl sm:rounded-[48px] p-6 sm:p-10 lg:p-14">
            <div className="flex flex-col gap-3 text-center max-w-2xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#C3E6D5] text-[#2A835F] text-xs font-bold uppercase tracking-wider self-center shadow-xs">
                <Layers className="w-3.5 h-3.5 text-[#2A835F]" />
                <span>{t.synergyBadge}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight">
                {t.synergyTitle}
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {t.synergySubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {t.synergies.map((syn, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-[#C3E6D5]/80 shadow-xs flex flex-col gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#EBF6F1] text-[#2A835F] flex items-center justify-center font-black">
                    0{idx + 1}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {syn.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {syn.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================
            4. B2B & CONTRACTOR PARTNERSHIPS
        ======================================================== */}
        <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="bg-slate-950 text-white rounded-3xl sm:rounded-[48px] p-8 sm:p-12 lg:p-16 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col gap-3 max-w-xl text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-[#A3E5C7]">
                {t.b2bBadge}
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                {t.b2bTitle}
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {t.b2bDesc}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full md:w-auto">
              <button
                type="button"
                onClick={() => handleOpenEnquiry('corporate-b2b')}
                className="w-full sm:w-auto bg-[#2A835F] hover:bg-[#236D4F] text-white px-8 py-4 rounded-full font-black text-sm inline-flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all cursor-pointer active:scale-95"
              >
                <span>{t.b2bBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="tel:+919447012345"
                className="w-full sm:w-auto bg-white/10 hover:bg-white/15 border border-white/20 text-white px-6 py-4 rounded-full font-bold text-sm inline-flex items-center justify-center gap-2 backdrop-blur-md transition-all cursor-pointer"
              >
                <Phone className="w-4 h-4 text-[#A3E5C7]" />
                <span>{t.b2bCall}</span>
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
