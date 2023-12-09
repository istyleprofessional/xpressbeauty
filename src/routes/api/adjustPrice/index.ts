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
    } else {
      if (product.priceType === "range") {
        product.price.min = product.price.min.toString().replace("$", "");
        product.price.max = product.price.max.toString().replace("$", "");
        product.sale_price.min = product.sale_price.min
          .toString()
          .replace("$", "");
        product.sale_price.max = product.sale_price.max
          .toString()
          .replace("$", "");
      } else {
        product.price.regular = product.price.regular
          .toString()
          .replace("$", "");
        product.price.sale = product.price.sale.toString().replace("$", "");
      }
    }
    const updatedProduct = await productSchema.findByIdAndUpdate(
      product._id,
      product
    );
    console.log(updatedProduct);
  }
  json(200, { message: "Hello World!" });
};
