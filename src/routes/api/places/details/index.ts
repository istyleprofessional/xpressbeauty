import type { RequestHandler } from "@builder.io/qwik-city";

export const onGet: RequestHandler = async ({ url, json }) => {
  const place_id = url.searchParams.get("place_id");
  const apikey = "AIzaSyCaw8TltqjUfM0QyLnGGo8sQzRI8NtHqus";
  const urls = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&key=${apikey}`;
  const response = await fetch(urls);
  const data = await response.json();
  json(200, data);
};
