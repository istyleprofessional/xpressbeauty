import { component$ } from "@builder.io/qwik";
import { Rating } from "~/components/shared/rating/rating";

interface ProductMainInfoProps {
  product_name: string;
  price: any;
  isVariant: boolean;
  sale_price?: any;
  isVerified?: boolean;
  priceType?: string;
  ratings?: any;
  companyName?: any;
}

export const ProductMainInfo = component$((props: ProductMainInfoProps) => {
  const {
    product_name,
    price,
    sale_price,
    isVerified,
    priceType,
    ratings,
    companyName,
  } = props;

  return (
    <div class="flex flex-col gap-10">
      <div class="flex flex-col gap-3">
        <h1 class="text-xl md:text-4xl font-bold text-black" itemProp="name">
          {product_name}
        </h1>
        {companyName.name && companyName.name !== "" && (
          <div
            itemProp="brand"
            itemScope
            itemType="http://schema.org/Brand"
            id={`brand-${companyName.name.replace(/ /g, "-")}`}
          >
            <h2 class="text-black text-lg md:text-2xl" itemProp="name">
              {companyName.name}
            </h2>
          </div>
        )}
      </div>

      <Rating ratings={ratings?.result?.ratings ?? []} />
      <div class="flex flex-col gap-3 ">
        {!isVerified && (
          <h2 class="flex flex-row gap-2 text-xl lg:text-3xl">
            {priceType === "single" && sale_price.sale !== "" && (
              <>
                <span class="text-gray-400 line-through" itemProp="price">
                  {parseFloat(price?.regular?.toString()).toLocaleString(
                    "en-US",
                    {
                      style: "currency",
                      currency: "CAD",
                    }
                  )}
                </span>
                <span class="text-error ml-2" itemProp="price">
                  {parseFloat(sale_price.sale.toString()).toLocaleString(
                    "en-US",
                    {
                      style: "currency",
                      currency: "CAD",
                    }
                  )}
                </span>
              </>
            )}
            {priceType === "single" && sale_price.sale === "" && (
              <span class="text-black" itemProp="price">
                {price.regular.toLocaleString("en-US", {
                  style: "currency",
                  currency: "CAD",
                })}
              </span>
            )}
            {priceType === "range" &&
              sale_price.min === "" &&
              sale_price.max === "" && (
                <span class="text-black" itemProp="price">
                  {price.min.toLocaleString("en-US", {
                    style: "currency",
                    currency: "CAD",
                  })}{" "}
                  -{" "}
                  {price.max.toLocaleString("en-US", {
                    style: "currency",
                    currency: "CAD",
                  })}
                </span>
              )}
            {priceType === "range" &&
              sale_price.min !== "" &&
              sale_price.max !== "" && (
                <div class="flex flex-col gap-2">
                  <span class="text-gray-400 line-through" itemProp="price">
                    {sale_price.min.toLocaleString("en-US", {
                      style: "currency",
                      currency: "CAD",
                    })}{" "}
                    -{" "}
                    {sale_price.max.toLocaleString("en-US", {
                      style: "currency",
                      currency: "CAD",
                    })}
                  </span>
                  <span class="text-error" itemProp="price">
                    {sale_price.min.toLocaleString("en-US", {
                      style: "currency",
                      currency: "CAD",
                    })}{" "}
                    -{" "}
                    {sale_price.max.toLocaleString("en-US", {
                      style: "currency",
                      currency: "CAD",
                    })}
                  </span>
                </div>
              )}
          </h2>
        )}

        {isVerified && (
          <div class="flex flex-col gap-2">
            <h2 class="flex flex-row gap-2 text-xl lg:text-3xl">
              {priceType === "single" && sale_price.sale !== "" && (
                <>
                  <span class="text-gray-400 line-through" itemProp="price">
                    {(
                      parseFloat(price.regular ?? "") -
                      parseFloat(price.regular ?? "") * 0.2
                    ).toLocaleString("en-US", {
                      style: "currency",
                      currency: "CAD",
                    })}
                  </span>
                  <span class="text-error ml-2" itemProp="price">
                    {(
                      parseFloat(sale_price.sale.toString()) -
                      parseFloat(sale_price.sale.toString()) * 0.2
                    ).toLocaleString("en-US", {
                      style: "currency",
                      currency: "CAD",
                    })}
                  </span>
                </>
              )}
              {priceType === "single" && sale_price.sale === "" && (
                <span class="text-black" itemProp="price">
                  {(price.regular - price.regular * 0.2).toLocaleString(
                    "en-US",
                    {
                      style: "currency",
                      currency: "CAD",
                    }
                  )}
                </span>
              )}
              {priceType === "range" &&
                sale_price.min === "" &&
                sale_price.max === "" && (
                  <span class="text-black" itemProp="price">
                    {(price.min - price.min * 0.2).toLocaleString("en-US", {
                      style: "currency",
                      currency: "CAD",
                    })}{" "}
                    -{" "}
                    {(price.max - price.max * 0.2).toLocaleString("en-US", {
                      style: "currency",
                      currency: "CAD",
                    })}
                  </span>
                )}
              {priceType === "range" &&
                sale_price.min !== "" &&
                sale_price.max !== "" && (
                  <div class="flex flex-col gap-2">
                    <span class="text-gray-400 line-through" itemProp="price">
                      {(price.min - price.min * 0.2).toLocaleString("en-US", {
                        style: "currency",
                        currency: "CAD",
                      })}{" "}
                      -{" "}
                      {(price.max - price.max * 0.2).toLocaleString("en-US", {
                        style: "currency",
                        currency: "CAD",
                      })}
                    </span>
                    <span class="text-error" itemProp="price">
                      {(sale_price.min - sale_price.min * 0.2).toLocaleString(
                        "en-US",
                        {
                          style: "currency",
                          currency: "CAD",
                        }
                      )}{" "}
                      -{" "}
                      {(sale_price.max - sale_price.max * 0.2).toLocaleString(
                        "en-US",
                        {
                          style: "currency",
                          currency: "CAD",
                        }
                      )}
                    </span>
                  </div>
                )}
            </h2>
            <span class="text-sm text-gray-500">
              You are getting an extra 20% off
            </span>
          </div>
        )}

        {!isVerified && (
          <div class="card shadow-lg w-96 hover:bg-base-300">
            <label class="card-header bg-warning text-center">
              <span class="text-md text-gray-500 text-center font-bold">
                Saver Club
              </span>
            </label>
            <a class="cursor-pointer" href="/login">
              <div class="card-body">
                <div class="flex flex-row gap-2">
                  <div class="flex flex-col gap-1">
                    <p class="text-sm text-gray-500">
                      Login or Register and verify Phone Number and Email
                      Address to get an extra 20% off
                    </p>
                    <h2 class="flex flex-row gap-2 text-xl lg:text-3xl">
                      {priceType === "single" && sale_price.sale !== "" && (
                        <>
                          <span
                            class="text-gray-400 line-through"
                            itemProp="price"
                          >
                            {(
                              parseFloat(price.regular ?? "") -
                              parseFloat(price.regular ?? "") * 0.2
                            ).toLocaleString("en-US", {
                              style: "currency",
                              currency: "CAD",
                            })}
                          </span>
                          <span class="text-error ml-2" itemProp="price">
                            {(
                              parseFloat(sale_price.sale.toString()) -
                              parseFloat(sale_price.sale.toString()) * 0.2
                            ).toLocaleString("en-US", {
                              style: "currency",
                              currency: "CAD",
                            })}
                          </span>
                        </>
                      )}
                      {priceType === "single" && sale_price.sale === "" && (
                        <span class="text-black" itemProp="price">
                          {(price.regular - price.regular * 0.2).toLocaleString(
                            "en-US",
                            {
                              style: "currency",
                              currency: "CAD",
                            }
                          )}
                        </span>
                      )}
                      {priceType === "range" &&
                        sale_price.min === "" &&
                        sale_price.max === "" && (
                          <span class="text-black" itemProp="price">
                            {(price.min - price.min * 0.2).toLocaleString(
                              "en-US",
                              {
                                style: "currency",
                                currency: "CAD",
                              }
                            )}{" "}
                            -{" "}
                            {(price.max - price.max * 0.2).toLocaleString(
                              "en-US",
                              {
                                style: "currency",
                                currency: "CAD",
                              }
                            )}
                          </span>
                        )}
                      {priceType === "range" &&
                        sale_price.min !== "" &&
                        sale_price.max !== "" && (
                          <div class="flex flex-col gap-2">
                            <span
                              class="text-gray-400 line-through"
                              itemProp="price"
                            >
                              {(price.min - price.min * 0.2).toLocaleString(
                                "en-US",
                                {
                                  style: "currency",
                                  currency: "CAD",
                                }
                              )}{" "}
                              -{" "}
                              {(price.max - price.max * 0.2).toLocaleString(
                                "en-US",
                                {
                                  style: "currency",
                                  currency: "CAD",
                                }
                              )}
                            </span>
                            <span class="text-error" itemProp="price">
                              {(
                                sale_price.min -
                                sale_price.min * 0.2
                              ).toLocaleString("en-US", {
                                style: "currency",
                                currency: "CAD",
                              })}{" "}
                              -{" "}
                              {(
                                sale_price.max -
                                sale_price.max * 0.2
                              ).toLocaleString("en-US", {
                                style: "currency",
                                currency: "CAD",
                              })}
                            </span>
                          </div>
                        )}
                    </h2>
                  </div>
                </div>
              </div>
            </a>
          </div>
        )}
      </div>
    </div>
  );
});
