'use client';

import React, { useState } from 'react';
import {
  X,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Tag,
  IndianRupee,
  Clock,
  Layers,
  FileText,
} from 'lucide-react';
import { adminServicesService, CreateServiceInput, ServiceItem } from '@/services/Admin/services';

interface CreateServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  onSuccess: (newService: ServiceItem) => void;
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

export function CreateServiceModal({
  isOpen,
  onClose,
  token,
  onSuccess,
}: CreateServiceModalProps) {
  const [name, setName] = useState('');
  const [customServiceId, setCustomServiceId] = useState('');
  const [category, setCategory] = useState(CATEGORY_PRESETS[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [featureInput, setFeatureInput] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState('');
  const [duration, setDuration] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

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
      const payload: CreateServiceInput = {
        name: cleanName,
        serviceId: customServiceId.trim() ? customServiceId.trim().toUpperCase() : undefined,
        category: finalCategory,
        description: cleanDesc,
        features: features,
        priceRange: priceRange.trim() || undefined,
        duration: duration.trim() || undefined,
        isActive,
      };

      const res = await adminServicesService.createService(payload, token);
      onSuccess(res.service);
      onClose();
    } catch (err: any) {
      console.error('Failed to create service', err);
      setError(err?.message || 'Failed to create service. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#14151A] border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#1A1C23] sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2A835F]/20 border border-[#2A835F]/40 flex items-center justify-center text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-100">
                Register New Service
              </h2>
              <p className="text-xs text-gray-400">
                Auto-generates sequential alphanumeric Service ID (e.g. KKS-001)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Sequential Service ID preview banner */}
          <div className="p-3.5 bg-[#1A1C23] border border-gray-800/80 rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-200">
                  Sequential Service ID Generator
                </div>
                <div className="text-[11px] text-gray-400">
                  Auto-increments next available code in sequence (e.g. KKS-001, KKS-002)
                </div>
              </div>
            </div>
            <div className="shrink-0">
              <input
                type="text"
                value={customServiceId}
                onChange={(e) => setCustomServiceId(e.target.value)}
                placeholder="Auto (or custom code)"
                className="w-36 bg-[#0E0F12] border border-gray-700/80 rounded-lg px-2.5 py-1 text-xs font-mono text-emerald-400 placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
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
              placeholder="e.g. Solar Panel Installation & Rooftop Cleaning"
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
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#2A835F]"
              >
                {CATEGORY_PRESETS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="Other">Other (Custom Category)</option>
              </select>
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

          {/* Service Description */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Service Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the operational process, certified crews, safety standards, and regional capabilities..."
              className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#2A835F] transition-all"
              required
            />
          </div>

          {/* Key Features / Capabilities Chips Builder */}
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
                placeholder="e.g. Certified climber crews with safety harnesses (Press Enter)"
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
                  placeholder="e.g. ₹1,400 - ₹1,800 / Hour"
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
                  placeholder="e.g. Same Day Dispatch / 2-4 Hours"
                  className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#2A835F]"
                />
              </div>
            </div>
          </div>

          {/* Active Status Checkbox */}
          <div className="flex items-center gap-2.5 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-emerald-500 focus:ring-0"
            />
            <label htmlFor="isActive" className="text-xs text-gray-300 cursor-pointer">
              Enable immediately in active catalog
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#1A1C23] hover:bg-gray-800 text-gray-400 hover:text-white rounded-xl text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 bg-[#2A835F] hover:bg-emerald-600 text-white rounded-xl text-xs font-medium transition-all shadow-[0_0_15px_rgba(42,131,95,0.4)] disabled:opacity-50 inline-flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Service</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
