import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import { verify } from "jsonwebtoken";
import { NextArrowIconNoStick } from "~/components/shared/icons/icons";
import productSchema from "~/express/schemas/product.schema";

interface OrderDetailsProps {
  cart: any;
  total: any;
  cards: any;
  isExistingPaymentMethod: boolean;
  acceptSaveCard: any;
  user: any | null;
  currencyObject?: any;
  subTotal: any;
  taxRate: number;
  shipping: any;
}

export const checker = server$(function () {
  const token = this.cookie.get("token")?.value;
  if (!token) {
    return true;
  } else {
    const verifyToken: any = verify(
      token,
      this.env.get("VITE_JWTSECRET") ?? ""
    );
    if (!verifyToken) {
      return true;
    } else {
      if (!verifyToken.isDummy) {
        return false;
      } else {
        return true;
      }
    }
  }
});

export const checkCatServer = server$(async function (products: any) {
  if (!(products && products?.length)) return false;
  for (const prod of products) {
    if (prod.id.includes(".")) continue;
    const req = await productSchema.find({ _id: prod.id });
    if (req.length !== 0) {
      const cat = req[0]?.categories;
      if (!(cat && cat?.length > 0)) continue;
      if (
        cat[0]?.name?.includes("Trimmers") ||
        cat[0]?.name?.includes("Clippers")
      ) {
        return true;
      }
    }
  }
});

export const OrderDetails = component$((props: OrderDetailsProps) => {
  const {
    cart,
    total,
    isExistingPaymentMethod,
    acceptSaveCard,
    currencyObject,
    user,
    subTotal,
    taxRate,
    shipping,
  } = props;
  const hst = useSignal<number>(0);
  const symbol = useSignal<string>("CAD");
  const isDummy = useSignal<boolean>(true);

  useVisibleTask$(async ({ track }) => {
    track(() => cart?.totalPrice);
    track(() => currencyObject);

    subTotal.value = cart?.totalPrice;
    const checkCopon = localStorage.getItem("copon");
    if (checkCopon === "true") {
      subTotal.value = subTotal.value - subTotal.value * 0.1;
    }
    hst.value = !user?.generalInfo?.address?.country
      ?.toLowerCase()
      ?.includes("united")
      ? (cart?.totalPrice ?? 0) * taxRate
      : 0;

    const checker = await checkCatServer(cart?.products);
    if (checker) {
      shipping.value = 0;
    } else if (subTotal.value > 200) {
      shipping.value = 0;
    } else {
      if (
        user?.generalInfo?.address?.country?.toLowerCase()?.includes("united")
      ) {
        shipping.value = 20;
      } else {
        shipping.value = 15;
      }
    }
    total.value = subTotal.value + hst.value + shipping.value;
    if (currencyObject === "1") {
      symbol.value = "USD";
    } else {
      symbol.value = "CAD";
    }
  });

  useVisibleTask$(async () => {
    const check = await checker();
    isDummy.value = check;
  });

  return (
    <>
      {/** ask the user if he wants to use the perivious payment method */}
      {!isExistingPaymentMethod && (
        <>
          <h2 class="text-white text-xl font-semibold">Card Details</h2>
          <div class="flex flex-row gap-3 justify-center items-end"></div>
        </>
      )}

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
                currency: symbol.value,
              })}
            </p>
          </div>
          <div class="grid grid-cols-2 w-full">
            <p class="text-black text-xs font-light">Tax</p>
            <p class="justify-self-end text-black text-sm font-light">
              {!user?.generalInfo?.address?.country
                ?.toLowerCase()
                ?.includes("united")
                ? hst.value?.toLocaleString("en-US", {
                    style: "currency",
                    currency: symbol.value,
                  })
                : (0.0).toLocaleString("en-US", {
                    style: "currency",
                    currency: symbol.value,
                  })}
            </p>
          </div>
          <div class="grid grid-cols-2 w-full">
            <p class="text-black text-xs font-light">Shipping</p>
            <p class="justify-self-end text-black text-sm font-light">
              {shipping.value?.toLocaleString("en-US", {
                style: "currency",
                currency: symbol.value,
              })}
            </p>
          </div>
          <div class="grid grid-cols-2 w-full">
            <p class="text-black text-xs font-light">Total (Tax incl.)</p>
            <p class="justify-self-end text-black text-sm font-light">
              {total.value?.toLocaleString("en-US", {
                style: "currency",
                currency: symbol.value,
              })}
            </p>
          </div>
        </div>
        <div class="flex flex-col gap-3 justify-center h-full">
          {!isDummy.value && !isExistingPaymentMethod && (
            <div class="flex flex-row gap-3">
              <input
                type="checkbox"
                name="save-card"
                class="checkbox"
                id="save-card"
                onChange$={(e) => {
                  acceptSaveCard.value = e.target.checked;
                }}
              />
              <label for="save-card" class="text-black text-sm font-semibold">
                {" "}
                Save card for future purchases
              </label>
            </div>
          )}
          <button type="submit" class="btn btn-primary text-white w-full">
            <div class="flex flex-row w-full items-center text-xs">
              <div class="flex flex-row gap-1 items-center w-full justify-center text-sm">
                Pay <NextArrowIconNoStick color="white" />
              </div>
            </div>
          </button>
        </div>
      </form>
      <div id="paypal-button-container" style="max-width:1000px;"></div>
      <div class="divider text-white"></div>
    </>
  );
});
