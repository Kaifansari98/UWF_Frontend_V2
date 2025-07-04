"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { X } from "lucide-react";
import gsap from "gsap";
import toast from "react-hot-toast";
import apiClient from "@/utils/apiClient";

interface EditFormModalProps {
  submission: any;
  onClose: () => void;
  onUpdateSuccess: () => void;
}

const academicYears = [
  "2025-2026",
  "2026-2027",
  "2027-2028",
  "2028-2029",
  "2029-2030",
  "2030-2031",
];

const FILE_BASE_URL = "http://localhost:5000/assets/FormData/";

const studyMediums = ["English", "Urdu", "Marathi", "Hindi", "Arabic"];
const genders = ["male", "female"];

export default function EditFormModal({ submission, onClose, onUpdateSuccess }: EditFormModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<any>({ ...submission });
  const [files, setFiles] = useState<any>({});
  
  useEffect(() => {
    if (modalRef.current) {
      gsap.fromTo(modalRef.current, { scale: 1.2, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4 });
    }
  }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: any) => {
    const { name, files: selectedFiles } = e.target;
    const file = selectedFiles[0];

    if (file && file.size > 2 * 1024 * 1024) {
      toast.error("File size must be under 2MB");
      return;
    }

    if (file && file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }

    setFiles((prev: any) => ({ ...prev, [name]: file }));
  };

  const handleSubmit = async () => {
    const payload = new FormData();
  
    for (const key in formData) {
      if (formData[key] !== undefined && key !== "GeneratedForm") {
        payload.append(key, formData[key]);
      }
    }
  
    Object.keys(files).forEach((key) => {
      if (files[key]) {
        payload.append(key, files[key]);
      }
    });
  
    try {
      const res = await apiClient.put(`/submissions/edit/${formData.formId}`, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      toast.success(res.data.message || "Submission updated successfully");
      onUpdateSuccess();
      onClose();
    } catch (err: any) {
      console.error("Edit failed", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Update failed");
    }
  };
  

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white max-h-[90vh] overflow-y-auto rounded-xl p-6 w-full max-w-4xl shadow-xl"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Submission</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X /></Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>First Name</Label>
            <Input name="firstName" value={formData.firstName || ""} onChange={handleChange} />
          </div>
          <div>
            <Label>Father Name</Label>
            <Input name="fatherName" value={formData.fatherName || ""} onChange={handleChange} />
          </div>
          <div>
            <Label>Family Name</Label>
            <Input name="familyName" value={formData.familyName || ""} onChange={handleChange} />
          </div>
          <div className="w-full">
            <Label>Gender</Label>
            <Select value={formData.gender} onValueChange={(val) => setFormData({ ...formData, gender: val })}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select Gender" /></SelectTrigger>
              <SelectContent>
                {genders.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>School Name</Label>
            <Input name="schoolName" value={formData.schoolName || ""} onChange={handleChange} />
          </div>
          <div className="w-full">
            <Label>Study Medium</Label>
            <Select value={formData.studyMedium} onValueChange={(val) => setFormData({ ...formData, studyMedium: val })}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select Medium" /></SelectTrigger>
              <SelectContent>
                {studyMediums.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Class</Label>
            <Input name="class" value={formData.class || ""} onChange={handleChange} />
          </div>
          <div className="w-ful">
            <Label>Academic Year</Label>
            <Select value={formData.academicYear} onValueChange={(val) => setFormData({ ...formData, academicYear: val })}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select Year" /></SelectTrigger>
              <SelectContent>
                {academicYears.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Parent Name</Label>
            <Input name="parentName" value={formData.parentName || ""} onChange={handleChange} />
          </div>
          <div>
            <Label>Mobile</Label>
            <Input name="mobile" value={formData.mobile || ""} onChange={handleChange} />
          </div>
          <div>
            <Label>Alt Mobile</Label>
            <Input name="alternateMobile" value={formData.alternateMobile || ""} onChange={handleChange} />
          </div>
          <div>
            <Label>Requested Amount</Label>
            <Input name="alternateMobile" value={formData.requested_amount || ""} onChange={handleChange} />
          </div>
          <div>
            <Label>Source of Income</Label>
            <Input name="alternateMobile" value={formData.incomeSource || ""} onChange={handleChange} />
          </div>
          <div className="sm:col-span-2">
            <Label>Address</Label>
            <Textarea name="address" value={formData.address || ""} onChange={handleChange} />
          </div>
          <div className="sm:col-span-2">
            <Label>Reason for Financial Aid</Label>
            <Textarea name="reason" value={formData.reason || ""} onChange={handleChange} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="sm:col-span-2">
            <Label>Bank A/C holder name</Label>
            <Input name="reason" value={formData.bankAccountHolder || ""} onChange={handleChange} />
          </div>
          <div className="sm:col-span-2">
            <Label>Bank A/C number</Label>
            <Input name="reason" value={formData.bankAccountNumber || ""} onChange={handleChange} />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {["feesStructure", "marksheet", "signature", "parentApprovalLetter"].map((field) => (
            <div key={field}>
                <Label>{field}</Label>
                <Input type="file" name={field} accept="application/pdf" onChange={handleFileChange} />
                {submission[field] && (
                <p className="text-sm text-gray-600 mt-1 truncate">
                    Existing:{" "}
                    <a
                    href={`http://localhost:5000/assets/FormData/${submission[field]}`}
                    target="_blank"
                    className="underline text-blue-600"
                    >
                    View PDF
                    </a>
                </p>
                )}
            </div>
            ))}
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Update</Button>
        </div>
      </div>
    </div>
  );
}
