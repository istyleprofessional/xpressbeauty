import { component$ } from "@builder.io/qwik";
import { BestSellerChart } from "~/components/admin/best-seller-chart/best-seller-chart";
import { Card } from "~/components/admin/card/card";
import { Revenues } from "~/components/admin/revenues/revenues";

export default component$(() => {
  return (
    <div class="w-full h-full flex-col justify-start items-start gap-10 inline-flex">
      <div class="w-full h-full px-6 pt-3 bg-white rounded-lg shadow flex-col justify-center items-center flex">
        <div class="self-stretch h-fit pb-4 flex-col justify-start items-start gap-4 flex">
          <div class="self-stretch justify-center items-center gap-2.5 inline-flex">
            <div class="grow shrink basis-0 text-gray-500 text-sm font-extrabold font-['Nunito Sans'] leading-tight">
              Choose Date
            </div>
            <div class="w-fit">
              <input
                type="date"
                value={new Date().toISOString().split("T")[0]}
                class="w-40 h-10 p-2 rounded-lg border-gray-200 border-2 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="flex-col justify-start items-start gap-6 flex">
        <h2 class="text-gray-500 text-2xl font-medium font-['Inter'] leading-loose">
          Orders
        </h2>
        <div class="flex flex-row gap-10">
          <Card
            icon={`
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none">
                  <path d="M13 16V6C13 5.44772 12.5523 5 12 5H4C3.44772 5 3 5.44772 3 6V16C3 16.5523 3.44772 17 4 17H5M13 16C13 16.5523 12.5523 17 12 17H9M13 16L13 8C13 7.44772 13.4477 7 14 7H16.5858C16.851 7 17.1054 7.10536 17.2929 7.29289L20.7071 10.7071C20.8946 10.8946 21 11.149 21 11.4142V16C21 16.5523 20.5523 17 20 17H19M13 16C13 16.5523 13.4477 17 14 17H15M5 17C5 18.1046 5.89543 19 7 19C8.10457 19 9 18.1046 9 17M5 17C5 15.8954 5.89543 15 7 15C8.10457 15 9 15.8954 9 17M15 17C15 18.1046 15.8954 19 17 19C18.1046 19 19 18.1046 19 17M15 17C15 15.8954 15.8954 15 17 15C18.1046 15 19 15.8954 19 17" stroke="white" stroke-width="2"/>
              </svg>
              `}
            title="Shipped Orders"
            count={"6,000"}
          />
          <Card
            icon={`
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none">
                  <path d="M12 9.00001V11M12 15H12.01M20.6179 5.98434C20.4132 5.99472 20.2072 5.99997 20 5.99997C16.9265 5.99997 14.123 4.84453 11.9999 2.94434C9.87691 4.84446 7.07339 5.99985 4 5.99985C3.79277 5.99985 3.58678 5.9946 3.38213 5.98422C3.1327 6.94783 3 7.95842 3 9.00001C3 14.5915 6.82432 19.2898 12 20.622C17.1757 19.2898 21 14.5915 21 9.00001C21 7.95847 20.8673 6.94791 20.6179 5.98434Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              `}
            title="Pending Orders"
            count={"200"}
          />
          <Card
            icon={`
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none">
                  <path d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11L4 7M12 11V21M4 7V17L12 21" stroke="white" stroke-width="2" stroke-linejoin="round"/>
                </svg>
              `}
            title="New Orders"
            count={"1,000"}
          />
        </div>
      </div>
      <div class="flex-col justify-start items-start gap-6 flex">
        <h2 class="text-gray-500 text-2xl font-medium font-['Inter'] leading-loose">
          Visited Users
        </h2>
        <div class="flex flex-row gap-10">
          <Card
            icon={`
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none">
                <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              `}
            title="Old Registered Users"
            count={"200"}
          />
          <Card
            icon={`
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none">
                  <path d="M12 4.35418C12.7329 3.52375 13.8053 3 15 3C17.2091 3 19 4.79086 19 7C19 9.20914 17.2091 11 15 11C13.8053 11 12.7329 10.4762 12 9.64582M15 21H3V20C3 16.6863 5.68629 14 9 14C12.3137 14 15 16.6863 15 20V21ZM15 21H21V20C21 16.6863 18.3137 14 15 14C13.9071 14 12.8825 14.2922 12 14.8027M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z" stroke="#F9FAFB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              `}
            title="New Registered Users"
            count={"1,000"}
          />
          <Card
            icon={`
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none">
                <path d="M17 20H22V18C22 16.3431 20.6569 15 19 15C18.0444 15 17.1931 15.4468 16.6438 16.1429M17 20H7M17 20V18C17 17.3438 16.8736 16.717 16.6438 16.1429M7 20H2V18C2 16.3431 3.34315 15 5 15C5.95561 15 6.80686 15.4468 7.35625 16.1429M7 20V18C7 17.3438 7.12642 16.717 7.35625 16.1429M7.35625 16.1429C8.0935 14.301 9.89482 13 12 13C14.1052 13 15.9065 14.301 16.6438 16.1429M15 7C15 8.65685 13.6569 10 12 10C10.3431 10 9 8.65685 9 7C9 5.34315 10.3431 4 12 4C13.6569 4 15 5.34315 15 7ZM21 10C21 11.1046 20.1046 12 19 12C17.8954 12 17 11.1046 17 10C17 8.89543 17.8954 8 19 8C20.1046 8 21 8.89543 21 10ZM7 10C7 11.1046 6.10457 12 5 12C3.89543 12 3 11.1046 3 10C3 8.89543 3.89543 8 5 8C6.10457 8 7 8.89543 7 10Z" stroke="#F9FAFB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              `}
            title="Dummy Users"
            count={"6,000"}
          />
        </div>
      </div>
      <div class="grid grid-cols-2 w-full gap-5">
        <div class="flex-col justify-start items-start gap-6 flex">
          <h2 class="text-gray-500 text-2xl font-medium font-['Inter'] leading-loose">
            Revenues
          </h2>
          <Revenues />
        </div>
        <div class="flex-col justify-start items-start gap-6 flex">
          <h2 class="text-gray-500 text-2xl font-medium font-['Inter'] leading-loose">
            Products
          </h2>
          <BestSellerChart />
        </div>
      </div>
    </div>
  );
});
