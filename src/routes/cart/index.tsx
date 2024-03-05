import {
  component$,
  useContext,
  useSignal,
  useVisibleTask$,
  $,
} from "@builder.io/qwik";
import { PerviousArrowIconNoStick } from "~/components/shared/icons/icons";
import { Steps } from "~/components/shared/steps/steps";
import { CartDetails } from "~/components/cart/cart-details/cart-details";
import { ProductList } from "~/components/cart/product-list/product-list";
import type { DocumentHead } from "@builder.io/qwik-city";
import { server$, useLocation, useNavigate } from "@builder.io/qwik-city";
import { CartContext } from "~/context/cart.context";
import { CurContext } from "~/context/cur.context";
import { connect } from "~/express/db.connection";
import products from "~/express/schemas/product.schema";

export const changeToken = server$(async function (token: string) {
  this.cookie.set("token", token, {
    path: "/",
    httpOnly: true,
  });
});

export const serverQuantityChecker = server$(async function (
  productChecker: any
) {
  await connect();
  const productsIds = productChecker.map((product: any) => product.id);
  for (const productId of productsIds) {
    if (productId.includes(".")) {
      const [id, variant] = productId.split(".");
      const product = await products.findOne({ _id: id });
      if (product) {
        for (const variantItem of product.variations) {
          if (
            variantItem.variation_id === variant ||
            variantItem.variation_name.replace(/[^A-Za-z0-9]+/g, "") === variant
          ) {
            if (
              !variantItem.quantity_on_hand ||
              variantItem.quantity_on_hand === 0
            ) {
              return JSON.stringify({
                msg: `${product.product_name} - ${variantItem.variation_name} is out of stock please remove it from your cart`,
              });
            }
          }
        }
      }
    } else {
      const product = await products.findOne({ _id: productId });
      if (product) {
        if (!product.quantity_on_hand || product.quantity_on_hand === 0) {
          return JSON.stringify({
            msg: `${product.product_name} is out of stock please remove it from your cart`,
          });
        }
      }
    }
  }
  return JSON.stringify({ msg: "ok" });
});

export default component$(() => {
  const isLoading = useSignal<boolean>(false);
  const loc = useLocation();
  const token = loc.url.searchParams.get("token");
  const context: any = useContext(CartContext);
  const currencyObject: any = useContext(CurContext);
  const nav = useNavigate();

  const checkIfProductQuantityExist = $(async () => {
    const productChecker = context?.cart?.products;
    const req = await serverQuantityChecker(productChecker);
    const res = JSON.parse(req ?? "{}");
    console.log(res);
    if (res.msg !== "ok") {
      alert(res.msg);
    } else {
      nav("/payment");
    }
  });

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
        <div class="flex flex-col md:flex-row gap-5 justify-center items-start mb-2">
          <ProductList currencyObject={currencyObject} />
          <div class="bg-black h-full w-96 rounded-lg flex flex-col gap-3 p-5 md:sticky md:top-0 ">
            <CartDetails
              currencyObject={currencyObject}
              checkIfProductQuantityExist={checkIfProductQuantityExist}
            />
          </div>
        </div>
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "Xpress Beauty | Cart",
  links: [
    {
      rel: "canonical",
      href: "https://xpressbeauty.ca/cart/",
    },
  ],
  meta: [
    {
      name: "description",
      content: "Cart - XpressBeauty",
    },
  ],
};
