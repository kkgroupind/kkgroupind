'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  Phone,
  User,
  Layers,
  Calendar,
  Sparkles,
  Clock,
} from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { translations } from '@/utils/translations';
import { EnquiryService } from '@/services/enquiry.service';
import { StylishDropdown, DropdownOption } from '@/components/Common/StylishDropdown';
import { CountryCodeSelect } from '@/components/Common/CountryCodeSelect';
import { KeralaLocationSelect } from '@/components/Common/KeralaLocationSelect';
import { validateMobileNumber, sanitizePhoneInput } from '@/validations';
import { useToast } from '@/context/toast-context';

interface HeroEnquiryBoxProps {
  onSuccess?: (trackingCode: string) => void;
  className?: string;
}

export function HeroEnquiryBox({ onSuccess, className = '' }: HeroEnquiryBoxProps) {
  const { language } = useLanguage();
  const toast = useToast();
  const t = translations[language].enquiry;

  const SERVICES = [
    { id: 'cococare', name: t.servicesList.cococare },
    { id: 'jcb', name: t.servicesList.jcb },
    { id: 'plastering', name: t.servicesList.plastering },
    { id: 'painting', name: t.servicesList.painting },
    { id: 'tile', name: t.servicesList.tile },
    { id: 'electrical', name: t.servicesList.electrical },
    { id: 'plumbing', name: t.servicesList.plumbing },
    { id: 'borewell', name: 'Borewell Drilling & Water Survey' },
  ];

  const serviceDropdownOptions: DropdownOption[] = SERVICES.map((s) => ({
    id: s.id,
    label: s.name,
  }));

  const [selectedServiceId, setSelectedServiceId] = useState(SERVICES[0].id);
  const [customerName, setCustomerName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [customerPhone, setCustomerPhone] = useState('');
  const [district, setDistrict] = useState('Kasaragod');
  const [city, setCity] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentService =
    SERVICES.find((s) => s.id === selectedServiceId) || SERVICES[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim()) {
      const title =
        language === 'ml' ? 'നിങ്ങളുടെ പേര് നൽകുക' : 'Customer Name Required';
      const msg =
        language === 'ml'
          ? 'സേവനം ബുക്ക് ചെയ്യുന്നതിനായി നിങ്ങളുടെ പൂർണ്ണ നാമം രേഖപ്പെടുത്തുക.'
          : 'Please enter your full name to proceed with the enquiry.';
      setErrorMessage(msg);
      toast.warning(title, msg);
      return;
    }

    // Phone validation: for +91, validate 10 digits
    if (countryCode === '+91') {
      const phoneValidation = validateMobileNumber(customerPhone, language);
      if (!phoneValidation.isValid) {
        const title =
          phoneValidation.title ||
          (language === 'ml'
            ? 'മൊബൈൽ നമ്പർ പരിശോധിക്കുക'
            : 'Invalid Mobile Number');
        const msg =
          phoneValidation.error ||
          (language === 'ml'
            ? 'ദയവായി സാധുവായ 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക'
            : 'Please enter a valid 10-digit mobile number');
        setErrorMessage(msg);
        toast.warning(title, msg);
        return;
      }
    } else if (customerPhone.trim().length < 6) {
      const title = 'Invalid Mobile Number';
      const msg = 'Please enter a valid international mobile number.';
      setErrorMessage(msg);
      toast.warning(title, msg);
      return;
    }

    setIsSubmitting(true);
    try {
      const fullPhone = `${countryCode} ${customerPhone.trim()}`;
      const locationString = [city.trim(), district, 'Kerala'].filter(Boolean).join(', ');

      const res = await EnquiryService.createEnquiry({
        serviceName: currentService.name,
        customerName: customerName.trim(),
        customerPhone: fullPhone,
        state: 'Kerala',
        district,
        city: city.trim() || undefined,
        location: locationString,
        deadline: deadline || undefined,
        message: `Direct quick enquiry for ${currentService.name}. Location: ${locationString}${
          deadline ? `. Target Deadline: ${deadline}` : ''
        }`,
      });

      const trackingCode =
        res.enquiry?.trackingNumber ||
        (res.enquiry?.id ? `ENQ-${res.enquiry.id.slice(0, 8).toUpperCase()}` : null) ||
        `ENQ-${Math.floor(100000 + Math.random() * 900000)}`;

      setSubmittedRef(trackingCode);
      onSuccess?.(trackingCode);

      toast.success(
        language === 'ml'
          ? 'അന്വേഷണം വിജയകരമായി അയച്ചു!'
          : 'Enquiry Dispatched Successfully!',
        language === 'ml'
          ? `ട്രാക്കിംഗ് നമ്പർ: ${trackingCode}. ഞങ്ങളുടെ ടീം ഉടൻ നിങ്ങളെ വിളിക്കുന്നതാണ്.`
          : `Tracking ID: ${trackingCode}. Our operations coordinator will call you shortly.`
      );
    } catch (err: any) {
      console.error('Backend enquiry error:', err);
      const title =
        language === 'ml'
          ? 'സമർപ്പണത്തിൽ തടസ്സം നേരിട്ടു'
          : 'Enquiry Dispatch Failed';
      const msg =
        err?.message ||
        (language === 'ml'
          ? 'അന്വേഷണം സമർപ്പിക്കുന്നതിൽ തടസ്സം നേരിട്ടു. ദയവായി വീണ്ടും ശ്രമിക്കുക.'
          : 'Failed to submit enquiry. Please check your connection and try again.');
      setErrorMessage(msg);
      toast.error(title, msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedRef(null);
    setCustomerName('');
    setCustomerPhone('');
    setCity('');
    setDeadline('');
    setErrorMessage(null);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* ========================================================
          1. DESKTOP VIEW: Sleek Bento Multi-Field Hero Container
      ======================================================== */}
      <div className="hidden lg:block w-full">
        {submittedRef ? (
          <div className="w-full bg-[#0c1310]/95 backdrop-blur-2xl border-2 border-emerald-500/40 rounded-3xl p-6 px-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] flex items-center justify-between gap-4 text-white animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                    {language === 'ml' ? 'അന്വേഷണം സ്വീകരിച്ചു' : 'Enquiry Dispatched'}
                  </span>
                  <span className="font-mono text-xs font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    REF: {submittedRef}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-300 truncate">
                  {t.successMsg}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md shrink-0 cursor-pointer"
            >
              {t.submitAnother}
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="w-full bg-[#0c1310]/90 backdrop-blur-2xl border border-emerald-500/30 rounded-3xl p-5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] flex flex-col gap-3 text-slate-200 transition-all hover:border-emerald-500/50"
          >
            {/* Top Row: Service, Name, Mobile with Searchable Country Code */}
            <div className="grid grid-cols-12 gap-3 items-center">
              {/* Service Selection */}
              <div className="col-span-4 flex items-center gap-2.5 bg-black/40 border border-white/10 rounded-2xl px-3 py-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <Layers className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex flex-col text-left w-full min-w-0">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
                    {t.chooseService}
                  </label>
                  <StylishDropdown
                    options={serviceDropdownOptions}
                    value={selectedServiceId}
                    onChange={setSelectedServiceId}
                    label={t.chooseService}
                    variant="inline"
                  />
                </div>
              </div>

              {/* Customer Name */}
              <div className="col-span-4 flex items-center gap-2.5 bg-black/40 border border-white/10 rounded-2xl px-3 py-2">
                <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-white/5">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex flex-col text-left w-full min-w-0">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
                    {t.yourName}
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={t.namePlaceholder}
                    className="w-full text-xs font-bold text-white placeholder-slate-500 bg-transparent focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Mobile with Searchable Country Code */}
              <div className="col-span-4 flex items-center gap-2 bg-black/40 border border-white/10 rounded-2xl px-3 py-2">
                <div className="shrink-0">
                  <CountryCodeSelect
                    value={countryCode}
                    onChange={setCountryCode}
                  />
                </div>
                <div className="flex flex-col text-left w-full min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {t.phoneNumber}
                    </label>
                    {countryCode === '+91' && (
                      <span className="text-[9px] font-bold text-slate-500">
                        {customerPhone.length > 0 ? `${customerPhone.length}/10` : '10 Digits'}
                      </span>
                    )}
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={countryCode === '+91' ? 10 : 15}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(sanitizePhoneInput(e.target.value))}
                    placeholder={countryCode === '+91' ? '9876543210' : 'Mobile number'}
                    className="w-full text-xs font-bold text-white placeholder-slate-500 bg-transparent focus:outline-none tracking-wider"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Bottom Row: Kerala Location (District & City), Optional Deadline & Enquire Button */}
            <div className="grid grid-cols-12 gap-3 items-end pt-1 border-t border-white/5">
              {/* Kerala Location Select (District + City with Custom Typing) */}
              <div className="col-span-6">
                <KeralaLocationSelect
                  district={district}
                  city={city}
                  onDistrictChange={setDistrict}
                  onCityChange={setCity}
                />
              </div>

              {/* Optional Deadline */}
              <div className="col-span-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Target Deadline <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/60 border border-slate-700/80 rounded-xl">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="date"
                    value={deadline}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-transparent text-xs text-white focus:outline-none [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Enquire Now Button */}
              <div className="col-span-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#2A835F] hover:bg-[#236D4F] text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-900/40 transition-all active:scale-95 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{t.submitting}</span>
                    </>
                  ) : (
                    <>
                      <span>{language === 'ml' ? 'അന്വേഷിക്കുക' : 'Enquire Now'}</span>
                      <ArrowRight className="w-4 h-4 text-white shrink-0" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
        {errorMessage && (
          <p className="text-red-400 text-xs font-medium text-center mt-2 drop-shadow">
            {errorMessage}
          </p>
        )}
      </div>

      {/* ========================================================
          2. MOBILE VIEW: Compact Card with Full Capabilities
      ======================================================== */}
      <div className="block lg:hidden w-full max-w-md mx-auto">
        {submittedRef ? (
          <div className="w-full bg-[#0c1310]/95 backdrop-blur-xl border border-emerald-500/40 rounded-3xl p-5 shadow-2xl text-white text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
              {language === 'ml' ? 'അന്വേഷണം ലഭിച്ചു!' : 'Enquiry Received!'}
            </span>
            <span className="font-mono text-xs font-bold bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full block w-fit mx-auto mt-1 mb-2 border border-emerald-500/30">
              REF: {submittedRef}
            </span>
            <p className="text-xs font-semibold text-slate-300 leading-relaxed mb-4">
              {t.successMsg}
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md cursor-pointer"
            >
              {t.submitAnother}
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="w-full bg-[#0c1310]/95 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-4 sm:p-5 shadow-2xl text-white flex flex-col gap-3"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{language === 'ml' ? 'ദ്രുത അന്വേഷണം' : 'Quick Enquiry'}</span>
              </div>
              <span className="text-[11px] font-bold text-slate-400">
                Kerala Operations Only
              </span>
            </div>

            {/* Service */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                {t.chooseService}
              </label>
              <StylishDropdown
                options={serviceDropdownOptions}
                value={selectedServiceId}
                onChange={setSelectedServiceId}
                label={t.chooseService}
              />
            </div>

            {/* Name */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                {t.yourName}
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={t.namePlaceholder}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                required
              />
            </div>

            {/* Mobile with Country Code */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                {t.phoneNumber}
              </label>
              <div className="flex items-center gap-1.5">
                <CountryCodeSelect
                  value={countryCode}
                  onChange={setCountryCode}
                />
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={countryCode === '+91' ? 10 : 15}
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(sanitizePhoneInput(e.target.value))}
                  placeholder={countryCode === '+91' ? '9876543210' : 'Mobile number'}
                  className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  required
                />
              </div>
            </div>

            {/* Kerala Location */}
            <KeralaLocationSelect
              district={district}
              city={city}
              onDistrictChange={setDistrict}
              onCityChange={setCity}
            />

            {/* Target Deadline */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Target Deadline <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                type="date"
                value={deadline}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/80 rounded-xl text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500/50 [color-scheme:dark]"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#2A835F] hover:bg-[#236D4F] text-white py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md cursor-pointer mt-1 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t.submitting}</span>
                </>
              ) : (
                <>
                  <span>{language === 'ml' ? 'അന്വേഷിക്കുക' : 'Enquire Now'}</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
