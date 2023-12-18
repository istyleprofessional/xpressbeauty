import {
  component$,
  useSignal,
  useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";
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
  currencyObject?: any;
  categories?: any;
}

export const ProductMainInfo = component$((props: ProductMainInfoProps) => {
  const {
    currencyObject,
    product_name,
    price,
    sale_price,
    isVerified,
    priceType,
    ratings,
    companyName,
    categories,
  } = props;
  const finalSalePrice = useSignal<string>("");
  const finalRegularPrice = useSignal<string>("");
  const verifiedPrice = useSignal<string>("");
  const verifiedSalePrice = useSignal<string>("");
  const isCond = useSignal<boolean>(false);

  useVisibleTask$(
    () => {
      if (categories) {
        for (const cat of categories) {
          if (
            cat?.name?.includes("Trimmers") ||
            cat?.name?.includes("Clippers")
          ) {
            isCond.value = true;
          } else {
            isCond.value = false;
          }
        }
      }
    },
    { strategy: "document-idle" }
  );

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
        verifiedPrice.value = `${(
          parseFloat(price.min) -
          parseFloat(price.min) * 0.2
        ).toLocaleString("en-US", {
          style: "currency",
          currency: currencyObject === "1" ? "USD" : "CAD",
        })} - ${(
          parseFloat(price.max) -
          parseFloat(price.max) * 0.2
        ).toLocaleString("en-US", {
          style: "currency",
          currency: currencyObject === "1" ? "USD" : "CAD",
        })}`;
      }
    } else {
      finalRegularPrice.value = parseFloat(price?.regular)?.toLocaleString(
        "en-US",
        {
          style: "currency",
          currency: currencyObject === "1" ? "USD" : "CAD",
        }
      );
      finalSalePrice.value = parseFloat(sale_price?.sale)?.toLocaleString(
        "en-US",
        {
          style: "currency",
          currency: currencyObject === "1" ? "USD" : "CAD",
        }
      );
      verifiedPrice.value = (
        parseFloat(price?.regular) -
        parseFloat(price?.regular) * 0.2
      ).toLocaleString("en-US", {
        style: "currency",
        currency: currencyObject === "1" ? "USD" : "CAD",
      });
      verifiedSalePrice.value = (
        parseFloat(sale_price?.sale) -
        parseFloat(sale_price?.sale) * 0.2
      )?.toLocaleString("en-US", {
        style: "currency",
        currency: currencyObject === "1" ? "USD" : "CAD",
      });
    }
  });
  // console.log("product", sale_price);
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

      <div class="flex flex-col gap-3 ">
        <h2 class="flex flex-row gap-2 text-xl lg:text-3xl">
          {priceType === "single" && sale_price.sale !== "" && (
            <>
              <span class="text-gray-400" itemProp="price">
                {finalRegularPrice.value}
              </span>
            </>
          )}
          {priceType === "single" && sale_price.sale === "" && (
            <span class="text-black" itemProp="price">
              {finalRegularPrice.value}
            </span>
          )}
          {priceType === "range" && (
            <span class="text-black" itemProp="price">
              {finalRegularPrice.value}
            </span>
          )}
        </h2>
        {isCond.value && (
          <div class="flex flex-col gap-2">
            <span class="text-sm text-error font-bold">
              Enjoy Free Shipping on all clippers and trimmers for a limited
              time only !!!
            </span>
          </div>
        )}
        {!isVerified && (
          <></>
          // <div class="card shadow-lg w-96 hover:bg-base-300">
          //   <label class="card-header bg-warning text-center">
          //     <span class="text-md text-gray-500 text-center font-bold">
          //       Join our Saver Club
          //     </span>
          //   </label>
          //   <a class="cursor-pointer" href="/login">
          //     <div class="card-body">
          //       <div class="flex flex-row gap-2">
          //         <div class="flex flex-col gap-1">
          //           <p class="text-sm text-gray-500">
          //             Login or Register and verify Phone Number and Email
          //             Address to get up to 40% off
          //           </p>
          //           <h2 class="flex flex-row gap-2 text-xl lg:text-3xl">
          //             {priceType === "single" && sale_price.sale !== "" && (
          //               <>
          //                 {/* <span
          //                   class="text-gray-400 line-through"
          //                   itemProp="price"
          //                 >
          //                   {verifiedPrice.value}
          //                 </span> */}
          //                 <span class="text-error ml-2" itemProp="price">
          //                   {verifiedSalePrice.value}
          //                 </span>
          //               </>
          //             )}
          //             {priceType === "single" && sale_price.sale === "" && (
          //               <span class="text-error" itemProp="price">
          //                 {verifiedPrice.value}
          //               </span>
          //             )}
          //             {priceType === "range" &&
          //               sale_price.min === "" &&
          //               sale_price.max === "" && (
          //                 <span class="text-error" itemProp="price">
          //                   {verifiedPrice.value}
          //                 </span>
          //               )}
          //             {priceType === "range" &&
          //               sale_price.min !== "" &&
          //               sale_price.max !== "" && (
          //                 <div class="flex flex-col gap-2">
          //                   {/* <span
          //                     class="text-gray-400 line-through"
          //                     itemProp="price"
          //                   >
          //                     {verifiedPrice.value}
          //                   </span> */}
          //                   <span class="text-error" itemProp="price">
          //                     {verifiedSalePrice.value}
          //                   </span>
          //                 </div>
          //               )}
          //           </h2>
          //         </div>
          //       </div>
          //     </div>
          //   </a>
          // </div>
        )}
      </div>
      {isVerified && (
        <></>
        // <span class="text-sm text-gray-500 font-bold">
        //   You're automatically getting up to 40% off !!!
        // </span>
      )}
    </div>
  );
});
