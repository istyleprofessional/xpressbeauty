import { component$ } from "@builder.io/qwik";

export default component$(() => {
  return (
    <div class="flex flex-col justify-center items-center h-96">
      <h1 class="text-black font-bold text-xl">Payment Success</h1>
      <p class="text-black text-xl">Thank you for your payment.</p>
    </div>
  );
});
