import type { RequestHandler } from "@builder.io/qwik-city";
import { connect } from "~/express/db.connection";
import {
  deleteProductCart,
  handleDecIncVariationProducts,
  updateUserCart,
} from "~/express/services/cart.service";
import { getDummyCustomer } from "~/express/services/dummy.user.service";
import { findUserByUserId } from "~/express/services/user.service";
import jwt from "jsonwebtoken";

export const onPost: RequestHandler = async ({ parseBody, cookie, json }) => {
  await connect();
  const data: any = await parseBody();
  const jsonData = JSON.parse(data);
  const token = cookie.get("token")?.value;
  let user: any;
  if (token) {
    try {
      const decoded: any = jwt.verify(
        token,
        import.meta.env.VITE_JWTSECRET ?? ""
      );
      if (decoded.isDummy) {
        user = await getDummyCustomer(decoded.user_id);
        jsonData.userId = user?.result?._id.toString();
        const result = await updateUserCart(jsonData);
        json(200, result);
      } else {
        user = await findUserByUserId(decoded.user_id);
        jsonData.userId = user?.result?._id.toString();
        const result = await updateUserCart(jsonData);
        json(200, result);
      }
    } catch (error: any) {
      if (error.message === "jwt expired") {
        const decode: any = jwt.decode(token);
        const newToken = jwt.sign(
          { user_id: decode.user_id, isDummy: decode.isDummy },
          import.meta.env.VITE_JWTSECRET ?? "",
          { expiresIn: "2h" }
        );
        cookie.set("token", newToken, { httpOnly: true, path: "/" });
        if (decode?.isDummy) {
          user = await getDummyCustomer(decode.user_id);
          jsonData.userId = user?.result?._id.toString();
          const result = await updateUserCart(jsonData);
          json(200, result);
        } else {
          user = await findUserByUserId(decode.user_id);
          jsonData.userId = user?.result?._id.toString();
          const result = await updateUserCart(jsonData);
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

export const onDelete: RequestHandler = async ({ parseBody, cookie, json }) => {
  await connect();
  const data: any = await parseBody();
  const jsonData = JSON.parse(data);
  const token = cookie.get("token")?.value;
  let user: any;
  if (token) {
    try {
      const decoded: any = jwt.verify(
        token,
        import.meta.env.VITE_JWTSECRET ?? ""
      );
      if (decoded.isDummy) {
        user = await getDummyCustomer(decoded.user_id);
        jsonData.userId = user?.result?._id.toString();
        const result = await deleteProductCart(jsonData);
        json(200, result);
      } else {
        user = await findUserByUserId(decoded.user_id);
        jsonData.userId = user?.result?._id.toString();
        const result = await deleteProductCart(jsonData);
        json(200, result);
      }
    } catch (error: any) {
      if (error.message === "jwt expired") {
        const decode: any = jwt.decode(token);
        const newToken = jwt.sign(
          { user_id: decode.user_id, isDummy: decode.isDummy },
          import.meta.env.VITE_JWTSECRET ?? "",
          { expiresIn: "2h" }
        );
        cookie.set("token", newToken, { httpOnly: true, path: "/" });
        if (decode?.isDummy) {
          user = await getDummyCustomer(decode.user_id);
          jsonData.userId = user?.result?._id.toString();
          const result = await deleteProductCart(jsonData);
          json(200, result);
        } else {
          user = await findUserByUserId(decode.user_id);
          jsonData.userId = user?.result?._id.toString();
          const result = await deleteProductCart(jsonData);
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

export const onPut: RequestHandler = async ({ parseBody, cookie, json }) => {
  await connect();
  const data: any = await parseBody();
  const jsonData = JSON.parse(data);
  const token = cookie.get("token")?.value;
  let user: any;
  if (token) {
    try {
      const decoded: any = jwt.verify(
        token,
        import.meta.env.VITE_JWTSECRET ?? ""
      );
      if (decoded.isDummy) {
        user = await getDummyCustomer(decoded.user_id);
        jsonData.userId = user?.result?._id.toString();
        const result = await handleDecIncVariationProducts(jsonData);
        json(200, result);
      } else {
        user = await findUserByUserId(decoded.user_id);
        jsonData.userId = user?.result?._id.toString();
        const result = await handleDecIncVariationProducts(jsonData);
        json(200, result);
      }
    } catch (error: any) {
      if (error.message === "jwt expired") {
        const decode: any = jwt.decode(token);
        const newToken = jwt.sign(
          { user_id: decode.user_id, isDummy: decode.isDummy },
          import.meta.env.VITE_JWTSECRET ?? "",
          { expiresIn: "2h" }
        );
        cookie.set("token", newToken, { httpOnly: true, path: "/" });
        if (decode?.isDummy) {
          user = await getDummyCustomer(decode.user_id);
          jsonData.userId = user?.result?._id.toString();
          const result = await handleDecIncVariationProducts(jsonData);
          json(200, result);
        } else {
          user = await findUserByUserId(decode.user_id);
          jsonData.userId = user?.result?._id.toString();
          const result = await handleDecIncVariationProducts(jsonData);
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
