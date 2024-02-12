import Category from "~/express/schemas/category.schema";

export const get_all_categories = async () => {
  try {
    const categories = await Category.find({});
    return { status: "success", result: categories };
  } catch (err: any) {
    return { status: "failed", message: err.message };
  }
};

export const get_all_categories_per_page = async (page: number) => {
  try {
    const perPage = 20;
    const pageNumber = page;
    const skip = pageNumber && pageNumber > 0 ? (pageNumber - 1) * 20 : 0;
    const aggregationPipeline = [
      {
        $group: {
          _id: "$main",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 }, // Count the number of unique values
          categories: { $push: "$_id" }, // Store unique values in an array
        },
      },
      {
        $project: {
          _id: 0, // Exclude the _id field
          total: 1,
          categories: {
            $slice: ["$categories", skip, perPage], // Apply pagination to the unique values
          },
        },
      },
    ];
    const categories = await Category.aggregate(aggregationPipeline);
    return { status: "success", result: categories };
  } catch (err: any) {
    return { status: "failed", message: err.message };
  }
};

export const updateVisibility = async (id: string, isHidden: boolean) => {
  try {
    const result = await Category.findByIdAndUpdate(
      id,
      { isHidden: isHidden },
      { new: true }
    );
    return { status: "success", result: result };
  } catch (err: any) {
    return { status: "failed", message: err.message };
  }
};

export const getUniqueMainCategories = async () => {
  try {
    const categories = await Category.aggregate([
      {
        $group: {
          _id: "$main",
        },
      },
    ]);
    return { status: "success", result: categories };
  } catch (err: any) {
    return { status: "failed", message: err.message };
  }
};
