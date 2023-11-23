import {
  component$,
  //  useContext
} from "@builder.io/qwik";
// import { CartContext } from "~/context/cart.context";
import type { ProductModel } from "~/models/product.model";
import { Image } from "@unpic/qwik";

interface ProductCardProps {
  product: ProductModel;
  i: number;
  cardSize?: string;
}

export const ProductCard = component$((props: ProductCardProps) => {
  const { product, i, cardSize } = props;
  // const context: any = useContext(CartContext);

  return (
    <a
      class={`btn btn-ghost flex flex-row lg:flex-col ${
        cardSize === "sm" ? "lg:w-96 lg:h-96" : "lg:w-96 lg:h-96"
      } w-40 h-72 bg-[#FFFFFF] shadow-sm
       shadow-neutral-500 rounded-lg border-2 border-[#D4D4D8] border-solid justify-center items-center normal-case`}
      href={`/products/${encodeURIComponent(
        product.product_name
          ?.replace(/[^a-zA-Z ]/g, "")
          .replace(/ /g, "-")
          .toLowerCase() ?? ""
      )}`}
    >
      <Image
        layout="constrained"
        key={i}
        src={(product.imgs ?? [])[0]}
        onError$={(e: any) => {
          e.target.src = "/placeholder.webp";
        }}
        alt={product.product_name}
        class={`${
          cardSize === "sm" ? "lg:w-52 lg:h-52" : "lg:w-52 lg:h-52"
        } w-24 h-24 object-contain`}
        itemProp="image"
      />
      <div class="p-0 m-0 flex flex-col items-left gap-3 w-full">
        <h2
          class={`overflow-hidden truncate ${
            cardSize === "sm" ? "lg:text-xs" : "lg:text-lg"
          } text-sm text-black`}
          itemProp="name"
        >
          {product.product_name}
        </h2>
        <div class="flex flex-col gap-2">
          <p
            class={`${
              cardSize === "sm" ? "lg:text-xs" : "lg:text-lg"
            } text-xs text-black font-semibold`}
          >
            {product.priceType === "single" &&
              product.sale_price.sale !== "" && (
                <>
                  <span class="text-xs text-neutral-800 line-through">
                    {parseFloat(
                      product?.price?.regular?.toString()
                    )?.toLocaleString("en-US", {
                      style: "currency",
                      currency: "CAD",
                    })}
                  </span>
                  {/* <span class="text-xs text-error ml-2 line-through">
                    {parseFloat(
                      product?.sale_price?.sale?.toString()
                    )?.toLocaleString("en-US", {
                      style: "currency",
                      currency: "CAD",
                    })}
                  </span> */}
                </>
              )}
            {product.priceType === "single" &&
              product.sale_price.sale === "" && (
                <span class="text-xs text-neutral-800 line-through">
                  {parseFloat(
                    product?.price?.regular?.toString()
                  )?.toLocaleString("en-US", {
                    style: "currency",
                    currency: "CAD",
                  })}
                </span>
              )}
            {product.priceType === "range" &&
              product.sale_price.min === "" &&
              product.sale_price.max === "" && (
                <span class="text-xs text-neutral-800 line-through">
                  {parseFloat(product?.price?.min?.toString())?.toLocaleString(
                    "en-US",
                    {
                      style: "currency",
                      currency: "CAD",
                    }
                  )}{" "}
                  -{" "}
                  {parseFloat(product?.price?.max?.toString())?.toLocaleString(
                    "en-US",
                    {
                      style: "currency",
                      currency: "CAD",
                    }
                  )}
                </span>
              )}
            {/* {product.priceType === "range" &&
              product.sale_price.min !== "" &&
              product.sale_price.max !== "" && (
                <div class="flex flex-col gap-2">
                  <span class="text-xs text-gray-400 line-through">
                    {parseFloat(
                      product?.sale_price?.min?.toString()
                    )?.toLocaleString("en-US", {
                      style: "currency",
                      currency: "CAD",
                    })}{" "}
                    -{" "}
                    {parseFloat(
                      product?.sale_price?.max?.toString()
                    )?.toLocaleString("en-US", {
                      style: "currency",
                      currency: "CAD",
                    })}
                  </span>
                  <span class="text-xs text-error">
                    {parseFloat(
                      product?.sale_price?.min?.toString()
                    )?.toLocaleString("en-US", {
                      style: "currency",
                      currency: "CAD",
                    })}{" "}
                    -{" "}
                    {parseFloat(
                      product?.sale_price?.max?.toString()
                    )?.toLocaleString("en-US", {
                      style: "currency",
                      currency: "CAD",
                    })}
                  </span>
                </div>
              )} */}
          </p>
          {/* {context.isVerified && ( */}
          {/* )} */}
          {/* {!context.isVerified && ( */}
          <>
            <label class="bg-black w-full text-center rounded-md">
              <span class="text-xs md:text-sm text-gray-500 text-center font-bold text-white p-1 normal-case">
                Black Friday Sale
              </span>
            </label>

            <div class="flex flex-row gap-2 justify-center">
              <div class="flex flex-col gap-1">
                <h2 class="flex flex-row gap-2 text-xs">
                  {product.priceType === "single" &&
                    product?.sale_price?.sale !== "" && (
                      <>
                        <span class="text-error" itemProp="price">
                          {(
                            parseFloat(product?.price?.regular ?? "") -
                            parseFloat(product?.price?.regular ?? "") * 0.2
                          ).toLocaleString("en-US", {
                            style: "currency",
                            currency: "CAD",
                          })}
                        </span>
                        {/* <span class="text-error ml-2" itemProp="price">
                          {(
                            parseFloat(product?.sale_price?.sale?.toString()) -
                            parseFloat(product?.sale_price?.sale?.toString()) *
                              0.2
                          ).toLocaleString("en-US", {
                            style: "currency",
                            currency: "CAD",
                          })}
                        </span> */}
                      </>
                    )}
                  {product?.priceType === "single" &&
                    product?.sale_price?.sale === "" && (
                      <span
                        class="text-error text-sm lg:text-lg"
                        itemProp="price"
                      >
                        {(
                          product?.price?.regular -
                          product?.price?.regular * 0.2
                        ).toLocaleString("en-US", {
                          style: "currency",
                          currency: "CAD",
                        })}
                      </span>
                    )}
                  {product?.priceType === "range" &&
                    product?.sale_price?.min === "" &&
                    product?.sale_price?.max === "" && (
                      <span
                        class="text-error text-sm lg:text-lg"
                        itemProp="price"
                      >
                        {(
                          product?.price?.min -
                          product?.price?.min * 0.2
                        ).toLocaleString("en-US", {
                          style: "currency",
                          currency: "CAD",
                        })}{" "}
                        -{" "}
                        {(
                          product?.price?.max -
                          product?.price?.max * 0.2
                        ).toLocaleString("en-US", {
                          style: "currency",
                          currency: "CAD",
                        })}
                      </span>
                    )}
                  {product?.priceType === "range" &&
                    product?.sale_price?.min !== "" &&
                    product?.sale_price?.max !== "" && (
                      <div class="flex flex-col gap-2">
                        <span
                          class="text-error text-sm lg:text-lg"
                          itemProp="price"
                        >
                          {(
                            product?.price?.min -
                            product?.price?.min * 0.2
                          ).toLocaleString("en-US", {
                            style: "currency",
                            currency: "CAD",
                          })}{" "}
                          -{" "}
                          {(
                            product?.price?.max -
                            product?.price?.max * 0.2
                          ).toLocaleString("en-US", {
                            style: "currency",
                            currency: "CAD",
                          })}
                        </span>
                        {/* <span class="text-error" itemProp="price">
                          {(
                            product?.sale_price?.min -
                            product?.sale_price?.min * 0.2
                          ).toLocaleString("en-US", {
                            style: "currency",
                            currency: "CAD",
                          })}{" "}
                          -{" "}
                          {(
                            product?.sale_price?.max -
                            product?.sale_price?.max * 0.2
                          ).toLocaleString("en-US", {
                            style: "currency",
                            currency: "CAD",
                          })}
                        </span> */}
                      </div>
                    )}
                </h2>
              </div>
            </div>
          </>
          {/* )} */}
        </div>
      </div>
    </a>
  );
});
