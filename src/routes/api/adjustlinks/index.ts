import type { RequestHandler } from "@builder.io/qwik-city";
import { connect } from "~/express/db.connection";
import productSchema from "~/express/schemas/product.schema";

export const onGet: RequestHandler = async ({ json }) => {
  await connect();
  const products = await productSchema.find({});
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    product.oldPerfix = `${encodeURIComponent(
      product.product_name
        ?.replace(/[^a-zA-Z0-9 ]/g, "") // Exclude numbers from removal
        .replace(/ /g, "-")
        .toLowerCase() ?? ""
    )}`;
    const update = await productSchema.updateOne(
      { _id: product._id },
      { $set: { oldPerfix: product.oldPerfix } },
      { new: true }
    );
    console.log(update);
  }
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    product.perfix = `${encodeURIComponent(
      product.product_name
        ?.replace(/[^a-zA-Z0-9 ]/g, "") // Exclude numbers from removal
        .replace(/ /g, "-")
        .toLowerCase() ?? ""
    )}-pid-${product._id}`;
    const update = await productSchema.updateOne(
      { _id: product._id },
      { $set: { perfix: product.oldPerfix } },
      { new: true }
    );
    console.log(update);
  }
  json(200, { message: "done" });
};
