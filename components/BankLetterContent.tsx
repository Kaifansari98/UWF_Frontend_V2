"use client";

import { forwardRef } from "react";

export type BankLetterData = {
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border border-gray-300">
      <td className="w-[42%] border-r border-gray-300 bg-[#f0f5ff] px-3 py-2 font-medium text-[#0d4f9e]">
        {label}
      </td>
      <td className="px-3 py-2 font-semibold text-black">{value}</td>
    </tr>
  );
}

const BANK_LABELS = [
  "Bank Name",
  "Account Name",
  "Account Number",
  "IFSC Code",
  "Branch & Address",
];

const BankLetterContent = forwardRef<HTMLDivElement, { letter: BankLetterData }>(
  function BankLetterContent({ letter }, ref) {
    return (
      <div ref={ref} className="mx-auto max-w-[920px] bg-white p-8 sm:p-12 text-black">
        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/UWFLogo.png"
            alt="United Welfare Foundation logo"
            width={220}
            height={120}
            crossOrigin="anonymous"
            className="h-auto w-[180px] sm:w-[220px]"
          />
          <div className="flex-1 pt-2 text-[#0d4f9e]">
            <h2 className="font-bold text-xl leading-tight sm:text-4xl">
              UNITED WELFARE FOUNDATION
            </h2>
            <p className="mt-1 text-base text-neutral-500 sm:text-lg">
              Regd. F / 39715 / THANE &nbsp;|&nbsp; Dated: 24 / 07 / 2019
            </p>
          </div>
        </div>

        <div className="mt-6 border-t-[3px] border-[#0d4f9e]" />

        {/* ── Ref + Date ── */}
        <div className="mt-5 flex items-start justify-between text-sm sm:text-[17px]">
          <p>
            <span className="text-neutral-500">Ref. No.: </span>
            <span className="text-[#d15ba4]">UWF / ______ / 2025–26</span>
          </p>
          <p>
            <span className="text-neutral-500">Date: </span>
            <span className="text-[#d15ba4]">
              {formatLetterDate(letter.generated_at)}
            </span>
          </p>
        </div>

        <div className="mt-5 text-sm leading-relaxed sm:text-[18px]">
          {/* ── To ── */}
          <div className="mt-1">
            <p className="font-semibold">To,</p>
            <p className="text-[#d15ba4]">{letter.principal_headmaster},</p>
            <p className="text-[#d15ba4]">{letter.school_college_name},</p>
            <p className="text-[#d15ba4]">{letter.address}</p>
          </div>

          {/* ── Subject ── */}
          <p className="mt-5 font-bold text-[#0d4f9e] underline underline-offset-4">
            Subject: Request for Institutional Banking Details for Student Fee
            Support
          </p>

          <p className="mt-5">Dear Sir / Madam,</p>

          {/* ── Body ── */}
          <p className="mt-4 text-justify">
            <span className="font-bold text-[#0d4f9e]">
              United Welfare Foundation (UWF)
            </span>
            , a registered non-governmental organization in Maharashtra
            (Regd. No.&nbsp;F/39715/Thane, dated&nbsp;24/07/2019), is committed
            to providing educational assistance to meritorious and deserving
            students under its{" "}
            <span className="italic">UWF Student Aid Guidelines</span>. Pursuant
            to the same, we intend to sponsor the academic fees of the student
            mentioned below, who is currently enrolled at your esteemed
            institution.
          </p>

          {/* ── Student Information Table ── */}
          <div className="mt-7">
            <p className="mb-2 font-semibold text-[#0d4f9e]">
              Student Information{" "}
              <span className="font-normal text-neutral-400 text-sm">
                (for fee payment reference)
              </span>
            </p>
            <table className="w-full border-collapse border border-gray-300 text-sm sm:text-[16px]">
              <tbody>
                <InfoRow label="Student Name" value={letter.student_name} />
                <InfoRow
                  label="Admission No. / GR No."
                  value={letter.admission_no_gr_no}
                />
                <InfoRow
                  label="Parent's / Guardian's Name"
                  value={letter.student_parent_name}
                />
                <InfoRow
                  label="Class / Course / Program"
                  value={letter.class_course_program}
                />
                <InfoRow
                  label="Academic Year / Term"
                  value={letter.academic_year_term}
                />
              </tbody>
            </table>
          </div>

          {/* ── Bank Information ── */}
          <div className="mt-10">
            <div className="mb-4">
              <p className="font-semibold text-[#0d4f9e]">
                School / College Bank Information
              </p>
              <p className="font-normal text-neutral-400 text-sm">
                Kindly furnish your institution&apos;s banking details to
                facilitate smooth and direct fee payment
              </p>
            </div>
            <div className="mt-4 space-y-5 text-sm sm:text-[17px]">
              {BANK_LABELS.map((label) => (
                <div key={label} className="flex items-end gap-3">
                  <p className="shrink-0 min-w-[180px]">{label}</p>
                  <BlankLine />
                </div>
              ))}
            </div>
          </div>

          {/* ── Closing Paragraph ── */}
          <p className="mt-12 text-justify">
            We confirm that all payments will be made exclusively through
            official banking channels in full compliance with applicable laws and
            institutional requirements. A NEFT transaction UTR number will be
            provided upon successful transfer as confirmation of fee payment. We
            sincerely appreciate your cooperation and support in facilitating
            access to quality education for deserving students.
          </p>

          {/* ── Signatory ── */}
          <p className="mt-10">Yours faithfully,</p>

          <div className="mt-6 flex items-end justify-between gap-6">
            <div className="space-y-1">
              <div className="mb-2 h-16 w-40 rounded border border-dashed border-gray-400" />
              <p className="font-semibold">
                {letter.signatory_name || "[Authorized Signatory Name]"}
              </p>
              <p className="text-neutral-500">[Designation]</p>
              <p className="font-bold text-[#0d4f9e]">United Welfare Foundation</p>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="mt-10 border-t-[3px] border-[#0d4f9e]" />
          <div className="mt-4 text-center text-sm leading-snug text-[#0d4f9e] sm:text-base">
            <p>
              A-05 / 605, Millenium Tower, Sector 09, Sanpada, Navi Mumbai,
              Dist: Thane – 400705
            </p>
          </div>
        </div>
      </div>
    );
  }
);

export default BankLetterContent;
