"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-hot-toast";
import apiClient from "@/utils/apiClient";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheckBig } from "lucide-react";
import Image from "next/image";
import { Upload, X } from 'lucide-react';
import { AlertTriangle } from 'lucide-react';
import { GraduationCap, CheckCircle } from 'lucide-react';

const academicYears = [
  "2025-2026",
  "2026-2027",
  "2027-2028",
  "2028-2029",
  "2029-2030",
  "2030-2031",
];

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  fatherName: z.string().min(1, "Father's name is required"),
  familyName: z.string().min(1, "Family name is required"),
  gender: z.enum(["male", "female"], { required_error: "Gender is required" }),
  schoolName: z.string().min(1, "School name is required"),
  studyMedium: z.string().min(1, "Study medium is required"),
  class: z.string().min(1, "Class is required"),
  academicYear: z.string().min(1, "Academic year is required"),
  parentName: z.string().min(1, "Parent/Guardian name is required"),
  mobile: z.string().min(1, "Mobile number is required"),
  alternateMobile: z.string().min(1, "Alternate mobile number is required"),
  address: z.string().min(1, "Address is required"),
  incomeSource: z.string().min(1, "Income source is required"),
  reason: z.string().min(1, "Reason for aid is required"),
  requested_amount: z.coerce.number().gt(0, "Amount must be greater than 0"),
  bankAccountHolder: z.string().min(1, "Account holder name is required"),
  bankAccountNumber: z.string().min(1, "Bank account number is required"),
  ifscCode: z.string().min(1, "IFSC code is required"),
  bankName: z.string().min(1, "Bank name is required"),
  coordinatorName: z.string().min(1, "Coordinator name is required"),
  coordinatorMobile: z.string().min(1, "Coordinator mobile number is required"),
  feesStructure: z
    .any()
    .refine((fileList) => fileList?.[0], { message: "Fees Structure is required" })
    .refine((fileList) => fileList?.[0]?.type === "application/pdf", {
      message: "Fees Structure must be a PDF",
    })
    .refine((fileList) => fileList?.[0]?.size <= 2 * 1024 * 1024, {
      message: "Fees Structure must be less than 2MB",
    }),
  marksheet: z
    .any()
    .refine((fileList) => fileList?.[0], { message: "Marksheet is required" })
    .refine((fileList) => fileList?.[0]?.type === "application/pdf", {
      message: "Marksheet must be a PDF",
    })
    .refine((fileList) => fileList?.[0]?.size <= 2 * 1024 * 1024, {
      message: "Marksheet must be less than 2MB",
    }),
  signature: z
    .any()
    .refine((fileList) => fileList?.[0], { message: "Signature is required" })
    .refine((fileList) => fileList?.[0]?.type === "application/pdf", {
      message: "Signature must be a PDF",
    })
    .refine((fileList) => fileList?.[0]?.size <= 2 * 1024 * 1024, {
      message: "Signature must be less than 2MB",
    }),
  confirm: z.literal(true, { errorMap: () => ({ message: "You must confirm the details" }) }),
});

