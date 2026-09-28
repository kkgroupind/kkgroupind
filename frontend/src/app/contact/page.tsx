'use client';

import React, { useState } from 'react';
import {
  Phone,
  MessageSquare,
  Mail,
  Clock,
  MapPin,
  ArrowRight,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Navbar } from '@/components/Home/Navbar';
import { Footer } from '@/components/Home/Footer';
import { EnquiryBox } from '@/components/Home/EnquiryBox';
import { useLanguage } from '@/context/language-context';
import { pageTranslations } from '@/utils/page-translations';
import { CustomerDropdown, CustomerDropdownOption } from '@/components/Common/CustomerDropdown';
import { CUSTOMER_SERVICES } from '@/utils/service-options';
import { useToast } from '@/context/toast-context';
import { sanitizePhoneInput, validateMobileNumber } from '@/validations';
import { EnquiryService } from '@/services/enquiry.service';
import { SettingsService, SiteSettings } from '@/services/settings.service';

export default function ContactPage() {
  const { language } = useLanguage();
  const t = pageTranslations[language].contact;
  const { success, error } = useToast();

  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | undefined>(undefined);

  // Form State
  const [formData, setFormData] = useState({
    serviceRequired: 'cococare',
    fullName: '',
    phone: '',
    location: '',
    preferredDate: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  React.useEffect(() => {
    SettingsService.getPublicSettings()
      .then((res) => {
        if (res) setSiteSettings(res);
      })
      .catch(() => {});
  }, []);

  const handleOpenEnquiry = (serviceName?: string) => {
    setSelectedService(serviceName);
    setIsEnquiryOpen(true);
  };

  const handleCloseEnquiry = () => {
    setIsEnquiryOpen(false);
    setSelectedService(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      error(
        language === 'ml' ? 'ദയവായി നിങ്ങളുടെ പേര് നൽകുക.' : 'Please enter your name.'
      );
      return;
    }

    const cleanPhone = sanitizePhoneInput(formData.phone);
    if (!validateMobileNumber(cleanPhone)) {
      error(
        language === 'ml'
          ? 'സാധുവായ 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക.'
          : 'Please enter a valid 10-digit mobile number.'
      );
      return;
    }

    if (!formData.location.trim()) {
      error(
        language === 'ml'
          ? 'ദയവായി പ്രോജക്റ്റ് സൈറ്റ് / ജില്ല നൽകുക.'
          : 'Please specify the project location / district.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await EnquiryService.createEnquiry({
        customerName: formData.fullName.trim(),
        customerPhone: cleanPhone,
        serviceName: formData.serviceRequired,
        location: formData.location.trim(),
        preferredDate: formData.preferredDate || 'Immediate / Flexible',
        message: formData.notes.trim() || 'Website contact form submission',
      });

      setIsSubmitted(true);
      success(t.successTitle, t.successMsg);
      setFormData({
        serviceRequired: 'cococare',
        fullName: '',
        phone: '',
        location: '',
        preferredDate: '',
        notes: '',
      });
    } catch {
      error(
        language === 'ml'
          ? 'അഭ്യർത്ഥന സമർപ്പിക്കാൻ സാധിച്ചില്ല. വീണ്ടും ശ്രമിക്കുക.'
          : 'Failed to submit enquiry. Please try again or call our hotline.'
      );
    } finally {
      setIsSubmitting(false);
    }
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
            2. FOUR DIRECT CHANNELS BENTO CARDS
        ======================================================== */}
        <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Phone Card */}
            <a
              href={`tel:${(siteSettings?.contactPhone || '+919447012345').replace(/\s+/g, '')}`}
              className="bg-white border-2 border-slate-200/90 hover:border-[#2A835F] rounded-3xl p-6 flex flex-col justify-between gap-5 shadow-xs hover:shadow-lg transition-all group"
            >
              <div className="flex flex-col gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#EBF6F1] text-[#2A835F] group-hover:bg-[#2A835F] group-hover:text-white transition-colors flex items-center justify-center">
                  <Phone className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {t.phoneLabel}
                </span>
                <span className="text-base font-black text-slate-900 group-hover:text-[#2A835F] transition-colors">
                  {siteSettings?.contactPhone || t.phoneVal}
                </span>
                <p className="text-xs text-slate-500">{t.phoneSub}</p>
              </div>
              <div className="flex items-center text-xs font-bold text-[#2A835F]">
                <span>Call Directly</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>

            {/* WhatsApp Card */}
            <a
              href={`https://wa.me/${(siteSettings?.whatsappPhone || '919846054321').replace(/[^0-9]/g, '')}?text=Hello%20KK%20Group,%20I%20would%20like%20to%20enquire%20about%20services.`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border-2 border-slate-200/90 hover:border-[#25D366] rounded-3xl p-6 flex flex-col justify-between gap-5 shadow-xs hover:shadow-lg transition-all group"
            >
              <div className="flex flex-col gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#25D366]/10 text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white transition-colors flex items-center justify-center">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {t.whatsappLabel}
                </span>
                <span className="text-base font-black text-slate-900 group-hover:text-[#25D366] transition-colors">
                  {siteSettings?.whatsappPhone || t.whatsappVal}
                </span>
                <p className="text-xs text-slate-500">{t.whatsappSub}</p>
              </div>
              <div className="flex items-center text-xs font-bold text-[#25D366]">
                <span>Chat on WhatsApp</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>

            {/* Email Card */}
            <a
              href={`mailto:${siteSettings?.supportEmail || 'dispatch@kkgroupkerala.com'}`}
              className="bg-white border-2 border-slate-200/90 hover:border-[#2A835F] rounded-3xl p-6 flex flex-col justify-between gap-5 shadow-xs hover:shadow-lg transition-all group"
            >
              <div className="flex flex-col gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#EBF6F1] text-[#2A835F] group-hover:bg-[#2A835F] group-hover:text-white transition-colors flex items-center justify-center">
                  <Mail className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {t.emailLabel}
                </span>
                <span className="text-base font-black text-slate-900 group-hover:text-[#2A835F] transition-colors truncate">
                  {siteSettings?.supportEmail || t.emailVal}
                </span>
                <p className="text-xs text-slate-500">{t.emailSub}</p>
              </div>
              <div className="flex items-center text-xs font-bold text-[#2A835F]">
                <span>Send Email</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>

            {/* SLA Card */}
            <div className="bg-[#EBF6F1]/60 border-2 border-[#C3E6D5] rounded-3xl p-6 flex flex-col justify-between gap-5 shadow-xs">
              <div className="flex flex-col gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#2A835F] text-white flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#2A835F]">
                  {t.deskLabel}
                </span>
                <span className="text-2xl font-black text-[#2A835F]">
                  {siteSettings?.businessHours ? siteSettings.businessHours.split('(')[0].trim() : t.deskVal}
                </span>
                <p className="text-xs text-slate-600">{siteSettings?.businessHours || t.deskSub}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#2A835F]">
                <span className="w-2 h-2 rounded-full bg-[#2A835F] animate-ping" />
                <span>Central Hub Live</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            3. INTERACTIVE DIRECT BOOKING & CONTACT FORM BENTO
        ======================================================== */}
        <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="bg-slate-950 text-white rounded-3xl sm:rounded-[48px] p-6 sm:p-10 lg:p-14 border border-slate-800 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
              {/* Form Intro Column */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-[#A3E5C7] text-xs font-bold uppercase tracking-wider self-start">
                  <Sparkles className="w-3.5 h-3.5 text-[#A3E5C7]" />
                  <span>Immediate Dispatch</span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                  {t.formTitle}
                </h2>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  {t.formSubtitle}
                </p>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-3 mt-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#A3E5C7]">
                    <CheckCircle2 className="w-4 h-4 text-[#2A835F]" />
                    <span>No Advance Payment Required for Enquiry</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#A3E5C7]">
                    <CheckCircle2 className="w-4 h-4 text-[#2A835F]" />
                    <span>Direct Call from Regional Field Supervisor</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#A3E5C7]">
                    <CheckCircle2 className="w-4 h-4 text-[#2A835F]" />
                    <span>Instant Price Breakdown & Availability</span>
                  </div>
                </div>
              </div>

              {/* Form Input Fields Column */}
              <div className="lg:col-span-7 bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl">
                {isSubmitted ? (
                  <div className="py-10 flex flex-col items-center justify-center text-center gap-4 animate-in fade-in">
                    <div className="w-16 h-16 rounded-full bg-[#EBF6F1] text-[#2A835F] flex items-center justify-center shadow-inner">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">
                      {t.successTitle}
                    </h3>
                    <p className="text-sm text-slate-600 max-w-md leading-relaxed">
                      {t.successMsg}
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsSubmitted(false)}
                      className="mt-4 bg-[#2A835F] hover:bg-[#236D4F] text-white px-6 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer"
                    >
                      Submit Another Request
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Special Customer Service Dropdown (Big Image & Two Lines) */}
                    <div className="flex flex-col gap-1.5">
                      <CustomerDropdown
                        options={CUSTOMER_SERVICES}
                        value={formData.serviceRequired}
                        onChange={(val) =>
                          setFormData({ ...formData, serviceRequired: val })
                        }
                        label={t.serviceLabel}
                        placeholder="Select required service squad..."
                        language={language}
                      />
                    </div>

                    {/* Name & Phone Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          {t.nameLabel}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={t.namePlaceholder}
                          value={formData.fullName}
                          onChange={(e) =>
                            setFormData({ ...formData, fullName: e.target.value })
                          }
                          className="w-full bg-slate-50 border border-slate-300 focus:border-[#2A835F] focus:ring-2 focus:ring-[#2A835F]/20 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-900 outline-none transition-all"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          {t.phoneInputLabel}
                        </label>
                        <div className="flex items-center">
                          <span className="bg-slate-100 border border-r-0 border-slate-300 text-slate-600 px-3 py-2.5 rounded-l-xl text-xs font-bold">
                            +91
                          </span>
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            placeholder={t.phoneInputPlaceholder}
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({ ...formData, phone: e.target.value })
                            }
                            className="w-full bg-slate-50 border border-slate-300 focus:border-[#2A835F] focus:ring-2 focus:ring-[#2A835F]/20 rounded-r-xl px-4 py-2.5 text-xs font-medium text-slate-900 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* District Location & Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          {t.districtLabel}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={t.districtPlaceholder}
                          value={formData.location}
                          onChange={(e) =>
                            setFormData({ ...formData, location: e.target.value })
                          }
                          className="w-full bg-slate-50 border border-slate-300 focus:border-[#2A835F] focus:ring-2 focus:ring-[#2A835F]/20 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-900 outline-none transition-all"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          {t.dateLabel}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Immediate / This Saturday"
                          value={formData.preferredDate}
                          onChange={(e) =>
                            setFormData({ ...formData, preferredDate: e.target.value })
                          }
                          className="w-full bg-slate-50 border border-slate-300 focus:border-[#2A835F] focus:ring-2 focus:ring-[#2A835F]/20 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-900 outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        {t.notesLabel}
                      </label>
                      <textarea
                        rows={3}
                        placeholder={t.notesPlaceholder}
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        className="w-full bg-slate-50 border border-slate-300 focus:border-[#2A835F] focus:ring-2 focus:ring-[#2A835F]/20 rounded-xl p-3 text-xs font-medium text-slate-900 outline-none transition-all resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-2 bg-[#2A835F] hover:bg-[#236D4F] disabled:opacity-70 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
                    >
                      {isSubmitting ? (
                        <span>{t.submittingBtn}</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>{t.submitBtn}</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            4. FOUR REGIONAL OPERATIONS DEPOTS & BASES
        ======================================================== */}
        <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col gap-8">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF6F1] border border-[#C3E6D5] text-[#2A835F] text-xs font-bold uppercase tracking-wider self-start">
              <MapPin className="w-3.5 h-3.5 text-[#2A835F]" />
              <span>{t.depotsBadge}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              {t.depotsTitle}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {t.depotsSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.depots.map((depot, idx) => (
              <div
                key={idx}
                className="bg-white border-2 border-slate-200/90 hover:border-[#2A835F] rounded-3xl p-6 flex flex-col justify-between gap-5 shadow-xs hover:shadow-lg transition-all"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#2A835F] bg-[#EBF6F1] px-2.5 py-1 rounded-full">
                      {depot.hubTag}
                    </span>
                    <MapPin className="w-4 h-4 text-slate-400" />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {depot.name}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {depot.address}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex flex-col gap-1 text-[11px] text-slate-500 font-medium">
                    <div>
                      <strong className="text-slate-700">Phone: </strong>
                      <a href={`tel:${depot.phone}`} className="text-[#2A835F] hover:underline">
                        {depot.phone}
                      </a>
                    </div>
                    <div>
                      <strong className="text-slate-700">Hours: </strong>
                      <span>{depot.timing}</span>
                    </div>
                  </div>
                </div>

                <a
                  href={depot.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pt-2 text-xs font-bold text-[#2A835F] hover:text-[#236D4F] inline-flex items-center gap-1"
                >
                  <span>Open Directions</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================
            5. OPERATIONAL FAQ ACCORDION
        ======================================================== */}
        <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="bg-[#EBF6F1]/40 border-2 border-[#C3E6D5] rounded-3xl sm:rounded-[48px] p-6 sm:p-10 lg:p-14">
            <div className="flex flex-col gap-3 text-center max-w-2xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#C3E6D5] text-[#2A835F] text-xs font-bold uppercase tracking-wider self-center shadow-xs">
                <HelpCircle className="w-3.5 h-3.5 text-[#2A835F]" />
                <span>{t.faqBadge}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight">
                {t.faqTitle}
              </h2>
            </div>

            <div className="flex flex-col gap-3 max-w-3xl mx-auto">
              {t.faqs.map((faq, idx) => {
                const isOpen = expandedFaq === idx;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-[#C3E6D5]/80 overflow-hidden shadow-xs transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedFaq(isOpen ? null : idx)}
                      className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-[#2A835F] transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#2A835F] shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
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
