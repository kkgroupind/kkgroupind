'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  ArrowRight,
  User,
  Phone,
  Mail,
  Calendar,
  X,
  Clock,
  Layers,
} from 'lucide-react';
import { EnquiryService } from '@/services/enquiry.service';
import { adminServicesService } from '@/services/Admin/services';
import { useLanguage } from '@/context/language-context';
import { translations } from '@/utils/translations';
import { CustomerDropdown, CustomerDropdownOption } from '@/components/Common/CustomerDropdown';
import { CountryCodeSelect } from '@/components/Common/CountryCodeSelect';
import { KeralaLocationSelect } from '@/components/Common/KeralaLocationSelect';
import { validateMobileNumber, sanitizePhoneInput } from '@/validations';
import { useToast } from '@/context/toast-context';

interface EnquiryBoxProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialService?: string;
  className?: string;
  onEnquirySuccess?: (trackingCode: string) => void;
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
  'jcb-excavator': '/Banners/jcb.png',
  'jcb-excavation': '/Banners/jcb.png',
  plastering: '/Banners/plastering.png',
  'plastering-masonry': '/Banners/plastering.png',
  masonry: '/Banners/masonry.png',
  painting: '/Banners/painting.png',
  tile: '/Banners/tiling.png',
  tiling: '/Banners/tiling.png',
  trenching: '/Banners/plumbing.png',
  plumbing: '/Banners/plumbing.png',
  electrical: '/Banners/electrical.png',
  'electrical-mep': '/Banners/electrical.png',
  borewell: '/Banners/borewell.png',
};

