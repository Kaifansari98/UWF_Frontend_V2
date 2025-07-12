"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "react-hot-toast";
import apiClient from "@/utils/apiClient";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheckBig } from "lucide-react";
import Image from "next/image";
import { Upload, X } from 'lucide-react';
import { AlertTriangle } from 'lucide-react';
import { GraduationCap, CheckCircle } from 'lucide-react';
import UwfTermsAndConditions from "@/components/UwfTermsAndConditions";

export default function StudentFormPage() {
  const { formId } = useParams();
  const [loading, setLoading] = useState(false);
  const [formStatus, setFormStatus] = useState<"loading" | "pending" | "submitted">("loading");
  const [isNewStudent, setIsNewStudent] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const academicYears = [
    "2025-2026",
    "2026-2027",
    "2027-2028",
    "2028-2029",
    "2029-2030",
    "2030-2031",
  ];
  
  const baseSchema = {
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
    confirm: z.literal(true, { errorMap: () => ({ message: "You must confirm the details" }) })
  };
  
  const formSchema = useMemo(() => {
    console.log("Recomputing schema: isNewStudent =", isNewStudent);
    return z.object({
      ...baseSchema,
      parentApprovalLetter: isNewStudent
        ? z
            .any()
            .refine((fileList) => fileList?.[0], { message: "Parent Request Letter is required for new students" })
            .refine((fileList) => fileList?.[0]?.type === "application/pdf", {
              message: "Parent Request Letter must be a PDF",
            })
            .refine((fileList) => fileList?.[0]?.size <= 2 * 1024 * 1024, {
              message: "Parent Request Letter must be less than 2MB",
            })
        : z.any().optional(),
    });
  }, [isNewStudent]);  

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
  
        // Ensure it's explicitly true or false
        if (typeof res.data.isNewStudent === "boolean") {
          setIsNewStudent(res.data.isNewStudent);
        } else {
          console.warn("isNewStudent not returned properly");
          setIsNewStudent(false); // fallback if undefined or incorrect
        }
      } catch (err) {
        toast.error("Form not found or server error.");
        setFormStatus("submitted");
      }
    };
    fetchStatus();
  }, [formId]);

  if (formStatus === "loading" || isNewStudent === undefined)
    return <div className="text-center py-10">Loading...</div>;
  
  console.log("isNewStudent value on render:", isNewStudent); // ✅ Add this anywhere inside the component (not inside useEffect)

  const onSubmit = async (data: any) => {
    const files = [data.feesStructure[0], data.marksheet[0], data.signature[0]];
    const tooBig = files.some((f) => f?.size > 2 * 1024 * 1024);
    if (tooBig) return toast.error("PDF files must be under 2MB.");

    const formData = new FormData();
    Object.entries(data).forEach(([key, val]) => {
      if (["feesStructure", "marksheet", "signature", "parentApprovalLetter"].includes(key)) {
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

    if (!showForm) {
      return <UwfTermsAndConditions onAccept={() => setShowForm(true)} />;
    }

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
      {/* === Student Information Card === */}
<div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-6 sm:p-8 mb-10">
  {/* Header */}
  <div className="mb-6">
    <h2 className="text-xl font-bold text-gray-800 mb-1">Student Information</h2>
    <p className="text-sm text-gray-600">
      Please provide students details as per Aadhar Card.
    </p>
    <div className="mt-4 h-[1px] bg-gray-200 w-full" />
  </div>

  {/* Form Fields */}
  <div className="flex flex-col md:flex-row w-full gap-8">
    {/* First Name */}
    <div className="w-full">
      <Label htmlFor="firstName" className="mb-2">First Name</Label>
      <Input id="firstName" type="text" {...register("firstName")} />
      <p className="text-xs text-gray-500 mt-2">Enter student's first name as per Adhaar card.</p>
      {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
    </div>

    {/* Father's Name */}
    <div className="w-full">
      <Label htmlFor="fatherName" className="mb-2">Father's Name</Label>
      <Input id="fatherName" type="text" {...register("fatherName")} />
      <p className="text-xs text-gray-500 mt-2">Enter father's name as per Adhaar card.</p>
      {errors.fatherName && <p className="text-sm text-red-500">{errors.fatherName.message}</p>}
    </div>

    {/* Family Name */}
    <div className="w-full">
      <Label htmlFor="familyName" className="mb-2">Family Name</Label>
      <Input id="familyName" type="text" {...register("familyName")} />
      <p className="text-xs text-gray-500 mt-2">Enter family or surname as per Adhaar card.</p>
      {errors.familyName && <p className="text-sm text-red-500">{errors.familyName.message}</p>}
    </div>
  </div>

  <div className="flex flex-col md:flex-row w-full gap-8 mt-6">
    {/* Gender */}
    <div className="w-full">
      <Label htmlFor="gender" className="mb-2">Gender</Label>
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

    {/* Academic Year */}
    <div className="w-full">
      <Label htmlFor="academicYear" className="mb-2">Academic Year</Label>
      <Select onValueChange={(val) => setValue("academicYear", val)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Year" />
        </SelectTrigger>
        <SelectContent>
          {academicYears.map((year) => (
            <SelectItem key={year} value={year}>{year}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-gray-500 mt-1">Choose academic session.</p>
      {errors.academicYear && <p className="text-sm text-red-500">{errors.academicYear.message}</p>}
    </div>
  </div>

  <div className="flex flex-col md:flex-row w-full gap-8 mt-6">
    {/* School Name */}
    <div className="w-full">
      <Label htmlFor="schoolName" className="mb-2">School Name & Address</Label>
      <Input id="schoolName" type="text" {...register("schoolName")} />
      <p className="text-xs text-gray-500 mt-2">Enter school currently attending.</p>
      {errors.schoolName && <p className="text-sm text-red-500">{errors.schoolName.message}</p>}
    </div>

    {/* Study Medium */}
    <div className="w-full">
      <Label htmlFor="studyMedium" className="mb-2">Study Medium</Label>
      <Select onValueChange={(val) => setValue("studyMedium", val)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Medium" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="English">English</SelectItem>
          <SelectItem value="Urdu">Urdu</SelectItem>
          <SelectItem value="Marathi">Marathi</SelectItem>
          <SelectItem value="Hindi">Hindi</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-gray-500 mt-2">Select medium of instruction.</p>
      {errors.studyMedium && <p className="text-sm text-red-500">{errors.studyMedium.message}</p>}
    </div>
  </div>

  <div className="mt-6">
    {/* Class */}
    <Label htmlFor="class" className="mb-2">Class / Grade / Standard</Label>
    <Input id="class" type="text" {...register("class")} />
    <p className="text-xs text-gray-500 mt-2">Enter the class or grade the student is in.</p>
    {errors.class && <p className="text-sm text-red-500">{errors.class.message}</p>}
  </div>
</div>

 
        {/* === Parent/Guardian Information Card === */}
<div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-6 sm:p-8 mb-10">
  {/* Header */}
  <div className="mb-6">
    <h2 className="text-xl font-bold text-gray-800 mb-1">Parent / Guardian Information</h2>
    <p className="text-sm text-gray-600">
      Please provide valid details of the parent or guardian as per Aadhar Card.
    </p>
    <div className="mt-4 h-[1px] bg-gray-200 w-full" />
  </div>

  {/* Caution Note */}
  {/* <div className="w-full border-2 border-amber-300 bg-amber-50 py-4 px-6 flex items-center gap-3 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 mb-6">
    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
    <p className="text-sm font-medium text-gray-800">
    Please provide valid details of the parent or guardian as per Aadhar Card.
    </p>
  </div> */}

  {/* Parent Name */}
  <div className="mb-6">
    <Label htmlFor="parentName" className="mb-2 font-medium text-gray-700">
      Parent/Guardian Name 
    </Label>
    <Input id="parentName" type="text" {...register("parentName")} />
    <p className="text-xs text-gray-500 mt-2">Full name of Parent / Guardian.</p>
    {errors.parentName && <p className="text-sm text-red-500">{errors.parentName.message}</p>}
  </div>

  {/* Mobile & Alternate Mobile */}
  <div className="flex flex-col md:flex-row w-full gap-8 mb-6">
    <div className="w-full">
      <Label htmlFor="mobile" className="mb-2">Mobile Number (WhatsApp Number)</Label>
      <Input id="mobile" type="text" {...register("mobile")} />
      <p className="text-xs text-gray-500 mt-2">
        Please enter 10 digit mobile number
      </p>
      {errors.mobile && <p className="text-sm text-red-500">{errors.mobile.message}</p>}
    </div>

    <div className="w-full">
      <Label htmlFor="alternateMobile" className="mb-2">Alternate Mobile Number</Label>
      <Input id="alternateMobile" type="text" {...register("alternateMobile")} />
      <p className="text-xs text-gray-500 mt-2">
        Please enter 10 digit mobile number
      </p>
      {errors.alternateMobile && <p className="text-sm text-red-500">{errors.alternateMobile.message}</p>}
    </div>
  </div>

  {/* Address */}
  <div className="mb-6">
    <Label htmlFor="address" className="mb-2">Current Residence Address</Label>
    <Textarea id="address" {...register("address")} rows={3} />
    <p className="text-xs text-gray-500 mt-2">Full residential address.</p>
    {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
  </div>

  {/* Income Source & Requested Amount */}
  <div className="flex flex-col md:flex-row w-full gap-8 mb-6">
    <div className="w-full">
      <Label htmlFor="incomeSource" className="mb-2">Source of Income</Label>
      <Input id="incomeSource" type="text" {...register("incomeSource")} />
      <p className="text-xs text-gray-500 mt-2">How does the family earn?</p>
      {errors.incomeSource && <p className="text-sm text-red-500">{errors.incomeSource.message}</p>}
    </div>

    <div className="w-full">
      <Label htmlFor="requested_amount" className="mb-2">Requested Amount as per School/College (INR)</Label>
      <Input id="requested_amount" type="number" {...register("requested_amount")} />
      <p className="text-xs text-gray-500 mt-2">Amount you are requesting.</p>
      {errors.requested_amount && <p className="text-sm text-red-500">{errors.requested_amount.message}</p>}
    </div>
  </div>

  {/* Reason for Aid */}
  <div>
    <Label htmlFor="reason" className="mb-2">Reason for requesting financial aid</Label>
    <Textarea id="reason" {...register("reason")} rows={3} />
    <p className="text-xs text-gray-500 mt-2">Brief reason for financial aid.</p>
    {errors.reason && <p className="text-sm text-red-500">{errors.reason.message}</p>}
  </div>
</div>

{/* === Bank Information Card === */}
<div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-6 sm:p-8 mb-10">
  {/* Header */}
  <div className="mb-6">
    <h2 className="text-xl font-bold text-gray-800 mb-1">School Bank Account Information</h2>
    <p className="text-sm text-gray-600">
      Please provide correct and verifiable banking details for follow-up and disbursement.
    </p>
    <div className="mt-4 h-[1px] bg-gray-200 w-full" />
  </div>

  {/* A/C Holder & Number */}
  <div className="flex flex-col md:flex-row w-full gap-8 mb-6">
    <div className="w-full">
      <Label htmlFor="bankAccountHolder" className="mb-2">Bank A/C Holder Name</Label>
      <Input id="bankAccountHolder" type="text" {...register("bankAccountHolder")} />
      <p className="text-xs text-gray-500 mt-2">Name as mentioned in bank records.</p>
      {errors.bankAccountHolder && <p className="text-sm text-red-500">{errors.bankAccountHolder.message}</p>}
    </div>

    <div className="w-full">
      <Label htmlFor="bankAccountNumber" className="mb-2">Bank A/C Number</Label>
      <Input id="bankAccountNumber" type="text" {...register("bankAccountNumber")} />
      <p className="text-xs text-gray-500 mt-2">Please provide valid <strong>School Bank Account Number.</strong></p>
      {errors.bankAccountNumber && <p className="text-sm text-red-500">{errors.bankAccountNumber.message}</p>}
    </div>
  </div>

  {/* IFSC & Bank Name */}
  <div className="flex flex-col md:flex-row w-full gap-8 mb-6">
    <div className="w-full">
      <Label htmlFor="ifscCode" className="mb-2">IFSC Code</Label>
      <Input id="ifscCode" type="text" {...register("ifscCode")} />
      <p className="text-xs text-gray-500 mt-2">E.g., SBIN0001234</p>
      {errors.ifscCode && <p className="text-sm text-red-500">{errors.ifscCode.message}</p>}
    </div>

    <div className="w-full">
      <Label htmlFor="bankName" className="mb-2">Bank Name and Branch</Label>
      <Input id="bankName" type="text" {...register("bankName")} />
      <p className="text-xs text-gray-500 mt-2">Please provide Bank Name and Branch.</p>
      {errors.bankName && <p className="text-sm text-red-500">{errors.bankName.message}</p>}
    </div>
  </div>

</div>
<div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-6 sm:p-8 mb-10">
  {/* Header */}
  <div className="mb-6">
    <h2 className="text-xl font-bold text-gray-800 mb-1">UWF Member / Coordinator Information</h2>
    <p className="text-sm text-gray-600">
      Please provide correct and verifiable UWF Member / Coordinator name and contact information for follow-up and disbursement.
    </p>
    <div className="mt-4 h-[1px] bg-gray-200 w-full" />
  </div>

  {/* Coordinator Name & Contact */}
  <div className="flex flex-col md:flex-row w-full gap-8">
    <div className="w-full">
      <Label htmlFor="coordinatorName" className="mb-2">UWF Member / Coordinator Name</Label>
      <Input id="coordinatorName" type="text" {...register("coordinatorName")} />
      <p className="text-xs text-gray-500 mt-2">Coordinator who referred/verified your case.</p>
      {errors.coordinatorName && <p className="text-sm text-red-500">{errors.coordinatorName.message}</p>}
    </div>

    <div className="w-full">
      <Label htmlFor="coordinatorMobile" className="mb-2">UWF Member / Coordinator Mobile Number</Label>
      <Input id="coordinatorMobile" type="text" {...register("coordinatorMobile")} />
      <p className="text-xs text-gray-500 mt-2">Please insert mobile number with international dialing code</p>
      {errors.coordinatorMobile && <p className="text-sm text-red-500">{errors.coordinatorMobile.message}</p>}
    </div>
  </div>
</div>


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
        <p className="text-xs mt-2 text-[#292929]">
          Upload fees structure (max 2MB)
        </p>
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

  {/* Recent Marksheet */}
  <div className="border rounded-2xl p-6 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
    <Label htmlFor="marksheet" className="text-sm font-semibold text-gray-700">
      Recent Marksheet (PDF)
    </Label>
    {!watch("marksheet")?.[0] ? (
      <>
        <input
          id="marksheet"
          type="file"
          accept="application/pdf"
          {...register("marksheet")}
          className="hidden"
        />
        <label
          htmlFor="marksheet"
          className="flex items-center justify-center gap-2 w-full py-2 mt-3 bg-blue-500 text-white rounded-md font-medium text-sm cursor-pointer transition hover:bg-blue-700"
        >
          <Upload className="h-4 w-4" />
          Choose PDF File
        </label>
        <p className="text-xs mt-2 text-[#292929]">
          Upload recent marksheet (max 2MB)
        </p>
      </>
    ) : (
      <div className="mt-3">
        <p className="text-sm text-gray-700 truncate">{watch("marksheet")?.[0]?.name}</p>
        <div className="flex gap-2 mt-4">
          <label
            htmlFor="marksheet"
            className="flex items-center gap-2 w-full justify-center py-2 bg-blue-500 text-white rounded-md font-medium text-sm cursor-pointer transition hover:bg-blue-700"
          >
            <Upload className="h-4 w-4" />
            Upload New
          </label>
          <button
            type="button"
            onClick={() => setValue("marksheet", undefined)}
            className="flex items-center gap-2 w-full justify-center py-2 bg-red-500 text-white rounded-md font-medium text-sm transition hover:bg-red-600"
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
        <input
          id="signature"
          type="file"
          accept="application/pdf"
          {...register("signature")}
          className="hidden"
        />
        <label
          htmlFor="signature"
          className="flex items-center justify-center gap-2 w-full py-2 mt-3 bg-blue-500 text-white rounded-md font-medium text-sm cursor-pointer transition hover:bg-blue-700"
        >
          <Upload className="h-4 w-4" />
          Choose PDF File
        </label>
        <p className="text-xs mt-2 text-[#292929]">
          Upload signature (max 2MB)
        </p>
      </>
    ) : (
      <div className="mt-3">
        <p className="text-sm text-gray-700 truncate">{watch("signature")?.[0]?.name}</p>
        <div className="flex gap-2 mt-4">
          <label
            htmlFor="signature"
            className="flex items-center gap-2 w-full justify-center py-2 bg-blue-500 text-white rounded-md font-medium text-sm cursor-pointer transition hover:bg-blue-700"
          >
            <Upload className="h-4 w-4" />
            Upload New
          </label>
          <button
            type="button"
            onClick={() => setValue("signature", undefined)}
            className="flex items-center gap-2 w-full justify-center py-2 bg-red-500 text-white rounded-md font-medium text-sm transition hover:bg-red-600"
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

  {/* Parent Approval Letter */}
{isNewStudent && (
  <div className="border rounded-2xl p-6 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
    <Label htmlFor="parentApprovalLetter" className="text-sm font-semibold text-gray-700">
      Parent Request Letter (PDF)
    </Label>
    {!watch("parentApprovalLetter")?.[0] ? (
      <>
        <input
          id="parentApprovalLetter"
          type="file"
          accept="application/pdf"
          {...register("parentApprovalLetter")}
          className="hidden"
        />
        <label
          htmlFor="parentApprovalLetter"
          className="flex items-center justify-center gap-2 w-full py-2 mt-3 bg-blue-500 text-white rounded-md font-medium text-sm cursor-pointer transition hover:bg-blue-700"
        >
          <Upload className="h-4 w-4" />
          Choose PDF File
        </label>
        <p className="text-xs mt-2 text-[#292929]">
          Upload request letter (max 2MB)
        </p>
      </>
    ) : (
      <div className="mt-3">
        <p className="text-sm text-gray-700 truncate">
          {watch("parentApprovalLetter")?.[0]?.name}
        </p>
        <div className="flex gap-2 mt-4">
          <label
            htmlFor="parentApprovalLetter"
            className="flex items-center gap-2 w-full justify-center py-2 bg-blue-500 text-white rounded-md font-medium text-sm cursor-pointer transition hover:bg-blue-700"
          >
            <Upload className="h-4 w-4" />
            Upload New
          </label>
          <button
            type="button"
            onClick={() => setValue("parentApprovalLetter", undefined)}
            className="flex items-center gap-2 w-full justify-center py-2 bg-red-500 text-white rounded-md font-medium text-sm transition hover:bg-red-600"
          >
            <X className="h-4 w-4" />
            Remove
          </button>
        </div>
      </div>
    )}
    {typeof errors.parentApprovalLetter?.message === "string" && (
      <p className="text-sm text-red-500 mt-2">{errors.parentApprovalLetter.message}</p>
    )}
  </div>
)}
</div>


        {/* Confirm Checkbox */}
        <div className="flex items-start gap-3 py-4">
          <Checkbox
            id="confirm"
            checked={watch("confirm")}
            onCheckedChange={(checked) => setValue("confirm", (checked === true) as true)}
          />
          <label htmlFor="confirm" className="text-sm text-gray-700 leading-snug">
            I confirm all the above information provided is true and correct to the best of my knowledge.
          </label>  
        </div>
        {errors.confirm && (
          <p className="text-sm text-red-500 mt-1">{errors.confirm.message}</p>
        )}

        <Button type="submit" disabled={loading} className="w-full bg-blue-500 text-white py-6 rounded-lg text-base">
          {loading ? "Submitting..." : "Submit Form"}
        </Button>
      </form>
    </div>
  );
}