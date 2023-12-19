import type { RequestHandler } from "@builder.io/qwik-city";
import { JWT } from "google-auth-library";
// import { google } from "googleapis";
import { connect } from "~/express/db.connection";
import { GoogleSpreadsheet } from "google-spreadsheet";
import productSchema from "~/express/schemas/product.schema";
// import { title } from "node:process";

export const onGet: RequestHandler = async ({ json }) => {
  await connect();
  // const merchantId = "5086882223"; // Replace with your merchant ID

  const auth = new JWT({
    email: import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "",
    key: import.meta.env.VITE_GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n") ?? "",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const doc = new GoogleSpreadsheet(
    "1S77P2yiRzHa6ThSOW-TWOG33MhU8w_I9cQZJ-iYC7to",
    auth
  );
  await doc.loadInfo(); // loads document properties and worksheets
  const productsDb = await productSchema.find();
  const sheet = doc.sheetsByIndex[0];
  for (const product of productsDb) {
    // get product row by id from spreadsheet and update in stock column
    const rows = await sheet.getRows();
    const row = rows.find((r) => r.toObject().id === product._id.toString());
    if (row) {
      row.set(
        "availability",
        parseInt(product?.quantity_on_hand?.toString() ?? "0") > 0
          ? "in_stock"
          : "out_of_stock"
      );
      row.set("price", `${product?.price?.regular} CAD` ?? "0");
      const checkIfCat = product.categories?.find(
        (cat) => cat?.name === "Trimmers" || cat?.name === "Clippers"
      );
      if (checkIfCat) {
        row.set("shipping_label", "free shipping");
      }
      await row.save();
    } else {
      const checkProductShip = product?.categories?.find(
        (cat) => cat?.main === "Tools"
      );
      const checkVariation = product?.variations?.length > 0;
      if (checkVariation) {
        for (const variant of product.variations) {
          const row = await sheet.addRow({
            id: `${product._id.toString()}-${variant?.variation_id}`,
            title: variant?.product_name ?? "",
            description: variant?.description ?? "",
            link: `https://www.qwikcity.com/product/${product.perfix}`,
            image_link: variant?.imgs[0] ?? "",
            availability:
              parseInt(variant?.quantity_on_hand?.toString() ?? "0") > 0
                ? "in_stock"
                : "out_of_stock",
            price: `${variant?.price} CAD` ?? "0",
            brand: product?.companyName?.name ?? "Qwik City",
            condition: "new",
          });
          await row.save();
        }
      } else {
        const row = await sheet.addRow({
          id: product._id.toString(),
          title: product?.product_name ?? "",
          description: product?.description ?? "",
          link: `https://www.qwikcity.com/product/${product.perfix}`,
          image_link: product?.imgs[0] ?? "",
          availability:
            parseInt(product?.quantity_on_hand?.toString() ?? "0") > 0
              ? "in_stock"
              : "out_of_stock",
          price: `${product?.price?.regular} CAD` ?? "0",
          brand: product?.companyName?.name ?? "Qwik City",
          condition: "new",
          shipping_label: checkProductShip ? "free shipping" : "",
        });
        await row.save();
      }
    }
  }

  json(200, { message: "done" });
};
