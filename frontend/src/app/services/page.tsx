'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Users,
  Layers,
  Wrench,
  ChevronRight,
  Phone,
} from 'lucide-react';
import { Navbar } from '@/components/Home/Navbar';
import { Footer } from '@/components/Home/Footer';
import { EnquiryBox } from '@/components/Home/EnquiryBox';
import { useLanguage } from '@/context/language-context';
import { pageTranslations } from '@/utils/page-translations';

export default function ServicesPage() {
  const { language } = useLanguage();
  const t = pageTranslations[language].services;
  const [activeCategory, setActiveCategory] = useState<string>('all');
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

  const filteredServices =
    activeCategory === 'all'
      ? t.serviceList
      : t.serviceList.filter((s) => s.category === activeCategory);

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
            2. INTERACTIVE CATEGORY FILTER TABS
        ======================================================== */}
        <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {Object.entries(t.categories).map(([key, label]) => {
              const isSelected = activeCategory === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveCategory(key)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#2A835F] text-white shadow-md shadow-[#2A835F]/20 ring-2 ring-[#2A835F]/30'
                      : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        {/* ========================================================
            3. DETAILED SERVICES BENTO GRID
        ======================================================== */}
        <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                id={service.id}
                className="bg-white border-2 border-slate-200/90 hover:border-[#2A835F] rounded-3xl sm:rounded-[36px] overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-xl transition-all duration-300 group"
              >
                {/* Image & Header Overlay */}
                <div className="relative w-full h-56 sm:h-64 overflow-hidden bg-slate-900">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                  {/* Tag Pill */}
                  <div className="absolute top-4 left-4 px-3.5 py-1 rounded-full bg-[#EBF6F1]/90 backdrop-blur-md text-[#2A835F] text-xs font-black uppercase tracking-wider shadow-xs">
                    {service.tag}
                  </div>

                  {/* Title on bottom of image - shown fully */}
                  <div className="absolute bottom-4 inset-x-4">
                    <h3 className="text-xl sm:text-2xl font-black text-white leading-tight break-words">
                      {service.name}
                    </h3>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 sm:p-7 flex flex-col justify-between flex-1 gap-6">
                  <div className="flex flex-col gap-4">
                    <p className="text-sm text-slate-600 leading-relaxed font-normal">
                      {service.desc}
                    </p>

                    {/* Features Checklist */}
                    <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                      {service.specs.map((spec, sIdx) => (
                        <div key={sIdx} className="flex items-start gap-2.5 text-xs text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-[#2A835F] shrink-0 mt-0.5" />
                          <span className="font-medium">{spec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Bottom Meta & Booking Trigger */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {service.squadInfo}
                      </span>
                      <span className="text-xs font-black text-[#2A835F] mt-0.5">
                        {service.turnaround} • {language === 'ml' ? 'കാസർഗോഡ് ജില്ല' : 'Kasaragod Dispatch'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenEnquiry(service.id)}
                      className="w-full sm:w-auto bg-[#2A835F] hover:bg-[#236D4F] text-white px-5 py-2.5 rounded-full text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-95"
                    >
                      <span>{t.enquireForService}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================
            4. WORKFLOW: 4-STEP SIMPLE DEPLOYMENT PROCESS
        ======================================================== */}
        <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="bg-[#EBF6F1]/40 border-2 border-[#C3E6D5] rounded-3xl sm:rounded-[48px] p-6 sm:p-10 lg:p-14">
            <div className="flex flex-col gap-3 text-center max-w-2xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#C3E6D5] text-[#2A835F] text-xs font-bold uppercase tracking-wider self-center shadow-xs">
                <Layers className="w-3.5 h-3.5 text-[#2A835F]" />
                <span>{t.workflowBadge}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight">
                {t.workflowTitle}
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {t.workflowSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {t.steps.map((st, sIdx) => (
                <div
                  key={sIdx}
                  className="bg-white rounded-3xl p-6 border border-[#C3E6D5]/80 shadow-xs flex flex-col justify-between gap-5 relative"
                >
                  <div className="flex flex-col gap-3">
                    <span className="text-3xl font-black text-[#2A835F]/25">
                      {st.stepNumber}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {st.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {st.desc}
                    </p>
                  </div>

                  <div className="w-full h-1 bg-[#EBF6F1] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2A835F]"
                      style={{ width: `${(sIdx + 1) * 25}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================
            5. GUARANTEES BANNER
        ======================================================== */}
        <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="bg-slate-950 text-white rounded-3xl sm:rounded-[48px] p-6 sm:p-10 lg:p-14 border border-slate-800">
            <div className="flex flex-col gap-3 text-center max-w-2xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#A3E5C7] text-xs font-bold uppercase tracking-wider self-center">
                <ShieldCheck className="w-3.5 h-3.5 text-[#A3E5C7]" />
                <span>{t.guaranteesBadge}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                {t.guaranteesTitle}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {t.guarantees.map((g, gIdx) => (
                <div
                  key={gIdx}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col gap-2.5"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#2A835F]" />
                  <h4 className="text-sm font-bold text-white leading-snug">
                    {g.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {g.desc}
                  </p>
                </div>
              ))}
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
