// utils/shareUtils.ts

export const getWhatsAppShareURL = (generatedLink: string) => {
    const message = `Dear Sir/Madam,

Based on your request for UWF Student Aid for your ward, kindly click the link below to fill up the form and submit it on the UWF portal before July 31, 2025.

${generatedLink}

We look forward to supporting you to the best of our ability with your request.

Thanks & Regards,
United Welfare Foundation
Email: united_welfare_foundation@outlook.com`;

    const encodedMessage = encodeURIComponent(message);
    return `https://api.whatsapp.com/send?text=${encodedMessage}`;
};

export const getBankInfoLetterWhatsAppURL = ({
  principal_headmaster,
  school_college_name,
  student_name,
  admission_no_gr_no,
  student_parent_name,
  class_course_program,
  academic_year_term,
}: {
  principal_headmaster: string;
  school_college_name: string;
  student_name: string;
  admission_no_gr_no: string;
  student_parent_name: string;
  class_course_program: string;
  academic_year_term: string;
}) => {
  const message =
    `Bank Info Letter\n\n` +
    `Principal/Headmaster: ${principal_headmaster}\n` +
    `School/College Name: ${school_college_name}\n` +
    `Student Name: ${student_name}\n` +
    `Admission No / GR No.: ${admission_no_gr_no}\n` +
    `Student Parent Name: ${student_parent_name}\n` +
    `Class / Course / Program: ${class_course_program}\n` +
    `Academic Year / Term: ${academic_year_term}`;

  const encodedMessage = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?text=${encodedMessage}`;
};
  
  export const getGmailShareURL = (generatedLink: string) => {
    const subject = encodeURIComponent("UWF Student Aid Form - Submit before July 31, 2025");
  
    const body = encodeURIComponent(
      `Dear Sir/Madam,\n\n` +
      `Based on your request for UWF Student Aid for your ward, kindly click on the link below to fill up the form and submit it on the UWF portal before July 31, 2025.\n\n` +
      `${generatedLink}\n\n` +
      `We look forward to supporting you to the best of our ability with your request.\n\n` +
      `Thanks & Regards,\nUnited Welfare Foundation\nEmail: united_welfare_foundation@outlook.com`
    );
  
    return `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${subject}&body=${body}`;
  };
  
  export const getRejectionWhatsAppURL = (mobile: string) => {
    const message = `Dear Sir/Madam,\n\nUWF Student Aid Request for your ward has been rejected due to the following reasons:\n\nThanks & Regards,\nUnited Welfare Foundation`;
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/91${mobile}?text=${encodedMessage}`;
  };

  export const getClarificationWhatsAppURL = (mobile: string) => {
    const message = `Dear Sir/Madam,\nRegarding the UWF Student Aid Request submitted for your ward, we request your kind clarification on the following:\n\nKindly update as soon as possible to enable processing of your request.\n\nThanks & Regards,\nUnited Welfare Foundation\nEmail: united_welfare_foundation@outlook.com`;
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/+91${mobile}?text=${encodedMessage}`;
  };

  export const getAcceptanceWhatsAppURL = (mobile: string) => {
    const msg = `Dear Sir/Madam,\n\nUWF Student Aid Request for your ward has been received by the UWF team and is under evaluation.\n\nThanks & Regards,\nUnited Welfare Foundation`;
    const encodedMessage = encodeURIComponent(msg);
    return `https://wa.me/+91${mobile}?text=${encodedMessage}`;
  };
  
  export const getDisbursementWhatsAppURL = (mobile: string) => {
    const msg = `Dear Sir/Madam,\n\nUWF Student Aid Request for your ward has been accepted and the amount has been disbursed by the UWF team as per below details:\n\nKindly provide confirmation upon receipt.\n\nThanks & Regards,\nUnited Welfare Foundation\nEmail: united_welfare_foundation@outlook.com`;
    const encodedMessage = encodeURIComponent(msg);
    return `https://wa.me/+91${mobile}?text=${encodedMessage}`;
  };
  
  export const getAcknowledgementWhatsAppURL = (mobile: string, formLink: string) => {
  const msg = `Dear Sir/Madam,\n\nBased on your request for UWF Student Aid for your ward, kindly click on the link below to fill up the form and submit it on the UWF portal before December 31.\n\n${formLink}\n\nWe look forward to supporting you to the best of our ability with your request.\n\nThanks & Regards,\nUnited Welfare Foundation\nEmail: united_welfare_foundation@outlook.com`;
  
    const encodedMessage = encodeURIComponent(msg);
    return `https://wa.me/+91${mobile}?text=${encodedMessage}`;
  };
  
