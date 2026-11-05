'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Pencil,
  Loader2,
  AlertCircle,
  Upload,
  ImageIcon,
  Trash2,
  Link2,
} from 'lucide-react';
import { adminServicesService, UpdateServiceInput, ServiceItem } from '@/services/Admin/services';
import { AdminDropdown, AdminDropdownOption } from '@/components/Admin/admin-dropdown';
import { useAdminTheme } from '@/context/admin-theme-context';

interface EditServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceItem | null;
  token: string;
  onSuccess: (updatedService: ServiceItem) => void;
}

const DEFAULT_IMAGE_PRESETS = [
  { label: '🌴 Coconut Plucking', url: '/Banners/coco.png' },
  { label: '🚜 JCB & Excavator', url: '/Banners/jcb.png' },
  { label: '🧱 Plastering Squads', url: '/Banners/plastering.png' },
  { label: '🎨 Painting Squads', url: '/Banners/painting.png' },
  { label: '✨ Tile & Granite', url: '/Banners/tiling.png' },
  { label: '⚡ Electrical & MEP', url: '/Banners/electrical.png' },
  { label: '🔧 Plumbing & Pipeline', url: '/Banners/plumbing.png' },
  { label: '💧 Borewell Drilling', url: '/Banners/borewell.png' },
  { label: '🏛️ Masonry & Brickwork', url: '/Banners/masonry.png' },
];

const CATEGORY_PRESETS = [
  'Agriculture & Cococare',
  'Excavation & Heavy Equipment',
  'Plastering & Wall Rendering',
  'Surface Finishing & Painting',
  'Flooring & Surfaces',
  'Electrical & Power Systems',
  'Plumbing & Sanitary Utilities',
  'Water Engineering & Borewells',
  'Civil & Masonry Works',
  'Facility Maintenance',
];

const CATEGORY_OPTIONS: AdminDropdownOption[] = [
  ...CATEGORY_PRESETS.map((cat) => ({ value: cat, label: cat })),
  { value: 'Other', label: 'Other (Custom Category)' },
];

const WAGE_TYPE_OPTIONS: AdminDropdownOption[] = [
  { value: 'PER_TREE', label: '🌴 Per Count / Tree (Coconut Palm Care)' },
  { value: 'HOURLY', label: '⏱️ Hourly Meter (JCB / Heavy Machinery)' },
  { value: 'PER_SQFT', label: '📐 Square Feet (Painting / Tile Laying)' },
  { value: 'PER_POINT', label: '⚡ Per Point (Electrical Systems)' },
  { value: 'PER_FOOT', label: '📏 Per Foot (Borewell Drilling)' },
  { value: 'DAILY_WAGE', label: '📅 Daily Wage (General Construction)' },
  { value: 'FIXED_VISIT', label: '🏷️ Fixed Inspection / Visit' },
];

