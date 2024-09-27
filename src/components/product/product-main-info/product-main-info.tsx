import { component$, useSignal, useTask$ } from "@builder.io/qwik";

interface ProductMainInfoProps {
  product_name: string;
  price: any;
  isVariant: boolean;
  sale_price?: any;
  isVerified?: boolean;
  priceType?: string;
  ratings?: any;
  companyName?: any;
  currencyObject?: any;
  categories?: any;
}

export const ProductMainInfo = component$((props: ProductMainInfoProps) => {
  const {
    currencyObject,
    product_name,
    price,
    sale_price,
    priceType,
    ratings,
    companyName,
  } = props;
  const finalRegularPrice = useSignal<string>("");
  const salePrice = useSignal<string>("");
  const averageRating = useSignal<number>(0);
  const totalRatings = useSignal<number>(0);

  useTask$(() => {
    if (priceType === "range") {
      if (price.min !== "" && price.max !== "") {
        finalRegularPrice.value = `${parseFloat(price.min).toLocaleString(
          "en-US",
          {
            style: "currency",
            currency: currencyObject === "1" ? "USD" : "CAD",
          }
        )} - ${parseFloat(price.max).toLocaleString("en-US", {
          style: "currency",
          currency: currencyObject === "1" ? "USD" : "CAD",
        })}`;
      }
    } else {
      if (price?.regular && price?.regular?.regular) {
        price.regular = price.regular.regular;
      }
      finalRegularPrice.value = parseFloat(price?.regular)?.toLocaleString(
        "en-US",
        {
          style: "currency",
          currency: currencyObject === "1" ? "USD" : "CAD",
        }
      );
      salePrice.value = parseFloat(sale_price?.sale)?.toLocaleString("en-US", {
        style: "currency",
        currency: currencyObject === "1" ? "USD" : "CAD",
      });
    }
    if (
      salePrice.value === finalRegularPrice.value ||
      salePrice.value === "CA$NaN"
    )
      salePrice.value = "";
  });

  useTask$(async () => {
    const ratingsCount: any[] = [];
    for (const rating of ratings || []) {
      ratingsCount.push(rating.rating);
    }
    const sumOfRatings = ratingsCount.reduce(
      (total: any, rating: any) => total + rating,
      0
    );
    averageRating.value =
      Math.round((sumOfRatings / ratingsCount.length) * 2) / 2;
    totalRatings.value = ratingsCount.length;
  });

  return (
    <div class="flex flex-col gap-10">
      <div class="flex flex-col gap-3">
        <h1 class="text-xl md:text-4xl font-bold text-black">
          {product_name.includes("CR")
            ? product_name.replace(/CR.*/, "")
            : product_name}
        </h1>
        {companyName.name && companyName.name !== "" && (
          <h2 class="text-black text-lg md:text-2xl">{companyName.name}</h2>
        )}
      </div>
      {ratings?.length > 0 && (
        <div class="flex flex-row gap-2 items-center">
          <div class="rating rasting-lg rating-half">
            {Array(5)
              .fill("")
              .map((_, index) => (
                <>
                  <input
                    type="radio"
                    name="rating-10"
                    class={`
                    ${
                      averageRating.value >= index + 0.5
                        ? "bg-yellow-500"
                        : "bg-gray-300"
                    }
                    mask mask-star-2 mask-half-1`}
                  />
                  <input
                    type="radio"
                    name="rating-10"
                    class={`
                    ${
                      averageRating.value >= index + 1
                        ? "bg-yellow-500"
                        : "bg-gray-300"
                    }
                    mask mask-star-2 mask-half-2`}
                  />
                  <label for={`star${index + 1}`}></label>
                </>
              ))}
          </div>
          {(ratings?.length ?? 0) > 0 && (
            <div class="text-sm font-semibold text-gray-400">
              Rated <span>{averageRating.value ? averageRating.value : 0}</span>
              /5 based on <span>{totalRatings.value}</span> customer reviews
            </div>
          )}
        </div>
        // <Rating ratings={ratings?.result?.ratings ?? []} />
      )}

      <div class="flex flex-col gap-3 ">
        <h2 class="flex flex-row gap-2 text-xl lg:text-3xl text-black">
          <span class="text-black">{finalRegularPrice.value}</span>
        </h2>

        <div id="afterpay-clearpay-message"> </div>
      </div>
    </div>
  );
});
