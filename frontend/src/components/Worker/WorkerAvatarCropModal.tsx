'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  UploadCloud,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Check,
  Loader2,
  Camera,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { workerProfileService } from '@/services';

interface WorkerAvatarCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAvatarUpdated: (newAvatarUrl: string) => void;
  token: string;
  currentAvatar?: string | null;
  userName?: string;
}

export function WorkerAvatarCropModal({
  isOpen,
  onClose,
  onAvatarUpdated,
  token,
  currentAvatar,
  userName = 'Operative',
}: WorkerAvatarCropModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);

  // Reset state on open/close
  useEffect(() => {
    if (!isOpen) {
      setSelectedImage(null);
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      setErrorMessage(null);
      setIsUploading(false);
    }
  }, [isOpen]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size must be less than 5MB.');
      return;
    }

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  // Draw preview canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedImage) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageObjRef.current;
    if (!img) return;

    const size = 300;
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);

    // Save context for transform
    ctx.save();

    // Center and apply transforms
    ctx.translate(size / 2 + position.x, size / 2 + position.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Draw image centered
    const aspect = img.width / img.height;
    let drawWidth = size;
    let drawHeight = size;

    if (aspect > 1) {
      drawWidth = size * aspect;
      drawHeight = size;
    } else {
      drawWidth = size;
      drawHeight = size / aspect;
    }

    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();

    // Draw circular mask overlay (darken outside circle)
    ctx.save();
    ctx.fillStyle = 'rgba(15, 17, 26, 0.65)';
    ctx.beginPath();
    ctx.rect(0, 0, size, size);
    ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2, true);
    ctx.fill();

    // Draw circular border
    ctx.strokeStyle = '#5E42B4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }, [selectedImage, zoom, rotation, position]);

  // Load image object when selectedImage changes
  useEffect(() => {
    if (!selectedImage) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageObjRef.current = img;
      drawCanvas();
    };
    img.src = selectedImage;
  }, [selectedImage, drawCanvas]);

  useEffect(() => {
    if (selectedImage && imageObjRef.current) {
      drawCanvas();
    }
  }, [zoom, rotation, position, drawCanvas, selectedImage]);

  // Mouse / Touch drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Generate cropped circle blob
  const generateCroppedBlob = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = imageObjRef.current;
      if (!img) return reject(new Error('No image loaded'));

      const outputCanvas = document.createElement('canvas');
      const size = 320;
      outputCanvas.width = size;
      outputCanvas.height = size;
      const ctx = outputCanvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context unavailable'));

      // Create circular clipping path
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip();

      ctx.translate(size / 2 + position.x, size / 2 + position.y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      const aspect = img.width / img.height;
      let drawWidth = size;
      let drawHeight = size;

      if (aspect > 1) {
        drawWidth = size * aspect;
        drawHeight = size;
      } else {
        drawWidth = size;
        drawHeight = size / aspect;
      }

      ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

      outputCanvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create image blob'));
        },
        'image/jpeg',
        0.92,
      );
    });
  };

  // Upload handler
  const handleUploadAndSave = async () => {
    if (!selectedImage) return;
    setIsUploading(true);
    setErrorMessage(null);

    try {
      const croppedBlob = await generateCroppedBlob();

      // 1. Fetch Cloudinary client configuration
      let secureUrl = '';
      try {
        const cloudConfig = await workerProfileService.getCloudinaryConfig(token);
        if (cloudConfig?.cloudName && cloudConfig?.uploadPreset) {
          const directUpload = await workerProfileService.uploadToCloudinaryDirect(
            croppedBlob,
            cloudConfig.cloudName,
            cloudConfig.uploadPreset,
          );
          secureUrl = directUpload.secure_url;
        }
      } catch (directErr) {
        console.warn('Direct upload preset not available, falling back to server upload:', directErr);
      }

      // 2. Fallback to server endpoint if direct upload couldn't happen
      if (!secureUrl) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(croppedBlob);
        });
        const base64Data = await base64Promise;
        const uploadRes = await workerProfileService.uploadAvatar(base64Data, token);
        secureUrl = uploadRes.avatar;
      }

      // 3. Persist to worker profile
      await workerProfileService.updateProfile({ avatar: secureUrl }, token);

      onAvatarUpdated(secureUrl);
      onClose();
    } catch (err: any) {
      console.error('Failed to upload worker avatar:', err);
      setErrorMessage(err?.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg bg-[#14161D] rounded-3xl border border-gray-800 shadow-2xl overflow-hidden text-gray-200 flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#0D0E12]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#5E42B4]/20 border border-[#5E42B4]/40 flex items-center justify-center text-[#9D80F7]">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Update Operative Avatar
              </h2>
              <p className="text-[11px] text-gray-400">
                Crop & center your field identity photo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!selectedImage ? (
            /* Upload Initial Step */
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-700/80 rounded-2xl hover:border-[#5E42B4] transition-colors bg-[#0D0E12]/50 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-800/80 border border-gray-700 flex items-center justify-center mb-4 overflow-hidden shadow-inner">
                {currentAvatar ? (
                  <img
                    src={currentAvatar}
                    alt={userName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-500" />
                )}
              </div>

              <h3 className="text-sm font-semibold text-gray-200 mb-1">
                Choose a clear portrait
              </h3>
              <p className="text-xs text-gray-400 max-w-xs mb-4">
                Recommended for field identification badge, dispatches, and supervisor radar.
              </p>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#5E42B4] hover:bg-[#4E34A0] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload From Device</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            /* Crop Canvas Step */
            <div className="flex flex-col items-center gap-4">
              <div
                className="relative w-[300px] h-[300px] rounded-2xl overflow-hidden bg-black/60 shadow-inner cursor-grab active:cursor-grabbing select-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <canvas
                  ref={canvasRef}
                  className="w-full h-full block"
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] text-gray-300 font-mono pointer-events-none">
                  Drag to Reposition
                </div>
              </div>

              {/* Crop Controls */}
              <div className="w-full max-w-[340px] space-y-3 bg-[#0D0E12] p-3.5 rounded-2xl border border-gray-800">
                {/* Zoom Control */}
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
                    className="p-1 rounded-lg hover:bg-gray-800 text-gray-300"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1 accent-[#5E42B4] h-1.5 bg-gray-700 rounded-lg cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(2.5, z + 0.1))}
                    className="p-1 rounded-lg hover:bg-gray-800 text-gray-300"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Rotate & Re-select */}
                <div className="flex items-center justify-between pt-1 border-t border-gray-800/80">
                  <button
                    type="button"
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-[11px] text-gray-300 transition-colors"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>Rotate 90°</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      fileInputRef.current?.click();
                    }}
                    className="text-[11px] text-purple-400 hover:underline"
                  >
                    Choose Different Image
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-800 bg-[#0D0E12]">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          {selectedImage && (
            <button
              type="button"
              onClick={handleUploadAndSave}
              disabled={isUploading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#5E42B4] hover:bg-[#4E34A0] text-white text-xs font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading to Cloudinary...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Crop & Save Avatar</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
