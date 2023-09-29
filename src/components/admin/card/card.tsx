import { component$ } from "@builder.io/qwik";

interface CardProps {
  title: string;
  icon: string;
  count: string;
}

export const Card = component$((props: CardProps) => {
  const { title, icon, count } = props;
  return (
    <div class="w-96 h-52 justify-start items-start gap-6 inline-flex">
      <div class="grow shrink basis-0 self-stretch px-6 py-4 bg-white rounded-lg shadow flex-col justify-start items-start inline-flex">
        <div class="self-stretch h-[116px] pb-4 flex-col justify-start items-start gap-4 flex">
          <div class="self-stretch justify-center items-center gap-2.5 inline-flex">
            <div class="grow shrink basis-0 text-slate-500 text-sm font-semibold font-['Inter'] leading-tight">
              {title}
            </div>
            <div class="w-fit p-2 rounded border border-slate-300 justify-center items-center gap-4 flex">
              <button
                id="dropdownDefaultButton"
                data-dropdown-toggle="lastDaysdropdown"
                data-dropdown-placement="bottom"
                class="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 text-center inline-flex items-center"
                type="button"
              >
                Last 30 days
                <svg
                  class="w-2.5 m-2.5 ml-1.5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 10 6"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m1 1 4 4 4-4"
                  />
                </svg>
              </button>
              <div
                id="lastDaysdropdown"
                class="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700"
              >
                <ul
                  class="py-2 text-sm text-gray-700 dark:text-gray-200"
                  aria-labelledby="dropdownDefaultButton"
                >
                  <li>
                    <a
                      href="#"
                      class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      Yesterday
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      Today
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      Last 7 days
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      Last 30 days
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      Last 90 days
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div class="h-[60px] justify-start items-center gap-4 inline-flex">
            <div class="p-4 bg-violet-600 rounded-lg justify-center items-center gap-2.5 flex">
              <div class="w-12 h-12 relative bg-[#7C3AED] justify-center items-center flex rounded-md">
                <div dangerouslySetInnerHTML={icon} />
              </div>
            </div>
            <div class="flex-col justify-center items-start gap-1 inline-flex w-full">
              <div class="text-slate-500 text-4xl font-normal font-['Nunito Sans'] leading-10">
                {count}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
