import type { RequestHandler } from "@builder.io/qwik-city";
import { connect } from "~/express/db.connection";
import {
  deleteProductCart,
  handleDecIncVariationProducts,
  updateUserCart,
} from "~/express/services/cart.service";
import { getDummyCustomer } from "~/express/services/dummy.user.service";
import { findUserByBrowserId } from "~/express/services/user.service";
import { uuid } from "~/utils/uuid";

export const onPost: RequestHandler = async ({ parseBody, cookie, json }) => {
  await connect();
  let browserId = cookie.get("browserId")?.value;
  if (!browserId) {
    browserId = uuid();
    cookie.set("browserId", browserId, { httpOnly: true, path: "/" });
  }
  const data: any = await parseBody();
  const jsonData = JSON.parse(data);
  jsonData.browserId = browserId;
  const isVerified = cookie.get("verified")?.value;
  if (!isVerified) {
    cookie.set("verified", "false", { httpOnly: true, path: "/" });
  }
  let user: any;
  if (isVerified === "false") {
    user = await getDummyCustomer(jsonData.browserId);
    jsonData.userId = user?._id.toString();
    // console.log("jsonData", jsonData);
    const result = await updateUserCart(jsonData);
    json(200, result);
  } else {
    user = await findUserByBrowserId(jsonData.browserId);
    jsonData.userId = user?.result?._id.toString();
    const result = await updateUserCart(jsonData);
    json(200, result);
  }
};

export const onDelete: RequestHandler = async ({ parseBody, cookie, json }) => {
  await connect();
  const browserId = cookie.get("browserId")?.value;
  const data: any = await parseBody();
  const jsonData = JSON.parse(data);
  jsonData.browserId = browserId;
  const request = await deleteProductCart(jsonData);
  json(200, request);
};

export const onPut: RequestHandler = async ({ parseBody, cookie, json }) => {
  const browserId = cookie.get("browserId")?.value;
  const data: any = await parseBody();
  const jsonData = JSON.parse(data);
  const isVerified = cookie.get("verified")?.value;
  if (!isVerified) {
    cookie.set("verified", "false", { httpOnly: true, path: "/" });
  }
  let user: any;
  jsonData.browserId = browserId;
  if (isVerified === "false") {
    user = await getDummyCustomer(jsonData.browserId);
    jsonData.userId = user?._id.toString();
    // console.log("jsonData", jsonData);
    const result = await handleDecIncVariationProducts(jsonData);
    json(200, result);
  } else {
    user = await findUserByBrowserId(jsonData.browserId);
    jsonData.userId = user?.result?._id.toString();
    const result = await handleDecIncVariationProducts(jsonData);
    json(200, result);
  }
};
