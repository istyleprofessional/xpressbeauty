import type { RequestHandler } from "@builder.io/qwik-city";
import fs from "fs";
import productSchema from "~/express/schemas/product.schema";

export const onGet: RequestHandler = async ({ json }) => {
  const products = await productSchema.find({}).lean().exec();
  const finalProductArray: any[] = [];
  products.forEach((product: any) => {
    if ((product?.variations?.length ?? 0) > 0) {
      product?.variations?.forEach((variation: any) => {
        finalProductArray.push({
          ID: `${product._id}-${variation.variation_id}`,
          Title: `${product.product_name}-${variation.variation_name}`,
          Description: product.description?.replace(/<[^>]*>?/gm, ""),
          Price: variation.price,
          Condition: "new",
          Link: `https://xpressbeauty/products/${encodeURIComponent(
            product.product_name
              ?.replace(/[^a-zA-Z ]/g, "")
              .replace(/ /g, "-")
              .toLowerCase() ?? ""
          )}`,
          Availability:
            parseInt(variation?.quantity_on_hand?.toString() ?? "0") > 0
              ? "in_stock"
              : "out_of_stock",
          image: product.imgs[0],
        });
      });
    } else {
      finalProductArray.push({
        ID: product._id,
        Title: product.product_name,
        Description: product.description?.replace(/<[^>]*>?/gm, ""),
        Price: product.price.regular,
        Condition: "new",
        Link: `https://xpressbeauty/products/${encodeURIComponent(
          product.product_name
            ?.replace(/[^a-zA-Z ]/g, "")
            .replace(/ /g, "-")
            .toLowerCase() ?? ""
        )}`,
        Availability:
          parseInt(product?.quantity_on_hand?.toString() ?? "0") > 0
            ? "in_stock"
            : "out_of_stock",
        image: product.imgs[0],
      });
    }
  });

  const headers =
    "ID, Title, Description, Price, Condition, Link, Availability, Image link";
  const csv = finalProductArray.map((row) =>
    Object.values(row)
      .map((val) => `"${val}"`)
      .join(",")
  );
  csv.unshift(headers);
  const csvContent = csv.join("\n");
  fs.writeFileSync("products.csv", csvContent);
  json(200, { message: "Products exported" });
  return;
};
