/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, X, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  maxFiles?: number;
  multiple?: boolean;
  label?: string;
  subLabel?: string;
  styleType?: 'full' | 'compact' | 'avatar';
  existingImages?: string[];
  onRemoveImage?: (index: number) => void;
}

export default function ImageUploader({
  onImageUploaded,
  maxFiles = 4,
  multiple = false,
  label = "Upload Image",
  subLabel = "Drag and drop or click to select",
  styleType = 'full',
  existingImages = [],
  onRemoveImage
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorText, setErrorText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList) => {
    setErrorText('');
    const filesToUpload = Array.from(files);

    if (existingImages.length >= maxFiles) {
      setErrorText(`You have reached the maximum limit of ${maxFiles} images.`);
      return;
    }

    const availableSlots = maxFiles - existingImages.length;
    const itemsToProcess = multiple ? filesToUpload.slice(0, availableSlots) : [filesToUpload[0]];

    itemsToProcess.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        setErrorText('Please upload a valid image file (PNG, JPG, WEBP, etc.).');
        return;
      }

      // Check file size (e.g., limit to 5MB to prevent localstorage bloat in preview)
      if (file.size > 5 * 1024 * 1024) {
        setErrorText('Image is too large. Please select an image under 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onImageUploaded(base64String);
      };
      reader.onerror = () => {
        setErrorText('Failed to read file. Please try again.');
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (styleType === 'avatar') {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full border-2 border-[#D3D1C7] bg-[#FDFAF6] overflow-hidden flex items-center justify-center group">
            {existingImages.length > 0 ? (
              <>
                <img
                  src={existingImages[0]}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => onRemoveImage?.(0)}
                  className="absolute inset-0 bg-[#E07A5F]/90 text-white font-bold text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Remove
                </button>
              </>
            ) : (
              <ImageIcon className="w-6 h-6 text-[#888780]" />
            )}
          </div>

          <div className="flex-1">
            <button
              type="button"
              onClick={triggerFileInput}
              className="px-3.5 py-1.5 bg-[#3D405B] text-white rounded-xl text-xs font-bold hover:bg-[#3D405B]/90 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Upload Photo
            </button>
            <p className="text-[10px] text-[#888780] mt-1">{subLabel}</p>
          </div>
        </div>

        {errorText && (
          <div className="flex items-center gap-1 text-red-500 text-[10px] bg-red-50 px-2 py-1 rounded">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            <span>{errorText}</span>
          </div>
        )}

        <input
          id="avatar-upload-input"
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
          }}
          accept="image/*"
          className="hidden"
        />
      </div>
    );
  }

  if (styleType === 'compact') {
    return (
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-[#3D405B]">{label}</label>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`border border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${
            isDragging
              ? 'border-[#E07A5F] bg-[#FAF2EE]'
              : 'border-[#D3D1C7] bg-[#FDFAF6] hover:bg-[#FAF2EE]/50'
          }`}
        >
          <UploadCloud className="w-5 h-5 text-[#E07A5F] mb-1" />
          <p className="text-xs text-[#3D405B] font-medium">Click or drag image file here</p>
          <p className="text-[10px] text-[#888780]">{subLabel}</p>
        </div>

        {errorText && (
          <div className="flex items-center gap-1 text-red-500 text-[10px] bg-red-50 px-2.5 py-1.5 rounded-lg">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{errorText}</span>
          </div>
        )}

        {existingImages.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {existingImages.map((img, idx) => (
              <div key={idx} className="relative w-12 h-12 rounded-lg border border-[#D3D1C7] overflow-hidden group">
                <img src={img} alt="preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveImage?.(idx);
                  }}
                  className="absolute inset-x-0 bottom-0 bg-red-500/90 text-white text-[9px] py-0.5 text-center font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          id="compact-upload-input"
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
          }}
          accept="image/*"
          multiple={multiple}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-xs font-bold text-[#3D405B]">{label}</label>
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-[#E07A5F] bg-[#FAF2EE]/70 scale-[0.99]'
            : 'border-[#D3D1C7] bg-[#FDFAF6] hover:bg-[#FAF2EE]/30 hover:border-[#E07A5F]/50'
        }`}
      >
        <div className="w-10 h-10 rounded-full bg-[#FAF2EE] flex items-center justify-center mb-2.5">
          <UploadCloud className="w-5.5 h-5.5 text-[#E07A5F]" />
        </div>
        <p className="text-xs text-[#3D405B] font-bold">Drag & drop your pet photos here</p>
        <p className="text-[11px] text-[#888780] mt-0.5">{subLabel}</p>
        <button
          type="button"
          className="mt-3 px-3 py-1.5 bg-[#3D405B] text-white text-[11px] font-bold rounded-xl hover:opacity-90 transition-all shadow-xs"
        >
          Browse local files
        </button>
      </div>

      {errorText && (
        <div className="flex items-center gap-1.5 text-red-500 text-xs bg-red-50 px-3 py-2 rounded-xl border border-red-100">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorText}</span>
        </div>
      )}

      {existingImages.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-extrabold text-[#888780] tracking-wider uppercase">ADDED IMAGES ({existingImages.length}/{maxFiles})</p>
          <div className="grid grid-cols-4 gap-2.5">
            {existingImages.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl border border-[#D3D1C7] overflow-hidden group shadow-2xs">
                <img src={img} alt="post media" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveImage?.(idx);
                  }}
                  className="absolute inset-0 bg-[#E07A5F]/95 text-white text-xs font-bold flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-1"
                >
                  <X className="w-4 h-4" />
                  <span>Remove</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <input
        id="full-upload-input"
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
        }}
        accept="image/*"
        multiple={multiple}
        className="hidden"
      />
    </div>
  );
}
