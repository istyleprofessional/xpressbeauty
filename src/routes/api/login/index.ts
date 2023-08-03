import type { RequestHandler } from "@builder.io/qwik-city";
import { userLogin } from "~/express/services/user.service";

export const onPost: RequestHandler = async ({ parseBody, json, cookie }) => {
  const data: any = await parseBody();
  const browserId = cookie.get("browserId")?.value;
  if (typeof browserId !== "undefined") {
    data.browserId = browserId;
  }
  const verifyUser = await userLogin(data);
  if (verifyUser.status === "success") {
    cookie.set("verified", "true", { httpOnly: true, path: "/", secure: true });
    cookie.set("token", verifyUser?.token ?? "", {
      httpOnly: true,
      path: "/",
      secure: true,
    });
    cookie.set("browserId", verifyUser?.result?.browserId ?? "", {
      httpOnly: true,
      path: "/",
      secure: true,
    });
    json(200, { status: "success" });
  } else {
    json(200, { status: "failed" });
  }
};
