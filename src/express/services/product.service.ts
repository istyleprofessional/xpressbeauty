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
      const result = await Product.find({
        isDeleted: { $ne: true },
        isHidden: { $ne: true },
      })
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
      const result = await Product.count({
        isDeleted: { $ne: true },
        isHidden: { $ne: true },
      });
      return result;
    } catch (e) {
      return { e: e };
    }
  } else {
    return { e: "not authorized" };
  }
};

export const addProductServer = async (product: any) => {
  try {
    const result = await Product.create(product);
    const newProduct = await Product.findOneAndUpdate(
      { _id: result._id },
      {
        $set: {
          perfix: `${result.perfix}-${result._id}`,
        },
      },
      {
        new: true,
      }
    );

    return newProduct;
  } catch (err) {
    return { err: err };
  }
};

export const update_product_service = async (product: any) => {
  try {
    const result = await Product.findOneAndUpdate(
      { _id: product?._id },
      product,
      { upsert: true, new: true, runValidators: true }
    );
    return result as unknown as ProductModel;
  } catch (err) {
    return { err: err };
  }
};

export const get_all_products_with_item_no = async () => {
  try {
    const result = await Product.find({
      item_no: { $ne: "" },
      $or: [
        { updateQuickBooks: { $exists: false } },
        { updateQuickBooks: true },
      ],
    }).select({
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
      { item_no: item_no, isHidden: { $ne: true } },
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
      return { status: "success", result: result };
    } catch (err) {
      return { status: "failed", err: err };
    }
  } else {
    return { status: "failed", err: "not authorized" };
  }
};

export const get_new_arrivals_products = async (filter?: string) => {
  try {
    if (filter && filter !== "") {
      const result = await Product.aggregate([
        {
          $match: {
            isHidden: { $ne: true },
            isDeleted: { $ne: true },
            categories: {
              $elemMatch: { main: { $regex: filter, $options: "i" } },
            },
            $and: [
              {
                $or: [
                  {
                    quantity_on_hand: { $gt: 0 },
                  },
                  {
                    "variations.quantity_on_hand": { $gt: 0 },
                  },
                ],
              },
            ],
          },
        },
        { $sample: { size: 5 } },
      ]);
      return result as ProductModel;
    } else {
      const query = {
        $and: [
          {
            $or: [
              {
                quantity_on_hand: { $gt: 0 },
              },
              {
                "variations.quantity_on_hand": { $gt: 0 },
              },
            ],
          },
        ],
        isHidden: { $ne: true },
        isDeleted: { $ne: true },
      };
      const result = await Product.aggregate([
        { $match: query },
        { $sample: { size: 5 } },
      ]);
      return result as ProductModel;
    }
  } catch (err) {
    return { err: err };
  }
};

export const get_product_by_name = async (name: string) => {
  try {
    const result = await Product.findOne({
      $or: [{ perfix: name }, { oldPerfix: name }],
    });
    return result;
  } catch (err) {
    return { err: err };
  }
};

export const getRelatedProducts = async (
  category: any,
  productName: string
) => {
  try {
    const query: any = {};
    if (category.length > 0) {
      query["categories"] = {
        $elemMatch: {
          name: category[0].name,
        },
      };
    }
    query["product_name"] = { $ne: productName };
    query["isHidden"] = { $ne: true };
    query["isDeleted"] = { $ne: true };
    const result = await Product.find(query).limit(10);

    return result as ProductModel;
  } catch (err) {
    return { err: err };
  }
};

export const getProductByIdForAdmin = async (id: string) => {
  try {
    const result = await Product.findOne({ _id: id });
    return result;
  } catch (err) {
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
    // get sample of 20 products from the database with condition that the product is not hidden and not deleted
    const result = await Product.aggregate([
      { $match: { isHidden: { $ne: true }, isDeleted: { $ne: true } } },
      { $sample: { size: 20 } },
    ]);
    return result;
  } catch (err) {
    return { status: "failed", err: err };
  }
};

export const get_products_data = async (
  filterByBrand: any[],
  filterByCategory: any[],
  filterPrices: any[],
  filter: string,
  page: number,
  query?: string,
  sort?: string,
  inStock?: boolean
) => {
  try {
    const perPage = 20;
    const pageNumber = page;
    const skip = pageNumber && pageNumber > 0 ? (pageNumber - 1) * 20 : 0;
    const buildQuery: any = {};

    if (filterByBrand.length > 0) {
      buildQuery["companyName.name"] = { $in: filterByBrand };
    }
    if (filterByCategory.length > 0) {
      buildQuery["categories"] = {
        $elemMatch: {
          $or: filterByCategory.map((cat) => {
            return { name: { $regex: cat, $options: "i" } };
          }),
        },
      };
    }
    // debugger;

    if (filter && filter !== "") {
      buildQuery["$or"] = [];
      buildQuery["$or"].push(
        ...[
          {
            categories: {
              $elemMatch: {
                main: { $regex: filter },
              },
            },
          },
        ]
      );
    }
    if (filterPrices.length > 0) {
      for (let i = 0; i < filterPrices.length; i++) {
        console.log(filterPrices);
        if (filterPrices[i].includes(">")) {
          if (!buildQuery["$or"]) {
            buildQuery["$or"] = [];
          }
          const vars = filterPrices[i].split(">");
          buildQuery["$or"].push({
            "price.regular": { $lte: parseFloat(vars[1]) },
          });
          buildQuery["$or"].push({
            "price.sale": { $lte: parseFloat(vars[1]) },
          });

          buildQuery["$or"].push({
            "price.max": { $lte: parseFloat(vars[1]) },
          });
          buildQuery["$or"].push({
            "price.min": { $lte: parseFloat(vars[1]) },
          });
        } else if (filterPrices[i].includes("<")) {
          const vars = filterPrices[i].split("<");
          if (!buildQuery["$or"]) {
            buildQuery["$or"] = [];
          }
          buildQuery["$or"].push({
            "price.regular": { $gte: parseFloat(vars[1]) },
          });
          buildQuery["$or"].push({
            "price.sale": { $gte: parseFloat(vars[1]) },
          });
          buildQuery["$or"].push({
            "price.max": { $gte: parseFloat(vars[1]) },
          });
          buildQuery["$or"].push({
            "price.min": { $gte: parseFloat(vars[1]) },
          });
        } else if (filterPrices[i].includes("-")) {
          const vars = filterPrices[i].split("-");
          console.log(vars);
          if (!buildQuery["$or"]) {
            buildQuery["$or"] = [];
          }
          buildQuery["$or"].push({
            "price.regular": {
              $gte: parseFloat(vars[0]),
              $lte: parseFloat(vars[1]),
            },
          });
          buildQuery["$or"].push({
            "price.max": {
              $gte: parseFloat(vars[0]),
              $lte: parseFloat(vars[1]),
            },
          });
          buildQuery["$or"].push({
            "price.min": {
              $gte: parseFloat(vars[0]),
              $lte: parseFloat(vars[1]),
            },
          });
        }
      }
    }
    const sortObj: any = {};
    if (sort && sort !== "") {
      if (sort === "ASC") {
        sortObj["product_name"] = 1;
      } else if (sort === "DESC") {
        sortObj["product_name"] = -1;
      }
    }

    if (query && query !== "") {
      buildQuery["$text"] = { $search: query };
      sortObj["score"] = { $meta: "textScore" };
      // console.log(buildQuery);
    }
    if (query && query !== "") {
      buildQuery["$text"] = { $search: query };

      // console.log(buildQuery);
    }
    buildQuery["isHidden"] = { $ne: true };
    buildQuery["isDeleted"] = { $ne: true };
    if (inStock) {
      if (!("$and" in buildQuery)) {
        buildQuery["$and"] = [];
      }
      buildQuery["$and"].push({
        $or: [
          {
            quantity_on_hand: { $gt: 0 },
          },
          {
            "variations.quantity_on_hand": { $gt: 0 },
          },
        ],
      });
    }
    const request = await Product.find(
      buildQuery,
      query && query !== ""
        ? {
            score: { $meta: "textScore" },
          }
        : {}
    )
      .sort(sortObj)
      .skip(skip)
      .limit(perPage);
    const total = await Product.count(buildQuery);
    return JSON.stringify({ status: "success", result: request, total: total });
  } catch (err) {
    console.log(err);
    return JSON.stringify({ status: "failed", err: err });
  }
};

export const update_product_quantity = async (products: any) => {
  try {
    for (const product of products) {
      // check if product id contains a dot, if it does, then it is a variant and we need to update the quantity of the variant
      if (product.id.includes(".")) {
        const mainId = product.id.split(".")[0];
        const variation_id = product.id.split(".")[1];
        await Product.findOneAndUpdate(
          {
            _id: mainId,
            variations: { $elemMatch: { variation_id: variation_id } },
          },
          { $inc: { "variations.$.quantity_on_hand": -product.quantity } }
        );
      } else {
        const resutl = await Product.findOneAndUpdate(
          { _id: product.id },
          { $inc: { quantity_on_hand: -product.quantity } }
        );
        console.log(resutl);
      }
    }
    return { status: "success" };
  } catch (err) {
    return { status: "failed", err: err };
  }
};
export const get_random_products = async (inStock?: boolean) => {
  try {
    const matchObj: any = {};
    if (inStock) {
      matchObj["$or"] = [
        {
          quantity_on_hand: { $gt: 0 },
        },
        {
          "variations.quantity_on_hand": { $gt: 0 },
        },
      ];
    }

    const result = await Product.aggregate([
      {
        $match: {
          isHidden: { $ne: true },
          isDeleted: { $ne: true },
          ...matchObj,
        },
      },
      { $sample: { size: 20 } },
      { $sort: { quantity_on_hand: -1 } },
    ]);
    const total = await Product.count({});
    return JSON.stringify({ status: "success", result: result, total: total });
  } catch (err) {
    return JSON.stringify({ status: "failed", err: err });
  }
};

export const get_products_on_filter_service = async (
  filter: any,
  page: number
) => {
  try {
    const perPage = 40;
    const pageNumber = page;
    const skip = pageNumber && pageNumber > 0 ? (pageNumber - 1) * 40 : 0;
    const query: any = {};
    if (filter.categories.length > 0) {
      query["category"] = { $in: filter.categories };
    }
    if (filter.brands.length > 0) {
      query["companyName"] = { $in: filter.brands };
    }
    query["isHidden"] = { $ne: true };
    query["isDeleted"] = { $ne: true };
    const request = await Product.find(query)
      .skip(skip)
      .limit(perPage)
      .sort({ product_name: filter.sort && filter.sort === "ASC" ? 1 : -1 });
    const total = await Product.count(query);
    return { result: request, total: total };
  } catch (err) {
    return { status: "failed", err: err };
  }
};

export const getSearchResults = async (search: string) => {
  try {
    const result = await Product.find(
      {
        $or: [
          { product_name: { $regex: search, $options: "i" } },
          { "category.main": { $regex: search, $options: "i" } },
          { "category.name": { $regex: search, $options: "i" } },
          { "companyName.name": { $regex: search, $options: "i" } },
        ],
        isHidden: { $ne: true },
        isDeleted: { $ne: true },
      },
      { product_name: 1, perfix: 1, _id: 0, imgs: 1 }
    ).limit(20);
    return result;
  } catch (err) {
    return { err: err };
  }
};

export const getProductBySearch = async (search: string, page: number) => {
  // get all products that match the search string in description or product name or the company name or the line name
  try {
    const perPage = 40;
    const pageNumber = page;
    const skip = pageNumber && pageNumber > 0 ? (pageNumber - 1) * 40 : 0;
    const result = await Product.find({
      $or: [
        { product_name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
        { lineName: { $regex: search, $options: "i" } },
        { isHidden: { $ne: true } },
        { isDeleted: { $ne: true } },
      ],
    })
      .skip(skip)
      .limit(perPage);
    const total = await Product.count({
      $or: [
        { product_name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
        { lineName: { $regex: search, $options: "i" } },
      ],
    });
    return { result: result, total: total };
  } catch (err) {
    return { err: err };
  }
};

export const getProductBySearchAdmin = async (search: string, page: number) => {
  // get all products that match the search string in description or product name or the company name or the line name
  try {
    const perPage = 20;
    const pageNumber = page;
    const skip = pageNumber && pageNumber > 0 ? (pageNumber - 1) * 20 : 0;
    const result = await Product.find({
      $or: [
        { product_name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
        { lineName: { $regex: search, $options: "i" } },
      ],
    })
      .skip(skip)
      .limit(perPage);
    const total = await Product.count({
      $or: [
        { product_name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
        { lineName: { $regex: search, $options: "i" } },
      ],
    });
    return { result: result, total: total };
  } catch (err) {
    return { err: err };
  }
};

export const updateProductRating = async (body: any) => {
  try {
    const request = await Product.findOneAndUpdate(
      { _id: body.product_id },
      { $push: { ratings: body.rating } },
      { new: true }
    );
    return { status: "success", result: request };
  } catch (err) {
    return { status: "failed", err: err };
  }
};

export const update_hair_product_service = async (product: any) => {
  try {
    if (product.priceType === "range") {
      const result = await Product.findOneAndUpdate(
        { product_name: product.product_name },
        {
          quantity_on_hand: product.quantity_on_hand,
          gtin: product.upc,
          "price.min": product.price.min,
          "price.max": product.price.max,
          priceType: product.priceType,
          variations: product.variations,
        },
        { new: true }
      );
      return { status: "success", result: result };
    } else {
      const result = await Product.findOneAndUpdate(
        { product_name: product.product_name },
        {
          quantity_on_hand: product.quantity_on_hand,
          gtin: product.upc,
          "price.regular": product.price,
          priceType: product.priceType,
          variations: product.variations,
        },
        { new: true }
      );
      return { status: "success", result: result };
    }
  } catch (err) {
    return { status: "failed", result: err };
  }
};

export const getTotalQuantityService = async (
  id: string,
  isVariant: boolean
) => {
  try {
    if (isVariant) {
      const mainId = id.split(".")[0];
      const variation_id = id.split(".")[1];
      const quantity = await Product.findOne({
        _id: mainId,
        variations: {
          $elemMatch: {
            variation_id: variation_id,
          },
        },
      }).select({ variations: 1, _id: 0 });
      const total = quantity?.variations?.reduce((acc: any, variation: any) => {
        if (variation.variation_id === variation_id) {
          return acc + parseInt(variation.quantity_on_hand);
        }
        return acc;
      }, 0);
      return { status: "success", result: total };
    } else {
      const total = await Product.findOne({ _id: id }).select({
        quantity_on_hand: 1,
        _id: 0,
      });
      return {
        status: "success",
        result: total?.quantity_on_hand,
      };
    }
  } catch (err) {
    return { status: "failed", result: err };
  }
};

export const getAllProductForDownload = async () => {
  try {
    const result = await Product.find({ isHidden: { $ne: true } }).select({
      product_name: 1,
      description: 1,
      companyName: 1,
      imgs: 1,
      price: 1,
      perfix: 1,
      quantity_on_hand: 1,
      _id: 1,
    });
    return result;
  } catch (err) {
    return { err: err };
  }
};

export const updateVisibility = async (id: string, isHidden: boolean) => {
  try {
    const result = await Product.findByIdAndUpdate(
      id,
      { isHidden: isHidden },
      { new: true }
    );
    return { status: "success", result: result };
  } catch (err) {
    return { status: "failed", err: err };
  }
};
