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
import VoiceResponse from "twilio/lib/twiml/VoiceResponse";
// import bodyParser from "body-parser";
import axios from "axios";
import fs from "fs";
import { S3 } from "@aws-sdk/client-s3";
import MessagingResponse from "twilio/lib/twiml/MessagingResponse";
import { GoogleSpreadsheet } from "google-spreadsheet";

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
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
app.set("trust proxy", true);
app.use(cookieParser());
const delay = (ms: any) => new Promise((resolve) => setTimeout(resolve, ms));

app.get("/api/uploadProducts", async (_, res: any) => {
  await connect();
  const productsD = await productSchema.find({});

  const doc = new GoogleSpreadsheet(
    "1315PBG49Tduql9s-pV2IIL_NKa1V6tbuUq9FrYOGCBY"
  );
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "",
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n") || "",
  });
  await doc.loadInfo();
  const allSheets = doc.sheetsByIndex[0];
  const rows: any[] = [];
  for (const productD of productsD) {
    // const merchantId = "5292055509";
    const product = {
      id: productD._id.toString(),
      title: productD.product_name,
      description: productD?.description?.replace(/<[^>]*>?/gm, "") ?? "",
      availability:
        (parseInt(productD?.quantity_on_hand ?? "0") || 0) > 0
          ? "in_stock"
          : "out_of_stock",
      link: `https://xpressbeauty.ca/products/${productD.perfix}`,
      imageLink: productD.imgs[0],
      price: {
        currency: "CAD",
        value:
          productD.priceType === "range"
            ? `${parseFloat(
                productD?.price?.max?.toString().replace("$", "")
              )} CAD - ${parseFloat(
                productD?.price?.min?.toString().replace("$", "")
              )} CAD`
            : `${parseFloat(
                productD?.price?.regular?.toString().replace("$", "")
              )} CAD`,
      },
      "identifier exists": "no",
      brand: productD.companyName.name,
      condition: "new",
      "sell on google quantity": productD?.quantity_on_hand ?? "0",
    };
    rows.push({
      id: product.id,
      title: product.title ?? "",
      description: product.description,
      availability: product.availability,
      link: product.link,
      "image link": product.imageLink,
      price: product.price.value,
      "identifier exists": product["identifier exists"],
      brand: product.brand,
      condition: product.condition,
      "sell on google quantity": product["sell on google quantity"],
    });
  }
  try {
    await allSheets.addRows(rows);
  } catch (error: any) {
    console.log(error);
    if (error.response && error.response.status === 429) {
      console.log("Rate limit exceeded. Waiting for a minute...");
      await delay(60000); // Wait for a minute (60,000 milliseconds) before continuing.
    }
  }
  res.send("done");
});

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

app.post("/api/twilioSMS", async (req, res) => {
  // forward the sms to 6479067973
  const response = new MessagingResponse();
  console.log("req.body: " + req.body);
  response.message({ to: "+16479067973", from: "+12134014667" }, req.body);
  res.set("Content-Type", "text/xml");
  res.send(response.toString());
});

app.post("/api/twilioVoice", (req, res) => {
  const response = new VoiceResponse();

  response.say(
    `Hello and thank you for calling Xpress Beauty, your destination for all things beauty and wellness. We're delighted to assist you on your journey to looking and feeling your best.
     Our team of experienced professionals is dedicated to providing you with top-notch services that cater to your unique needs. Whether you're looking for a relaxing spa treatment, a stunning new hairstyle, or expert skincare advice, we've got you covered.`
  );
  response.say(
    "For our current hours of operation and any special promotions, please visit our website at www.xpressbeauty.com. You can also book your appointment online for added convenience."
  );
  response.say(
    "Due to high volume of calls we are unable to answer your call at this time. Please leave a message and we will get back to you as soon as possible."
  );
  response.say(
    "Thank you for calling Xpress Beauty. We look forward to speaking with you soon."
  );
  response.record({
    action: "/api/recordedMessage", // The endpoint to handle the recorded message
    method: "POST",
    maxLength: 60, // Maximum recording length in seconds (adjust as needed)
    finishOnKey: "#", // End recording on pressing the pound key
    transcribe: true, // Enable transcription (optional)
    transcribeCallback: "/api/transcriptionCallback", // Callback for transcription (optional)
  });

  res.set("Content-Type", "text/xml");
  res.send(response.toString());
});

app.post("/api/recordedMessage", async (req, res) => {
  console.log("recordingUrl: " + req.body.RecordingUrl);

  try {
    const response = await axios.get(req.body.RecordingUrl, {
      responseType: "stream", // Stream the response data
      auth: {
        username: process?.env?.TWILIO_ACCOUNT_SID ?? "",
        password: process?.env?.TWILIO_AUTH_TOKEN ?? "",
      },
    });

    // Prepare AWS S3
    const awsS3 = new S3({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.AWS_SECRET_KEY ?? "",
      },
      region: "ca-central-1",
    });

    // Define the file path where you want to save the audio temporarily
    const filePath = `temp_${Date.now()}.wav`;
    const fileStream = fs.createWriteStream(filePath);

    // Pipe the response data directly to a file
    response.data.pipe(fileStream);

    fileStream.on("close", async () => {
      console.log("File downloaded successfully");
      const fileName = filePath;
      // Upload the downloaded file to AWS S3
      const fileStreamForUpload = fs.createReadStream(filePath);
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME ?? "",
        Key: `voicemail/${fileName}`,
        Body: fileStreamForUpload,
        ContentType: "audio/wav",
        ACL: "public-read",
      };

      try {
        const result = await awsS3.putObject(params);
        console.log("File uploaded to S3:", result);
      } catch (error) {
        console.error("Error uploading file to S3:", error);
      }

      // Clean up: Delete the temporary file
      fs.unlinkSync(filePath);

      // Respond with a success status
      res.sendStatus(200);
    });
  } catch (error) {
    console.error("Error downloading audio:", error);
    res.sendStatus(500); // Send a server error response
  }
});

app.post("/api/transcriptionCallback", (req, res) => {
  console.log("TranscriptionText " + req.body.TranscriptionText);
  res.send(200);
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
