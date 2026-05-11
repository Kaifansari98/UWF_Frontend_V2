"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type BankLetterPreviewData = {
  principal_headmaster: string;
  school_college_name: string;
  address: string;
  student_name: string;
  admission_no_gr_no: string;
  student_parent_name: string;
  class_course_program: string;
  academic_year_term: string;
  signatory_name?: string;
  generated_at?: string;
};

function formatLetterDate(dateString?: string) {
  if (!dateString) return "[Date]";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "[Date]";

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function BlankLine() {
  return <span className="block flex-1 border-b border-black" />;
}

export default function BankLetterPreviewModal({
  open,
  onOpenChange,
  letter,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  letter: BankLetterPreviewData | null;
}) {
  if (!letter) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] overflow-y-auto bg-card p-0 sm:max-w-5xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Bank Letter Preview</DialogTitle>
          <DialogDescription>
            Preview of the bank information letter for the selected student.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-white p-8 text-black sm:p-12">
          <div className="mx-auto max-w-[920px]">
            <div className="flex items-center justify-between gap-8">
              <Image
                src="/UWFLogo.png"
                alt="United Welfare Foundation logo"
                width={220}
                height={120}
                className="h-auto w-[180px] sm:w-[220px]"
                priority={false}
              />

              <div className="flex-1 pt-2 text-[#0d4f9e]">
                <h2 className="font-bold text-xl leading-tight sm:text-4xl">
                  UNITED WELFARE FOUNDATION
                </h2>
                <p className="text-xl text-neutral-600 sm:text-2xl">
                  Regd. F / 39715 / THANE. DATED. 24 / 07 / 2019
                </p>
              </div>
            </div>

            <div className="mt-8 border-t-2 border-[#0d4f9e]" />

            <div className="mt-5 text-sm leading-relaxed sm:text-[20px]">
              <p className="text-[#d15ba4]">
                {formatLetterDate(letter.generated_at)}
              </p>

              <div>
                <p>To:</p>
                <p className="text-[#d15ba4]">{letter.principal_headmaster}</p>
                <p className="text-[#d15ba4]">
                  {letter.school_college_name}, {letter.address}
                </p>
              </div>

              <p className="mt-3 text-[#0d4f9e]">
                Subject: Request for Institutional Banking Details for Student
                Fee Support
              </p>

              <p className="mt-3">Dear Sir/Madam,</p>

              <p className="mt-3 font-semibold">
                <span className="text-[#0d4f9e]">
                  United Welfare Foundation (UWF),
                </span>{" "}
                a registered non-governmental organization in Maharashtra (Regd.
                No. F/39715/Thane dated 24/07/2019), supports students through
                educational assistance programs under UWF Student Aid
                Guidelines. Accordingly, we intend to sponsor the academic fees
                of the below-mentioned student enrolled at your institution.
              </p>

              <div className="mt-5">
                <p className="font-semibold text-[#4a76c9]">
                  Student Information{" "}
                  <span className="font-normal text-neutral-400">
                    (for fee payment reference)
                  </span>
                </p>
                <div className="mt-2 space-y-2">
                  <p>Student Name</p>
                  <p>{letter.student_name}</p>

                  <p className="pt-2">Admission No / GR No.</p>
                  <p>{letter.admission_no_gr_no}</p>

                  <p className="pt-2">Student Parent Name</p>
                  <p>{letter.student_parent_name}</p>

                  <p className="pt-2">Class / Course / Program</p>
                  <p>{letter.class_course_program}</p>

                  <p className="pt-2">Academic Year / Term</p>
                  <p>{letter.academic_year_term}</p>
                </div>
              </div>

              <div className="mt-14">
                <p className="font-semibold text-[#4a76c9]">
                  School/College Bank Information{" "}
                  <span className="font-normal text-neutral-400">
                    (kindly provide your institution&apos;s banking details to
                    facilitate smooth and direct fee payment of Student
                    Education Aid):
                  </span>
                </p>
                <div className="mt-3 space-y-5">
                  <div className="flex items-end gap-3">
                    <p className="shrink-0">Bank Name</p>
                    <BlankLine />
                  </div>
                  <div className="flex items-end gap-3">
                    <p className="shrink-0">Account Name</p>
                    <BlankLine />
                  </div>
                  <div className="flex items-end gap-3">
                    <p className="shrink-0">Account Number</p>
                    <BlankLine />
                  </div>
                  <div className="flex items-end gap-3">
                    <p className="shrink-0">IFSC Code</p>
                    <BlankLine />
                  </div>
                  <div className="flex items-end gap-3">
                    <p className="shrink-0">Branch Name &amp; Address</p>
                    <BlankLine />
                  </div>
                </div>
              </div>

              <p className="mt-16">
                We confirm that all payments will be made through official
                banking channels in compliance with applicable laws and
                institutional requirements and we will provide the N.E.F.T
                transaction U.T.R. No. for confirmation of fees payment. We
                appreciate your cooperation and support in enabling access to
                education for deserving students.
              </p>

              <div className="mt-10">
                <p>Yours faithfully,</p>
                <div className="mt-8 space-y-1">
                  <p>
                    {letter.signatory_name || "[Authorized Signatory Name]"}
                  </p>
                  <p>[Designation]</p>
                  <p className="font-semibold text-[#0d4f9e]">
                    United Welfare Foundation
                  </p>
                </div>
              </div>

              <div className="mt-10 border-t-2 border-[#0d4f9e]" />
              <div className="mt-5 text-center text-lg leading-tight text-[#0d4f9e] sm:text-lg">
                <p>
                  A - 05 / 605 , MILLENIUM TOWER, SECTOR 09 , SANPADA , NAVI -
                  MUMBAI , DIST :- THANE 400705
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
