import type { RequestHandler } from "@builder.io/qwik-city";
import Stripe from "stripe";
import { deleteCart, getCartByUserId } from "~/express/services/cart.service";
import { update_dummy_user } from "~/express/services/dummy.user.service";
import { createOrder } from "~/express/services/order.service";
import { update_product_quantity } from "~/express/services/product.service";
import { updateExistingUser } from "~/express/services/user.service";
import { generateOrderNumber } from "~/utils/generateOrderNo";
import { sendConfirmationEmail } from "~/utils/sendConfirmationEmail";
import { sendConfirmationOrderForAdmin } from "~/utils/sendConfirmationOrderForAdmin";

export const onPost: RequestHandler = async ({ json, parseBody, env }) => {
  const data: any = await parseBody();
  const stripe = new Stripe(env.get("VITE_STRIPE_TEST_SECRET_KEY") ?? "");
  const productArray: [any] = data.products;
  const lineItemsArray: any = [];

  productArray.forEach((product: any) => {
    // const testImage = product.product_img;

    lineItemsArray.push({
      // tax_rates:['123'],
      quantity: product.quantity,
      price_data: {
        unit_amount: Math.round(product.price * 100),
        currency: data.currencyObject === "1" ? "usd" : "cad",
        product_data: {
          name: product.product_name,
          // images: [product.product_img],
        },
      },
    });
  });
  const paymentMethodTypes: any[] = [
    "card",
    data.currencyObject !== "1" ? "afterpay_clearpay" : "",
  ];
  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    currency: data.currencyObject === "1" ? "usd" : "cad",
    line_items: lineItemsArray,
    automatic_tax: {
      enabled: true,
    },
    payment_method_types: paymentMethodTypes.filter((type) => type !== ""),
    shipping_address_collection: {
      allowed_countries: ["US", "CA"],
    },
    tax_id_collection: {
      enabled: true,
    },

    custom_text: {
      shipping_address: {
        message:
          "Please Note: We are not shipping to Puerto Rico, Virgin Islands and Hawaii.",
      },
      terms_of_service_acceptance: {
        message:
          "I agree to the [Terms of Service](https://xpressbeauty.ca/terms-and-conditions/)",
      },
      after_submit: {
        message: "Thank you for your order! you will receive an email shortly.",
      },
    },
    redirect_on_completion: 'if_required',
    phone_number_collection: {
      enabled: true,
    },
    consent_collection: {
      terms_of_service: "required",
    },
    custom_fields: [
      {
        key: "notes",
        label: {
          type: "custom",
          custom: "Add a note to your order",
        },
        optional: true,
        type: "text",
      },
    ],
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: data.shipping * 100,
            currency: data.currencyObject === "1" ? "usd" : "cad",
          },
          display_name: "Shipping Cost (Tax not included)",

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
    )}/api/stripe?session_id={CHECKOUT_SESSION_ID}&userId=${data.userId
      }&currency=${data.currencyObject}&shipping=${data.shipping}&isGuest=${data.user.isDummy
      }`,
  });
  json(200, { clientSecret: session.client_secret, sessionId: session.id });
  return;
};

export const onGet: RequestHandler = async ({ query, env, url, redirect }) => {
  if (url.searchParams.get("session_id")) {
    const stripe = new Stripe(env.get("VITE_STRIPE_TEST_SECRET_KEY") ?? "");
    console.log("session_id", query.get("session_id"));
    const session = await stripe.checkout.sessions.retrieve(
      query.get("session_id") + "",
      {
        expand: ["line_items"],
      }
    );
    console.log("session", session);
    if (session.payment_status === 'unpaid') {
      throw redirect(302, `/payment/?error=payment-failed`);
    }
    const productsFromCart: any = await getCartByUserId(
      query.get("userId") ?? ""
    );

    const productsData = session?.line_items?.data.map((item: any) => {
      return {
        product_name: item.description,
        quantity: item.quantity,
        price: item.amount_total / 100,
        currency: item.currency,
      };
    });
    const isDummy = query.get("isGuest") === "true" ? true : false;
    const orderData = {
      userId: query.get("userId") ?? "",
      products: productsFromCart.products ?? [],
      currency: "cad",
      notes: session?.custom_fields[0].text?.value ?? "",
      totalQuantity: session?.line_items?.data?.length ?? 0,
      totalPrice: Number(session?.amount_total ?? 0) / 100,
      order_number: generateOrderNumber(),
      paymentMethod: "Card",
      orderStatus: "Pending",
      paymentStatus: "Paid",
      paymentId: session.id,
      shippingAddress: {
        addressLine1: session.shipping_details?.address?.line1 ?? "",
        addressLine2: session.shipping_details?.address?.line2 ?? "",
        city: session.shipping_details?.address?.city ?? "",
        country: session.shipping_details?.address?.country ?? "",
        postalCode: session.shipping_details?.address?.postal_code ?? "",
        state: session.shipping_details?.address?.state ?? "",
      },
      shippingName: session.shipping_details?.name ?? "",
      totalInfo: {
        shipping: Number(session.shipping_cost?.amount_total ?? 0) / 100,
        shippingTax: Number(session.shipping_cost?.amount_tax ?? 0) / 100,
        tax: Number(session.total_details?.amount_tax ?? 0) / 100,
        finalTotal: Number(session.amount_total ?? 0) / 100,
        currency: session.currency ?? "cad",
      },
    };
    // console.log("session", session);
    await createOrder(orderData);
    await update_product_quantity(productsFromCart.products ?? []);
    await sendConfirmationEmail(
      session.customer_details?.email ?? "",
      session.customer_details?.name ?? "",
      orderData.shippingAddress,
      productsData ?? [],
      orderData.totalInfo,
      orderData.order_number
    );
    await sendConfirmationOrderForAdmin(
      session.customer_details?.name ?? "",
      orderData.shippingAddress,
      productsData ?? []
    );
    if (isDummy) {
      await update_dummy_user(
        {
          firstName: session.customer_details?.name?.split(" ")[0] ?? "",
          lastName: session.customer_details?.name?.split(" ")[1] ?? "",
          email: session.customer_details?.email ?? "",
          phoneNumber: session.customer_details?.phone ?? "",
          generalInfo: {
            address: {
              addressLine1: session.shipping_details?.address?.line1 ?? "",
              addressLine2: session.shipping_details?.address?.line2 ?? "",
              city: session.shipping_details?.address?.city ?? "",
              country: session.shipping_details?.address?.country ?? "",
              postalCode: session.shipping_details?.address?.postal_code ?? "",
              state: session.shipping_details?.address?.state ?? "",
            },
          },
        },
        query.get("userId") ?? ""
      );
    } else {
      await updateExistingUser(
        {
          generalInfo: {
            address: {
              addressLine1: session.shipping_details?.address?.line1 ?? "",
              addressLine2: session.shipping_details?.address?.line2 ?? "",
              city: session.shipping_details?.address?.city ?? "",
              country: session.shipping_details?.address?.country ?? "",
              postalCode: session.shipping_details?.address?.postal_code ?? "",
              state: session.shipping_details?.address?.state ?? "",
            },
          },
        },
        query.get("userId") ?? ""
      );
    }

    await deleteCart(query.get("userId") ?? "");
    throw redirect(302, `/payment/success/${orderData.order_number}`);
  }
};
