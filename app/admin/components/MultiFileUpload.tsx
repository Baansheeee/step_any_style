'use client';

import { useCallback, useRef, useState } from 'react';
import Image from 'next/image';

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

interface MultiFileUploadProps {
  /** Current value — comma-separated URL string */
  value: string;
  /** Called with updated comma-separated URLs */
  onChange: (urls: string) => void;
  /** Label shown above the upload area */
  label: string;
  /** Optional placeholder text */
  placeholder?: string;
}

export default function MultiFileUpload({ value, onChange, label, placeholder }: MultiFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState('');

  const currentUrls = value
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    setTotalFiles(fileArray.length);
    setUploadedCount(0);
    setError('');

    const newUrls: string[] = [];
    const errors: string[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];

      try {
        const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        const uploadedUrl = await new Promise<string>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const fileProgress = (e.loaded / e.total) * 100;
              const overallProgress = ((i * 100) + fileProgress) / fileArray.length;
              setUploadProgress(Math.round(overallProgress));
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const data = JSON.parse(xhr.responseText);
              resolve(data.secure_url);
            } else {
              try {
                const errData = JSON.parse(xhr.responseText);
                reject(new Error(errData.error?.message || `Failed to upload ${file.name}`));
              } catch {
                reject(new Error(`Failed to upload ${file.name}`));
              }
            }
          });

          xhr.addEventListener('error', () => reject(new Error(`Network error uploading ${file.name}`)));
          xhr.addEventListener('abort', () => reject(new Error(`Upload cancelled for ${file.name}`)));

          xhr.open('POST', url);
          xhr.send(formData);
        });

        newUrls.push(uploadedUrl);
        setUploadedCount(i + 1);
      } catch (err) {
        errors.push(err instanceof Error ? err.message : `Failed to upload ${file.name}`);
      }
    }

    if (newUrls.length > 0) {
      const updated = [...currentUrls, ...newUrls];
      onChange(updated.join(', '));
    }

    if (errors.length > 0) {
      setError(errors.join(' '));
    }

    setIsUploading(false);
    setUploadProgress(0);
    setTotalFiles(0);
    setUploadedCount(0);
  }, [currentUrls, onChange]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) uploadFiles(files);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) uploadFiles(files);
  };

  const handleRemove = (urlToRemove: string) => {
    const updated = currentUrls.filter((u) => u !== urlToRemove);
    onChange(updated.join(', '));
  };

  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-black text-purple-600 uppercase mb-1">{label}</label>

      {/* Thumbnails grid */}
      {currentUrls.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {currentUrls.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className="relative group rounded-lg overflow-hidden border border-purple-100 bg-gray-50 aspect-square"
            >
              <Image
                src={url}
                alt={`Gallery image ${idx + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => handleRemove(url)}
                  className="w-7 h-7 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg hover:bg-red-600 transition-colors flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-xl border-2 border-dashed transition-all
          flex flex-col items-center justify-center gap-1.5 py-4 px-3
          ${isDragOver
            ? 'border-purple-500 bg-purple-50 scale-[1.01]'
            : 'border-purple-200 bg-white hover:border-purple-400 hover:bg-purple-50/40'
          }
          ${isUploading ? 'pointer-events-none' : ''}
        `}
      >
        {isUploading ? (
          <>
            <div className="w-full max-w-[180px] bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-[10px] font-semibold text-purple-600">
              Uploading {uploadedCount}/{totalFiles} ({uploadProgress}%)
            </p>
          </>
        ) : (
          <>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-[10px] font-bold text-gray-600 text-center">
              Drop images or <span className="text-purple-600 underline underline-offset-2">browse</span>
            </p>
            <p className="text-[9px] text-gray-400">
              {placeholder || 'Select multiple images at once'}
            </p>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {error && (
        <p className="text-xs text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
}
