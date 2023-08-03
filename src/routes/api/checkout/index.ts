import type { RequestHandler } from "@builder.io/qwik-city";
import { update_dummy_user } from "~/express/services/dummy.user.service";

export const onPost: RequestHandler = async ({ json, parseBody, cookie }) => {
  const body = await parseBody();
  const browserId = cookie.get("browserId")?.value;
  const isVerify = cookie.get("verified")?.value;
  console.log("isVerify", typeof isVerify);
  if (isVerify === "false") {
    console.log("here");
    const request = await update_dummy_user(body, browserId ?? "");
    console.log("request", request);
  }
  console.log("body", body);
  json(200, body);
};
