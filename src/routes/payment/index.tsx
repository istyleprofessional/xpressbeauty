import {
  component$,
  useContext,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import { loadStripe } from "@stripe/stripe-js";
import { Steps } from "~/components/shared/steps/steps";
import { CartContext } from "~/context/cart.context";
import { CurContext } from "~/context/cur.context";
import { UserContext } from "~/context/user.context";
import { postRequest } from "~/utils/fetch.utils";
declare const gtag: Function;

export function gtag_report_conversion(transactionId: string) {
  gtag("event", "conversion", {
    send_to: "AW-11167601664/ApSoCLPu2IwZEICokM0p",
    transaction_id: transactionId,
  });
  return false;
}

export default component$(() => {
  const cartData: any = useContext(CartContext);
  const shipping = useSignal<number>(0);
  const currencyObjectConx: any = useContext(CurContext);
  const currencyObject = currencyObjectConx?.cur;
  const userObject: any = useContext(UserContext);
  const isLoading = useSignal<boolean>(true);
  const checkoutRef = useSignal<HTMLDivElement>();
  const loc = useLocation();
  const error = loc.url.searchParams.get("error");
  const errorSignal = useSignal<string>(error ?? "");

  useVisibleTask$(async () => {
    try {
      if (!cartData.cart || cartData.cart?.products?.length === 0) {
        window.location.href = "/cart";
      }
      shipping.value = cartData.cart.shipping;
      const stripe: any = await loadStripe(
        import.meta.env.VITE_STRIPE_TEST_PUBLISHABLE_KEY ?? ""
      );

      cartData.cart.shipping = shipping.value;
      cartData.cart.currencyObject = currencyObject;
      cartData.cart.user = userObject;
      const response = await postRequest("/api/stripe/", cartData.cart);
      const { clientSecret, sessionId } = await response.json();
      const checkout = await stripe.initEmbeddedCheckout({
        clientSecret,
        onComplete: async () => {
          gtag_report_conversion(sessionId);

          window.location.href = `/api/stripe?session_id=${sessionId}&userId=${cartData.cart.userId
            }&currency=${currencyObject}&shipping=${shipping.value}&isGuest=${userObject.isDummy
            }`

        },
      });

      // Mount Checkout
      checkout.mount("#checkout");

      isLoading.value = false;
    } catch (error) {
      console.log(error);
    }
  });

  useVisibleTask$(({ track, cleanup }) => {
    track(() => errorSignal.value)
    if (errorSignal.value !== "") {
      const timer = setTimeout(() => {
        errorSignal.value = "";
      }
        , 3000);
      cleanup(() => clearTimeout(timer));
    }
  });


  return (
    <>
      {errorSignal.value && (
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong class="font-bold">Error! </strong>
          <span class="block sm:inline">
            {error === "payment-failed" ? "Payment failed. Please try again." : "An error occurred. Please try again."}

          </span>
        </div>
      )}
      <div class="flex flex-col gap-5 md:p-10 justify-center items-center">
        <Steps pageType="payment" />
        {isLoading.value && (
          <div class="flex flex-col gap-4 w-52">
            <div class="skeleton h-32 w-full"></div>
            <div class="skeleton h-4 w-28"></div>
            <div class="skeleton h-4 w-full"></div>
            <div class="skeleton h-4 w-full"></div>
          </div>
        )}
      </div>

      <div id="checkout" ref={checkoutRef} class="checkout pb-6"></div>
    </>
  );
});
