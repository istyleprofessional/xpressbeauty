// import { component$ } from "@builder.io/qwik";
// import { routeLoader$ } from "@builder.io/qwik-city";

// export const useCloverTest = routeLoader$(async ({ redirect }) => {
//   // const client_id = env.get("VITE_APP_ID");
//   // const url = `${env.get(
//   //   "VITE_CLOVER_URL"
//   // )}/oauth/authorize?client_id=${client_id}&redirect_uri=${env.get(
//   //   "VITE_APPURL"
//   // )}/api/cloveroAuth`;
//   throw redirect(301, "/payment/pay/54782");
// });

// export default component$(() => {
//   return (
//     <div>
//       <h1>Payment</h1>
//     </div>
//   );
// });

import {
  component$,
  useContext,
  useSignal,
  useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { PerviousArrowIconNoStick } from "~/components/shared/icons/icons";
import { Steps } from "~/components/shared/steps/steps";
import { ProductList } from "~/components/cart/product-list/product-list";
import { OrderDetails } from "~/components/payment/order-details/order-details";
import { routeLoader$, server$ } from "@builder.io/qwik-city";
import jwt from "jsonwebtoken";
import { deleteCart, getCartByUserId } from "~/express/services/cart.service";
import { UserContext } from "~/context/user.context";
import { loadStripe } from "@stripe/stripe-js";
import { postRequest } from "~/utils/fetch.utils";
import { CartContext } from "~/context/cart.context";
import Stripe from "stripe";
import { getUserById } from "~/express/services/user.service";
import { generateOrderNumber } from "~/utils/generateOrderNo";
import { sendConfirmationEmail } from "~/utils/sendConfirmationEmail";
import { sendConfirmationOrderForAdmin } from "~/utils/sendConfirmationOrderForAdmin";
import { createOrder } from "~/express/services/order.service";
import { loadScript } from "@paypal/paypal-js";
import paypal from "paypal-rest-sdk";
import SalesTax from "sales-tax";
import { getDummyCustomer } from "~/express/services/dummy.user.service";
import { CurContext } from "~/context/cur.context";
import usersSchema from "~/express/schemas/users.schema";

export const usePaymentRoute = routeLoader$(async ({ cookie, env }) => {
  const token = cookie.get("token")?.value;
  if (!token) {
    return JSON.stringify({ status: "failed" });
  }
  let rate: number = 0.13;
  try {
    const verified: any = jwt.verify(token, env.get("VITE_JWTSECRET") ?? "");
    if (!verified) {
      return JSON.stringify({ status: "failed" });
    }
    const getCart: any = await getCartByUserId(verified.user_id);
    const cards = [];
    if (!verified.isDummy) {
      const user = await getUserById(verified.user_id);
      const apiKey = "AIzaSyCaw8TltqjUfM0QyLnGGo8sQzRI8NtHqus";
      const components = "country:US|country:CA";
      const urls = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${user.result?.generalInfo?.address?.postalCode}&key=${apiKey}&components=${components}`;
      const response = await fetch(urls);
      const jsonRes = await response.json();
      const details = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${
          jsonRes?.predictions[0]?.place_id ?? ""
        }&key=${apiKey}`
      );
      const jsonDetails = await details.json();
      if (!user.result) {
        return JSON.stringify({ status: "failed" });
      }
      const shortCoCode =
        jsonDetails?.result?.address_components?.find((comp: any) => {
          return comp.types.includes("country");
        })?.short_name ?? "CA";
      const shortStateCode =
        jsonDetails?.result?.address_components?.find((comp: any) => {
          return comp.types.includes("administrative_area_level_1");
        })?.short_name ?? "ON";
      try {
        const sales = await SalesTax.getSalesTax(shortCoCode, shortStateCode);
        rate = sales?.rate ?? 0.13;
      } catch (e) {
        console.log(e);
        rate = 0.13;
      }
      const stripe = new Stripe(env.get("VITE_STRIPE_TEST_SECRET_KEY") ?? "", {
        apiVersion: "2022-11-15",
      });
      for (const id of user.result?.paymentMethod ?? []) {
        const pay = await stripe.paymentMethods.retrieve(id);
        cards.push({
          id: id,
          card: pay.card,
        });
      }
    } else {
      const dummyUser = await getDummyCustomer(verified.user_id);
      const apiKey = "AIzaSyCaw8TltqjUfM0QyLnGGo8sQzRI8NtHqus";
      const components = "country:US|country:CA";
      const urls = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${dummyUser.result?.generalInfo?.address?.postalCode}&key=${apiKey}&components=${components}`;
      const response = await fetch(urls);
      const jsonRes = await response.json();
      const details = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${jsonRes.predictions[0].place_id}&key=${apiKey}`
      );
      const jsonDetails = await details.json();
      if (!dummyUser.result) {
        return JSON.stringify({ status: "failed" });
      }
      const shortCoCode = jsonDetails.result.address_components.find(
        (comp: any) => {
          return comp.types.includes("country");
        }
      )?.short_name;
      const shortStateCode = jsonDetails.result.address_components.find(
        (comp: any) => {
          return comp.types.includes("administrative_area_level_1");
        }
      )?.short_name;
      try {
        const sales = await SalesTax.getSalesTax(shortCoCode, shortStateCode);
        rate = sales?.rate ?? 0.13;
      } catch (e) {
        console.log(e);
        rate = 0.13;
      }
    }
    if (!getCart) {
      return JSON.stringify({ status: "failed" });
    }
    if (getCart.products.length === 0) {
      return JSON.stringify({ status: "failed" });
    }
    return JSON.stringify({
      status: "success",
      cards: cards ?? [],
      rate: rate,
    });
  } catch (e) {
    console.log(e);
    return JSON.stringify({ status: "failed" });
  }
});

