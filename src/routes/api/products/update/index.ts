import type { RequestHandler } from "@builder.io/qwik-city";
import { update_hair_product_service } from "~/express/services/product.service";

export const onPut: RequestHandler = async ({ json, parseBody, env }) => {
  const body: any = await parseBody();
  if (!body) {
    json(200, { status: "failed", result: "Something went wrong" });
    return;
  }
  if (!body.secret) {
    json(200, { status: "failed", result: "Something went wrong" });
    return;
  }

  if (body.secret !== env.get("VITE_SECRET")) {
    json(200, { status: "failed", result: "Something went wrong" });
    return;
  }
  const { product } = body;
  const req = await update_hair_product_service(product);
  if (req.status === "success") {
    json(200, { status: "success", result: req.result });
    return;
  }
  json(200, { status: "failed", result: req.result });
};
