import { verifyTokenAdmin } from "~/utils/token.utils";
import Product from "../schemas/product.schema";
import type { ProductModel } from "~/models/product.model";

export const get_products_service = async (token: string, page: number) => {
  const isAdmin = verifyTokenAdmin(token);
  if (isAdmin) {
    try {
      const perPage = 20;
      const pageNumber = page;
      const skip = pageNumber && pageNumber > 0 ? (pageNumber - 1) * 20 : 0;
      const result = await Product.find({ isDeleted: { $ne: true } })
        .skip(skip)
        .limit(perPage);
      return result as ProductModel;
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
      console.log(result);
      return result as unknown as ProductModel;
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

export const get_new_arrivals_products = async () => {
  try {
    const result = await Product.find({
      item_no: { $ne: "" },
      isHidden: { $ne: true },
    }).limit(20);
    return result as ProductModel;
  } catch (err) {
    return { err: err };
  }
};

export const get_product_by_name = async (name: string) => {
  try {
    console.log(name);
    const result = await Product.findOne({ perfix: name });
    console.log(result);
    return result;
  } catch (err) {
    console.log(err);
    return { err: err };
  }
};

export const getRelatedProducts = async (
  category: string,
  productName: string
) => {
  try {
    const result = await Product.find({
      category: { $regex: category },
      product_name: { $ne: productName },
    }).limit(10);
    return result as ProductModel;
  } catch (err) {
    console.log(err);
    return { err: err };
  }
};

export const getProductById = async (id: string) => {
  try {
    const result = await Product.findOne(
      { _id: id },
      { regular_price: 1, product_name: 1, data_widths: 1, quantity_on_hand: 1 }
    );
    return result;
  } catch (err) {
    return { err: err };
  }
};

export const get_random_data = async () => {
  try {
    const result = await Product.aggregate([{ $sample: { size: 20 } }]);
    return result;
  } catch (err) {
    return { status: "failed", err: err };
  }
};

export const get_products_data = async (filter: string, page: number) => {
  try {
    const perPage = 100;
    const pageNumber = page;
    const skip = pageNumber && pageNumber > 0 ? (pageNumber - 1) * 100 : 0;
    if (filter === "Brands") {
      const result = await Product.find({ companyName: { $ne: "" } })
        .skip(skip)
        .limit(perPage);
      const total = await Product.count({ companyName: { $ne: "" } });
      return { result: result, total: total };
    }
    const result = await Product.find({
      category: { $regex: filter, $options: "i" },
      isHidden: { $ne: true },
    })
      .skip(skip)
      .limit(perPage);
    const total = await Product.count({
      category: { $regex: filter, $options: "i" },
      isHidden: { $ne: true },
    });
    return { result: result, total: total };
  } catch (err) {
    return { status: "failed" };
  }
};

export const get_products_on_filter_service = async (
  filter: any,
  page: number
) => {
  try {
    const perPage = 100;
    const pageNumber = page;
    const skip = pageNumber && pageNumber > 0 ? (pageNumber - 1) * 100 : 0;
    let result: any[];
    if (filter.categories.length > 0 && filter.brands.length > 0) {
      result = await Product.find({
        $and: [{ companyName: filter.brands }, { category: filter.categories }],
      })
        .skip(skip)
        .limit(perPage);
      const total = await Product.count({
        $and: [{ companyName: filter.brands }, { category: filter.categories }],
      });
      return { result: result, total: total };
    }
    if (filter.categories.length > 0 && filter.brands.length === 0) {
      result = await Product.find({ category: filter.categories })
        .skip(skip)
        .limit(perPage);
      const total = await Product.count({ category: filter.categories });
      return { result: result, total: total };
    }
    if (filter.categories.length === 0 && filter.brands.length > 0) {
      result = await Product.find({ companyName: filter.brands })
        .skip(skip)
        .limit(perPage);
      const total = await Product.count({ companyName: filter.brands });
      return { result: result, total: total };
    }
  } catch (err) {
    return { status: "failed", err: err };
  }
};

export const getSearchResults = async (search: string) => {
  try {
    const result = await Product.find({
      $or: [
        { product_name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        // Add more attributes as needed
      ],
    }).limit(20);
    return result;
  } catch (err) {
    return { err: err };
  }
};
