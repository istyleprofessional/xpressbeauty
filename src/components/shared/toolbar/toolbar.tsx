import type { PropFunction } from "@builder.io/qwik";
import {
  component$,
  useContext,
  $,
  useSignal,
  useVisibleTask$,
  Fragment,
} from "@builder.io/qwik";
import { SearchIcon } from "../icons/icons";
import { getRequest } from "~/utils/fetch.utils";
import { CartContext } from "~/context/cart.context";
import type { ProductModel } from "~/models/product.model";
import { uuid } from "~/utils/uuid";
import { server$, useLocation } from "@builder.io/qwik-city";
import { UserContext } from "~/context/user.context";
import { WishListContext } from "~/context/wishList.context";

interface ToolBarProps {
  user?: any;
  handleOnCartClick: PropFunction<() => void>;
}

export const clearUser = server$(async function () {
  this.cookie.delete("token");
  this.cookie.delete("token");
  return true;
});

export const ToolBar = component$((props: ToolBarProps) => {
  const { handleOnCartClick } = props;
  const isSearchOpen = useSignal<boolean>(false);
  const context: any = useContext(CartContext);
  const userContext: any = useContext(UserContext);
  const searchResults = useSignal<any[]>([]);
  const quantity = useSignal<string>("0");
  const totalPrice = useSignal<string>("0");
  const loc = useLocation();
  const wishList = useContext(WishListContext);
  const user = useSignal<any>(userContext.user);

  useVisibleTask$(({ track }) => {
    track(() => context?.cart?.totalQuantity);
    quantity.value = context?.cart?.totalQuantity;
    totalPrice.value = parseFloat(context?.cart?.totalPrice ?? "0").toFixed(2);
  });

  const handleLogout = $(async () => {
    await clearUser();
    user.value = null;
    location.href = "/";
  });

  const handleSearchInput = $(async (event: any) => {
    if (event.key === "Enter") {
      const searchValue = event.target.value;
      if (searchValue.length > 2) {
        loc.url.pathname = `/products/search/${searchValue}`;
        location.href = loc.url.toString();
      }
    }
    const value = event.target.value;
    if (value.length > 2) {
      const request: any = await getRequest(`/api/search?query=${value}`);
      const response: any = await request.json();
      if (!response.err) {
        searchResults.value = response;
      }
    } else {
      searchResults.value = [];
    }
  });

  return (
    <div class="navbar bg-base-100">
      <div class="flex-1">
        <a class="h-fit w-fit" href="/">
          <img
            alt="xpress beauty"
            class="object-contain"
            src="/logoX2.jpg"
            width="130"
            height="90"
          />
        </a>
      </div>
      <div class="flex-none gap-0 md:gap-5 w-fit">
        <div class="dropdown dropdown-end flex flex-row justify-center items-center">
          <label
            tabIndex={0}
            class="btn btn-ghost btn-circle"
            onClick$={() => {
              isSearchOpen.value = !isSearchOpen.value;
            }}
          >
            <SearchIcon />
          </label>
          {isSearchOpen.value && (
            <div class="flex flex-col">
              <form
                itemProp="potentialAction"
                itemScope
                itemType="https://schema.org/SearchAction"
              >
                <meta
                  itemProp="target"
                  content="https://xpressbeauty.ca/search/{search_term_string}/"
                />
                <input
                  class="input input-ghost w-52 md:w-full h-fit border-black border-5"
                  itemProp="query-input"
                  onInput$={handleSearchInput}
                  onKeyUp$={handleSearchInput}
                />
              </form>
              <>
                {searchResults.value.length > 0 && (
                  <ul
                    tabIndex={0}
                    class="z-[50] mt-12 left-4 card card-compact dropdown-content h-96 overflow-y-auto w-fit bg-base-100 shadow"
                  >
                    <div class="card-body w-96">
                      {searchResults.value.map(
                        (item: ProductModel, index: number) => (
                          <Fragment key={uuid()}>
                            <li key={index} class="text-black h-fit w-full ">
                              <a
                                class="w-full flex flex-row md:w-full md:grid grid-cols-3 gap-3 items-center md:h-full"
                                href={`/products/${item.perfix ?? ""}`}
                              >
                                <span class="w-full break-all text-sm md:col-span-2">
                                  {item.product_name}
                                </span>

                                <img
                                  src={
                                    (item as any).imgs[0] ?? "/placeholder.webp"
                                  }
                                  alt={item.product_name}
                                  class="w-20 h-20 md:w-52 md:h-52 object-contain"
                                />
                              </a>{" "}
                            </li>
                            <div class="divider"></div>
                          </Fragment>
                        )
                      )}
                    </div>
                  </ul>
                )}
              </>
            </div>
          )}
        </div>

        <div class="dropdown dropdown-end">
          <label tabIndex={0} class="btn btn-ghost btn-circle">
            <div class="indicator">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 md:h-7 md:w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span class="badge badge-sm indicator-item">
                {!quantity.value ? 0 : quantity.value}
              </span>
            </div>
          </label>
          <div
            tabIndex={0}
            class="mt-3 z-50 card card-compact dropdown-content w-52 bg-base-100 shadow"
          >
            <div class="card-body">
              <span class="font-bold text-lg">{quantity.value} Items</span>
              <span class="text-info">
                Subtotal: CA$ {totalPrice.value ? totalPrice.value : 0}
              </span>
              <div class="card-actions">
                <button
                  class="btn btn-primary btn-block"
                  onClick$={handleOnCartClick}
                >
                  View cart
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="dropdown dropdown-end">
          <label tabIndex={0} class="btn btn-ghost btn-circle">
            <div class="indicator">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="h-5 w-5 md:h-7 md:w-7"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>

              <span class="badge badge-sm indicator-item">
                {(wishList as any)?.wishList?.data?.length ?? 0}
              </span>
            </div>
          </label>
          <div
            tabIndex={0}
            class="mt-3 z-[1] card card-compact dropdown-content w-52 bg-base-100 shadow"
          >
            <div class="card-body">
              <span class="font-bold text-lg">
                {(wishList as any)?.wishList?.data?.length ?? 0} Items
              </span>
              <div class="card-actions">
                <a href="/wishlist" class="btn btn-primary btn-block">
                  View wishlist
                </a>
              </div>
            </div>
          </div>
        </div>
        <div class="dropdown dropdown-end">
          <label tabIndex={0} class="btn btn-ghost btn-circle">
            <div class="w-10 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 12 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="h-5 w-5 md:h-7 md:w-7"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </div>
          </label>
          <ul
            tabIndex={0}
            class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 hidden md:block"
          >
            {user.value?.email ? (
              <>
                <li>
                  <a class="justify-between" href="/profile">
                    Profile
                  </a>
                </li>
                <li>
                  <button onClick$={handleLogout}>Logout</button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <a href="/login">Login</a>
                </li>
                <li>
                  <a href="/register">Register</a>
                </li>
              </>
            )}
          </ul>
          <ul
            tabIndex={0}
            class="menu menu-sm dropdown-content mt-3 z-50 p-2 shadow bg-base-100 rounded-box w-52 block md:hidden"
          >
            {user.value ? (
              <>
                <li>
                  <a class="lg:text-lg" href="/" aria-label="home">
                    Home
                  </a>
                </li>
                <li>
                  <a
                    class="lg:text-lg"
                    href="/products/filter/Hair"
                    aria-label="Hair"
                  >
                    Hair
                  </a>
                </li>
                <li>
                  <a
                    class="lg:text-lg"
                    href="/products/filter/Tools"
                    aria-label="Tools"
                  >
                    Tools
                  </a>
                </li>
                <li>
                  <a
                    class="lg:text-lg"
                    href="/products/filter/Brands"
                    aria-label="Brands"
                  >
                    Brands
                  </a>
                </li>
                <li>
                  <a class="justify-between" href="/profile">
                    Profile
                  </a>
                </li>
                <li>
                  <button onClick$={handleLogout}>Logout</button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <a class="lg:text-lg" href="/" aria-label="home">
                    Home
                  </a>
                </li>
                <li>
                  <a
                    class="lg:text-lg"
                    href="/products/filter/Hair"
                    aria-label="Hair"
                  >
                    Hair
                  </a>
                </li>
                <li>
                  <a
                    class="lg:text-lg"
                    href="/products/filter/Tools"
                    aria-label="Tools"
                  >
                    Tools
                  </a>
                </li>
                <li>
                  <a
                    class="lg:text-lg"
                    href="/products/filter/Brands"
                    aria-label="Brands"
                  >
                    Brands
                  </a>
                </li>
                <li>
                  <a href="/login">Login</a>
                </li>
                <li>
                  <a href="/register">Register</a>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
});
