import { createTransport } from "nodemailer";

export const sendShippedEmail = async (
  email: string,
  name: string,
  shipping_address: any,
  products: any[],
  trackingNumber: string,
  trackingCompanyName: string,
  trackingLink: string,
  orderNumber: string
) => {
  const transporter = createTransport({
    host: "smtp.zoho.com",
    port: 465,
    secure: true, //ssl
    auth: {
      user: import.meta.env.VITE_EMAIL ?? "",
      pass: import.meta.env.VITE_EMAIL_PASS ?? "",
    },
  });

  const mailOptions = {
    from: import.meta.env.VITE_EMAIL ?? "",
    to: email,
    subject: `Your order ${orderNumber} has been shipped!`,
    html: `<body>
    <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ccc; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <img src="cid:img2" alt="Logo" style="max-width: 100px; display: block; margin: 0 auto;">

        <h1 style="text-align: center; margin-bottom: 20px;">Order Details</h1>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
                <th style="border: 1px solid #ccc; padding: 8px;">Product Name</th>
                <th style="border: 1px solid #ccc; padding: 8px;">Qty</th>
                <th style="border: 1px solid #ccc; padding: 8px;">Price</th>
            </tr>
            ${products
              .map(
                (product) =>
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
          <h2 style="text-align: center; margin-bottom: 20px;">Shipping Address</h2>
          <p>Customer Name: ${name}</p>
          <p>Street Address: ${shipping_address?.addressLine1 ?? ""}</p>
          <p>City: ${shipping_address?.city ?? ""}</p>
          <p>Province: ${shipping_address?.state ?? ""}</p>
          <p>Postal Code: ${shipping_address?.postalCode ?? ""}</p>
          <p>Country: ${shipping_address?.country ?? ""}</p>
        </div>
        <p style="text-align: center; margin-top: 20px;">Your order has been shipped! Please find your tracking number below.</p>
        <p style="text-align: center; margin-top: 20px;">Shipping Company Name: ${trackingCompanyName}</p>
        <p style="text-align: center; margin-top: 20px;">Tracking Number: ${trackingNumber}</p>
        <p style="text-align: center; margin-top: 20px;">Tracking Link: <a href="${trackingLink}">${trackingLink}</a></p>
        <p style="text-align: center; margin-top: 20px;">Thank you for your order! Please find your order details above.</p>
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
