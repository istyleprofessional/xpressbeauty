import {
  component$,
  useContext,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import { loadStripe } from "@stripe/stripe-js";
import { Steps } from "~/components/shared/steps/steps";
import { CartContext } from "~/context/cart.context";
import { CurContext } from "~/context/cur.context";
import { UserContext } from "~/context/user.context";
import productSchema from "~/express/schemas/product.schema";
import { postRequest } from "~/utils/fetch.utils";

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

export default component$(() => {
  const cartData: any = useContext(CartContext);
  const shipping = useSignal<number>(0);
  const currencyObjectConx: any = useContext(CurContext);
  const currencyObject = currencyObjectConx?.cur;
  const userObject: any = useContext(UserContext);
  const isLoading = useSignal<boolean>(true);

  useVisibleTask$(async () => {
    try {
      if (!cartData.cart || cartData.cart?.products?.length === 0) {
        window.location.href = "/cart";
      }
      const checker = await checkCatServer(cartData.cart?.products);
      if (checker) {
        shipping.value = 0;
      } else {
        shipping.value = 15;
      }
      const stripe: any = await loadStripe(
        import.meta.env.VITE_STRIPE_TEST_PUBLISHABLE_KEY ?? ""
      );

      cartData.cart.shipping = shipping.value;
      cartData.cart.currencyObject = currencyObject;
      cartData.cart.user = userObject;
      console.log(cartData.cart.user);
      const response = await postRequest("/api/stripe", cartData.cart);
      const { clientSecret } = await response.json();
      const checkout = await stripe.initEmbeddedCheckout({
        clientSecret,
        onComplete: () => {
          console.log("Checkout completed");
        },
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
        <Steps pageType="payment" />
        {isLoading.value && (
          <div class="flex flex-col gap-4 w-52">
            <div class="skeleton h-32 w-full"></div>
            <div class="skeleton h-4 w-28"></div>
            <div class="skeleton h-4 w-full"></div>
            <div class="skeleton h-4 w-full"></div>
          </div>
        )}
      </div>

      <div id="checkout" class="checkout pb-6"></div>
    </>
  );
});
