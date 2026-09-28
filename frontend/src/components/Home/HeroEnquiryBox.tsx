'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  Phone,
  User,
  Clock,
  Send,
} from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { translations } from '@/utils/translations';
import { EnquiryService } from '@/services/enquiry.service';
import { adminServicesService } from '@/services/Admin/services';
import { CustomerDropdown, CustomerDropdownOption } from '@/components/Common/CustomerDropdown';
import { CountryCodeSelect } from '@/components/Common/CountryCodeSelect';
import { KeralaLocationSelect } from '@/components/Common/KeralaLocationSelect';
import { validateMobileNumber, sanitizePhoneInput } from '@/validations';
import { useToast } from '@/context/toast-context';

interface HeroEnquiryBoxProps {
  onSuccess?: (trackingCode: string) => void;
  className?: string;
}

import {
  CUSTOMER_SERVICES,
  getServiceMalayalamName,
  getServiceBanner,
} from '@/utils/service-options';

const DEFAULT_SERVICE_IMAGES: Record<string, string> = {
  cococare: '/Banners/coco.png',
  coconut: '/Banners/coco.png',
  'coconut-plucking': '/Banners/coco.png',
  jcb: '/Banners/jcb.png',
  'jcb-excavation': '/Banners/jcb.png',
  plastering: '/Banners/plastering.png',
  'plastering-masonry': '/Banners/plastering.png',
  masonry: '/Banners/masonry.png',
  painting: '/Banners/painting.png',
  tile: '/Banners/tiling.png',
  tiling: '/Banners/tiling.png',
  electrical: '/Banners/electrical.png',
  'electrical-mep': '/Banners/electrical.png',
  plumbing: '/Banners/plumbing.png',
  borewell: '/Banners/borewell.png',
  'borewell-survey': '/Banners/borewell.png',
};

