import { component$ } from "@builder.io/qwik";

export const RatingSummary = component$(() => {
  return (
    <div class="flex flex-col gap-4">
      <h1 class="text-black text-sm">Summary</h1>
      <div class="flex flex-col gap-8">
        <div class="flex flex-row gap-2 jusify-center items-center">
          <p class="text-black text-xs">5</p>
          <progress
            class="progress w-56 bg-[#E4E4E7]"
            value="0"
            max="100"
          ></progress>
        </div>
        <div class="flex flex-row gap-2 jusify-center items-center">
          <p class="text-black text-xs">4</p>
          <progress
            class="progress w-56 bg-[#E4E4E7]"
            value="0"
            max="100"
          ></progress>
        </div>
        <div class="flex flex-row gap-2 jusify-center items-center">
          <p class="text-black text-xs">3</p>
          <progress
            class="progress w-56 bg-[#E4E4E7]"
            value="0"
            max="100"
          ></progress>
        </div>
        <div class="flex flex-row gap-2 jusify-center items-center">
          <p class="text-black text-xs">2</p>
          <progress
            class="progress w-56 bg-[#E4E4E7]"
            value="0"
            max="100"
          ></progress>
        </div>
        <div class="flex flex-row gap-2 jusify-center items-center">
          <p class="text-black text-xs">1</p>
          <progress
            class="progress w-56 bg-[#E4E4E7]"
            value="0"
            max="100"
          ></progress>
        </div>
      </div>
    </div>
  );
});
