import type { Signal } from "@builder.io/qwik";
import { createContextId } from "@builder.io/qwik";

export const UserContext = createContextId<Signal<any>>("user-context");