export const paypalServer = server$(async function (data: any) {
  try {
    // console.log(data);
    paypal.configure({
      mode: import.meta.env.VITE_PAYPAL_MODE, //sandbox or live
      client_id: import.meta.env.VITE_PAYPAL_CLIENT_ID ?? "",
      client_secret: import.meta.env.VITE_PAYPAL_APP_SECRET ?? "",
    });
    if (data.isCoponApplied) {
      data.products = data.products.map((product: any) => {
        return {
          ...product,
          price: parseFloat(product.price) - parseFloat(product.price) * 0.1,
        };
      });
    }
    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: "https://xpressbeauty.ca/payment/success",
        cancel_url: "https://xpressbeauty.ca/payment/cancel",
      },

      transactions: [
        {
          item_list: {
            items: data.products.map((product: any) => {
              return {
                name: product.product_name,
                sku: product.sku,
                price: parseFloat(product.price).toFixed(2),
                currency: data.currency ?? "CAD",
                quantity: product.quantity,
              };
            }),
          },
          amount: {
            currency: data.currency ?? "CAD",
            total: data.order_amount,
            details: {
              subtotal: data.subTotal,
              shipping: parseFloat(data.shipping).toFixed(2), // Example shipping cost
              tax: data.hst, // Example tax amount
            },
          },
        },
      ],
    };
    // console.log(create_payment_json.transactions[0].item_list);
    // console.log(create_payment_json.transactions[0].amount);
    const paypalPromise = await new Promise((resolve, reject) => {
      paypal.payment.create(create_payment_json, (error, payment) => {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          for (let i = 0; i < (payment?.links?.length ?? 0); i++) {
            if ((payment?.links ?? [])[i].rel === "approval_url") {
              resolve(
                JSON.stringify({
                  id: (payment?.links ?? [])[i].href.split("EC-", 2)[1],
                })
              );
            }
          }
          reject(new Error("No approval_url found in payment links."));
        }
      });
    });
    return paypalPromise;
  } catch (e: any) {
    console.log(e.response);
  }
});

