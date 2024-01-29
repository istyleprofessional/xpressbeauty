import type { RequestHandler } from "@builder.io/qwik-city";
import productSchema from "~/express/schemas/product.schema";

export const onPost: RequestHandler = async ({ parseBody, json }) => {
  const secretToBeChecked = "myTotallySecretKey";

  const data = (await parseBody()) as any;
  const { products, secret } = data;
  if (secret !== secretToBeChecked) {
    json(401, { success: false, message: "Unauthorized" });
    return;
  }
  console.log("products", products);
  for (const product of products) {

    await productSchema.findOneAndUpdate(
      { gtin: product.upc },
      {
        product_name: product.product_name,
        description: product.description,
        companyName: { name: product.brand },
        price: { regular: product.price },
        categories: product.category,
        quantity_on_hand: product.quantity_on_hand,
        imgs: product.imgs,
        gtin: product.upc,
        priceType: product.priceType,
        status: "NORMAL",
        isHidden: false,
      },
      { upsert: true, new: true }
    );
  }
  json(200, { success: true });
};
