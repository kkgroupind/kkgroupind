'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  MapPin,
  Clock,
  Wrench,
  CheckCircle2,
  Quote,
  ArrowRight,
  TrendingUp,
  Award,
} from 'lucide-react';
import { Navbar } from '@/components/Home/Navbar';
import { Footer } from '@/components/Home/Footer';
import { EnquiryBox } from '@/components/Home/EnquiryBox';
import { useLanguage } from '@/context/language-context';
import { pageTranslations } from '@/utils/page-translations';

export default function ProjectsPage() {
  const { language } = useLanguage();
  const t = pageTranslations[language].projects;
  const [activeDistrict, setActiveDistrict] = useState<string>('all');
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

  const filteredProjects =
    activeDistrict === 'all'
      ? t.items
      : t.items.filter((item) => item.districtTag === activeDistrict);

  return (
    <div className="w-full min-h-screen bg-white text-[#0F172A] font-sans antialiased selection:bg-[#2A835F] selection:text-white flex flex-col scroll-smooth">
      {/* Fixed Navbar with Enquire Button */}
      <Navbar onOpenEnquiry={() => handleOpenEnquiry()} />

      <main className="w-full pt-20 sm:pt-24 pb-16 flex flex-col gap-12 sm:gap-16 lg:gap-20">
        {/* ========================================================
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
            2. DISTRICT FILTER TABS
        ======================================================== */}
        <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {Object.entries(t.filters).map(([key, label]) => {
              const isSelected = activeDistrict === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveDistrict(key)}
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
            3. PROJECTS SHOWCASE BENTO GRID
        ======================================================== */}
        <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white border-2 border-slate-200/90 hover:border-[#2A835F] rounded-3xl sm:rounded-[36px] overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-xl transition-all duration-300 group"
              >
                {/* Image Section */}
                <div className="relative w-full h-64 sm:h-72 overflow-hidden bg-slate-900">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#EBF6F1]/90 backdrop-blur-md text-[#2A835F] text-xs font-black uppercase tracking-wider shadow-xs">
                      {project.category}
                    </span>
                  </div>

                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1.5 border border-white/20">
                    <Clock className="w-3 h-3 text-[#A3E5C7]" />
                    <span>{project.duration}</span>
                  </div>

                  <div className="absolute bottom-4 inset-x-4 flex flex-col gap-1 text-white">
                    <div className="flex items-center gap-1.5 text-xs text-[#A3E5C7] font-bold">
                      <MapPin className="w-3.5 h-3.5 text-[#A3E5C7]" />
                      <span>{project.district}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black leading-tight">
                      {project.title}
                    </h3>
                  </div>
                </div>

                {/* Project Details */}
                <div className="p-6 sm:p-7 flex flex-col justify-between flex-1 gap-6">
                  <div className="flex flex-col gap-4">
                    {/* Scope */}
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Scope & Objectives:
                      </span>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                        {project.scope}
                      </p>
                    </div>

                    {/* Equipment & Impact Pills */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400">
                          Squad & Machinery
                        </span>
                        <span className="text-xs font-bold text-slate-800 leading-snug">
                          {project.equipment}
                        </span>
                      </div>

                      <div className="p-3 rounded-2xl bg-[#EBF6F1] border border-[#C3E6D5] flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase text-[#2A835F]">
                          Measurable Result
                        </span>
                        <span className="text-xs font-bold text-slate-900 leading-snug">
                          {project.impact}
                        </span>
                      </div>
                    </div>

                    {/* Client Quote */}
                    <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col gap-2 mt-1">
                      <div className="flex items-center gap-1 text-[#A3E5C7]">
                        <Quote className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">
                          Client Feedback
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 italic leading-relaxed">
                        “{project.quote}”
                      </p>
                      <div className="text-[11px] text-slate-400 font-semibold pt-1 border-t border-slate-800 flex items-center justify-between">
                        <span>{project.client}</span>
                        <span className="text-[#A3E5C7]">{project.clientRole}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2A835F]">
                      KK Group Certified Delivery
                    </span>

                    <button
                      type="button"
                      onClick={() => handleOpenEnquiry(project.category)}
                      className="bg-slate-100 hover:bg-[#2A835F] hover:text-white text-slate-800 px-4 py-2 rounded-full text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>Similar Requirement</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================
            4. STATEWIDE IMPACT METRICS BENTO
        ======================================================== */}
        <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="bg-slate-950 text-white rounded-3xl sm:rounded-[48px] p-6 sm:p-10 lg:p-14 border border-slate-800">
            <div className="flex flex-col gap-3 text-center max-w-2xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#A3E5C7] text-xs font-bold uppercase tracking-wider self-center">
                <Award className="w-3.5 h-3.5 text-[#A3E5C7]" />
                <span>{t.statsBadge}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                {t.statsTitle}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {t.stats.map((s, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col gap-2 text-center"
                >
                  <span className="text-3xl sm:text-4xl font-black text-[#A3E5C7]">
                    {s.val}
                  </span>
                  <span className="text-sm font-bold text-white">
                    {s.label}
                  </span>
                  <span className="text-xs text-slate-400">
                    {s.sub}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================
            5. FINAL CTA BENTO BANNER
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

            <button
              type="button"
              onClick={() => handleOpenEnquiry()}
              className="bg-white text-[#2A835F] hover:bg-slate-100 px-8 py-4 rounded-full font-black text-sm inline-flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all cursor-pointer active:scale-95"
            >
              <span>{t.ctaBtn}</span>
              <ArrowRight className="w-4 h-4 text-[#2A835F]" />
            </button>
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