export const callServer = server$(async function (
  paymentId: string,
  id: string,
  total: number,
  cart: any,
  currency?: string,
  totalInfo?: any,
  isCoponApplied?: boolean
) {
  try {
    const stripe: any = new Stripe(
      this.env.get("VITE_STRIPE_TEST_SECRET_KEY") ?? "",
      {
        apiVersion: "2022-11-15",
      }
    );
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(parseFloat(total.toString()) * 100),
      currency: currency?.toLocaleLowerCase() ?? "CAD",
      customer: id,
      payment_method: paymentId,
      confirm: true,
    });
    let orderId = "";
    if (paymentIntent.status === "succeeded") {
      const token = this.cookie.get("token")?.value;
      const verified: any = jwt.verify(
        token ?? "",
        this.env.get("VITE_JWTSECRET") ?? ""
      );

      const user = await getUserById(verified.user_id);
      const data: any = cart;
      data.order_amount = total;
      data.userId = verified.user_id;
      data.shipping_address = user.result?.generalInfo.address;
      data.paymentMethod = "STRIPE";
      data.order_status = "Pending";
      data.order_number = generateOrderNumber();
      orderId = data.order_number;

      await sendConfirmationEmail(
        user.result?.email ?? "",
        `${user.result?.firstName} ${user.result?.lastName}`,
        data.shipping_address,
        data.products,
        totalInfo
      );
      await sendConfirmationOrderForAdmin(
        `${user.result?.firstName} ${user.result?.lastName}`,
        data.shipping_address,
        data.products
      );
      if (isCoponApplied) {
        await usersSchema.updateOne(
          { _id: verified.user_id, "cobone.code": "xpressbeauty10" },
          { $set: { "cobone.$.status": true } }
        );
      }
      await createOrder(data);
      await deleteCart(verified.user_id);
    }
    return { paymentIntent: paymentIntent, orderId: orderId };
  } catch (e) {
    console.log(e);
  }
});

