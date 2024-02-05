import type { RequestHandler } from "@builder.io/qwik-city";
import Stripe from "stripe";
import { deleteCart, getCartByUserId } from "~/express/services/cart.service";
import { createOrder } from "~/express/services/order.service";
import { generateOrderNumber } from "~/utils/generateOrderNo";
import { sendConfirmationEmail } from "~/utils/sendConfirmationEmail";
import { sendConfirmationOrderForAdmin } from "~/utils/sendConfirmationOrderForAdmin";

export const onPost: RequestHandler = async ({ json, parseBody, env }) => {
  const data: any = await parseBody();
  const stripe = new Stripe(env.get("VITE_STRIPE_TEST_SECRET_KEY") ?? "");
  const productArray: [any] = data.products;
  const lineItemsArray: any = [];

  productArray.forEach((product) => {
    lineItemsArray.push({
      // tax_rates:['123'],
      quantity: product.quantity,
      price_data: {
        unit_amount: Math.round(product.price) * 100,
        currency: data.currencyObject === "1" ? "usd" : "cad",
        product_data: {
          name: product.product_name,
          images: [product.product_img],
        },
      },
    });
  });
  const paymentMethodTypes: any[] = [
    "card",
    data.currencyObject !== "1" ? "afterpay_clearpay" : "",
    data.currencyObject !== "1" ? "alipay" : "",
  ];
  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    currency: data.currencyObject === "1" ? "usd" : "cad",
    line_items: lineItemsArray,
    automatic_tax: {
      enabled: true,
    },
    customer_email: data.user?.email ?? "",

    payment_method_types: paymentMethodTypes.filter((type) => type !== ""),
    shipping_address_collection: {
      allowed_countries: ["US", "CA"],
    },
    tax_id_collection: {
      enabled: true,
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: data.shipping * 100,
            currency: data.currencyObject === "1" ? "usd" : "cad",
          },
          display_name: "shipping cost",
          delivery_estimate: {
            minimum: {
              unit: "business_day",
              value: 5,
            },
            maximum: {
              unit: "business_day",
              value: 7,
            },
          },
        },
      },
    ],
    mode: "payment",
    return_url: `${env.get(
      "VITE_APPURL"
    )}/api/stripe?session_id={CHECKOUT_SESSION_ID}&userId=${
      data.userId
    }&currency=${data.currencyObject}&shipping=${data.shipping}`,
  });

  json(200, { clientSecret: session.client_secret });
  return;
};

export const onGet: RequestHandler = async ({ query, env, url, redirect }) => {
  if (url.searchParams.get("session_id")) {
    const stripe = new Stripe(env.get("VITE_STRIPE_TEST_SECRET_KEY") ?? "");
    const session = await stripe.checkout.sessions.retrieve(
      query.get("session_id") + ""
    );
    const dbResult: any = await getCartByUserId(query.get("userId") + "");
    let totalPrice = 0;

    dbResult?.products.forEach((prod: any) => {
      totalPrice += prod.price * prod.quantity;
    });
    const productsData: any = dbResult?.products;
    const orderData = {
      userId: dbResult?.userId ?? "",
      products: productsData,
      currency: "cad",
      totalQuantity: dbResult?.totalQuantity ?? 0,
      totalPrice: Math.round(totalPrice),
      order_number: generateOrderNumber(),
      paymentMethod: "Card",
      orderStatus: "Pending",
      paymentStatus: "Paid",
      paymentId: session.id,
      shippingAddress: {
        addressLine1: session.shipping_details?.address?.line1 ?? "",
        city: session.shipping_details?.address?.city ?? "",
        country: session.shipping_details?.address?.country ?? "",
        postalCode: session.shipping_details?.address?.postal_code ?? "",
        state: session.shipping_details?.address?.state ?? "",
      },
      shippingName: session.shipping_details?.name ?? "",
      totalInfo: {
        shipping: Number(session.shipping_cost?.amount_total ?? 0) / 100,
        tax: Number(session.total_details?.amount_tax ?? 0) / 100,
        finalTotal: Number(session.amount_total ?? 0) / 100,
        currency: session.currency ?? "cad",
      },
    };
    await sendConfirmationEmail(
      session.customer_details?.email ?? "",
      session.customer_details?.name ?? "",
      orderData.shippingAddress,
      productsData,
      orderData.totalInfo
    );
    await sendConfirmationOrderForAdmin(
      session.customer_details?.name ?? "",
      orderData.shippingAddress,
      productsData
    );

    await createOrder(orderData);
    await deleteCart(query.get("userId") ?? "");
    if (session.status == "open") {
      throw redirect(301, "/checkout");
    } else if (session.status == "complete") {
      throw redirect(301, "/payment/success");
    }
  }
};
