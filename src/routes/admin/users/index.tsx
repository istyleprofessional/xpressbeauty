import { component$, $, useSignal } from "@builder.io/qwik";
import { routeLoader$, server$, useLocation } from "@builder.io/qwik-city";
import { OrderFilterIcon } from "~/components/shared/icons/icons";
import {
  getAllUsersForDownload,
  getUsers,
  getuserBySearchAdmin,
} from "~/express/services/user.service";
import { connect } from "~/express/db.connection";
import jwt from "jsonwebtoken";
import { User } from "~/express/schemas/users.schema";

export const useUserTableData = routeLoader$(async ({ url }) => {
  const page = url.searchParams.get("page") ?? "1";

  const users = await getUsers(parseInt(page));
  if (users.status === "success") {
    return { status: users.status, res: JSON.stringify(users) };
  } else {
    return { status: users.status };
  }
});

export const getUserServer = server$(async function (value: string) {
  await connect();
  const page = this.url.searchParams.get("page") ?? "1";
  const Users = await getuserBySearchAdmin(value, parseInt(page));
  return JSON.stringify(Users);
});

export const getAllUsersServer = server$(async function () {
  await connect();
  const users = await getAllUsersForDownload();
  return JSON.stringify(users.result);
});

export const accessServerAccount = server$(async function (email: string) {
  await connect();
  const user = await User.findOne({
    email: email,
  });
  const newToken = jwt.sign(
    { user_id: user?._id, isDummy: false },
    this.env.get("VITE_JWTSECRET") ?? ""
  );
  console.log(newToken);
  this.cookie.set("token", newToken, { path: "/" });
  return true;
});

export default component$(() => {
  const loc = useLocation();
  const users = useUserTableData();

  const userSignel = useSignal(JSON.parse(users.value?.res ?? "[]"));
  const count = useSignal(userSignel.value.count);
  const currentPageNo = loc.url.searchParams.get("page") ?? "1";
  const total = count.value ?? 0;
  const totalPages = Math.ceil(total / 20);
  const searchValue = loc.url.searchParams.get("search") ?? "";
  const isOrderDetailsOpen = useSignal<boolean>(false);
  const orderDetail = useSignal<any>({});

  const handleSearchUsers = $(async (e: any) => {
    const value = e.target.value;
    const getUsers = await getUserServer(value);
    const jsonRes = JSON.parse(getUsers);
    userSignel.value = { result: jsonRes.result };
    count.value = jsonRes.total;
    const url = new URL(window.location.href);
    url.searchParams.set("page", "1");
    url.searchParams.set("search", value);
    history.pushState({}, "", url.toString());
  });

  const handleDownloadAllUsers = $(async () => {
    const usersObj = await getAllUsersServer();
    const users = JSON.parse(usersObj);
    console.log(users);
    // format a csv file and download
    // Email	First Name	Last Name	Country	Zip	Email	Zip	Phone	Phone
    let csv = `Email,First Name,Last Name,Country,Zip,Email,Zip,Phone,Phone`;
    users.forEach((user: any) => {
      csv += `\n${user.email},${user.firstName},${user.lastName},${
        user.generalInfo?.address?.country ?? ""
      },${user.generalInfo?.address?.postalCode ?? ""},${user.email},${
        user.generalInfo?.address?.postalCode ?? ""
      },${user?.phoneNumber ?? ""},${user?.phoneNumber ?? ""}`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  });

  return (
    <div class="flex flex-col w-full h-full bg-[#F9FAFB]">
      <div class="flex flex-row gap-5 items-center">
        <h1 class="text-2xl font-bold p-2">Users</h1>
        <input
          type="text"
          class="input input-bordered w-[20rem] m-2"
          placeholder="Search For Users"
          onInput$={handleSearchUsers}
          value={searchValue}
        />
        <button class="btn btn-primary" onClick$={handleDownloadAllUsers}>
          Download Users
        </button>
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
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {userSignel?.value.result?.length > 0 &&
              userSignel?.value?.result?.map((user: any, index: number) => {
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
                    <td>
                      <button
                        class="btn btn-primary"
                        onClick$={() => {
                          isOrderDetailsOpen.value = true;
                          orderDetail.value = user;
                        }}
                      >
                        Veiw Details
                      </button>
                    </td>
                    <td>
                      <button
                        class="btn btn-primary"
                        onClick$={async () => {
                          await accessServerAccount(user.email);
                          // location.href = "/";
                        }}
                      >
                        Access User Account
                      </button>
                    </td>
                  </tr>
                );
              })}
            {userSignel?.value?.result?.length === 0 && (
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
            onClick$={() => {
              const url = new URL(window.location.href);
              url.searchParams.set(
                "page",
                (parseInt(currentPageNo) - 1).toString()
              );
              location.href = url.toString();
            }}
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
            onClick$={() => {
              const url = new URL(window.location.href);
              url.searchParams.set(
                "page",
                (parseInt(currentPageNo) + 1).toString()
              );
              location.href = url.toString();
            }}
          >
            Next
          </button>
        </div>
      </div>

      {isOrderDetailsOpen.value && (
        <div class="fixed inset-0 z-[100] bg-[#00000080] flex justify-center items-center">
          <div class="bg-[#fff] w-[80%] h-[80%] rounded-md">
            <div class="flex flex-row justify-between items-center p-2">
              <h1 class="text-xl font-bold">User Details</h1>
              <button
                class="btn btn-ghost btn-xs"
                onClick$={() => {
                  isOrderDetailsOpen.value = false;
                  orderDetail.value = {};
                }}
              >
                Close
              </button>
            </div>
            {/** Customer Details */}

            <div class="overflow-x-auto h-[80%] ">
              <table class="table table-pin-rows table-sm h-full">
                <thead class="">
                  <tr class="bg-[#F1F5F9]">
                    <th>First Name</th>
                    <td>{orderDetail.value?.firstName}</td>
                  </tr>

                  <tr class="bg-[#F1F5F9]">
                    <th>Last Name</th>
                    <td>{orderDetail.value?.lastName}</td>
                  </tr>

                  <tr class="bg-[#F1F5F9]">
                    <th>Email :</th>
                    <td>{orderDetail.value?.email}</td>
                  </tr>
                  <tr class="bg-[#F1F5F9]">
                    <th>Phone Number :</th>
                    <td>{orderDetail.value?.phoneNumber}</td>
                  </tr>
                  <tr class="bg-[#F1F5F9]">
                    <th>Address :</th>
                    <td>
                      {" "}
                      <span>
                        {orderDetail.value?.generalInfo?.address?.addressLine1}
                      </span>
                      {", "}
                      <span>
                        {orderDetail.value?.generalInfo?.address?.city}
                      </span>
                      {", "}
                      <span>
                        {orderDetail.value?.generalInfo?.address?.state}
                      </span>
                      {", "}
                      <span>
                        {orderDetail.value?.generalInfo?.address?.postalCode}
                      </span>
                      {", "}
                      <span>
                        {orderDetail.value?.generalInfo?.address?.country}
                      </span>
                    </td>
                  </tr>

                  <tr class="bg-[#F1F5F9]">
                    <th>Company Name :</th>
                    <td>
                      {orderDetail.value?.generalInfo?.company?.companyName}
                    </td>
                  </tr>
                </thead>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
