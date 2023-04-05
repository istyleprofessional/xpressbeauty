import type { RequestHandler } from "@builder.io/qwik-city";
import { connect } from "~/express/db.connection";
import { hide_product_service } from "~/express/services/product.service";

export const onPut: RequestHandler = async ({ json, parseBody, request }) => {
  await connect();
  const body = await parseBody();
  const token = request.headers.get("authorization");
  const result = await hide_product_service(body, token ?? "");
  json(200, result);
};
