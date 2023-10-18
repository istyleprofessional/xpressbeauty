import type { RequestHandler } from "@builder.io/qwik-city";

export const onPost: RequestHandler = async ({ parseBody, json }) => {
  const data: any = await parseBody();
  JSON.parse(data);
  json(200, { message: "Hello World" });
};
