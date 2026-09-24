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
} from 'lucide-react';
import {
  EnquiryService,
  WorkerWithAvailability,
} from '@/services';

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
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [location, setLocation] = useState('');
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
      const createdRes = await EnquiryService.createEnquiry({
        serviceName,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        location: location.trim() || undefined,
        preferredDate: preferredDate || undefined,
        message: message.trim(),
      });

      const enquiryId = createdRes.enquiry?.id;

      if (selectedWorkerId && enquiryId && token) {
        await EnquiryService.assignWorker(
          enquiryId,
          selectedWorkerId,
          notes.trim() || undefined,
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
      setLocation('');
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
    >
      <div className="w-full max-w-xl bg-[#14161D] rounded-2xl border border-gray-800 text-gray-200 overflow-hidden relative shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-300">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-100">
                Create Work Order
              </h2>
              <p className="text-xs text-gray-400">
                Add a new job and assign field personnel
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3.5">
            {/* Service Selection */}
            <div>
              <label className="block mb-1 font-medium text-gray-300">
                Service Category *
              </label>
              <select
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0D0E12] border border-gray-700 text-gray-200 focus:outline-none focus:border-gray-500"
              >
                {SERVICES_CATALOG.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 font-medium text-gray-300">
                  Customer Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0D0E12] border border-gray-700 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-500"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-300">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9847234567"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0D0E12] border border-gray-700 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-500"
                />
              </div>
            </div>

            {/* Email & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 font-medium text-gray-300">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="customer@email.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0D0E12] border border-gray-700 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-500"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-300">
                  Location / Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kakkanad, Kochi"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0D0E12] border border-gray-700 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-500"
                />
              </div>
            </div>

            {/* Preferred Date */}
            <div>
              <label className="block mb-1 font-medium text-gray-300">
                Scheduled Execution Date
              </label>
              <input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0D0E12] border border-gray-700 text-gray-200 focus:outline-none focus:border-gray-500"
              />
            </div>

            {/* Message / Requirements */}
            <div>
              <label className="block mb-1 font-medium text-gray-300">
                Work Requirements *
              </label>
              <textarea
                rows={3}
                placeholder="Describe site requirements, work scope, materials needed..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#0D0E12] border border-gray-700 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-500"
              />
            </div>

            {/* Worker Assignment */}
            <div className="p-3.5 rounded-xl bg-[#0D0E12] border border-gray-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="font-medium text-gray-300 flex items-center gap-1.5">
                  <HardHat className="w-3.5 h-3.5 text-gray-400" />
                  <span>Assign Worker (Optional)</span>
                </label>
                <span className="text-[11px] text-gray-500">
                  {availableWorkers.length} available
                </span>
              </div>

              <select
                value={selectedWorkerId}
                onChange={(e) => setSelectedWorkerId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#14161D] border border-gray-700 text-gray-200 focus:outline-none focus:border-gray-500"
              >
                <option value="">-- Assign Later --</option>
                {availableWorkers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name || w.username} ({w.phone || 'No phone'})
                  </option>
                ))}
              </select>

              {selectedWorkerId && (
                <input
                  type="text"
                  placeholder="Instructions for the assigned worker..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#14161D] border border-gray-700 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-500"
                />
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="py-2 px-4 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium transition-colors border border-gray-700/60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              <span>Create Work Order</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
