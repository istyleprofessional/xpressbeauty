import type { RequestHandler } from "@builder.io/qwik-city";
import { connect } from "~/express/db.connection";
import { get_products_data } from "~/express/services/product.service";
import jwt from "jsonwebtoken";

export const onPost: RequestHandler = async ({ parseBody, json, cookie }) => {
  await connect();
  const body: any = await parseBody();
  const token = cookie.get("token")?.value;
  if (!token) {
    json(401, { message: "Unauthorized" });
    return;
  }
  try {
    const verified = jwt.verify(token, process.env.JWTSECRET ?? "");
    if (!verified) {
      json(401, { message: "Unauthorized" });
      return;
    }
    const request = await get_products_data(
      body.filterBrands,
      body.filterCategories,
      body.filterPrices,
      body.filter,
      body.page,
      body.query ?? null,
      body.sort ?? null
    );
    json(200, request);
    return;
  } catch (error: any) {
    if (error.message === "jwt expired") {
      const decoded: any = jwt.decode(token);
      const newToken = jwt.sign(
        {
          user_id: decoded?.user_id ?? "",
          isDummy: decoded?.isDummy ?? false,
          exp: Math.floor(Date.now() / 1000) + 60 * 60,
        },
        process.env.JWTSECRET ?? ""
      );
      cookie.set("token", newToken, { httpOnly: true, secure: true });
      const request = await get_products_data(
        body.filterBrands,
        body.filterCategories,
        body.filter,
        body.page,
        body.query ?? null,
        body.sort ?? null
      );
      json(200, request);
      return;
    }
    json(401, { message: "Unauthorized" });
    return;
  }
};
