import { component$, useContext, useOnDocument, $ } from "@builder.io/qwik";
import type { DocumentHead, RequestHandler } from "@builder.io/qwik-city";
import { routeLoader$, server$ } from "@builder.io/qwik-city";
import { FeatureProducts } from "~/components/home/tools-products/tools-products";
import { WhyChooseUs } from "~/components/home/why-choose-us/why-choose-us";
import { connect } from "~/express/db.connection";
import { get_new_arrivals_products } from "~/express/services/product.service";
import type { ProductModel } from "~/models/product.model";
import { UserContext } from "~/context/user.context";
import { CurContext } from "~/context/cur.context";
import { Categories } from "~/components/home/categories/categories";
import { Hero } from "~/components/home/hero/hero";
import { google } from "googleapis";
import path from "path";
import productss from "~/express/schemas/product.schema";

// import HeroImage2 from "~/media/hero-2.jpg?jsx";

export const useHairProducts = routeLoader$(async () => {
  await connect();
  const newArrivalsProducts = (await get_new_arrivals_products(
    "Hair"
  )) as ProductModel[];
  return JSON.stringify(newArrivalsProducts as ProductModel[]);
});

export const onGet: RequestHandler = async ({ json }) => {
  try {
    // Load credentials
    debugger;
    const credentialsPath = path.resolve(
      process.cwd(),
      "product-data-feed-453020-293c420233af.json"
    );

    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(credentialsPath),
      scopes: ["https://www.googleapis.com/auth/content"],
    });

    const authClient = await auth.getClient();
    const token = await authClient.getAccessToken();
    if (!token) throw new Error("Authentication failed");
    const merchantId = "5552558724"; // 🔹 Replace with your actual Merchant Center ID

    // Initialize API client
    const content = google.content({
      version: "v2.1",
      auth: authClient as any,
    });

    await connect();
    const products = await productss.find({});

    for (const product of products) {
      const prod = product;
      if ((prod.variations?.length ?? 0) > 0) {
        for (const variation of prod?.variations ?? []) {
          try {
            const offerId = `${prod?._id?.toString()}-${variation?.variation_name.replace(
              / /g,
              "-"
            )}`;
            const obj: any = {
              offerId: offerId,
              title: prod?.product_name ?? "" + " " + variation?.variation_name,
              description: variation?.description ?? "",
              link: `https://xpressbeautyshop.com/products/${encodeURIComponent(
                prod.product_name
                  ?.replace(/[^a-zA-Z0-9 ]/g, "") // Exclude numbers from removal
                  .replace(/ /g, "-")
                  .toLowerCase() ?? ""
              )}-pid-${prod._id}/`,
              imageLink: variation?.variation_image ?? prod.imgs?.[0] ?? "",
              contentLanguage: "en",
              targetCountry: "US",
              channel: "online",
              availability:
                (variation?.quantity_on_hand ?? 0) > 0
                  ? "in stock"
                  : "out of stock",
              condition: "new",
              price: {
                value:
                  parseFloat(variation?.price?.toString()?.replace("$")) ?? 0,
                currency: "USD",
              },
              gtin: variation?.gtin ?? "",
              brand: prod?.companyName?.name
                ? prod?.companyName?.name
                : prod?.companyName,
            };
            await content.products.insert({
              merchantId,
              requestBody: obj,
            });
          } catch (error: any) {
            console.error("Google API Error:", error.message);
            continue;
          }
        }
      } else {
        try {
          const obj = {
            offerId: prod?._id?.toString() ?? "",
            title: prod?.product_name ?? "",
            description: prod?.description ?? "",
            link: `https://xpressbeautyshop.com/products/${encodeURIComponent(
              prod.product_name
                ?.replace(/[^a-zA-Z0-9 ]/g, "") // Exclude numbers from removal
                .replace(/ /g, "-")
                .toLowerCase() ?? ""
            )}-pid-${prod._id}/`,
            imageLink: prod?.imgs?.[0] ?? "",
            contentLanguage: "en",
            targetCountry: "US",
            channel: "online",
            availability:
              (prod?.quantity_on_hand ?? 0) > 0 ? "in stock" : "out of stock",
            condition: "new",
            price: {
              value: prod?.price?.regular ?? 0,
              currency: "USD",
            },
            gtin: prod?.gtin,
            brand: prod?.companyName?.name
              ? prod?.companyName?.name
              : prod?.companyName ?? "",
          };
          await content.products.insert({
            merchantId,
            requestBody: obj,
          });
        } catch (error: any) {
          console.error("Google API Error:", error.message);
          continue;
        }
      }
    }

    json(200, { message: "Products fetched successfully" });
  } catch (error) {
    console.error("Google API Error:", error);
    json(500, { error: "Failed to fetch products" });
  }
};

