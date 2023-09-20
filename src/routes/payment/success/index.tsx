import { component$ } from "@builder.io/qwik";
import { Steps } from "~/components/shared/steps/steps";

export default component$(() => {
  return (
    <div class="flex flex-col justify-center items-center gap-10 mb-10">
      <Steps pageType="confirmation" />

      <div class="bg-[url('/Vector.svg')]">
        <svg
          width="263"
          height="264"
          viewBox="0 0 263 264"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M131.5 0.75L160.875 23.25L197.125 18.25L210.875 52.625L245.25 66.375L240.25 102.625L262.75 132L240.25 161.375L245.25 197.625L210.875 211.375L197.125 245.75L160.875 240.75L131.5 263.25L102.125 240.75L65.875 245.75L52.125 211.375L17.75 197.625L22.75 161.375L0.25 132L22.75 102.625L17.75 66.375L52.125 52.625L65.875 18.25L102.125 23.25L131.5 0.75Z"
            fill="#18181B"
          />
          <path
            d="M197.75 73.25L112.75 158.25L77.75 123.25L60.25 140.75L112.75 193.25L215.25 90.75L197.75 73.25Z"
            fill="#FAFAFA"
          />
        </svg>
      </div>

      <h1 class="text-3xl font-semibold text-center">
        Thank you for your order!
      </h1>
      <p class="text-sm font-light text-center">
        Your order has been placed and will be processed shortly.
      </p>
    </div>
  );
});
