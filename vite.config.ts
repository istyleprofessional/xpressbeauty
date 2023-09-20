import { defineConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { qwikCity } from "@builder.io/qwik-city/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import EnvironmentPlugin from "vite-plugin-environment";

export default defineConfig(() => {
  return {
    plugins: [
      EnvironmentPlugin([
        "QWIK_APP_MONGO_CONNECTION",
        "QWIK_APP_TOKEN_SECRET",
        "QB_USERNAME",
        "QB_PASSWORD",
        "QB_COMPANY_FILE",
        "QB_SOAP_PORT",
        "STATUS",
        "QWIK_APP_MONGO_USERNAME",
        "QWIK_APP_MONGO_PWD",
        "SECRET",
        "PAYPAL_SANDBOX_CLIENT_ID",
        "PAYPAL_SANDBOX_APP_SECRET",
        "PAYPAL_LIVE_CLIENT_ID",
        "PAYPAL_LIVE_APP_SECRET",
        "PAYPAL_SANDBOX_URL",
        "PAYPAL_LIVE_URL",
        "PAYPAL_MODE",
        "STRIPE_TEST_PUBLISHABLE_KEY",
        "STRIPE_TEST_SECRET_KEY",
        "APPURL",
        "TWILIO_ACCOUNT_SID",
        "TWILIO_AUTH_TOKEN",
        "JWTSECRET",
        "RECAPTCHA_SITE_KEY",
        "RECAPTCHA_SECRET_KEY",
        "ORIGIN",
      ]),
      qwikCity(),
      qwikVite(),
      tsconfigPaths(),
    ],
    preview: {
      headers: {
        "Cache-Control": "public, max-age=600",
      },
    },
  };
});
