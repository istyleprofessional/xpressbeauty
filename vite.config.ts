import { defineConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { qwikCity } from '@builder.io/qwik-city/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import EnvironmentPlugin from "vite-plugin-environment";

export default defineConfig(() => {
  return {
    plugins: [ EnvironmentPlugin(["QWIK_APP_MONGO_CONNECTION", "QWIK_APP_TOKEN_SECRET", "QB_USERNAME", "QB_PASSWORD", "QB_COMPANY_FILE", "QB_SOAP_PORT"]), qwikCity(), qwikVite(), tsconfigPaths()],
    preview: {
      headers: {
        'Cache-Control': 'public, max-age=600',
      },
    },
  };
});
