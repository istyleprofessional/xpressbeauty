import { component$ } from "@builder.io/qwik";

export default component$(() => {
  return (
    <div class="flex flex-col items-center justify-center h-96">
      <h1 class="text-3xl font-bold text-error">404</h1>
      <p class="text-xl font-semibold text-error">Page not found</p>
    </div>
  );
});
