"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { CloudUpload, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReuploadModalProps {
  fileLabel: string;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
}

const ReuploadModal: React.FC<ReuploadModalProps> = ({ fileLabel, onClose, onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || isUploading) return;

    setIsUploading(true);
    setError(null);
    try {
      await onUpload(file);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload file.");
    } finally {
      setIsUploading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-999999 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => !isUploading && onClose()}
    >
      <div
        className="w-full max-w-md rounded-xl border border-border bg-white dark:bg-neutral-900 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-200">
            Re-upload {fileLabel}
          </h3>
          <button
            type="button"
            onClick={() => !isUploading && onClose()}
            className="p-1 rounded text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label
            htmlFor="reupload-file-input"
            className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border p-6 text-center cursor-pointer hover:bg-muted/40 dark:hover:bg-neutral-800 transition-colors"
          >
            <CloudUpload className="w-8 h-8 text-neutral-400 dark:text-neutral-500" />
            <span className="text-sm text-neutral-600 dark:text-neutral-300">
              {file ? file.name : "Click to choose a document or image"}
            </span>
            <input
              id="reupload-file-input"
              type="file"
              accept=".pdf,.doc,.docx,image/*"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={!file || isUploading} className="bg-blue-500 hover:bg-blue-600 text-white">
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ReuploadModal;
