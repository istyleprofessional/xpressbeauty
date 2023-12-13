import type { RequestHandler } from "@builder.io/qwik-city/middleware/request-handler";
import { getDummyCustomer } from "~/express/services/dummy.user.service";
import {
  getUserById,
  updatePaymentMethod,
} from "~/express/services/user.service";
import { sendConfirmationEmail } from "~/utils/sendConfirmationEmail";
import { createOrder } from "~/express/services/order.service";
import { deleteCart } from "~/express/services/cart.service";
import { generateOrderNumber } from "~/utils/generateOrderNo";
import { sendConfirmationOrderForAdmin } from "~/utils/sendConfirmationOrderForAdmin";
import Stripe from "stripe";
import { refreshToken } from "~/utils/refreshToken";
import { verifyTokenUtil } from "~/utils/verifyTokenUtil";

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
  let verifiedToken: any;
  const verifyToken = verifyTokenUtil(token);
  if (verifyToken.status === "error") {
    if (verifyToken?.error === "expired") {
      verifiedToken = refreshToken(token);
    } else {
      json(200, { status: "failed", result: verifyToken.error });
      return;
    }
  } else {
    verifiedToken = verifyToken.data;
  }
  // const rate = cookie.get("curRate")?.value;
  if (verifiedToken.isDummy) {
    if (data.paymentSource !== "PAYPAL") {
      const stripe = new Stripe(env.get("VITE_STRIPE_TEST_SECRET_KEY") ?? "", {
        apiVersion: "2022-11-15",
      });
      const customer = await stripe.customers.create({ email: data.email });
      const source = await stripe.customers.createSource(customer.id, {
        source: data.token,
      });
      const charges = await stripe.charges.create({
        amount: Math.round(parseFloat(data.order_amount) * 100),
        currency: data?.currency?.toLowerCase(),
        source: source.id,
        customer: customer.id,
      });
      if (charges.status !== "succeeded") {
        json(200, { status: "failed", result: "Something went wrong" });
        return;
      }
    }

    const request: any = await getDummyCustomer(verifiedToken.user_id);
    const email = request?.result?.email;
    const name = `${request?.result?.firstName} ${request?.result?.lastName}`;
    const shipping_address = request.result?.generalInfo.address;
    const totalInfo = data.totalInfo;
    await sendConfirmationEmail(
      email ?? "",
      name,
      shipping_address,
      data.products,
      totalInfo
    );
    await sendConfirmationOrderForAdmin(name, shipping_address, data.products);
    data.userId = verifiedToken.user_id;
    data.shipping_address = request.result?.generalInfo.address;
    data.paymentMethod = data.paymentSource === "Paypal" ? "Paypal" : "STRIPE";
    data.paymentStatus = "Paid";
    data.order_status = "Pending";
    data.order_number = generateOrderNumber();
    await createOrder(data);
    await deleteCart(verifiedToken.user_id);
    json(200, { status: "success", orderId: data.order_number });
    return;
  } else {
    const request = await getUserById(verifiedToken.user_id);
    const email = request?.result?.email;
    const name = `${request?.result?.firstName} ${request?.result?.lastName}`;
    const shipping_address = request.result?.generalInfo.address;
    if (request.status === "success") {
      if (data.paymentSource !== "PAYPAL") {
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
          amount: Math.round(parseFloat(data.order_amount) * 100),
          currency: data?.currency?.toLowerCase(),
          source: source.id,
          customer: request.result?.stripeCustomerId ?? "",
        });
        if (data.acceptSaveCard) {
          await updatePaymentMethod(
            charges.payment_method ?? "",
            verifiedToken.user_id
          );
        }
      }
      console.log("data", data);
      const totalInfo = data.totalInfo;
      await sendConfirmationEmail(
        email ?? "",
        name,
        shipping_address,
        data.products,
        totalInfo
      );
      await sendConfirmationOrderForAdmin(
        name,
        shipping_address,
        data.products
      );
      data.userId = verifiedToken.user_id;
      data.shipping_address = request.result?.generalInfo.address;
      data.paymentMethod =
        data.paymentSource === "PAYPAL" ? "Paypal" : "STRIPE";
      data.paymentStatus = "Paid";
      data.order_status = "Pending";
      data.order_number = generateOrderNumber();

      await createOrder(data);
      await deleteCart(verifiedToken.user_id);
      json(200, { status: "success", orderId: data.order_number });
      return;
    } else {
      json(200, { status: "failed", result: request.err });
      return;
    }
  }
};
