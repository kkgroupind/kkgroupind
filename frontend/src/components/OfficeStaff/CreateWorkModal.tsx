'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Briefcase,
  X,
  Plus,
  Loader2,
  HardHat,
  MapPin,
  Calendar,
  Phone,
  Mail,
  User,
  AlertCircle,
  FileText,
  Clock,
  Navigation,
  Search,
  ChevronDown,
  Check,
} from 'lucide-react';
import {
  EnquiryService,
  WorkerWithAvailability,
} from '@/services';
import { CountryCodeSelect } from '@/components/Common/CountryCodeSelect';
import { KeralaLocationSelect } from '@/components/Common/KeralaLocationSelect';
import { sanitizePhoneInput } from '@/validations';
import { AdminDropdown, AdminDropdownOption } from '@/components/Admin/admin-dropdown';

export interface CreateWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (msg: string) => void;
  token: string | null;
  workers?: WorkerWithAvailability[];
}

export interface ServiceCatalogItem {
  id: string;
  title: string;
  titleMl: string;
  category: string;
  image: string;
}

export const SERVICES_CATALOG: ServiceCatalogItem[] = [
  {
    id: 'cococare',
    title: 'Cococare - Palm Tree Harvesting & Maintenance',
    titleMl: 'തെങ്ങ് കയറ്റവും തെങ്ങ് വൃത്തിയാക്കലും',
    category: 'Agriculture',
    image: '/Banners/coco.png',
  },
  {
    id: 'jcb',
    title: 'JCB Heavy Machinery & Earth Excavation',
    titleMl: 'ജെസിബി മണ്ണെടുപ്പും നിരപ്പാക്കലും',
    category: 'Heavy Machinery',
    image: '/Banners/jcb.png',
  },
  {
    id: 'plastering',
    title: 'Plastering & Surface Finishing Squad',
    titleMl: 'തേപ്പ് പണിയും കട്ടകെട്ടും (പ്ലാസ്റ്ററിംഗ്)',
    category: 'Masonry & Finishing',
    image: '/Banners/plastering.png',
  },
  {
    id: 'painting',
    title: 'Commercial & Residential Painting',
    titleMl: 'വീടും കെട്ടിടങ്ങളും പെയിന്റിംഗ് പണികൾ',
    category: 'Architectural Coating',
    image: '/Banners/painting.png',
  },
  {
    id: 'tile',
    title: 'Tile, Marble & Granite Laying',
    titleMl: 'ടൈൽ, മാർബിൾ & ഗ്രാനൈറ്റ് ഒട്ടിക്കൽ',
    category: 'Flooring & Tiling',
    image: '/Banners/tiling.png',
  },
  {
    id: 'electrical',
    title: 'Electrical & Wiring Systems',
    titleMl: 'ഇലക്ട്രിക്കൽ വയറിംഗും ഫിറ്റിംഗും',
    category: 'MEP Electrical',
    image: '/Banners/electrical.png',
  },
  {
    id: 'plumbing',
    title: 'Plumbing & High-Pressure Piping',
    titleMl: 'പ്ലംബിംഗ് & പൈപ്പ് ലൈൻ പണികൾ',
    category: 'Sanitary & Piping',
    image: '/Banners/plumbing.png',
  },
  {
    id: 'borewell',
    title: 'Borewell Drilling & Water Testing',
    titleMl: 'കുഴൽക്കിണർ നിർമ്മാണവും വെള്ളം കണ്ടെത്തലും',
    category: 'Water Drilling',
    image: '/Banners/borewell.png',
  },
  {
    id: 'masonry',
    title: 'Structural Masonry & Brick Construction',
    titleMl: 'കട്ടകെട്ടും മേസൺ പണികളും',
    category: 'Civil & Masonry',
    image: '/Banners/masonry.png',
  },
];

