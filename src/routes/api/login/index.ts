import type { RequestHandler } from "@builder.io/qwik-city";
import { userLogin } from "~/express/services/user.service";
import jwt from "jsonwebtoken";

export const onPost: RequestHandler = async ({ parseBody, json, cookie }) => {
  const data: any = await parseBody();
  const verifyUser = await userLogin(data);
  if (verifyUser.status === "success") {
    const token = jwt.sign(
      { user_id: verifyUser?.result?._id, isDummy: false },
      process.env.JWTSECRET ?? "",
      { expiresIn: "2h" }
    );
    cookie.set("token", token, { httpOnly: true, path: "/" });
    json(200, { status: "success" });
  } else {
    json(200, { status: "failed" });
  }
};
