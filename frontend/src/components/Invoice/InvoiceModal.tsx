'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Receipt,
  Download,
  Share2,
  Copy,
  Check,
  Plus,
  Trash2,
  Eye,
  Edit3,
  RefreshCw,
  UserCheck,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { InvoiceData, InvoiceLineItem, InvoicePaymentStatus } from './types';
import { InvoiceDocument } from './InvoiceDocument';
import {
  formatINR,
  cleanPhoneNumber,
  generateInvoiceRef,
  buildWhatsAppInvoiceMessage,
  downloadInvoicePDF,
} from './invoice-utils';
import { KK_SERVICE_RATES } from '@/components/OfficeStaff/OfficeStaffEstimatesView';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  enquiry: any | null;
  currentUserName?: string;
  currentUserRole?: string;
}

export function InvoiceModal({
  isOpen,
  onClose,
  enquiry,
  currentUserName = 'Super Admin',
  currentUserRole = 'SUPER_ADMIN',
}: InvoiceModalProps) {
  const [activeTab, setActiveTab] = useState<'builder' | 'preview'>('builder');
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [whatsAppAlert, setWhatsAppAlert] = useState<string | null>(null);

  // Form State
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [date, setDate] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('Kasaragod');
  const [serviceName, setServiceName] = useState('');
  const [serviceCategory, setServiceCategory] = useState('');

  // Worker & Execution Details
  const [workerName, setWorkerName] = useState('');
  const [workerPhone, setWorkerPhone] = useState('');
  const [workerRole, setWorkerRole] = useState('Field Squad Specialist');
  const [workingHours, setWorkingHours] = useState('Full Shift (6.5 Hours)');
  const [completedUnits, setCompletedUnits] = useState<string | number>('');
  const [finishedSetups, setFinishedSetups] = useState(
    'All requested deliverables executed under squad safety supervision. Debris cleared, site inspected and signed off with client.',
  );

  // Line items state
  const [items, setItems] = useState<InvoiceLineItem[]>([]);

  // Financial adjustments
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('FIXED');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(0);

  // Payment info
  const [paymentStatus, setPaymentStatus] = useState<InvoicePaymentStatus>('PAID');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [transactionRef, setTransactionRef] = useState('');
  const [notes, setNotes] = useState(
    'Completed strictly under Kerala Squad Quality Standards. Thank you for choosing KK Group.',
  );
  const [preparedBy, setPreparedBy] = useState('');

  // Initializing state when enquiry changes or modal opens
  useEffect(() => {
    if (isOpen && enquiry) {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      setInvoiceNumber(generateInvoiceRef(enquiry.trackingNumber));
      setDate(todayStr);
      setCompletionDate(
        enquiry.completedAt ? enquiry.completedAt.split('T')[0] : todayStr,
      );

      setCustomerName(enquiry.customerName || '');
      setCustomerPhone(enquiry.customerPhone || '');
      setCustomerEmail(enquiry.customerEmail || '');
      setCustomerAddress(enquiry.location || '');
      setCity(enquiry.city || '');
      setDistrict(enquiry.district || 'Kasaragod');
      setServiceName(enquiry.serviceName || 'General Engineering Service');
      setServiceCategory(enquiry.serviceCategory || 'Operations');
      setPreparedBy(currentUserName);

      // Extract worker details if assigned
      if (enquiry.worker) {
        setWorkerName(enquiry.worker.name || enquiry.worker.username || '');
        setWorkerPhone(enquiry.worker.phone || '');
        setWorkerRole(enquiry.worker.role || 'Field Squad Specialist');
      } else if (enquiry.workerName) {
        setWorkerName(enquiry.workerName);
        setWorkerPhone(enquiry.workerPhone || '');
      } else {
        setWorkerName('KK Group Squad Alpha');
        setWorkerPhone('');
      }

      // Completed units & working hours
      const unit =
        enquiry.unitLabel ||
        (enquiry.wageType === 'PER_TREE'
          ? 'trees'
          : enquiry.wageType === 'HOURLY'
          ? 'hours'
          : enquiry.wageType === 'PER_SQFT'
          ? 'sq.ft'
          : 'units');

      const qty = enquiry.completedUnits ?? enquiry.estimatedUnits ?? 1;
      const rate = enquiry.unitRate || enquiry.hourlyRate || 500;
      setCompletedUnits(`${qty} ${unit}`);

      if (enquiry.totalWorkingHours) {
        setWorkingHours(`${enquiry.totalWorkingHours} Hours`);
      } else if (enquiry.wageType === 'HOURLY') {
        setWorkingHours(`${qty} Hours`);
      } else {
        setWorkingHours('Completed On-Site Shift (6.5 Hours)');
      }

      // Initial line item
      setItems([
        {
          id: 'item-1',
          description: `${enquiry.serviceName}${
            enquiry.message ? ` - ${enquiry.message.slice(0, 80)}` : ''
          }`,
          quantity: qty,
          unit: unit,
          rate: rate,
          amount: Math.round(qty * rate),
        },
      ]);

      // Payment details
      setPaymentStatus('PAID');
      setPaymentMethod('UPI');
      setTransactionRef(enquiry.transactionRef || `UPI-${Date.now().toString().slice(-6)}`);

      setActiveTab('builder');
      setWhatsAppAlert(null);
    }
  }, [isOpen, enquiry, currentUserName]);

  // Handle adding a line item
  const handleAddItem = () => {
    const newItem: InvoiceLineItem = {
      id: `item-${Date.now()}`,
      description: 'Additional Work / Machinery / Material Charges',
      quantity: 1,
      unit: 'units',
      rate: 500,
      amount: 500,
    };
    setItems((prev) => [...prev, newItem]);
  };

  // Handle preset service insertion
  const handleInsertPreset = (presetId: string) => {
    const preset = KK_SERVICE_RATES.find((p) => p.id === presetId);
    if (!preset) return;

    const newItem: InvoiceLineItem = {
      id: `item-${Date.now()}`,
      description: `${preset.name} (${preset.deliverables.slice(0, 2).join(', ')})`,
      quantity: 1,
      unit: preset.unit,
      rate: preset.baseAmount,
      amount: preset.baseAmount,
    };
    setItems((prev) => [...prev, newItem]);
  };

  // Handle updating line item
  const handleUpdateItem = (
    id: string,
    field: keyof InvoiceLineItem,
    value: string | number,
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          const q = field === 'quantity' ? Number(value) || 0 : item.quantity;
          const r = field === 'rate' ? Number(value) || 0 : item.rate;
          updated.amount = Math.round(q * r);
        }
        return updated;
      }),
    );
  };

  // Handle removing a line item
  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      alert('Invoice must contain at least one line item.');
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Calculations
  const subtotal = useMemo(() => {
    return items.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }, [items]);

  const discountAmount = useMemo(() => {
    if (discountType === 'PERCENTAGE') {
      return Math.round((subtotal * (discountValue || 0)) / 100);
    }
    return Math.min(subtotal, Math.round(discountValue || 0));
  }, [subtotal, discountType, discountValue]);

  const taxableAmount = Math.max(0, subtotal - discountAmount);

  const taxAmount = useMemo(() => {
    if (!taxRate || taxRate <= 0) return 0;
    return Math.round((taxableAmount * taxRate) / 100);
  }, [taxableAmount, taxRate]);

  const grandTotal = Math.max(0, taxableAmount + taxAmount);

  // Complete Invoice Payload
  const invoiceData: InvoiceData = useMemo(() => {
    return {
      invoiceNumber,
      quotationNumber: enquiry?.trackingNumber ? `KK-QT-${enquiry.trackingNumber}` : undefined,
      date,
      completionDate,
      trackingNumber: enquiry?.trackingNumber || 'KK-JOB',
      enquiryId: enquiry?.id,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      district,
      city,
      serviceName,
      serviceCategory,
      workerName,
      workerPhone,
      workerRole,
      workingHours,
      completedUnits,
      finishedSetups,
      items,
      subtotal,
      discountType,
      discountValue,
      discountAmount,
      taxRate,
      taxAmount,
      grandTotal,
      paymentStatus,
      paymentMethod,
      transactionRef,
      notes,
      preparedBy: preparedBy || currentUserName,
      officerRole:
        currentUserRole === 'SUPER_ADMIN' ? 'Super Administrator' : 'Operations Officer',
    };
  }, [
    invoiceNumber,
    date,
    completionDate,
    enquiry,
    customerName,
    customerPhone,
    customerEmail,
    customerAddress,
    district,
    city,
    serviceName,
    serviceCategory,
    workerName,
    workerPhone,
    workerRole,
    workingHours,
    completedUnits,
    finishedSetups,
    items,
    subtotal,
    discountType,
    discountValue,
    discountAmount,
    taxRate,
    taxAmount,
    grandTotal,
    paymentStatus,
    paymentMethod,
    transactionRef,
    notes,
    preparedBy,
    currentUserName,
    currentUserRole,
  ]);

  // Actions
  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      await downloadInvoicePDF(invoiceData);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendWhatsApp = () => {
    const rawPhone = customerPhone || enquiry?.customerPhone || '';
    const cleanPhone = cleanPhoneNumber(rawPhone);

    if (!cleanPhone || cleanPhone.length < 10) {
      alert('Please enter a valid 10-digit mobile number for this customer.');
      return;
    }

    const message = buildWhatsAppInvoiceMessage(invoiceData);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    setWhatsAppAlert(
      `WhatsApp chat launched for ${customerName} (+${cleanPhone})! You can attach the downloaded PDF invoice directly in WhatsApp.`,
    );
    setTimeout(() => setWhatsAppAlert(null), 7000);
  };

  const handleCopyWhatsAppText = () => {
    const message = buildWhatsAppInvoiceMessage(invoiceData);
    navigator.clipboard.writeText(message);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[96vh] sm:max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 md:p-8 shadow-2xl border text-gray-200 relative z-50 custom-scrollbar bg-[#14151A] border-gray-800 my-auto animate-in zoom-in-95 duration-200 flex flex-col justify-between">
        {/* Top ambient brand glow */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#2A835F]/70 to-transparent pointer-events-none" />

        {/* 1. Header */}
        <div>
          <div className="pb-3 sm:pb-4 border-b border-gray-800 mb-3 sm:mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#2A835F] block truncate">
                Completed Work Settlement &bull; Tax Invoice Generator
              </span>
              <h2 className="text-base sm:text-xl font-bold text-white mt-0.5 flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span>Generate Official Invoice</span>
                <span className="font-mono text-[11px] sm:text-xs font-bold text-[#2A835F] px-2 py-0.5 rounded-full bg-[#2A835F]/15 border border-[#2A835F]/30">
                  {invoiceNumber}
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-gray-400 mt-1 truncate">
                {enquiry?.customerName} &bull; {enquiry?.serviceName} ({enquiry?.trackingNumber})
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-gray-400 hover:text-white hover:bg-slate-800/60 transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-gray-800 bg-slate-950/80 flex items-center gap-1 sm:gap-1.5 mb-3 sm:mb-5">
            <button
              type="button"
              onClick={() => setActiveTab('builder')}
              className={`flex-1 py-2 sm:py-2.5 px-2 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                activeTab === 'builder'
                  ? 'bg-[#2A835F] text-white shadow-lg shadow-[#2A835F]/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              <span>Edit Invoice Details</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex-1 py-2 sm:py-2.5 px-2 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-[#2A835F] text-white shadow-lg shadow-[#2A835F]/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              <span>Preview &amp; PDF</span>
            </button>
          </div>

          {/* WhatsApp Notification Alert if sent */}
          {whatsAppAlert && (
            <div className="p-3 mb-3 sm:mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-between gap-2">
              <span className="truncate">{whatsAppAlert}</span>
              <button
                type="button"
                onClick={() => setWhatsAppAlert(null)}
                className="text-xs text-emerald-300 hover:text-white shrink-0 font-bold"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        {/* 2. Body Content */}
        <div className="space-y-3 sm:space-y-4 my-1 sm:my-2">
          {/* BUILDER MODE */}
          <div className={activeTab === 'builder' ? 'space-y-3 sm:space-y-4' : 'hidden'}>
            {/* Customer Details Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div>
                <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-1 text-gray-400">
                  Customer Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border font-medium text-xs sm:text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#2A835F] focus:ring-1 focus:ring-[#2A835F] transition-all bg-slate-950 border-gray-800"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-1 text-gray-400">
                  Customer Mobile (WhatsApp) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. 9847000000"
                  className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border font-mono text-xs sm:text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#2A835F] focus:ring-1 focus:ring-[#2A835F] transition-all bg-slate-950 border-gray-800"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-1 text-gray-400">
                  Invoice Date <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border font-medium text-xs sm:text-sm text-gray-200 focus:outline-none focus:border-[#2A835F] focus:ring-1 focus:ring-[#2A835F] transition-all bg-slate-950 border-gray-800"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-1 text-gray-400">
                  Completion Date <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                  className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border font-medium text-xs sm:text-sm text-gray-200 focus:outline-none focus:border-[#2A835F] focus:ring-1 focus:ring-[#2A835F] transition-all bg-slate-950 border-gray-800"
                />
              </div>
            </div>

            {/* Site Address & District */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-1 text-gray-400">
                  Site Location &amp; Address
                </label>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="e.g. Near Bus Stand, Kanhangad"
                  className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border font-medium text-xs sm:text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#2A835F] focus:ring-1 focus:ring-[#2A835F] transition-all bg-slate-950 border-gray-800"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-1 text-gray-400">
                  District (Kerala)
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border font-medium text-xs sm:text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#2A835F] focus:ring-1 focus:ring-[#2A835F] transition-all bg-slate-950 border-gray-800"
                />
              </div>
            </div>

            {/* Worker, Working Hours & Finished Setups Box */}
            <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-950/70 border border-gray-800 space-y-3">
              <div className="flex items-center gap-2 border-b border-gray-800 pb-2.5">
                <UserCheck className="w-4 h-4 text-[#2A835F]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#2A835F]">
                  Assigned Squad Specialist &amp; Execution Log
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-1 text-gray-400">
                    Assigned Worker / Squad Lead
                  </label>
                  <input
                    type="text"
                    value={workerName}
                    onChange={(e) => setWorkerName(e.target.value)}
                    placeholder="e.g. Vijayan K / Squad Alpha"
                    className="w-full px-3 py-2 rounded-xl border font-medium text-xs sm:text-sm text-gray-200 focus:outline-none focus:border-[#2A835F] bg-slate-950 border-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-1 text-gray-400">
                    Worker Mobile
                  </label>
                  <input
                    type="text"
                    value={workerPhone}
                    onChange={(e) => setWorkerPhone(e.target.value)}
                    placeholder="e.g. 9847112233"
                    className="w-full px-3 py-2 rounded-xl border font-mono text-xs sm:text-sm text-gray-200 focus:outline-none focus:border-[#2A835F] bg-slate-950 border-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-1 text-gray-400">
                    Working Hours Logged
                  </label>
                  <input
                    type="text"
                    value={workingHours}
                    onChange={(e) => setWorkingHours(e.target.value)}
                    placeholder="e.g. Full Shift (6.5 Hours)"
                    className="w-full px-3 py-2 rounded-xl border font-medium text-xs sm:text-sm text-gray-200 focus:outline-none focus:border-[#2A835F] bg-slate-950 border-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-1 text-gray-400">
                  Finished Setups &amp; Execution Details
                </label>
                <textarea
                  rows={2}
                  value={finishedSetups}
                  onChange={(e) => setFinishedSetups(e.target.value)}
                  placeholder="e.g. Tree harvesting completed, crowns trimmed, site cleared of all debris."
                  className="w-full bg-slate-950 border border-gray-800 focus:border-[#2A835F] rounded-xl p-2.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Line Items Container */}
            <div className="p-3 sm:p-5 rounded-2xl bg-slate-950/70 border border-gray-800 space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-b border-gray-800 pb-3">
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-[#2A835F]">
                    Deliverables &amp; Billed Work Scope
                  </span>
                  <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
                    Specify delivered service quantities, hourly units, or completed work areas.
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleInsertPreset(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="flex-1 sm:flex-none bg-slate-900 border border-gray-800 text-gray-300 rounded-xl text-xs py-2 px-2.5 focus:outline-none focus:border-[#2A835F] min-w-0"
                  >
                    <option value="">+ Add Preset Service...</option>
                    {KK_SERVICE_RATES.map((rate) => (
                      <option key={rate.id} value={rate.id}>
                        {rate.icon} {rate.name} ({rate.rateText})
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#2A835F] hover:bg-[#236D4F] text-white text-xs font-bold transition-all shadow-md shadow-[#2A835F]/20 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Add Item</span>
                  </button>
                </div>
              </div>

              {/* Items List - Responsive Card on Mobile */}
              <div className="space-y-2.5">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-900 border border-gray-800/90 flex flex-col md:flex-row items-stretch md:items-center gap-2.5"
                  >
                    {/* Top on mobile / Left on desktop */}
                    <div className="flex items-center gap-2 w-full md:flex-1 min-w-0">
                      <span className="w-5 text-center text-xs font-mono font-bold text-gray-500 shrink-0">
                        #{index + 1}
                      </span>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          handleUpdateItem(item.id, 'description', e.target.value)
                        }
                        placeholder="Deliverable description..."
                        className="flex-1 min-w-0 bg-slate-950 border border-gray-800 focus:border-[#2A835F] rounded-lg px-2.5 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="md:hidden p-1.5 rounded-lg text-rose-400 hover:text-white hover:bg-rose-500/20 transition-colors shrink-0 cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Numeric fields */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:flex items-center gap-2 w-full md:w-auto">
                      <div className="md:w-20 shrink-0">
                        <span className="text-[9px] font-bold uppercase text-gray-500 block md:hidden mb-0.5">
                          Qty
                        </span>
                        <input
                          type="number"
                          min="0.1"
                          step="any"
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateItem(
                              item.id,
                              'quantity',
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          placeholder="Qty"
                          className="w-full bg-slate-950 border border-gray-800 focus:border-[#2A835F] rounded-lg px-2 py-1.5 text-xs font-mono text-center text-gray-200 focus:outline-none"
                        />
                      </div>

                      <div className="md:w-20 shrink-0">
                        <span className="text-[9px] font-bold uppercase text-gray-500 block md:hidden mb-0.5">
                          Unit
                        </span>
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => handleUpdateItem(item.id, 'unit', e.target.value)}
                          placeholder="Unit"
                          className="w-full bg-slate-950 border border-gray-800 focus:border-[#2A835F] rounded-lg px-2 py-1.5 text-xs text-center text-gray-200 focus:outline-none"
                        />
                      </div>

                      <div className="md:w-24 shrink-0 relative">
                        <span className="text-[9px] font-bold uppercase text-gray-500 block md:hidden mb-0.5">
                          Rate
                        </span>
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-[11px] font-bold">
                            ₹
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={item.rate}
                            onChange={(e) =>
                              handleUpdateItem(
                                item.id,
                                'rate',
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            placeholder="Rate"
                            className="w-full bg-slate-950 border border-gray-800 focus:border-[#2A835F] rounded-lg pl-5 pr-2 py-1.5 text-xs font-mono text-right text-gray-200 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="col-span-3 sm:col-span-1 md:w-24 flex items-center justify-between md:justify-end gap-1 px-1 md:px-0">
                        <span className="text-[10px] text-gray-400 font-semibold md:hidden">
                          Amount:
                        </span>
                        <span className="font-mono font-bold text-xs text-emerald-400">
                          {formatINR(item.amount)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="hidden md:block p-1.5 rounded-lg text-rose-400 hover:text-white hover:bg-rose-500/20 transition-colors shrink-0 cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Subtotal, Discount, Tax & Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 pt-3 border-t border-gray-800">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                    <div>
                      <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-1 text-gray-400">
                        Discount
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          value={discountValue}
                          onChange={(e) =>
                            setDiscountValue(parseFloat(e.target.value) || 0)
                          }
                          className="w-full bg-slate-950 border border-gray-800 focus:border-[#2A835F] rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-mono text-gray-200 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setDiscountType((prev) =>
                              prev === 'FIXED' ? 'PERCENTAGE' : 'FIXED',
                            )
                          }
                          className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-gray-300 border border-gray-800 cursor-pointer"
                        >
                          {discountType === 'FIXED' ? '₹' : '%'}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-1 text-gray-400">
                        GST / Taxes
                      </label>
                      <select
                        value={taxRate}
                        onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-gray-800 focus:border-[#2A835F] rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs text-gray-200 focus:outline-none"
                      >
                        <option value="0">0% (Nil / Exempt)</option>
                        <option value="5">5% GST</option>
                        <option value="12">12% GST</option>
                        <option value="18">18% GST (Standard)</option>
                      </select>
                    </div>
                  </div>

                  {/* Payment settlement options */}
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                    <div>
                      <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-1 text-gray-400">
                        Payment Status
                      </label>
                      <select
                        value={paymentStatus}
                        onChange={(e) =>
                          setPaymentStatus(e.target.value as InvoicePaymentStatus)
                        }
                        className="w-full bg-slate-950 border border-gray-800 focus:border-[#2A835F] rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs text-gray-200 focus:outline-none font-semibold"
                      >
                        <option value="PAID">PAID (Settled)</option>
                        <option value="PARTIALLY_PAID">PARTIALLY PAID</option>
                        <option value="PENDING">PENDING (Due)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-1 text-gray-400">
                        Payment Method
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full bg-slate-950 border border-gray-800 focus:border-[#2A835F] rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs text-gray-200 focus:outline-none"
                      >
                        <option value="UPI">UPI / Google Pay</option>
                        <option value="Bank Transfer">Bank Transfer / IMPS</option>
                        <option value="Cash">Cash on Delivery</option>
                        <option value="Cheque">Cheque</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Summary Box */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900 border border-gray-800 space-y-2 text-xs flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-gray-400">
                      <span>Subtotal:</span>
                      <span className="font-mono font-semibold text-gray-200">
                        {formatINR(subtotal)}
                      </span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex items-center justify-between text-emerald-400">
                        <span>Discount:</span>
                        <span className="font-mono font-semibold">
                          -{formatINR(discountAmount)}
                        </span>
                      </div>
                    )}

                    {taxAmount > 0 && (
                      <div className="flex items-center justify-between text-gray-400">
                        <span>Tax ({taxRate}%):</span>
                        <span className="font-mono font-semibold text-gray-200">
                          +{formatINR(taxAmount)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-gray-800 flex items-center justify-between font-bold text-sm">
                    <span className="text-white">Total Invoice:</span>
                    <span className="font-mono text-base sm:text-lg text-emerald-400">
                      {formatINR(grandTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Ref & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-1 text-gray-400">
                  Transaction / UPI Reference ID
                </label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="e.g. UPI-9384729103 or Cash Receipt #14"
                  className="w-full bg-slate-950 border border-gray-800 focus:border-[#2A835F] rounded-xl px-3 py-2 text-xs font-mono text-gray-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-1 text-gray-400">
                  Service Guarantee &amp; Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Executed under squad safety norms."
                  className="w-full bg-slate-950 border border-gray-800 focus:border-[#2A835F] rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* PREVIEW MODE */}
          <div className={activeTab === 'preview' ? 'block' : 'hidden'}>
            <div className="flex flex-col items-center justify-center p-2.5 sm:p-4 md:p-5 bg-slate-950 rounded-xl sm:rounded-2xl border border-gray-800">
              <div className="mb-2.5 sm:mb-3 w-full flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="flex items-center gap-1 sm:gap-1.5 font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-emerald-500/20 text-[11px] sm:text-xs">
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Exact A4 Tax Invoice</span>
                  </span>
                  <span className="hidden md:inline text-[11px] text-gray-400">
                    With worker log &bull; Pure white sheet
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('builder')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-gray-300 border border-gray-800 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3 text-[#2A835F]" />
                    <span>Modify Fields</span>
                  </button>
                  <span className="text-[11px] text-gray-500 hidden sm:inline">
                    Ref: <strong className="text-gray-300">{invoiceNumber}</strong>
                  </span>
                </div>
              </div>

              {/* Exact Preview Document Container */}
              <div className="w-full overflow-x-auto pb-3 flex justify-start sm:justify-center">
                <InvoiceDocument data={invoiceData} id="invoice-printable-document" />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Submit Buttons Footer (Mobile Responsive) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 sm:pt-4 border-t border-gray-800 mt-2">
          {/* Mobile Top / Desktop Left: Total Amount & Copy Button */}
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <div>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                Total Invoice Value
              </span>
              <span className="text-base sm:text-lg font-mono font-black text-emerald-400">
                {formatINR(grandTotal)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopyWhatsAppText}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white bg-slate-900 border border-gray-800 hover:border-gray-700 transition-colors cursor-pointer"
              title="Copy formatted text"
            >
              {copiedWhatsApp ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Text</span>
                </>
              )}
            </button>
          </div>

          {/* Action Controls - 2-col on mobile, flex on tablet/desktop */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="order-1 sm:order-none px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent hover:border-gray-800 transition-colors text-center cursor-pointer"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="order-2 sm:order-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-gray-200 font-bold text-xs border border-gray-700 transition-all cursor-pointer disabled:opacity-50"
              title="Download Tax Invoice PDF"
            >
              {isDownloading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#2A835F]" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-[#2A835F]" />
                  <span>Download Invoice</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="col-span-2 sm:col-span-1 order-3 sm:order-none flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-[#2A835F] hover:bg-[#236D4F] text-white font-bold text-xs shadow-lg shadow-[#2A835F]/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Send via WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
