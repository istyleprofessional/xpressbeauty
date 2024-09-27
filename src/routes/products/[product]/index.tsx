import {
  component$,
  useContext,
  $,
  useSignal,
  useVisibleTask$,
  useStore,
  Fragment,
  useTask$,
  useOnDocument,
} from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$, server$ } from "@builder.io/qwik-city";
import { Gallery } from "~/components/product/gallery/gallery";
import { ProductActions } from "~/components/product/product-actions/product-actions";
import { ProductMainInfo } from "~/components/product/product-main-info/product-main-info";
import { RatingAndDescription } from "~/components/product/rating-description/rating-description";
import { RelatedProducts } from "~/components/product/related-products/related-products";
import { Variations } from "~/components/product/variations/variations";
import { CartContext } from "~/context/cart.context";
import { connect } from "~/express/db.connection";
import {
  getRelatedProducts,
  get_product_by_name,
} from "~/express/services/product.service";
import type { ProductModel } from "~/models/product.model";
import { postRequest } from "~/utils/fetch.utils";
import { WishListContext } from "~/context/wishList.context";
import { Toast } from "~/components/admin/toast/toast";
import { getRatingByProductId } from "~/express/services/rating.reviews.service";
import { UserContext } from "~/context/user.context";
import { CurContext } from "~/context/cur.context";
import { loadStripe } from "@stripe/stripe-js";

export const useServerData = routeLoader$(async ({ params, redirect }) => {
  await connect();
  const product = params.product;

  if (!product.includes("pid")) {
    const result: any = await get_product_by_name(product);
    if (!result || result?.err || result?.perfix === "") {
      console.log("here");
      throw redirect(301, `/products/`);
    }
    console.log("here");
    throw redirect(301, `/products/${result?.perfix}`);
  }
  const result: any = await get_product_by_name(product);
  const ratings = await getRatingByProductId(result?._id ?? "");
  if (!result) {
    throw redirect(301, "/products/");
  }
  return JSON.stringify({ ...result, ratings: ratings });
});

export const useCurrLoader = routeLoader$(async ({ cookie }) => {
  const country = cookie.get("cur")?.value ?? "";
  const rate = cookie.get("curRate")?.value ?? "";
  return { country: country, rate: rate };
});

export const getAllRelatedProductsServer = server$(async (data) => {
  const req = await getRelatedProducts(data.category, data.name);
  return JSON.stringify(req);
});

