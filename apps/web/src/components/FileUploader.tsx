
import React, { useState, useRef } from 'react';
import { presignUpload, saveFileMetadata } from '../services/api';

interface FileUploaderProps {
  clipboardId: string;
  sessionToken: string;
  onUploadComplete: () => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ clipboardId, sessionToken, onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 150 * 1024 * 1024) {
      setError('File size exceeds 150MB limit.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // 1. Get Presigned URL
      const { url, path, publicUrl, fileId } = await presignUpload(clipboardId, sessionToken, {
        name: file.name,
        type: file.type,
        size: file.size
      });

      // 2. Upload to Supabase Storage
      const uploadRes = await fetch(url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      });

      if (!uploadRes.ok) {
        throw new Error('Upload failed');
      }

      // 3. Save Metadata
      await saveFileMetadata(clipboardId, sessionToken, {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        path: path,
        url: publicUrl,
        uploadedAt: new Date().toISOString()
      });

      // Success
      if (fileInputRef.current) fileInputRef.current.value = '';
      onUploadComplete();
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-6 p-4 border border-dashed border-theme-border rounded-lg bg-theme-bg-secondary/50 text-center">
      {error && (
        <div className="mb-3 text-sm text-red-500 bg-red-500/10 p-2 rounded">
          {error}
        </div>
      )}

      {uploading ? (
        <div className="flex flex-col items-center justify-center py-4">
          <div className="w-8 h-8 border-4 border-theme-primary border-t-transparent rounded-full animate-spin mb-2"></div>
          <span className="text-theme-text-secondary text-sm">Uploading...</span>
        </div>
      ) : (
        <div>
           <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileChange}
            ref={fileInputRef}
            disabled={uploading}
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer inline-flex flex-col items-center"
          >
             <span className="text-2xl mb-2">☁️</span>
             <span className="font-medium text-theme-primary hover:underline">Click to upload file</span>
             <span className="text-xs text-theme-text-secondary mt-1">Max 150MB</span>
          </label>
        </div>
      )}
    </div>
  );
};
