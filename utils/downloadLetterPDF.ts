import { createElement } from "react";
import { triggerPDFDownload } from "./pdfUtils";
import type { BankLetterData } from "@/components/BankLetterContent";

/**
 * Generates a PDF using @react-pdf/renderer (no html2canvas, no DOM cloning,
 * no document.write) and triggers a browser download.
 */
export async function downloadLetterPDF(letter: BankLetterData): Promise<void> {
  // Dynamic import keeps react-pdf out of the initial bundle
  const [{ pdf }, { BankLetterPDFDocument }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("@/components/BankLetterPDF"),
  ]);

  const logoUrl = `${window.location.origin}/UWFLogo.png`;

  // createElement avoids JSX-transform dependency in a utility file
  const element = createElement(BankLetterPDFDocument, { letter, logoUrl });
  const blob = await pdf(element).toBlob();

  triggerPDFDownload(
    blob,
    `UWF_Bank_Letter_${letter.student_name.replace(/\s+/g, "_")}.pdf`
  );
}
