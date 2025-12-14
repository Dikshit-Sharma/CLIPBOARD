
import React from 'react';
import type { ClipboardFile } from '../types';

interface FileListProps {
  files: ClipboardFile[];
  onDelete?: (fileId: string) => void;
  canDelete: boolean;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B';
  const k = 1024;
  const sizes = ['KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i - 1];
}

export const FileList: React.FC<FileListProps> = ({ files, onDelete, canDelete }) => {
  if (files.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4 text-theme-text-primary">Attached Files</h3>
      <div className="space-y-2">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between p-3 bg-theme-bg-secondary rounded-lg border border-theme-border"
          >
            <div className="flex items-center space-x-4 overflow-hidden">
               <div className="p-2 bg-theme-bg-primary rounded text-2xl">
                 📄
               </div>
               <div className="min-w-0">
                 <a
                   href={file.url}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="block text-theme-primary hover:underline font-medium truncate"
                 >
                   {file.name}
                 </a>
                 <div className="text-xs text-theme-text-secondary">
                    {formatSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                 </div>
               </div>
            </div>

            <div className="flex items-center space-x-2 pl-4">
              <a
                 href={file.url}
                 download
                 className="p-2 text-theme-text-secondary hover:text-theme-primary transition-colors"
                 title="Download"
              >
                ⬇
              </a>
              {canDelete && onDelete && (
                <button
                  onClick={() => onDelete(file.id)}
                  className="p-2 text-theme-text-secondary hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
