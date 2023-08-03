import { component$ } from "@builder.io/qwik";
import { PhoneIcon, TruckShippingIcon } from "../icons/icons";

export const Header = component$(() => {
  return (
    <div class="bg-black flex flex-row justify-center items-center lg:gap-40 h-12">
      <p class="text-white text-sm lg:text-base flex flex-row gap-3 font-normal">
        First Canada Wide Shipping{" "}
        <span>
          {" "}
          <TruckShippingIcon />
        </span>
      </p>
      <p class="text-white text-sm lg:text-base flex flex-row gap-3 font-normal">
        <span>
          <PhoneIcon />
        </span>
        905 455 5051
      </p>
    </div>
  );
});
