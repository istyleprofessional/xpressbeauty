import type { EnumChangefreq } from "sitemap";
import { SitemapStream, streamToPromise } from "sitemap";

export const generateChildSitemap = async (products: any) => {
  const chunks = []; // Array to store sitemap chunks
  const chunkSize = 1000; // Number of URLs per chunk

  for (let i = 0; i < products.length; i += chunkSize) {
    const chunk = products.slice(i, i + chunkSize);
    const stream = new SitemapStream({
      hostname: "https://xpressbeauty.ca/",
      lastmodDateOnly: false,
      xmlns: { news: true, xhtml: false, image: true, video: false },
    });

    // Generate URLs for this chunk
    chunk.forEach((product: any) => {
      stream.write({
        url: `products/${product.perfix}/`,
        changefreq: "hourly" as EnumChangefreq,
        lastmod: new Date(),
        priority: 1.0,
      });
    });

    // End the stream for this chunk
    stream.end();

    // Push the chunk as a string into the chunks array
    const chunkString = await streamToPromise(stream);
    chunks.push(chunkString.toString());
  }

  return chunks;
};
