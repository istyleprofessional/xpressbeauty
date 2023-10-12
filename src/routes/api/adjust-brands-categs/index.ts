import type { RequestHandler } from "@builder.io/qwik-city";
import brandSchema from "~/express/schemas/brand.schema";
import categorySchema from "~/express/schemas/category.schema";
import productSchema from "~/express/schemas/product.schema";

export const onGet: RequestHandler = async ({ json }) => {
  const products = await productSchema.find({});
  // const categories = await categorySchema.find({});
  const brands = await brandSchema.find({});
  const categories = await categorySchema.find({});
  for (const product of products) {
    const brand = brands.find((brand) => brand.name === product.companyName);

    if (!brand) {
      continue;
    }
    product.companyName = {
      name: brand.name,
      id: brand._id,
    };
    for (const category of product.categories) {
      const cat = categories.find(
        (cat) => `${cat.main},${cat.name}` === category
      );
      if (!cat) {
        continue;
      }
      // find index of category first then replace it
      const index = product.categories.indexOf(category);
      product.categories[index] = {
        name: cat.name,
        id: cat._id,
        main: cat.main,
      };
    }

    const save = await product.save();
    console.log(save);
  }
  json(200, { status: "success" });
  return;
};
