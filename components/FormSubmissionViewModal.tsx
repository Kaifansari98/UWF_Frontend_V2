"use client";

import Image from "next/image";
import { Button } from "./ui/button";
import { Check, Download, MoveRight, X } from "lucide-react";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { PDFDownloadLink } from '@react-pdf/renderer';
import StudentAidPDFDocument from './pdf/StudentAidPDFDocument';

interface FormSubmissionViewModalProps {
  submission: any;
  onClose: () => void;
}

const FILE_BASE_URL = "http://localhost:5000/assets/FormData/";

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
      <div ref={cardRef} className="bg-white w-full max-w-3xl rounded-xl shadow-lg p-6 relative overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b-[1px] pb-4">
          {/* <h2 className="text-2xl font-semibold text-black">UWF Student Aid Form</h2> */}
          <PDFDownloadLink
            document={<StudentAidPDFDocument submission={submission} />}
            fileName={`${submission.formId}_UWF_Form.pdf`}
          >
            {({ loading }) => (
              <Button className="bg-[#025aa5] text-white">
                <Download className="mr-2" />
                {loading ? 'Preparing PDF...' : 'Download Form As PDF'}
              </Button>
            )}
          </PDFDownloadLink>
          <div className="flex gap-6">
          <button onClick={handleClose}>
              <X className="w-6 h-6 text-gray-700" />
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
                <p className="font-semibold text-[#000] text-sm">Regd. F / 39715 / THANE. DATED. 24 / 07 / 2019</p>
                <p className="font-semibold text-[#5e5e5e] text-[11px]">A-05/605, MILLENNIUM TOWER, SECTOR 09, SANPADA, NAVI MUMBAI, THANE 400705</p>
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
  <div className="mb-4 px-4 py-3 bg-green-100 border border-green-300 rounded-lg text-green-800 text-sm font-medium text-center flex flex-row items-center gap-2">
    <Check size={'16'}/>
    <p>
      This Form has been accepted by the Evaluator
    </p>
  </div>
)}

        <div className="w-full border border-gray-200 rounded-xl py-4 px-6 bg-white">
  <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
    Student Information
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm text-gray-700">
    <div>
      <p className="font-bold">Form ID</p>
      <p className="text-gray-900 text-lg">{submission.formId}</p>
    </div>

    <div>
      <p className="font-bold">Student Name</p>
      <p className="text-gray-900 text-lg">
        {submission.firstName} {submission.fatherName} {submission.familyName}
      </p>
    </div>

    <div>
      <p className="font-bold">Gender</p>
      <p className="text-gray-900 capitalize text-lg">{submission.gender}</p>
    </div>

    <div>
      <p className="font-bold">Academic Year</p>
      <p className="text-gray-900 text-lg">{submission.academicYear}</p>
    </div>

    <div>
      <p className="font-bold">Medium</p>
      <p className="text-gray-900 text-lg">{submission.studyMedium}</p>
    </div>

    <div>
      <p className="font-bold">Class</p>
      <p className="text-gray-900 text-lg">{submission.class}</p>
    </div>

    <div>
      <p className="font-bold">School Name</p>
      <p className="text-gray-900 text-lg">{submission.schoolName}</p>
    </div>
  </div>
</div>

<div className="w-full border border-gray-200 rounded-xl py-4 px-6 bg-white mt-4">
  <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
    Parent / Guardian Information
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm text-gray-700">
    <div>
      <p className="font-bold">Parent Name</p>
      <p className="text-gray-900 text-lg">{submission.parentName}</p>
    </div>

    <div>
      <p className="font-bold">Requested Amount</p>
      <p className="text-gray-900 text-lg font-bold">₹{submission.requested_amount?.toLocaleString()}</p>
    </div>
    <div>
      <p className="font-bold">Mobile</p>
      <p className="text-gray-900 text-lg">{submission.mobile}</p>
    </div>

    <div>
      <p className="font-bold">Alternate Mobile</p>
      <p className="text-gray-900 text-lg">{submission.alternateMobile}</p>
    </div>


    <div>
      <p className="font-bold">Income Source</p>
      <p className="text-gray-900 text-lg">{submission.incomeSource}</p>
    </div>

    {typeof submission.acceptedAmount === "number" && !isNaN(submission.acceptedAmount) && (
  <div className="font-bold">
    <p className="font-bold text-[#10b981]">Accepted Amount by Treasurer</p>
    <p className="text-[#10b981] text-lg">₹{submission.acceptedAmount.toLocaleString()}</p>
  </div>
)}

    <div className="md:col-span-2">
      <p className="font-bold">Residence Address</p>
      <p className="text-gray-900 text-lg">{submission.address}</p>
    </div>
    <div className="md:col-span-2">
      <p className="font-bold">Reason for Aid</p>
      <p className="text-gray-900 text-md mt-2">{submission.reason}</p>
    </div>

  </div>
