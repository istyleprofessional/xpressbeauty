import nodemailer from "nodemailer";

export const sendContactUsEmailToAdmin = async (data: any) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 465,
    secure: true, //ssl
    auth: {
      user: import.meta.env.VITE_EMAIL ?? "",
      pass: import.meta.env.VITE_EMAIL_PASS ?? "",
    },
  });

  const mailOptions = {
    from: `XpressBeauty <${import.meta.env.VITE_EMAIL ?? ""}>`,
    to: "isbeautysupply@gmail.com",
    subject: "Contact Us Form Submission",
    html: `
    <body style="margin: 0; padding: 0; background-color: #f7f7f7; font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; padding-bottom: 20px;">
              <img src="cid:img" alt="XpressBeauty" style="max-width: 100px;">
          </div>
          <div style="padding: 20px 0; text-align: center;">
                <p>Hello <strong>Xpress Beauty Admin</strong>,</p>
                <p>A new contact us form has been submitted.</p>
                <p>Here are the details:</p>
                <p><strong>Name:</strong> ${data.name}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Message:</strong> ${data.clientMessage}</p>
          </div>
          <div style="text-align: center; padding-top: 20px; color: #777777;">
              <p>If you have any questions, please contact us at <a href="mailto:info@xpressbeauty.ca">info@xpressbeauty.ca</a>.</p>
          </div>
      </div>
    </body>`,
    attachments: [
      {
        filename: "logoX2.jpg",
        path: `${process.cwd()}/public/logoX2.jpg`,
        cid: "img",
      },
    ],
  };
  try {
    await transporter.sendMail(mailOptions);
    return {
      status: "success",
      err: null,
    };
  } catch (error: any) {
    return {
      status: "failed",
      err: error.message,
    };
  }
};
