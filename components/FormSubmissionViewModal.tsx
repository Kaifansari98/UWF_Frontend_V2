"use client";

import Image from "next/image";
import { Button } from "./ui/button";
import { Check, Download, MoveRight, X } from "lucide-react";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { PDFDownloadLink } from '@react-pdf/renderer';
import StudentAidPDFDocument from './pdf/StudentAidPDFDocument';
import {
  getFormDataAsset,
  getAcknowledgementDataAsset,
} from "@/utils/assetUrlBuilder";

interface FormSubmissionViewModalProps {
  submission: any;
  onClose: () => void;
}

export default function FormSubmissionViewModal({
  submission,
  onClose,
}: FormSubmissionViewModalProps) {

  const modalRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  console.log("Modal Submission:", submission.status);

  useEffect(() => {
    if (modalRef.current && cardRef.current) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );
  
      gsap.fromTo(
        cardRef.current,
        { scale: 1.15, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" }
      );
    }
  }, []);
  

  const handleClose = () => {
    if (modalRef.current && cardRef.current) {
      gsap.to(cardRef.current, {
        scale: 1.15,
        opacity: 0,
        duration: 0.25,
        ease: "power2.in",
      });
      gsap.to(modalRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
        onComplete: onClose,
      });
    } else {
      onClose();
    }
  };
  

  return (
    <div ref={modalRef} className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div ref={cardRef} className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl border bg-card p-6 shadow-lg relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b-[1px] pb-4">
          {/* <h2 className="text-2xl font-semibold text-black">UWF Student Aid Form</h2> */}
          <PDFDownloadLink
            document={<StudentAidPDFDocument submission={submission} />}
            fileName={`${submission.formId}_UWF_Form.pdf`}
          >
            {({ loading }) => (
              <Button className="bg-[#025aa5] text-white hover:bg-[#014b87]">
                <Download className="mr-2" />
                {loading ? 'Preparing PDF...' : 'Download Form As PDF'}
              </Button>
            )}
          </PDFDownloadLink>
          <div className="flex gap-6">
          <button onClick={handleClose}>
              <X className="w-6 h-6 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Logo */}
        <div className="mb-6 w-full flex flex-row justify-between">
            <div className="h-full pr-5">
                <div className="mt-3">
                <h1 className="font-bold text-[#025aa5] text-2xl">
                    UNITED WELFARE FOUNDATION
                </h1>
                <div className="mt-1">
                <p className="text-sm font-semibold text-foreground">Regd. F / 39715 / THANE. DATED. 24 / 07 / 2019</p>
                <p className="text-[11px] font-semibold text-muted-foreground">A-05/605, MILLENNIUM TOWER, SECTOR 09, SANPADA, NAVI MUMBAI, THANE 400705</p>
                </div>
                </div>
            </div>
            <div className="">
          <Image
            src="/UWFLogo.png"
            alt="UWF Logo"
            width={170}
            height={170}
            className="mx-auto"
          />
          </div>
        </div>

        <div className="w-full py-2 flex items-center justify-between">
            <p className="font-bold text-xl">STUDENT AID REQUEST FORM</p>
            <p>Date : {new Date(submission.submitted_at).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}</p>
        </div>

        {submission.status === "accepted" && (
  <div className="mb-4 flex flex-row items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-center text-sm font-medium text-green-700 dark:text-green-300">
    <Check size={'16'}/>
    <p>
      This Form has been accepted by the Evaluator
    </p>
  </div>
)}

        <div className="w-full rounded-xl border border-border bg-card py-4 px-6">
  <h2 className="mb-4 border-b pb-2 text-lg font-semibold text-foreground">
    Student Information
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm text-muted-foreground">
    <div>
      <p className="font-bold">Form ID</p>
      <p className="text-lg text-foreground">{submission.formId}</p>
    </div>

    <div>
      <p className="font-bold">Student Name</p>
      <p className="text-lg text-foreground">
        {submission.firstName} {submission.fatherName} {submission.familyName}
      </p>
    </div>

    <div>
      <p className="font-bold">Gender</p>
      <p className="text-lg capitalize text-foreground">{submission.gender}</p>
    </div>

    <div>
      <p className="font-bold">Academic Year</p>
      <p className="text-lg text-foreground">{submission.academicYear}</p>
    </div>

    <div>
      <p className="font-bold">Medium</p>
      <p className="text-lg text-foreground">{submission.studyMedium}</p>
    </div>

    <div>
      <p className="font-bold">Class</p>
      <p className="text-lg text-foreground">{submission.class}</p>
    </div>

    <div>
      <p className="font-bold">School Name</p>
      <p className="text-lg text-foreground">{submission.schoolName}</p>
    </div>
  </div>
</div>

<div className="w-full mt-4 rounded-xl border border-border bg-card py-4 px-6">
  <h2 className="mb-4 border-b pb-2 text-lg font-semibold text-foreground">
    Parent / Guardian Information
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm text-muted-foreground">
    <div>
      <p className="font-bold">Parent Name</p>
      <p className="text-lg text-foreground">{submission.parentName}</p>
    </div>

    <div>
      <p className="font-bold">Requested Amount</p>
      <p className="text-lg font-bold text-foreground">₹{submission.requested_amount?.toLocaleString()}</p>
    </div>
    <div>
      <p className="font-bold">Mobile</p>
      <p className="text-lg text-foreground">{submission.mobile}</p>
    </div>

    <div>
      <p className="font-bold">Alternate Mobile</p>
      <p className="text-lg text-foreground">{submission.alternateMobile}</p>
    </div>


    <div>
      <p className="font-bold">Income Source</p>
      <p className="text-lg text-foreground">{submission.incomeSource}</p>
    </div>

    {typeof submission.acceptedAmount === "number" && !isNaN(submission.acceptedAmount) && (
  <div className="font-bold">
    <p className="font-bold text-[#10b981]">Accepted Amount by Treasurer</p>
    <p className="text-[#10b981] text-lg">₹{submission.acceptedAmount.toLocaleString()}</p>
  </div>
)}

    <div className="md:col-span-2">
      <p className="font-bold">Residence Address</p>
      <p className="text-lg text-foreground">{submission.address}</p>
    </div>
    <div className="md:col-span-2">
      <p className="font-bold">Reason for Aid</p>
      <p className="mt-2 text-md text-foreground">{submission.reason}</p>
    </div>

  </div>
</div>

<div className="w-full mt-4 rounded-xl border border-border bg-card py-4 px-6">
  <h2 className="mb-4 border-b pb-2 text-lg font-semibold text-foreground">
    School Bank Account Details
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm text-muted-foreground">
    <div>
      <p className="font-bold">Bank A/C Holder Name</p>
      <p className="text-lg text-foreground">{submission.bankAccountHolder}</p>
    </div>

    <div>
      <p className="font-bold">Account Number</p>
      <p className="text-lg text-foreground">{submission.bankAccountNumber}</p>
    </div>

    <div>
      <p className="font-bold">IFSC Code</p>
      <p className="text-lg text-foreground">{submission.ifscCode}</p>
    </div>

    <div>
      <p className="font-bold">Bank Name</p>
      <p className="text-lg text-foreground">{submission.bankName}</p>
    </div>
  </div>
</div>

<div className="w-full mt-4 rounded-xl border border-border bg-card py-4 px-6">
  <h2 className="mb-4 border-b pb-2 text-lg font-semibold text-foreground">
    UWF Member / Coordinator Information
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm text-muted-foreground">
    <div>
      <p className="font-bold">UWF Member / Coordinator Name</p>
      <p className="text-lg text-foreground">{submission.coordinatorName}</p>
    </div>

    <div>
      <p className="font-bold">UWF Member / Coordinator Mobile Number</p>
      <p className="text-lg text-foreground">{submission.coordinatorMobile}</p>
    </div>
  </div>
</div>

<div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mt-6">
  {/* Fees Structure */}
  <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-6">
    <p className="mb-2 text-sm font-semibold text-foreground">Fees Structure</p>
    {submission.feesStructure ? (
      <a
        href={getFormDataAsset(submission.feesStructure)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-block rounded-md bg-[#025aa5] px-4 py-2 text-center text-sm text-white transition hover:bg-[#014b87]"
      >
        View PDF
      </a>
    ) : (
      <p className="mt-2 text-sm text-muted-foreground">No file uploaded</p>
    )}
  </div>

  {/* Marksheet */}
  <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-6">
    <p className="mb-2 text-sm font-semibold text-foreground">Recent Marksheet</p>
    {submission.marksheet ? (
      <a
      href={getFormDataAsset(submission.marksheet)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-block rounded-md bg-[#025aa5] px-4 py-2 text-center text-sm text-white transition hover:bg-[#014b87]"
      >
        View PDF
      </a>
    ) : (
      <p className="mt-2 text-sm text-muted-foreground">No file uploaded</p>
    )}
  </div>

  {/* Signature */}
  <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-6">
    <p className="mb-2 text-sm font-semibold text-foreground">Parent/Guardian Signature</p>
    {submission.signature ? (
      <a
        href={getFormDataAsset(submission.signature)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-block rounded-md bg-[#025aa5] px-4 py-2 text-center text-sm text-white transition hover:bg-[#014b87]"
      >
        View PDF
      </a>
    ) : (
      <p className="mt-2 text-sm text-muted-foreground">No file uploaded</p>
    )}
  </div>

      {/* Parent Request Letter */}
  <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-6">
    <p className="mb-2 text-sm font-semibold text-foreground">Parent/Guardian request Letter</p>
    {submission.parentApprovalLetter ? (
      <a
      href={getFormDataAsset(submission.parentApprovalLetter)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-block rounded-md bg-[#025aa5] px-4 py-2 text-center text-sm text-white transition hover:bg-[#014b87]"
      >
        View PDF
      </a>
    ) : (
      <p className="mt-2 text-sm text-muted-foreground">No file uploaded</p>
    )}
  </div>

{/* Acknowledgement Invoice */}
{submission?.acknowledgement?.invoice && (
  <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-6">
    <p className="mb-2 text-sm font-semibold text-foreground">Acknowledgement Invoice</p>
    <a
      href={getAcknowledgementDataAsset(submission.acknowledgement.invoice)}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-auto inline-block rounded-md bg-[#025aa5] px-4 py-2 text-center text-sm text-white transition hover:bg-[#014b87]"
    >
      View PDF
    </a>
  </div>
)}
</div>
       
      </div>
    </div>
  );
}
