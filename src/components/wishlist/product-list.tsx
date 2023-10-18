import {
  component$,
  useContext,
  useTask$,
  $,
  useStore,
} from "@builder.io/qwik";
import { TrashIcon } from "~/components/shared/icons/icons";
import { WishListContext } from "~/context/wishList.context";
// import { ItemQuantity } from "../cart/item-quantity/item-quantity";
import { deleteRequest } from "~/utils/fetch.utils";
import { uuid } from "~/utils/uuid";

export const ProductList = component$(() => {
  const currentQuantityValue = useStore<any>({});
  const context: any = useContext(WishListContext);

  const handleDeleteItemClick = $(async (product: any) => {
    const request = await deleteRequest(
      `/api/wishlist/`,
      JSON.stringify(product)
    );
    const response = await request.json();
    context.wishList.data = response?.result?.products;
  });

  useTask$(() => {
    if (context?.cart?.products) {
      Object.keys(context?.cart?.products).map((key: any) => {
        currentQuantityValue[key] = context?.cart?.products[key]?.quantity;
      });
    }
  });

  return (
    <>
      <div class="pl-6 flex flex-col gap-4">
        <p class="text-black text-xs md:text-base">
          You have{" "}
          {context?.wishList?.data?.length > 0
            ? context?.wishList?.data?.length
            : 0}{" "}
          item in your wishlist
        </p>
      </div>
      {context?.wishList && (
        <>
          {context?.wishList?.data?.map((product: any) => (
            <div
              class="flex flex-row gap-1 md:gap-5 justify-start items-center h-fit w-fit lg:w-[50%] bg-white border-2
                                  border-solid border-[#E0E0E0] rounded-lg"
              key={uuid()}
            >
              <a
                href={`/products/${encodeURIComponent(
                  product.product_name
                    ?.replace(/[^a-zA-Z ]/g, "")
                    .replace(/ /g, "-")
                    .toLowerCase() ?? ""
                )}`}
                class="flex flex-row gap-1 md:gap-5 justify-start items-center h-fit w-fit lg:w-[50%]"
              >
                <img
                  src={product?.imgs[0]}
                  alt={product?.product_name}
                  class="w-12 h-12 md:w-32 md:h-32 object-contain lg:p-5"
                />
                <div class="flex flex-col">
                  <h2 class="text-black text-xs md:text-sm w-52 overflow-ellipsis overflow-hidden">
                    {product?.product_name}
                  </h2>
                  <p class="text-black text-xs">
                    {product?.variation_name ?? ""}
                  </p>
                </div>
              </a>
              <button
                class="btn text-[#CC0000] m-2 ml-auto"
                onClick$={() => {
                  handleDeleteItemClick(product);
                }}
              >
                <TrashIcon classes="md:w-5 md:h-5 w-4 h-4" />
              </button>
            </div>
          ))}
        </>
      )}
    </>
  );
});
