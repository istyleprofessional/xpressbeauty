export async function generateAccessToken(baseURL: string) {
  const paypalMode = import.meta.env.VITE_PAYPAL_MODE;
  let auth: string;
  if (paypalMode === "sandbox") {
    auth = Buffer.from(
      import.meta.env.VITE_PAYPAL_SANDBOX_CLIENT_ID +
        ":" +
        import.meta.env.VITE_PAYPAL_SANDBOX_APP_SECRET
    ).toString("base64");
  } else {
    auth = Buffer.from(
      import.meta.env.VITE_PAYPAL_LIVE_CLIENT_ID +
        ":" +
        import.meta.env.VITE_PAYPAL_LIVE_APP_SECRET
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
