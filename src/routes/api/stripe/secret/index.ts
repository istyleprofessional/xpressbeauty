import type { RequestHandler } from "@builder.io/qwik-city";
import Stripe from "stripe";

export const onPost: RequestHandler = async ({ json, parseBody, env }) => {
  const data: any = await parseBody();
  //   const body: any = await parseBody();
  const stripe = new Stripe(env.get("VITE_STRIPE_TEST_SECRET_KEY") ?? "", {
    apiVersion: "2022-11-15",
  });
  //   const jsonBody = JSON.parse(body);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: parseInt(data.amount) * 100,
    currency: "cad",
    automatic_payment_methods: {
      enabled: true,
    },
  });

  json(200, {
    clientSecret: paymentIntent.client_secret,
  });
};
