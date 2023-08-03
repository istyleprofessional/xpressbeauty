import type { RequestHandler } from "@builder.io/qwik-city";
import { connect } from "~/express/db.connection";
import { get_products_data } from "~/express/services/product.service";


export const onPost: RequestHandler = async ({ parseBody, json }) => {
    await connect();
    const body: any = await parseBody();
    const request = await get_products_data(body.filters, body.page);
    json(200, request)
}