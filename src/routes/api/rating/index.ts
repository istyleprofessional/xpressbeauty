import type { RequestHandler } from "@builder.io/qwik-city";
import jwt from "jsonwebtoken";
import {
  getRatingByProductId,
  updateProductReviews,
} from "~/express/services/rating.reviews.service";

export const onPost: RequestHandler = async ({
  cookie,
  parseBody,
  json,
  env,
}) => {
  const token = cookie.get("token")?.value;
  const body = await parseBody();
  // const secret_key = env.get("VITE_RECAPTCHA_SECRET_KEY") ?? "";
  // const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${
  //   (body as any)?.recaptcha
  // }`;
  // const recaptcha = await fetch(url, { method: "post" });
  // const recaptchaText = await recaptcha.text();
  // const google_response = JSON.parse(recaptchaText);
  // if (!google_response.success) {
  //   json(200, { status: "failed", message: "Boot detected" });
  //   return;
  // }
  console.log("body", token);
  if (!token) {
    json(200, { status: "failed", message: "Unauthorized" });
    return;
  }
  try {
    const verify: any = jwt.verify(token, env.get("VITE_JWTSECRET") ?? "");
    console.log("verify", verify);
    if (verify && !verify?.isDummy) {
      const request = await updateProductReviews(body);
      if (request.status === "success") {
        json(200, {
          status: "success",
          message: "Rating updated successfully",
          result: request.result,
        });
        return;
      } else {
        json(200, { status: "failed", message: "Something went wrong" });
        return;
      }
    } else {
      json(200, { status: "failed", message: "Unauthorized" });
      return;
    }
  } catch (err: any) {
    if (err.message === "jwt expired") {
      const decode: any = jwt.decode(token);
      if (decode && !decode?.isDummy) {
        const newToken = jwt.sign(
          { user_id: decode?.user_id, isDummy: decode?.isDummy },
          env.get("VITE_JWTSECRET") ?? "",
          { expiresIn: "2h" }
        );
        cookie.set("token", newToken, {
          httpOnly: true,
          path: "/",
        });
        const request = await updateProductReviews(body);
        if (request.status === "success") {
          json(200, {
            status: "success",
            message: "Rating updated successfully",
          });
          return;
        }
      } else {
        json(200, { status: "failed", message: "Unauthorized" });
        return;
      }
    } else {
      json(200, { status: "failed", message: "Unauthorized" });
      return;
    }
  }
  json(200, { status: "failed", message: "Something went wrong" });
  return;
};

export const onGet: RequestHandler = async ({ cookie, url, json, env }) => {
  const productId = url.searchParams.get("id");
  const token = cookie.get("token")?.value;
  if (!token) {
    json(200, { status: "failed", message: "Unauthorized" });
    return;
  }
  try {
    const request = await getRatingByProductId(productId ?? "");
    if (request.status === "success") {
      json(200, {
        status: "success",
        message: "Rating fetched successfully",
        result: request.result,
      });
      return;
    } else {
      json(200, { status: "failed", message: "Something went wrong" });
      return;
    }
  } catch (err: any) {
    if (err.message === "jwt expired") {
      const decode: any = jwt.decode(token);
      if (decode && !decode?.isDummy) {
        const newToken = jwt.sign(
          { user_id: decode?.user_id, isDummy: decode?.isDummy },
          env.get("VITE_JWTSECRET") ?? "",
          { expiresIn: "2h" }
        );
        cookie.set("token", newToken, {
          httpOnly: true,
          path: "/",
        });
        const request = await getRatingByProductId(productId ?? "");
        if (request.status === "success") {
          json(200, {
            status: "success",
            message: "Rating fetched successfully",
            result: request.result,
          });
          return;
        }
      } else {
        json(200, { status: "failed", message: "Unauthorized" });
        return;
      }
    } else {
      json(200, { status: "failed", message: "Unauthorized" });
      return;
    }
  }
  json(200, { status: "failed", message: "Something went wrong" });
  return;
};
