import wishListSchema from "../schemas/wishList.schema";

export const addToWishList = async (data: any) => {
  try {
    console.log(data.product._id.toString());
    let request = await wishListSchema.findOne({ userId: data.userId });
    if (request) {
      const check = request.products.some(
        (obj) => obj._id.toString() === data.product._id.toString()
      );
      if (check) {
        return { status: "failed", data: "Already in your wish list" };
      }
      request.products.push(data.product);
      await request.save();
    } else {
      request = await wishListSchema.create({
        userId: data.userId,
        products: [data.product],
      });
    }
    return { status: "success", data: request };
  } catch (error) {
    return { status: "failed", data: error };
  }
};

export const getWishList = async (userId: string) => {
  try {
    const request = await wishListSchema.findOne({ userId });
    if (request) {
      return { status: "success", data: request.products };
    }
    return { status: "success", data: [] };
  } catch (error) {
    return { status: "failed", data: error };
  }
};
