import {
  Fragment,
  component$,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";

interface RatingSummaryInterface {
  ratings: any;
}

export const RatingSummary = component$((props: RatingSummaryInterface) => {
  const { ratings } = props;
  const ratingsPercentatge = useStore<any>(
    {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    },
    { deep: true }
  );

  useVisibleTask$(
    ({ track }) => {
      track(() => ratings.value);
      ratingsPercentatge[1] = 0;
      ratingsPercentatge[2] = 0;
      ratingsPercentatge[3] = 0;
      ratingsPercentatge[4] = 0;
      ratingsPercentatge[5] = 0;
      for (let i = 0; i < ratings.value.length; i++) {
        if (
          ratings.value[i].rating.toString().split(".")[0].includes("0") ||
          ratings.value[i].rating.toString().split(".")[0].includes("1")
        ) {
          ratingsPercentatge[1] = ratingsPercentatge[1]
            ? ((ratingsPercentatge[1] + 1) / ratings.value.length) * 100
            : 1;
        }
        if (ratings.value[i].rating.toString().split(".")[0].includes("2")) {
          ratingsPercentatge[2] = ratingsPercentatge[2]
            ? ((ratingsPercentatge[2] + 1) / ratings.value.length) * 100
            : (1 / ratings.value.length) * 100;
        }
        if (ratings.value[i].rating.toString().split(".")[0].includes("3")) {
          ratingsPercentatge[3] = ratingsPercentatge[3]
            ? ((ratingsPercentatge[3] + 1) / ratings.value.length) * 100
            : (1 / ratings.value.length) * 100;
        }
        if (ratings.value[i].rating.toString().split(".")[0].includes("4")) {
          ratingsPercentatge[4] = ratingsPercentatge[4]
            ? ((ratingsPercentatge[4] + 1) / ratings.value.length) * 100
            : (1 / ratings.value.length) * 100;
        }
        if (ratings.value[i].rating.toString().split(".")[0].includes("5")) {
          ratingsPercentatge[5] = ratingsPercentatge[5]
            ? ((ratingsPercentatge[5] + 1) / ratings.value.length) * 100
            : (1 / ratings.value.length) * 100;
        }
      }
    },
    { strategy: "document-ready" }
  );

  return (
    <div class="flex flex-col gap-4">
      <h1 class="text-black text-sm">Summary</h1>
      <div class="flex flex-col gap-8">
        {Array.from(Array(5).keys())
          .sort((a, b) => b - a)
          .map((index) => (
            <div
              key={index}
              class="flex flex-row gap-2 jusify-center items-center"
            >
              <p class="text-black text-xs">{index + 1}</p>
              <progress
                class="progress w-56 bg-[#E4E4E7]"
                value={
                  ratingsPercentatge[index + 1]
                    ? ratingsPercentatge[index + 1].toString()
                    : "0"
                }
                max="100"
              ></progress>
            </div>
          ))}
      </div>
      {ratings.value.length > 0 && (
        <div class="card shadow-md w-full h-fit md:p-5">
          <div class="card-body">
            {ratings.value.map((rating: any, index: number) => (
              <Fragment key={index}>
                <div
                  itemProp="review"
                  itemScope
                  itemType="https://schema.org/Review"
                >
                  <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div class="flex flex-col gap-5 justify-center items-start">
                      <div class="rating rating-xs md:rating-md rating-half">
                        <input
                          type="radio"
                          name="rating-10"
                          class="rating-hidden"
                        />
                        {Array(5)
                          .fill("")
                          .map((_, index) => (
                            <Fragment key={index}>
                              <input
                                id={`${index + 0.5}`}
                                type="radio"
                                name="rating-10"
                                class={`bg-green-500 mask mask-star-2 mask-half-1 bg-[#FFC75B]`}
                                checked={
                                  index + 0.5 <= rating.rating ? true : false
                                }
                                disabled
                              />
                              <input
                                id={`${index + 1}`}
                                type="radio"
                                name="rating-10"
                                class={`bg-green-500 mask mask-star-2 mask-half-2 bg-[#FFC75B]`}
                                checked={
                                  index + 1 <= rating.rating ? true : false
                                }
                                disabled
                              />
                            </Fragment>
                          ))}
                      </div>
                      <p class="text-xs md:text-base" itemProp="datePublished">
                        {new Date(rating.createdAt).toLocaleString("en-US", {
                          timeZone: "America/New_York",
                        })}
                      </p>
                    </div>
                    <div
                      itemProp="reviewRating"
                      itemScope
                      itemType="https://schema.org/Rating"
                      class="hidden"
                    >
                      <meta itemProp="worstRating" content="1" />
                      <span itemProp="ratingValue">{rating.rating}</span>/
                      <span itemProp="bestRating">5</span>stars
                    </div>
                    <div class="flex flex-col gap-3 lg:col-span-3 w-full ">
                      <h3 class="text-black font-bold text-md break-words">
                        {rating.reviewTitle}
                      </h3>
                      <p
                        class="text-black text-sm break-words"
                        itemProp="reviewBody"
                      >
                        {rating.reviewDescription}
                      </p>
                    </div>
                  </div>
                </div>
                <div class="divider"></div>
              </Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
