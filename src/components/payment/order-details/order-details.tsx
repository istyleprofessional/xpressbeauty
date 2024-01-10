import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
// import axios from "axios";
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

export const chargeCus = server$(async function (data: any) {
  // console.log(apiKeyRes.apiAccessKey);
  console.log(data);
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
  const charge = await fetch(
    "https://scl-sandbox.dev.clover.com/v1/charges",
    options
  );
  const chargeRes = await charge.json();
  console.log(chargeRes);
  return chargeRes;
});

export const getAccessToken = server$(async function () {
  const authorizationCode = this.params.code;
  try {
    const client_id = this.env.get("VITE_APP_ID");
    const client_secret: any = this.env.get("VITE_CLOVER_SECRET");
    console.log(client_id, client_secret);
    debugger;
    const url = `https://sandbox.dev.clover.com/oauth/token?client_id=${client_id}&client_secret=${client_secret}&code=${authorizationCode}`;
    const authReq = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
    });
    const data = await authReq.json();
    console.log(data);
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${data.access_token}`,
      },
      body: JSON.stringify({
        emailAddresses: [
          {
            emailAddress: "ramyanber@gmail.com",
          },
        ],
        firstName: "Ramy",
        lastName: "Anber",
      }),
    };
    const cusReq = await fetch(
      `https://sandbox.dev.clover.com/v3/merchants/SYKR03SX51WP1/customers`,
      options
    );
    const cusRes = await cusReq.json();
    console.log(cusRes);
    const optionss = {
      method: "GET",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${data.access_token}`,
      },
    };

    const apiKey = await fetch(
      "https://scl-sandbox.dev.clover.com/pakms/apikey",
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
    const optionsss = {
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

    const tokenCard = await fetch(
      "https://token-sandbox.dev.clover.com/v1/tokens",
      optionsss
    );
    const tokenCardRes = await tokenCard.json();
    console.log(tokenCardRes);
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
  } = props;
  const hst = useSignal<number>(0);
  const symbol = useSignal<string>("CAD");
  const isDummy = useSignal<boolean>(true);
  const cardNumberElm = useSignal<string>("");
  const expMonthElm = useSignal<string>("");
  const expYearElm = useSignal<string>("");
  const cvvElm = useSignal<string>("");

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
      {/** ask the user if he wants to use the perivious payment method */}
      {!isExistingPaymentMethod && (
        <>
          <h2 class="text-white text-xl font-semibold">Card Details</h2>
          <div class="flex flex-row gap-3 justify-center items-end"></div>
        </>
      )}

      <div class="bg-white shadow-md flex-col flex rounded px-8 pt-6 pb-8 mb-4">
        {!isExistingPaymentMethod && (
          <>
            <div class="mb-4">
              <label
                for="card-element"
                class="block text-gray-700 text-sm font-bold mb-2"
              >
                Card Number
              </label>
              <input
                class="input input-bordered w-full "
                id="card-element"
                type="text"
                onInput$={(e: any) => {
                  const value = e.target.value;
                  if (value.length === 4) {
                    e.target.value = value + " ";
                  }
                  if (value.length === 9) {
                    e.target.value = value + " ";
                  }
                  if (value.length === 14) {
                    e.target.value = value + " ";
                  }
                  const cardNumber = e.target.value;
                  const cardNumberArray = cardNumber.split(" ");
                  const cardNumberString = cardNumberArray.join("");
                  const cardNumberLength = cardNumberString.length;
                  if (cardNumberLength > 16) {
                    e.target.value = cardNumber.slice(0, -1);
                  }
                  cardNumberElm.value = cardNumberString;
                  console.log(cardNumberString);
                }}
                placeholder="4242 4242 4242 4242"
              />
            </div>

            <div class="mb-4">
              <label
                for="card-expiration"
                class="block text-gray-700 text-sm font-bold mb-2"
              >
                Expiration Date
              </label>
              <input
                class="input input-bordered w-full"
                id="card-expiration"
                type="text"
                onInput$={(e: any) => {
                  const value = e.target.value;
                  if (value.length === 2) {
                    e.target.value = value + "/";
                  }
                  const cardNumber = e.target.value;
                  const cardNumberArray = cardNumber.split("/");
                  const cardNumberString = cardNumberArray.join("");
                  const cardNumberLength = cardNumberString.length;
                  if (cardNumberLength > 4) {
                    e.target.value = cardNumber.slice(0, -1);
                  }
                  expMonthElm.value = cardNumberArray[0];
                  expYearElm.value = cardNumberArray[1];
                }}
                placeholder="MM/YY"
              />
            </div>

            <div class="mb-4">
              <label
                for="card-cvc"
                class="block text-gray-700 text-sm font-bold mb-2"
              >
                CVC
              </label>
              <input
                class="input input-bordered w-full"
                id="card-cvc"
                type="text"
                onInput$={(e: any) => {
                  const cardNumber = e.target.value;
                  const cardNumberArray = cardNumber.split("");
                  const cardNumberString = cardNumberArray.join("");
                  const cardNumberLength = cardNumberString.length;
                  if (cardNumberLength > 3) {
                    e.target.value = cardNumber.slice(0, -1);
                  }
                  cvvElm.value = cardNumberString;
                }}
                placeholder="123"
              />
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
          <button
            type="submit"
            class="btn bg-black text-white w-full"
            onClick$={async () => {
              const getAccessTokenReq = await getAccessToken();
              const { access_token, apikey } = JSON.parse(getAccessTokenReq);
              const paymentDetails = {
                cardNumber: cardNumberElm.value.replace(/\s/g, ""),
                expMonth: expMonthElm.value,
                expYear: expYearElm.value,
                cvv: cvvElm.value,
                apiAccessKey: apikey,
                // saveCard: acceptSaveCard.value,
              };
              console.log(paymentDetails);
              const cardTok = await tokenCard(paymentDetails);
              const cusCharge = await chargeCus({
                currency: symbol.value,
                // must be in cents
                amount: Math.round(total.value * 100),
                cardTok: cardTok.id,
                apiAccessKey: access_token,
              });
              console.log(cusCharge);
            }}
          >
            <div class="flex flex-row w-full items-center text-xs">
              <div class="flex flex-row gap-1 items-center w-full justify-center text-sm">
                Pay <NextArrowIconNoStick color="white" />
              </div>
            </div>
          </button>
        </div>
      </div>
      <div id="paypal-button-container" style="max-width:1000px;"></div>
      <div class="divider text-white"></div>
    </>
  );
});
