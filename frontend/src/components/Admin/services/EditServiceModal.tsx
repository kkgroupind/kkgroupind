'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Loader2,
  AlertCircle,
  Plus,
  Pencil,
  Layers,
  IndianRupee,
  Clock,
  Sparkles,
} from 'lucide-react';
import { adminServicesService, ServiceItem, UpdateServiceInput } from '@/services/Admin/services';
import { AdminDropdown, AdminDropdownOption } from '@/components/Admin/admin-dropdown';

interface EditServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceItem | null;
  token: string;
  onSuccess: (updatedService: ServiceItem) => void;
}

const CATEGORY_PRESETS = [
  'Agriculture',
  'Excavation & Heavy Equipment',
  'Civil & Construction',
  'Finishing & Renovation',
  'Flooring & Surfaces',
  'MEP & Utilities',
  'Water & Irrigation',
  'Facility Maintenance',
];

const CATEGORY_OPTIONS: AdminDropdownOption[] = [
  ...CATEGORY_PRESETS.map((cat) => ({ value: cat, label: cat })),
  { value: 'Other', label: 'Other (Custom Category)' },
];

const WAGE_TYPE_OPTIONS: AdminDropdownOption[] = [
  { value: 'PER_TREE', label: '🌴 Tree Count (Coconut / Palm Plucking)' },
  { value: 'HOURLY', label: '⏱️ Hourly Meter (JCB / Excavators)' },
  { value: 'PER_SQFT', label: '📐 Area / Sq. Ft. (Painting, Tiling)' },
  { value: 'PER_POINT', label: '⚡ Electrical Points (Wiring, Fixtures)' },
  { value: 'PER_FOOT', label: '📏 Foot Depth (Borewell Drilling)' },
  { value: 'DAILY_WAGE', label: '📅 Daily Shift (Masonry, Carpentry)' },
  { value: 'FIXED_VISIT', label: '🔧 Fixed Visit / Inspection (Plumbing)' },
  { value: 'CUSTOM_PROJECT', label: '💼 Custom Lump Sum / Turnkey' },
];

