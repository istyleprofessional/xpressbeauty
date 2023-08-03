export async function generateAccessToken(baseURL: string) {
  const paypalMode = process.env.PAYPAL_MODE;
  let auth: string;
  if (paypalMode === "sandbox") {
    auth = Buffer.from(
      process.env.PAYPAL_SANDBOX_CLIENT_ID +
        ":" +
        process.env.PAYPAL_SANDBOX_APP_SECRET
    ).toString("base64");
  } else {
    auth = Buffer.from(
      process.env.PAYPAL_LIVE_CLIENT_ID +
        ":" +
        process.env.PAYPAL_LIVE_APP_SECRET
    ).toString("base64");
  }
  const response = await fetch(`${baseURL}/v1/oauth2/token`, {
    method: "POST",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });
  const data = await response.json();
  return data.access_token;
}
