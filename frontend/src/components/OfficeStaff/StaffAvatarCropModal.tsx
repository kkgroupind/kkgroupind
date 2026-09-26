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
import { officeStaffProfileService } from '@/services';

interface StaffAvatarCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAvatarUpdated: (newAvatarUrl: string) => void;
  token: string;
  currentAvatar?: string | null;
  userName?: string;
}

export function StaffAvatarCropModal({
  isOpen,
  onClose,
  onAvatarUpdated,
  token,
  currentAvatar,
  userName = 'Staff',
}: StaffAvatarCropModalProps) {
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
      setErrorMessage('Please select a valid image file (JPG, PNG, WebP)');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage('Image file is too large (maximum 8MB allowed)');
      return;
    }

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setSelectedImage(result);
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });

      const img = new Image();
      img.onload = () => {
        imageObjRef.current = img;
        drawCanvas();
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  // Draw on Canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageObjRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 320;
    canvas.width = size;
    canvas.height = size;

    // Clear
    ctx.clearRect(0, 0, size, size);

    ctx.save();
    // Center of canvas
    ctx.translate(size / 2, size / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.translate(position.x, position.y);

    // Calculate aspect fit / fill
    const scale = Math.max(size / img.width, size / img.height);
    const drawWidth = img.width * scale;
    const drawHeight = img.height * scale;

    ctx.drawImage(
      img,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight,
    );
    ctx.restore();
  }, [zoom, rotation, position]);

  useEffect(() => {
    if (selectedImage && imageObjRef.current) {
      drawCanvas();
    }
  }, [selectedImage, zoom, rotation, position, drawCanvas]);

  // Mouse Drag / Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!selectedImage) return;
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

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!selectedImage || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Upload cropped image
  const handleCropAndUpload = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedImage) return;

    setIsUploading(true);
    setErrorMessage(null);

    try {
      // 1. Export cropped canvas as Blob
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.92);
      });

      if (!blob) {
        throw new Error('Failed to generate cropped image data');
      }

      // 2. Fetch Cloudinary public configuration from backend
      let cloudName = '';
      let uploadPreset = '';

      try {
        const cloudConfig = await officeStaffProfileService.getCloudinaryConfig(token);
        cloudName = cloudConfig?.cloudName || '';
        uploadPreset = cloudConfig?.uploadPreset || '';
      } catch (e) {
        // Fallback to process.env if available
        cloudName =
          process.env.NEXT_PUBLIC_CLOUDINARY_APP_NAME ||
          process.env.CLOUDINARY_APP_NAME ||
          '';
        uploadPreset =
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
          process.env.CLOUDINARY_UPLOAD_PRESET ||
          '';
      }

      let finalAvatarUrl = '';

      // 3. Perform unsigned direct upload if cloudName & uploadPreset exist
      if (cloudName && uploadPreset) {
        try {
          const uploadRes = await officeStaffProfileService.uploadToCloudinaryDirect(
            blob,
            cloudName,
            uploadPreset,
          );
          finalAvatarUrl = uploadRes.secure_url;
        } catch (directErr: any) {
          console.warn('Direct upload failed, attempting backend upload:', directErr);
        }
      }

      // 4. Fallback to backend upload if direct upload did not run or failed
      if (!finalAvatarUrl) {
        const base64Data = canvas.toDataURL('image/jpeg', 0.92);
        const backendUploadRes = await officeStaffProfileService.uploadAvatar(
          base64Data,
          token,
        );
        finalAvatarUrl = backendUploadRes.avatar;
      } else {
        // Save the direct uploaded URL into staff profile
        await officeStaffProfileService.updateProfile(
          { avatar: finalAvatarUrl },
          token,
        );
      }

      onAvatarUpdated(finalAvatarUrl);
      onClose();
    } catch (err: any) {
      console.error('Avatar upload failed:', err);
      setErrorMessage(
        err?.message || 'Failed to upload image to Cloudinary. Please try again.',
      );
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#12141C] border border-gray-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2A835F]/15 text-[#2A835F] border border-[#2A835F]/30 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Staff Profile Picture
              </h3>
              <p className="text-[11px] text-gray-400">
                Crop and upload your photo to Cloudinary
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="mt-5 space-y-4">
          {!selectedImage ? (
            /* Upload Zone */
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-700/80 hover:border-[#2A835F] bg-[#0E1017]/70 hover:bg-[#0E1017] rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="w-16 h-16 rounded-2xl bg-gray-800/80 group-hover:bg-[#2A835F]/15 group-hover:scale-105 border border-gray-700 group-hover:border-[#2A835F]/40 flex items-center justify-center text-gray-400 group-hover:text-emerald-400 transition-all mb-3 shadow-md">
                <UploadCloud className="w-7 h-7" />
              </div>
              <p className="text-xs font-bold text-white">Click or Drag & Drop photo</p>
              <p className="text-[11px] text-gray-400 mt-1">
                PNG, JPG or WebP up to 8MB
              </p>
              <span className="mt-3 px-3 py-1 rounded-full bg-[#1A1E29] text-[10px] font-semibold text-gray-300 border border-gray-800">
                Kerala Operations Staff ID
              </span>
            </div>
          ) : (
            /* Cropper Area */
            <div className="space-y-4">
              <div
                className="relative w-80 h-80 mx-auto rounded-2xl overflow-hidden bg-black border border-gray-800 cursor-move select-none touch-none shadow-inner"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-contain pointer-events-none"
                />

                {/* Circular overlay guide */}
                <div className="absolute inset-0 pointer-events-none border-2 border-[#2A835F]/60 rounded-full shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]" />
                <div className="absolute inset-0 pointer-events-none border border-white/20 rounded-full" />
              </div>

              {/* Cropper Controls */}
              <div className="space-y-3 bg-[#0E1017] p-3.5 rounded-2xl border border-gray-800/80">
                {/* Zoom control */}
                <div className="flex items-center gap-3 text-xs text-gray-300">
                  <ZoomOut className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type="range"
                    min="0.8"
                    max="3"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#2A835F]"
                  />
                  <ZoomIn className="w-4 h-4 text-gray-400 shrink-0" />
                </div>

                {/* Rotation and reset buttons */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setRotation((prev) => (prev + 90) % 360)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors border border-gray-700/60"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Rotate</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setZoom(1);
                      setRotation(0);
                      setPosition({ x: 0, y: 0 });
                    }}
                    className="text-gray-400 hover:text-gray-200 text-xs font-medium"
                  >
                    Reset Framing
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      fileInputRef.current?.click();
                    }}
                    className="flex items-center gap-1 text-[#2A835F] hover:underline text-xs font-semibold"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Change File</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {selectedImage && (
            <button
              type="button"
              onClick={handleCropAndUpload}
              disabled={isUploading}
              className="px-5 py-2 rounded-xl bg-[#2A835F] hover:bg-[#236b4e] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading to Cloudinary...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Crop & Save Photo</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
