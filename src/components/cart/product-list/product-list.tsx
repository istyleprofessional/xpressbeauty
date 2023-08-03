import {
  component$,
  useContext,
  useSignal,
  useTask$,
  $,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import { TrashIcon } from "~/components/shared/icons/icons";
import { CartContext } from "~/context/cart.context";
import { ItemQuantity } from "../item-quantity/item-quantity";
import { deleteRequest } from "~/utils/fetch.utils";
import { uuid } from "~/utils/uuid";

export const ProductList = component$(() => {
  const currentQuantityValue = useStore<any>({});
  const context: any = useContext(CartContext);
  const totalQuantity = useSignal<number>(0);

  const handleDeleteItemClick = $(async (product: any) => {
    await deleteRequest(`/api/cart/`, JSON.stringify(product));
    location.reload();
  });

  useVisibleTask$(({ track }) => {
    track(() => context?.cart?.products);
    totalQuantity.value = context?.cart?.totalQuantity;
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
        <p class="text-black font-semibold">Shopping cart</p>
        <p class="text-black">
          {context?.cart && context?.cart?.totalQuantity > 0
            ? `You have ${context?.cart?.totalQuantity} item in your cart`
            : "You have 0 item in your cart"}
        </p>
      </div>
      {context?.cart ? (
        <>
          {context?.cart?.products?.map((product: any) => {
            const productPrice = product?.sale_price
              ? product.sale_price.replace("$", "")
              : product?.price.replace("$", "");
            let productSalePrice: string | undefined = undefined;
            if (context?.isVerified) {
              productSalePrice = (
                parseFloat(productPrice) -
                parseFloat(productPrice) * 0.2
              ).toString();
            }
            return (
              <>
                {"cartVariations" in product && (
                  <>
                    {product?.cartVariations?.map(
                      (variation: any, index: number) => {
                        const price = variation?.price
                          ?.toString()
                          .replace("$", "");
                        let sale_price: string | undefined = undefined;
                        if (context?.isVerified) {
                          sale_price = (price - price * 0.2).toString();
                        }
                        return (
                          <>
                            <div
                              class="flex flex-row gap-5 justify-start items-center h-32 w-[50rem] bg-white border-2
                                border-solid border-[#E0E0E0] rounded-lg"
                              key={uuid()}
                            >
                              <img
                                src={product?.imgs[0]}
                                alt={product?.product_name}
                                class="w-32 h-32 object-contain p-5"
                              />
                              <div class="flex flex-col">
                                <h2 class="text-black w-44">
                                  {product?.product_name}
                                </h2>
                                <p class="text-black text-xs">
                                  {variation.variation_name}
                                </p>
                              </div>

                              <ItemQuantity
                                productQuantity={variation.quantity}
                                productId={product._id}
                                isVariation={true}
                                variationIndex={index}
                              />
                              <p class="text-black">
                                {sale_price ? (
                                  <>
                                    <span class="text-black line-through">
                                      C$ {parseFloat(price).toFixed(2)}
                                    </span>{" "}
                                    <span class="text-error">
                                      C$ {parseFloat(sale_price).toFixed(2)}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span>
                                      {" "}
                                      C$ {parseFloat(price).toFixed(2)}
                                    </span>
                                  </>
                                )}
                              </p>
                              <button
                                class="btn text-[#CC0000]"
                                onClick$={() => {
                                  product.cartVariations.splice(index, 1);
                                  handleDeleteItemClick(product);
                                }}
                              >
                                <TrashIcon />
                              </button>
                            </div>
                          </>
                        );
                      }
                    )}
                  </>
                )}
                {!("cartVariations" in product) && (
                  <>
                    <div
                      class="flex flex-row gap-5 justify-start items-center h-32 w-[50rem] bg-white border-2
                              border-solid border-[#E0E0E0] rounded-lg"
                      key={uuid()}
                    >
                      <img
                        src={product?.imgs[0]}
                        alt={product?.product_name}
                        class="w-32 h-32 object-contain p-5"
                      />
                      <h2 class="text-black w-44">{product?.product_name}</h2>
                      <ItemQuantity
                        productQuantity={product?.cartQuantity}
                        productId={product?._id}
                        isVariation={false}
                        variationIndex={undefined}
                      />
                      <p class="text-black">
                        {productSalePrice ? (
                          <>
                            <span class="line-through">
                              C$ {parseFloat(productPrice ?? "").toFixed(2)}
                            </span>{" "}
                            <span class="text-error">
                              C$ {parseFloat(productSalePrice ?? "").toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <>
                            <span>
                              C$ {parseFloat(productPrice ?? "").toFixed(2)}
                            </span>
                          </>
                        )}
                      </p>
                      <button
                        class="btn text-[#CC0000]"
                        onClick$={() => handleDeleteItemClick(product)}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </>
                )}
              </>
            );
          })}
        </>
      ) : (
        <></>
      )}
    </>
  );
});
