import { component$, useSignal, $, useOnDocument } from "@builder.io/qwik";
import CanadaImage from "~/media/canada_1.jpg?jsx";
import USAImage from "~/media/USA.jpg?jsx";
import { server$ } from "@builder.io/qwik-city";

export const changeCountry = server$(async function (country: string) {
  this.cookie.set("cur", country, {
    httpOnly: true,
    path: "/",
  });
  return true;
});

interface HeaderProps {
  countryProp?: string;
}

export const Header = component$((props: HeaderProps) => {
  const { countryProp } = props;
  const country = useSignal<string>("");

  useOnDocument(
    "DOMContentLoaded",
    $(() => {
      if (countryProp === "1") country.value = "USD";
      if (countryProp === "2") country.value = "CAD";
    })
  );

  return (
    <div class="flex flex-col">
      <div class="flex flex-col bg-gradient-to-b from-pink-200 to-yellow-200 w-full justify-center gap-3 items-center h-fit p-2">
        <div class="flex items-stretch text-xl font-semibold">
          🐣🌷 Easter Savings Are Here! 🌷🐣
        </div>
        <div class="flex flex-col gap-1 justify-center items-center">
          <h5 class="font-bold text-lg">Holiday Alert:</h5>{" "}
          <p class="font-light text-center w-2/3 p-2">
            Please be advised all shipping carriers and our warehouse will be
            closed in Canada on Friday March 29th, 2024 for Good Friday and
            throughout the weekend. As with any holiday closures, please be
            prepared for potential transit delays. All orders and emails will
            resume Monday April 1st 2024.
          </p>
        </div>
      </div>
      <div class="bg-black navbar flex flex-col lg:flex-row justify-center gap-3 items-center  h-fit lg:h-12">
        <div class="flex w-full justify-center lg:justify-end flex-1 px-2">
          <div class="flex items-stretch">
            <button
              class="btn"
              onClick$={() =>
                (document as any)?.getElementById("my_modal_1")?.showModal()
              }
            >
              {country.value ? country.value : "Country"}
            </button>
            <dialog id="my_modal_1" class="modal">
              <div class="modal-box flex flex-col gap-5">
                <h3 class="font-bold text-lg">Choose the currency!</h3>
                <button
                  class="w-full text-sm btn btn-ghost flex flex-row gap-2 items-center"
                  onClick$={async () => {
                    country.value = "CAD";
                    await changeCountry("2");
                    location.reload();
                  }}
                >
                  <CanadaImage class="w-12 h-12 md:w-12 md:h-12 object-contain" />{" "}
                  <p class="text-xs lg:text-md">Canada (CAD)</p>
                </button>
                <button
                  class=" text-sm w-full btn flex flex-row gap-2 items-center"
                  onClick$={async () => {
                    country.value = "USD";
                    await changeCountry("1");
                    location.reload();
                  }}
                >
                  <USAImage class="w-12 h-12 md:w-12 md:h-12 object-contain" />
                  <p class="text-xs lg:text-md">
                    United States of America (USD)
                  </p>
                </button>
                <div class="modal-action">
                  <form method="dialog">
                    {/* if there is a button in form, it will close the modal */}
                    <button class="btn">Close</button>
                  </form>
                </div>
              </div>
            </dialog>
          </div>
        </div>
      </div>
    </div>
  );
});
