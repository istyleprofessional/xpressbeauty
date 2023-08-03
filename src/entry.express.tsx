/*
 * WHAT IS THIS FILE?
 *
 * It's the entry point for the express server when building for production.
 *
 * Learn more about the cloudflare integration here:
 * - https://qwik.builder.io/deployments/node/
 *
 */
import {
  createQwikCity,
  type PlatformNode,
} from "@builder.io/qwik-city/middleware/node";
import qwikCityPlan from "@qwik-city-plan";
import { manifest } from "@qwik-client-manifest";
import render from "./entry.ssr";
import express from "express";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import Server from "quickbooks-js";
import qbXMLHandler from "./qbXMLHandler";
import dotenv from "dotenv";
import geoip from "geoip-lite";
import { uuid } from "./utils/uuid";
import cookieParser from "cookie-parser";
import { addDummyCustomer } from "./express/services/dummy.user.service";
import { connect } from "./express/db.connection";

dotenv.config();
const soapServer = new Server.Server();
soapServer.setQBXMLHandler(qbXMLHandler);
soapServer.run();

declare global {
  interface QwikCityPlatform extends PlatformNode {}
}

// import compression from "compression";

// Directories where the static assets are located
const distDir = join(fileURLToPath(import.meta.url), "..", "..", "dist");
const buildDir = join(distDir, "build");

// Allow for dynamic port
const PORT = process.env.PORT ?? 3000;

// Create the Qwik City express middleware
const { router, notFound } = createQwikCity({ render, qwikCityPlan, manifest });

// Create the express server
// https://expressjs.com/
const app = express();
app.set("trust proxy", true);
app.use(cookieParser());

app.use(async (req, res, next) => {
  if (/^(?!.*\.(webp|json|svg|js)$).*$/i.test(req.url)) {
    await connect();
    let id = req.cookies["browserId"];
    if (!id) {
      id = uuid();
      res.cookie("browserId", id, { httpOnly: true });
      res.cookie("verified", false, { httpOnly: true });
      const ip = req.ip;
      const geo = geoip.lookup(ip);
      await addDummyCustomer(id, geo);
    }
  }
  next();
});

// Enable gzip compression
// app.use(compression());

// Static asset handlers
// https://expressjs.com/en/starter/static-files.html
app.use(`/build`, express.static(buildDir, { immutable: true, maxAge: "1y" }));
app.use(express.static(distDir, { redirect: false }));

// Use Qwik City's page and endpoint request handler
app.use(router);

// Use Qwik City's 404 handler
app.use(notFound);

// Start the express server
app.listen(PORT, () => {
  /* eslint-disable */
  console.log(`Server starter: http://localhost:${PORT}/`);
});
