import type { RequestHandler } from "@builder.io/qwik-city";
import { JWT } from "google-auth-library";
// import { google } from "googleapis";
import { connect } from "~/express/db.connection";
import { GoogleSpreadsheet } from "google-spreadsheet";
import productSchema from "~/express/schemas/product.schema";
// import { title } from "node:process";

export const onGet: RequestHandler = async ({ json }) => {
  await connect();

  const productsDb = await productSchema.find();
  const newArray: any[] = [];
  const auth = new JWT({
    email: import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "",
    key: import.meta.env.VITE_GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n") ?? "",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const doc = new GoogleSpreadsheet(
    "1S77P2yiRzHa6ThSOW-TWOG33MhU8w_I9cQZJ-iYC7to",
    auth
  );
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0]; // loads document properties and worksheets
  const rows = await sheet.getRows();
  for (const product of productsDb) {
    try {
      const checkIfCat = product.categories?.find(
        (cat) => cat?.main === "Tools"
      );
      const row = rows.find((r) => r.toObject().id === product._id.toString());
      if (row) {
        const oldRow = row.toObject();
        oldRow.availability = parseInt(
          product?.quantity_on_hand?.toString() ?? "0"
        );
        oldRow.price = `${product?.price?.regular} CAD` ?? "0";
        oldRow.shipping_label = checkIfCat ? "free shipping" : "";
        oldRow.gtin = product?.gtin !== "" ? product?.gtin : oldRow?.gtin ?? "";
        oldRow["identifier exists"] =
          product?.gtin || oldRow?.gtin ? "yes" : "no";
        newArray.push(oldRow);
      } else {
        if (product?.variations?.length > 0) {
          for (const variant of product.variations) {
            const newRow = {
              id: `${product._id.toString()}-${variant?.variation_id}`,
              title: product?.product_name ?? "",
              description: product?.description ?? "",
              link: `https://xpressbeauty.ca/product/${product.perfix}`,
              image_link: product?.imgs[0] ?? "",
              availability:
                parseInt(variant?.quantity_on_hand?.toString() ?? "0") > 0
                  ? "in_stock"
                  : "out_of_stock",
              price: `${variant?.price} CAD` ?? "0",
              brand: product?.companyName?.name ?? "Qwik City",
              condition: "new",
              gtin: product?.gtin ?? "",
              "identifier exists": product?.gtin ? "yes" : "no",
            };
            newArray.push(newRow);
          }
        } else {
          const newRow = {
            id: product._id.toString(),
            title: product?.product_name ?? "",
            description: product?.description ?? "",
            link: `https://xpressbeauty.ca/product/${product.perfix}`,
            image_link: product?.imgs[0] ?? "",
            availability:
              parseInt(product?.quantity_on_hand?.toString() ?? "0") > 0
                ? "in_stock"
                : "out_of_stock",
            price: `${product?.price?.regular} CAD` ?? "0",
            brand: product?.companyName?.name ?? "Qwik City",
            condition: "new",
            shipping_label: checkIfCat ? "free shipping" : "",
            gtin: product?.gtin ?? "",
            "identifier exists": product?.gtin ? "yes" : "no",
          };
          newArray.push(newRow);
        }
      }
    } catch (error) {
      console.log(error);
      continue;
    }
  }
  try {
    const sheet = doc.sheetsByIndex[0]; // loads document properties and worksheets
    await sheet.clear("A2:Z");
    await sheet.addRows(newArray);
  } catch (error) {
    console.log(error);
  }
  json(200, { message: "done" });
};
