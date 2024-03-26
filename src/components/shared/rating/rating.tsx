import { component$, useSignal, Fragment, useTask$ } from "@builder.io/qwik";

interface RatingInterface {
  ratings?: any[];
}

export const Rating = component$((props: RatingInterface) => {
  const { ratings } = props;
  const averageRating = useSignal<number>(0);
  const totalRatings = useSignal<number>(0);

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
    <div class="flex flex-row gap-2 items-center">
      <div class="rating rating-lg rating-half">
        {/* <input type="radio" name="rating-10" class="rating-hidden" /> */}

        {Array(5)
          .fill("")
          .map((_, index) => (
            <Fragment key={index}>
              <input
                key={index + 0.5}
                type="radio"
                aria-label="Rate 0.5 stars"
                name="rating-10"
                class={`bg-[#FFC75B] mask mask-star-2 mask-half-1 `}
                checked={index + 0.5 === averageRating.value ? true : false}
                disabled={true}
              />
              <input
                key={index + 1}
                type="radio"
                name="rating-10"
                aria-label="Rate 1 stars"
                class={`bg-[#FFC75B] mask mask-star-2 mask-half-2 `}
                checked={index + 1 === averageRating.value ? true : false}
                disabled={true}
              />
            </Fragment>
          ))}
      </div>
      {(ratings?.length ?? 0) > 0 && (
        <div
          itemProp="aggregateRating"
          itemScope
          itemType="https://schema.org/AggregateRating"
          class="text-sm font-semibold text-gray-400"
        >
          <meta itemProp="worstRating" content="0" />
          <meta itemProp="bestRating" content="5" />
          <meta
            itemProp="ratingValue"
            content={averageRating.value ? averageRating.value.toString() : "0"}
          />
          <meta
            itemProp="reviewCount"
            content={totalRatings.value ? totalRatings.value.toString() : "0"}
          />
          Rated <span>{averageRating.value ? averageRating.value : 0}</span>
          /5 based on <span>{totalRatings.value}</span> customer reviews
        </div>
      )}
    </div>
  );
});
