import type { RequestHandler } from "@builder.io/qwik-city";

export const onGet: RequestHandler = async ({ cookie, json }) => {
  try {
    cookie.set("verified", "false", { httpOnly: true, path: "/" });
    cookie.set("token", "", { httpOnly: true, path: "/" });
    cookie.set("browserId", "", { httpOnly: true, path: "/" });
    json(200, { status: "success" });
  } catch (e: any) {
    json(500, { status: e.message });
  }
};
