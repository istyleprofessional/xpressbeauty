import Rating from "../schemas/rating.reviews.schema";

export const getRatingByProductId = async (productId: string) => {
  try {
    const result = await Rating.findOne(
      { product_id: productId },
      { _id: 0, user_id: 0, product_id: 0 }
    );
    return { status: "success", result: result };
  } catch (err) {
    return { status: "failed", err: err };
  }
};

export const updateProductReviews = async (body: any) => {
  try {
    const result = await Rating.findOne({ product_id: body.productId });
    if (result) {
      const findUserIfExist = result.ratings.find(
        (item: any) => item.user_id === body.userId
      );
      if (findUserIfExist) {
        const index = result.ratings.findIndex(
          (item: any) => item.user_id === body.userId
        );
        const newData = {
          user_id: body.userId,
          reviewTitle: body.reviewTitle,
          reviewDescription: body.reviewDescription,
          rating: body.ratings,
          createdAt: body.createdAt,
        };
        result.ratings[index] = newData;
        await result.save();
        return { status: "success", result: result };
      } else {
        const newData = {
          user_id: body.userId,
          reviewTitle: body.reviewTitle,
          reviewDescription: body.reviewDescription,
          rating: body.ratings,
          createdAt: body.createdAt,
        };
        const result3 = await Rating.findOneAndUpdate(
          { product_id: body.productId },
          { $push: { ratings: newData } }
        );
        return { status: "success", result: result3 };
      }
    } else {
      const newData = {
        user_id: body.userId,
        reviewTitle: body.reviewTitle,
        reviewDescription: body.reviewDescription,
        rating: body.ratings,
        createdAt: body.createdAt,
      };
      const result3 = await Rating.create({
        product_id: body.productId,
        ratings: [newData],
      });
      return { status: "success", result: result3 };
    }
  } catch (err) {
    return { status: "failed", err: err };
  }
};
