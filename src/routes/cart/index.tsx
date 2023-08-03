import { component$, useSignal } from "@builder.io/qwik";
import { PerviousArrowIconNoStick } from "~/components/shared/icons/icons";
import { Steps } from "~/components/shared/steps/steps";
import { CartDetails } from "~/components/cart/cart-details/cart-details";
import { ProductList } from "~/components/cart/product-list/product-list";

export default component$(() => {
  const isLoading = useSignal<boolean>(false);

  return (
    <>
      {isLoading.value && (
        <div class="w-full backdrop-blur-lg drop-shadow-lg fixed z-20 m-auto inset-x-0 inset-y-0 ">
          <progress class="progress progress-white w-56 fixed z-20 m-auto inset-x-0 inset-y-0  bg-black"></progress>
        </div>
      )}
      <div class="flex flex-col gap-20 p-10">
        <div class="flex flex-col gap-3 justify-center items-center">
          <Steps pageType="cart" />
        </div>
        <div class="flex flex-row gap-10 justify-center items-center">
          <div class="flex flex-col gap-4 justify-center items-start w-full">
            <a class="text-black font-bold text-3xl flex flex-row gap-1 items-center cursor-pointer">
              <PerviousArrowIconNoStick color="black" width="10%" /> Continue
              Shopping
            </a>
            <ProductList />
          </div>
          <div class="bg-black h-full w-96 rounded-lg flex flex-col gap-3 p-5">
            <CartDetails isLoading={isLoading} />
          </div>
        </div>
      </div>
    </>
  );
});
