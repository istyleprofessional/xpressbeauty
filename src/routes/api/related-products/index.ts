import type { RequestHandler } from "@builder.io/qwik-city";
import { getRelatedProducts } from "~/express/services/product.service";

export const onGet: RequestHandler = async ({ url, json }) => {
  const category = url.searchParams.get("category");
  const productName = url.searchParams.get("productName");
  const request = await getRelatedProducts(category ?? "", productName ?? "");
  json(200, { result: request });
};
