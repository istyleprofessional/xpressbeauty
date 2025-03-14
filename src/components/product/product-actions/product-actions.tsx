import type { PropFunction } from "@builder.io/qwik";
import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";

interface ProductActionsProps {
  handleAddToCart: PropFunction<(value: number) => void>;
  qunatity: number;
  isVariation: boolean;
  variationValue?: any;
  handleAddToFav: PropFunction<() => void>;
  variationType?: string;
  finalVariationToAdd?: any;
}

export const ProductActions = component$((props: ProductActionsProps) => {
  const {
    handleAddToCart,
    qunatity,
    isVariation,
    variationValue,
    handleAddToFav,
    variationType,
    finalVariationToAdd,
  } = props;
  const isButtonDisabled = useSignal<boolean>(true);
  const value = useSignal<number>(1);

  useVisibleTask$(({ track }) => {
    track(() => qunatity);
    if (qunatity > 0) {
      value.value = 1;
    }
  });

  useVisibleTask$(({ track }) => {
    track(() => {
      if (isVariation) {
        for (const key in variationValue) {
          if (variationValue[key] > 0) {
            isButtonDisabled.value = false;
            break;
          } else {
            isButtonDisabled.value = true;
          }
        }
      } else {
        if (qunatity > 0) {
          isButtonDisabled.value = false;
        } else {
          isButtonDisabled.value = true;
        }
      }
    });
  });

  return (
    <div class="flex flex-col gap-10">
      <div class="form-control">
        {!isVariation && (
          <>
            {qunatity > 0 ? (
              <>
                <label class="label">
                  <span class="label-text text-black">Quantity:</span>
                </label>
                <label class="input-group">
                  {variationType === "Size" ? (
                    <span
                      class={`btn text-xl text-black bg-[#F4F4F5] ${
                        value.value < 1 ? "btn-disabled" : ""
                      }`}
                      onClick$={() => {
                        value.value--;
                        Object.keys(finalVariationToAdd).forEach((key) => {
                          if (finalVariationToAdd[key]) {
                            finalVariationToAdd[key].quantity = value.value;
                          }
                        });
                      }}
                    >
                      -
                    </span>
                  ) : (
                    <span
                      class={`btn text-xl text-black bg-[#F4F4F5] ${
                        value.value < 1 ? "btn-disabled" : ""
                      }`}
                      onClick$={() => value.value--}
                    >
                      -
                    </span>
                  )}
                  <input
                    type="number"
                    value={value.value}
                    min="0"
                    readOnly
                    max={qunatity}
                    class="input input-bordered w-20 text-black"
                  />
                  {variationType === "Size" ? (
                    <span
                      class={`btn text-xl text-black bg-[#F4F4F5] ${
                        value.value === qunatity ? "btn-disabled" : ""
                      }`}
                      onClick$={() => {
                        value.value++;
                        Object.keys(finalVariationToAdd).forEach((key) => {
                          if (finalVariationToAdd[key]) {
                            finalVariationToAdd[key].quantity = value.value;
                          }
                        });
                      }}
                    >
                      +
                    </span>
                  ) : (
                    <span
                      class={`btn text-xl text-black bg-[#F4F4F5] ${
                        value.value === qunatity ? "btn-disabled" : ""
                      }`}
                      onClick$={() => value.value++}
                    >
                      +
                    </span>
                  )}
                </label>
              </>
            ) : (
              <p class="text-xl text-[#FF0000]">Out of Stock</p>
            )}
          </>
        )}
      </div>
      <div class="flex flex-col lg:flex-row gap-3">
        {qunatity > 0 && (
          <button
            class={`btn text-white lg:w-fit font-bold font-inter text-sm w-fit md:text-xl ${
              isButtonDisabled.value
                ? " bg-neutral-300 btn-disabled"
                : "bg-black"
            }`}
            onClick$={() => handleAddToCart(value.value)}
          >
            Add To Cart
          </button>
        )}

        <button
          class="btn btn-outline border-2 lg:w-fit w-fit flex text-sm md:text-xl flex-row gap-3 text-black"
          onClick$={handleAddToFav}
        >
          <svg
            class="w-5 h-5"
            viewBox="0 0 26 23"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.5753 1.98832C19.2753 -0.261682 15.2003 0.788318 13.0003 3.36332C10.8003 0.788318 6.72527 -0.274182 3.42527 1.98832C1.67527 3.18832 0.575267 5.21332 0.500267 7.35082C0.325267 12.2008 4.62527 16.0883 11.1878 22.0508L11.3128 22.1633C12.2628 23.0258 13.7253 23.0258 14.6753 22.1508L14.8128 22.0258C21.3753 16.0758 25.6628 12.1883 25.5003 7.33832C25.4253 5.21332 24.3253 3.18832 22.5753 1.98832ZM13.1253 20.1883L13.0003 20.3133L12.8753 20.1883C6.92527 14.8008 3.00027 11.2383 3.00027 7.62582C3.00027 5.12582 4.87527 3.25082 7.37527 3.25082C9.30027 3.25082 11.1753 4.48832 11.8378 6.20082H14.1753C14.8253 4.48832 16.7003 3.25082 18.6253 3.25082C21.1253 3.25082 23.0003 5.12582 23.0003 7.62582C23.0003 11.2383 19.0753 14.8008 13.1253 20.1883Z"
              fill="black"
            />
          </svg>

          <span>Add To Favorites</span>
        </button>
      </div>
    </div>
  );
});
