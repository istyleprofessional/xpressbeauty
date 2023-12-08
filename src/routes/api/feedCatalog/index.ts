import type { RequestHandler } from "@builder.io/qwik-city";

export const onGet: RequestHandler = async ({ json }) => {
  const accessToken =
    "EAAEpwOrPAt0BO5P4LX6XiVppfUfmZBcVkfkH2DeiG9LmiNoTJf8bdaVbMu42BZCOPZCZBtptAPwPQRDoOaZADga2d6He8NDf6yM9Y8M3AQ8nZAIAeZBYZBDSMlazWebygeqpVGF4ZBmPWWfray9B8CxJdaCwGGZCO9T0cXgT7SUTSxgVPRxo6fuDvn4HoG30KVXqBE1ZBIoz60kFZAY39WNINOwZAKrwGFrND8zrndoTIMKjekwOWILlHzwwLxe4genajCQZDZD";
  const cataalog = await fetch(
    "https://graph.facebook.com/151184228069330/product_feeds",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    }
  );
  const jsons = await cataalog.json();
  console.log(jsons);
  json(200, { message: "Hello World!" });
};
