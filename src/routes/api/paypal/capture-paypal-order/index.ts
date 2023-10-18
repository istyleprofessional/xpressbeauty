import type { RequestHandler } from "@builder.io/qwik-city";
import { deleteCart } from "~/express/services/cart.service";
import { createOrder } from "~/express/services/order.service";
import { capturePayment } from "~/utils/paypal-capture-payment";
import jwt from "jsonwebtoken";

export const onPost: RequestHandler = async ({
  parseBody,
  json,
  cookie,
  env,
}) => {
  const paypalMode = env.get("VITE_PAYPAL_MODE") ?? "";
  const token = cookie.get("token")?.value;
  if (!token) {
    json(401, { status: "failed" });
    return;
  }
  let baseURL: string;
  const data: any = await parseBody();
  const jsonBody = JSON.parse(data);
  try {
    const verify: any = jwt.verify(token, env.get("VITE_JWTSECRET") ?? "");
    if (!verify) {
      json(401, { status: "failed" });
      return;
    }
    if (paypalMode === "sandbox") {
      baseURL = env.get("VITE_PAYPAL_SANDBOX_URL") ?? "";
    } else {
      baseURL = env.get("VITE_PAYPAL_LIVE_URL") ?? "";
    }
    const captureData = await capturePayment(jsonBody.orderID, baseURL);
    const dataToBeSent = {
      order_id: captureData.id,
      order_status: captureData.status,
      order_amount:
        captureData.purchase_units[0].payments.captures[0].amount.value,
      paymentMethod: "PayPal",
      shipping_address: captureData.purchase_units[0].shipping.address,
      shipping_name: captureData.purchase_units[0].shipping.name.full_name,
      totalQuantity: jsonBody.cartContext.cart.totalQuantity,
      products: jsonBody.cartContext.cart.products,
      userId: verify?.user_id,
    };
    const order: any = await createOrder(dataToBeSent);
    if (order.status === "success") {
      await deleteCart(verify?.user_id);
      json(200, { status: "success" });
      return;
    } else {
      json(400, { status: "failed" });
      return;
    }
  } catch (error: any) {
    if (error.message === "jwt expired") {
      const decode: any = jwt.decode(token);
      if (decode) {
        const newJwtToken = jwt.sign(
          { user_id: decode.user_id, isDummy: decode.isDummy },
          env.get("VITE_JWTSECRET") ?? "",
          { expiresIn: "2h" }
        );
        cookie.set("token", newJwtToken, {
          httpOnly: true,
          path: "/",
        });
        let baseURL: string;
        if (paypalMode === "sandbox") {
          baseURL = env.get("VITE_PAYPAL_SANDBOX_URL") ?? "";
        } else {
          baseURL = env.get("VITE_PAYPAL_LIVE_URL") ?? "";
        }
        const captureData = await capturePayment(jsonBody.orderID, baseURL);
        const dataToBeSent = {
          order_id: captureData.id,
          order_status: captureData.status,
          order_amount:
            captureData.purchase_units[0].payments.captures[0].amount.value,
          paymentMethod: "PayPal",
          shipping_address: captureData.purchase_units[0].shipping.address,
          shipping_name: captureData.purchase_units[0].shipping.name.full_name,
          totalQuantity: jsonBody.cartContext.cart.totalQuantity,
          products: jsonBody.cartContext.cart.products,
          userId: decode?.user_id,
        };
        const order: any = await createOrder(dataToBeSent);
        if (order.status === "success") {
          await deleteCart(decode?.user_id);
          json(200, { status: "success" });
          return;
        } else {
          json(400, { status: "failed" });
          return;
        }
      } else {
        json(400, { status: "failed" });
        return;
      }
    }
    json(400, { status: "failed" });
  }
};
