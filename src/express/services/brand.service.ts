import Brands from "../schemas/brand.schema";

export const get_all_brands = async () => {
  try {
    const result = await Brands.find({ isHidden: { $ne: true } }).sort({
      name: 1,
    });
    return { status: "success", result: result };
  } catch (err) {
    return { status: "failed", err: err };
  }
};

export const get_brands_per_page = async (page: number, value?: string) => {
  try {
    const perPage = 20;
    const pageNumber = page;
    const skip = pageNumber && pageNumber > 0 ? (pageNumber - 1) * 20 : 0;
    if (value) {
      const result = await Brands.find({
        name: { $regex: value, $options: "i" },
      })
        .sort({ name: 1 })
        .skip(skip)
        .limit(perPage);
      const total = await Brands.count({
        name: { $regex: value, $options: "i" },
      });
      return { status: "success", result: result, total: total };
    }
    const result = await Brands.find({})
      .collation({ locale: "en", strength: 2 })
      .sort({ name: 1 })
      .skip(skip)
      .limit(perPage);
    const total = await Brands.count({});
    return { status: "success", result: result, total: total };
  } catch (err) {
    return { status: "failed", err: err };
  }
};

export const addBrandService = async (data: any) => {
  try {
    const result = await Brands.create({ name: data });
    return { status: "success", result: result };
  } catch (err) {
    return { status: "failed", err: err };
  }
};

export const updateVisibility = async (id: string, isHidden: boolean) => {
  try {
    const result = await Brands.findByIdAndUpdate(
      id,
      { isHidden: isHidden },
      { new: true }
    );
    return { status: "success", result: result };
  } catch (err) {
    return { status: "failed", err: err };
  }
};

export const getBrandById = async (id: string) => {
  try {
    const result = await Brands.findById(id);
    return { status: "success", result: result };
  } catch (err) {
    return { status: "failed", err: err };
  }
};

export const updateBrandsById = async (data: any) => {
  try {
    const result = await Brands.findOneAndUpdate(
      { _id: data.id },
      { name: data.name },
      { new: true }
    );
    return { status: "success", result: result };
  } catch (err) {
    return { status: "failed", err: err };
  }
};
