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
  const rows = await sheet.getRows();
  for (const row of rows) {
    if (row.toObject().gtin !== "") {
      const product = await productSchema.findOneAndUpdate(
        { _id: row.toObject().id },
        { gtin: row.toObject().gtin },
        { new: true }
      );
      console.log(product);
    }
  }
  json(200, { message: "done" });
};
