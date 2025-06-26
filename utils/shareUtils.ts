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
  