import type { Signal } from "@builder.io/qwik";
import { createContextId } from "@builder.io/qwik";

export const CartContext = createContextId<Signal<any>>("cart-context");