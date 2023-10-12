import type { RequestHandler } from "@builder.io/qwik-city";
import { connect } from "~/express/db.connection";
import { login_service } from "~/express/services/admin.service";
// import { login_service } from "~/express/services/user.service";

export const onPost: RequestHandler = async ({ json, parseBody, cookie }) => {
  await connect();
  const body = await parseBody();
  const result = await login_service(body);
  cookie.set("token", result.token ?? "", { httpOnly: true, secure: true });
  json(200, result);
};
