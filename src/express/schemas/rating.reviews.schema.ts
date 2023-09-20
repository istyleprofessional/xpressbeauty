import { model, Schema } from "mongoose";

const ratingReviewsSchema = new Schema(
  {
    product_id: { type: String, unique: true },
    ratings: { type: Array },
    // reviews: { type: Array },
  },
  { timestamps: true }
);

export default model("ratingReviews", ratingReviewsSchema);
