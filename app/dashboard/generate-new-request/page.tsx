"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  CircleCheckBig,
  Copy,
  Mail,
  MessageCircle,
  AlertTriangle,
} from "lucide-react";
import apiClient from "@/utils/apiClient";
import ExistingStudentForm from "@/components/FormGeneration/ExistingStudentForm";
import { getGmailShareURL, getWhatsAppShareURL } from "@/utils/shareUtils";

const regions = ["Jubail", "Dammam", "Maharashtra"];

// ── Duplicate student record shape ──────────────────────────────────────────
type SubmissionRecord = {
  formId: string;
  firstName: string;
  fatherName: string;
  familyName: string;
  schoolName?: string;
  region?: string;
};

// ── Duplicate-detected modal ─────────────────────────────────────────────────
function DuplicateModal({
  duplicates,
  onClearFields,
  onContinue,
}: {
  duplicates: SubmissionRecord[];
  onClearFields: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Duplicate Student Request Detected
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              This student details already exists in the CRM.
            </p>
          </div>
        </div>

        {/* Matching records */}
        <div className="mb-5 space-y-2 rounded-xl border bg-muted/40 p-3">
          {duplicates.map((s) => (
            <div
              key={s.formId}
              className="rounded-lg border bg-card px-4 py-3"
            >
              <p className="text-sm font-semibold text-foreground">
                {[s.firstName, s.fatherName, s.familyName]
                  .filter(Boolean)
                  .join(" ")}
              </p>
              {s.schoolName && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {s.schoolName}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClearFields}
          >
            Clear Fields
          </Button>
          <Button
            className="flex-1 bg-blue-500 text-white hover:bg-blue-600"
            onClick={onContinue}
          >
            Continue Anyway
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Simple confirmation modal ────────────────────────────────────────────────
function ConfirmModal({
  studentName,
  region,
  onCancel,
  onConfirm,
}: {
  studentName: string;
  region: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-xl">
        <h2 className="text-lg font-bold text-foreground">
          Confirm Request Generation
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          You are about to generate a form link for:
        </p>
        <div className="mt-3 rounded-xl border bg-muted/40 px-4 py-3">
          <p className="text-sm font-semibold text-foreground">{studentName}</p>
          <p className="text-xs text-muted-foreground">Region: {region}</p>
        </div>
        <div className="mt-5 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            className="flex-1 bg-blue-500 text-white hover:bg-blue-600"
            onClick={onConfirm}
          >
            Generate
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function GenerateNewRequestPage() {
  const [activeTab, setActiveTab] = useState<"new" | "existing">("new");

  // New-student form state
  const [studentName, setStudentName] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Modal state
  const [duplicates, setDuplicates] = useState<SubmissionRecord[]>([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const resetNewForm = () => {
    setStudentName("");
    setSelectedRegion("");
    setGeneratedLink("");
    setSubmitting(false);
  };

  const handleTabChange = (tab: "new" | "existing") => {
    setActiveTab(tab);
    resetNewForm();
    setShowDuplicateModal(false);
    setShowConfirmModal(false);
  };

  // ── Actual form generation ──────────────────────────────────────────────
  const doGenerate = async () => {
    setShowDuplicateModal(false);
    setShowConfirmModal(false);
    try {
      setSubmitting(true);
      const res = await apiClient.post("/forms/generate/new", {
        name: studentName,
        region: selectedRegion,
      });
      setGeneratedLink(res.data.form.form_link as string);
      toast.success("Form link generated successfully!");
    } catch {
      toast.error("Failed to generate form");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Click handler: validate → check duplicates → show right modal ───────
  const handleGenerateClick = async () => {
    if (!selectedRegion) {
      toast.error("Please select a region");
      return;
    }
    if (!studentName.trim()) {
      toast.error("Please enter the student's name");
      return;
    }

    try {
      const res = await apiClient.post("/forms/check-duplicate", {
        name: studentName.trim(),
        region: selectedRegion,
      });

      const { isDuplicate, matches } = res.data as {
        isDuplicate: boolean;
        matches: SubmissionRecord[];
      };

      if (isDuplicate) {
        setDuplicates(matches);
        setShowDuplicateModal(true);
      } else {
        setShowConfirmModal(true);
      }
    } catch {
      // If the check fails, fall back to simple confirm
      setShowConfirmModal(true);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedLink);
    toast.success("Link copied to clipboard");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* ── Header ── */}
      <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Generate New Request</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex items-center gap-2 pr-4">
          <div className="flex items-center justify-center rounded-sm bg-blue-500 px-2 py-1">
            <AnimatedThemeToggler className="flex h-7 w-7 items-center justify-center text-white [&_svg]:h-4 [&_svg]:w-4" />
          </div>
        </div>
      </header>

      {/* ── Centered form card ── */}
      <div className="flex flex-1 items-center justify-center px-6 py-8">
        <div className="w-full max-w-4xl space-y-6 rounded-xl border bg-card p-8 shadow-sm sm:p-10">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Generate Forms
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a fresh form request or regenerate a form for an existing
              student.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex w-full overflow-hidden rounded-xl border bg-muted text-sm font-medium">
            <button
              onClick={() => handleTabChange("new")}
              className={`w-1/2 py-2 transition ${
                activeTab === "new"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              New Student
            </button>
            <button
              onClick={() => handleTabChange("existing")}
              className={`w-1/2 py-2 transition ${
                activeTab === "existing"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              Existing Student
            </button>
          </div>

          {activeTab === "new" ? (
            <>
              {/* Student name */}
              <div>
                <label className="text-sm font-medium text-foreground">
                  Enter Student&apos;s Name
                </label>
                <p className="text-xs text-muted-foreground">
                  Enter the student name to whom you are generating this form.
                </p>
                <Input
                  placeholder="Enter student name here..."
                  className="mt-3"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                />
              </div>

              {/* Region */}
              <div>
                <label className="text-sm font-medium text-foreground">
                  Select the coordinator region
                </label>
                <p className="text-xs text-muted-foreground">
                  Select the coordinator or member region.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {regions.map((region) => (
                    <button
                      key={region}
                      onClick={() => setSelectedRegion(region)}
                      className={`rounded-full border px-5 py-2 text-sm font-medium transition-colors ${
                        selectedRegion === region
                          ? "border-blue-500 bg-blue-500 text-white"
                          : "border-border bg-background text-foreground hover:border-blue-500/40"
                      }`}
                    >
                      {region}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generated link result */}
              {generatedLink && (
                <div className="space-y-4">
                  <p className="flex flex-row items-center gap-2 text-xs text-muted-foreground">
                    <CircleCheckBig size={14} color="green" />
                    Congratulations, the form link has been generated
                    successfully.
                  </p>
                  <Input
                    readOnly
                    value={generatedLink}
                    className="cursor-default bg-muted"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={handleCopy}
                      className="bg-blue-500 text-white hover:bg-blue-600"
                    >
                      <Copy />
                      Copy Link
                    </Button>
                    <Button
                      onClick={() =>
                        window.open(
                          getWhatsAppShareURL(generatedLink),
                          "_blank",
                        )
                      }
                      className="bg-green-500 text-white hover:bg-green-600"
                    >
                      <MessageCircle />
                      Share via WhatsApp
                    </Button>
                    <Button
                      onClick={() =>
                        window.open(getGmailShareURL(generatedLink), "_blank")
                      }
                      className="bg-red-500 text-white hover:bg-red-600"
                    >
                      <Mail />
                      Share via Email
                    </Button>
                  </div>
                </div>
              )}

              <Button
                onClick={handleGenerateClick}
                disabled={submitting}
                className="mt-4 w-full rounded-xl bg-blue-500 py-6 text-base font-semibold text-white hover:bg-blue-600"
              >
                {submitting ? "Generating..." : "Generate Link"}
              </Button>
            </>
          ) : (
            <ExistingStudentForm closeOnSuccess={false} onGenerated={() => {}} />
          )}
        </div>
      </div>

      {/* ── Duplicate detected modal ── */}
      {showDuplicateModal && (
        <DuplicateModal
          duplicates={duplicates}
          onClearFields={() => {
            setShowDuplicateModal(false);
            resetNewForm();
          }}
          onContinue={doGenerate}
        />
      )}

      {/* ── Simple confirmation modal ── */}
      {showConfirmModal && (
        <ConfirmModal
          studentName={studentName}
          region={selectedRegion}
          onCancel={() => setShowConfirmModal(false)}
          onConfirm={doGenerate}
        />
      )}
    </div>
  );
}
