import type { RequestHandler } from "@builder.io/qwik-city";

export const onGet: RequestHandler = async ({ json, query }) => {
    // this is google callback route
    const code = query.get("code");
    const state = query.get("state");
    console.log("code", code);
    console.log("state", state);
    json(200, { code, state });
    return;

}
