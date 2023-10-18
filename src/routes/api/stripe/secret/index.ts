import type { RequestHandler } from "@builder.io/qwik-city";
import Stripe from "stripe";
import jwt from "jsonwebtoken";
import {
  getUserById,
  updatePaymentMethod,
} from "~/express/services/user.service";

export const onPost: RequestHandler = async ({
  json,
  parseBody,
  env,
  cookie,
}) => {
  const data: any = await parseBody();
  //   const body: any = await parseBody();
  const stripe = new Stripe(env.get("VITE_STRIPE_TEST_SECRET_KEY") ?? "", {
    apiVersion: "2022-11-15",
  });
  try {
    const token = cookie.get("token")?.value;
    if (!token) {
      json(200, { status: "failed", result: "Something went wrong" });
      return;
    }
    const verify: any = jwt.verify(token, env.get("VITE_JWTSECRET") ?? "");
    if (verify.isDummy) {
      const paymentIntent = await stripe.paymentIntents.create({
        // customer: request.result?.stripeCustomerId ?? "",
        amount: parseInt(data.amount) * 100,
        currency: "cad",
        automatic_payment_methods: {
          enabled: true,
        },
      });

      json(200, {
        clientSecret: paymentIntent.client_secret,
      });
      return;
    } else {
      const user = await getUserById(verify.user_id);

      const paymentIntent = await stripe.paymentIntents.create({
        customer: user.result?.stripeCustomerId ?? "",
        amount: parseInt(data.amount) * 100,
        currency: "cad",
        automatic_payment_methods: {
          enabled: true,
        },
      });
      const clientSecret = paymentIntent.client_secret;
      const paymentMethod = paymentIntent.payment_method;
      const dataToUpdate = {
        clientSecret: clientSecret,
        paymentMethod: paymentMethod,
      };
      const updateUser = await updatePaymentMethod(
        dataToUpdate,
        verify.user_id
      );
      if (updateUser.status === "success") {
        json(200, {
          clientSecret: clientSecret,
        });
        return;
      } else {
        json(200, { status: "failed", result: "Something went wrong" });
        return;
      }
    }
  } catch (error) {
    json(200, { status: "failed", result: "Something went wrong" });
    return;
  }
};
