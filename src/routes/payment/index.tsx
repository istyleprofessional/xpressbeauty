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

export const usePaymentRoute = routeLoader$(async ({ cookie, env }) => {
  const token = cookie.get("token")?.value;
  if (!token) {
    return JSON.stringify({ status: "failed" });
  }
  let shortCoCode: string = "";
  let shortStateCode: string = "";
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
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${jsonRes.predictions[0].place_id}&key=${apiKey}`
      );
      const jsonDetails = await details.json();
      if (!user.result) {
        return JSON.stringify({ status: "failed" });
      }
      shortCoCode = jsonDetails.result.address_components.find((comp: any) => {
        return comp.types.includes("country");
      })?.short_name;
      shortStateCode = jsonDetails.result.address_components.find(
        (comp: any) => {
          return comp.types.includes("administrative_area_level_1");
        }
      )?.short_name;
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
      console.log(dummyUser.result?.generalInfo?.address?.postalCode);
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
      shortCoCode = jsonDetails.result.address_components.find((comp: any) => {
        return comp.types.includes("country");
      })?.short_name;
      shortStateCode = jsonDetails.result.address_components.find(
        (comp: any) => {
          return comp.types.includes("administrative_area_level_1");
        }
      )?.short_name;
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
      shortCoCode,
      shortStateCode,
    });
  } catch (e) {
    console.log(e);
    return JSON.stringify({ status: "failed" });
  }
});

export const paypalServer = server$(async function (data: any, user: any) {
  try {
    // console.log(data);
    paypal.configure({
      mode: import.meta.env.VITE_PAYPAL_MODE, //sandbox or live
      client_id: import.meta.env.VITE_PAYPAL_CLIENT_ID ?? "",
      client_secret: import.meta.env.VITE_PAYPAL_APP_SECRET ?? "",
    });
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
                name: product.name,
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
              tax: user?.generalInfo?.address?.country
                ?.toLowerCase()
                ?.includes("united")
                ? "0.00"
                : data.hst, // Example tax amount
            },
          },
        },
      ],
    };
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
    console.log(paypalPromise);
    return paypalPromise;
  } catch (e) {
    console.log(e);
  }
});

export const callServer = server$(async function (
  paymentId: string,
  id: string,
  total: number,
  cart: any,
  currency?: string,
  totalInfo?: any
) {
  try {
    const stripe: any = new Stripe(
      this.env.get("VITE_STRIPE_TEST_SECRET_KEY") ?? "",
      {
        apiVersion: "2022-11-15",
      }
    );
    const paymentIntent = await stripe.paymentIntents.create({
      amount: parseInt(total.toString()) * 100,
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
      // const rate = this.cookie.get("curRate")?.value ?? "";
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
        // currency?.toLocaleLowerCase() ?? "CAD",
        // rate
      );
      await createOrder(data);
      await deleteCart(verified.user_id);
    }
    return { paymentIntent: paymentIntent, orderId: orderId };
  } catch (e) {
    console.log(e);
  }
});

export const useCurrLoader = routeLoader$(async ({ cookie }) => {
  const country = cookie.get("cur")?.value ?? "";
  const rate = cookie.get("curRate")?.value ?? "";
  return { country: country, rate: rate };
});

export default component$(() => {
  const isLoading = useSignal<boolean>(false);
  const paymentRoute = JSON.parse(usePaymentRoute().value);
  console.log(paymentRoute);
  const userContext: any = useContext(UserContext);
  const cartContext: any = useContext(CartContext);
  const total = useSignal<number>(0);
  const finalCard = useSignal<any>(null);
  const isExistingPaymentMethod = useSignal<boolean>(false);
  const cards = paymentRoute.cards;
  const acceptSaveCard = useSignal<boolean>(false);
  const currencyObject = useCurrLoader().value;
  const subTotal = useSignal<number>(0);
  const taxRate = useSignal<number>(0);
  // console.log(userContext?.user);
  useVisibleTask$(
    async () => {
      const tax = await SalesTax.getSalesTax(
        paymentRoute.shortCoCode ?? "CA",
        paymentRoute.shortStateCode ?? "ON"
      );
      taxRate.value = tax.rate;
    }
    // { strategy: "document-idle" }
  );

  // console.log(userContext);
  useVisibleTask$(
    () => {
      if (paymentRoute.status === "failed") {
        window.location.href = "/cart";
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
        currency: currencyObject?.country === "1" ? "USD" : "CAD",
      });
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
              hst: parseFloat(
                ((cartContext.cart?.totalPrice ?? 0) * taxRate.value).toString()
              ).toFixed(2),
              ...cartContext?.cart,
              order_amount: parseFloat(total.value.toString()).toFixed(2),
              email: userContext?.user?.email,
              products: cartContext?.cart?.products,
              // shipping:
              shipping: subTotal.value > 150 ? 0 : 15,
              totalInfo: {
                shipping: subTotal.value > 150 ? 0 : 15,
                tax: userContext?.user?.generalInfo?.address?.country
                  ?.toLowerCase()
                  ?.includes("united")
                  ? parseFloat(
                      ((cartContext.cart?.totalPrice ?? 0) * 0.13).toString()
                    ).toFixed(2)
                  : "0.00",
                finalTotal: parseFloat(total.value.toString()).toFixed(2),
                currency: currencyObject?.country === "1" ? "USD" : "CAD",
              },
            };
            const paypalReq: any = await paypalServer(
              dataToSend,
              userContext.user
            );
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
                currency: currencyObject?.country === "1" ? "USD" : "CAD",
                totalInfo: {
                  shipping: subTotal.value > 150 ? 0 : 15,
                  tax: userContext?.user?.generalInfo?.address?.country
                    ?.toLowerCase()
                    ?.includes("united")
                    ? parseFloat(
                        (
                          (cartContext.cart?.totalPrice ?? 0) * taxRate.value
                        ).toString()
                      ).toFixed(2)
                    : "0.00",
                  finalTotal: parseFloat(total.value.toString()).toFixed(2),
                  currency: currencyObject?.country === "1" ? "USD" : "CAD",
                },
              };
              console.log(dataToSend);
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

      const stripeTokenHandler = async (token: any) => {
        const hiddenInput = document.createElement("input");
        hiddenInput.setAttribute("type", "hidden");
        hiddenInput.setAttribute("name", "stripeToken");
        hiddenInput.setAttribute("value", token.id);
        form?.appendChild(hiddenInput);
        const dataToSend = {
          ...cartContext?.cart,
          currency: currencyObject?.country === "1" ? "USD" : "CAD",
          token: token.id,
          order_amount: parseFloat(total.value.toString()).toFixed(2),
          email: userContext?.user?.email,
          products: cartContext?.cart?.products,
          acceptSaveCard: acceptSaveCard.value,
          paymentSource: "STRIPE",
          totalInfo: {
            shipping: subTotal.value > 150 ? 0 : 15,
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
            currency: currencyObject?.country === "1" ? "USD" : "CAD",
          },
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
            shipping: subTotal.value > 150 ? 0 : 15,
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
            currency: currencyObject?.country === "1" ? "USD" : "CAD",
          };
          const pay = await callServer(
            finalCard.value.id,
            userContext?.user?.stripeCustomerId,
            total.value,
            cartContext?.cart ?? {},
            currencyObject?.country === "1" ? "USD" : "CAD",
            totalInfo
          );
          if (pay?.paymentIntent.status === "succeeded") {
            isLoading.value = false;
            window.location.href = `/payment/success/${pay.orderId}`;
          } else {
            isLoading.value = false;
            alert("Payment Failed");
          }
          return;
        } else {
          stripe.createToken(cardNo).then((res) => {
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
          <ProductList currencyObject={currencyObject} />
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
                  user={userContext?.user}
                  subTotal={subTotal}
                  cart={cartContext?.cart}
                  total={total}
                  cards={cards?.value}
                  isExistingPaymentMethod={isExistingPaymentMethod.value}
                  acceptSaveCard={acceptSaveCard}
                  currencyObject={currencyObject}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});