</div>

<div className="w-full border border-gray-200 rounded-xl py-4 px-6 bg-white mt-4">
  <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
    School Bank Account Details
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm text-gray-700">
    <div>
      <p className="font-bold">Bank A/C Holder Name</p>
      <p className="text-gray-900 text-lg">{submission.bankAccountHolder}</p>
    </div>

    <div>
      <p className="font-bold">Account Number</p>
      <p className="text-gray-900 text-lg">{submission.bankAccountNumber}</p>
    </div>

    <div>
      <p className="font-bold">IFSC Code</p>
      <p className="text-gray-900 text-lg">{submission.ifscCode}</p>
    </div>

    <div>
      <p className="font-bold">Bank Name</p>
      <p className="text-gray-900 text-lg">{submission.bankName}</p>
    </div>
  </div>
</div>

<div className="w-full border border-gray-200 rounded-xl py-4 px-6 bg-white mt-4">
  <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
    UWF Member / Coordinator Information
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm text-gray-700">
    <div>
      <p className="font-bold">UWF Member / Coordinator Name</p>
      <p className="text-gray-900 text-lg">{submission.coordinatorName}</p>
    </div>

    <div>
      <p className="font-bold">UWF Member / Coordinator Mobile Number</p>
      <p className="text-gray-900 text-lg">{submission.coordinatorMobile}</p>
    </div>
  </div>
</div>

<div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mt-6">
  {/* Fees Structure */}
  <div className="border border-gray-200 rounded-xl p-6 bg-white flex flex-col justify-between">
    <p className="text-sm font-semibold text-gray-800 mb-2">Fees Structure</p>
    {submission.feesStructure ? (
      <a
        href={`http://localhost:5000/assets/FormData/${submission.feesStructure}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-block text-center px-4 py-2 bg-[#025aa5] text-white text-sm rounded-md hover:bg-[#0259a5cc] transition"
      >
        View PDF
      </a>
    ) : (
      <p className="text-sm text-gray-500 mt-2">No file uploaded</p>
    )}
  </div>

  {/* Marksheet */}
  <div className="border border-gray-200 rounded-xl p-6 bg-white flex flex-col justify-between">
    <p className="text-sm font-semibold text-gray-800 mb-2">Recent Marksheet</p>
    {submission.marksheet ? (
      <a
        href={`http://localhost:5000/assets/FormData/${submission.marksheet}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-block text-center px-4 py-2 bg-[#025aa5] text-white text-sm rounded-md hover:bg-[#0259a5cc] transition"
      >
        View PDF
      </a>
    ) : (
      <p className="text-sm text-gray-500 mt-2">No file uploaded</p>
    )}
  </div>

  {/* Signature */}
  <div className="border border-gray-200 rounded-xl p-6 bg-white flex flex-col justify-between">
    <p className="text-sm font-semibold text-gray-800 mb-2">Parent/Guardian Signature</p>
    {submission.signature ? (
      <a
        href={`http://localhost:5000/assets/FormData/${submission.signature}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-block text-center px-4 py-2 bg-[#025aa5] text-white text-sm rounded-md hover:bg-[#0259a5cc] transition"
      >
        View PDF
      </a>
    ) : (
      <p className="text-sm text-gray-500 mt-2">No file uploaded</p>
    )}
  </div>

      {/* Parent Request Letter */}
  <div className="border border-gray-200 rounded-xl p-6 bg-white flex flex-col justify-between">
    <p className="text-sm font-semibold text-gray-800 mb-2">Parent/Guardian request Letter</p>
    {submission.parentApprovalLetter ? (
      <a
        href={`http://localhost:5000/assets/FormData/${submission.parentApprovalLetter}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-block text-center px-4 py-2 bg-[#025aa5] text-white text-sm rounded-md hover:bg-[#0259a5cc] transition"
      >
        View PDF
      </a>
    ) : (
      <p className="text-sm text-gray-500 mt-2">No file uploaded</p>
    )}
  </div>

  {/* Acknowledgement Invoice */}
{submission.acknowledgement?.invoice && (
  <div className="border border-gray-200 rounded-xl p-6 bg-white flex flex-col justify-between">
    <p className="text-sm font-semibold text-gray-800 mb-2">Acknowledgement Invoice</p>
    <a
      href={`http://localhost:5000/assets/Acknowledgement/${submission.acknowledgement.invoice}`}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-auto inline-block text-center px-4 py-2 bg-[#025aa5] text-white text-sm rounded-md hover:bg-[#0259a5cc] transition"
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
