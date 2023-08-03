import Brands from "../schemas/brand.schema";

export const get_all_brands = async () => {
    try {
        const result = await Brands.find({});
        return { status: "success", result: result };
    } catch (err) {
        return { status: "failed", err: err };
    }
};