export default component$(() => {
  const product: ProductModel = JSON.parse(useServerData().value)?._doc;
  const ratings = JSON.parse(useServerData().value)?.ratings;
  const cartContext: any = useContext(CartContext);
  const relatedProducts = useSignal<any[]>([]);
  const isLoading = useSignal<boolean>(false);
  const variationValue = useStore<any>({}, { deep: true });
  const finalVariationToAdd = useSignal<any>({});
  const userObj: any = useContext(UserContext);
  const user = userObj ?? {};
  const wishList = useContext(WishListContext);
  const isLoginCardOpen = useSignal(false);
  const isToastCardOpen = useSignal(false);
  const message = useSignal("");
  const currObject: any = useContext(CurContext);
  const currencyObject = currObject?.cur;
  const currentProduct = useSignal<any>({});

  useVisibleTask$(() => {
    localStorage.setItem("prev", `/products/${product.perfix}`);
  });

  useTask$(() => {
    if (currencyObject === "1") {
      if (product.priceType === "range") {
        product.price.min = product.price.min * 0.9;
        product.price.max = product.price.max * 0.9;
      } else {
        product.price.regular = product.price.regular * 0.9;
      }
    }
  });

  const handleAddToCart = $(async (value: number) => {
    isLoading.value = true;
    const productsToAdd: any[] = [];
    let totalQuantity = 0;

    if (Object.values(finalVariationToAdd.value).length > 0) {
      Object.values(finalVariationToAdd.value).forEach((element: any) => {
        let image = "";
        if (product.variation_type === "Size") {
          const testImage = element.variation_image;
          if (testImage) {
            image = testImage;
          } else {
            image = (product.imgs ?? [])[0] ?? "";
          }
        } else {
          image = (product.imgs ?? [])[0] ?? "";
        }
        element.price =
          currencyObject === "2" ? element.price : element.price * 0.9;
        const productToAdd = {
          id: `${product._id}.${
            element.variation_id ??
            element.variation_name.replace(/[^A-Za-z0-9]+/g, "")
          }`,
          product_name: product.product_name,
          variation_name: element.variation_name,
          product_img: image.includes("http")
            ? image
            : image.replace(".", "") ?? "/placeholder.webp",
          price: parseFloat(element?.price),
          quantity: element.quantity,
          currency: currencyObject === "1" ? "USD" : "CAD",
        };
        totalQuantity += element.quantity;
        productsToAdd.push(productToAdd);
      });
    } else {
      const productToAdd = {
        id: product._id,
        product_name: product.product_name,
        product_img: (product?.imgs ?? [])[0] ?? "",

        price: parseFloat(product?.price?.regular?.toString()).toFixed(2),
        quantity: value,
        currency: currencyObject === "1" ? "USD" : "CAD",
      };

      totalQuantity += value;
      productsToAdd.push(productToAdd);
    }
    // console.log(userObj);
    const data = {
      products: productsToAdd,
      totalQuantity: totalQuantity,
      currency: currencyObject === "1" ? "USD" : "CAD",
      isSaverClub: !(user.isEmailVerified && user.isPhoneVerified)
        ? true
        : false,
      user: userObj,
    };
    // console.log(data);
    const result = await postRequest("/api/cart", JSON.stringify(data));
    const response = await result.json();
    // console.log(response);
    const totalPrice = response?.products?.reduce(
      (acc: number, curr: any) => acc + curr.price * curr.quantity,
      0
    );
    cartContext.cart = {
      ...cartContext.cart,
      products: response.products,
      totalQuantity: response.totalQuantity,
      totalPrice: totalPrice,
      currency: currencyObject === "1" ? "USD" : "CAD",
    };
    setTimeout(() => {
      isLoading.value = false;
    }, 1000);
  });

  useVisibleTask$(async () => {
    const data = {
      category: product.categories,
      name: product.product_name,
    };
    const req = await getAllRelatedProductsServer(data);
    relatedProducts.value = JSON.parse(req);
  });

  const handleAddToFav = $(async () => {
    if (!user.email) {
      isLoginCardOpen.value = true;
      return;
    }
    isLoading.value = true;
    const data = {
      product: product,
    };
    const result = await postRequest("/api/fav", JSON.stringify(data));
    const response = await result.json();
    if (response.status === "failed") {
      isLoading.value = false;
      isToastCardOpen.value = true;
      message.value = response.data;
      return;
    }
    (wishList as any).wishList.data = response.data.products;
    isLoading.value = false;
  });

  const handleAlertClose = $(() => {
    message.value = "";
    isToastCardOpen.value = false;
  });

  useOnDocument(
    "DOMContentLoaded",
    $(() => {
      // generate json product schema
      const jsonProduct = document.createElement("script");
      jsonProduct.type = "application/ld+json";
      const object: any = {
        "@context": "https://schema.org/",
        "@type": "Product",
        name: product.product_name,
        image: (product.imgs ?? [])[0].includes("http")
          ? (product.imgs ?? [])[0]
          : `https://xpressbeauty.ca${(product.imgs ?? [])[0].replace(
              ".",
              ""
            )}`,
        description: product.description
          ?.replace(/<img .*?>/g, "")
          ?.replace(/Cosmo Prof/g, "Xpress Beauty")
          ?.replace(/Canrad/g, "Xpress Beauty"),
        sku: product._id,
        brand: {
          "@type": "Brand",
          name: product.companyName?.name ?? "",
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "CAD",
          price:
            product.priceType === "range"
              ? product.price.min
              : product.price.regular,
          priceValidUntil: "2022-11-05",
          itemCondition: "https://schema.org/NewCondition",
          availability:
            (product.variations?.length ?? 0) > 0
              ? product.variations?.some(
                  (variation: any) => variation.quantity_on_hand > 0
                )
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock"
              : (product?.quantity_on_hand ?? 0) > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
        },
      };
      const ratingsCount: any[] = [];
      let averageRating = 0;
      for (const rating of ratings.result?.ratings || []) {
        ratingsCount.push(rating.rating);
      }
      const sumOfRatings = ratingsCount.reduce(
        (total: any, rating: any) => total + rating,
        0
      );
      averageRating = Math.round((sumOfRatings / ratingsCount.length) * 2) / 2;
      if (averageRating > 0) {
        object["aggregateRating"] = {
          "@type": "AggregateRating",
          ratingValue: averageRating,
          reviewCount: ratingsCount.length,
        };
      }
      jsonProduct.text = JSON.stringify(object);
      document.head.appendChild(jsonProduct);
    })
  );

  useVisibleTask$(async () => {
    if (product.priceType === "range") {
      const stripe = await loadStripe(
        import.meta.env.VITE_STRIPE_TEST_PUBLISHABLE_KEY ?? ""
      );

      const elements: any = stripe?.elements({
        locale: "en-GB",
      });

      const options = {
        amount: (product.price?.min ?? 0) * 100,
        currency: currencyObject === "1" ? "USD" : "CAD",
        logoType: "badge",
        lockupTheme: "black",
        modalLinkStyle: "learn-more-text",
        modalTheme: "mint",
        introText: "Pay",
      };

      const afterpayClearpayMessageElement = elements?.create(
        "afterpayClearpayMessage",
        options
      );

      afterpayClearpayMessageElement.mount("#afterpay-clearpay-message");
      return;
    }
    const stripe = await loadStripe(
      import.meta.env.VITE_STRIPE_TEST_PUBLISHABLE_KEY ?? ""
    );

    const elements: any = stripe?.elements({
      locale: "en-GB",
    });

    const options = {
      amount: (product.price?.regular ?? 0) * 100,
      currency: currencyObject === "1" ? "USD" : "CAD",
      logoType: "badge",
      lockupTheme: "black",
      modalLinkStyle: "learn-more-text",
      modalTheme: "mint",
      introText: "Pay",
    };

    const afterpayClearpayMessageElement = elements?.create(
      "afterpayClearpayMessage",
      options
    );

    afterpayClearpayMessageElement.mount("#afterpay-clearpay-message");
  });

  useTask$(() => {
    if (product.variation_type && product.variation_type === "Size") {
      const variation = (product?.variations ?? [])[0];
      finalVariationToAdd.value[0] = {
        variation_id: variation._id,
        variation_name: variation.variation_name,
        price: variation.price,
        quantity: 1,
        variation_image: variation.variation_image,
      };
    }
  });

  useVisibleTask$(() => {
    if (
      product.variation_type === "Size" &&
      (product?.variations ?? []).length > 0
    ) {
      const img = document?.getElementById("product-image");
      img?.setAttribute(
        "src",
        `${
          (product?.variations ?? [])[0]?.variation_image?.includes("+")
            ? (product?.variations ?? [])[0]?.variation_image.replace(
                "+",
                "%2B"
              )
            : (product?.variations ?? [])[0]?.variation_image ??
              (product?.imgs ?? [])[0]
        }`
      );
      currentProduct.value = {
        ...product,
        quantity_on_hand: (product?.variations ?? [])[0].quantity_on_hand,
      };
    } else {
      const img = document?.getElementById("product-image");
      img?.setAttribute("src", `${(product?.imgs ?? [])[0]}`);
      currentProduct.value = product;
    }
  });

  // console.log(product);

  return (
    <>
      {isLoading.value && (
        <>
          <div class="w-full backdrop-blur-lg drop-shadow-lg fixed z-20 m-auto inset-x-0 inset-y-0 ">
            <progress class="progress progress-white w-56 fixed z-20 m-auto inset-x-0 inset-y-0  bg-white"></progress>
          </div>
        </>
      )}
      {isToastCardOpen.value && (
        <Toast
          status="e"
          handleClose={handleAlertClose}
          message={message.value}
          index={1}
        />
      )}
      {isLoginCardOpen.value && (
        <div class="w-full h-full fixed top-0 left-0 backdrop-blur-md z-50 ">
          <div class="card shadow-2xl p-5 w-fit h-fit fixed top-1/2 left-1/2 bg-white -translate-y-1/2 -translate-x-1/2 z-50">
            <div class="card-body">
              <h2 class="card-title">
                Please Login or Signup to add this product to your wishlist
              </h2>
              <div class="card-actions justify-end">
                <a class="btn btn-primary" href="/login">
                  Login
                </a>
                <button
                  onClick$={() => (isLoginCardOpen.value = false)}
                  class="btn btn-ghost"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div class="flex flex-col gap-5 lg:gap-20">
        <div class="flex flex-col justify-start items-start w-full gap-5 lg:grid lg:grid-cols-3 lg:gap-10 p-3 lg:p-10">
          <Gallery
            product_name={product.product_name ?? ""}
            imgs={product.imgs ?? []}
          />
          <div class=" col-span-2 flex flex-col gap-5">
            <ProductMainInfo
              ratings={ratings.result?.ratings ?? []}
              currencyObject={currencyObject}
              product_name={product.product_name ?? ""}
              price={product?.price ?? ""}
              sale_price={product?.sale_price ?? ""}
              priceType={product?.priceType ?? ""}
              isVariant={true}
              isVerified={user.isEmailVerified && user.isPhoneVerified}
              companyName={product?.companyName ?? ""}
              categories={product?.categories ?? []}
            />
            {(product?.variations?.length ?? 0) > 0 &&
              product?.variation_type?.toLocaleLowerCase() === "size" && (
                <div class="flex flex-row gap-3 w-full md:w-96 flex-wrap md:flex-nowrap">
                  {product?.variations
                    ?.sort(
                      (a: any, b: any) => a.variation_name - b.variation_name
                    )
                    .map((variation: any, index: number) => {
                      return (
                        <div
                          key={index}
                          class="flex flex-row md:flex-col justify-start items-center w-full gap-2"
                        >
                          <button
                            class={`btn w-40 ${
                              finalVariationToAdd.value[index]
                                ? " btn-success"
                                : "btn-outline"
                            }`}
                            onClick$={() => {
                              // debugger;
                              console.log(variation);
                              finalVariationToAdd.value = {};
                              finalVariationToAdd.value[index] = {
                                variation_id: variation._id,
                                variation_name: variation.variation_name,
                                variation_image: variation.variation_image,
                                price: variation.price,
                                quantity: 1,
                                totalQuantity: variation.quantity_on_hand,
                              };
                              currentProduct.value = {
                                ...product,
                                quantity_on_hand: variation.quantity_on_hand,
                              };
                              const imgSrcs = `${
                                variation.variation_image?.includes("+")
                                  ? variation.variation_image.replace(
                                      "+",
                                      "%2B"
                                    )
                                  : variation.variation_image ??
                                    (product?.imgs ?? [])[0]
                              }`;
                              console.log(imgSrcs);
                              const img =
                                document?.getElementById("product-image");
                              if (!img) return;
                              img?.setAttribute(
                                "src",
                                `${
                                  variation.variation_image?.includes("+")
                                    ? variation.variation_image.replace(
                                        "+",
                                        "%2B"
                                      )
                                    : variation.variation_image ??
                                      (product?.imgs ?? [])[0]
                                }`
                              );
                            }}
                          >
                            {variation.variation_name}
                          </button>
                          {/* variation price */}
                          <p class="text-black text-sm font-bold">
                            {currencyObject === "1"
                              ? (
                                  parseFloat(variation.price) * 0.9
                                ).toLocaleString("en-us", {
                                  style: "currency",
                                  currency: "USD",
                                })
                              : parseFloat(variation.price).toLocaleString(
                                  "en-us",
                                  {
                                    style: "currency",
                                    currency: "CAD",
                                  }
                                )}
                          </p>
                        </div>
                      );
                    })}
                </div>
              )}
            <ProductActions
              handleAddToCart={handleAddToCart}
              handleAddToFav={handleAddToFav}
              finalVariationToAdd={finalVariationToAdd.value}
              qunatity={
                currentProduct.value.variations &&
                currentProduct.value.variations?.length > 0 &&
                currentProduct.value.variation_type !== "Size"
                  ? 300
                  : parseInt(
                      currentProduct.value?.quantity_on_hand?.toString() ?? "0"
                    )
              }
              isVariation={
                (product.variations &&
                  product.variations?.length > 0 &&
                  product.variation_type === "Color") ??
                false
              }
              variationType={product.variation_type}
              variationValue={variationValue}
            />

            {product.variation_type?.toLocaleLowerCase() !== "size" &&
              (product?.variations?.length ?? 0) > 0 && (
                // product?.variation_type === "Color" &&
                <div
                  class={`menu menu-horizontal bg-base-100 shadow-xl h-fit max-h-96 overflow-scroll gap-10 justify-center
                  items-center md:p-4 w-full lg:w-[30vw]`}
                >
                  {product?.variations?.map((variation: any, index: number) => {
                    useVisibleTask$(() => {
                      variationValue[index] = 0;
                    });
                    if (variation?.price === "$null") {
                      return <Fragment key={index}></Fragment>;
                    }
                    return (
                      <div
                        key={index}
                        class="flex flex-col w-full justify-center"
                      >
                        <Variations
                          variation={variation}
                          // variation_type={product.variation_type}
                          value={variationValue}
                          productId={product.id ?? ""}
                          index={index}
                          variationQuantity={variation?.quantity_on_hand ?? 0}
                          finalVariationToAdd={finalVariationToAdd}
                          product_name={product.product_name ?? ""}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
          </div>
        </div>
        <div class="flex flex-row gap-5 lg:gap-10 p-3 lg:p-10">
          <RatingAndDescription
            ingredients={product.ingredients ?? ""}
            directions={product.directions ?? ""}
            product_description={product.description ?? ""}
            user={user.email ? user : null}
            productId={product._id ?? ""}
            ratingsProp={ratings.result?.ratings ?? []}
          />
        </div>
        {relatedProducts.value?.length > 0 && (
          <RelatedProducts
            relatedProducts={relatedProducts.value || null}
            currencyObject={currencyObject}
          />
        )}
      </div>
    </>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const doc = resolveValue(useServerData);

  const jsonData = JSON.parse(doc)._doc;

  return {
    title: `${jsonData?.product_name ?? ""} | ${
      jsonData.companyName?.name && jsonData.companyName?.name !== ""
        ? `${jsonData.companyName?.name} |`
        : ""
    } ${`${jsonData.categories[0]?.main ?? ""}`}`,
    meta: [
      {
        name: "description",
        content: `Discover ${jsonData?.product_name ?? ""}${
          jsonData.companyName?.name && jsonData.companyName?.name !== ""
            ? ` by ${jsonData.companyName.name}`
            : " "
        }${
          jsonData.lineName && jsonData.lineName !== ""
            ? ` from the ${jsonData.lineName} collection `
            : " "
        }at Xpress Beauty. Get it for just ${
          jsonData.priceType === "range"
            ? `$${jsonData.price.min}-$${jsonData.price.max}`
            : `$${jsonData.price.regular}`
        } in our ${
          jsonData.categories
            .map((cat: any) => `${cat?.main}, ${cat.name}`)
            .join(", ") ?? ""
        } category.`,
      },
      {
        name: "keywords",
        content: `${jsonData?.product_name ?? ""}, ${
          jsonData.companyName && jsonData.companyName !== ""
            ? `${jsonData.companyName},`
            : ""
        } ${jsonData.categories.join(", ") ?? ""}`,
      },
    ],
  };
};
