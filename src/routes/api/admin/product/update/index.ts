import type { RequestHandler } from "@builder.io/qwik-city";
import { connect } from "~/express/db.connection";
import { update_product_service } from "~/express/services/product.service";

export const onPut: RequestHandler = async ({ json, parseBody }) => {
  await connect();
  const body = await parseBody();
  const result = await update_product_service(body);
  json(200, result);
};
