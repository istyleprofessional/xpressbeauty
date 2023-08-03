import type { RequestHandler } from "@builder.io/qwik-city";
import axios from "axios";

export const onGet: RequestHandler = async ({ url, json }) => {
  const category = url.searchParams.get("category");
  const id = url.searchParams.get("id");
  let result: any = {};
  if (category?.includes("Hair")) {
    try {
      const res = await axios.get(
        `https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-AvailabilityJson?pids=${id}&page=pdp`,
        {
          headers: {
            "User-Agent":
              "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36",
          },
        }
      );
      const response = res?.data;
      if (response?.products?.[0]?.availability?.IsOutOfStock === true) {
        response.quantity_on_hand = "0";
      } else {
        response.quantity_on_hand = "100";
      }
      // console.log(response);
      result = response;
    } catch (error) {
      result.quantity_on_hand = "100";
      console.log("An error occurred:", error);
    }
  }
  json(200, { result: result });
};
