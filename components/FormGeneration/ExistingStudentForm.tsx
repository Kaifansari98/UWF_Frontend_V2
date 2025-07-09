"use client";

import { useEffect, useState } from "react";
import apiClient from "@/utils/apiClient";
import { Input } from "@/components/ui/input";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { getWhatsAppShareURL, getGmailShareURL } from "@/utils/shareUtils";
import { Copy, Mail, MessageCircle, CircleCheckBig } from "lucide-react";

export default function ExistingStudentForm() {
  const [students, setStudents] = useState<any[]>([]);  
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [generatedLink, setGeneratedLink] = useState("");
  const [loading, setLoading] = useState(true);

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

  const handleGenerate = async () => {
    if (!selectedStudent) return;

    try {
      const res = await apiClient.post("/forms/generate/existing", {
        oldFormId: selectedStudent.formId,
      });
      setGeneratedLink(res.data.form.form_link);
      toast.success("Link generated for existing student");
    } catch (err) {
      toast.error("Failed to generate link");
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
        <label className="text-sm font-medium text-gray-800">
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
      <div className="border rounded-xl overflow-y-auto h-72 w-full">
  {loading ? (
    <div className="text-center text-sm text-gray-500 py-6">
      Loading students...
    </div>
  ) : Array.isArray(filtered) && filtered.length > 0 ? (
    filtered.map((student) => {
      const fullName = `${student.firstName} ${student.fatherName} ${student.familyName}`;
      const initial = student.firstName?.[0]?.toUpperCase() || "?";

      return (
        <div
          key={student.formId}
          className={`flex items-center justify-between border-b px-4 py-3 cursor-pointer ${
            selectedStudent?.formId === student.formId
              ? "bg-gray-100"
              : "bg-white"
          }`}
          onClick={() => setSelectedStudent(student)}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
              {initial}
            </div>
            <div>
              <div className="font-medium text-gray-800">{fullName}</div>
              <div className="text-xs text-gray-500">{student.formId}</div>
            </div>
          </div>
          <ChevronRight className="text-gray-400" />
        </div>
      );
    })
  ) : (
    <div className="text-sm text-center text-gray-500 py-4">
      No matching students found.
    </div>
  )}
</div>

  
      {/* Generate Link Button */}
      {selectedStudent && (
        <Button
          onClick={handleGenerate}
          className="w-full mt-2 bg-blue-500 text-white py-6 rounded-xl text-base font-semibold"
        >
          Generate Link
        </Button>
      )}
  
      {/* Generated Link Output */}
      {generatedLink && (
        <div className="space-y-4">
          <p className="text-xs text-gray-500 flex flex-row gap-2 items-center">
            <CircleCheckBig size={14} color="green" />
            Link generated for existing student
          </p>
          <Input
            readOnly
            value={generatedLink}
            className="cursor-default bg-gray-100"
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
              Share via Gmail
            </Button>
          </div>
        </div>
      )}
    </div>
  );  
}
