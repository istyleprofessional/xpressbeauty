import type { RequestHandler } from "@builder.io/qwik-city/middleware/request-handler";
import { getDummyCustomer } from "~/express/services/dummy.user.service";
import {
  getUserById,
  updatePaymentMethod,
} from "~/express/services/user.service";
import { sendConfirmationEmail } from "~/utils/sendConfirmationEmail";
import jwt from "jsonwebtoken";
import { createOrder } from "~/express/services/order.service";
import { deleteCart } from "~/express/services/cart.service";
import { generateOrderNumber } from "~/utils/generateOrderNo";
import { sendConfirmationOrderForAdmin } from "~/utils/sendConfirmationOrderForAdmin";
import Stripe from "stripe";
import { refreshToken } from "~/utils/refreshToken";

export const onPost: RequestHandler = async ({
  json,
  parseBody,
  cookie,
  env,
}) => {
  const data: any = await parseBody();
  const token = cookie.get("token")?.value;
  if (!token) {
    json(200, { status: "failed", result: "Something went wrong" });
    return;
  }
  try {
    const verify: any = jwt.verify(
      token ?? "",
      env.get("VITE_JWTSECRET") ?? ""
    );
    if (verify.isDummy) {
      const stripe = new Stripe(env.get("VITE_STRIPE_TEST_SECRET_KEY") ?? "", {
        apiVersion: "2022-11-15",
      });
      const customer = await stripe.customers.create({ email: data.email });
      const source = await stripe.customers.createSource(customer.id, {
        source: data.token,
      });
      const charges = await stripe.charges.create({
        amount: parseInt(data.amount) * 100,
        currency: "cad",
        source: source.id,
        customer: customer.id,
      });

      if (charges.status === "succeeded") {
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
        return;
      } else {
        json(200, { status: "failed", result: "Something went wrong" });
        return;
      }
    } else {
      const request = await getUserById(verify.user_id);
      const email = request?.result?.email;
      const name = `${request?.result?.firstName} ${request?.result?.lastName}`;
      const shipping_address = request.result?.generalInfo.address;
      if (request.status === "success") {
        const stripe = new Stripe(
          env.get("VITE_STRIPE_TEST_SECRET_KEY") ?? "",
          {
            apiVersion: "2022-11-15",
          }
        );
        const source = await stripe.customers.createSource(
          request.result?.stripeCustomerId ?? "",
          { source: data.token }
        );
        const charges = await stripe.charges.create({
          amount: parseInt(data.amount) * 100,
          currency: "cad",
          source: source.id,
          customer: request.result?.stripeCustomerId ?? "",
        });
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
        await updatePaymentMethod(charges.payment_method ?? "", verify.user_id);
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
    if (
      err.code === "card_declined" ||
      err.code === "Your card has insufficient funds."
    ) {
      json(200, {
        status: "failed",
        message: "Your card has insufficient funds.",
      });
      return;
    }
    if (err.message === "jwt expired") {
      const refresh_token = refreshToken(token);
      cookie.set("token", refresh_token, {
        httpOnly: true,
        path: "/",
      });
      const decoded: any = jwt.decode(refresh_token ?? "");
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
