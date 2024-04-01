import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";

export const BestSellerChart = component$((prop: any) => {
  const dountChart = useSignal<HTMLDivElement>();

  useVisibleTask$(
    async () => {
      const data = prop.best;
      // create the series data
      const series = data.map((d: any) => d.total);
      const labels = data.map((d: any) => d._id);
      const getChartOptions = () => {
        return {
          series: series,
          colors: ["#1C64F2", "#16BDCA", "#FDBA8C", "#E74694", "#76694"],
          chart: {
            height: 320,
            width: "100%",
            type: "donut",
          },
          stroke: {
            colors: ["transparent"],
            lineCap: "",
          },
          plotOptions: {
            pie: {
              donut: {
                labels: {
                  show: true,
                  name: {
                    show: true,
                    fontFamily: "Inter, sans-serif",
                    offsetY: 20,
                  },
                  total: {
                    showAlways: true,
                    show: true,
                    label: "Best Seller",
                    fontFamily: "Inter, sans-serif",
                    formatter: (w: any) => {
                      const sum = w.globals.seriesTotals.reduce(
                        (a: any, b: any) => {
                          return a + b;
                        },
                        0
                      );
                      return `${sum}k`;
                    },
                  },
                  value: {
                    show: true,
                    fontFamily: "Inter, sans-serif",
                    offsetY: -20,
                    formatter: (value: any) => {
                      return value + "k";
                    },
                  },
                },
                size: "80%",
              },
            },
          },
          grid: {
            padding: {
              top: -2,
            },
          },
          labels: labels,
          dataLabels: {
            enabled: false,
          },
          legend: {
            position: "bottom",
            fontFamily: "Inter, sans-serif",
          },
          yaxis: {
            labels: {
              formatter: (value: any) => {
                return value;
              },
            },
          },
          xaxis: {
            labels: {
              formatter: (value: any) => {
                return value;
              },
            },
            axisTicks: {
              show: false,
            },
            axisBorder: {
              show: false,
            },
          },
        };
      };
      if (dountChart.value) {
        const ApexCharts = await import("apexcharts");
        const chart = new ApexCharts.default(
          dountChart.value,
          getChartOptions()
        );
        chart.render();
      }
    },
    { strategy: "document-ready" }
  );

  return (
    <div class=" w-full bg-white rounded-lg shadow  p-4 md:p-6">
      <div class="flex justify-between pb-4 mb-4 border-b border-gray-200 ">
        <div class="flex items-center">
          <div>
            <h5 class="leading-none text-2xl font-bold text-gray-900 pb-1">
              Best Seller
            </h5>
            <p class="text-sm font-normal text-gray-500 "></p>
          </div>
        </div>
        <div>
          <span class=" text-success-content text-xs font-medium inline-flex items-center px-2.5 py-1 rounded-md">
            <svg
              class="w-2.5 h-2.5 mr-1.5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 10 14"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13V1m0 0L1 5m4-4 4 4"
              />
            </svg>
            42.5%
          </span>
        </div>
      </div>

      <div ref={dountChart} class="py-6" id="donut-chart"></div>

      <div class="grid grid-cols-1 items-center border-gray-200 border-t  justify-between">
        <div class="flex justify-between items-center pt-5">
          <button
            id="dropdownDefaultButton"
            data-dropdown-toggle="lastDaysdropdown"
            data-dropdown-placement="bottom"
            class="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 text-center inline-flex items-center "
            type="button"
          >
            Last 7 days
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
    </div>
  );
});
