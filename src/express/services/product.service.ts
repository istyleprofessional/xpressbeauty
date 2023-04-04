import { verifyTokenAdmin } from "~/utils/token.utils";
import { Product } from "../schemas/product.schema";

export const get_products_service = async (token: string, page: number) => {
  const isAdmin = verifyTokenAdmin(token);
  if (isAdmin) {
    try {
      const perPage = 100;
      const pageNumber = page;
      const skip = pageNumber && pageNumber > 0 ? (pageNumber - 1) * 100 : 0;
      const result = await Product.find({}).skip(skip).limit(perPage);
      return result;
    } catch (e) {
      return { e: e };
    }
  } else {
    return { e: "not authorized" };
  }
};

export const get_products_count_service = async (token: string) => {
  const isAdmin = verifyTokenAdmin(token);
  if (isAdmin) {
    try {
      const result = await Product.count({});
      return result;
    } catch (e) {
      return { e: e };
    }
  } else {
    return { e: "not authorized" };
  }
};

export const update_product_service = async (product: any, token: string) => {
  const isAdmin = verifyTokenAdmin(token);
  if (isAdmin) {
    try {
      const result = await Product.findOneAndUpdate(
        { _id: product._id },
        product,
        { upsert: true, new: true, runValidators: true }
      );
      return result;
    } catch (err) {
      return { err: err };
    }
  } else {
    return { e: "not authorized" };
  }
};
