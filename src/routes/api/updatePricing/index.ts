// import type { RequestHandler } from "@builder.io/qwik-city";
// import productSchema from "~/express/schemas/product.schema";
// import { update_hair_product_service } from "~/express/services/product.service";

// export const onPut: RequestHandler = async ({ json, parseBody }) => {
//   const body: any = await parseBody();
//   if (!body) {
//     json(200, { status: "failed", result: "Something went wrong" });
//     return;
//   }
//   if (!body.secret) {
//     json(200, { status: "failed", result: "Something went wrong" });
//     return;
//   }
//   if (body.secret !== import.meta.env.VITE_SECRET) {
//     json(200, { status: "failed", result: "Something went wrong" });
//     return;
//   }
//   const { product_name, quantity, variation_id, isVariation } = body;
//   const req = await productSchema.findOneAndUpdate({product_name: product_name}, )
//   json(200, { status: "failed", result: req.result });
// };
