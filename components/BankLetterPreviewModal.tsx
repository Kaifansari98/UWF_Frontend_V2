"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BankLetterContent, { type BankLetterData } from "./BankLetterContent";
import { triggerPDFDownload } from "@/utils/pdfUtils";

export default function BankLetterPreviewModal({
  open,
  onOpenChange,
  letter,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  letter: BankLetterData | null;
}) {
  const [downloading, setDownloading] = useState(false);

  if (!letter) return null;

  async function handleDownload() {
    if (!letter || downloading) return;
    setDownloading(true);
    try {
      const [{ pdf }, { BankLetterPDFDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./BankLetterPDF"),
      ]);

      const logoUrl = `${window.location.origin}/UWFLogo.png`;
      const blob = await pdf(
        <BankLetterPDFDocument letter={letter} logoUrl={logoUrl} />
      ).toBlob();

      triggerPDFDownload(
        blob,
        `UWF_Bank_Letter_${letter.student_name.replace(/\s+/g, "_")}.pdf`
      );
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] overflow-y-auto bg-card p-0 sm:max-w-5xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Bank Letter Preview</DialogTitle>
          <DialogDescription>
            Preview of the bank information letter for the selected student.
          </DialogDescription>
        </DialogHeader>

        {/* ── Toolbar ── */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-card px-6 py-3">
          <p className="text-sm font-medium text-muted-foreground">
            Bank Letter Preview
          </p>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 rounded-md bg-[#0d4f9e] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {downloading ? "Generating…" : "Download Letter"}
          </button>
        </div>

        <BankLetterContent letter={letter} />
      </DialogContent>
    </Dialog>
  );
}
