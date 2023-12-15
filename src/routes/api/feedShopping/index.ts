import type { RequestHandler } from "@builder.io/qwik-city";
import { JWT } from "google-auth-library";
// import { google } from "googleapis";
import { connect } from "~/express/db.connection";
import { GoogleSpreadsheet } from "google-spreadsheet";
import productSchema from "~/express/schemas/product.schema";
import { ObjectId } from "mongodb";
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
  console.log(doc.sheetsByTitle);
  // update in stock column in spreadsheet by product id in sheet
  try {
    for (const row of rows) {
      const id = row.toObject()?.id?.includes("-")
        ? row.toObject().id?.split("-")[0]
        : row.toObject().id?.toString();
      const productFromDb = await productSchema.findOne({
        _id: new ObjectId(id),
      });
      if (!productFromDb) continue;
      if (row.toObject()?.id?.includes("-")) {
        const variation_id = row.toObject().id.split("-")[1];
        const variation = productFromDb.variations?.find(
          (v) => v?.variation_id === variation_id
        );
        if (variation) {
          row.set(
            "availability",
            parseInt(variation?.quantity_on_hand?.toString() ?? "0") > 0
              ? "in_stock"
              : "out_of_stock"
          );
          row.set("price", `${variation?.price} CAD` ?? "0");
        }
      }
      if (
        productFromDb &&
        parseInt(productFromDb?.quantity_on_hand?.toString() ?? "0") > 0
      ) {
        row.set("availability", "in_stock");
        row.set("price", `${productFromDb?.price?.regular} CAD` ?? "0");
      } else {
        row.set("availability", "out_of_stock");
      }
      const checkIfCat = productFromDb.categories?.find(
        (cat) => cat?.name === "Trimmers" || cat?.name === "Clippers"
      );
      if (checkIfCat) {
        row.set("shipping label", "free shipping");
      }
      await row.save();
    }
  } catch (error) {
    console.log(error);
  }

  json(200, { message: "done" });
};
