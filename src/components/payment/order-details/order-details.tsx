import {
  component$,
  useSignal,
  // useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
// import axios from "axios";
import { verify } from "jsonwebtoken";
import { NextArrowIconNoStick } from "~/components/shared/icons/icons";
import productSchema from "~/express/schemas/product.schema";
import { User } from "~/express/schemas/users.schema";
import { deleteCart } from "~/express/services/cart.service";
import { createOrder } from "~/express/services/order.service";
import { generateOrderNumber } from "~/utils/generateOrderNo";
import { sendConfirmationEmail } from "~/utils/sendConfirmationEmail";
import { sendConfirmationOrderForAdmin } from "~/utils/sendConfirmationOrderForAdmin";

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

export const chargeCus = server$(async function (data: any) {
  console.log(data);
  try {
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${data.apiAccessKey}`,
      },
      body: JSON.stringify({
        orderId: "1",
        currency: data.currency,
        amount: data.amount,
        source: data.cardTok,
      }),
    };
    const charge: any = await fetch(
      `https://scl-${this.env
        .get("VITE_CLOVER_URL")
        ?.replace("https://", "")}/v1/charges`,
      options
    );
    const chargeRes = await charge.json();
    const dataToSend: any = {};
    dataToSend.order_number = generateOrderNumber();
    dataToSend.order_amount = data.amount / 100;
    dataToSend.userId = data.user._id;
    dataToSend.shipping_address = data.user?.generalInfo.address;
    dataToSend.paymentMethod = "Clover";
    dataToSend.order_status = "Pending";
    dataToSend.products = data.products;
    dataToSend.totalInfo = data.totalInfo;
    dataToSend.totalQuantity = data.totalQuantity;
    dataToSend.currency = data.currencyObject;
    dataToSend.payment_status = chargeRes.status;
    dataToSend.payment_id = chargeRes.id;
    dataToSend.payment_date = chargeRes.created;
    await sendConfirmationEmail(
      data.user?.email ?? "",
      `${data.user?.firstName} ${data.user?.lastName}`,
      dataToSend.shipping_address,
      data.products,
      data.totalInfo
    );
    await sendConfirmationOrderForAdmin(
      `${data.user?.firstName} ${data.user?.lastName}`,
      data.shipping_address,
      data.products
      // currency?.toLocaleLowerCase() ?? "CAD",
      // rate
    );
    if (data.isCoponApplied) {
      // update status of copon in cobone array of object
      await User.updateOne(
        { _id: data.user._id, "cobone.code": "xpressbeauty10" },
        { $set: { "cobone.$.status": true } }
      );
    }
    await createOrder(dataToSend);
    await deleteCart(data.user?._id);
    chargeRes.orderId = dataToSend.order_number;
    return chargeRes;
  } catch (error: any) {
    console.error("Error:", error.message);
    return false;
  }
});

export const getAccessToken = server$(async function () {
  const authorizationCode = this.params.code;
  try {
    const client_id = this.env.get("VITE_APP_ID");
    const client_secret: any = this.env.get("VITE_CLOVER_SECRET");
    const url = `${this.env.get(
      "VITE_CLOVER_URL"
    )}/oauth/token?client_id=${client_id}&client_secret=${client_secret}&code=${authorizationCode}`;
    const authReq = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
    });

    const data = await authReq.json();
    const optionss = {
      method: "GET",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${data.access_token}`,
      },
    };

    const apiKey = await fetch(
      `${this.env.get("VITE_CLOVER_URL")}/pakms/apikey`,
      optionss
    );
    const apiKeyRes = await apiKey.json();
    return JSON.stringify({
      apikey: apiKeyRes.apiAccessKey,
      access_token: data.access_token,
    });
  } catch (error: any) {
    console.error("Error:", error.message);
    return "";
  }
});

export const tokenCard = server$(async function (data: any) {
  try {
    console.log(data);
    const option = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        apiKey: data.apiAccessKey,
      },
      body: JSON.stringify({
        card: {
          number: data.cardNumber,
          exp_month: data.expMonth,
          exp_year: data.expYear,
          cvv: data.cvv,
        },
      }),
    };
    const url: any = `https://token-${this.env
      .get("VITE_CLOVER_URL")
      ?.replace("https://", "")}/v1/tokens`;
    const tokenCard = await fetch(url, option);
    const tokenCardRes = await tokenCard.json();
    return tokenCardRes;
  } catch (error: any) {
    console.error("Error:", error.message);
    return false;
  }
});

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
    isLoading,
    isGoodToGo,
  } = props;
  const hst = useSignal<number>(0);
  const symbol = useSignal<string>("CAD");
  const isDummy = useSignal<boolean>(true);
  // const cardNumberElm = useSignal<string>("");
  // const expMonthElm = useSignal<string>("");
  // const expYearElm = useSignal<string>("");
  // const cvvElm = useSignal<string>("");
  // const accessToken = useSignal<string>("");
  // const api_key = useSignal<string>("");

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

  // useTask$(async () => {
  //   const getAccessTokenReq = await getAccessToken();
  //   const { access_token, apikey } = JSON.parse(getAccessTokenReq);
  //   accessToken.value = access_token;
  //   api_key.value = apikey;
  // });

  return (
    <>
      <div id="checkout"></div>
    </>
  );
});
