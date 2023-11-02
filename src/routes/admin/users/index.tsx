import { component$ } from "@builder.io/qwik";
import { routeLoader$, useLocation } from "@builder.io/qwik-city";
import { OrderFilterIcon } from "~/components/shared/icons/icons";
import { getUsers } from "~/express/services/user.service";

export const useUserTableData = routeLoader$(async ({ url }) => {
  const page = url.searchParams.get("page") ?? "1";
  const users = await getUsers(parseInt(page));
  if (users.status === "success") {
    return { status: users.status, res: JSON.stringify(users) };
  } else {
    return { status: users.status };
  }
});

export default component$(() => {
  const loc = useLocation();
  const users = useUserTableData();
  let usersData: any;
  if (users.value?.status === "success") {
    usersData = JSON.parse(users.value?.res ?? "[]");
  }
  const currentPageNo = loc.url.searchParams.get("page") ?? "1";
  const total = usersData?.count ?? 0;
  const totalPages = Math.ceil(total / 20);
  const searchValue = loc.url.searchParams.get("search") ?? "";

  return (
    <div class="flex flex-col w-full h-full bg-[#F9FAFB]">
      <div class="flex flex-row gap-5 items-center">
        <h1 class="text-2xl font-bold p-2">Users</h1>
        <input
          type="text"
          class="input input-bordered w-[20rem] m-2"
          placeholder="Search For Users"
          value={searchValue}
        />
      </div>

      <div class="overflow-x-auto h-[80vh] bg-[#FFF]">
        <table class="table table-pin-rows table-sm h-full">
          <thead>
            <tr>
              {" "}
              <th>
                <label>
                  <input type="checkbox" class="checkbox" />
                </label>
              </th>
              <th align="right" colSpan={7}>
                <button class="flex flex-row gap-2 items-center btn btn-ghost">
                  <OrderFilterIcon />
                </button>
              </th>
            </tr>
            <tr class="bg-[#F1F5F9]">
              <th></th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Create Date</th>
              <th>Email Verified</th>
              <th>Phone Verified</th>
            </tr>
          </thead>
          <tbody>
            {usersData?.result?.length > 0 &&
              usersData?.result?.map((user: any, index: number) => {
                const date = new Date(user.createdAt);
                return (
                  <tr key={index}>
                    <th>
                      <label>
                        <input type="checkbox" class="checkbox" />
                      </label>
                    </th>
                    <td>
                      {user?.firstName} {user?.lastName}
                    </td>
                    <td>{user?.email}</td>
                    <td>{user?.phoneNumber}</td>
                    <td>
                      {date.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td>{user?.isEmailVerified ? "Yes" : "No"}</td>
                    <td>{user?.isPhoneVerified ? "Yes" : "No"}</td>
                  </tr>
                );
              })}
            {usersData?.request?.length === 0 && (
              <tr>
                <td colSpan={8} class="text-center">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div class="bg-[#fff]">
        <div class="flex flex-row justify-between gap-2 p-2">
          <button
            class={`btn btn-ghost btn-sm ${
              currentPageNo === "1" ? "text-[#D1D5DB]" : "text-[#7C3AED]"
            } text-xs`}
            disabled={currentPageNo === "1"}
          >
            Previous
          </button>
          <p class="text-xs">
            {currentPageNo} of {totalPages}
          </p>
          <button
            class={`btn btn-ghost btn-sm text-xs ${
              currentPageNo === totalPages.toString()
                ? "text-[#D1D5DB]"
                : "text-[#7C3AED]"
            }`}
            disabled={currentPageNo === totalPages.toString()}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
});
