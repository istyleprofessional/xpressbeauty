import { component$ } from "@builder.io/qwik";

export const Rating = component$(() => {
  return (
    <div class="rating rating-md">
      <input
        type="radio"
        name="rating-7"
        class="mask mask-star-2 bg-[#FFC75B]"
      />
      <input
        type="radio"
        name="rating-7"
        class="mask mask-star-2 bg-[#FFC75B]"
        checked
      />
      <input
        type="radio"
        name="rating-7"
        class="mask mask-star-2 bg-[#FFC75B]"
      />
      <input
        type="radio"
        name="rating-7"
        class="mask mask-star-2 bg-[#FFC75B]"
      />
      <input
        type="radio"
        name="rating-7"
        class="mask mask-star-2 bg-[#FFC75B]"
      />
    </div>
  );
});
