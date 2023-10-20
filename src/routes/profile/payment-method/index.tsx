import {
  component$,
  useContext,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import { loadStripe } from "@stripe/stripe-js";
import { UserContext } from "~/context/user.context";
import { postRequest } from "~/utils/fetch.utils";
import Stripe from "stripe";

export const getSecret = server$(async function (stripeCustomerId) {
  console.log(stripeCustomerId);
  const stripe = new Stripe(this.env.get("VITE_STRIPE_TEST_SECRET_KEY") ?? "", {
    apiVersion: "2022-11-15",
  });
  const paymentIntent = await stripe.customers.retrieve(stripeCustomerId);
  console.log(paymentIntent);
  return JSON.stringify({ clientSecret: paymentIntent });
});

export default component$(() => {
  const userContext: any = useContext(UserContext);
  const isLoading = useSignal<boolean>(false);

  useVisibleTask$(
    async () => {
      // const stripe: any = await loadStripe(
      //   import.meta.env.VITE_STRIPE_TEST_PUBLISHABLE_KEY ?? ""
      // );
      const secret = await getSecret(userContext.user.stripeCustomerId);
      console.log(secret);
      // console.log(secret);
      // const options = {
      //   clientSecret: secret.clientSecret,
      //   appearance: {
      //     theme: "night",
      //   },
      // };
      // const elements = stripe.elements(options);
      // const paymentElement = elements.create("payment", {
      //   card: {
      //     classes: {
      //       base: "text-white",
      //     },
      //   },
      //   defaultValues: {
      //     billingDetails: {
      //       address: {
      //         postal_code: userContext?.user?.generalInfo?.address?.postalCode,
      //         country:
      //           userContext?.user?.generalInfo?.address?.country ===
      //           "United States"
      //             ? "US"
      //             : "CA",
      //       },
      //     },
      //   },
      // });
      // paymentElement.mount("#payment-element");
      // const form = document.getElementById("payment-form");
      // form?.addEventListener("submit", async (e) => {
      //   e.preventDefault();
      //   isLoading.value = true;

      //   const pay = await stripe.confirmPayment({
      //     elements,
      //     confirmParams: {
      //       return_url: "https://xpressbeauty.ca/payment/success",
      //     },
      //     redirect: "if_required",
      //   });
      //   if (
      //     pay?.paymentIntent?.status &&
      //     pay?.paymentIntent?.status === "succeeded"
      //   ) {
      //     isLoading.value = false;
      //     const dataToBeSent: any = {};
      //     dataToBeSent.payment_status = pay.paymentIntent.status;
      //     dataToBeSent.payment_method = "stripe";
      //     dataToBeSent.payment_id = pay.paymentIntent.id;
      //     const emailReq = await postRequest(
      //       "/api/paymentConfirmiation",
      //       dataToBeSent
      //     );
      //     const emailRes = await emailReq.json();
      //     if (emailRes.status === "success") {
      //       window.location.href = "/payment/success";
      //     }
      //   }
      //   isLoading.value = false;
      // });
    },
    { strategy: "document-idle" }
  );

  return (
    <div>
      <h1>Payment</h1>
    </div>
  );
});
