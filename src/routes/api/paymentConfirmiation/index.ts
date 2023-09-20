import type { RequestHandler } from "@builder.io/qwik-city/middleware/request-handler";
import { getDummyCustomer } from "~/express/services/dummy.user.service";
import { getUserById } from "~/express/services/user.service";
import { sendConfirmationEmail } from "~/utils/sendConfirmationEmail";
import jwt from "jsonwebtoken";
import { createOrder } from "~/express/services/order.service";
import { deleteCart } from "~/express/services/cart.service";
import { generateOrderNumber } from "~/utils/generateOrderNo";
import { sendConfirmationOrderForAdmin } from "~/utils/sendConfirmationOrderForAdmin";

export const onPost: RequestHandler = async ({ json, parseBody, cookie }) => {
  const data: any = await parseBody();
  const token = cookie.get("token")?.value;
  // console.log(data);
  if (!token) {
    json(200, { status: "failed", result: "Something went wrong" });
    return;
  }
  try {
    const verify: any = jwt.verify(token ?? "", process.env.JWTSECRET ?? "");
    if (verify.isDummy) {
      const request: any = await getDummyCustomer(verify.user_id);
      const email = request?.result?.email;
      const name = `${request?.result?.firstName} ${request?.result?.lastName}`;
      const shipping_address = request.result?.generalInfo.address;
      await sendConfirmationEmail(
        email ?? "",
        name,
        shipping_address,
        data.products
      );
      await sendConfirmationOrderForAdmin(
        name,
        shipping_address,
        data.products
      );
      data.userId = verify.user_id;
      data.shipping_address = request.result?.generalInfo.address;
      data.paymentMethod = "STRIPE";
      data.order_status = "Pending";
      data.order_number = generateOrderNumber();
      await createOrder(data);
      await deleteCart(verify.user_id);
      json(200, { status: "success" });
    } else {
      const request = await getUserById(verify.user_id);
      if (request.status === "success") {
        const email = request?.result?.email;
        const name = `${request?.result?.firstName} ${request?.result?.lastName}`;
        const shipping_address = request.result?.generalInfo.address;
        await sendConfirmationEmail(
          email ?? "",
          name,
          shipping_address,
          data.products
        );
        await sendConfirmationOrderForAdmin(
          name,
          shipping_address,
          data.products
        );
        data.userId = verify.user_id;
        data.shipping_address = request.result?.generalInfo.address;
        data.paymentMethod = "STRIPE";
        data.order_status = "Pending";
        data.order_number = generateOrderNumber();
        await createOrder(data);
        await deleteCart(verify.user_id);
        json(200, { status: "success" });
        return;
      } else {
        json(200, { status: "failed", result: request.err });
        return;
      }
    }
  } catch (err: any) {
    if (err.message === "jwt expired") {
      const decoded: any = jwt.decode(token ?? "");
      const newToken = jwt.sign(
        { user_id: decoded.user_id, isDummy: decoded.isDummy },
        process.env.JWTSECRET ?? "",
        {
          expiresIn: "2h",
        }
      );
      cookie.set("token", newToken, {
        httpOnly: true,
        secure: true,
        path: "/",
      });
      if (decoded.isDummy) {
        const request: any = await getDummyCustomer(decoded.user_id);
        const email = request?.result?.email;
        const name = `${request?.result?.firstName} ${request?.result?.lastName}`;
        const shipping_address = request.result?.generalInfo.address;
        await sendConfirmationEmail(
          email ?? "",
          name,
          shipping_address,
          data.products
        );
        await sendConfirmationOrderForAdmin(
          name,
          shipping_address,
          data.products
        );
        data.userId = decoded.user_id;
        data.shipping_address = request.result?.generalInfo.address;
        data.paymentMethod = "STRIPE";
        data.order_status = "Pending";
        data.order_number = generateOrderNumber();
        await createOrder(data);
        await deleteCart(decoded.user_id);
        json(200, { status: "success" });
        return;
      } else {
        const request = await getUserById(decoded.user_id);
        if (request.status === "success") {
          const email = request?.result?.email;
          const name = `${request?.result?.firstName} ${request?.result?.lastName}`;
          const shipping_address = request.result?.generalInfo.address;
          await sendConfirmationEmail(
            email ?? "",
            name,
            shipping_address,
            data.products
          );
          await sendConfirmationOrderForAdmin(
            name,
            shipping_address,
            data.products
          );
          data.userId = decoded.user_id;
          data.shipping_address = request.result?.generalInfo.address;
          data.paymentMethod = "STRIPE";
          data.order_status = "Pending";
          data.order_number = generateOrderNumber();
          await createOrder(data);
          await deleteCart(decoded.user_id);
          json(200, { status: "success" });
          return;
        } else {
          json(200, { status: "failed", result: request.err });
          return;
        }
      }
    } else {
      json(200, { status: "failed", result: err.message });
      return;
    }
  }
};
