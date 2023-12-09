import type { RequestHandler } from "@builder.io/qwik-city";
import { connect } from "~/express/db.connection";
import productSchema from "~/express/schemas/product.schema";

export const onGet: RequestHandler = async ({ json }) => {
  await connect();
  const products = await productSchema.find({}).lean();
  for (const product of products) {
    if (product.variations.length > 0) {
      product.variations.forEach((variation) => {
        if (variation.price) {
          variation.price = variation.price.toString().replace("$", "");
        }
      });
    }
    const updatedProduct = await productSchema.findByIdAndUpdate(
      product._id,
      product
    );
    console.log(updatedProduct);
  }
  json(200, { message: "Hello World!" });
};
