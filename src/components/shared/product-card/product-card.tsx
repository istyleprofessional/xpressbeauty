import {
  component$,
  useOnWindow,
  // useOnDocument,
  useSignal,
  useTask$,
  $,
} from "@builder.io/qwik";
import type { ProductModel } from "~/models/product.model";
import { Image } from "@unpic/qwik";
import { server$ } from "@builder.io/qwik-city";
import { getRatingByProductId } from "~/express/services/rating.reviews.service";

interface ProductCardProps {
  product: ProductModel;
  i: number;
  cardSize?: string;
  userObj?: any;
  currencyObject?: any;
}

export const ratingServer = server$(async (productId: string) => {
  const request = await getRatingByProductId(productId ?? "");
  return JSON.stringify(request);
});

export const ProductCard = component$((props: ProductCardProps) => {
  const { product, i, cardSize, currencyObject } = props;
  const finalRegularPrice = useSignal<string>("");
  const verifiedPrice = useSignal<string>("");
  const verifiedSalePrice = useSignal<string>("");
  const isInStock = useSignal<boolean>(false);
  const ratings = useSignal<any[]>([]);
  const averageRating = useSignal<number>(0);
  const totalRatings = useSignal<number>(0);

  useTask$(async () => {
    const request: any = await ratingServer(product._id ?? "");
    const response = JSON.parse(request);
    if (response.status === "success") {
      ratings.value = response?.result?.ratings || [];
    }
  });

  useTask$(({ track }) => {
    track(() => currencyObject);
    if (currencyObject === "1") {
      if (product.priceType === "range") {
        product.price.min = parseFloat(product?.price?.min?.toString()) * 0.9;

        product.price.max = parseFloat(product.price?.max?.toString()) * 0.9;
      } else {
        product.price.regular =
          parseFloat(product.price?.regular?.toString()) * 0.9;
        if (
          product.sale_price?.sale &&
          parseFloat(product.sale_price?.sale.toString() ?? "0") > 0
        ) {
          product.sale_price.sale =
            parseFloat(product?.sale_price?.sale?.toString()) * 0.9;
        }
      }
    }
  });

  useTask$(() => {
    if (product.priceType === "range") {
      if (product.price.min !== "" && product.price.max !== "") {
        finalRegularPrice.value = `${parseFloat(
          product.price?.min
        ).toLocaleString("en-US", {
          style: "currency",
          currency: currencyObject === "1" ? "USD" : "CAD",
        })} - ${parseFloat(product.price.max).toLocaleString("en-US", {
          style: "currency",
          currency: currencyObject === "1" ? "USD" : "CAD",
        })}`;
        verifiedPrice.value = `${(
          parseFloat(product.price.min) -
          parseFloat(product.price.min) * 0.2
        ).toLocaleString("en-US", {
          style: "currency",
          currency: currencyObject === "1" ? "USD" : "CAD",
        })} - ${(
          parseFloat(product.price.max) -
          parseFloat(product.price.max) * 0.2
        ).toLocaleString("en-US", {
          style: "currency",
          currency: currencyObject === "1" ? "USD" : "CAD",
        })}`;
      }
    } else {
      finalRegularPrice.value = parseFloat(
        product.price?.regular
      )?.toLocaleString("en-US", {
        style: "currency",
        currency: currencyObject === "1" ? "USD" : "CAD",
      });
      verifiedPrice.value = (
        parseFloat(product.price?.regular) -
        parseFloat(product.price?.regular) * 0.2
      ).toLocaleString("en-US", {
        style: "currency",
        currency: currencyObject === "1" ? "USD" : "CAD",
      });
      verifiedSalePrice.value = (
        parseFloat(product.sale_price?.sale) -
        parseFloat(product.sale_price?.sale) * 0.2
      )?.toLocaleString("en-US", {
        style: "currency",
        currency: currencyObject === "1" ? "USD" : "CAD",
      });
    }
  });

  useTask$(() => {
    // check if product has a variants and if it does, check if the quantity of the variants is greater than 0
    if ((product?.variations ?? []).length > 0) {
      for (const variant of product.variations ?? []) {
        if (variant.quantity_on_hand > 0) {
          isInStock.value = true;
          break;
        }
      }
    } else {
      if (parseInt(product?.quantity_on_hand?.toString() ?? "0") > 0) {
        isInStock.value = true;
      }
    }
  });

  useOnWindow(
    "load",
    $(async () => {
      const ratingsCount: any[] = [];
      for (const rating of ratings.value || []) {
        ratingsCount.push(rating.rating);
      }
      const sumOfRatings = ratingsCount.reduce(
        (total: any, rating: any) => total + rating,
        0
      );
      averageRating.value =
        Math.round((sumOfRatings / ratingsCount.length) * 2) / 2;
      totalRatings.value = ratingsCount.length;
    })
  );

  return (
    <a
      class={`btn btn-ghost grid grid-rows-4 justify-items-center items-center md:h-96
      ${
        cardSize === "sm" ? "lg:w-52 lg:h-96" : " lg:w-72 lg:h-96"
      } w-44 h-72 md:w-52 bg-[#FFFFFF] shadow-sm shadow-neutral-500 rounded-lg border-2 border-[#D4D4D8] border-solid justify-center normal-case`}
      href={`/products/${encodeURIComponent(
        product.product_name
          ?.replace(/[^a-zA-Z0-9 ]/g, "") // Exclude numbers from removal
          .replace(/ /g, "-")
          .toLowerCase() ?? ""
      )}-pid-${product._id}/`}
    >
      <Image
        layout="constrained"
        key={i}
        src={
          (product.imgs ?? [])[0].includes("http")
            ? (product.imgs ?? [])[0]
            : (product.imgs ?? [])[0].replace(".", "")
        }
        onError$={(e: any) => {
          e.target.src = "/placeholder.webp";
        }}
        alt={product.product_name}
        class={` w-32 h-32 object-contain row-span-2 bg-white rounded-lg`}
        itemProp="image"
      />
      <div>
        <h2
          class={`overflow-hidden truncate lg:text-base text-sm text-black whitespace-normal max-w-40 max-h-14 md:max-h-24 font-semibold pt-5 text-center`}
          itemProp="name"
        >
          {product.product_name?.includes("CR")
            ? product.product_name?.replace(/CR.*/, "")
            : product.product_name}
        </h2>

        {ratings.value.length > 0 && (
          <div class="rating rating-sm rating-half">
            {Array(5)
              .fill("")
              .map((_, index) => (
                <>
                  <input
                    type="radio"
                    name="rating-10"
                    class="bg-yellow-500 mask mask-star-2 mask-half-1"
                    checked={
                      // first half star
                      index + 0.5 === averageRating.value
                    }
                  />
                  <input
                    type="radio"
                    name="rating-10"
                    class="bg-yellow-500 mask mask-star-2 mask-half-2"
                    checked={
                      // second half star
                      index + 1 === averageRating.value
                    }
                  />
                </>
              ))}
          </div>
        )}
      </div>

      <div class="flex flex-col gap-2">
        {isInStock.value ? (
          <>
            <p class={`text-xs text-green-700 font-semibold lg:text-base`}>
              In Stock
            </p>
            <p class={`text-sm text-gray-500 font-semibold lg:text-base`}>
              {product.priceType === "single" && (
                <span class=" text-gray-600">{finalRegularPrice.value}</span>
              )}
              {product.priceType === "range" && (
                <span class=" text-gray-600">{finalRegularPrice.value}</span>
              )}
            </p>
          </>
        ) : (
          <p class={`text-xs text-red-700 font-semibold lg:text-base`}>
            Out of Stock
          </p>
        )}
      </div>
    </a>
  );
});
