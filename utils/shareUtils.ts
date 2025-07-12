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
  