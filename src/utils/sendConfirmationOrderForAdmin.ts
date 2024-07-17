import { createTransport } from "nodemailer";

export const sendConfirmationOrderForAdmin = async (
  email: string,
  name: string,
  phone: string,
  shipping_address: any,
  products: any[],
  totalInfo: {
    shipping: number;
    tax: number;
    finalTotal: number;
    currency: string;
    shippingTax: number;
    amountDiscount: number;
  },
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
  const shipping = totalInfo?.shipping ?? 0;
  const tax = totalInfo?.tax ?? 0;
  const shippingTax = totalInfo?.shippingTax ?? 0;
  const finalTotal = totalInfo?.finalTotal ?? 0;
  const discounts = totalInfo?.amountDiscount ?? 0;
  console.log("email", totalInfo);
  const mailOptions = {
    from: `XpressBeauty Order Confirmed <${import.meta.env.VITE_EMAIL ?? ""}>`,
    to: "isbeautysupply@gmail.com",
    subject: `New order no. ${orderNumber}`,git
    html: `<body>
    <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ccc; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <img src="cid:img2" alt="Logo" style="max-width: 100px; display: block; margin: 0 auto;">

        <h1 style="text-align: center; margin-bottom: 20px;">Order Details</h1>
        <p style="text-align: center; margin-bottom: 20px;">Order Number: <span style="font-weight: bold;"> ${orderNumber} </span> </p>
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
                <td style="border: 1px solid #ccc; padding: 8px;">${
                  product.product_name
                }</td>
                <td style="border: 1px solid #ccc; padding: 8px;">${
                  product.quantity
                }</td>
                <td style="border: 1px solid #ccc; padding: 8px;">$${parseFloat(
                  product.price
                ).toFixed(2)}</td>
                </tr>
                `
              )
              .join("")}
        </table>
        <div style="text-align: right;">
            <p>Tax: $${parseFloat(tax.toString()).toFixed(2)}</p>
            <p>Shipping: $${parseFloat(shipping.toString()).toFixed(2)}</p>
            <p>Shipping Tax: $${parseFloat(shippingTax.toString()).toFixed(
              2
            )}</p>
            ${
              discounts > 0
                ? `<p>Discount: $${parseFloat(discounts.toString()).toFixed(
                    2
                  )}</p>`
                : ""
            }
            <p>Final Total: $${parseFloat(finalTotal.toString()).toFixed(2)}</p>
        </div>
        <div style="text-align: center;">
          <h2 style="text-align: center; margin-bottom: 20px;">Shipping Address</h2>
          <p>Customer Name: ${name}</p>
          <p>Street Address: ${shipping_address?.addressLine1 ?? ""}</p>
          <p>City: ${shipping_address?.city ?? ""}</p>
          <p>Province: ${shipping_address?.state ?? ""}</p>
          <p>Postal Code: ${shipping_address?.postalCode ?? ""}</p>
          <p>Country: ${shipping_address?.country ?? ""}</p>
          <p>Phone: ${phone}</p>
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
