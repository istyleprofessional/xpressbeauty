import type { RequestHandler } from "@builder.io/qwik-city";

export const onGet: RequestHandler = async ({ url, json }) => {
  const input = url.searchParams.get("input");
  const apiKey = "AIzaSyCaw8TltqjUfM0QyLnGGo8sQzRI8NtHqus";
  const components = "country:US|country:CA";
  const urls = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&key=${apiKey}&components=${components}`;
  const response = await fetch(urls);
  const data = await response.json();
  json(200, data);
};
