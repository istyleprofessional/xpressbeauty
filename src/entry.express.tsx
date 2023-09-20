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
import cookieParser from "cookie-parser";
import type { EnumChangefreq } from "sitemap";
import { SitemapStream, streamToPromise } from "sitemap";
import productSchema from "./express/schemas/product.schema";
import { Readable } from "stream";
import { static_urls } from "./utils/static_urls";
import { connect } from "./express/db.connection";
import compression from "compression";
import categorySchema from "./express/schemas/category.schema";
import brandSchema from "./express/schemas/brand.schema";

dotenv.config();
let sitemap: any;
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

app.get("/sitemap.xml", async (req, res) => {
  await connect();
  res.header("Content-Type", "application/xml");
  // if we have a cached entry send it
  if (sitemap) {
    res.send(sitemap);
    return;
  }

  try {
    const pages = await productSchema.find({});
    const dynamic_urls = pages.map((project: any) => {
      return {
        url: `products/${project.perfix}/`,
        changefreq: "hourly" as EnumChangefreq,
        lastmod: new Date(project.updatedAt).toISOString(),
        priority: 1.0,
      };
    });
    const categories = await categorySchema.find({});
    const dynamic_urls2 = categories.map((category: any) => {
      const cat = category.name;
      return {
        url: `products/filterCategories/${cat.replace(/ /g, "-")}/`,
        changefreq: "hourly" as EnumChangefreq,
        lastmod: new Date().toISOString(),
        priority: 1.0,
      };
    });
    const brands = await brandSchema.find({});
    const dynamic_urls3 = brands.map((brand: any) => {
      return {
        url: `products/filterBrands/${brand.name.replace(/ /g, "-")}/`,
        changefreq: "hourly" as EnumChangefreq,
        lastmod: new Date().toISOString(),
        priority: 1.0,
      };
    });
    dynamic_urls.push(...dynamic_urls2);
    dynamic_urls.push(...dynamic_urls3);
    const stream = new SitemapStream({
      hostname: "https://xpressbeauty.ca/",
      lastmodDateOnly: false,
      xmlns: { news: true, xhtml: false, image: true, video: false },
    });
    return streamToPromise(
      Readable.from([...static_urls, ...dynamic_urls]).pipe(stream)
    ).then((data) => {
      sitemap = data.toString();
      // console.log(sitemap);
      stream.end();
      return res.status(200).send(sitemap);
    });
  } catch (error) {
    console.error(error);
    return res.status(500).end();
  }
});

// Enable gzip compression
app.use(compression());

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
