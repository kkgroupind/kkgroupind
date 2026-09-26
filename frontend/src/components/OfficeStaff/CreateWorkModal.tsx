'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import {
  EnquiryService,
  WorkerWithAvailability,
} from '@/services';
import { CountryCodeSelect } from '@/components/Common/CountryCodeSelect';
import { KeralaLocationSelect } from '@/components/Common/KeralaLocationSelect';
import { sanitizePhoneInput } from '@/validations';

export interface CreateWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (msg: string) => void;
  token: string | null;
  workers?: WorkerWithAvailability[];
}

const SERVICES_CATALOG = [
  'Cococare - Palm Tree Harvesting & Maintenance',
  'JCB Heavy Machinery & Earth Excavation',
  'Masonry & Brick Construction',
  'Commercial & Residential Painting',
  'Tile, Marble & Granite Laying',
  'Electrical & Wiring Systems',
  'Plumbing & High-Pressure Piping',
  'Borewell Drilling & Water Testing',
];

export function CreateWorkModal({
  isOpen,
  onClose,
  onCreated,
  token,
  workers = [],
}: CreateWorkModalProps) {
  const [serviceName, setServiceName] = useState(SERVICES_CATALOG[0]);
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto"
    >
      <div className="w-full max-w-2xl bg-[#0c1310] rounded-3xl border border-emerald-500/30 text-slate-200 overflow-hidden relative shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-500/20 bg-[#101b15]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                Create & Dispatch Work Order
              </h2>
              <p className="text-xs text-slate-400">
                Log direct client enquiry and optionally assign field personnel
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Service */}
          <div>
            <label className="block mb-1 font-bold text-slate-300">
              Service Catalog *
            </label>
            <select
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {SERVICES_CATALOG.map((s) => (
                <option key={s} value={s} className="bg-slate-900 text-white">
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 font-bold text-slate-300">
                Customer Name *
              </label>
              <input
                type="text"
                required
                placeholder="Full Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block mb-1 font-bold text-slate-300">
                Mobile Number *
              </label>
              <div className="flex items-center gap-1.5">
                <CountryCodeSelect
                  value={countryCode}
                  onChange={setCountryCode}
                />
                <input
                  type="tel"
                  required
                  placeholder={countryCode === '+91' ? '9876543210' : 'Mobile number'}
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(sanitizePhoneInput(e.target.value))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Kerala Location Select (Kasaragod Default, Search & Select, Custom Typing) */}
          <KeralaLocationSelect
            district={district}
            city={city}
            onDistrictChange={setDistrict}
            onCityChange={setCity}
          />

          {/* Map URL & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 font-bold text-slate-300 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                <span>Google Maps URL / Coordinates (Optional)</span>
              </label>
              <input
                type="text"
                placeholder="https://maps.app.goo.gl/..."
                value={mapUrl}
                onChange={(e) => setMapUrl(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block mb-1 font-bold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Target Deadline (Optional)</span>
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Message / Scope of Work */}
          <div>
            <label className="block mb-1 font-bold text-slate-300">
              Work Description / Scope *
            </label>
            <textarea
              rows={2}
              required
              placeholder="Scope of work, special tools or requirements..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Assign Worker Now (Optional) */}
          <div className="border-t border-white/10 pt-3">
            <label className="block mb-1 font-bold text-slate-300">
              Assign to Field Worker (Optional)
            </label>
            <select
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="" className="bg-slate-900 text-slate-400">
                -- Leave Unassigned (Queue Only) --
              </option>
              {availableWorkers.map((w) => (
                <option key={w.id} value={w.id} className="bg-slate-900 text-white">
                  {w.name || w.username} (Available)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-emerald-500/20">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-[#2A835F] hover:bg-[#236D4F] text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-emerald-950/40 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Work Order</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
