import {
  component$,
  useContext,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import { loadStripe } from "@stripe/stripe-js";
import { Steps } from "~/components/shared/steps/steps";
import { CartContext } from "~/context/cart.context";
import { CurContext } from "~/context/cur.context";
import { UserContext } from "~/context/user.context";
import { getRequest, postRequest } from "~/utils/fetch.utils";
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
  const confirmationStep = useSignal<string>("payment");
  const checkoutRef = useSignal<HTMLDivElement>();
  const nav = useNavigate();

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
        // pass sessionId to the callback to complete the checkout
        onComplete: async () => {
          const req: any = await getRequest(
            `${import.meta.env.VITE_APPURL
            }/api/stripe?session_id=${sessionId}&userId=${cartData.cart.userId
            }&currency=${currencyObject}&shipping=${shipping.value}&isGuest=${userObject.isDummy
            }`
          );
          const data = await req.json();
          if (data.message === "Payment failed") {
            nav("/payment");
            alert("Payment failed");
          }

          gtag_report_conversion(data.order_id);
          confirmationStep.value = "confirmation";

          if (checkoutRef.value) {
            const text = checkoutRef.value.querySelector(".Payment__Checkout");
            if (text) text.innerHTML = "Thank you for your purchase!";
          }
        }, //pass sessionId to the callback to complete the checkout
      });

      // Mount Checkout
      checkout.mount("#checkout");

      isLoading.value = false;
    } catch (error) {
      console.log(error);
    }
  });

  return (
    <>
      <div class="flex flex-col gap-5 md:p-10 justify-center items-center">
        <Steps pageType={confirmationStep.value} />
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
