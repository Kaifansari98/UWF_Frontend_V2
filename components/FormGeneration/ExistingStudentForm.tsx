"use client";

import { useEffect, useState } from "react";
import apiClient from "@/utils/apiClient";
import { Input } from "@/components/ui/input";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { getWhatsAppShareURL, getGmailShareURL } from "@/utils/shareUtils";
import { Copy, Mail, MessageCircle, CircleCheckBig } from "lucide-react";

interface ExistingStudentFormProps {
  closeOnSuccess?: boolean;
  onGenerated?: () => void | Promise<void>;
}

export default function ExistingStudentForm({
  closeOnSuccess = false,
  onGenerated,
}: ExistingStudentFormProps) {
  const [students, setStudents] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [generatedLink, setGeneratedLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/submissions/new-students");
      setStudents(res.data.submissions || []);
      setFiltered(res.data.submissions || []);
    } catch (err) {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };  

  const handleSearch = (val: string) => {
    setSearch(val);
    const query = val.toLowerCase();
    const filteredData = students.filter((s) =>
      s.formId.toLowerCase().includes(query) ||
      `${s.firstName} ${s.fatherName} ${s.familyName}`.toLowerCase().includes(query)
    );
    setFiltered(filteredData);
  };

  const doGenerate = async () => {
    if (!selectedStudent) return;
    setShowConfirm(false);
    try {
      setSubmitting(true);
      const res = await apiClient.post("/forms/generate/existing", {
        oldFormId: selectedStudent.formId,
      });
      setGeneratedLink(res.data.form.form_link);
      toast.success("Link generated for existing student");
      if (onGenerated) {
        await onGenerated();
      }
    } catch (err) {
      toast.error("Failed to generate link");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedLink);
    toast.success("Link copied to clipboard");
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div>
        <label className="text-sm font-medium text-foreground">
          Search students by Form ID or Name
        </label>
        <Input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by Form ID or Name"
          className="mt-2"
        />
      </div>
  
      {/* Students List Box */}
      <div className="h-72 w-full overflow-y-auto rounded-xl border bg-background">
  {loading ? (
    <div className="py-6 text-center text-sm text-muted-foreground">
      Loading students...
    </div>
  ) : Array.isArray(filtered) && filtered.length > 0 ? (
    filtered.map((student) => {
      const fullName = `${student.firstName} ${student.fatherName} ${student.familyName}`;
      const initial = student.firstName?.[0]?.toUpperCase() || "?";

      return (
        <div
          key={student.formId}
          className={`flex cursor-pointer items-center justify-between border-b px-4 py-3 transition-colors ${
            selectedStudent?.formId === student.formId
              ? "bg-accent"
              : "bg-background hover:bg-muted/40"
          }`}
          onClick={() => setSelectedStudent(student)}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
              {initial}
            </div>
            <div>
              <div className="font-medium text-foreground">{fullName}</div>
              <div className="text-xs text-muted-foreground">{student.formId}</div>
            </div>
          </div>
          <ChevronRight className="text-muted-foreground" />
        </div>
      );
    })
  ) : (
    <div className="py-4 text-center text-sm text-muted-foreground">
      No matching students found.
    </div>
  )}
</div>

  
      {/* Generate Link Button */}
      {selectedStudent && (
        <Button
          onClick={() => setShowConfirm(true)}
          disabled={submitting}
          className="w-full mt-2 bg-blue-500 text-white py-6 rounded-xl text-base font-semibold"
        >
          {submitting ? "Generating..." : "Generate Link"}
        </Button>
      )}

      {/* Simple confirmation modal */}
      {showConfirm && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-xl">
            <h2 className="text-lg font-bold text-foreground">
              Confirm Link Generation
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              You are about to regenerate a form link for:
            </p>
            <div className="mt-3 rounded-xl border bg-muted/40 px-4 py-3">
              <p className="text-sm font-semibold text-foreground">
                {[
                  selectedStudent.firstName,
                  selectedStudent.fatherName,
                  selectedStudent.familyName,
                ]
                  .filter(Boolean)
                  .join(" ")}
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedStudent.formId}
              </p>
            </div>
            <div className="mt-5 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-blue-500 text-white hover:bg-blue-600"
                onClick={doGenerate}
              >
                Generate
              </Button>
            </div>
          </div>
        </div>
      )}
  
      {/* Generated Link Output */}
      {generatedLink && !closeOnSuccess && (
        <div className="space-y-4">
          <p className="flex flex-row items-center gap-2 text-xs text-muted-foreground">
            <CircleCheckBig size={14} color="green" />
            Link generated for existing student
          </p>
          <Input
            readOnly
            value={generatedLink}
            className="cursor-default bg-muted"
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleCopy} className="bg-black text-white">
              <Copy />
              Copy Link
            </Button>
            <Button
              onClick={() =>
                window.open(getWhatsAppShareURL(generatedLink), "_blank")
              }
            >
              <MessageCircle />
              Share via WhatsApp
            </Button>
            <Button
              onClick={() =>
                window.open(getGmailShareURL(generatedLink), "_blank")
              }
            >
              <Mail />
              Share via Email
            </Button>
          </div>
        </div>
      )}
    </div>
  );  
}
