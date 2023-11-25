import type { RequestHandler } from "@builder.io/qwik-city";
import { JWT } from "google-auth-library";
import { google } from "googleapis";
import { connect } from "~/express/db.connection";
import { GoogleSpreadsheet } from "google-spreadsheet";

export const onGet: RequestHandler = async ({ json }) => {
  await connect();
  const merchantId = "5086882223"; // Replace with your merchant ID

  const auth = new JWT({
    email: import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "",
    key: import.meta.env.VITE_GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n") ?? "",
    scopes: [
      "https://www.googleapis.com/auth/content",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  });

  const doc = new GoogleSpreadsheet(
    "1315PBG49Tduql9s-pV2IIL_NKa1V6tbuUq9FrYOGCBY",
    auth
  );
  await doc.loadInfo(); // loads document properties and worksheets
  // get product row by name from spreadsheet
  const sheet = doc.sheetsByIndex[0];

  const rows = await sheet.getRows();
  const headers = sheet.headerValues;
  const jsonRows = rows.map((row: any) => {
    const jsonRow: any = {};
    headers.forEach((header, index: number) => {
      jsonRow[header] = row._rawData[index];
    });
    return jsonRow;
  });

  for (let i = 0; i < jsonRows.length; i++) {
    // check if product has number in title
    if (!/\d/.test(jsonRows[i].title)) {
      continue;
    }
    try {
      const content = google.content({
        version: "v2.1",
        auth: auth,
      });
      const request = await content.products.update({
        merchantId: merchantId,
        productId: `online:en:VI:${jsonRows[i].id}` ?? "",
        requestBody: {
          //   offerId: jsonRows[i].id ?? "",
          link: `https://xpressbeauty.ca/products/${encodeURIComponent(
            jsonRows[i].title
              ?.replace(/[^a-zA-Z0-9 ]/g, "") // Exclude numbers from removal
              .replace(/ /g, "-")
              .toLowerCase() ?? ""
          )}/`,
        },
      });
      console.log(request.data);
    } catch (error: any) {
      console.log(error);
    }
  }
  json(200, { message: "success" });
};
