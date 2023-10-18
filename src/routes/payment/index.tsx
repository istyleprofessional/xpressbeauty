import {
  component$,
  useContext,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import { PerviousArrowIconNoStick } from "~/components/shared/icons/icons";
import { Steps } from "~/components/shared/steps/steps";
import { ProductList } from "~/components/cart/product-list/product-list";
import { OrderDetails } from "~/components/payment/order-details/order-details";
import { routeLoader$ } from "@builder.io/qwik-city";
import jwt from "jsonwebtoken";
import { getCartByUserId } from "~/express/services/cart.service";
import { UserContext } from "~/context/user.context";
import { loadStripe } from "@stripe/stripe-js";
import { postRequest } from "~/utils/fetch.utils";
import { CartContext } from "~/context/cart.context";

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
    if (!getCart) {
      return JSON.stringify({ status: "failed" });
    }
    if (getCart.products.length === 0) {
      return JSON.stringify({ status: "failed" });
    }
    return JSON.stringify({ status: "success" });
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
      if (!getCart) {
        return JSON.stringify({ status: "failed" });
      }
      if (getCart.products.length === 0) {
        return JSON.stringify({ status: "failed" });
      }
      return JSON.stringify({ status: "success" });
    } else {
      return JSON.stringify({ status: "failed" });
    }
  }
});

export default component$(() => {
  const isLoading = useSignal<boolean>(false);
  const paymentRoute = JSON.parse(usePaymentRoute().value);
  const userContext: any = useContext(UserContext);
  const cartContext: any = useContext(CartContext);
  const total = useSignal<number>(0);

  useVisibleTask$(
    () => {
      if (paymentRoute.status === "failed") {
        window.location.href = "/cart";
      }
    },
    { strategy: "document-idle" }
  );

  useVisibleTask$(
    async ({ track }) => {
      track(() => total.value);
      if (total.value === 0) {
        return;
      }
      const stripe: any = await loadStripe(
        import.meta.env.VITE_STRIPE_TEST_PUBLISHABLE_KEY ?? ""
      );

      const data = {
        amount: total.value,
      };
      const request = await postRequest("/api/stripe/secret", data);
      const secret = await request.json();
      const options = {
        clientSecret: secret.clientSecret,
        appearance: {
          theme: "night",
        },
      };
      const elements = stripe.elements(options);
      const paymentElement = elements.create("payment", {
        card: {
          classes: {
            base: "text-white",
          },
        },
        defaultValues: {
          billingDetails: {
            address: {
              postal_code: userContext?.user?.generalInfo?.address?.postalCode,
              country:
                userContext?.user?.generalInfo?.address?.country ===
                "United States"
                  ? "US"
                  : "CA",
            },
          },
        },
      });
      paymentElement.mount("#payment-element");
      const form = document.getElementById("payment-form");
      form?.addEventListener("submit", async (e) => {
        e.preventDefault();
        isLoading.value = true;

        const pay = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: "https://xpressbeauty.ca/payment/success",
          },
          redirect: "if_required",
        });
        if (
          pay?.paymentIntent?.status &&
          pay?.paymentIntent?.status === "succeeded"
        ) {
          isLoading.value = false;
          const dataToBeSent = cartContext?.cart;
          dataToBeSent.order_amount = parseFloat(
            total.value.toString()
          ).toFixed(2);
          dataToBeSent.payment_status = pay.paymentIntent.status;
          dataToBeSent.payment_method = "stripe";
          dataToBeSent.payment_id = pay.paymentIntent.id;
          const emailReq = await postRequest(
            "/api/paymentConfirmiation",
            dataToBeSent
          );
          const emailRes = await emailReq.json();
          if (emailRes.status === "success") {
            window.location.href = "/payment/success";
          }
        }
        isLoading.value = false;
      });
    },
    { strategy: "document-idle" }
  );

  return (
    <>
      {isLoading.value && (
        <div class="w-full backdrop-blur-lg drop-shadow-lg fixed z-20 m-auto inset-x-0 inset-y-0 ">
          <progress class="progress progress-white w-56 fixed z-20 m-auto inset-x-0 inset-y-0  bg-black"></progress>
        </div>
      )}
      <div class="flex flex-col gap-20 md:p-10">
        <div class="flex flex-col gap-3 justify-center items-center">
          <Steps pageType="payment" />
        </div>
        <div class="flex flex-col md:flex-row gap-10 justify-center items-center">
          <div class="flex flex-col gap-4 justify-center items-start w-full">
            <a class="text-black font-bold text-3xl flex flex-row gap-1 items-center cursor-pointer">
              <PerviousArrowIconNoStick color="black" width="10%" /> Continue
              Shopping
            </a>
            <ProductList />
          </div>
          <div class="bg-black h-full w-96 rounded-lg flex flex-col gap-3 p-5">
            <OrderDetails cart={cartContext?.cart} total={total} />
          </div>
        </div>
      </div>
    </>
  );
});
