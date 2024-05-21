import {
  component$,
  useSignal,
  // useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
// import axios from "axios";
import jwt from "jsonwebtoken";
// import { verify } from "jsonwebtoken";
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
  isLoading: any;
  isGoodToGo: boolean;
}

export const checker = server$(function () {
  const token = this.cookie.get("token")?.value;
  if (!token) {
    return true;
  } else {
    const verifyToken: any = jwt.verify(
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
  const { cart, total, currencyObject, user, subTotal, taxRate, shipping } =
    props;
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
      shipping.value = 15;
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
      <div id="checkout"></div>
    </>
  );
});
