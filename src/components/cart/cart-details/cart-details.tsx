import {
  component$,
  useContext,
  useSignal,
  $,
  useVisibleTask$,
} from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import { NextArrowIconNoStick } from "~/components/shared/icons/icons";
import { CartContext } from "~/context/cart.context";
import { UserContext } from "~/context/user.context";
import productSchema from "~/express/schemas/product.schema";
import usersSchema from "~/express/schemas/users.schema";

export const checkCatServer = server$(async function (products: any) {
  if (!(products && products?.length)) return false;
  for (const prod of products) {
    if (prod.id.includes(".")) continue;
    const req = await productSchema.find({ _id: prod.id });
    if (req.length !== 0) {
      const cat = req[0].categories;
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

export const checkCoponServer = server$(async function (
  copon: string,
  user_id: string
) {
  if (copon === "xpressbeauty10") {
    // find user id and check if he used this copon before in cobone array
    const checkIfUserUsed = await usersSchema.findOne({
      _id: user_id,
      cobone: { $elemMatch: { code: copon } },
    });
    if (checkIfUserUsed) {
      const filterCopon = checkIfUserUsed.cobone.filter(
        (copons: any) => copons.code === copon
      );
      if (filterCopon[0].status) {
        return false;
      } else {
        return true;
      }
    }
    await usersSchema.updateOne(
      { _id: user_id },
      { $push: { cobone: { code: copon, status: false } } }
    );
    return true;
  } else {
    return false;
  }
});

export const CartDetails = component$((props: any) => {
  const cartContext: any = useContext(CartContext);
  const userContext: any = useContext(UserContext);
  const subTotal = useSignal<number>(0);
  const total = useSignal<number>(0);
  const shipping = useSignal<number>(0);
  const coponSignal = useSignal<string>("");
  const symbol = useSignal<string>("CAD");
  const applyCoponMessage = useSignal<string>("");

  useVisibleTask$(async ({ track }) => {
    track(() => cartContext?.cart?.totalPrice);
    track(() => props?.currencyObject.cur);

    subTotal.value = cartContext?.cart?.totalPrice;
    const checkCopon = localStorage.getItem("copon");
    if (checkCopon === "true") {
      subTotal.value = subTotal.value - subTotal.value * 0.1;
      applyCoponMessage.value = "Copon Applied";
    }
    total.value = subTotal.value;
    if (props?.currencyObject?.cur === "1") {
      symbol.value = "USD";
    } else {
      symbol.value = "CAD";
    }
  });

  const handleAddCopon = $(async () => {
    const checkCopon = await checkCoponServer(
      coponSignal.value,
      userContext?.user?._id
    );
    if (checkCopon) {
      subTotal.value = cartContext?.cart?.totalPrice;
      subTotal.value = subTotal.value - subTotal.value * 0.1;
      const checker = await checkCatServer(cartContext?.cart?.products);
      if (checker) {
        shipping.value = 0.0;
      } else if (subTotal.value > 200) {
        shipping.value = 0.0;
      } else {
        shipping.value = 15;
      }
      total.value = subTotal.value + shipping.value;
      if (props?.currencyObject?.cur === "1") {
        symbol.value = "USD";
      } else {
        symbol.value = "CAD";
      }
      applyCoponMessage.value = "Copon Applied";
      localStorage.setItem("copon", "true");
    } else {
      applyCoponMessage.value = "Copon is not valid or already used";
      localStorage.setItem("copon", "false");
    }
  });

  return (
    <>
      <h2 class="text-white text-xl font-semibold">Order Details</h2>
      {userContext?.isDummy === false && (
        <div class="flex flex-col gap-3 justify-center items-center py-8">
          <input
            type="text"
            class="input"
            placeholder="Enter Promo Code"
            onChange$={(e: any) => {
              coponSignal.value = e.target.value;
            }}
          />
          <button
            class="btn btn-sm bg-neutral-800 text-white font-['Inter'] w-fit rounded-sm"
            onClick$={handleAddCopon}
          >
            Apply
          </button>
          {applyCoponMessage.value && (
            <p
              class={`text-xs ${
                applyCoponMessage?.value?.includes("Applied")
                  ? "text-success"
                  : "text-error"
              }`}
            >
              {applyCoponMessage.value}
            </p>
          )}
        </div>
      )}
      <div class="flex flex-col gap-5 justify-center">
        <div class="grid grid-cols-2 w-full">
          <p class="text-white text-xs font-light">Subtotal</p>
          <p class="justify-self-end text-white text-sm font-light">
            {subTotal?.value &&
              subTotal?.value?.toLocaleString("en-US", {
                style: "currency",
                currency: symbol.value,
              })}
          </p>
        </div>
        <div class="grid grid-cols-2 w-full">
          <p class="text-white text-xs font-light">TAX</p>
          <p class="justify-self-end text-white text-xs font-light w-full">
            Continue To Calculate Tax...
          </p>
        </div>
        <div class="grid grid-cols-2 w-full">
          <p class="text-white text-xs font-light">Shipping</p>
          <p class="justify-self-end text-white text-xs font-light">
            Continue To Calculate Shipping...
          </p>
        </div>
      </div>
      {userContext?.user?.email ? (
        <a
          class={`btn text-black  normal-case ${
            cartContext?.cart?.products &&
            cartContext?.cart?.products.length === 0
              ? "disabled"
              : ""
          }`}
          href="/checkout"
        >
          Checkout <NextArrowIconNoStick color="black" width="10%" />
        </a>
      ) : (
        <>
          <a
            class={`btn bg-emerald-600 text-white hover:bg-emerald-900  normal-case ${
              cartContext?.cart?.products &&
              cartContext?.cart?.products.length === 0
                ? "disabled"
                : ""
            }`}
            href="/login"
          >
            Login or Register
          </a>
          <div class="divider divider-neutral"></div>
          <div
            class=" bg-red-900 text-white px-4 py-3 rounded relative"
            role="alert"
          >
            <p class="text-sm">
              Please note: If you proceed with guest checkout, you will receive
              order notifications by email only. Tracking information will not
              be available for guest orders. If you would like to track your
              order and enjoy other benefits, we recommend logging in or
              creating an account.
            </p>
          </div>

          <a
            class={`btn text-black  normal-case ${
              cartContext?.cart?.products &&
              cartContext?.cart?.products.length === 0
                ? "disabled"
                : ""
            }`}
            href="/checkout"
          >
            Guest Checkout <NextArrowIconNoStick color="black" width="10%" />
          </a>
        </>
      )}
    </>
  );
});
