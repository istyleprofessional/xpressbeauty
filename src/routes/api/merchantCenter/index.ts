import { google } from 'googleapis';
import productSchema from '~/express/schemas/product.schema';
import type { RequestHandler } from '@builder.io/qwik-city';

export const onPost: RequestHandler = async ({ json }) => {
    const dbProducts = await productSchema.find({
        isHidden: { $ne: true },
    });
    const oauth2Client = new google.auth.OAuth2();

    const token = {}; // Use persistent storage for token
    if (Object.keys(token).length === 0) {
        const clientId = import.meta.env.PUBLIC_GOOLGE_CLIENT_ID;
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            client_id: clientId,
            scope: ['https://www.googleapis.com/auth/content'],
            redirect_uri: import.meta.env.PUBLIC_GOOGLE_REDIRECT_URI
        });
        json(200, { redirect: authUrl });
        return;
    }


    oauth2Client.setCredentials(token);

    const content = google.content({ version: 'v2.1', auth: oauth2Client });

    const merchantId = '5086882223'; // Your Merchant ID

    for (const product of dbProducts) {

        const productData = {
            // The product data goes here
            id: product._id.toString(),
            title: product?.product_name ?? "",
            description: product?.description ?? "",
            link: `https://xpressbeauty.ca/products/${product.perfix}`,
            "image link": product?.
                imgs[0].includes("http") ?
                product?.imgs[0] :
                `https://xpressbeauty.ca${product?.imgs[0].replace(".", "")}`,
            availability: parseInt(product?.quantity_on_hand?.toString() ?? "0") > 0 ?
                "in_stock" :
                "out_of_stock",
            price: {
                value: product?.price?.regular ?? "0",
                currency: 'CAD'
            },
            brand: product?.companyName?.name ?? "Qwik City",
            condition: "new",
            gtin: product.gtin ?? "",
            "identifier exists": product.gtin ? "yes" : "no",

        };
        try {
            const res = await content.products.insert({
                merchantId: merchantId,
                requestBody: productData,
                feedId: '10443750995',
            });
            json(200, { success: true, data: res.data });
            return
        } catch (err: any) {
            console.error(err);
            json(200, { success: false, error: err });
            return
        }
    }
};