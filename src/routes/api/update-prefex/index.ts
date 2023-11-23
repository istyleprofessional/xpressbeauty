import type { RequestHandler } from "@builder.io/qwik-city";
import { connect } from "~/express/db.connection";
import productSchema from "~/express/schemas/product.schema";

export const onGet: RequestHandler = async ({ json }) => {
  await connect();
  const products = await productSchema.find();
  for (const product of products) {
    product.perfix = encodeURIComponent(
      product?.product_name
        ?.replace(/[^a-zA-Z0-9 ]/g, "") // Exclude numbers from removal
        .replace(/ /g, "-")
        .toLowerCase() ?? ""
    );
    await product.save();
  }
  json(200, "success");
};
