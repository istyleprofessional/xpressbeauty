import { $, component$, useSignal } from "@builder.io/qwik";
import { RatingSummary } from "../rating-summary/rating-summary";

interface RatingAndDescriptionProps {
  product_description: string;
}

export const RatingAndDescription = component$(
  (props: RatingAndDescriptionProps) => {
    const { product_description } = props;
    const isDescriptionActive = useSignal<boolean>(true);

    const handleDescription = $(() => {
      isDescriptionActive.value = true;
    });

    const handleRatingAndReviews = $(() => {
      isDescriptionActive.value = false;
    });

    return (
      <div class="flex flex-col gap-8 pl-14">
        <div class="bg-[#F4F4F5] w-[32rem] h-20 justify-center flex items-center rounded-lg">
          <div class="btn-group">
            <button
              class={`btn ${
                isDescriptionActive.value ? "btn-active" : ""
              } w-60 text-base`}
              onClick$={handleDescription}
            >
              Product Description
            </button>
            <button
              class={`btn ${
                !isDescriptionActive.value ? "btn-active" : ""
              } w-60 text-base font-inter`}
              onClick$={handleRatingAndReviews}
            >
              Ratings and Reviews
            </button>
          </div>
        </div>
        <div class="w-3/4">
          {isDescriptionActive.value ? (
            <div
              class="text-black font-normal text-lg"
              dangerouslySetInnerHTML={product_description.replace(
                /<img .*?>/g,
                "<text>"
              )}
            ></div>
          ) : (
            <div class="flex flex-col gap-10">
              <div class="flex flex-col gap-4">
                <h2 class="text-black font-bold text-3xl">Ratings & Reviews</h2>
                <p class="text-[#BF0A30] text-sm">Write a review</p>
              </div>
              <RatingSummary />
            </div>
          )}
        </div>
      </div>
    );
  }
);
