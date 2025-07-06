"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollText, BookOpenCheck, FileText, AlertTriangle } from "lucide-react";

interface TermsProps {
  onAccept: () => void;
}

export default function UwfTermsAndConditions({ onAccept }: TermsProps) {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    setAccepted(true);
    onAccept();
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="bg-white border border-gray-200 shadow-lg rounded-2xl p-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            UWF STUDENT AID RULES & REGULATIONS
          </h1>
          <p className="text-lg font-medium text-gray-600 mt-1">
            یو ڈبلیو ایف طلباء کی امداد کے قواعد و ضوابط
          </p>
        </div>

        {/* Rules & Regulations Section */}
<div className="space-y-6">
  <SectionHeader
    icon={<ScrollText />}
    title="UWF STUDENT AID RULES & REGULATIONS"
    urdu="یو ڈبلیو ایف طلباء کی امداد کے قواعد و ضوابط"
  />

  <div className="max-h-[400px] overflow-y-auto px-2 pr-3 space-y-4 text-sm leading-relaxed">
    {[
      {
        en: "It is mandatory that all information requested by UWF is provided true to the best of the requestor’s knowledge.",
        ur: "یہ لازمی ہے کہ UWF کی طرف سے مانگی گئی تمام معلومات درخواست دہندہ کی علم کی بہترین حد تک درست فراہم کی جائیں۔",
      },
      {
        en: "All information requested is mandatory and must be filled in.",
        ur: "تمام طلب کی گئی معلومات لازمی ہیں اور انہیں پر کرنا ضروری ہے۔",
      },
      {
        en: "Any request with incomplete/incorrect information will not be accepted.",
        ur: "کسی بھی درخواست جس میں معلومات مکمل/غلط ہو، قبول نہیں کی جائے گی۔",
      },
      {
        en: "Request must be submitted before 1st June of the academic year (late result must be supported with documents).",
        ur: "درخواست کو تعلیمی سال کی پہلی جون سے پہلے جمع کروانا ہوگا (دیر سے نتیجہ ہونے کی صورت میں دستاویزات ضروری ہیں)۔",
      },
      {
        en: "Student progress is the responsibility of the coordinator; UWF may contact guardians if required.",
        ur: "طالب علم کی ترقی کی ذمہ داری کوآرڈینیٹر کی ہے؛ UWF والدین سے رابطہ کر سکتا ہے۔",
      },
      {
        en: "Aid is valid for one academic year only.",
        ur: "امداد صرف ایک تعلیمی سال کے لیے معتبر ہوگی۔",
      },
      {
        en: "All parties must comply with UWF rules & regulations.",
        ur: "تمام افراد UWF کے قواعد و ضوابط پر عمل کریں گے۔",
      },
      {
        en: "Foundation reserves the right to accept/reject based on bylaws; decision must be respected.",
        ur: "فاؤنڈیشن کے پاس قبول/رد کرنے کا حق محفوظ ہے؛ فیصلہ سب کو قبول کرنا ہوگا۔",
      },
    ].map((rule, index) => (
      <div
        key={index}
        className="bg-gray-50 rounded-lg border border-gray-200 p-4 flex flex-col md:flex-row justify-between md:items-start gap-4"
      >
        <div className="flex-1">
          <p className="font-medium text-gray-800">
            <span className="text-blue-600 mr-2">{index + 1}.</span> {rule.en}
          </p>
        </div>
        <div className="md:w-1/2 text-right text-gray-700 text-sm">
          {rule.ur}
        </div>
      </div>
    ))}
  </div>
</div>


        {/* Divider */}
        <hr className="border-gray-300" />

        {/* Student Aid Request Requirements */}
        <div className="space-y-6">
          <SectionHeader icon={<FileText />} title="STUDENT AID REQUEST REQUIREMENTS" urdu="طلبہ کی امداد کی درخواست کی ضروریات" />

          <div className="grid md:grid-cols-2 gap-8 text-sm leading-relaxed">
            <div>
              <h3 className="font-semibold text-gray-800">New Student Aid Request:</h3>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Submit clear scanned documents (PDF).</li>
                <li>Request Form (signed by parent/guardian).</li>
                <li>Request Letter from Parent/Guardian (PDF).</li>
                <li>Final Exam Marksheet (PDF).</li>
                <li>Fees Structure (PDF).</li>
              </ul>
            </div>
            <div className="text-gray-700">
                <h3 className="font-semibold text-right">نئی طلبہ امداد کی درخواست:</h3>
                <ul className=" pl-5 mt-2 space-y-1 text-sm leading-relaxed text-right">
                    <li>صاف اسکن شدہ دستاویزات فراہم کریں۔</li>
                    <li>درخواست فارم (والد/سرپرست سے دستخط شدہ)۔</li>
                    <li>درخواست کا خط (PDF)۔</li>
                    <li>آخری امتحان کی مارکس شیٹ (PDF)۔</li>
                    <li>فیس کا ڈھانچہ (PDF)۔</li>
                </ul>
            </div>
          </div>

          {/* Existing Student */}
          <div className="grid md:grid-cols-2 gap-8 text-sm leading-relaxed">
            <div>
              <h3 className="font-semibold text-gray-800">Previously Aided / Existing Student:</h3>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Filled Request Form (signed by parent/guardian).</li>
                <li>Final Exam Marksheet (PDF).</li>
                <li>Fees Structure (PDF).</li>
                <li>Acknowledgment Form submitted before 31st August.</li>
              </ul>
            </div>
            <div className="text-gray-700">
                <h3 className="font-semibold text-right">پہلے سے معاونت یافتہ / موجودہ طالب علم:</h3>
                <ul className=" pl-5 mt-2 space-y-1 text-sm leading-relaxed text-right">
                    <li>درخواست فارم مکمل اور دستخط شدہ۔</li>
                    <li>آخری امتحان کی مارک شیٹ (PDF)۔</li>
                    <li>فیس کا ڈھانچہ (PDF)۔</li>
                    <li>31 اگست سے پہلے توثیق فارم جمع کروائیں۔</li>
                </ul>
            </div>
          </div>
        </div>

        {/* Acknowledgement */}
<div className="space-y-6">
  <SectionHeader icon={<BookOpenCheck />} title="STUDENT AID ACKNOWLEDGMENT TERMS" urdu="طلبہ امداد کی توثیق کی شرائط" />

  <div className="grid md:grid-cols-2 gap-8 text-sm leading-relaxed">
    {/* English Section */}
    <div>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          No acknowledgment required if aid is sent to school/college account.
        </li>
        <li>
          Acknowledgment required if:
          <ul className="list-[circle] pl-5 mt-1 space-y-1">
            <li>Aid sent to parent/student bank account.</li>
            <li>
              Aid exceeds fee: receipt + extra invoices (books, uniforms, etc.).
            </li>
          </ul>
        </li>
      </ul>
    </div>

    {/* Urdu Section */}
    <div className="text-gray-700">
      <ul className=" pr-5 space-y-1 text-right">
        <li>
          اگر امداد اسکول کے اکاؤنٹ میں جائے، تو توثیق درکار نہیں۔
        </li>
        <li>
          اگر:
          <ul className=" pr-5 mt-1 space-y-1">
            <li>امداد والد/طالبعلم کے بینک اکاؤنٹ میں جائے۔</li>
            <li>امداد فیس سے زیادہ ہو: فیس رسید + اضافی اخراجات کے بل شامل ہوں۔</li>
          </ul>
        </li>
      </ul>
    </div>
  </div>

          {/* Warning Note */}
          <div className="flex items-start gap-3 bg-yellow-100 border border-yellow-300 text-yellow-900 p-4 rounded-lg">
            <AlertTriangle className="w-5 h-5 mt-1" />
            <p className="text-sm">
              <strong>Note:</strong> Students who haven’t submitted acknowledgment for the previous academic year will have their current year's request held until submission.
              <br />
              <span className="block text-right text-sm mt-1">
                نوٹ: جن طلباء نے پچھلے سال کی توثیق جمع نہیں کی، ان کی موجودہ درخواست روکی جائے گی۔
              </span>
            </p>
          </div>
        </div>

        {/* Accept Button */}
        <div className="pt-6 text-center">
          <Button onClick={handleAccept} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 text-base rounded-xl shadow">
            I have read & agree – Continue to Form
          </Button>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ icon, title, urdu }: { icon: React.ReactNode; title: string; urdu: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-gray-200 pb-2">
      <div className="flex items-center gap-2 text-blue-600 text-lg font-semibold">
        {icon}
        {title}
      </div>
      <div className="text-sm text-gray-600 font-medium text-right">{urdu}</div>
    </div>
  );
}
