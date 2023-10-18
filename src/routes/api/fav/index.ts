import type { RequestHandler } from "@builder.io/qwik-city";
import jwt from "jsonwebtoken";
import { addToWishList } from "~/express/services/wishList.service";

export const onPost: RequestHandler = async ({
  json,
  cookie,
  parseBody,
  env,
}) => {
  const body: any = await parseBody();
  const token = cookie.get("token")?.value;
  if (!token) {
    json(200, { status: "failed", data: "Please login first" });
    return;
  }
  try {
    const verified: any = jwt.verify(
      token ?? "",
      env.get("VITE_JWTSECRET") || ""
    );
    if (!verified) {
      json(200, { status: "failed", data: "Please login first" });
      return;
    }
    const data = {
      userId: verified.user_id,
      product: JSON.parse(body).product,
    };
    const req = await addToWishList(data);
    if (req.status === "success") {
      json(200, { status: "success", data: req.data });
      return;
    }
    json(200, { status: "failed", data: req.data });
    return;
  } catch (error: any) {
    if (error.message === "jwt expired") {
      const decoded: any = jwt.decode(token);
      const newToken = jwt.sign(
        { userId: decoded.userId, isDummy: decoded.isDummy },
        env.get("VITE_JWTSECRET") || "",
        { expiresIn: "1d" }
      );
      cookie.set("token", newToken, {
        httpOnly: true,
        path: "/",
      });
      const data = {
        userId: decoded.userId,
        product: body.product,
      };
      const req = await addToWishList(data);
      if (req.status === "success") {
        json(200, { status: "success", data: "Added to wish list" });
        return;
      }
      json(200, { status: "failed", data: "Something went wrong" });
      return;
    }
    json(200, { status: "failed", data: error.message });
    return;
  }
};
