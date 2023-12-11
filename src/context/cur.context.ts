import type { Signal } from "@builder.io/qwik";
import { createContextId } from "@builder.io/qwik";

export const CurContext = createContextId<Signal<any>>("cur-context");
