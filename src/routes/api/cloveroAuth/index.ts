import type { RequestHandler } from "@builder.io/qwik-city";

export const onGet: RequestHandler = async ({ query, redirect }) => {
  const authorizationCode = query.get("code");
  console.log("authorizationCode", authorizationCode);
  throw redirect(301, `/payment/pay/${authorizationCode}`);
};
