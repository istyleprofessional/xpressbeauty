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
  // get product row by name from spreadsheet
  const sheet = doc.sheetsByIndex[0];
  const dataToBeAdd: any[] = [];
  const productsFromDb = await productSchema.find({});
  for (let i = 0; i < productsFromDb.length; i++) {
    // check if product has number in title
    const productFromDb = productsFromDb[i];
    if (productFromDb.variation_type) {
      for (const variation of productFromDb.variations) {
        const newDate = {
          id: `${productFromDb._id}-${variation.variation_id}`,
          title: `${productFromDb.product_name}-${variation.variation_name}`,
          description: productFromDb.description,
          availability:
            parseInt(variation?.quantity_on_hand?.toString() ?? "0") > 0
              ? "in_stock"
              : "out_of_stock",
          link: `https://xpressbeauty.ca/products/${productFromDb.perfix}`,
          "image link": productFromDb.imgs[0],
          price: `${parseFloat(
            variation?.price?.toString()?.replace("$", "")
          )?.toFixed(2)} CAD`,
          identifier_exists: "no",
          brand: productFromDb.companyName.name ?? "",
          condition: "new",
        };
        dataToBeAdd.push(newDate);
      }
    }
    const newDate: any = {
      id: productFromDb._id,
      title: productFromDb.product_name,
      description: productFromDb.description,
      availability:
        parseInt(productFromDb?.quantity_on_hand ?? "0") > 0
          ? "in_stock"
          : "out_of_stock",
      link: `https://xpressbeauty.ca/products/${productFromDb.perfix}`,
      "image link": productFromDb?.imgs[0] ?? "",
      price: `${parseFloat(productFromDb?.price?.regular?.toString())?.toFixed(
        2
      )} CAD`,
      "sale price": `${(
        parseFloat(productFromDb.price?.regular?.toString()) -
        parseFloat(productFromDb.price?.regular?.toString()) * 0.2
      ).toFixed(2)} CAD`,
      "identifier exists": "no",
      brand: productFromDb.companyName.name,
      condition: "new",
    };
    dataToBeAdd.push(newDate);
  }
  // delete all rows expect header
  await sheet.clearRows();
  // add new rows
  try {
    await sheet.addRows(dataToBeAdd);
  } catch (error) {
    console.log(error);
  }

  json(200, { message: "done" });
};
