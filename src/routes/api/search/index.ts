import type { RequestHandler } from "@builder.io/qwik-city";
import { getSearchResults } from "~/express/services/product.service";

export const onGet: RequestHandler = async ({ url, json }) => {
  const query = url.searchParams.get("query");
  const results = await getSearchResults(query ?? "");
  json(200, results);
};
