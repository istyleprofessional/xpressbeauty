import nodemailer from "nodemailer";

export const sendVerficationMail = async (
  email: string,
  name: string,
  token: string
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "xpressbeautysupplier@gmail.com",
      pass: "iljmmriysldnignu",
    },
  });
  const mailOptions = {
    from: "xpressbeautysupplier@gmail.com",
    to: email,
    subject: "Xpress Beauty Verification",
    html: `<div style="text-align: center;">
                <p style="font-weight: bold; color: red;">Hi ${name}</p>
                    <p style="font-weight: bold;">Thank you for registering with Xpress Beauty. Please click on the link below to verify your account.</p>
                    <a href="http://localhost:5173/emailVerify/?token=${token}" style="font-weight: bold;">Verify</a>
                    <p style="font-weight: bold;">Regards,</p>
                    <p style="font-weight: bold;">Xpress Beauty Team</p>
                </div>`,
  };
  transporter.sendMail(mailOptions, function (error: any, info: any) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