export default function StudentFormPage() {
  const { formId } = useParams();
  const [loading, setLoading] = useState(false);
  const [formStatus, setFormStatus] = useState<"loading" | "pending" | "submitted">("loading");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await apiClient.get(`/forms/status/${formId}`);
        setFormStatus(res.data.status === "pending" ? "pending" : "submitted");
      } catch {
        toast.error("Form not found or server error.");
        setFormStatus("submitted");
      }
    };
    fetchStatus();
  }, [formId]);

  const onSubmit = async (data: any) => {
    const files = [data.feesStructure[0], data.marksheet[0], data.signature[0]];
    const tooBig = files.some((f) => f?.size > 2 * 1024 * 1024);
    if (tooBig) return toast.error("PDF files must be under 2MB.");

    const formData = new FormData();
    Object.entries(data).forEach(([key, val]) => {
      if (["feesStructure", "marksheet", "signature"].includes(key)) {
        formData.append(key, (val as FileList)[0]);
      } else if (key !== "confirm") {
        formData.append(key, val as string);
      }
    });

    try {
      setLoading(true);
      await apiClient.post(`/submit/${formId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Form submitted successfully!");
      setFormStatus("submitted");
    } catch {
      toast.error("Submission failed");
    } finally {
      setLoading(false);
    }
  };

  if (formStatus === "loading") return <div className="text-center py-10">Loading...</div>;
  if (formStatus === "submitted")
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 px-4 sm:px-6">
  <div className="w-full max-w-md border-2 border-green-300 bg-green-50 py-4 sm:py-6 px-4 sm:px-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
    <div className="flex items-center gap-2 sm:gap-3">
      <CircleCheckBig className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0" />
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Form Submitted Successfully</h2>
    </div>
    <p className="text-xs sm:text-sm font-medium text-[#292929] mt-2 sm:mt-3">
      Your UWF Student Aid Application has been received. You will receive a confirmation soon.
    </p>
    <div className="mt-3 sm:mt-4 h-1 w-12 bg-green-600 rounded-full mx-auto" />
  </div>
</div>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 w-full">
      <div className="w-full flex flex-col items-center mb-12">
  <div className="relative mb-6">
    <Image
      src="/UWFLogo.png"
      width={180}
      height={180}
      alt="UWF Logo"
    />
  </div>
  <div className="text-center">
    <h1 className="text-3xl font-bold text-gray-800 mb-3">UWF Student Aid Application Form</h1>
    <div className="flex items-center justify-center gap-2">
      <GraduationCap className="h-5 w-5 text-[#292929]" />
      <p className="text-sm font-medium text-[#292929]">Submit the form to apply for financial aid</p>
    </div>
    <div className="mt-8 mb-8 h-[1px] w-full bg-[#29292959] rounded-full mx-auto" />
    <div className="w-full border-2 border-green-300 bg-green-50 py-4 px-6 flex items-center gap-3 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
  <p className="text-sm font-medium text-gray-800 text-left">
    Please ensure all form fields are <span className="font-semibold text-green-600">completed accurately</span> to proceed with your application. Correctly filled fields help ensure a <span className="font-semibold text-green-600">smooth submission process</span>.
  </p>
</div>
  </div>
</div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex flex-col md:flex-row w-full gap-8">
        {/* First Name */}
        <div className="w-full">
          <Label htmlFor="firstName" className="mb-2">First Name</Label>
          <Input id="firstName" type="text" {...register("firstName")} />
          <p className="text-xs text-gray-500 mt-2">Enter student's first name as per adhar card.</p>
          {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
        </div>

        {/* Father's Name */}
        <div className="w-full">
          <Label htmlFor="fatherName" className="mb-2">Father's Name</Label>
          <Input id="fatherName" type="text" {...register("fatherName")} />
          <p className="text-xs text-gray-500 mt-2">Enter father's full name.</p>
          {errors.fatherName && <p className="text-sm text-red-500">{errors.fatherName.message}</p>}
        </div>

        {/* Family Name */}
        <div className="w-full">
          <Label htmlFor="familyName" className="mb-2">Family Name</Label>
          <Input id="familyName" type="text" {...register("familyName")} />
          <p className="text-xs text-gray-500 mt-2">Enter family or surname.</p>
          {errors.familyName && <p className="text-sm text-red-500">{errors.familyName.message}</p>}
        </div>
      </div>

      <div className="flex flex-col md:flex-row w-full gap-8">
        {/* Gender Select */}
        <div className="w-full ">
          <Label htmlFor="gender" className="mb-2 ">Gender</Label>
          <Select onValueChange={(val) => setValue("gender", val as "male" | "female")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">Select student gender.</p>
          {errors.gender && <p className="text-sm text-red-500">{errors.gender.message}</p>}
        </div>

        {/* Academic Year Select */}
        <div className="w-full">
          <Label htmlFor="academicYear" className="mb-2">Academic Year</Label>
          <Select onValueChange={(val) => setValue("academicYear", val)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent >
              {academicYears.map((year) => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">Choose academic session.</p>
          {errors.academicYear && <p className="text-sm text-red-500">{errors.academicYear.message}</p>}
        </div>

      </div>

      <div className="flex flex-col md:flex-row w-full gap-8">
        {/* School Name */}
        <div className="w-full ">
          <Label htmlFor="schoolName" className="mb-2">School Name & Address</Label>
          <Input id="schoolName" type="text" {...register("schoolName")} />
          <p className="text-xs text-gray-500 mt-2">Enter school currently attended.</p>
          {errors.schoolName && <p className="text-sm text-red-500">{errors.schoolName.message}</p>}
        </div>

        {/* Study Medium */}
        <div className="w-full ">
          <Label htmlFor="studyMedium" className="mb-2">Study Medium</Label>
          <Input id="studyMedium" type="text" {...register("studyMedium")} />
          <p className="text-xs text-gray-500 mt-2">e.g., English, Hindi, etc.</p>
          {errors.studyMedium && <p className="text-sm text-red-500">{errors.studyMedium.message}</p>}
        </div>
      </div>

        {/* Class */}
        <div>
          <Label htmlFor="class" className="mb-2">Class</Label>
          <Input id="class" type="text" {...register("class")} />
          <p className="text-xs text-gray-500 mt-2">Enter the class/grade.</p>
          {errors.class && <p className="text-sm text-red-500">{errors.class.message}</p>}
        </div>

        <div className="mt-8 mb-8 h-[1px] w-full bg-[#29292959] rounded-full mx-auto" />

        {/* Parent/Guardian Name */}
        <div>
          <Label htmlFor="parentName" className="mb-2">Parent/Guardian Name *Please provide your Parent / Guardian Information as per Adhaar Card*</Label>
          <Input id="parentName" type="text" {...register("parentName")} />
          <p className="text-xs text-gray-500 mt-2">Full name of guardian.</p>
          {errors.parentName && <p className="text-sm text-red-500">{errors.parentName.message}</p>}
        </div>

        <div className="flex flex-col md:flex-row w-full gap-8">
        {/* Mobile */}
        <div className="w-full ">
          <Label htmlFor="mobile" className="mb-2">Mobile</Label>
          <Input id="mobile" type="text" {...register("mobile")} />
          <p className="text-xs text-gray-500 mt-2">Primary contact number.</p>
          {errors.mobile && <p className="text-sm text-red-500">{errors.mobile.message}</p>}
        </div>

        {/* Alternate Mobile */}
        <div className="w-full ">
          <Label htmlFor="alternateMobile" className="mb-2">Alternate Mobile</Label>
          <Input id="alternateMobile" type="text" {...register("alternateMobile")} />
          <p className="text-xs text-gray-500 mt-2">Secondary contact number.</p>
          {errors.alternateMobile && <p className="text-sm text-red-500">{errors.alternateMobile.message}</p>}
        </div>
        </div>

        {/* Address */}
        <div>
          <Label htmlFor="address" className="mb-2">Enter your current complete residence address</Label>
          <Textarea id="address" {...register("address")} rows={3} />
          <p className="text-xs text-gray-500 mt-2">Full residential address.</p>
          {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
        </div>

        <div className="flex flex-col md:flex-row w-full gap-8">
        {/* Income Source */}
        <div className="w-full">
          <Label htmlFor="incomeSource" className="mb-2">Income Source</Label>
          <Input id="incomeSource" type="text" {...register("incomeSource")} />
          <p className="text-xs text-gray-500 mt-2">How does the family earn?</p>
          {errors.incomeSource && <p className="text-sm text-red-500">{errors.incomeSource.message}</p>}
        </div>

        {/* Requested Amount */}
        <div className="w-full">
          <Label htmlFor="requested_amount" className="mb-2">Requested Amount</Label>
          <Input id="requested_amount" type="number" {...register("requested_amount")} />
          <p className="text-xs text-gray-500 mt-2">Amount you are requesting.</p>
          {errors.requested_amount && <p className="text-sm text-red-500">{errors.requested_amount.message}</p>}
        </div>
        </div>

        {/* Reason for Aid */}
        <div>
          <Label htmlFor="reason" className="mb-2">Reason for Aid</Label>
          <Textarea id="reason" {...register("reason")} rows={3}/>
          <p className="text-xs text-gray-500 mt-2">Brief reason for financial aid.</p>
          {errors.reason && <p className="text-sm text-red-500">{errors.reason.message}</p>}
        </div>

        <div className="mt-8 mb-8 h-[1px] w-full bg-[#29292959] rounded-full mx-auto" />

        <div className="flex flex-col md:flex-row w-full gap-8">
        {/* Bank Account Holder */}
        <div className="w-full">
          <Label htmlFor="bankAccountHolder" className="mb-2">Bank A/C Holder</Label>
          <Input id="bankAccountHolder" type="text" {...register("bankAccountHolder")} />
          <p className="text-xs text-gray-500 mt-2">Name on the bank account.</p>
          {errors.bankAccountHolder && <p className="text-sm text-red-500">{errors.bankAccountHolder.message}</p>}
        </div>

        {/* Bank Account Number */}
        <div className="w-full">
          <Label htmlFor="bankAccountNumber" className="mb-2">Bank A/C Number</Label>
          <Input id="bankAccountNumber" type="text" {...register("bankAccountNumber")} />
          <p className="text-xs text-gray-500 mt-2">Valid bank account number.</p>
          {errors.bankAccountNumber && <p className="text-sm text-red-500">{errors.bankAccountNumber.message}</p>}
        </div>
        </div>

        <div className="flex flex-col md:flex-row w-full gap-8">
        {/* IFSC Code */}
        <div className="w-full">
          <Label htmlFor="ifscCode" className="mb-2">IFSC Code</Label>
          <Input id="ifscCode" type="text" {...register("ifscCode")} />
          <p className="text-xs text-gray-500 mt-2">Bank IFSC code.</p>
          {errors.ifscCode && <p className="text-sm text-red-500">{errors.ifscCode.message}</p>}
        </div>

        {/* Bank Name */}
        <div className="w-full">
          <Label htmlFor="bankName" className="mb-2">Bank Name</Label>
          <Input id="bankName" type="text" {...register("bankName")} />
          <p className="text-xs text-gray-500 mt-2">Name of the bank.</p>
          {errors.bankName && <p className="text-sm text-red-500">{errors.bankName.message}</p>}
        </div>
        </div>


        <div className="flex flex-col md:flex-row w-full gap-8">
        {/* Coordinator Name */}
        <div className="w-full">
          <Label htmlFor="coordinatorName" className="mb-2">Coordinator Name</Label>
          <Input id="coordinatorName" type="text" {...register("coordinatorName")} />
          <p className="text-xs text-gray-500 mt-2">Name of local coordinator.</p>
          {errors.coordinatorName && <p className="text-sm text-red-500">{errors.coordinatorName.message}</p>}
        </div>

        {/* Coordinator Mobile */}
        <div className="w-full">
          <Label htmlFor="coordinatorMobile" className="mb-2">Coordinator Mobile</Label>
          <Input id="coordinatorMobile" type="text" {...register("coordinatorMobile")} />
          <p className="text-xs text-gray-500 mt-2">Coordinator's contact.</p>
          {errors.coordinatorMobile && <p className="text-sm text-red-500">{errors.coordinatorMobile.message}</p>}
        </div>
        </div>

<div className="mt-8 mb-8 h-[1px] w-full bg-[#29292959] rounded-full mx-auto" />

        <div className="w-full border-2 border-amber-300 bg-amber-50 py-4 px-6 flex items-center gap-3 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
  <p className="text-sm font-medium text-gray-800">
    Please ensure to provide <span className="font-semibold text-red-500">properly scanned documents</span> in a clear, readable format. Failure to do so may result in <span className="font-semibold text-red-500">delays or rejection</span> of the request.
  </p>
</div>


 {/* File Uploads */}
<div className="grid sm:grid-cols-3 gap-6">
  {/* Fees Structure */}
  <div className="border rounded-2xl p-6 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
    <Label htmlFor="feesStructure" className="text-sm font-semibold text-gray-700">
      Fees Structure (PDF)
    </Label>
    {!watch("feesStructure")?.[0] ? (
      <>
        <div className="relative mt-3">
          <Input
            id="feesStructure"
            type="file"
            accept="application/pdf"
            {...register("feesStructure")}
            className="file:bg-[#292929] file:text-white file:px-4 file:py-2 file:rounded-md file:cursor-pointer file:border-none file:font-medium file:transition-colors file:flex file:items-center file:gap-2"
          />
          <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white pointer-events-none" />
        </div>
        <p className="text-xs mt-2" style={{ color: '#292929' }}>
          Upload fees structure (max 2MB)
        </p>
      </>
    ) : (
      <div className="mt-3">
        <p className="text-sm text-gray-700 truncate">{watch("feesStructure")?.[0]?.name}</p>
        <div className="flex gap-2 mt-4">
          <label
            htmlFor="feesStructure"
            className="flex items-center gap-2 w-full justify-center py-2 bg-[#292929] text-white rounded-md font-medium text-sm cursor-pointer transition-colors"
          >
            <Upload className="h-4 w-4" />
            Upload New
          </label>
          <button
            type="button"
            onClick={() => setValue("feesStructure", undefined)}
            className="flex items-center gap-2 w-full justify-center py-2 bg-red-500 text-white rounded-md font-medium text-sm transition-colors"
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

  {/* Recent Marksheet */}
  <div className="border rounded-2xl p-6 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
    <Label htmlFor="marksheet" className="text-sm font-semibold text-gray-700">
      Recent Marksheet (PDF)
    </Label>
    {!watch("marksheet")?.[0] ? (
      <>
        <div className="relative mt-3">
          <Input
            id="marksheet"
            type="file"
            accept="application/pdf"
            {...register("marksheet")}
            className="file:bg-[#292929] file:text-white file:px-4 file:py-2 file:rounded-md file:cursor-pointer file:border-none file:font-medium file:transition-colors file:flex file:items-center file:gap-2"
          />
          <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white pointer-events-none" />
        </div>
        <p className="text-xs mt-2" style={{ color: '#292929' }}>
          Upload recent marksheet (max 2MB)
        </p>
      </>
    ) : (
      <div className="mt-3">
        <p className="text-sm text-gray-700 truncate">{watch("marksheet")?.[0]?.name}</p>
        <div className="flex gap-2 mt-4">
          <label
            htmlFor="marksheet"
            className="flex items-center gap-2 w-full justify-center py-2 bg-[#292929] text-white rounded-md font-medium text-sm cursor-pointer transition-colors"
          >
            <Upload className="h-4 w-4" />
            Upload New
          </label>
          <button
            type="button"
            onClick={() => setValue("marksheet", undefined)}
            className="flex items-center gap-2 w-full justify-center py-2 bg-red-500 text-white rounded-md font-medium text-sm transition-colors"
          >
            <X className="h-4 w-4" />
            Remove
          </button>
        </div>
      </div>
    )}
    {typeof errors.marksheet?.message === "string" && (
      <p className="text-sm text-red-500 mt-2">{errors.marksheet.message}</p>
    )}
  </div>

  {/* Parent/Guardian Signature */}
  <div className="border rounded-2xl p-6 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
    <Label htmlFor="signature" className="text-sm font-semibold text-gray-700">
      Parent/Guardian Signature (PDF)
    </Label>
    {!watch("signature")?.[0] ? (
      <>
        <div className="relative mt-3">
          <Input
            id="signature"
            type="file"
            accept="application/pdf"
            {...register("signature")}
            className="file:bg-[#292929] file:text-white file:px-4 file:py-2 file:rounded-md file:cursor-pointer file:border-none file:font-medium file:transition-colors file:flex file:items-center file:gap-2"
          />
          <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white pointer-events-none" />
        </div>
        <p className="text-xs mt-2" style={{ color: '#292929' }}>
          Upload signature (max 2MB)
        </p>
      </>
    ) : (
      <div className="mt-3">
        <p className="text-sm text-gray-700 truncate">{watch("signature")?.[0]?.name}</p>
        <div className="flex gap-2 mt-4">
          <label
            htmlFor="signature"
            className="flex items-center gap-2 w-full justify-center py-2 bg-[#292929] text-white rounded-md font-medium text-sm cursor-pointer transition-colors"
          >
            <Upload className="h-4 w-4" />
            Upload New
          </label>
          <button
            type="button"
            onClick={() => setValue("signature", undefined)}
            className="flex items-center gap-2 w-full justify-center py-2 bg-red-500 text-white rounded-md font-medium text-sm transition-colors"
          >
            <X className="h-4 w-4" />
            Remove
          </button>
        </div>
      </div>
    )}
    {typeof errors.signature?.message === "string" && (
      <p className="text-sm text-red-500 mt-2">{errors.signature.message}</p>
    )}
  </div>
</div>

        {/* Confirm Checkbox */}
        <div className="flex items-start gap-2 py-4">
          <input
            type="checkbox"
            id="confirm"
            {...register("confirm")}
            className="mt-1"
          />
          <label htmlFor="confirm" className="text-sm text-gray-700">
            I confirm all the above information provided is true and correct to the best of my knowledge.
          </label>
        </div>
        {errors.confirm && <p className="text-sm text-red-500">{errors.confirm.message}</p>}

        <Button type="submit" disabled={loading} className="w-full bg-black text-white py-6 rounded-lg text-base">
          {loading ? "Submitting..." : "Submit Form"}
        </Button>
      </form>
    </div>
  );
}