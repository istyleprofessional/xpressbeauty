import { component$ } from "@builder.io/qwik";
import { TruckShippingIcon } from "../icons/icons";
import CanadaImage from "~/media/canada_1.jpg?jsx";
import USAImage from "~/media/USA.jpg?jsx";

export const Header = component$(() => {
  return (
    <div class="bg-black navbar flex flex-row justify-center gap-3 items-center lg:gap-40 h-12">
      <p class="text-white text-xs lg:text-base flex flex-row gap-1 font-normal">
        Fast Canada And USA Wide Shipping{" "}
        <span>
          {" "}
          <TruckShippingIcon />
        </span>
      </p>

      <a
        href="mailto:info@xpressbeauty.ca"
        class="text-white text-xs lg:text-base flex flex-row gap-3 font-normal"
      >
        info@xpressbeauty.ca
      </a>
      <div class="flex justify-end flex-1 px-2">
        <div class="flex items-stretch">
          <div class="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              class="btn btn-ghost rounded-btn text-white normal-case z-50"
            >
              Country & Currency
            </div>
            <ul class="menu dropdown-content z-50 p-2 shadow bg-base-100 rounded-box w-full mt-4">
              <li class="flex flex-row gap-1">
                <a class=" text-sm">
                  <CanadaImage class="w-12 h-12 object-contain" /> Canada (CAD){" "}
                </a>
              </li>
              <li class="flex flex-row gap-1">
                <a class=" text-sm">
                  <USAImage class="w-12 h-12 object-contain" />
                  United States of America (USD)
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
});
