'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  ArrowRight,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ChevronDown,
  Layers,
  X,
  Clock,
} from 'lucide-react';
import { EnquiryService } from '@/services/enquiry.service';
import { useLanguage } from '@/context/language-context';
import { translations } from '@/utils/translations';
import { StylishDropdown } from '@/components/Common/StylishDropdown';
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

export function EnquiryBox({
  isOpen,
  onClose,
  initialService,
  className = '',
  onEnquirySuccess,
}: EnquiryBoxProps) {
  const { language } = useLanguage();
  const toast = useToast();
  const t = translations[language].enquiry;

  const SERVICE_OPTIONS = [
    {
      id: 'cococare',
      name: t.servicesList.cococare,
      defaultScale: '1 Squad (4 Climbers)',
    },
    {
      id: 'jcb',
      name: t.servicesList.jcb,
      defaultScale: '1 Heavy JCB Excavator',
    },
    {
      id: 'plastering',
      name: t.servicesList.plastering,
      defaultScale: '6 Craft Operatives',
    },
    {
      id: 'painting',
      name: t.servicesList.painting,
      defaultScale: '4 Painters Squad',
    },
    {
      id: 'tiling',
      name: t.servicesList.tile,
      defaultScale: '4 Tiling Specialists',
    },
    {
      id: 'trenching',
      name: t.servicesList.plumbing,
      defaultScale: '1 Machine + 2 Operators',
    },
    {
      id: 'electrical',
      name: t.servicesList.electrical,
      defaultScale: '2 Electricians',
    },
  ];

  const [selectedServiceId, setSelectedServiceId] = useState('cococare');
  const [customerName, setCustomerName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [district, setDistrict] = useState('Kasaragod');
  const [city, setCity] = useState('');
  const [deadline, setDeadline] = useState('');
  const [messageNotes, setMessageNotes] = useState('');

  // Pre-select service if passed from hero card or other triggers
  useEffect(() => {
    if (initialService) {
      const lower = initialService.toLowerCase();
      const matched = SERVICE_OPTIONS.find(
        (s) =>
          s.id.toLowerCase().includes(lower) ||
          s.name.toLowerCase().includes(lower) ||
          lower.includes(s.id.toLowerCase())
      );
      if (matched) {
        setSelectedServiceId(matched.id);
      }
    }
  }, [initialService]);

  const currentService =
    SERVICE_OPTIONS.find((s) => s.id === selectedServiceId) || SERVICE_OPTIONS[0];
  const [squadScale, setSquadScale] = useState(currentService.defaultScale);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim()) {
      const title =
        language === 'ml' ? 'നിങ്ങളുടെ പേര് നൽകുക' : 'Customer Name Required';
      const msg =
        language === 'ml'
          ? 'സേവനം ബുക്ക് ചെയ്യുന്നതിനായി നിങ്ങളുടെ പേര് രേഖപ്പെടുത്തുക.'
          : 'Please provide your name to continue.';
      setErrorMessage(msg);
      toast.warning(title, msg);
      return;
    }

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
            ? 'ദയവായി സാധുവായ 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക.'
            : 'Please provide a valid 10-digit mobile number.');
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
        customerEmail: customerEmail.trim() || undefined,
        state: 'Kerala',
        district,
        city: city.trim() || undefined,
        location: locationString,
        deadline: deadline || undefined,
        message: `Service: ${currentService.name} | Scale: ${squadScale} | Location: ${locationString}${
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

      toast.success(
        language === 'ml'
          ? 'അന്വേഷണം വിജയകരമായി അയച്ചു!'
          : 'Enquiry Dispatched Successfully!',
        language === 'ml'
          ? `റഫറൻസ് നമ്പർ: ${refCode}. ഞങ്ങളുടെ ടീം ഉടൻ നിങ്ങളെ വിളിക്കുന്നതാണ്.`
          : `Reference ID: ${refCode}. Operations team will contact you shortly.`
      );
    } catch (err: any) {
      console.error('Failed to submit enquiry:', err);
      const title =
        language === 'ml'
          ? 'സമർപ്പണത്തിൽ തടസ്സം നേരിട്ടു'
          : 'Enquiry Submission Failed';
      const msg =
        err?.message ||
        (language === 'ml'
          ? 'അന്വേഷണം സമർപ്പിക്കുന്നതിൽ പിശക് സംഭവിച്ചു. ദയവായി വീണ്ടും ശ്രമിക്കുക.'
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
    setCustomerEmail('');
    setCity('');
    setDeadline('');
    setMessageNotes('');
  };

  if (isOpen === false) return null;

  const cardContent = (
    <div
      id="enquiry-card"
      className={`w-full max-w-[480px] bg-[#0c1310] rounded-[32px] p-6 sm:p-7 shadow-[0_25px_60px_rgba(42,131,95,0.25)] border border-emerald-500/30 flex flex-col gap-4 text-white relative ${className}`}
    >
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
              {t.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              {t.liveDispatch}
            </span>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-1 font-medium">
          {t.subtitle}
        </p>
      </div>

      {/* Success View */}
      {submittedRef ? (
        <div className="bg-[#101b15] border border-emerald-500/30 rounded-2xl p-6 text-center space-y-3.5 animate-in fade-in zoom-in duration-300">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{t.successTitle}</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {language === 'ml' ? 'നിങ്ങളുടെ ട്രാക്കിംഗ് നമ്പർ:' : 'Your tracking reference is:'}{' '}
              <strong className="font-mono text-emerald-400 text-sm block mt-1 tracking-wider">
                {submittedRef}
              </strong>
            </p>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            {t.successMsg}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
            >
              {t.submitAnother}
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-1.5 px-4 rounded-full transition-all cursor-pointer"
              >
                {language === 'ml' ? 'അടയ്ക്കുക' : 'Close'}
              </button>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {errorMessage && (
            <div className="text-xs text-rose-300 bg-rose-950/60 border border-rose-500/30 rounded-xl p-2.5 text-center font-medium">
              {errorMessage}
            </div>
          )}

          {/* 1. Service Choosing Dropdown */}
          <div className="flex flex-col w-full">
            <StylishDropdown
              options={SERVICE_OPTIONS.map((s) => ({
                id: s.id,
                label: s.name,
                subtitle: s.defaultScale,
              }))}
              value={selectedServiceId}
              onChange={(id) => {
                setSelectedServiceId(id);
                const matched = SERVICE_OPTIONS.find((s) => s.id === id);
                if (matched) setSquadScale(matched.defaultScale);
              }}
              label={t.chooseService}
              variant="boxed"
            />
          </div>

          {/* 2. Full Name & Phone Number with Country Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Name */}
            <div className="bg-slate-900/60 border border-slate-700/80 rounded-2xl p-2.5 px-3.5 flex flex-col focus-within:border-emerald-500">
              <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-0.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.yourName}</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={t.namePlaceholder}
                required
                className="bg-transparent text-white text-xs font-bold placeholder:text-slate-500 outline-none w-full mt-0.5"
              />
            </div>

            {/* Mobile with Searchable Country Code */}
            <div className="bg-slate-900/60 border border-slate-700/80 rounded-2xl p-2.5 px-3 flex flex-col focus-within:border-emerald-500">
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t.phoneNumber}</span>
                </label>
                {countryCode === '+91' && (
                  <span className="text-[9px] font-bold text-slate-500">
                    {customerPhone.length > 0 ? `${customerPhone.length}/10` : '10 Digits'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
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
                  required
                  className="bg-transparent text-white text-xs font-bold placeholder:text-slate-500 outline-none w-full tracking-wider"
                />
              </div>
            </div>
          </div>

          {/* 3. Kerala Location Select (Kasaragod Default, Search & Select, Custom Typing) */}
          <KeralaLocationSelect
            district={district}
            city={city}
            onDistrictChange={setDistrict}
            onCityChange={setCity}
          />

          {/* 4. Target Deadline (Optional) & Email (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Target Deadline */}
            <div className="bg-slate-900/60 border border-slate-700/80 rounded-2xl p-2.5 px-3.5 flex flex-col focus-within:border-emerald-500">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-0.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Target Deadline</span>
              </label>
              <input
                type="date"
                value={deadline}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDeadline(e.target.value)}
                className="bg-transparent text-white text-xs font-medium outline-none w-full mt-0.5 [color-scheme:dark]"
              />
            </div>

            {/* Email (Optional) */}
            <div className="bg-slate-900/60 border border-slate-700/80 rounded-2xl p-2.5 px-3.5 flex flex-col focus-within:border-emerald-500">
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Email</span>
                </label>
                <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
                  Optional
                </span>
              </div>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="you@domain.com"
                className="bg-transparent text-white text-xs font-medium placeholder:text-slate-500 outline-none w-full mt-0.5"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#2A835F] hover:bg-[#236D4F] text-white font-bold text-xs sm:text-sm py-3.5 rounded-2xl shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 mt-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-60"
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
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
