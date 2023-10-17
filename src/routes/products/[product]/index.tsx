import {
  component$,
  useContext,
  $,
  useSignal,
  useVisibleTask$,
  useStore,
  Fragment,
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
import jwt from "jsonwebtoken";
import { getUserById } from "~/express/services/user.service";
import { WishListContext } from "~/context/wishList.context";
import { Toast } from "~/components/admin/toast/toast";
import { getRatingByProductId } from "~/express/services/rating.reviews.service";
// import productSchema from "~/express/schemas/product.schema";
// import fs from "fs";

export const useServerData = routeLoader$(async ({ params, redirect }) => {
  await connect();
  const product = params.product;
  const result: any = await get_product_by_name(product);
  const ratings = await getRatingByProductId(result?._id ?? "");
  if (!result) {
    throw redirect(301, "/products/");
  }
  return JSON.stringify({ ...result, ratings: ratings });
});

export const useAuth = routeLoader$(async ({ cookie }) => {
  await connect();
  const token = cookie.get("token")?.value ?? "";

  try {
    const verify: any = jwt.verify(token, process.env.JWTSECRET ?? "");
    if (verify.isDummy) {
      return JSON.stringify({});
    }

    const user = await getUserById(verify.user_id);
    if (user.status === "failed") {
      return JSON.stringify({});
    }
    return JSON.stringify(user.result);
  } catch (error: any) {
    if (error.message === "jwt expired") {
      const decode: any = jwt.decode(token);
      const newToken = jwt.sign(
        {
          user_id: decode.user_id,
        },
        process.env.JWTSECRET ?? "",
        { expiresIn: "1h" }
      );
      cookie.set("token", newToken, {
        httpOnly: true,
        path: "/",
      });
    }
    return JSON.stringify({});
  }
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
  const src = product?.product_name?.replace(/[^A-Za-z0-9]+/g, "");
  const finalVariationToAdd = useSignal<any>({});
  const user = JSON.parse(useAuth().value ?? "");
  const wishList = useContext(WishListContext);
  const isLoginCardOpen = useSignal(false);
  const isToastCardOpen = useSignal(false);
  const message = useSignal("");

  const handleAddToCart = $(async (value: number) => {
    isLoading.value = true;
    const productsToAdd: any[] = [];
    let totalQuantity = 0;
    if (Object.values(finalVariationToAdd.value).length > 0) {
      Object.values(finalVariationToAdd.value).forEach((element: any) => {
        const productToAdd = {
          id: `${product._id}.${element.variation_id}`,
          product_name: product.product_name,
          variation_name: element.variation_name,
          product_img: (product?.imgs ?? [])[0] ?? "",
          price: cartContext.isVerified
            ? (
                parseFloat(element?.price.toString().replace("$", "")) -
                parseFloat(element?.price.toString().replace("$", "")) * 0.2
              ).toFixed(2)
            : parseFloat(element?.price.toString().replace("$", "")).toFixed(2),
          quantity: element.quantity,
        };
        totalQuantity += element.quantity;
        productsToAdd.push(productToAdd);
      });
    } else {
      const productToAdd = {
        id: product._id,
        product_name: product.product_name,
        product_img: (product?.imgs ?? [])[0] ?? "",
        price: cartContext.isVerified
          ? (product.sale_price.sale !== ""
              ? parseFloat(
                  product.sale_price.sale.toString().replace("$", "")
                ) -
                parseFloat(
                  product.sale_price.sale.toString().replace("$", "")
                ) *
                  0.2
              : parseFloat(
                  product?.price?.regular?.toString().replace("$", "") ?? "0"
                ) -
                parseFloat(
                  product?.price?.regular?.toString().replace("$", "") ?? "0"
                ) *
                  0.2
            ).toFixed(2)
          : (product.sale_price.sale !== ""
              ? parseFloat(
                  product.sale_price?.sale?.toString().replace("$", "")
                )
              : parseFloat(
                  product?.price?.regular?.toString().replace("$", "") ?? "0"
                )
            ).toFixed(2),
        quantity: value,
      };
      totalQuantity += value;
      productsToAdd.push(productToAdd);
    }
    const data = {
      browserId: cartContext.id,
      products: productsToAdd,
      totalQuantity: totalQuantity,
    };
    const result = await postRequest("/api/cart", JSON.stringify(data));
    const response = await result.json();
    const totalPrice = response?.products?.reduce(
      (acc: number, curr: any) => acc + curr.price * curr.quantity,
      0
    );
    cartContext.cart = {
      ...cartContext.cart,
      products: response.products,
      totalQuantity: response.totalQuantity,
      totalPrice: totalPrice,
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
    console.log(data);
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

  return (
    <>
      {isLoading.value && (
        <>
          <div class="w-full backdrop-blur-lg drop-shadow-lg fixed z-20 m-auto inset-x-0 inset-y-0 ">
            <progress class="progress progress-secondary  w-56 fixed z-20 m-auto inset-x-0 inset-y-0"></progress>
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
      <div itemType="https://schema.org/Product" itemScope>
        <div
          itemProp="offers"
          itemType="https://schema.org/AggregateOffer"
          itemScope
        >
          <meta
            itemProp="lowPrice"
            content={
              product.priceType === "range"
                ? product?.price?.min
                    ?.toString()
                    ?.replace("$", "")
                    ?.toLocaleString("en-US")
                : product?.price?.regular
                    ?.toString()
                    ?.replace("$", "")
                    ?.toLocaleString("en-US")
            }
          />
          <meta
            itemProp="highPrice"
            content={
              product.priceType === "range"
                ? product?.price?.max
                    ?.toString()
                    ?.replace("$", "")
                    ?.toLocaleString("en-US")
                : product?.price?.regular
                    ?.toString()
                    ?.replace("$", "")
                    ?.toLocaleString("en-US")
            }
          />
          <meta itemProp="priceCurrency" content="CAD" />
          <meta
            itemProp="availability"
            content={
              parseInt(product?.quantity_on_hand ?? "0") > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock"
            }
          />
        </div>

        <div class="flex flex-col gap-5 lg:gap-20">
          <div class="flex flex-col lg:grid lg:grid-cols-3 lg:gap-10 p-3 lg:p-10">
            <Gallery
              product_name={product.product_name ?? ""}
              imgs={product.imgs ?? []}
            />
            <div class=" col-span-2 flex flex-col gap-5">
              <meta itemProp="name" content={product.product_name ?? ""} />
              <ProductMainInfo
                ratings={ratings}
                product_name={product.product_name ?? ""}
                price={product?.price ?? ""}
                sale_price={product?.sale_price ?? ""}
                priceType={product?.priceType ?? ""}
                isVariant={true}
                isVerified={cartContext.isVerified}
                companyName={product?.companyName ?? ""}
              />
              <ProductActions
                handleAddToCart={handleAddToCart}
                handleAddToFav={handleAddToFav}
                qunatity={
                  product.variations && product.variations?.length > 0
                    ? 300
                    : parseInt(product.quantity_on_hand?.toString() ?? "0")
                }
                isVariation={
                  (product.variations && product.variations?.length > 0) ??
                  false
                }
                variationValue={variationValue}
              />
              {(product?.variations?.length ?? 0) > 0 && (
                <div
                  class="menu menu-horizontal bg-base-100 shadow-xl h-fit max-h-96 overflow-scroll gap-10 justify-center
                  items-center md:p-4 w-full md:w-[30vw]"
                >
                  {product?.variations?.map((variation: any, index: number) => {
                    const folder = `https://xpressbeauty.s3.ca-central-1.amazonaws.com/products-images-2/${src}/variation/variation-image-${index}.webp`;
                    useVisibleTask$(() => {
                      variationValue[index] = 0;
                    });
                    if (variation?.price === "$null") {
                      return <Fragment key={index}></Fragment>;
                    }
                    return (
                      <div
                        key={index}
                        class="flex flex-row w-full justify-center"
                      >
                        <Variations
                          variationType={product?.variation_type ?? ""}
                          variation={variation}
                          value={variationValue}
                          productId={product.id ?? ""}
                          folder={folder}
                          index={index}
                          variationQuantity={variation.quantity_on_hand ?? 0}
                          finalVariationToAdd={finalVariationToAdd}
                        />
                      </div>
                    );
                  })}
                </div>
                // </div>
              )}
            </div>
          </div>
          <RatingAndDescription
            product_description={product.description ?? ""}
            user={user.email ? user : null}
            productId={product._id ?? ""}
          />
          <RelatedProducts relatedProducts={relatedProducts.value || null} />
        </div>
      </div>
    </>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const doc = resolveValue(useServerData);

  const jsonData = JSON.parse(doc)._doc;
  return {
    title: `${jsonData?.product_name ?? ""} | ${
      jsonData.companyName.name && jsonData.companyName.name !== ""
        ? `${jsonData.companyName.name} |`
        : ""
    } ${`${jsonData.categories[0].main ?? ""}`}`,
    meta: [
      {
        name: "description",
        content: `Discover ${jsonData?.product_name ?? ""}${
          jsonData.companyName && jsonData.companyName !== ""
            ? ` by ${jsonData.companyName}`
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
            .map((cat: any) => `${cat.main}, ${cat.name}`)
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
