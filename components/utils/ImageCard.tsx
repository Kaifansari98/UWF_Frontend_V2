"use client";

import { SquareArrowOutUpRight, Download, CloudUpload } from "lucide-react";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import ImageViewerModal from "./ImageViewerModal";
import ReuploadModal from "./ReuploadModal";
import { RootState } from "@/lib/store";

interface ImageCardProps {
  doc: {
    id: number | string;
    originalName: string;
    signedUrl: string;
    created_at?: string;
  };
  onReupload?: (file: File) => Promise<void>;
}

const ImageCard: React.FC<ImageCardProps> = ({ doc, onReupload }) => {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showReupload, setShowReupload] = useState(false);
  const isSuperAdmin = useSelector((state: RootState) => state.auth.user?.role) === "super_admin";
  const canReupload = isSuperAdmin && Boolean(onReupload);

  const handleView = () => setViewerOpen(true);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDownloading) return;

    setIsDownloading(true);
    try {
      const response = await fetch(doc.signedUrl);
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = doc.originalName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      const a = document.createElement("a");
      a.href = doc.signedUrl;
      a.download = doc.originalName;
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      a.remove();
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
          transition-all duration-200 hover:bg-muted/40 dark:hover:bg-neutral-800
          w-full min-w-62.5 sm:min-w-75
        "
      >
        {/* Thumbnail */}
        <div className="shrink-0">
          <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border bg-muted dark:bg-neutral-800">
            <img
              src={doc.signedUrl}
              alt={doc.originalName}
              className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </div>

        {/* Details */}
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
                : "Submitted image"}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleView}
              className="
                flex items-center gap-1.5 px-3 py-1.5 rounded-md
                border border-border bg-muted/30 dark:bg-neutral-800/40
                text-neutral-700 dark:text-neutral-300 text-xs font-medium
                hover:bg-muted transition dark:hover:bg-neutral-700
              "
            >
              <SquareArrowOutUpRight className="w-4 h-4" />
              View
            </button>

            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="
                flex items-center gap-1.5 px-3 py-1.5 rounded-md
                border border-border bg-muted/30 dark:bg-neutral-800/40
                text-neutral-700 dark:text-neutral-300 text-xs font-medium
                hover:bg-muted transition dark:hover:bg-neutral-700
                disabled:opacity-60 disabled:cursor-not-allowed
              "
            >
              <Download className="w-4 h-4" />
              {isDownloading ? "Downloading..." : "Download"}
            </button>

            {canReupload && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReupload(true);
                }}
                className="
                  flex items-center gap-1.5 px-3 py-1.5 rounded-md
                  border border-border bg-muted/30 dark:bg-neutral-800/40
                  text-neutral-700 dark:text-neutral-300 text-xs font-medium
                  hover:bg-muted transition dark:hover:bg-neutral-700
                "
                aria-label="Re-upload image"
                title="Re Upload"
              >
                <CloudUpload className="w-4 h-4" />
                Re Upload
              </button>
            )}
          </div>
        </div>
      </div>

      <ImageViewerModal
        open={viewerOpen}
        imageUrl={doc.signedUrl}
        onClose={() => setViewerOpen(false)}
      />

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

export default ImageCard;