export function EditServiceModal({
  isOpen,
  onClose,
  service,
  token,
  onSuccess,
}: EditServiceModalProps) {
  const { isDark } = useAdminTheme();

  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORY_PRESETS[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [wageType, setWageType] = useState('PER_TREE');
  const [unitLabel, setUnitLabel] = useState('Tree');
  const [baseWorkerWage, setBaseWorkerWage] = useState<number | ''>(80);
  const [baseCustomerRate, setBaseCustomerRate] = useState<number | ''>(120);
  const [minUnits, setMinUnits] = useState<number | ''>(1);
  const [image, setImage] = useState('');
  const [imageInputTab, setImageInputTab] = useState<'preset' | 'upload' | 'url'>('preset');
  const [urlInput, setUrlInput] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (service && isOpen) {
      setName(service.name || '');
      const isPresetCat = CATEGORY_PRESETS.includes(service.category || '');
      if (isPresetCat) {
        setCategory(service.category || CATEGORY_PRESETS[0]);
        setCustomCategory('');
      } else {
        setCategory('Other');
        setCustomCategory(service.category || '');
      }
      setDescription(service.description || '');
      setServiceId(service.serviceId || '');
      setWageType(service.wageType || 'PER_TREE');
      setUnitLabel(service.unitLabel || 'Tree');
      setBaseWorkerWage(service.baseWorkerWage ?? '');
      setBaseCustomerRate(service.baseCustomerRate ?? '');
      setMinUnits(service.minUnits ?? 1);
      setImage(service.image || '');
      setIsActive(service.isActive ?? true);
      setError('');
    }
  }, [service, isOpen]);

  if (!isOpen || !service) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file is too large. Maximum size is 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Service title is required.');
      return;
    }

    const finalCategory = category === 'Other' ? customCategory.trim() : category;
    if (!finalCategory) {
      setError('Please select or specify a category.');
      return;
    }

    if (!unitLabel.trim()) {
      setError('Measurement unit label is required.');
      return;
    }

    setIsLoading(true);

    try {
      const payload: UpdateServiceInput = {
        name: name.trim(),
        category: finalCategory,
        serviceId: serviceId.trim() || undefined,
        wageType,
        unitLabel: unitLabel.trim(),
        baseWorkerWage: baseWorkerWage !== '' ? Number(baseWorkerWage) : 0,
        baseCustomerRate: baseCustomerRate !== '' ? Number(baseCustomerRate) : 0,
        minUnits: minUnits !== '' ? Number(minUnits) : 1,
        image: image.trim() || undefined,
        description: description.trim() || undefined,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] rounded-[28px] border ${
          isDark ? 'bg-[#12141A] border-white/[0.08]' : 'bg-white border-slate-200'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-5 sm:p-6 border-b ${
            isDark ? 'bg-[#161922] border-white/[0.06]' : 'bg-slate-50 border-slate-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl border flex items-center justify-center text-[#6366F1] ${
                isDark ? 'bg-[#181A20] border-white/[0.08]' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-base sm:text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Edit Service
              </h2>
              <p className={`text-xs font-mono mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Service ID: <span className="text-[#6366F1] font-bold">{service.serviceId}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              isDark
                ? 'text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08]'
                : 'text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 custom-scrollbar">
          {error && (
            <div className="flex items-center gap-2 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Service ID field */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
              isDark ? 'bg-[#121318] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div>
              <div className={`text-xs font-semibold ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                Service Identifier (Unique Code)
              </div>
              <div className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Sequential alphanumeric tracking code
              </div>
            </div>
            <input
              type="text"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className={`w-32 rounded-xl px-3 py-1.5 text-xs font-mono border focus:outline-none focus:border-[#FF5C38] ${
                isDark ? 'bg-[#181A20] border-white/[0.08] text-[#FF5C38]' : 'bg-white border-slate-200 text-[#FF5C38]'
              }`}
              required
            />
          </div>

          {/* Service Name */}
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
              Service Name / Title <span className="text-[#FF5C38]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full rounded-xl px-4 py-2.5 text-sm border focus:outline-none focus:border-[#FF5C38] ${
                isDark ? 'bg-[#121318] border-white/[0.06] text-white placeholder-zinc-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
              required
            />
          </div>

          {/* Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                Category <span className="text-[#FF5C38]">*</span>
              </label>
              <AdminDropdown
                options={CATEGORY_OPTIONS}
                value={category}
                onChange={(val) => setCategory(val)}
                variant="coral"
                size="md"
              />
            </div>

            {category === 'Other' && (
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                  Custom Category Name
                </label>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="e.g. Landscaping"
                  className={`w-full rounded-xl px-3 py-2.5 text-xs border focus:outline-none focus:border-[#FF5C38] ${
                    isDark ? 'bg-[#121318] border-white/[0.06] text-white placeholder-zinc-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                  required
                />
              </div>
            )}
          </div>

          {/* Service Wage & Pricing Model */}
          <div
            className={`border rounded-2xl p-4 space-y-3.5 ${
              isDark ? 'bg-[#121318] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div>
              <div className={`text-xs font-bold flex items-center justify-between ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                <span>Wage &amp; Pay Rates Model</span>
                <span className="text-[10px] text-[#FF5C38] font-semibold bg-[#FF5C38]/10 px-2 py-0.5 rounded-full border border-[#FF5C38]/20">
                  Worker &amp; Client Pay Setup
                </span>
              </div>
              <p className={`text-[11px] mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Configure default worker pay rate and billable customer rate
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                  Calculation Model <span className="text-[#FF5C38]">*</span>
                </label>
                <AdminDropdown
                  options={WAGE_TYPE_OPTIONS}
                  value={wageType}
                  onChange={(val) => {
                    setWageType(val);
                    if (val === 'PER_TREE') setUnitLabel('Tree');
                    else if (val === 'HOURLY') setUnitLabel('Hour');
                    else if (val === 'PER_SQFT') setUnitLabel('Sq. Ft.');
                    else if (val === 'PER_POINT') setUnitLabel('Point');
                    else if (val === 'PER_FOOT') setUnitLabel('Foot');
                    else if (val === 'DAILY_WAGE') setUnitLabel('Day / Shift');
                    else if (val === 'FIXED_VISIT') setUnitLabel('Visit');
                  }}
                  variant="coral"
                  size="md"
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                  Unit Label (e.g. Tree, Hour, Sq.Ft)
                </label>
                <input
                  type="text"
                  value={unitLabel}
                  onChange={(e) => setUnitLabel(e.target.value)}
                  placeholder="e.g. Tree / Hour"
                  className={`w-full rounded-xl px-3.5 py-2.5 text-xs border focus:outline-none focus:border-[#FF5C38] ${
                    isDark ? 'bg-[#181A20] border-white/[0.08] text-white placeholder-zinc-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Base Worker Wage */}
              <div
                className={`p-3 rounded-xl border space-y-1 ${
                  isDark ? 'bg-[#181A20] border-emerald-500/20' : 'bg-white border-emerald-200'
                }`}
              >
                <label className="block text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                  Worker Pay (₹ / {unitLabel || 'Unit'})
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-500 font-mono">
                    ₹
                  </span>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={baseWorkerWage}
                    onChange={(e) => setBaseWorkerWage(e.target.value === '' ? '' : Number(e.target.value))}
                    className={`w-full rounded-lg pl-6 pr-2.5 py-1.5 text-xs font-mono font-bold text-emerald-400 border border-emerald-500/30 focus:outline-none focus:border-emerald-400 ${
                      isDark ? 'bg-[#121318]' : 'bg-emerald-50/50'
                    }`}
                  />
                </div>
              </div>

              {/* Base Customer Rate */}
              <div
                className={`p-3 rounded-xl border space-y-1 ${
                  isDark ? 'bg-[#181A20] border-blue-500/20' : 'bg-white border-blue-200'
                }`}
              >
                <label className="block text-[10px] font-bold text-blue-500 uppercase tracking-wider">
                  Customer Rate (₹ / {unitLabel || 'Unit'})
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-500 font-mono">
                    ₹
                  </span>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={baseCustomerRate}
                    onChange={(e) => setBaseCustomerRate(e.target.value === '' ? '' : Number(e.target.value))}
                    className={`w-full rounded-lg pl-6 pr-2.5 py-1.5 text-xs font-mono font-bold text-blue-400 border border-blue-500/30 focus:outline-none focus:border-blue-400 ${
                      isDark ? 'bg-[#121318]' : 'bg-blue-50/50'
                    }`}
                  />
                </div>
              </div>

              {/* Minimum Units */}
              <div
                className={`p-3 rounded-xl border space-y-1 ${
                  isDark ? 'bg-[#181A20] border-white/[0.08]' : 'bg-white border-slate-200'
                }`}
              >
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  Min Units ({unitLabel || 'Unit'}s)
                </label>
                <input
                  type="number"
                  min={1}
                  value={minUnits}
                  onChange={(e) => setMinUnits(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="1"
                  className={`w-full rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold border focus:outline-none focus:border-[#FF5C38] ${
                    isDark ? 'bg-[#121318] border-white/[0.08] text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Service Image / Media */}
          <div
            className={`border rounded-2xl p-4 space-y-3 ${
              isDark ? 'bg-[#121318] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <label className={`block text-xs font-bold ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                  Service Image / Thumbnail
                </label>
                <p className={`text-[11px] mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Select a banner preset, upload an image, or enter a URL
                </p>
              </div>

              {/* Mode Switcher Tabs */}
              <div
                className={`flex items-center gap-1 p-1 rounded-xl border ${
                  isDark ? 'bg-[#181A20] border-white/[0.06]' : 'bg-white border-slate-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setImageInputTab('preset')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                    imageInputTab === 'preset'
                      ? 'bg-[#FF5C38] text-white'
                      : isDark
                      ? 'text-zinc-400 hover:text-white'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <ImageIcon className="w-3 h-3" />
                  <span>Presets</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputTab('upload')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                    imageInputTab === 'upload'
                      ? 'bg-[#FF5C38] text-white'
                      : isDark
                      ? 'text-zinc-400 hover:text-white'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputTab('url')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                    imageInputTab === 'url'
                      ? 'bg-[#FF5C38] text-white'
                      : isDark
                      ? 'text-zinc-400 hover:text-white'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Link2 className="w-3 h-3" />
                  <span>URL</span>
                </button>
              </div>
            </div>

            {/* Active Preview if image exists */}
            {image && (
              <div
                className={`flex items-center gap-3 p-3 rounded-xl border ${
                  isDark ? 'bg-[#181A20] border-white/[0.08]' : 'bg-white border-slate-200'
                }`}
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 flex items-center justify-center border border-white/[0.08]">
                  <img
                    src={image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold truncate ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                    Image Attached
                  </p>
                  <p className={`text-[11px] truncate ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    {image.startsWith('data:') ? 'Custom uploaded image' : image}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setImage('');
                    setUrlInput('');
                  }}
                  className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg border border-transparent hover:border-rose-500/30 transition-colors cursor-pointer"
                  title="Remove Image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Preset Selection Buttons */}
            {imageInputTab === 'preset' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DEFAULT_IMAGE_PRESETS.map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => setImage(preset.url)}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      image === preset.url
                        ? 'border-[#FF5C38] bg-[#FF5C38]/10 text-[#FF5C38]'
                        : isDark
                        ? 'border-white/[0.06] bg-[#181A20] hover:border-white/[0.12] text-zinc-300'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-white/[0.06]">
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-[11px] font-medium truncate">
                      {preset.label}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Upload File Input */}
            {imageInputTab === 'upload' && (
              <div>
                <label
                  className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                    isDark
                      ? 'border-zinc-700 hover:border-[#FF5C38] bg-[#181A20]/60 hover:bg-[#181A20]'
                      : 'border-slate-300 hover:border-[#FF5C38] bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pt-2 pb-2">
                    <Upload className="w-5 h-5 mb-1.5 text-zinc-400" />
                    <p className={`text-xs font-medium ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                      <span className="text-[#FF5C38]">Click to upload</span> or drag and drop
                    </p>
                    <p className={`text-[10px] mt-0.5 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                      PNG, JPG, or WebP (max 5MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            )}

            {/* Direct URL Input */}
            {imageInputTab === 'url' && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/image.png or /Banners/coco.png"
                  className={`flex-1 rounded-xl px-3.5 py-2 text-xs border focus:outline-none focus:border-[#FF5C38] ${
                    isDark ? 'bg-[#181A20] border-white/[0.08] text-white placeholder-zinc-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (urlInput.trim()) {
                      setImage(urlInput.trim());
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-[#FF5C38] hover:bg-[#FF6B4A] text-white text-xs font-semibold cursor-pointer transition-colors"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Service Description */}
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
              Service Description <span className={`font-normal ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description or operational details about this service (optional)..."
              className={`w-full rounded-xl px-4 py-2.5 text-xs border focus:outline-none focus:border-[#FF5C38] ${
                isDark ? 'bg-[#121318] border-white/[0.06] text-white placeholder-zinc-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Active Status Checkbox */}
          <div className="flex items-center gap-2.5 pt-1">
            <input
              type="checkbox"
              id="editIsActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-[#FF5C38] accent-[#FF5C38]"
            />
            <label htmlFor="editIsActive" className={`text-xs cursor-pointer ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
              Active in service catalog
            </label>
          </div>
        </form>

        {/* Pinned Footer */}
        <div
          className={`p-5 border-t flex items-center justify-end gap-3 ${
            isDark ? 'bg-[#14151B] border-white/[0.06]' : 'bg-slate-50 border-slate-100'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              isDark
                ? 'text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08]'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
            }`}
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
            className="px-6 py-2.5 rounded-full bg-[#FF5C38] hover:bg-[#FF6B4A] text-white text-xs font-bold shadow-lg shadow-[#FF5C38]/25 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
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
