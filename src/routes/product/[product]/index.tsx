import {
  component$,
  useContext,
  $,
  useSignal,
  useVisibleTask$,
  useStore,
  useTask$,
} from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { Gallery } from "~/components/product/gallery/gallery";
import { ProductActions } from "~/components/product/product-actions/product-actions";
import { ProductMainInfo } from "~/components/product/product-main-info/product-main-info";
import { RatingAndDescription } from "~/components/product/rating-description/rating-description";
import { RelatedProducts } from "~/components/product/related-products/related-products";
import { Variations } from "~/components/product/variations/variations";
import { CartContext } from "~/context/cart.context";
import { connect } from "~/express/db.connection";
import { get_product_by_name } from "~/express/services/product.service";
import type { ProductModel } from "~/models/product.model";
import { getRequest, postRequest } from "~/utils/fetch.utils";

export const useServerData = routeLoader$(async ({ params }) => {
  console.log(params);
  await connect();
  const product = params.product;
  const result: any = await get_product_by_name(product);
  return JSON.stringify(result);
});

export default component$(() => {
  const product: ProductModel = JSON.parse(useServerData().value);
  const cartContext: any = useContext(CartContext);
  const relatedProducts = useSignal<any[]>([]);
  const isLoading = useSignal(false);
  const variationValue = useStore<any>({}, { deep: true });
  const src = product?.product_name?.replace(/[^A-Za-z0-9]+/g, "");
  const variationQuantity = useStore<any>({}, { deep: true });
  const productQuantity = useSignal<number>(1);
  const productsVariation = useSignal<any[]>([]);
  const isVariation = useSignal(false);
  const finalVariationToAdd = useSignal<any>({});

  useTask$(() => {
    console.log(product);
    if (
      (product?.variations?.length ?? 0 > 0) &&
      product?.category?.includes("Hair")
    ) {
      isVariation.value = true;
      productQuantity.value = 20;
    } else if (
      !product?.variations?.length &&
      product?.category?.includes("Hair")
    ) {
      isVariation.value = false;
      productQuantity.value = 20;
    } else {
      isVariation.value = false;
      productQuantity.value = parseInt(product?.quantity_on_hand ?? "") ?? 0;
    }
  });

  const handleAddToCart = $(async (value: number) => {
    product.cartQuantity = value;
    if (Object.keys(finalVariationToAdd.value)?.length > 0) {
      product.cartVariations = Object.keys(finalVariationToAdd.value).map(
        (key) => {
          return finalVariationToAdd.value[key];
        }
      );
    }
    const data = {
      browserId: cartContext.id,
      product: product,
    };
    await postRequest("/api/cart", JSON.stringify(data));
    finalVariationToAdd.value = {};
    location.reload();
  });

  useVisibleTask$(async () => {
    const response = await getRequest(
      `/api/related-products?category=${
        product.category?.split(",")[1]
      }&productName=${encodeURIComponent(product.product_name ?? "")}`
    );
    const data = await response.json();
    relatedProducts.value = data.result;
  });

  return (
    <>
      {isLoading.value && (
        <>
          <div class="w-full backdrop-blur-lg drop-shadow-lg fixed z-20 m-auto inset-x-0 inset-y-0 ">
            <progress class="progress progress-white w-56 fixed z-20 m-auto inset-x-0 inset-y-0  bg-black"></progress>
          </div>
        </>
      )}
      <div class="flex flex-col gap-36">
        <div class="grid grid-cols-3 gap-10 p-10">
          <Gallery
            product_name={product.product_name ?? ""}
            imgs={product.imgs ?? []}
          />
          <div class=" col-span-2 flex flex-col gap-5">
            <ProductMainInfo
              product_name={product.product_name ?? ""}
              price={product.price ?? ""}
              sale_price={product.sale_price ?? ""}
              isVariant={true}
            />
            <ProductActions
              handleAddToCart={handleAddToCart}
              qunatity={productQuantity.value ?? 0}
              isVariation={isVariation.value}
              variationValue={variationValue}
            />
            {(product?.variations?.length ?? 0) > 0 && (
              <div class="flex flex-row w-full">
                <div
                  class="menu menu-horizontal bg-base-100 shadow-xl h-96 overflow-auto gap-10 justify-center
                  items-center p-4 w-[30vw]"
                >
                  {product?.variations?.map((variation: any, index: number) => {
                    const folder = `/products-images-2/${src}/variation/variation-image-${index}.webp`;

                    useVisibleTask$(() => {
                      variationValue[index] = 0;
                      variationQuantity[index] = 100;
                      productsVariation?.value?.forEach((element: any) => {
                        if (element?.id === variation.variation_id) {
                          if (element?.availability?.IsOutOfStock === true) {
                            variationQuantity[index] = 0;
                          } else {
                            variationQuantity[index] = 100;
                          }
                          return;
                        }
                      });
                    });
                    if (variation?.price === "$null") {
                      return <></>;
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
                          variationQuantity={variationQuantity}
                          finalVariationToAdd={finalVariationToAdd}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
        <RatingAndDescription product_description={product.description ?? ""} />
        <RelatedProducts relatedProducts={relatedProducts.value} />
      </div>
    </>
  );
});
