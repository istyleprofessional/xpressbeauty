import { verifyTokenAdmin } from "~/utils/token.utils";
import { Product } from "../schemas/product.schema";

export const get_products_service = async (token: string, page: number) => {
  const isAdmin = verifyTokenAdmin(token);
  if (isAdmin) {
    try {
      const perPage = 100;
      const pageNumber = page;
      const skip = pageNumber && pageNumber > 0 ? (pageNumber - 1) * 100 : 0;
      const result = await Product.find({ isDeleted: { $ne: true } })
        .skip(skip)
        .limit(perPage);
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

export const get_all_products_with_item_no = async () => {
  try {
    const result = await Product.find({ item_no: { $ne: "" } }).select({
      item_no: 1,
      _id: 0,
    });
    const products: any[] = result;
    return products;
  } catch (err) {
    return { err: err };
  }
};

export const update_on_hand_quantity = async (
  item_no: string,
  quantity: string,
  manufacturerPartNumber: string,
  barCodeValue: string
) => {
  try {
    const result = await Product.findOneAndUpdate(
      { item_no: item_no },
      {
        quantity_on_hand: quantity,
        manufacturer_part_number: manufacturerPartNumber,
        bar_code_value: barCodeValue,
      }
    );

    return result;
  } catch (err) {
    return { err: err };
  }
};

export const delete_item_service = async (product: any, token: string) => {
  const isAdmin = verifyTokenAdmin(token);
  if (isAdmin) {
    try {
      const result = await Product.findOneAndUpdate(
        { _id: product._id },
        { isDeleted: !product.isDeleted }
      );
      return result;
    } catch (err) {
      return { err: err };
    }
  } else {
    return { e: "not authorized" };
  }
};

export const hide_product_service = async (product: any, token: string) => {
  const isAdmin = verifyTokenAdmin(token);
  if (isAdmin) {
    try {
      const result = await Product.findOneAndUpdate(
        { _id: product._id },
        { isHidden: !product.isHidden },
        { new: true }
      );
      return result;
    } catch (err) {
      return { err: err };
    }
  } else {
    return { e: "not authorized" };
  }
};