export function HeroEnquiryBox({ onSuccess, className = '' }: HeroEnquiryBoxProps) {
  const { language } = useLanguage();
  const { success, error, warning } = useToast();
  const t = translations[language].enquiry;

  const [servicesList, setServicesList] = useState<CustomerDropdownOption[]>(CUSTOMER_SERVICES);

  useEffect(() => {
    let isMounted = true;
    adminServicesService
      .listPublicServices()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const mapped: CustomerDropdownOption[] = data.map((s) => {
            const serviceKey = s.name || s.slug || s.serviceId || s.id;
            return {
              id: s.slug || s.serviceId || s.id,
              name: s.name,
              nameMl: getServiceMalayalamName(serviceKey),
              image:
                s.image?.startsWith('/Banners/')
                  ? s.image
                  : getServiceBanner(serviceKey),
            };
          });
          setServicesList(mapped);
        }
      })
      .catch(() => {
        // Silently preserve default services
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const [selectedServiceId, setSelectedServiceId] = useState(CUSTOMER_SERVICES[0].id);
  const [customerName, setCustomerName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [customerPhone, setCustomerPhone] = useState('');
  const [district, setDistrict] = useState('Kasaragod');
  const [city, setCity] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const currentService =
    servicesList.find((s) => s.id === selectedServiceId) || servicesList[0] || CUSTOMER_SERVICES[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      const msg = 'Please enter your full name to proceed with the enquiry.';
      warning(language === 'ml' ? 'നിങ്ങളുടെ പേര് നൽകുക' : 'Customer Name Required', msg);
      return;
    }

    // Phone validation
    if (countryCode === '+91') {
      const phoneValidation = validateMobileNumber(customerPhone, language);
      if (!phoneValidation.isValid) {
        warning(
          phoneValidation.title || (language === 'ml' ? 'മൊബൈൽ നമ്പർ പരിശോധിക്കുക' : 'Invalid Mobile Number'),
          phoneValidation.error || 'Please enter a valid 10-digit mobile number'
        );
        return;
      }
    } else if (customerPhone.trim().length < 6) {
      warning('Invalid Mobile Number', 'Please enter a valid international mobile number.');
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
        preferredDate: deadline || 'Immediate / Flexible',
        message: `Quick enquiry for ${currentService.name}. Location: ${locationString}${
          deadline ? `. Target Deadline: ${deadline}` : ''
        }`,
      });

      const trackingCode =
        res.enquiry?.trackingNumber ||
        (res.enquiry?.id ? `ENQ-${res.enquiry.id.slice(0, 8).toUpperCase()}` : null) ||
        `ENQ-${Math.floor(100000 + Math.random() * 900000)}`;

      setSubmittedRef(trackingCode);
      onSuccess?.(trackingCode);

      success(
        language === 'ml' ? 'അന്വേഷണം വിജയകരമായി അയച്ചു!' : 'Enquiry Dispatched Successfully!',
        language === 'ml'
          ? `ട്രാക്കിംഗ് നമ്പർ: ${trackingCode}. ഞങ്ങളുടെ ടീം ഉടൻ നിങ്ങളെ വിളിക്കുന്നതാണ്.`
          : `Tracking ID: ${trackingCode}. Our operations coordinator will call you shortly.`
      );
    } catch {
      error(
        language === 'ml' ? 'സമർപ്പണത്തിൽ തടസ്സം നേരിട്ടു' : 'Enquiry Dispatch Failed',
        language === 'ml'
          ? 'അന്വേഷണം സമർപ്പിക്കുന്നതിൽ തടസ്സം നേരിട്ടു. ദയവായി വീണ്ടും ശ്രമിക്കുക.'
          : 'Failed to submit enquiry. Please check your connection and try again.'
      );
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
  };

  return (
    <div className={`w-full font-sans antialiased ${className}`}>
      {/* ========================================================
          DESKTOP & LARGE SCREENS: Crisp White Bento Container
      ======================================================== */}
      <div className="hidden lg:block w-full">
        {submittedRef ? (
          <div className="w-full bg-white border-2 border-[#C3E6D5] rounded-3xl p-6 px-8 shadow-xl flex items-center justify-between gap-6 text-slate-900 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF6F1] border border-[#C3E6D5] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7 text-[#2A835F]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2A835F]">
                    {language === 'ml' ? 'അന്വേഷണം സ്വീകരിച്ചു' : 'Enquiry Dispatched'}
                  </span>
                  <span className="font-mono text-xs font-bold bg-[#EBF6F1] text-[#2A835F] px-2.5 py-0.5 rounded-full border border-[#C3E6D5]">
                    REF: {submittedRef}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-700 truncate">
                  {t.successMsg}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="bg-[#2A835F] hover:bg-[#236D4F] text-white px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider transition-all active:scale-95 shadow-sm shrink-0 cursor-pointer"
            >
              {t.submitAnother}
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="w-full bg-white border-2 border-slate-200/90 rounded-[32px] p-6 shadow-xl flex flex-col gap-4 text-slate-800 transition-all hover:border-[#2A835F]/60"
          >
            {/* Top Row: Special Service Dropdown with Big Image & Two-Line Text */}
            <div className="grid grid-cols-12 gap-4 items-center">
              {/* Field 1: Service Dropdown (Width: 5 Columns) */}
              <div className="col-span-5">
                <CustomerDropdown
                  options={servicesList}
                  value={selectedServiceId}
                  onChange={setSelectedServiceId}
                  label={t.chooseService}
                  placeholder="Select required service squad..."
                  language={language}
                />
              </div>

              {/* Field 2: Customer Name (Width: 3 Columns) */}
              <div className="col-span-3 flex flex-col">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 truncate">
                  {t.yourName}
                </label>
                <div className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100/80 focus-within:bg-white focus-within:border-[#2A835F] focus-within:ring-2 focus-within:ring-[#2A835F]/15 border border-slate-300/90 rounded-2xl px-3.5 py-3 transition-all">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full text-xs font-semibold text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Field 3: Phone with Searchable Country Code (Width: 4 Columns) */}
              <div className="col-span-4 flex flex-col">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {t.phoneNumber}
                  </label>
                  {countryCode === '+91' && (
                    <span className="text-[10px] font-medium text-slate-400">
                      {customerPhone.length > 0
                        ? (language === 'ml' ? `${customerPhone.length}/10 അക്കങ്ങൾ` : `${customerPhone.length}/10 Digits`)
                        : (language === 'ml' ? '10 അക്കങ്ങൾ' : '10 Digits')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100/80 focus-within:bg-white focus-within:border-[#2A835F] focus-within:ring-2 focus-within:ring-[#2A835F]/15 border border-slate-300/90 rounded-2xl px-2.5 py-1.5 transition-all">
                  <div className="shrink-0">
                    <CountryCodeSelect
                      value={countryCode}
                      onChange={setCountryCode}
                      theme="light"
                    />
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={countryCode === '+91' ? 10 : 15}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(sanitizePhoneInput(e.target.value))}
                    placeholder="98765 43210"
                    className="w-full text-xs font-bold text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none tracking-wider py-1.5"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Bottom Row: Kerala District/City, Optional Target Deadline & Submit CTA */}
            <div className="grid grid-cols-12 gap-4 items-end pt-2 border-t border-slate-100">
              {/* Kerala Location Select (District + City) */}
              <div className="col-span-6">
                <KeralaLocationSelect
                  district={district}
                  city={city}
                  onDistrictChange={setDistrict}
                  onCityChange={setCity}
                  theme="light"
                  language={language}
                />
              </div>

              {/* Target Date / Deadline */}
              <div className="col-span-3 flex flex-col">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  {language === 'ml' ? 'ആവശ്യമുള്ള തീയതി' : 'Target Date'}{' '}
                  <span className="text-slate-400 font-normal">
                    ({language === 'ml' ? 'ഓപ്ഷണൽ' : 'Optional'})
                  </span>
                </label>
                <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-300/90 rounded-xl focus-within:border-[#2A835F] focus-within:ring-1 focus-within:ring-[#2A835F]/20">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="date"
                    value={deadline}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-transparent text-xs font-medium text-slate-800 focus:outline-none [color-scheme:light]"
                  />
                </div>
              </div>

              {/* Submit CTA Button */}
              <div className="col-span-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#2A835F] hover:bg-[#236D4F] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-60"
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
      </div>

      {/* ========================================================
          MOBILE VIEW: Clean White Vertical Card
      ======================================================== */}
      <div className="block lg:hidden w-full max-w-md mx-auto">
        {submittedRef ? (
          <div className="w-full bg-white border-2 border-[#C3E6D5] rounded-3xl p-6 shadow-xl text-slate-900 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-[#EBF6F1] border border-[#C3E6D5] flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8 text-[#2A835F]" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#2A835F]">
              {language === 'ml' ? 'അന്വേഷണം ലഭിച്ചു!' : 'Enquiry Received!'}
            </span>
            <span className="font-mono text-xs font-bold bg-[#EBF6F1] text-[#2A835F] px-3 py-1 rounded-full block w-fit mx-auto mt-1 mb-2 border border-[#C3E6D5]">
              REF: {submittedRef}
            </span>
            <p className="text-xs font-medium text-slate-600 leading-relaxed mb-4">
              {t.successMsg}
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="w-full bg-[#2A835F] hover:bg-[#236D4F] text-white py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md cursor-pointer"
            >
              {t.submitAnother}
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="w-full bg-white border-2 border-slate-200/90 rounded-3xl p-5 shadow-xl text-slate-800 flex flex-col gap-3.5"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="inline-flex items-center gap-1.5 bg-[#EBF6F1] text-[#2A835F] px-3 py-1 rounded-full text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2A835F]" />
                <span>{language === 'ml' ? 'ദ്രുത അന്വേഷണം' : 'Quick Service Enquiry'}</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                Kerala Operations
              </span>
            </div>

            {/* Service Dropdown */}
            <div>
              <CustomerDropdown
                options={servicesList}
                value={selectedServiceId}
                onChange={setSelectedServiceId}
                label={t.chooseService}
                placeholder="Select required service squad..."
                language={language}
              />
            </div>

            {/* Name */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                {t.yourName}
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-300/90 rounded-xl text-slate-900 placeholder-slate-400 text-xs font-semibold focus:outline-none focus:border-[#2A835F] focus:ring-1 focus:ring-[#2A835F]/20"
                required
              />
            </div>

            {/* Mobile with Country Code */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                {t.phoneNumber}
              </label>
              <div className="flex items-center gap-2">
                <CountryCodeSelect
                  value={countryCode}
                  onChange={setCountryCode}
                  theme="light"
                />
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={countryCode === '+91' ? 10 : 15}
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(sanitizePhoneInput(e.target.value))}
                  placeholder="98765 43210"
                  className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-300/90 rounded-xl text-slate-900 placeholder-slate-400 text-xs font-bold focus:outline-none focus:border-[#2A835F] focus:ring-1 focus:ring-[#2A835F]/20 tracking-wider"
                  required
                />
              </div>
            </div>

            {/* Kerala Location Select */}
            <KeralaLocationSelect
              district={district}
              city={city}
              onDistrictChange={setDistrict}
              onCityChange={setCity}
              theme="light"
              language={language}
            />

            {/* Target Date */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                {language === 'ml' ? 'ആവശ്യമുള്ള തീയതി' : 'Target Date'}{' '}
                <span className="text-slate-400 font-normal">
                  ({language === 'ml' ? 'ഓപ്ഷണൽ' : 'Optional'})
                </span>
              </label>
              <input
                type="date"
                value={deadline}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-300/90 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:border-[#2A835F] focus:ring-1 focus:ring-[#2A835F]/20 [color-scheme:light]"
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
