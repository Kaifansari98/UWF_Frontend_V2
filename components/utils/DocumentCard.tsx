"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import {
  FileText,
  FileSpreadsheet,
  FileArchive,
  FileCode,
  FileType,
  Download,
  Eye,
  ExternalLink,
  Loader2,
  CloudUpload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RootState } from "@/lib/store";
import ReuploadModal from "./ReuploadModal";

interface DocumentData {
  id: number | string;
  originalName: string;
  signedUrl: string;
  created_at?: string;
}

interface DocumentCardProps {
  doc: DocumentData;
  alwaysShowText?: boolean;
  onReupload?: (file: File) => Promise<void>;
}

export const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp"];
const PREVIEWABLE_EXTENSIONS = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", ...IMAGE_EXTENSIONS];
const OFFICE_EXTENSIONS = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"];

const getFileIcon = (ext: string) => {
  switch (ext) {
    case "pdf":
    case "doc":
    case "docx":
      return FileText;
    case "xls":
    case "xlsx":
    case "ppt":
    case "pptx":
      return FileSpreadsheet;
    case "zip":
    case "rar":
      return FileArchive;
    case "txt":
    case "md":
      return FileCode;
    default:
      return FileType;
  }
};

const getOfficePreviewUrl = (signedUrl: string): string =>
  `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(signedUrl)}`;

// ─── Preview Modal ────────────────────────────────────────────────────────────

interface PreviewModalProps {
  url: string;
  fileName: string;
  fileExt: string;
  onClose: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ url, fileName, fileExt, onClose }) => {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [previewError, setPreviewError] = useState<string | null>(null);

  const isImage = IMAGE_EXTENSIONS.includes(fileExt);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    const preparePreview = async () => {
      try {
        setIframeLoaded(false);
        setPreviewError(null);

        if (isImage) {
          if (!cancelled) setPreviewUrl(url);
          return;
        }

        if (fileExt === "pdf") {
          const response = await fetch(url);
          if (!response.ok) throw new Error("Unable to load PDF preview.");

          const blob = await response.blob();
          objectUrl = URL.createObjectURL(blob);

          if (!cancelled) setPreviewUrl(objectUrl);
          return;
        }

        if (OFFICE_EXTENSIONS.includes(fileExt)) {
          setPreviewUrl(getOfficePreviewUrl(url));
          return;
        }

        setPreviewError("Preview is not available for this file type.");
      } catch (error) {
        if (!cancelled) {
          setPreviewError(error instanceof Error ? error.message : "Failed to load preview.");
        }
      }
    };

    preparePreview();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fileExt, url, isImage]);

  return createPortal(
    <div
      className="fixed inset-0 z-999999 bg-black/80 backdrop-blur-sm p-4 sm:p-6 flex flex-col"
      onClick={onClose}
      style={{ pointerEvents: "auto" }}
    >
      <div
        className="relative h-full w-full overflow-hidden rounded-xl border border-border bg-white dark:bg-neutral-900 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded bg-muted text-neutral-500 dark:text-neutral-400">
              {fileExt}
            </span>
            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
              {fileName}
            </span>
            <button
              onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
              className="p-1 rounded text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            onClick={onClose}
            className="ml-3 shrink-0 p-1.5 rounded-full text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Close preview"
          >
            ✕
          </button>
        </div>

        {/* Content area */}
        <div className="relative flex-1 min-h-0 bg-neutral-100 dark:bg-neutral-950 flex flex-col">
          {!previewError && (!previewUrl || (!iframeLoaded && !isImage)) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-neutral-400 dark:text-neutral-500 bg-white dark:bg-neutral-900">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-xs">Loading preview…</span>
            </div>
          )}
          {previewError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white px-6 text-center dark:bg-neutral-900">
              <p className="text-sm text-neutral-600 dark:text-neutral-300">{previewError}</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
              >
                Open File In New Tab
              </Button>
            </div>
          ) : previewUrl ? (
            isImage ? (
              <div className="w-full h-full flex items-center justify-center p-4">
                <img
                  src={previewUrl}
                  alt={`Preview — ${fileName}`}
                  className="max-w-full max-h-full object-contain drop-shadow-md rounded"
                  onLoad={() => setIframeLoaded(true)}
                />
              </div>
            ) : (
              <iframe
                src={previewUrl}
                title={`Preview — ${fileName}`}
                className="absolute inset-0 w-full h-full border-0 bg-white"
                onLoad={() => setIframeLoaded(true)}
                allow="fullscreen"
              />
            )
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
};

// ─── DocumentCard ─────────────────────────────────────────────────────────────

