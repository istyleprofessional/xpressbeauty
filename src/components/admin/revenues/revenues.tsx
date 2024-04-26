import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import ApexCharts from "apexcharts";

export interface RevenuesProps {
  rev: any[];
}

export const Revenues = component$((props: RevenuesProps) => {
  const { rev } = props;
  const columnChart = useSignal<HTMLDivElement>();

  useVisibleTask$(
    async ({ track }) => {
      track(() => rev.length > 0);
      if (!columnChart.value) return;
      const months = [
        rev
          .map((r) => {
            if (r._id === 1) {
              return r.total;
            } else {
              return null;
            }
          })
          .filter((r) => r !== null)
          .join(""),
        rev
          .map((r) => {
            if (r._id === 2) {
              return r.total;
            } else {
              return null;
            }
          })
          .filter((r) => r !== null)
          .join(""),
        rev
          .map((r) => {
            if (r._id === 3) {
              return r.total;
            } else {
              return null;
            }
          })
          .filter((r) => r !== null)
          .join(""),
        rev
          .map((r) => {
            if (r._id === 4) {
              return r.total;
            } else {
              return null;
            }
          })
          .filter((r) => r !== null)
          .join(""),
        rev
          .map((r) => {
            if (r._id === 5) {
              return r.total;
            } else {
              return null;
            }
          })
          .filter((r) => r !== null)
          .join(""),
        rev
          .map((r) => {
            if (r._id === 6) {
              return r.total;
            } else {
              return null;
            }
          })
          .filter((r) => r !== null)
          .join(""),
        rev
          .map((r) => {
            if (r._id === 7) {
              return r.total;
            } else {
              return null;
            }
          })
          .filter((r) => r !== null)
          .join(""),
        rev
          .map((r) => {
            if (r._id === 8) {
              return r.total;
            } else {
              return null;
            }
          })
          .filter((r) => r !== null)
          .join(""),
        rev
          .map((r) => {
            if (r._id === 9) {
              return r.total;
            } else {
              return null;
            }
          })
          .filter((r) => r !== null)
          .join(""),
        rev
          .map((r) => {
            if (r._id === 10) {
              return r.total;
            } else {
              return null;
            }
          })
          .filter((r) => r !== null)
          .join(""),
        rev
          .map((r) => {
            if (r._id === 11) {
              return r.total;
            } else {
              return null;
            }
          })
          .filter((r) => r !== null)
          .join(""),
        rev
          .map((r) => {
            if (r._id === 12) {
              return r.total;
            } else {
              return null;
            }
          })
          .filter((r) => r !== null)
          .join(""),
      ];
      // console.log(parseInt(months[9] ?? "0"));
      const options = {
        colors: ["#1A56DB", "#FDBA8C"],
        series: [
          {
            name: "Total Revenue",
            color: "#1A56DB",
            data: [
              {
                x: "Jan",
                y: parseInt(months[0] ?? 0),
              },
              {
                x: "Feb",
                y: parseInt(months[1] ?? "0"),
              },
              {
                x: "Mar",
                y: parseInt(months[2] ?? "0"),
              },
              {
                x: "Apr",
                y: parseInt(months[3] ?? "0"),
              },
              {
                x: "Mai",
                y: parseInt(months[4] ?? "0"),
              },
              {
                x: "Jun",
                y: parseInt(months[5] ?? "0"),
              },
              {
                x: "Jul",
                y: parseInt(months[6] ?? "0"),
              },
              {
                x: "Aug",
                y: parseInt(months[7] ?? "0"),
              },
              {
                x: "Sep",
                y: parseInt(months[8] ?? "0"),
              },
              {
                x: "Oct",
                y: parseInt(months[9] ?? "0"),
              },
              {
                x: "Nov",
                y: parseInt(months[10] ?? "0"),
              },
              {
                x: "Dec",
                y: parseInt(months[11] ?? "0"),
              },
            ],
          },
        ],
        chart: {
          type: "bar",
          height: "320px",
          width: "100%",
          fontFamily: "Inter, sans-serif",
          toolbar: {
            show: false,
          },
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: "70%",
            borderRadiusApplication: "end",
            // borderRadius: 8,
          },
        },
        tooltip: {
          shared: true,
          intersect: false,
          style: {
            fontFamily: "Inter, sans-serif",
          },
        },
        states: {
          hover: {
            filter: {
              type: "darken",
              value: 1,
            },
          },
        },
        stroke: {
          show: true,
          width: 0,
          colors: ["transparent"],
        },
        grid: {
          show: false,
          strokeDashArray: 4,
          padding: {
            left: 2,
            right: 2,
            top: -14,
          },
        },
        dataLabels: {
          enabled: true,
        },
        legend: {
          show: true,
        },
      };
      columnChart.value.innerHTML = "";
      // const ApexCharts = await import("apexcharts");
      if (columnChart.value && ApexCharts && rev.length > 0) {
        const chart = new ApexCharts(
          document.querySelector("#column-chart"),
          options
        );
        await chart.render();
      } else {
        console.log("no chart");
      }
    },
    { strategy: "intersection-observer" }
  );

  return (
    <div class="w-full bg-white rounded-lg shadow p-4 md:p-6">
      <div class="flex justify-between pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div>
            <h5 class="leading-none text-2xl font-bold text-gray-900 pb-1">
              {new Date().getFullYear()} Revenue
            </h5>
            <p class="text-sm font-normal text-gray-500 dark:text-gray-400"></p>
          </div>
        </div>
      </div>

      <div ref={columnChart} id="column-chart"></div>
      <div class="grid grid-cols-1 items-center border-gray-200 border-t dark:border-gray-700 justify-between">
        <div class="flex justify-between items-center pt-5">
          <button
            id="dropdownDefaultButton"
            data-dropdown-toggle="lastDaysdropdown"
            data-dropdown-placement="bottom"
            class="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 text-center inline-flex items-center dark:hover:text-white"
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
          <a
            href="/admin/admin-orders/"
            class="uppercase text-sm font-semibold inline-flex items-center rounded-lg text-blue-600 hover:text-blue-700 dark:hover:text-blue-500  hover:bg-gray-100 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700 px-3 py-2"
          >
            Sales Report
            <svg
              class="w-2.5 h-2.5 ml-1.5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 6 10"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m1 9 4-4-4-4"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
});