export function CreateWorkModal({
  isOpen,
  onClose,
  onCreated,
  token,
  workers = [],
}: CreateWorkModalProps) {
  const [serviceName, setServiceName] = useState(SERVICES_CATALOG[0].title);
  const [isServicePickerOpen, setIsServicePickerOpen] = useState(false);
  const [serviceSearch, setServiceSearch] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [district, setDistrict] = useState('Kasaragod');
  const [city, setCity] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [deadline, setDeadline] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [message, setMessage] = useState('');
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedServiceObj =
    SERVICES_CATALOG.find((s) => s.title === serviceName || s.id === serviceName) ||
    SERVICES_CATALOG[0];

  if (!isOpen) return null;

  const availableWorkers = workers.filter((w) => w.workerStatus === 'AVAILABLE');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !message.trim()) {
      setError('Please provide customer name, phone number, and work details');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const fullPhone = `${countryCode} ${customerPhone.trim()}`;
      const locationString = [city.trim(), district, 'Kerala'].filter(Boolean).join(', ');

      const createdRes = await EnquiryService.createEnquiry(
        {
          serviceName,
          customerName: customerName.trim(),
          customerPhone: fullPhone,
          customerEmail: customerEmail.trim() || undefined,
          state: 'Kerala',
          district,
          city: city.trim() || undefined,
          location: locationString,
          mapUrl: mapUrl.trim() || undefined,
          deadline: deadline || undefined,
          preferredDate: preferredDate || undefined,
          message: message.trim(),
        },
        token,
      );

      const enquiryId = createdRes.enquiry?.id;

      if (selectedWorkerId && enquiryId && token) {
        await EnquiryService.assignWorker(
          enquiryId,
          {
            workerId: selectedWorkerId,
            notes: notes.trim() || undefined,
            mapUrl: mapUrl.trim() || undefined,
            deadline: deadline || undefined,
          },
          undefined,
          token,
        );
      }

      onCreated(
        selectedWorkerId
          ? 'Work order created and worker assigned.'
          : 'Work order created successfully. Tracking ID: ' +
              (createdRes.enquiry?.trackingNumber || ''),
      );
      onClose();
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setCity('');
      setMapUrl('');
      setDeadline('');
      setPreferredDate('');
      setMessage('');
      setSelectedWorkerId('');
      setNotes('');
    } catch (err: any) {
      setError(err?.message || 'Failed to create work order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-2xl bg-white border border-[#7692FF]/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 text-slate-800">
        {/* Top subtle glow line matching brand palette */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#1B2CC1]/50 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1B2CC1]/10 border border-[#1B2CC1]/20 flex items-center justify-center text-[#1B2CC1]">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#091540]">
                Create &amp; Dispatch Work Order
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Log direct client enquiry and optionally assign field personnel
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-[#091540] bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar text-xs">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Service Selection with Images */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700">
                Service Catalog *
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                Kasaragod operational squads
              </span>
            </div>

            {/* Selected Service Card */}
            <div
              onClick={() => setIsServicePickerOpen(!isServicePickerOpen)}
              className="p-3 bg-slate-50 hover:bg-slate-100/90 border border-slate-200 hover:border-[#1B2CC1]/50 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-white shadow-xs">
                  <Image
                    src={selectedServiceObj.image}
                    alt={selectedServiceObj.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#1B2CC1]/10 text-[#1B2CC1] border border-[#1B2CC1]/20">
                      {selectedServiceObj.category}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#091540] truncate mt-1">
                    {selectedServiceObj.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate font-medium">
                    {selectedServiceObj.titleMl}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[#1B2CC1] font-bold shrink-0 px-2.5 py-1 rounded-lg bg-white border border-slate-200">
                <span>Change</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isServicePickerOpen ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </div>

            {/* Expanded Service Selection List with Images */}
            {isServicePickerOpen && (
              <div className="mt-2 p-3 bg-white border border-slate-200 rounded-2xl shadow-xl space-y-3 animate-in fade-in zoom-in-95 duration-150">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search service by English or Malayalam (e.g. തെങ്ങ്, JCB, Electrical)..."
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1B2CC1]"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                  {SERVICES_CATALOG.filter((s) => {
                    if (!serviceSearch.trim()) return true;
                    const q = serviceSearch.toLowerCase();
                    return (
                      s.title.toLowerCase().includes(q) ||
                      s.titleMl.toLowerCase().includes(q) ||
                      s.category.toLowerCase().includes(q)
                    );
                  }).map((service) => {
                    const isSelected = selectedServiceObj.id === service.id;
                    return (
                      <div
                        key={service.id}
                        onClick={() => {
                          setServiceName(service.title);
                          setIsServicePickerOpen(false);
                          setServiceSearch('');
                        }}
                        className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                          isSelected
                            ? 'bg-[#1B2CC1]/10 border-[#1B2CC1] shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 hover:border-slate-300'
                        }`}
                      >
                        <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-white">
                          <Image
                            src={service.image}
                            alt={service.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[9px] font-bold text-[#1B2CC1] uppercase tracking-wider truncate">
                              {service.category}
                            </span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-[#1B2CC1] shrink-0" />
                            )}
                          </div>
                          <h5 className="text-[11px] font-bold text-[#091540] truncate leading-tight">
                            {service.title}
                          </h5>
                          <p className="text-[10px] text-slate-500 truncate">
                            {service.titleMl}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1.5 font-bold text-slate-700">
                Customer Name *
              </label>
              <input
                type="text"
                required
                placeholder="Full Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#091540] placeholder-slate-400 focus:outline-none focus:border-[#1B2CC1] transition-all"
              />
            </div>

            <div>
              <label className="block mb-1.5 font-bold text-slate-700">
                Mobile Number *
              </label>
              <div className="flex items-center gap-1.5">
                <CountryCodeSelect
                  value={countryCode}
                  onChange={setCountryCode}
                  variant="blue"
                />
                <input
                  type="tel"
                  required
                  placeholder={countryCode === '+91' ? '9876543210' : 'Mobile number'}
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(sanitizePhoneInput(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#091540] placeholder-slate-400 focus:outline-none focus:border-[#1B2CC1] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Kerala Location Select */}
          <KeralaLocationSelect
            district={district}
            city={city}
            onDistrictChange={setDistrict}
            onCityChange={setCity}
          />

          {/* Map URL & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1.5 font-bold text-slate-700 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-[#1B2CC1]" />
                <span>Google Maps URL / Coordinates (Optional)</span>
              </label>
              <input
                type="text"
                placeholder="https://maps.app.goo.gl/..."
                value={mapUrl}
                onChange={(e) => setMapUrl(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#091540] placeholder-slate-400 focus:outline-none focus:border-[#1B2CC1] transition-all"
              />
            </div>

            <div>
              <label className="block mb-1.5 font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#1B2CC1]" />
                <span>Target Deadline (Optional)</span>
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#091540] focus:outline-none focus:border-[#1B2CC1] transition-all"
              />
            </div>
          </div>

          {/* Message / Scope of Work */}
          <div>
            <label className="block mb-1.5 font-bold text-slate-700">
              Work Description / Scope *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Scope of work, special tools or requirements..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#091540] placeholder-slate-400 focus:outline-none focus:border-[#1B2CC1] resize-none transition-all"
            />
          </div>

          {/* Assign Worker Now (Optional) */}
          <div className="pt-2">
            <label className="block mb-1.5 font-bold text-slate-700 flex items-center gap-1.5">
              <HardHat className="w-3.5 h-3.5 text-[#1B2CC1]" />
              <span>Assign to Field Operative (Optional)</span>
            </label>
            <AdminDropdown
              options={[
                { value: '', label: '-- Leave Unassigned (Queue Only) --' },
                ...availableWorkers.map((w) => ({
                  value: w.id,
                  label: `${w.name || w.username} (Available)`,
                  badge: 'Available',
                  badgeColor: 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20',
                })),
              ]}
              value={selectedWorkerId}
              onChange={(val: string) => setSelectedWorkerId(val)}
              variant="blue"
              size="md"
              searchable
            />
          </div>
        </form>

        {/* Pinned Footer matching brand styling */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 shrink-0 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={(e) => {
              const form = (e.currentTarget.closest('.relative')?.querySelector('form') as HTMLFormElement);
              if (form) form.requestSubmit();
            }}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-[#1B2CC1] hover:bg-[#15239E] text-white text-sm font-bold shadow-md shadow-[#1B2CC1]/25 hover:shadow-[#1B2CC1]/40 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Create Work Order</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
