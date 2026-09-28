'use client';

import React, { useState } from 'react';
import {
  X,
  Plus,
  Loader2,
  AlertCircle,
  Sparkles,
  Layers,
  Upload,
  ImageIcon,
  Trash2,
  Link2,
} from 'lucide-react';
import { adminServicesService, CreateServiceInput, ServiceItem } from '@/services/Admin/services';
import { AdminDropdown, AdminDropdownOption } from '@/components/Admin/admin-dropdown';

interface CreateServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  onSuccess: (newService: ServiceItem) => void;
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
  const [image, setImage] = useState('');
  const [imageInputTab, setImageInputTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setCustomServiceId('');
    setCategory(CATEGORY_PRESETS[0]);
    setCustomCategory('');
    setImage('');
    setUrlInput('');
    setDescription('');
    setIsActive(true);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WebP, etc.)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image size exceeds 10MB limit');
      return;
    }

    setError(null);
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawDataUrl = event.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const maxDim = 800;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            setImage(rawDataUrl);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          try {
            const webp = canvas.toDataURL('image/webp', 0.85);
            if (webp.startsWith('data:image/webp')) {
              setImage(webp);
              return;
            }
          } catch {}
          setImage(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = () => setImage(rawDataUrl);
        img.src = rawDataUrl;
      };
      reader.readAsDataURL(file);
    } catch {
      setError('Failed to process image');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    if (!cleanName) {
      setError('Please provide a valid service name');
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
        image: image.trim() || undefined,
        description: description.trim() || undefined,
        isActive,
      };

      const res = await adminServicesService.createService(payload, token);
      onSuccess(res.service);
      resetForm();
      onClose();
    } catch (err: any) {
      console.error('Failed to create service', err);
      setError(err?.message || 'Failed to create service. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#14151A] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top subtle glow line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#7B4DFF]/50 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800/80 bg-[#16171D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 flex items-center justify-center text-[#7B4DFF]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-100">
                Register New Service
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Auto-generates sequential Service ID (e.g. KKS-001)
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
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
                  Auto-increments next available code in sequence (e.g. KKS-001)
                </div>
              </div>
            </div>
            <div className="shrink-0">
              <input
                type="text"
                value={customServiceId}
                onChange={(e) => setCustomServiceId(e.target.value)}
                placeholder="Auto code"
                className="w-32 bg-[#0E0F12] border border-gray-700/80 rounded-lg px-2.5 py-1 text-xs font-mono text-emerald-400 placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Service Name */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Service Name / Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Exterior & Interior Plastering Squads"
              className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#2A835F] focus:ring-1 focus:ring-[#2A835F] transition-all"
              required
            />
          </div>

          {/* Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Category <span className="text-rose-400">*</span>
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

          {/* Service Image / Media */}
          <div className="bg-[#181A22] border border-gray-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-gray-200">
                  Service Image / Thumbnail
                </label>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Select a banner preset, upload an image, or enter a URL
                </p>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex items-center gap-1 bg-[#121317] p-1 rounded-xl border border-gray-800">
                <button
                  type="button"
                  onClick={() => setImageInputTab('preset')}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                    imageInputTab === 'preset'
                      ? 'bg-[#2A835F] text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <ImageIcon className="w-3 h-3" />
                  <span>Presets</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputTab('upload')}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                    imageInputTab === 'upload'
                      ? 'bg-[#2A835F] text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputTab('url')}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                    imageInputTab === 'url'
                      ? 'bg-[#2A835F] text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Link2 className="w-3 h-3" />
                  <span>URL</span>
                </button>
              </div>
            </div>

            {/* Active Preview if image exists */}
            {image && (
              <div className="flex items-center gap-3 p-3 bg-[#121317] border border-gray-800 rounded-xl">
                <div className="w-14 h-14 rounded-xl bg-gray-900 border border-gray-700/80 overflow-hidden shrink-0 flex items-center justify-center">
                  <img
                    src={image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-200 truncate">
                    Image Attached
                  </p>
                  <p className="text-[11px] text-gray-400 truncate">
                    {image.startsWith('data:') ? 'Custom uploaded image' : image}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setImage('');
                    setUrlInput('');
                  }}
                  className="p-2 text-gray-400 hover:text-rose-400 bg-[#1A1C23] hover:bg-rose-500/10 rounded-lg border border-gray-800 hover:border-rose-500/30 transition-colors cursor-pointer"
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
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                        : 'border-gray-800 bg-[#14151A] hover:border-gray-700 text-gray-300'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-900 overflow-hidden shrink-0 border border-gray-700/50">
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
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-700 hover:border-emerald-500/60 rounded-xl cursor-pointer bg-[#14151A]/60 hover:bg-[#1A1C23] transition-colors">
                  <div className="flex flex-col items-center justify-center pt-2 pb-2">
                    <Upload className="w-5 h-5 mb-1.5 text-gray-400" />
                    <p className="text-xs text-gray-300 font-medium">
                      <span className="text-emerald-400">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
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
                  className="flex-1 bg-[#14151A] border border-gray-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#2A835F]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (urlInput.trim()) {
                      setImage(urlInput.trim());
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#2A835F] hover:bg-emerald-600 text-white text-xs font-semibold cursor-pointer transition-colors"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Service Description (Optional) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-gray-300">
                Service Description <span className="text-gray-500 font-normal">(Optional)</span>
              </label>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description or operational details about this service (optional)..."
              className="w-full bg-[#1A1C23] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#2A835F] transition-all"
            />
          </div>

          {/* Active Status Checkbox */}
          <div className="flex items-center gap-2.5 pt-1">
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
        </form>

        {/* Pinned Footer */}
        <div className="p-5 border-t border-gray-800/80 bg-[#16171D] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-xl border border-gray-800 text-gray-300 hover:bg-[#1A1C23] text-xs font-semibold transition-colors cursor-pointer"
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
            className="px-5 py-2 rounded-xl bg-[#7B4DFF] hover:bg-[#6A3CEB] text-white text-xs font-bold shadow-lg shadow-[#7B4DFF]/25 hover:shadow-[#7B4DFF]/40 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
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
      </div>
    </div>
  );
}
