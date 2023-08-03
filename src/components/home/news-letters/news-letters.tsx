import { component$ } from "@builder.io/qwik";

export const NewsLetters = component$(() => {
  return (
    <div
      class="h-full bg-contain bg-no-repeat bg-black lg:gap-20 flex flex-col lg:flex-row justify-start items-start p-3"
      style="background-image: url(/Newsletters.webp); height: 55vw;"
    >
      <h1 class="text-base whitespace-nowrap text-center lg:text-6xl font-bold w-full text-black">
        HEY! LET’S STAY <br /> IN TOUCH
      </h1>
      <div class="flex flex-col gap-5">
        <div class="flex flex-row">
          <input
            placeholder="Enter your email"
            class="w-40 lg:w-96 h-12 border-2 border-white"
          />
          <button class="w-32 h-12 bg-white text-black font-bold">SEND</button>
        </div>
        <p class="text-sm lg:text-lg font-normal w-64 text-black">
          Sign up with your email to get updates about latest style, new deals
          and special offers.
        </p>
      </div>
    </div>
  );
});
