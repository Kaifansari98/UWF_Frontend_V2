"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { GraduationCap, CheckCircle, Upload, X, CircleCheckBig } from "lucide-react";
import Image from "next/image";
import apiClient from "@/utils/apiClient";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

export default function AcknowledgementFormPage() {
  const { formId } = useParams();
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formStatus, setFormStatus] = useState<"pending" | "submitted" | "accepted" | null>(null);

  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get(`/acknowledgement/details/${formId}`);
        setFormData(res.data);
        setFormStatus(res.data?.acknowledgement?.status || null);
      } catch (err) {
        toast.error("Invalid or expired acknowledgement link.");
      } finally {
        setLoading(false);
      }
    };

    if (formId) fetchData();
  }, [formId]);

  const handleUpload = async () => {
    const file = watch("feesStructure")?.[0];
    if (!file) {
      toast.error("Please select a PDF file.");
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append("invoice", file);

    try {
      await apiClient.put(`/acknowledgement/upload/${formId}`, formDataObj, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Invoice submitted successfully!");
      setFormStatus("submitted");
    } catch (error) {
      toast.error("Upload failed. Only valid PDF files are accepted.");
    }
  };

  if (loading) return <p className="p-6 text-lg">Loading form details...</p>;

  if (!formData) return <p className="p-6 text-red-500">Form not found</p>;

  const { generatedForm, formSubmission } = formData;

  const studentName = `${formSubmission?.firstName} ${formSubmission?.fatherName} ${formSubmission?.familyName}`;
  const gender = formSubmission?.gender?.toLowerCase() === "male" ? "son" : "daughter";
  const genderHisHer = gender === "son" ? "his" : "her";
  const acceptedAmount = formSubmission?.acceptedAmount;
  const submittedYear = new Date(formData?.acknowledgement?.submitted_at || new Date()).getFullYear();
  const coordinator = generatedForm?.creator_name;
  const academicYear = formSubmission?.academicYear;

  // ✅ If already submitted or accepted
  if (formStatus === "submitted" || formStatus === "accepted")
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 px-4 sm:px-6">
        <div className="w-full max-w-md border-2 border-green-300 bg-green-50 py-4 sm:py-6 px-4 sm:px-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center gap-2 sm:gap-3">
            <CircleCheckBig className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              Acknowledgement Submitted
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-medium text-[#292929] mt-2 sm:mt-3">
            Your acknowledgement form has been received. Thank you for your submission.
          </p>
          <div className="mt-3 sm:mt-4 h-1 w-12 bg-green-500 rounded-full mx-auto" />
        </div>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4 sm:px-6">
      {/* ✅ Branding Header */}
      <div className="w-full flex flex-col items-center mb-12">
        <div className="relative mb-6">
          <Image src="/UWFLogo.png" width={180} height={180} alt="UWF Logo" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">UWF Student Aid Acknowledgement</h1>
          <div className="flex items-center justify-center gap-2">
            <GraduationCap className="h-5 w-5 text-[#292929]" />
            <p className="text-sm font-medium text-[#292929]">
              Kindly submit the acknowledgement for aid received
            </p>
          </div>
          <div className="mt-8 mb-8 h-[1px] w-full bg-[#29292959] rounded-full mx-auto" />
          <div className="w-full border-2 border-green-300 bg-green-50 py-4 px-6 flex items-center gap-3 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            <p className="text-sm font-medium text-gray-800 text-left">
              Please make sure the uploaded invoice is valid and readable. This helps ensure a{" "}
              <span className="font-semibold text-green-600">smooth processing</span> of your acknowledgement.
            </p>
          </div>
        </div>
      </div>

      {/* ✅ Dynamic Acknowledgement Message */}
      <div className="mb-6 text-sm leading-relaxed text-gray-800">
        Dear Sir/Ma'am,<br /><br />
        This is to acknowledge with thanks receipt of Indian Rs <strong>{acceptedAmount}</strong> Per year <strong>{submittedYear}</strong> as help for my <strong>{gender}</strong> named <strong>{studentName}</strong> towards {genderHisHer} studies through your Coordinator / Member <strong>{coordinator}</strong> for the Academic Year <strong>{academicYear}</strong>.
      </div>

      {/* ✅ Declarations */}
      <div className="space-y-4 mb-6">
        <Label className="flex items-start gap-3 text-sm text-gray-800">
          <Checkbox className="mt-1" /> I assure you that my child will make full use of this aid to
          excel in studies and that the progress report of my child will be sent to you regularly.
        </Label>
        <Label className="flex items-start gap-3 text-sm text-gray-800">
          <Checkbox className="mt-1" /> I agree that United Welfare Foundation reserves the right to
          withdraw its aid if academic progress is not shown regularly.
        </Label>
      </div>

      {/* ✅ File Upload */}
      <div className="border rounded-2xl p-6 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 mb-6">
        <Label htmlFor="feesStructure" className="text-sm font-semibold text-gray-700">
          Invoice (PDF)
        </Label>
        {!watch("feesStructure")?.[0] ? (
          <>
            <input
              id="feesStructure"
              type="file"
              accept="application/pdf"
              {...register("feesStructure")}
              className="hidden"
            />
            <label
              htmlFor="feesStructure"
              className="flex items-center justify-center gap-2 w-full py-2 mt-3 bg-blue-500 text-white rounded-md font-medium text-sm cursor-pointer transition hover:bg-blue-700"
            >
              <Upload className="h-4 w-4" />
              Choose PDF File
            </label>
            <p className="text-xs mt-2 text-[#292929]"> Kindly upload fee receipt + extra invoices (books, uniforms, etc.). (PDF)</p>
          </>
        ) : (
          <div className="mt-3">
            <p className="text-sm text-gray-700 truncate">{watch("feesStructure")?.[0]?.name}</p>
            <div className="flex gap-2 mt-4">
              <label
                htmlFor="feesStructure"
                className="flex items-center gap-2 w-full justify-center py-2 bg-blue-500 text-white rounded-md font-medium text-sm cursor-pointer transition hover:bg-blue-700"
              >
                <Upload className="h-4 w-4" />
                Upload New
              </label>
              <button
                type="button"
                onClick={() => setValue("feesStructure", undefined)}
                className="flex items-center gap-2 w-full justify-center py-2 bg-red-500 text-white rounded-md font-medium text-sm transition hover:bg-red-600"
              >
                <X className="h-4 w-4" />
                Remove
              </button>
            </div>
          </div>
        )}
        {typeof errors.feesStructure?.message === "string" && (
          <p className="text-sm text-red-500 mt-2">{errors.feesStructure.message}</p>
        )}
      </div>

      {/* ✅ Submit Button */}
      <button
        onClick={handleUpload}
        className="w-full bg-green-500 text-white px-4 py-4 rounded-xl hover:bg-green-500 font-semibold text-sm"
      >
        Submit Acknowledgement
      </button>
    </div>
  );
}
