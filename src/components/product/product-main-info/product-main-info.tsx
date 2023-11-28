import { component$, useSignal, useTask$ } from "@builder.io/qwik";
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
    // isVerified,
    priceType,
    ratings,
    companyName,
  } = props;
  const finalSalePrice = useSignal<string>("");
  const finalRegularPrice = useSignal<string>("");
  const verifiedPrice = useSignal<string>("");
  const verifiedSalePrice = useSignal<string>("");

  useTask$(() => {
    if (priceType === "single" && sale_price.sale !== "") {
      finalRegularPrice.value = parseFloat(
        price?.regular?.toString()
      )?.toLocaleString("en-US", {
        style: "currency",
        currency: "CAD",
      });
      finalSalePrice.value = parseFloat(
        sale_price.sale.toString()
      )?.toLocaleString("en-US", {
        style: "currency",
        currency: "CAD",
      });
    } else if (priceType === "single" && sale_price.sale === "") {
      finalRegularPrice.value = parseFloat(
        price?.regular?.toString()
      )?.toLocaleString("en-US", {
        style: "currency",
        currency: "CAD",
      });
    } else if (priceType === "range" && sale_price.min === "") {
      finalRegularPrice.value =
        price.min?.toLocaleString("en-US", {
          style: "currency",
          currency: "CAD",
        }) +
        " - " +
        price.max?.toLocaleString("en-US", {
          style: "currency",
          currency: "CAD",
        });
    } else if (priceType === "range" && sale_price.min !== "") {
      finalRegularPrice.value =
        price.min?.toLocaleString("en-US", {
          style: "currency",
          currency: "CAD",
        }) +
        " - " +
        price.max?.toLocaleString("en-US", {
          style: "currency",
          currency: "CAD",
        });
      finalSalePrice.value =
        price.max?.toLocaleString("en-US", {
          style: "currency",
          currency: "CAD",
        }) +
        " - " +
        sale_price.max?.toLocaleString("en-US", {
          style: "currency",
          currency: "CAD",
        });
    } else {
      finalRegularPrice.value = price.min?.toLocaleString("en-US", {
        style: "currency",
        currency: "CAD",
      });
      finalSalePrice.value = price.max?.toLocaleString("en-US", {
        style: "currency",
        currency: "CAD",
      });
    }
  });

  useTask$(() => {
    if (priceType === "single" && sale_price.sale !== "") {
      verifiedPrice.value = (
        parseFloat(price?.regular?.toString()) -
        parseFloat(price?.regular?.toString()) * 0.2
      )?.toLocaleString("en-US", {
        style: "currency",
        currency: "CAD",
      });
      verifiedSalePrice.value = (
        parseFloat(sale_price?.sale?.toString()) -
        parseFloat(sale_price?.sale?.toString()) * 0.2
      )?.toLocaleString("en-US", {
        style: "currency",
        currency: "CAD",
      });
    } else if (priceType === "single" && sale_price.sale === "") {
      verifiedPrice.value = (
        parseFloat(price?.regular?.toString()) -
        parseFloat(price?.regular?.toString()) * 0.2
      )?.toLocaleString("en-US", {
        style: "currency",
        currency: "CAD",
      });
    } else if (priceType === "range" && sale_price.min === "") {
      verifiedPrice.value =
        (
          parseFloat(price?.min?.toString()) -
          parseFloat(price?.min?.toString()) * 0.2
        )?.toLocaleString("en-US", {
          style: "currency",
          currency: "CAD",
        }) +
        " - " +
        (
          parseFloat(price?.max?.toString()) -
          parseFloat(price?.max?.toString()) * 0.2
        )?.toLocaleString("en-US", {
          style: "currency",
          currency: "CAD",
        });
    } else if (priceType === "range" && sale_price.min !== "") {
      verifiedPrice.value =
        (
          parseFloat(price?.min?.toString()) -
          parseFloat(price?.min?.toString()) * 0.2
        )?.toLocaleString("en-US", {
          style: "currency",
          currency: "CAD",
        }) +
        " - " +
        (
          parseFloat(price?.max?.toString()) -
          parseFloat(price?.max?.toString()) * 0.2
        )?.toLocaleString("en-US", {
          style: "currency",
          currency: "CAD",
        });
      verifiedSalePrice.value =
        (
          parseFloat(sale_price?.min?.toString()) -
          parseFloat(sale_price?.min?.toString()) * 0.2
        )?.toLocaleString("en-US", {
          style: "currency",
          currency: "CAD",
        }) +
        " - " +
        (
          parseFloat(sale_price?.max?.toString()) -
          parseFloat(sale_price?.max?.toString()) * 0.2
        )?.toLocaleString("en-US", {
          style: "currency",
          currency: "CAD",
        });
    } else {
      verifiedPrice.value = (
        parseFloat(price?.min?.toString()) -
        parseFloat(price?.min?.toString()) * 0.2
      )?.toLocaleString("en-US", {
        style: "currency",
        currency: "CAD",
      });
      verifiedSalePrice.value = (
        parseFloat(price?.max?.toString()) -
        parseFloat(price?.max?.toString()) * 0.2
      )?.toLocaleString("en-US", {
        style: "currency",
        currency: "CAD",
      });
    }
  });

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
      {ratings?.result?.ratings?.length > 0 && (
        <Rating ratings={ratings?.result?.ratings ?? []} />
      )}

      <div class="flex flex-col lg:flex-row gap-3 ">
        {/* {!isVerified && ( */}
        <h2 class="flex flex-row gap-2 text-xl lg:text-3xl line-through">
          {priceType === "single" && sale_price.sale !== "" && (
            <>
              <span class="text-gray-400 line-through" itemProp="price">
                {finalRegularPrice.value}
              </span>
            </>
          )}
          {priceType === "single" && sale_price.sale === "" && (
            <span class="text-black" itemProp="price">
              {finalRegularPrice.value}
            </span>
          )}
          {priceType === "range" &&
            sale_price.min === "" &&
            sale_price.max === "" && (
              <span class="text-black" itemProp="price">
                {finalRegularPrice.value}
              </span>
            )}
          {priceType === "range" &&
            sale_price.min !== "" &&
            sale_price.max !== "" && (
              <>
                <span class="text-gray-400 line-through">
                  {finalRegularPrice.value}
                </span>
                <span class="text-error ml-2">{finalSalePrice.value}</span>
              </>
            )}
        </h2>
        {/* )} */}

        {/* {isVerified && ( */}
        {/* <div class="flex flex-col gap-2"> */}
        <h2 class="flex flex-row gap-2 text-xl lg:text-3xl">
          {priceType === "single" && sale_price.sale !== "" && (
            <>
              <span>
                <span class="text-error" itemProp="price">
                  {verifiedSalePrice.value}
                </span>
              </span>
            </>
          )}
          {priceType === "single" && sale_price.sale === "" && (
            <span class="text-error" itemProp="price">
              {verifiedPrice.value}
            </span>
          )}
          {priceType === "range" &&
            sale_price.min === "" &&
            sale_price.max === "" && (
              <span class="text-error" itemProp="price">
                {verifiedPrice.value}
              </span>
            )}
          {priceType === "range" &&
            sale_price.min !== "" &&
            sale_price.max !== "" && (
              <div class="flex flex-col gap-2">
                <span class="text-error" itemProp="price">
                  {verifiedSalePrice.value}
                </span>
              </div>
            )}
        </h2>

        {/* </div> */}
        {/* )} */}
        {/* 
        {!isVerified && (
        <div class="card shadow-lg w-96 hover:bg-base-300">
          <label class="card-header bg-warning text-center">
            <span class="text-md text-gray-500 text-center font-bold">
              Black Friday Sale
            </span>
          </label>
          <a class="cursor-pointer" href="/login">
            <div class="card-body">
              <div class="flex flex-row gap-2">
                <div class="flex flex-col gap-1">
                  <p class="text-sm text-gray-500">
                    Login or Register and verify Phone Number and Email Address
                    to get an extra 20% off
                  </p>
                  <h2 class="flex flex-row gap-2 text-xl lg:text-3xl">
                    {priceType === "single" && sale_price.sale !== "" && (
                      <>
                        <span
                          class="text-gray-400 line-through"
                          itemProp="price"
                        >
                          {verifiedPrice.value}
                        </span>
                        <span class="text-error ml-2" itemProp="price">
                          {verifiedSalePrice.value}
                        </span>
                      </>
                    )}
                    {priceType === "single" && sale_price.sale === "" && (
                      <span class="text-black" itemProp="price">
                        {verifiedPrice.value}
                      </span>
                    )}
                    {priceType === "range" &&
                      sale_price.min === "" &&
                      sale_price.max === "" && (
                        <span class="text-black" itemProp="price">
                          {verifiedPrice.value}
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
                            {verifiedPrice.value}
                          </span>
                          <span class="text-error" itemProp="price">
                            {verifiedSalePrice.value}
                          </span>
                        </div>
                      )}
                  </h2>
                </div>
              </div>
            </div>
          </a>
        </div>
        )} */}
      </div>
      <span class="text-sm text-gray-500 font-bold">
        You're automatically getting up to 40% off !!!
      </span>
    </div>
  );
});
