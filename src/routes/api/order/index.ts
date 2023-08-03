import type { RequestHandler } from "@builder.io/qwik-city";

export const onPost: RequestHandler = async ({ parseBody, json }) => {
  const data: any = await parseBody();
  const jsonBody = JSON.parse(data);
  console.log(jsonBody);
  json(200, { message: "Hello World" });
};
