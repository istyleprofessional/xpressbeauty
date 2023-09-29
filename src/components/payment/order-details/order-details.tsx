import {
  component$,
  useContext,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import { loadStripe } from "@stripe/stripe-js";
import { NextArrowIconNoStick } from "~/components/shared/icons/icons";
import { CartContext } from "~/context/cart.context";
import { UserContext } from "~/context/user.context";
import { postRequest } from "~/utils/fetch.utils";

interface OrderDetailsProps {
  isLoading: any;
}

export const OrderDetails = component$((props: OrderDetailsProps) => {
  const { isLoading } = props;
  const cartContext: any = useContext(CartContext);
  const userContext: any = useContext(UserContext);
  const subTotal = useSignal<number>(0);
  const hst = useSignal<number>(0);
  const total = useSignal<number>(0);
  const shipping = useSignal<number>(0);

  useVisibleTask$(({ track }) => {
    track(() => cartContext?.cart?.totalPrice);
    subTotal.value = cartContext?.cart?.totalPrice ?? 0;
    hst.value = (cartContext?.cart?.totalPrice ?? 0) * 0.13;
    if (subTotal.value > 150) {
      shipping.value = 0;
    } else {
      shipping.value = 15;
    }
    total.value =
      (cartContext?.cart?.totalPrice ?? 0) + hst.value + shipping.value;
  });

  useVisibleTask$(
    async ({ track }) => {
      track(() => total.value);
      if (total.value === 0) {
        return;
      }
      console.log(total.value);
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
          theme: "night",
        },
      };
      const elements = stripe.elements(options);
      const paymentElement = elements.create("payment", {
        defaultValues: {
          billingDetails: {
            address: {
              postal_code: userContext?.user?.generalInfo?.address?.postalCode,
              country: userContext?.user?.generalInfo?.address?.country,
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
            return_url: "http://localhost:5173/payment/success",
          },
          redirect: "if_required",
        });
        if (pay.paymentIntent.status === "succeeded") {
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
            isLoading.value = false;
          } else {
            isLoading.value = false;
          }
        } else {
          isLoading.value = false;
        }
      });
    },
    { strategy: "document-idle" }
  );

  return (
    <>
      <h2 class="text-white text-xl font-semibold">Card Details</h2>
      <div class="flex flex-row gap-3 justify-center items-end"></div>
      <form id="payment-form">
        <div id="payment-element"></div>
        <div id="error-message"></div>
        <div class="flex flex-col gap-2 justify-center p-3">
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
            <p class="text-white text-xs font-light">Shipping</p>
            <p class="justify-self-end text-white text-sm font-light">
              {shipping.value?.toLocaleString("en-US", {
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
        </div>

        <button type="submit" class="btn text-black w-full">
          <div class="flex flex-row w-full items-center text-xs">
            <p class="text-sm">
              {total.value?.toLocaleString("en-US", {
                style: "currency",
                currency: "CAD",
              })}
            </p>
            <div class="flex flex-row gap-1 items-center w-full justify-center text-sm">
              Checkout <NextArrowIconNoStick color="black" />
            </div>
          </div>
        </button>
      </form>
      <div class="divider text-white"></div>
    </>
  );
});
