import nodemailer from "nodemailer";

export const sendForgetPasswordEmail = async (email: string, token: string) => {
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
    from: `XpressBeauty Reset Password <${import.meta.env.VITE_EMAIL ?? ""}>`,
    to: email,
    subject: "Xpress Beauty Reset Password",
    html: `
    <body style="margin: 0; padding: 0; background-color: #f7f7f7; font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; padding-bottom: 20px;">
              <img src="cid:img" alt="XpressBeauty" style="max-width: 100px;">
          </div>
          <div style="padding: 20px 0; text-align: center;">
              <p>Hello</p>
              <p>To Reset The Password Please Click Here</p>
              <a href="${
                import.meta.env.VITE_APPURL
              }/reset-password/?token=${token}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
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
    console.log("Email Sent");
    return {
      status: "success",
      err: null,
    };
  } catch (error: any) {
    console.log(error);
    return {
      status: "failed",
      err: error.message,
    };
  }
};
