import type { Signal } from "@builder.io/qwik";
import { createContextId } from "@builder.io/qwik";

export const ProductsPageContext = createContextId<Signal<any>>("products-page-context");