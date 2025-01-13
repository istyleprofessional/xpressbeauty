import type { RequestHandler } from "@builder.io/qwik-city";
import { connect } from "~/express/db.connection";
import { update_product_service_api } from "~/express/services/product.service";


export const onPost: RequestHandler = async ({ json, parseBody }) => {
    // get product from body and update the product
    const product: any = await parseBody();
    if (product.variations && product.variations.length > 0) {
        for (const variant of product.variations) {
            variant.price = {
                "regular": variant.price,
            }
        }
    }
    await connect();
    const update: any = await update_product_service_api(product);
    if (!update?.err) {
        json(200, { status: "success", message: "Product updated successfully" });
    } else {
        json(200, { status: "failed", message: "Something went wrong" });
    }
};