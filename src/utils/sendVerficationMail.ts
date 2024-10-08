import nodemailer from "nodemailer";

export const sendVerficationMail = async (
  email: string,
  name: string,
  token: string,
  otp: string
) => {
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
    from: `XpressBeauty Verification Code <${
      import.meta.env.VITE_EMAIL ?? ""
    }>`,
    to: email.trim(),
    subject: "Xpress Beauty Verification",
    html: `
    <body style="margin: 0; padding: 0; background-color: #f7f7f7; font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; padding-bottom: 20px;">
              <img src="cid:img" alt="XpressBeauty" style="max-width: 100px;">
          </div>
          <div style="padding: 20px 0; text-align: center;">
              <p>Hello <strong>${name}</strong>,</p>
              <p>Your OTP for verification is:</p>
              <p style="font-size: 28px; font-weight: bold; color: #333333; margin: 15px 0;">${otp}</p>
              <p>Use this OTP to complete the verification process.</p>
              <a href="${
                import.meta.env.VITE_APPURL
              }/emailVerify/?token=${token}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Account</a>
          </div>
          <div style="text-align: center; padding-top: 20px; color: #777777;">
              <p>If you have any questions, please contact us at <a href="mailto:${
                import.meta.env.VITE_EMAIL
              }">${import.meta.env.VITE_EMAIL}</a>.</p>
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
  transporter.sendMail(mailOptions, function (error: any, info: any) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
