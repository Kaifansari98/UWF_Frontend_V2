"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { CircleCheckBig, Copy, Mail, MessageCircle } from "lucide-react";
import apiClient from "@/utils/apiClient";
import ExistingStudentForm from "@/components/FormGeneration/ExistingStudentForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getGmailShareURL, getWhatsAppShareURL } from "@/utils/shareUtils";

const regions = ["Jubail", "Dammam", "Maharashtra"];

interface FormGenerationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerated?: () => void | Promise<void>;
  closeOnSuccess?: boolean;
}

export default function FormGenerationModal({
  open,
  onOpenChange,
  onGenerated,
  closeOnSuccess = true,
}: FormGenerationModalProps) {
  const [activeTab, setActiveTab] = useState<"new" | "existing">("new");
  const [studentName, setStudentName] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const resetState = () => {
    setActiveTab("new");
    setStudentName("");
    setSelectedRegion("");
    setGeneratedLink("");
    setSubmitting(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetState();
    }
    onOpenChange(nextOpen);
  };

  const handleGenerate = async () => {
    if (!selectedRegion) {
      toast.error("Please select a region");
      return;
    }

    if (!studentName.trim()) {
      toast.error("Please enter the student's name");
      return;
    }

    try {
      setSubmitting(true);
      const res = await apiClient.post("/forms/generate/new", {
        name: studentName,
        region: selectedRegion,
      });
      const formLink = res.data.form.form_link as string;
      setGeneratedLink(formLink);
      toast.success("Form link generated successfully!");

      if (onGenerated) {
        await onGenerated();
      }

      if (closeOnSuccess) {
        handleOpenChange(false);
      }
    } catch (err) {
      toast.error("Failed to generate form");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedLink);
    toast.success("Link copied to clipboard");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-border bg-card p-0 sm:max-w-2xl">
        <div className="space-y-6 p-6 sm:p-8">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-2xl font-bold">Generate Forms</DialogTitle>
            <DialogDescription>
              Create a fresh form request or regenerate a form for an existing student.
            </DialogDescription>
          </DialogHeader>

          <div className="flex w-full overflow-hidden rounded-xl border bg-muted text-sm font-medium">
            <button
              onClick={() => setActiveTab("new")}
              className={`w-1/2 py-2 transition ${
                activeTab === "new"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              New Student
            </button>
            <button
              onClick={() => setActiveTab("existing")}
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

              {generatedLink && !closeOnSuccess && (
                <div className="space-y-4">
                  <p className="flex flex-row items-center gap-2 text-xs text-muted-foreground">
                    <CircleCheckBig size={14} color="green" />
                    Congratulations, the form link has been generated successfully.
                  </p>
                  <Input readOnly value={generatedLink} className="cursor-default bg-muted" />
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={handleCopy} className="bg-blue-500 text-white hover:bg-blue-600">
                      <Copy />
                      Copy Link
                    </Button>
                    <Button
                      onClick={() => {
                        window.open(getWhatsAppShareURL(generatedLink), "_blank");
                      }}
                      className="bg-green-500 text-white hover:bg-green-600"
                    >
                      <MessageCircle />
                      Share via WhatsApp
                    </Button>
                    <Button
                      onClick={() => {
                        window.open(getGmailShareURL(generatedLink), "_blank");
                      }}
                      className="bg-red-500 text-white hover:bg-red-600"
                    >
                      <Mail />
                      Share via Email
                    </Button>
                  </div>
                </div>
              )}

              <Button
                onClick={handleGenerate}
                disabled={submitting}
                className="mt-4 w-full rounded-xl bg-blue-500 py-6 text-base font-semibold text-white hover:bg-blue-600"
              >
                {submitting ? "Generating..." : "Generate Link"}
              </Button>
            </>
          ) : (
            <ExistingStudentForm
              closeOnSuccess={closeOnSuccess}
              onGenerated={async () => {
                if (onGenerated) {
                  await onGenerated();
                }
                if (closeOnSuccess) {
                  handleOpenChange(false);
                }
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
