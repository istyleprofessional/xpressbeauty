import {
  component$,
  useContext,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import { loadStripe } from "@stripe/stripe-js";
import { NextArrowIconNoStick } from "~/components/shared/icons/icons";
import { CartContext } from "~/context/cart.context";
import { postRequest } from "~/utils/fetch.utils";

interface OrderDetailsProps {
  isLoading: any;
}

export const OrderDetails = component$((props: OrderDetailsProps) => {
  const { isLoading } = props;
  // console.log(isLoading);
  const cartContext: any = useContext(CartContext);
  const subTotal = useSignal<number>(0);
  const hst = useSignal<number>(0);
  const total = useSignal<number>(0);

  useVisibleTask$(({ track }) => {
    track(() => cartContext?.cart?.totalPrice);
    subTotal.value = cartContext?.cart?.totalPrice ?? 0;
    hst.value = (cartContext?.cart?.totalPrice ?? 0) * 0.13;
    total.value = (cartContext?.cart?.totalPrice ?? 0) + hst.value;
  });

  useVisibleTask$(
    async () => {
      const stripe: any = await loadStripe(
        process.env.STRIPE_TEST_PUBLISHABLE_KEY ?? ""
      );
      const data = {
        amount: total.value,
      };
      const request = await postRequest("/api/stripe/secret", data);
      const secret = await request.json();
      const options = {
        clientSecret: secret.clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#0570de",
            colorDanger: "#df1b41",
            fontFamily: "Ideal Sans, system-ui, sans-serif",
            spacingUnit: "2px",
            borderRadius: "4px",
          },
        },
      };
      const elements = stripe.elements(options);
      const paymentElement = elements.create("payment");
      paymentElement.mount("#payment-element");
      const form = document.getElementById("payment-form");
      form?.addEventListener("submit", async (e) => {
        e.preventDefault();
        isLoading.value = true;
        const pay = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: "http://localhost:5173/payment/success",
          },
          redirect: "if_required",
        });
        if (pay.paymentIntent.status === "succeeded") {
          isLoading.value = false;
          const data = cartContext?.cart;
          const emailReq = await postRequest("/api/paymentConfirmiation", data);
          console.log(emailReq);
          // location.href = "/payment/success";
        }
      });
    },
    { strategy: "document-idle" }
  );

  return (
    <>
      <h2 class="text-white text-xl font-semibold">Card Details</h2>
      <div class="flex flex-row gap-3 justify-center items-end"></div>
      <div class="flex flex-col gap-6 justify-center">
        <form id="payment-form">
          <div id="payment-element"></div>
          <div id="error-message"></div>
          <div class="grid grid-cols-2 w-full">
            <p class="text-white text-xs font-light">Subtotal</p>
            <p class="justify-self-end text-white text-sm font-light">
              {subTotal.value?.toLocaleString("en-US", {
                style: "currency",
                currency: "CAD",
              })}
            </p>
          </div>
          <div class="grid grid-cols-2 w-full">
            <p class="text-white text-xs font-light">HST</p>
            <p class="justify-self-end text-white text-sm font-light">
              {hst.value?.toLocaleString("en-US", {
                style: "currency",
                currency: "CAD",
              })}
            </p>
          </div>
          <div class="grid grid-cols-2 w-full">
            <p class="text-white text-xs font-light">Total (Tax incl.)</p>
            <p class="justify-self-end text-white text-sm font-light">
              {total.value?.toLocaleString("en-US", {
                style: "currency",
                currency: "CAD",
              })}
            </p>
          </div>
          <button type="submit" class="btn text-black">
            <div class="flex flex-row w-full items-center">
              <p class="text-sm">
                {total.value?.toLocaleString("en-US", {
                  style: "currency",
                  currency: "CAD",
                })}
              </p>
              <div class="flex flex-row gap-1 items-center w-full justify-end">
                Checkout <NextArrowIconNoStick color="black" width="10%" />
              </div>
            </div>
          </button>
        </form>
      </div>
      <div class="divider text-white"></div>
    </>
  );
});
