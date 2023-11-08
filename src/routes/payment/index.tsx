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

export const usePaymentRoute = routeLoader$(async ({ cookie, env }) => {
  const token = cookie.get("token")?.value;
  if (!token) {
    return JSON.stringify({ status: "failed" });
  }
  try {
    const verified: any = jwt.verify(token, env.get("VITE_JWTSECRET") ?? "");
    if (!verified) {
      return JSON.stringify({ status: "failed" });
    }
    const getCart: any = await getCartByUserId(verified.user_id);
    const cards = [];
    if (!verified.isDummy) {
      const user = await getUserById(verified.user_id);
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
    }
    if (!getCart) {
      return JSON.stringify({ status: "failed" });
    }
    if (getCart.products.length === 0) {
      return JSON.stringify({ status: "failed" });
    }
    return JSON.stringify({ status: "success", cards: cards ?? [] });
  } catch (e: any) {
    if (e.message === "jwt expired") {
      const decoded: any = jwt.decode(token);
      const newToken = jwt.sign(
        { user_id: decoded.user_id, isDummy: decoded.isDummy },
        env.get("VITE_JWTSECRET") ?? "",
        { expiresIn: "1h" }
      );
      cookie.set("token", newToken, { httpOnly: true, path: "/" });
      const getCart: any = await getCartByUserId(decoded.user_id);
      const cards = [];
      if (!decoded.isDummy) {
        const user = await getUserById(decoded.user_id);
        const stripe = new Stripe(
          env.get("VITE_STRIPE_TEST_SECRET_KEY") ?? "",
          {
            apiVersion: "2022-11-15",
          }
        );
        for (const id of user.result?.paymentMethod ?? []) {
          const pay = await stripe.paymentMethods.retrieve(id);
          cards.push({
            id: id,
            card: pay.card,
          });
        }
      }
      if (!getCart) {
        return JSON.stringify({ status: "failed" });
      }
      if (getCart.products.length === 0) {
        return JSON.stringify({ status: "failed" });
      }
      return JSON.stringify({ status: "success", cards: cards ?? [] });
    } else {
      return JSON.stringify({ status: "failed" });
    }
  }
});

export const callServer = server$(async function (
  paymentId: string,
  id: string,
  total: number,
  cart: any
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
      currency: "cad",
      customer: id,
      payment_method: paymentId,
      confirm: true,
    });
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

      await sendConfirmationEmail(
        user.result?.email ?? "",
        `${user.result?.firstName} ${user.result?.lastName}`,
        data.shipping_address,
        data.products
      );
      await sendConfirmationOrderForAdmin(
        `${user.result?.firstName} ${user.result?.lastName}`,
        data.shipping_address,
        data.products
      );
      data.userId = verified.user_id;
      data.shipping_address = user.result?.generalInfo.address;
      data.paymentMethod = "STRIPE";
      data.paymentStatus = "Paid";
      data.order_status = "Pending";
      data.order_number = generateOrderNumber();
      await createOrder(data);
      await deleteCart(verified.user_id);
    }
    return paymentIntent;
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
        console.log(total.value);
        hiddenInput.setAttribute("type", "hidden");
        hiddenInput.setAttribute("name", "stripeToken");
        hiddenInput.setAttribute("value", token.id);
        form?.appendChild(hiddenInput);
        const dataToSend = {
          ...cartContext?.cart,
          token: token.id,
          order_amount: parseFloat(total.value.toString()).toFixed(2),
          email: userContext?.user?.email,
          products: cartContext?.cart?.products,
        };

        const req = await postRequest("/api/paymentConfirmiation", dataToSend);
        const res = await req.json();

        if (res.status === "success") {
          isLoading.value = false;
          window.location.href = "/payment/success";
        } else {
          isLoading.value = false;
          errorEl.innerText = res.message;
        }
      };
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        isLoading.value = true;
        if (finalCard.value && isExistingPaymentMethod.value) {
          const pay = await callServer(
            finalCard.value.id,
            userContext?.user?.stripeCustomerId,
            total.value,
            cartContext?.cart ?? {}
          );
          if (pay.status === "succeeded") {
            isLoading.value = false;
            window.location.href = "/payment/success";
          } else {
            isLoading.value = false;
            alert("Payment Failed");
          }
          return;
        }

        stripe.createToken(cardNo).then((res) => {
          console.log(res);
          // attach the token to the customer object.
          if (res.error) errorEl.innerText = res?.error?.message ?? "";
          else stripeTokenHandler(res.token);
        });
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

      <div class="flex flex-col gap-20 md:p-10">
        <div class="flex flex-col gap-3 justify-center items-center">
          <Steps pageType="payment" />
        </div>
        <div class="flex flex-col md:flex-row gap-10 justify-center items-center">
          <div class="flex flex-col gap-10 justify-center items-start w-full">
            <a
              class="text-black font-bold text-3xl flex flex-row gap-1 items-center cursor-pointer"
              href="/products/"
            >
              <PerviousArrowIconNoStick color="black" width="10%" /> Continue
              Shopping
            </a>
            <ProductList />
          </div>
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
                          checked={index === 0 && isExistingPaymentMethod.value}
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
                cart={cartContext?.cart}
                total={total}
                cards={cards?.value}
                isExistingPaymentMethod={isExistingPaymentMethod.value}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
});
