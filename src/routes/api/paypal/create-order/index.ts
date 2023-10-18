import type { RequestHandler } from "@builder.io/qwik-city";
import { generateAccessToken } from "~/utils/paypalToken";

export const onPost: RequestHandler = async ({ parseBody, json, env }) => {
  const paypalMode = env.get("VITE_PAYPAL_MODE") ?? "";
  let baseURL: string;
  if (paypalMode === "sandbox") {
    baseURL = env.get("VITE_PAYPAL_SANDBOX_URL") ?? "";
  } else {
    baseURL = env.get("VITE_PAYPAL_LIVE_URL") ?? "";
  }
  const body: any = await parseBody();
  const jsonBody = JSON.parse(body);
  const accessToken = await generateAccessToken(baseURL);
  const url = `${baseURL}/v2/checkout/orders`;
  let item_total = 0;
  jsonBody?.items?.forEach((item: any) => {
    item_total +=
      parseFloat(item.unit_amount.value) * parseFloat(item.quantity);
  });
  let tax_total: number = 0;
  jsonBody?.items?.forEach((item: any) => {
    tax_total += parseFloat(item.tax.value) * parseFloat(item.quantity);
  });
  const purchase_units = [
    {
      items: jsonBody.items,
      amount: {
        currency_code: "CAD",
        value: (tax_total + item_total + 15).toFixed(2).toString(),
        breakdown: {
          item_total: {
            currency_code: "CAD",
            value: item_total.toFixed(2).toString(),
          },
          shipping: {
            currency_code: "CAD",
            value: "15.00",
          },
          tax_total: {
            currency_code: "CAD",
            value: tax_total.toFixed(2).toString(),
          },
          insurance: {
            currency_code: "CAD",
            value: "0.00",
          },
          handling: {
            currency_code: "CAD",
            value: "0.00",
          },
          shipping_discount: {
            currency_code: "CAD",
            value: "0.00",
          },
          discount: {
            currency_code: "CAD",
            value: "0.00",
          },
        },
      },
    },
  ];
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },

    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: purchase_units,
    }),
  });
  const data = await response.json();
  json(200, data);
};
