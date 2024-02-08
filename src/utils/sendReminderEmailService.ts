import { createTransport } from "nodemailer";
import jwt from "jsonwebtoken";

export const sendReminderEmailService = async (data: any) => {
  const { email, name, totalQuantity, products, isDummy } = data;
  const transporter = createTransport({
    host: "smtp.zoho.com",
    port: 465,
    secure: true, //ssl
    auth: {
      user: import.meta.env.VITE_EMAIL ?? "",
      pass: import.meta.env.VITE_EMAIL_PASS ?? "",
    },
  });

  const token = jwt.sign(
    { user_id: data._id, isDummy: isDummy },
    import.meta.env.VITE_JWTSECRET ?? ""
  );
  const mailOptions = {
    from: `XpressBeauty <${import.meta.env.VITE_EMAIL ?? ""}>`,
    to: email.trim(),
    subject: "Your Cart Is Missing You!",
    html: `<body>
    <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ccc; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <img src="cid:img2" alt="Logo" style="max-width: 100px; display: block; margin: 0 auto;">

        <h1 style="text-align: center; margin-bottom: 20px;">These items want to go home to you</h1>
        <p style="text-align: center; margin-bottom: 20px;">Hi ${
          name ?? "XpressBeauty User"
        }, you have ${totalQuantity} items in your cart.</p>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
                <th style="border: 1px solid #ccc; padding: 8px;">Product Name</th>
                <th style="border: 1px solid #ccc; padding: 8px;">Qty</th>
                <th style="border: 1px solid #ccc; padding: 8px;">Price</th>
            </tr>
            ${products
              .map(
                (product: any) =>
                  `
               <tr>
                <td style="border: 1px solid #ccc; padding: 8px;">${product.product_name}</td>
                <td style="border: 1px solid #ccc; padding: 8px;">${product.quantity}</td>
                <td style="border: 1px solid #ccc; padding: 8px;">$${product.price}</td>
                </tr>
                `
              )
              .join("")}
        </table>
        <div style="text-align: center;">
          <a href="https://xpressbeauty.ca/cart?token=${token}" style="display: inline-block; text-decoration: none; background-color: #000; color: #fff; padding: 10px 20px; border-radius: 5px;">Go To Cart</a>
        </div>
        <div style="text-align: center; padding-top: 20px; color: #777777;">
            <p>If you have any questions, please contact us at <a href="mailto:info@xpressbeauty.ca">info@xpressbeauty.ca</a>.</p>
        </div>
        <div style="text-align: center; padding-top: 20px; color: #777777;">
            <p>Thank you for shopping with us!</p>
        </div>
    </div>
</body>`,
    attachments: [
      {
        filename: "logoX2.jpg",
        path: `${process.cwd()}/public/logoX2.jpg`,
        cid: "img2",
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
