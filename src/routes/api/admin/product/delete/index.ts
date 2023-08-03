import type { RequestHandler } from "@builder.io/qwik-city";
import { connect } from "~/express/db.connection";
import { delete_item_service } from "~/express/services/product.service";

export const onDelete: RequestHandler = async ({ json, parseBody, cookie }) => {
  await connect();
  const body = await parseBody();
  const token = cookie.get("token")?.value;
  const result = await delete_item_service(body, token ?? "");
  json(200, result);
};