const DocumentCard: React.FC<DocumentCardProps> = ({ doc, alwaysShowText = false, onReupload }) => {
  const fileExt = doc.originalName?.split(".").pop()?.toLowerCase() || "file";
  const Icon = getFileIcon(fileExt);
  const canPreview = PREVIEWABLE_EXTENSIONS.includes(fileExt);
  const isSuperAdmin = useSelector((state: RootState) => state.auth.user?.role) === "super_admin";
  const canReupload = isSuperAdmin && Boolean(onReupload);

  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [showReupload, setShowReupload] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDownloading) return;

    setIsDownloading(true);
    setProgress(0);

    try {
      const response = await fetch(doc.signedUrl);
      if (!response.ok || !response.body) throw new Error("Download failed");

      const contentLength = Number(response.headers.get("content-length")) || 0;
      const disposition = response.headers.get("content-disposition") || "";
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let receivedLength = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        receivedLength += value.length;
        if (contentLength) setProgress(Math.round((receivedLength / contentLength) * 100));
      }

      const blob = new Blob(chunks as BlobPart[]);
      const url = window.URL.createObjectURL(blob);

      const filenameFromHeader = (() => {
        const match =
          disposition.match(/filename\*=UTF-8''([^;]+)/i) ||
          disposition.match(/filename="?([^"]+)"?/i);
        return match ? decodeURIComponent(match[1]) : "";
      })();

      const a = document.createElement("a");
      a.href = url;
      a.download = filenameFromHeader || doc.originalName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      if (typeof window !== "undefined" && doc.signedUrl) {
        const a = document.createElement("a");
        a.href = doc.signedUrl;
        a.download = doc.originalName;
        a.rel = "noopener noreferrer";
        a.target = "_self";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <div
        className="
          group relative flex items-center gap-4 rounded-xl p-4
          border border-border bg-white dark:bg-neutral-900
          hover:bg-muted/40 dark:hover:bg-neutral-800
          transition-all duration-200 w-full min-w-62.5 sm:min-w-75
          @container
        "
      >
        {/* File Icon */}
        <div className="relative shrink-0 w-20 h-20 p-2 flex items-center justify-center">
          <div
            className="
              relative w-18 h-19 rounded-lg
              border border-border
              bg-gray-600/20 dark:bg-neutral-800
              flex items-center justify-center
              transition-all duration-200 group-hover:scale-[1.03]
              overflow-hidden
            "
          >
            <Icon className="text-neutral-700 dark:text-neutral-300" size={22} />
            <div
              className="
                absolute top-0 right-0 w-0 h-0
                border-l-10 border-l-transparent
                border-t-10 border-t-white/40 dark:border-t-neutral-700/40
              "
            />
            <div
              className="
                absolute -bottom-1.5 left-1/2 -translate-x-1/2
                px-2 pb-px rounded-md
                bg-white dark:bg-neutral-900
                border border-border
              "
            >
              <span className="text-[8px] font-semibold text-neutral-700 dark:text-neutral-300 tracking-wide">
                .{fileExt.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* File Info */}
        <div className="flex flex-col justify-between flex-1 min-w-0">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-200 truncate pr-2" title={doc.originalName}>
              {doc.originalName}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {doc.created_at
                ? `Submitted on ${new Date(doc.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}`
                : "Submitted document"}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            {canPreview && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowPreview(true);
                }}
                className="
                  flex items-center gap-1.5 px-3 py-1.5 rounded-md
                  border border-border
                  bg-muted/30 dark:bg-neutral-800/40
                  text-neutral-700 dark:text-neutral-300 text-xs font-medium
                  hover:bg-muted transition dark:hover:bg-neutral-700
                "
                aria-label="Preview document"
                title="Preview"
              >
                <Eye className="w-4 h-4" />
                {alwaysShowText ? <span>Preview</span> : <span className="hidden @sm:inline">Preview</span>}
              </button>
            )}

            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="
                flex items-center gap-1.5 px-3 py-1.5 rounded-md
                border border-border
                bg-muted/30 dark:bg-neutral-800/40
                text-neutral-700 dark:text-neutral-300 text-xs font-medium
                hover:bg-muted transition dark:hover:bg-neutral-700
                disabled:opacity-60 disabled:cursor-not-allowed
              "
              aria-label="Download document"
              title="Download"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className={alwaysShowText ? "" : "hidden @sm:inline"}>
                    {progress ? `${progress}%` : "Preparing..."}
                  </span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  {alwaysShowText ? <span>Download</span> : <span className="hidden @sm:inline">Download</span>}
                </>
              )}
            </button>

            {canReupload && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowReupload(true);
                }}
                className="
                  flex items-center gap-1.5 px-3 py-1.5 rounded-md
                  border border-border
                  bg-muted/30 dark:bg-neutral-800/40
                  text-neutral-700 dark:text-neutral-300 text-xs font-medium
                  hover:bg-muted transition dark:hover:bg-neutral-700
                "
                aria-label="Re-upload document"
                title="Re Upload"
              >
                <CloudUpload className="w-4 h-4" />
                {alwaysShowText ? <span>Re Upload</span> : <span className="hidden @sm:inline">Re Upload</span>}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <PreviewModal
          url={doc.signedUrl}
          fileName={doc.originalName}
          fileExt={fileExt}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* Re-upload Modal */}
      {showReupload && onReupload && (
        <ReuploadModal
          fileLabel={doc.originalName}
          onClose={() => setShowReupload(false)}
          onUpload={onReupload}
        />
      )}
    </>
  );
};

export default DocumentCard;
