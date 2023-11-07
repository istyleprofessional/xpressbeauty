import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { NextArrowIconNoStick } from "~/components/shared/icons/icons";

interface OrderDetailsProps {
  cart: any;
  total: any;
  cards: any;
  isExistingPaymentMethod: boolean;
}

export const OrderDetails = component$((props: OrderDetailsProps) => {
  const { cart, total, isExistingPaymentMethod } = props;
  const subTotal = useSignal<number>(0);
  const hst = useSignal<number>(0);
  const shipping = useSignal<number>(0);

  useVisibleTask$(({ track }) => {
    track(() => cart?.totalPrice);
    subTotal.value = cart?.totalPrice ?? 0;
    // hst.value = (cart?.totalPrice ?? 0) * 0.13;
    if (subTotal.value > 150) {
      shipping.value = 0;
    } else {
      shipping.value = 15;
    }
    total.value = (cart?.totalPrice ?? 0) + shipping.value;
  });
  return (
    <>
      <h2 class="text-white text-xl font-semibold">Card Details</h2>
      <div class="flex flex-row gap-3 justify-center items-end"></div>
      {/** ask the user if he wants to use the perivious payment method */}

      <form
        id="payment-form"
        class="bg-white shadow-md flex-col flex rounded px-8 pt-6 pb-8 mb-4"
      >
        {!isExistingPaymentMethod && (
          <>
            <div class="mb-4">
              <label
                for="card-element"
                class="block text-gray-700 text-sm font-bold mb-2"
              >
                Card Number
              </label>
              <div
                id="card-element"
                class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              ></div>
            </div>

            <div class="mb-4">
              <label
                for="card-expiration"
                class="block text-gray-700 text-sm font-bold mb-2"
              >
                Expiration Date
              </label>
              <div
                id="card-expiration"
                class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              ></div>
            </div>

            <div class="mb-4">
              <label
                for="card-cvc"
                class="block text-gray-700 text-sm font-bold mb-2"
              >
                CVC
              </label>
              <div
                id="card-cvc"
                class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              ></div>
            </div>

            <div
              id="card-errors"
              role="alert"
              class=" text-error text-sm mb-4"
            ></div>
          </>
        )}

        <div class="flex flex-col gap-2 justify-center p-3">
          <div class="grid grid-cols-2 w-full">
            <p class="text-black text-xs font-light">Subtotal</p>
            <p class="justify-self-end text-black text-sm font-light">
              {subTotal.value?.toLocaleString("en-US", {
                style: "currency",
                currency: "CAD",
              })}
            </p>
          </div>
          <div class="grid grid-cols-2 w-full">
            <p class="text-black text-xs font-light">HST</p>
            <p class="justify-self-end text-black text-sm font-light">
              {hst.value?.toLocaleString("en-US", {
                style: "currency",
                currency: "CAD",
              })}
            </p>
          </div>
          <div class="grid grid-cols-2 w-full">
            <p class="text-black text-xs font-light">Shipping</p>
            <p class="justify-self-end text-black text-sm font-light">
              {shipping.value?.toLocaleString("en-US", {
                style: "currency",
                currency: "CAD",
              })}
            </p>
          </div>
          <div class="grid grid-cols-2 w-full">
            <p class="text-black text-xs font-light">Total (Tax incl.)</p>
            <p class="justify-self-end text-black text-sm font-light">
              {total.value?.toLocaleString("en-US", {
                style: "currency",
                currency: "CAD",
              })}
            </p>
          </div>
        </div>

        <button type="submit" class="btn btn-primary text-white w-full">
          <div class="flex flex-row w-full items-center text-xs">
            <div class="flex flex-row gap-1 items-center w-full justify-center text-sm">
              Pay <NextArrowIconNoStick color="white" />
            </div>
          </div>
        </button>
      </form>
      <div class="divider text-white"></div>
    </>
  );
});
