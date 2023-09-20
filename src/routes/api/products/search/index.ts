import type { RequestHandler } from "@builder.io/qwik-city";
import { getProductBySearch } from "~/express/services/product.service";

export const onPost: RequestHandler = async ({ parseBody, json }) => {
  const body: any = await parseBody();
  const request = await getProductBySearch(body.search, body.page);
  json(200, request);
};