export default component$(() => {
  const isLoading = useSignal<boolean>(false);
  const paymentRoute = JSON.parse(usePaymentRoute().value);
  const userContext: any = useContext(UserContext);
  const cartContext: any = useContext(CartContext);
  const total = useSignal<number>(0);
  const finalCard = useSignal<any>(null);
  const isExistingPaymentMethod = useSignal<boolean>(false);
  const cards = paymentRoute.cards;
  const acceptSaveCard = useSignal<boolean>(false);
  const currencyObjectConx: any = useContext(CurContext);
  const currencyObject = currencyObjectConx?.cur;
  const subTotal = useSignal<number>(0);
  const taxRate = useSignal<number>(0);
  const shipping = useSignal<number>(0);

  useTask$(async () => {
    taxRate.value = paymentRoute?.rate ?? 0.13;
  });
  console.log("user", userContext);
  useVisibleTask$(
    () => {
      if (
        !userContext?.email ||
        !userContext?.phoneNumber ||
        !userContext?.generalInfo?.address?.postalCode
      ) {
        window.location.href = "/checkout";
      }
    },
    { strategy: "document-idle" }
  );

  useTask$(
    () => {
      if (cards?.length > 0) {
        isExistingPaymentMethod.value = true;
        finalCard.value = cards[0];
      }
    },
    { eagerness: "idle" }
  );

  useVisibleTask$(
    async () => {
      const paypalUi = await loadScript({
        "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID ?? "",
        currency: currencyObject === "1" ? "USD" : "CAD",
      });
      const checkCopon = localStorage.getItem("copon");
      (paypalUi as any)
        .Buttons({
          style: {
            layout: "horizontal",
            color: "blue",
            shape: "rect",
            label: "paypal",
            tagline: false,
          },

          createOrder: async () => {
            const dataToSend = {
              subTotal: subTotal.value.toFixed(2),
              hst: !userContext?.user?.generalInfo?.address?.country
                ?.toLowerCase()
                ?.includes("united")
                ? parseFloat(
                    (
                      (cartContext.cart?.totalPrice ?? 0) * taxRate.value
                    ).toString()
                  ).toFixed(2)
                : "0.00",
              ...cartContext?.cart,
              order_amount: parseFloat(total.value.toString()).toFixed(2),
              email: userContext?.user?.email,
              products: cartContext?.cart?.products,
              // shipping:
              shipping: shipping.value,
              totalInfo: {
                shipping: shipping.value,
                tax: !userContext?.user?.generalInfo?.address?.country
                  ?.toLowerCase()
                  ?.includes("united")
                  ? parseFloat(
                      (
                        (cartContext.cart?.totalPrice ?? 0) * taxRate.value
                      ).toString()
                    ).toFixed(2)
                  : "0.00",
                finalTotal: parseFloat(total.value.toString()).toFixed(2),
                currency: currencyObject === "1" ? "USD" : "CAD",
              },
              isCoponApplied: checkCopon === "true" ? true : false,
            };
            const paypalReq: any = await paypalServer(dataToSend);
            const paypalRes = JSON.parse(paypalReq);

            return paypalRes.id;
          },
          onApprove: async (data: any, actions: any) => {
            return actions.order.capture().then(async function (details: any) {
              const dataToSend = {
                ...cartContext?.cart,
                order_amount: parseFloat(total.value.toString()).toFixed(2),
                email: userContext?.user?.email,
                products: cartContext?.cart?.products,
                paymentSource: "PAYPAL",
                paypalObj: {
                  payerId: data.payerID,
                  paymentId: data.paymentID,
                  orderId: data.orderID,
                },
                currency: currencyObject === "1" ? "USD" : "CAD",
                totalInfo: {
                  shipping: shipping.value,
                  tax: !userContext?.user?.generalInfo?.address?.country
                    ?.toLowerCase()
                    ?.includes("united")
                    ? parseFloat(
                        (
                          (cartContext.cart?.totalPrice ?? 0) * taxRate.value
                        ).toString()
                      ).toFixed(2)
                    : "0.00",
                  finalTotal: parseFloat(total.value.toString()).toFixed(2),
                  currency: currencyObject === "1" ? "USD" : "CAD",
                },
                isCoponApplied: checkCopon === "true" ? true : false,
              };
              const req = await postRequest(
                "/api/paymentConfirmiation",
                dataToSend
              );
              const res = await req.json();

              if (res.status === "success") {
                isLoading.value = false;
                window.location.href = `/payment/success/${res.orderId}`;
              } else {
                console.log(res);
                isLoading.value = false;
                alert("Payment Failed");
              }
              // Handle the captured payment details
              console.log("Payment captured:", details);
            });
          },
          onError: (err: any) => {
            console.log(err);
          },
        })
        .render("#paypal-button-container");
    },
    { strategy: "document-idle" }
  );

  useVisibleTask$(
    async ({ track }) => {
      track(() => total.value);
      track(() => isExistingPaymentMethod.value);
      if (total.value === 0) {
        return;
      }
      const stripe = await loadStripe(
        import.meta.env.VITE_STRIPE_TEST_PUBLISHABLE_KEY ?? ""
      );
      if (!stripe) {
        return;
      }
      const elements = stripe.elements();
      let cardNo: any;
      let cardExpiration: any;
      let cardCvc: any;
      if (!isExistingPaymentMethod.value) {
        cardNo = elements.create("cardNumber");
        cardNo.mount("#card-element");
        cardExpiration = elements.create("cardExpiry");
        cardExpiration.mount("#card-expiration");
        cardCvc = elements.create("cardCvc");
        cardCvc.mount("#card-cvc");
      }
      const form = document.querySelector("#payment-form") as HTMLFormElement;
      const errorEl = document.querySelector("#card-errors") as HTMLElement;
      const coponCheck = localStorage.getItem("copon");
      const stripeTokenHandler = async (token: any) => {
        const hiddenInput = document.createElement("input");
        hiddenInput.setAttribute("type", "hidden");
        hiddenInput.setAttribute("name", "stripeToken");
        hiddenInput.setAttribute("value", token.id);
        form?.appendChild(hiddenInput);
        const dataToSend = {
          ...cartContext?.cart,
          currency: currencyObject === "1" ? "USD" : "CAD",
          token: token.id,
          order_amount: parseFloat(total.value.toString()).toFixed(2),
          email: userContext?.user?.email,
          products: cartContext?.cart?.products,
          acceptSaveCard: acceptSaveCard.value,
          paymentSource: "STRIPE",
          totalInfo: {
            shipping: shipping.value,
            tax: !userContext?.user?.generalInfo?.address?.country
              ?.toLowerCase()
              ?.includes("united")
              ? parseFloat(
                  (
                    (cartContext.cart?.totalPrice ?? 0) * taxRate.value
                  ).toString()
                ).toFixed(2)
              : "0.00",
            finalTotal: parseFloat(total.value.toString()).toFixed(2),
            currency: currencyObject === "1" ? "USD" : "CAD",
          },
          isCoponApplied: coponCheck === "true" ? true : false,
        };

        const req = await postRequest("/api/paymentConfirmiation", dataToSend);
        const res = await req.json();

        if (res.status === "success") {
          isLoading.value = false;
          window.location.href = `/payment/success/${res.orderId}`;
        } else {
          isLoading.value = false;
          errorEl.innerText = res.message;
        }
      };
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        isLoading.value = true;
        if (finalCard.value && isExistingPaymentMethod.value) {
          const totalInfo = {
            shipping: shipping.value,
            tax: !userContext?.user?.generalInfo?.address?.country
              ?.toLowerCase()
              ?.includes("united")
              ? parseFloat(
                  (
                    (cartContext.cart?.totalPrice ?? 0) * taxRate.value
                  ).toString()
                ).toFixed(2)
              : "0.00",
            finalTotal: parseFloat(total.value.toString()).toFixed(2),
            currency: currencyObject === "1" ? "USD" : "CAD",
          };
          const isCoponApplied = localStorage.getItem("copon");

          const pay = await callServer(
            finalCard.value.id,
            userContext?.user?.stripeCustomerId,
            total.value,
            cartContext?.cart ?? {},
            currencyObject === "1" ? "USD" : "CAD",
            totalInfo,
            isCoponApplied === "true" ? true : false
          );
          if (pay?.paymentIntent.status === "succeeded") {
            window.location.href = `/payment/success/${pay.orderId}`;
            isLoading.value = false;
          } else {
            alert("Payment Failed");
            isLoading.value = false;
          }
          return;
        } else {
          stripe.createToken(cardNo).then((res: any) => {
            if (res.error) errorEl.innerText = res?.error?.message ?? "";
            else stripeTokenHandler(res.token);
            isLoading.value = false;
          });
        }
      });
    },
    { strategy: "document-idle" }
  );

  return (
    <>
      {isLoading.value && (
        <div class="w-full backdrop-blur-lg drop-shadow-lg fixed z-20 m-auto inset-x-0 inset-y-0 ">
          <progress class="progress progress-white w-56 fixed z-20 m-auto inset-x-0 inset-y-0  bg-white"></progress>
        </div>
      )}
      <div class="flex flex-col gap-5 md:p-10 justify-start">
        <div class="flex flex-col gap-3 justify-center items-center">
          <Steps pageType="payment" />
        </div>
        <a
          class="text-black font-bold text-base lg:text-3xl flex flex-row gap-1 items-center cursor-pointer"
          href="/products/"
        >
          <PerviousArrowIconNoStick color="black" width="10%" /> Continue
          Shopping
        </a>
        <div class="flex flex-col-reverse md:flex-row gap-2 justify-center items-start">
          <ProductList currencyObject={currencyObjectConx} />
          <div class="h-full w-96 rounded-lg flex flex-col gap-3 p-5 lg:m-5 md:sticky md:top-0">
            <div class="flex flex-col gap-4 items-center lg:items-end w-full">
              <div class="bg-black h-full w-96 rounded-lg flex flex-col gap-3 p-5 mb-5">
                {cards?.length > 0 && (
                  <div class="bg-white shadow-md flex-col gap-3 flex rounded px-8 pt-6 pb-8 mb-4">
                    <p class="text-black text-lg font-bold">Payment Method</p>
                    {cards?.map((card: any, index: number) => (
                      <>
                        <div class="flex flex-row gap-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            onChange$={() => {
                              isExistingPaymentMethod.value = true;
                              finalCard.value = card;
                            }}
                            class="form-radio h-5 w-5 text-black"
                            checked={
                              index === 0 && isExistingPaymentMethod.value
                            }
                          />
                          <label class="text-black text-sm font-bold">
                            ******{card.card.last4}
                          </label>
                        </div>
                      </>
                    ))}
                    <button
                      class="btn btn-primary text-white w-full"
                      onClick$={() => {
                        isExistingPaymentMethod.value = false;
                      }}
                    >
                      {" "}
                      Add New Card{" "}
                    </button>
                  </div>
                )}

                <OrderDetails
                  taxRate={taxRate.value}
                  user={userContext}
                  subTotal={subTotal}
                  cart={cartContext?.cart}
                  total={total}
                  cards={cards?.value}
                  isExistingPaymentMethod={isExistingPaymentMethod.value}
                  acceptSaveCard={acceptSaveCard}
                  currencyObject={currencyObject}
                  shipping={shipping}
                  isLoading={isLoading}
                  // chargeClover={chargeClover}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});
