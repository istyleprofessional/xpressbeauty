import type { RequestHandler } from "@builder.io/qwik-city";
import { connect } from "~/express/db.connection";
import jwt from "jsonwebtoken";
import { findUserByUserId } from "~/express/services/user.service";
import { deleteProductWishlist } from "~/express/services/wishList.service";

export const onDelete: RequestHandler = async ({ parseBody, cookie, json }) => {
  await connect();
  const data: any = await parseBody();
  const jsonData = JSON.parse(data);
  const token = cookie.get("token")?.value;
  let user: any;
  if (token) {
    try {
      const decoded: any = jwt.verify(token, process.env.JWTSECRET ?? "");
      if (decoded.isDummy) {
        json(200, { status: "failed", error: "Suspicious behavior detected" });
      } else {
        user = await findUserByUserId(decoded.user_id);
        jsonData.userId = user?.result?._id.toString();
        const result = await deleteProductWishlist(jsonData);
        json(200, result);
      }
    } catch (error: any) {
      if (error.message === "jwt expired") {
        const decode: any = jwt.decode(token);
        const newToken = jwt.sign(
          { user_id: decode.user_id, isDummy: decode.isDummy },
          process.env.JWTSECRET ?? "",
          { expiresIn: "2h" }
        );
        cookie.set("token", newToken, { httpOnly: true, path: "/" });
        if (decode?.isDummy) {
          json(200, {
            status: "failed",
            error: "Suspicious behavior detected",
          });
        } else {
          user = await findUserByUserId(decode.user_id);
          jsonData.userId = user?.result?._id.toString();
          const result = await deleteProductWishlist(jsonData);
          json(200, result);
        }
      } else {
        json(200, { status: "failed", error: error.message });
      }
    }
  } else {
    json(200, { status: "failed", error: "Suspicious behavior detected" });
  }
};