export const useToolsProducts = routeLoader$(async () => {
  await connect();
  const newArrivalsProducts = (await get_new_arrivals_products(
    "Tools"
  )) as ProductModel[];
  return JSON.stringify(newArrivalsProducts as ProductModel[]);
});

export const useBestSellerProducts = routeLoader$(async () => {
  await connect();
  const newArrivalsProducts =
    (await get_new_arrivals_products()) as ProductModel[];
  return JSON.stringify(newArrivalsProducts as ProductModel[]);
});

export const checkIfDisplayCard = server$(async function () {
  const isBannarDisplay = this.cookie.get("bannar")?.value ?? "";
  if (!isBannarDisplay || isBannarDisplay === "false") {
    this.cookie.set("bannar", "true", {
      httpOnly: true,
      path: "/",
    });
    return true;
  } else {
    return false;
  }
});

export default component$(() => {
  // const status = import.meta.env.VITE_STATUS;
  const newArrivalProducts: ProductModel[] = JSON.parse(
    useHairProducts().value
  );
  const bestSellerProducts: ProductModel[] = JSON.parse(
    useToolsProducts().value
  );
  const bestSellerProducts2: ProductModel[] = JSON.parse(
    useBestSellerProducts().value
  );
  const userObj: any = useContext(UserContext);
  const currencyObject: any = useContext(CurContext);

  useOnDocument(
    "DOMContentLoaded",
    $(() => {
      const products = [
        ...newArrivalProducts,
        ...bestSellerProducts,
        ...bestSellerProducts2,
      ];
      // add products schema
      const jsonProducts = document.createElement("script");
      jsonProducts.type = "application/ld+json";
      const object = {
        "@context": "https://schema.org/",
        "@type": "ItemList",
        itemListElement: products.map((product, index) => {
          return {
            "@type": "ListItem",
            position: index + 1,
            url: `https://xpressbeauty.ca/products/${product.perfix}`,
          };
        }),
      };
      jsonProducts.text = JSON.stringify(object);
      document.head.appendChild(jsonProducts);
    })
  );

  return (
    <>
      <div class="flex flex-col gap-3 md:gap-6 lg:gap-10">
        {/* <HeroImage2 id="slide1" class="w-full h-full object-cover p-2" /> */}
        <Hero />

        <Categories />

        <FeatureProducts
          bestSellerProducts={bestSellerProducts2}
          type="Top Selling Products"
          userObj={userObj}
          currencyObject={currencyObject}
        />
        <div class="flex justify-center items-center">
          <a
            class="btn bg-black text-white font-['Inter'] w-fit rounded-sm mt-8"
            aria-label="See More Products"
            href="/products/"
          >
            See More Products
          </a>
        </div>
        <FeatureProducts
          bestSellerProducts={newArrivalProducts}
          type="Hair Products"
          userObj={userObj}
          currencyObject={currencyObject}
        />
        <div class="flex justify-center items-center">
          <a
            class="btn bg-black text-white font-['Inter'] w-fit rounded-sm mt-8"
            aria-label="See More Products"
            href="/products/"
          >
            See More Products
          </a>
        </div>
        <FeatureProducts
          bestSellerProducts={bestSellerProducts}
          type="Clippers & Trimmers"
          userObj={userObj}
          currencyObject={currencyObject}
        />

        <div class="flex justify-center items-center">
          <a
            class="btn bg-black text-white font-['Inter'] w-fit  rounded-sm mt-8"
            aria-label="See More Products"
            href="/products/"
          >
            See More Products
          </a>
        </div>
        <div class="p-20 flex flex-col gap-20 items-center justify-center">
          <WhyChooseUs />
        </div>
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "Xpress Beauty | Home",
  links: [
    {
      rel: "canonical",
      href: "https://xpressbeauty.ca/",
    },
  ],
  meta: [
    {
      name: "description",
      content:
        "Discover the epitome of luxury beauty at XpressBeauty – your premier destination for exquisite haircare, trimmers, and precision tools. Elevate your grooming routine with our curated selection of premium products with the cheapest price, meticulously crafted to meet the needs of the modern connoisseur. Explore the art of refinement with XpressBeauty today.",
    },
  ],
};
