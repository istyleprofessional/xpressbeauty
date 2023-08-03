import type { RequestHandler } from "@builder.io/qwik-city";
import { connect } from "~/express/db.connection";
import { get_products_on_filter_service } from "~/express/services/product.service";


export const onPost: RequestHandler = async ({ parseBody, json }) => {
    await connect();
    const body: any = await parseBody();
    const request = await get_products_on_filter_service(body.filters, body.page);
    json(200, request)
}