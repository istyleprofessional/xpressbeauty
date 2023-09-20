import Category from "~/express/schemas/category.schema";

export const get_all_categories = async () => {
  try {
    const categories = await Category.find({});
    return { status: "success", result: categories };
  } catch (err: any) {
    return { status: "failed", message: err.message };
  }
};
