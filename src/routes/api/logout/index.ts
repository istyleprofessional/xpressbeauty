import type { RequestHandler } from "@builder.io/qwik-city";

export const onGet: RequestHandler = async ({ cookie, json }) => {
  try {
    cookie.set("verified", "false", { httpOnly: true, secure: true });
    cookie.set("token", "", { httpOnly: true, secure: true });
    cookie.set("browserId", "", { httpOnly: true, secure: true });
    json(200, { status: "success" });
  } catch (e: any) {
    json(500, { status: e.message });
  }
};
