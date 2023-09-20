import type { Signal } from "@builder.io/qwik";
import { createContextId } from "@builder.io/qwik";

export const WishListContext = createContextId<Signal<any>>("wishList-context");
