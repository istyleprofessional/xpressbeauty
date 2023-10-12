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
          id: `${product._id}-${variation.variation_id}`,
          title: `${product.product_name}-${variation.variation_name}`,
          description: product.description?.replace(/<[^>]*>?/gm, ""),
          availability:
            parseInt(variation?.quantity_on_hand?.toString() ?? "0") > 0
              ? "in_stock"
              : "out_of_stock",
          link: `https://xpressbeauty/products/${encodeURIComponent(
            product.product_name
              ?.replace(/[^a-zA-Z ]/g, "")
              .replace(/ /g, "-")
              .toLowerCase() ?? ""
          )}`,
          image_link: product.imgs[0],
          price: variation.price,
          identifier_exists: "no",
          brand: product.companyName,
          condition: "new",
        });
      });
    } else {
      finalProductArray.push({
        id: product._id,
        title: product.product_name,
        description: product.description?.replace(/<[^>]*>?/gm, ""),
        availability:
          parseInt(product?.quantity_on_hand?.toString() ?? "0") > 0
            ? "in_stock"
            : "out_of_stock",
        link: `https://xpressbeauty/products/${encodeURIComponent(
          product.product_name
            ?.replace(/[^a-zA-Z ]/g, "")
            .replace(/ /g, "-")
            .toLowerCase() ?? ""
        )}`,
        image_link: product.imgs[0],
        price: product.price.regular,
        identifier_exists: "no",
        brand: product.companyName,
        condition: "new",
      });
    }
  });

  const headers =
    "id, title, description, availability, link, image_link, price, identifier_exists, brand, condition ";
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
