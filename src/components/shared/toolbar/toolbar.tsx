import type { PropFunction } from "@builder.io/qwik";
import { component$, useContext, $, useSignal } from "@builder.io/qwik";
import { FavoriteIcon, SearchIcon, ShoppingBagIcon } from "../icons/icons";
import { useNavigate } from "@builder.io/qwik-city";
import { getRequest } from "~/utils/fetch.utils";
import { CartContext } from "~/context/cart.context";

interface ToolBarProps {
  user?: any;
  handleOnCartClick: PropFunction<() => void>;
}

export const ToolBar = component$((props: ToolBarProps) => {
  const { user, handleOnCartClick } = props;
  const context: any = useContext(CartContext);
  const nav = useNavigate();
  const searchResults = useSignal<any[]>([]);

  const handleSignInInClick = $(() => {
    nav("/login");
  });

  const handleSignUpClick = $(() => {
    nav("/register");
  });

  const handleLogout = $(async () => {
    const request = await getRequest("/api/logout");
    const response = await request.json();
    if (response.status === "success") {
      location.reload();
    }
  });

  const handleSearchInput = $(async (event: any) => {
    const value = event.target.value;
    if (value.length > 2) {
      const request = await getRequest(`/api/search?query=${value}`);
      const response: any = await request.json();
      if (!response.err) {
        searchResults.value = response;
      }
    } else {
      searchResults.value = [];
    }
  });

  return (
    <div class="flex flex-row lg:gap-5 justify-center items-center p-5">
      <a href="/">
        <img src="/Logo.webp" alt="xpress beauty" class="w-52 h-full p-5" />
      </a>

      <div class="dropdown w-2/4">
        <div class="lg:flex w-full">
          <div class="relative w-8 top-3 left-8 h-6">
            <SearchIcon />
          </div>
          <input
            type="text"
            aria-label="search"
            placeholder="Search For..."
            class="input w-full input-bordered pl-14 text-black"
            onInput$={handleSearchInput}
          />
        </div>
        {searchResults.value.length > 0 && (
          <ul
            tabIndex={0}
            class="dropdown-content p-2 shadow bg-base-100 rounded-box w-full h-96 overflow-auto menu menu-horizontal grid grid-cols-1"
          >
            {searchResults.value.map((item: any, index: number) => (
              <li key={index} class="text-black flex flex-row gap-3">
                <a
                  class=" w-full"
                  href={`/product/${encodeURIComponent(
                    item.product_name?.replace(/ /g, "-") ?? ""
                  )}`}
                >
                  {item.product_name}
                </a>{" "}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div class="flex flex-row gap-1">
        <button
          class="w-20 btn"
          aria-label="shopping bag"
          onClick$={handleOnCartClick}
        >
          <ShoppingBagIcon number={context?.cart?.totalQuantity} />
        </button>
        <button class="w-20 btn" aria-label="favorites">
          <FavoriteIcon />
        </button>
      </div>
      {user?.result?.email || user?.email ? (
        <div class="dropdown dropdown-bottom">
          <label tabIndex={0} class="btn m-1">
            My Account
          </label>
          <ul
            tabIndex={0}
            class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li class="text-black">
              <a>Dashboard</a>
            </li>
            <li class="text-black">
              <button onClick$={handleLogout}>Logout</button>
            </li>
          </ul>
        </div>
      ) : (
        <div class="hidden lg:flex gap-3">
          <button
            onClick$={handleSignInInClick}
            class="btn bg-black text-white w-40 font-sans"
            aria-label="sign in"
          >
            Sign In
          </button>
          <button
            class="btn bg-white w-40 font-sans text-black"
            aria-label="sign up"
            onClick$={handleSignUpClick}
          >
            Sign Up
          </button>
        </div>
      )}
    </div>
  );
});
