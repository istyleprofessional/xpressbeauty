import type { RequestHandler } from "@builder.io/qwik-city";
import { getDummyCustomer } from "~/express/services/dummy.user.service";
import { createOrder } from "~/express/services/order.service";
import { findUserByBrowserId } from "~/express/services/user.service";
import { capturePayment } from "~/utils/paypal-capture-payment";

export const onPost: RequestHandler = async ({ parseBody, json, cookie }) => {
  const paypalMode = process.env.PAYPAL_MODE;
  const browserId = cookie?.get("browserId")?.value;
  const verified = cookie?.get("verified")?.value;
  let user: any;
  if (verified !== "true") {
    user = await getDummyCustomer(browserId ?? "");
  } else {
    user = await findUserByBrowserId(browserId ?? "");
  }
  let baseURL: string;
  if (paypalMode === "sandbox") {
    baseURL = process.env.PAYPAL_SANDBOX_URL ?? "";
  } else {
    baseURL = process.env.PAYPAL_LIVE_URL ?? "";
  }
  const data: any = await parseBody();
  const jsonBody = JSON.parse(data);
  const captureData = await capturePayment(jsonBody.orderID, baseURL);
  const dataToBeSent = {
    order_id: captureData.id,
    order_status: captureData.status,
    order_amount: captureData.purchase_units[0].amount.value,
    shipping_address: captureData.purchase_units[0].shipping.address,
    shipping_name: captureData.purchase_units[0].shipping.name,
    browserId: browserId,
    totalQuantity: jsonBody.quantity,
    products: jsonBody.products,
    userId: user?._id,
  };
  const createOrderReq = await createOrder(dataToBeSent);
  console.log(createOrderReq);
  // TODO: store payment information such as the transaction ID
  json(200, captureData);
};
