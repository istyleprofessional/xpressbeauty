import type { RequestHandler } from "@builder.io/qwik-city";

export const onGet: RequestHandler = async ({ query, redirect, url }) => {
  console.log(url);
  const authorizationCode = query.get("code");
  debugger;
  console.log("authorizationCode", authorizationCode);
  throw redirect(301, `/payment/pay/${authorizationCode}`);
};
