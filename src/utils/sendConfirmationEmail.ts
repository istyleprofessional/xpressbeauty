import { createTransport } from "nodemailer";

export const sendConfirmationEmail = async (email: string, name: string) => {
  const transporter = createTransport({
    service: "gmail",
    auth: {
      user: "xpressbeautysupplier@gmail.com",
      pass: "iljmmriysldnignu",
    },
  });
  const mailOptions = {
    from: "xpressbeautysupplier@gmail.com",
    to: email,
    subject: "Thank you for your order",
    html: `<div style="text-align: center;">
                        <p style="font-weight: bold; color: red;">Hi ${name}</p>
                            <p style="font-weight: bold;">Thank you for your order. We will contact you shortly.</p>
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
