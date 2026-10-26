import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  X,
  Star,
  ChevronLeft,
  ChevronRight,
  Eye,
  Image as ImageIcon,
} from 'lucide-react';

export default function ImageUploader({
  images = [], // Array of { url: string, publicId?: string, file?: File }
  onChange,
  maxImages = 8,
  className = '',
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    const fileList = Array.from(files);
    const validFiles = fileList.filter((f) => f.type.startsWith('image/'));

    if (images.length + validFiles.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images.`);
    }

    const remainingSlots = Math.max(0, maxImages - images.length);
    const allowedFiles = validFiles.slice(0, remainingSlots);

    const newImageItems = allowedFiles.map((file) => ({
      url: URL.createObjectURL(file),
      file,
      publicId: '',
      isNew: true,
    }));

    if (onChange) {
      onChange([...images, ...newImageItems]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = ''; // Reset input
    }
  };

  const handleDelete = (index) => {
    const updated = images.filter((_, i) => i !== index);
    if (onChange) onChange(updated);
  };

  const handleSetPrimary = (index) => {
    if (index === 0) return;
    const item = images[index];
    const rest = images.filter((_, i) => i !== index);
    if (onChange) onChange([item, ...rest]);
  };

  const handleMove = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    if (onChange) onChange(updated);
  };

  return (
    <div className={`space-y-4 font-body ${className}`}>
      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-primary bg-primary-50/50 scale-[1.01]'
            : 'border-gray-300 hover:border-primary/60 hover:bg-cream/20 bg-gray-50/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="w-12 h-12 rounded-2xl bg-white text-primary mx-auto flex items-center justify-center shadow-soft mb-3">
          <UploadCloud className="w-6 h-6" />
        </div>

        <h4 className="font-heading font-black text-gray-900 text-sm sm:text-base">
          Drag and drop images here, or <span className="text-primary underline">browse</span>
        </h4>
        <p className="text-xs text-gray-500 mt-1">
          Supports PNG, JPG, WebP. First image will be marked as Primary catalog cover.
        </p>
      </div>

      {/* Uploaded Images Grid */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-700">
              Uploaded Images ({images.length}/{maxImages})
            </span>
            <span className="text-[11px] text-gray-400">
              Use arrows to reorder • Star to set primary
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((img, idx) => {
              const url = typeof img === 'string' ? img : img.url;
              const isPrimary = idx === 0;

              return (
                <div
                  key={idx}
                  className={`group relative rounded-2xl overflow-hidden border-2 bg-cream/30 aspect-square flex items-center justify-center transition-all ${
                    isPrimary ? 'border-primary shadow-soft' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={url}
                    alt={`Product thumbnail ${idx + 1}`}
                    className="w-full h-full object-contain p-2"
                  />

                  {/* Primary Badge */}
                  {isPrimary && (
                    <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                      <Star className="w-3 h-3 fill-white" />
                      Primary
                    </div>
                  )}

                  {/* Hover Overlay Actions */}
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewImage(url);
                        }}
                        className="p-1.5 rounded-xl bg-white/80 hover:bg-white text-gray-800 transition-colors"
                        title="Preview Image"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(idx);
                        }}
                        className="p-1.5 rounded-xl bg-white/80 hover:bg-brandRed hover:text-white text-brandRed transition-colors"
                        title="Delete Image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMove(idx, -1);
                          }}
                          className="p-1 rounded-lg bg-white/80 hover:bg-white text-gray-700 disabled:opacity-30 transition-colors"
                          title="Move Left"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          disabled={idx === images.length - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMove(idx, 1);
                          }}
                          className="p-1 rounded-lg bg-white/80 hover:bg-white text-gray-700 disabled:opacity-30 transition-colors"
                          title="Move Right"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {!isPrimary && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetPrimary(idx);
                          }}
                          className="px-2 py-1 rounded-lg bg-white text-primary text-[10px] font-bold hover:bg-primary hover:text-white transition-colors"
                          title="Make Primary"
                        >
                          Set Primary
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Enlarged Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="bg-white rounded-3xl p-4 max-w-xl w-full relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImage}
              alt="Enlarged preview"
              className="w-full h-80 object-contain rounded-2xl bg-cream/40"
            />
          </div>
        </div>
      )}
    </div>
  );
}