export function EnquiryBox({
  isOpen,
  onClose,
  initialService,
  className = '',
  onEnquirySuccess,
}: EnquiryBoxProps) {
  const { language } = useLanguage();
  const { success, error, warning } = useToast();
  const t = translations[language].enquiry;

  const [serviceOptions, setServiceOptions] = useState<CustomerDropdownOption[]>(CUSTOMER_SERVICES);

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
          setServiceOptions(mapped);
        }
      })
      .catch(() => {
        // Fallback to defaults
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const [selectedServiceId, setSelectedServiceId] = useState('cococare');
  const [customerName, setCustomerName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [district, setDistrict] = useState('Kasaragod');
  const [city, setCity] = useState('');
  const [deadline, setDeadline] = useState('');
  const [messageNotes, setMessageNotes] = useState('');

  // Pre-select service if passed from triggers
  useEffect(() => {
    if (initialService) {
      const lower = initialService.toLowerCase();
      const matched = serviceOptions.find(
        (s) =>
          s.id.toLowerCase().includes(lower) ||
          s.name.toLowerCase().includes(lower) ||
          lower.includes(s.id.toLowerCase())
      );
      if (matched) {
        setSelectedServiceId(matched.id);
      }
    }
  }, [initialService, serviceOptions]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const currentService =
    serviceOptions.find((s) => s.id === selectedServiceId) || serviceOptions[0] || CUSTOMER_SERVICES[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      warning(
        language === 'ml' ? 'നിങ്ങളുടെ പേര് നൽകുക' : 'Customer Name Required',
        'Please enter your full name to proceed with the enquiry.'
      );
      return;
    }

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
        customerEmail: customerEmail.trim() || undefined,
        state: 'Kerala',
        district,
        city: city.trim() || undefined,
        location: locationString,
        preferredDate: deadline || 'Immediate / Flexible',
        message: `Service: ${currentService.name} | Location: ${locationString}${
          deadline ? ` | Target Deadline: ${deadline}` : ''
        }${messageNotes.trim() ? ` | Notes: ${messageNotes.trim()}` : ''}`,
      });

      const refCode =
        res.enquiry?.trackingNumber ||
        (res.enquiry?.id ? `ENQ-${res.enquiry.id.slice(0, 8).toUpperCase()}` : null) ||
        `ENQ-${Math.floor(100000 + Math.random() * 900000)}`;

      setSubmittedRef(refCode);
      if (onEnquirySuccess) {
        onEnquirySuccess(refCode);
      }

      success(
        language === 'ml' ? 'അന്വേഷണം വിജയകരമായി അയച്ചു!' : 'Enquiry Dispatched Successfully!',
        language === 'ml'
          ? `റഫറൻസ് നമ്പർ: ${refCode}. ഞങ്ങളുടെ ടീം ഉടൻ നിങ്ങളെ വിളിക്കുന്നതാണ്.`
          : `Reference ID: ${refCode}. Operations team will contact you shortly.`
      );
    } catch {
      error(
        language === 'ml' ? 'സമർപ്പണത്തിൽ തടസ്സം നേരിട്ടു' : 'Enquiry Submission Failed',
        language === 'ml'
          ? 'അന്വേഷണം സമർപ്പിക്കുന്നതിൽ പിശക് സംഭവിച്ചു. ദയവായി വീണ്ടും ശ്രമിക്കുക.'
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
    setCustomerEmail('');
    setCity('');
    setDeadline('');
    setMessageNotes('');
  };

  if (isOpen === false) return null;

  const cardContent = (
    <div
      id="enquiry-card"
      className={`w-full max-w-[500px] bg-white rounded-3xl sm:rounded-[36px] p-6 sm:p-8 shadow-2xl border-2 border-slate-200/90 flex flex-col gap-4 text-slate-800 relative font-sans antialiased ${className}`}
    >
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              {t.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#2A835F] bg-[#EBF6F1] border border-[#C3E6D5] px-2.5 py-0.5 rounded-full">
              {t.liveDispatch}
            </span>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-1 font-normal leading-relaxed">
          {t.subtitle}
        </p>
      </div>

      {/* Success View */}
      {submittedRef ? (
        <div className="bg-[#EBF6F1]/50 border-2 border-[#C3E6D5] rounded-2xl p-6 text-center space-y-3.5 animate-in fade-in zoom-in duration-200">
          <div className="w-12 h-12 rounded-full bg-[#EBF6F1] text-[#2A835F] flex items-center justify-center mx-auto border border-[#C3E6D5]">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{t.successTitle}</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {language === 'ml' ? 'നിങ്ങളുടെ ട്രാക്കിംഗ് നമ്പർ:' : 'Your tracking reference is:'}{' '}
              <strong className="font-mono text-[#2A835F] text-sm block mt-1 tracking-wider">
                {submittedRef}
              </strong>
            </p>
          </div>
          <p className="text-xs text-slate-600 leading-normal">
            {t.successMsg}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-bold text-[#2A835F] hover:underline cursor-pointer"
            >
              {t.submitAnother}
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="bg-[#2A835F] hover:bg-[#236D4F] text-white text-xs font-bold py-2 px-5 rounded-full transition-all cursor-pointer shadow-sm"
              >
                {language === 'ml' ? 'അടയ്ക്കുക' : 'Close'}
              </button>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* 1. Special Customer Service Dropdown (Big Image & Two Lines) */}
          <div className="flex flex-col w-full">
            <CustomerDropdown
              options={serviceOptions}
              value={selectedServiceId}
              onChange={setSelectedServiceId}
              label={t.chooseService}
              placeholder="Select required service squad..."
              language={language}
            />
          </div>

          {/* 2. Full Name & Phone Number with Country Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Name */}
            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                {t.yourName}
              </label>
              <div className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100/80 focus-within:bg-white focus-within:border-[#2A835F] focus-within:ring-2 focus-within:ring-[#2A835F]/15 border border-slate-300/90 rounded-xl px-3 py-2.5 transition-all">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  required
                  className="bg-transparent text-slate-900 text-xs font-semibold placeholder:text-slate-400 outline-none w-full"
                />
              </div>
            </div>

            {/* Mobile with Searchable Country Code */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {t.phoneNumber}
                </label>
                {countryCode === '+91' && (
                  <span className="text-[10px] font-medium text-slate-400">
                    {customerPhone.length > 0 ? `${customerPhone.length}/10` : '10 Digits'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100/80 focus-within:bg-white focus-within:border-[#2A835F] focus-within:ring-2 focus-within:ring-[#2A835F]/15 border border-slate-300/90 rounded-xl px-2 py-1 transition-all">
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
                  required
                  className="bg-transparent text-slate-900 text-xs font-bold placeholder:text-slate-400 outline-none w-full tracking-wider py-1.5"
                />
              </div>
            </div>
          </div>

          {/* 3. Kerala Location Select (District + City) */}
          <KeralaLocationSelect
            district={district}
            city={city}
            onDistrictChange={setDistrict}
            onCityChange={setCity}
            theme="light"
            language={language}
          />

          {/* 4. Target Date (Optional) & Email (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Target Date */}
            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                {language === 'ml' ? 'ആവശ്യമുള്ള തീയതി' : 'Target Date'}{' '}
                <span className="text-slate-400 font-normal">
                  ({language === 'ml' ? 'ഓപ്ഷണൽ' : 'Optional'})
                </span>
              </label>
              <div className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-300/90 rounded-xl px-3 py-2.5 focus-within:border-[#2A835F] focus-within:ring-1 focus-within:ring-[#2A835F]/20">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="date"
                  value={deadline}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="bg-transparent text-slate-900 text-xs font-medium outline-none w-full [color-scheme:light]"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {language === 'ml' ? 'ഇമെയിൽ' : 'Email'}
                </label>
                <span className="text-[10px] text-slate-400">
                  {language === 'ml' ? 'ഓപ്ഷണൽ' : 'Optional'}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100/80 focus-within:bg-white focus-within:border-[#2A835F] focus-within:ring-2 focus-within:ring-[#2A835F]/15 border border-slate-300/90 rounded-xl px-3 py-2.5 transition-all">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="e.g. client@example.com"
                  className="bg-transparent text-slate-900 text-xs font-medium placeholder:text-slate-400 outline-none w-full"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#2A835F] hover:bg-[#236D4F] text-white font-bold text-xs sm:text-sm py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 mt-1 transition-all cursor-pointer active:scale-95 disabled:opacity-60"
          >
            <span>{isSubmitting ? t.submitting : t.submitBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );

  // If used as modal
  if (isOpen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
        <div
          className="fixed inset-0"
          onClick={onClose}
          aria-hidden="true"
        />
        <div className="relative z-10 my-auto">
          {cardContent}
        </div>
      </div>
    );
  }

  return cardContent;
}
