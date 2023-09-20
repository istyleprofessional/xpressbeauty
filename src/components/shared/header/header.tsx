import { component$ } from "@builder.io/qwik";
import { TruckShippingIcon } from "../icons/icons";

export const Header = component$(() => {
  return (
    <div class="bg-black flex flex-row justify-center gap-3 items-center lg:gap-40 h-12">
      <p class="text-white text-xs lg:text-base flex flex-row gap-1 font-normal">
        Fast Canada Wide Shipping{" "}
        <span>
          {" "}
          <TruckShippingIcon />
        </span>
      </p>

      <a
        href="tel:+12134014667"
        class="text-white text-xs lg:text-base flex flex-row gap-3 font-normal"
      >
        (213) 401-4667
      </a>
    </div>
  );
});
