import {
  component$,
  useContext,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import { PerviousArrowIconNoStick } from "~/components/shared/icons/icons";
import { Steps } from "~/components/shared/steps/steps";
import { CartDetails } from "~/components/cart/cart-details/cart-details";
import { ProductList } from "~/components/cart/product-list/product-list";
import { server$, useLocation } from "@builder.io/qwik-city";
import { CartContext } from "~/context/cart.context";

export const changeToken = server$(async function (token: string) {
  this.cookie.set("token", token, {
    path: "/",
    httpOnly: true,
  });
});

export default component$(() => {
  const isLoading = useSignal<boolean>(false);
  const loc = useLocation();
  const token = loc.url.searchParams.get("token");
  const context: any = useContext(CartContext);

  useVisibleTask$(
    async () => {
      localStorage.setItem("prev", "/cart/");
      if (token) {
        await changeToken(token);
        location.href = "/cart/";
      }
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
      <div class="flex flex-col gap-5 md:p-10 justify-start">
        <div class="flex flex-col gap-3 justify-center items-center">
          <Steps pageType="cart" />
        </div>
        <a
          class="text-black font-bold text-base lg:text-3xl flex flex-row gap-1 items-center cursor-pointer"
          href="/products/"
        >
          <PerviousArrowIconNoStick color="black" width="10%" /> Continue
          Shopping
        </a>
        <div class="pl-6 flex flex-col gap-4">
          <p class="text-black font-semibold text-sm md:text-base">
            Shopping cart
          </p>
          <p class="text-black text-xs md:text-base">
            {context?.cart && context?.cart?.totalQuantity > 0
              ? `You have ${context?.cart?.totalQuantity} item in your cart`
              : "You have 0 item in your cart"}
          </p>
        </div>
        <div class="flex flex-col-reverse md:flex-row gap-2 justify-center items-start">
          <ProductList />
          <div class="bg-black h-full w-96 rounded-lg flex flex-col gap-3 p-5 lg:m-5 md:sticky md:top-0">
            <CartDetails />
          </div>
        </div>
      </div>
    </>
  );
});
