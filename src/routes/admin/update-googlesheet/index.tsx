import { component$, useSignal } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import Product from "~/express/schemas/product.schema";
import { connect } from "~/express/db.connection";

export const updateGoogleSheet = server$(async function () {
  await connect();

  const productsDb = await Product.find({
    isHidden: { $ne: true },
  });
  const newArray = [];
  const auth = new JWT({
    email: this.env.get("VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL") ?? "",
    key: this.env.get("VITE_GOOGLE_PRIVATE_KEY")?.replace(/\\n/g, "\n") ?? "",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const doc = new GoogleSpreadsheet(
    "1-gVe8XDYbKNZizvXyZCp6GUpwIbDNqMUdGsJgY_FmjI",
    auth
  );
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0]; // loads document properties and worksheets
  const rows = await sheet.getRows();
  for (const product of productsDb) {
    try {
      const row = rows.find((r) => r.toObject().id === product._id.toString());
      if (product?.variations?.length > 0) {
        for (const variant of product.variations) {
          const newRow: any = {
            id: `${product._id.toString()}-${variant?.variation_id}`,
            title: `${
              product.product_name?.includes("CR")
                ? product.product_name?.replace(/CR.*/, "")
                : product.product_name ?? ""
            } - ${variant?.variation_name}`,
            description: product?.description ?? "",
            link: `https://xpressbeauty.ca/products/${product.perfix}`,
            "image link": product?.imgs[0].includes("http")
              ? product?.imgs[0]
              : `https://xpressbeauty.ca${product?.imgs[0].replace(".", "")}`,

            availability:
              parseInt(variant?.quantity_on_hand?.toString() ?? "0") > 0
                ? "in_stock"
                : "out_of_stock",
            price: `${variant?.price} CAD` ?? "0",
            brand: product?.companyName?.name ?? "Qwik City",
            condition: "new",
            gtin: variant?.upc ?? "",
            "identifier exists": variant?.upc ? "yes" : "no",
          };
          if (variant.variation_image) {
            if (product?.variation_type === "Color") {
              const src = product?.product_name?.replace(/[^A-Za-z0-9]+/g, "");
              const folder = `https://xpressbeauty.s3.ca-central-1.amazonaws.com/products-images-2/${src}/variation/variation-image-${
                // index of the variation
                product?.variations?.indexOf(variant)
              }.webp`;
              newRow["additional image link"] = folder;
            } else {
              newRow["additional image link"] = variant?.variation_image;
            }
          }
          newArray.push(newRow);
        }
      } else {
        if (row) {
          const oldRow = row.toObject();
          oldRow.availability = parseInt(
            product?.quantity_on_hand?.toString() ?? "0"
          );
          oldRow.title = oldRow.title?.includes("CR")
            ? oldRow.title?.replace(/CR.*/, "")
            : oldRow.title ?? "";
          oldRow.price = `${product?.price?.regular} CAD` ?? "0";
          oldRow.shipping_label = "";
          oldRow.gtin =
            product?.gtin !== "" ? product?.gtin : oldRow?.gtin ?? "";
          oldRow["identifier exists"] =
            product?.gtin || oldRow?.gtin ? "yes" : "no";
          oldRow.availability =
            parseInt(product?.quantity_on_hand?.toString() ?? "0") > 0
              ? "in_stock"
              : "out_of_stock";
          oldRow.link = `https://xpressbeauty.ca/products/${product.perfix}`;
          newArray.push(oldRow);
        } else {
          const newRow = {
            id: product._id.toString(),
            title: product.product_name?.includes("CR")
              ? product.product_name?.replace(/CR.*/, "")
              : product.product_name ?? "",
            description: product?.description ?? "",
            link: `https://xpressbeauty.ca/products/${product.perfix}`,
            "image link": product?.imgs[0].includes("http")
              ? product?.imgs[0]
              : `https://xpressbeauty.ca${product?.imgs[0].replace(".", "")}`,
            availability:
              parseInt(product?.quantity_on_hand?.toString() ?? "0") > 0
                ? "in_stock"
                : "out_of_stock",
            price: `${product?.price?.regular} CAD` ?? "0",
            brand: product?.companyName?.name ?? "Qwik City",
            condition: "new",
            shipping_label: "",
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
    // loads document properties and worksheets
    const auth1 = new JWT({
      email: this.env.get("VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL") ?? "",
      key: this.env.get("VITE_GOOGLE_PRIVATE_KEY")?.replace(/\\n/g, "\n") ?? "",
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const doc1 = new GoogleSpreadsheet(
      "1-gVe8XDYbKNZizvXyZCp6GUpwIbDNqMUdGsJgY_FmjI",
      auth1
    );
    await doc1.loadInfo();
    const sheet1 = doc.sheetsByIndex[0]; // loads document properties and worksheets
    await sheet1.clear("A2:Z");
    await sheet1.addRows(newArray);
    return JSON.stringify({
      status: "success",
      message: "Google Sheet Updated Successfully",
    });
  } catch (error: any) {
    return JSON.stringify({
      status: "error",
      message: `Google Sheet Update Failed ${error.message}`,
    });
  }
});

export default component$(() => {
  const isLoading = useSignal<boolean>(false);
  return (
    <div class="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1>Update Google Sheet</h1>
      {isLoading.value && (
        <div role="status">
          <svg
            aria-hidden="true"
            class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span class="sr-only">Loading...</span>
        </div>
      )}
      <button
        disabled={isLoading.value}
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick$={async () => {
          isLoading.value = true;
          const update = await updateGoogleSheet();
          if (update) {
            alert("Google Sheet Updated Successfully");
          } else {
            alert("Google Sheet Update Failed");
          }
          isLoading.value = false;
        }}
      >
        Update Google Sheet
      </button>
    </div>
  );
});
