"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import apiClient from "@/utils/apiClient";
import { getWhatsAppShareURL, getGmailShareURL } from "@/utils/shareUtils";
import { CircleCheckBig, Copy, Mail, MessageCircle } from "lucide-react";

const regions = ["Jubail", "Dammam", "Maharashtra"];

export default function FormGenerationPage() {
  const [activeTab, setActiveTab] = useState<"new" | "existing">("new");
  const [studentName, setStudentName] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");

  const handleGenerate = async () => {
    if (!selectedRegion) {
      toast.error("Please select a region");
      return;
    }

    try {
      const res = await apiClient.post("/forms/generate/new", { region: selectedRegion });
      setGeneratedLink(res.data.form.form_link);
      toast.success("Form link generated successfully!");
    } catch (err) {
      toast.error("Failed to generate form");
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedLink);
    toast.success("Link copied to clipboard");
  };

  return (
    <div className="h-screen bg-[#f5f5f5] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl p-8 shadow-md space-y-6 mb-26">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Generate Forms
        </h1>

        {/* Tabs */}
        <div className="flex w-full rounded-xl overflow-hidden border bg-gray-100 text-sm font-medium">
          <button
            onClick={() => setActiveTab("new")}
            className={`w-1/2 py-2 transition ${
              activeTab === "new" ? "bg-white text-black shadow" : "text-gray-500"
            }`}
          >
            New Student
          </button>
          <button
            onClick={() => setActiveTab("existing")}
            className={`w-1/2 py-2 transition ${
              activeTab === "existing" ? "bg-white text-black shadow" : "text-gray-500"
            }`}
          >
            Existing Student
          </button>
        </div>

        {activeTab === "new" ? (
          <>
            <div>
              <label className="text-sm font-medium text-gray-800">
                Enter Student's Name
              </label>
              <p className="text-xs text-gray-500">
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
              <label className="text-sm font-medium text-gray-800">
                Select the student's respective region
              </label>
              <p className="text-xs text-gray-500">
                Select the student region to whom you are generating this form.
              </p>
              <div className="flex gap-1 mt-4">
                {regions.map((region) => (
                  <button
                    key={region}
                    onClick={() => setSelectedRegion(region)}
                    className={`px-5 py-2 rounded-full border text-sm font-medium ${
                      selectedRegion === region
                        ? "bg-black text-white"
                        : "bg-white text-black border-gray-300"
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>

            {generatedLink && (
              <div className="space-y-4">
              <p className="text-xs text-gray-500 flex flex-row gap-2 items-center">
                <CircleCheckBig size={14} color="green"/>
                Congratulations, The Form link has been generated successfully.
              </p>
                <Input
                  readOnly
                  value={generatedLink}
                  className="cursor-default bg-gray-100"
                />
                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleCopy} className="bg-black text-white">
                    <Copy/>
                    Copy Link
                  </Button>
                  <Button
                    onClick={() => {
                      const url = getWhatsAppShareURL(generatedLink); // Replace with actual link
                      window.open(url, "_blank");
                    }}
                  >
                    <MessageCircle />
                    Share via WhatsApp
                  </Button>
                  <Button
                    onClick={() => {
                      const url = getGmailShareURL(generatedLink);
                      window.open(url, "_blank");
                    }}
                  >
                    <Mail/>
                    Share via Gmail
                  </Button>
                </div>
              </div>
            )}

            <Button
              onClick={handleGenerate}
              className="w-full mt-4 bg-black text-white py-6 rounded-xl text-base font-semibold"
            >
              Generate Link
            </Button>
          </>
        ) : (
          <div className="text-sm text-gray-500">Existing student tab selected</div>
        )}
      </div>
    </div>
  );
}