export function EditServiceModal({
  isOpen,
  onClose,
  service,
  token,
  onSuccess,
}: EditServiceModalProps) {
  const [name, setName] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [category, setCategory] = useState(CATEGORY_PRESETS[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [featureInput, setFeatureInput] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState('');
  const [duration, setDuration] = useState('');
  const [wageType, setWageType] = useState('HOURLY');
  const [unitLabel, setUnitLabel] = useState('Hour');
  const [baseCustomerRate, setBaseCustomerRate] = useState<string>('');
  const [baseWorkerWage, setBaseWorkerWage] = useState<string>('');
  const [minUnits, setMinUnits] = useState<string>('1');
  const [specificationsNotes, setSpecificationsNotes] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (service && isOpen) {
      setName(service.name || '');
      setServiceId(service.serviceId || '');
      if (service.category && CATEGORY_PRESETS.includes(service.category)) {
        setCategory(service.category);
        setCustomCategory('');
      } else if (service.category) {
        setCategory('Other');
        setCustomCategory(service.category);
      } else {
        setCategory('General');
      }
      setDescription(service.description || '');
      setFeatures(service.features || []);
      setPriceRange(service.priceRange || '');
      setDuration(service.duration || '');
      setWageType(service.wageType || 'HOURLY');
      setUnitLabel(service.unitLabel || 'Hour');
      setBaseCustomerRate(service.baseCustomerRate !== null && service.baseCustomerRate !== undefined ? String(service.baseCustomerRate) : '');
      setBaseWorkerWage(service.baseWorkerWage !== null && service.baseWorkerWage !== undefined ? String(service.baseWorkerWage) : '');
      setMinUnits(service.minUnits !== null && service.minUnits !== undefined ? String(service.minUnits) : '1');
      setSpecificationsNotes(service.specifications?.notes || '');
      setIsActive(service.isActive ?? true);
      setError(null);
    }
  }, [service, isOpen]);

  if (!isOpen || !service) return null;

  const handleAddFeature = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = featureInput.trim();
    if (clean && !features.includes(clean)) {
      setFeatures([...features, clean]);
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (idx: number) => {
    setFeatures(features.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    if (!cleanName) {
      setError('Please provide a valid service name');
      return;
    }

    const cleanDesc = description.trim();
    if (!cleanDesc) {
      setError('Please provide a detailed service description');
      return;
    }

    const finalCategory =
      category === 'Other' ? customCategory.trim() || 'General' : category;

    setIsLoading(true);
    try {
      const payload: UpdateServiceInput = {
        name: cleanName,
        serviceId: serviceId.trim() ? serviceId.trim().toUpperCase() : undefined,
        category: finalCategory,
        description: cleanDesc,
        features: features,
        priceRange: priceRange.trim() || undefined,
        duration: duration.trim() || undefined,
        wageType,
        unitLabel: unitLabel.trim() || 'Unit',
        baseCustomerRate: baseCustomerRate ? Number(baseCustomerRate) : undefined,
        baseWorkerWage: baseWorkerWage ? Number(baseWorkerWage) : undefined,
        minUnits: minUnits ? Number(minUnits) : 1,
        specifications: specificationsNotes.trim() ? { notes: specificationsNotes.trim() } : undefined,
        isActive,
      };

      const res = await adminServicesService.updateService(service.id, payload, token);
      onSuccess(res.service);
      onClose();
    } catch (err: any) {
      console.error('Failed to update service', err);
      setError(err?.message || 'Failed to update service. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#14151A] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top subtle glow line matching People modal */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#7B4DFF]/50 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800/80 bg-[#16171D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 flex items-center justify-center text-[#7B4DFF]">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-100">
                Modify Service
              </h2>
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                Service ID: <span className="text-emerald-400 font-bold">{service.serviceId}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-200 bg-[#1A1C23] hover:bg-[#232630] rounded-xl border border-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Service ID field */}
          <div className="p-3.5 bg-[#1A1C23] border border-gray-800 rounded-xl flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-gray-200">
                Service Identifier (Unique Code)
              </div>
              <div className="text-[11px] text-gray-500">
                Sequential alphanumeric tracking code
              </div>
            </div>
            <input
              type="text"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-36 bg-[#0E0F12] border border-gray-700 rounded-lg px-2.5 py-1 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* Service Name */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Service Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#2A835F] focus:ring-1 focus:ring-[#2A835F] transition-all"
              required
            />
          </div>

          {/* Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Category
              </label>
              <AdminDropdown
                options={CATEGORY_OPTIONS}
                value={category}
                onChange={(val) => setCategory(val)}
                variant="emerald"
                size="md"
              />
            </div>

            {category === 'Other' && (
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Custom Category Name
                </label>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="e.g. Landscaping"
                  className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#2A835F]"
                  required
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Service Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#2A835F] transition-all"
              required
            />
          </div>

          {/* Features Builder */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Key Features & Deliverables
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
                placeholder="Add feature and press Enter"
                className="flex-1 bg-[#1A1C23] border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#2A835F]"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-3.5 py-2 rounded-xl bg-[#2A835F] hover:bg-emerald-600 text-white text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {features.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-2 bg-[#1A1C23]/60 rounded-xl border border-gray-800">
                {features.map((feat, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 text-xs text-gray-200 bg-[#252830] border border-gray-700 px-2.5 py-1 rounded-lg"
                  >
                    <span>{feat}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="text-gray-400 hover:text-rose-400 ml-1"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Price Range & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Pricing Range / Rate
              </label>
              <div className="relative">
                <IndianRupee className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#2A835F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Turnaround / Duration
              </label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#2A835F]"
                />
              </div>
            </div>
          </div>

          {/* Service Specification & Wage Calculation Model */}
          <div className="bg-[#181A22] border border-gray-800 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#2A835F]" />
                  <span>Service Unit & Wage Specification Model</span>
                </h4>
                <p className="text-[11px] text-gray-400">
                  Configure whether billing & wages are tree-count, hourly meter, square footage, or point-based
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-300 mb-1">
                  Wage & Calculation Basis
                </label>
                <AdminDropdown
                  options={WAGE_TYPE_OPTIONS}
                  value={wageType}
                  onChange={(newType) => {
                    setWageType(newType);
                    if (newType === 'PER_TREE' && (!unitLabel || unitLabel === 'Hour')) setUnitLabel('Tree');
                    else if (newType === 'HOURLY') setUnitLabel('Hour');
                    else if (newType === 'PER_SQFT') setUnitLabel('Sq. Ft.');
                    else if (newType === 'PER_POINT') setUnitLabel('Point');
                    else if (newType === 'PER_FOOT') setUnitLabel('Foot');
                    else if (newType === 'DAILY_WAGE') setUnitLabel('Day / Shift');
                    else if (newType === 'FIXED_VISIT') setUnitLabel('Visit / Inspection');
                  }}
                  variant="emerald"
                  size="md"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-300 mb-1">
                  Unit Label Name
                </label>
                <input
                  type="text"
                  value={unitLabel}
                  onChange={(e) => setUnitLabel(e.target.value)}
                  placeholder="e.g. Tree, Hour, Sq. Ft., Point, Foot, Day"
                  className="w-full bg-[#14151A] border border-gray-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2A835F]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-300 mb-1">
                  Customer Rate (₹ / {unitLabel || 'Unit'})
                </label>
                <input
                  type="number"
                  value={baseCustomerRate}
                  onChange={(e) => setBaseCustomerRate(e.target.value)}
                  placeholder="e.g. 120"
                  className="w-full bg-[#14151A] border border-gray-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2A835F]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-emerald-400 mb-1">
                  Worker Wage (₹ / {unitLabel || 'Unit'})
                </label>
                <input
                  type="number"
                  value={baseWorkerWage}
                  onChange={(e) => setBaseWorkerWage(e.target.value)}
                  placeholder="e.g. 80"
                  className="w-full bg-[#14151A] border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-emerald-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-amber-300 mb-1">
                  Min Billable Units
                </label>
                <input
                  type="number"
                  value={minUnits}
                  onChange={(e) => setMinUnits(e.target.value)}
                  placeholder="e.g. 5"
                  className="w-full bg-[#14151A] border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-amber-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-300 mb-1">
                Specification Instructions & Requirements (Optional)
              </label>
              <input
                type="text"
                value={specificationsNotes}
                onChange={(e) => setSpecificationsNotes(e.target.value)}
                placeholder="e.g. Includes crown cleaning, safety gear mandatory, diesel bata separate"
                className="w-full bg-[#14151A] border border-gray-700/80 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-[#2A835F]"
              />
            </div>
          </div>

          {/* Active Status Checkbox */}
          <div className="flex items-center gap-2.5 pt-2">
            <input
              type="checkbox"
              id="editIsActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-emerald-500 focus:ring-0"
            />
            <label htmlFor="editIsActive" className="text-xs text-gray-300 cursor-pointer">
              Active in service catalog
            </label>
          </div>
        </form>

        {/* Pinned Footer matching People modal */}
        <div className="p-6 border-t border-gray-800/80 bg-[#16171D] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-800 text-gray-300 hover:bg-[#1A1C23] text-sm font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={(e) => {
              const form = (e.currentTarget.closest('.relative')?.querySelector('form') as HTMLFormElement);
              if (form) form.requestSubmit();
            }}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl bg-[#7B4DFF] hover:bg-[#6A3CEB] text-white text-sm font-bold shadow-lg shadow-[#7B4DFF]/25 hover:shadow-[#7B4DFF]/40 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <span>Update Service</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
