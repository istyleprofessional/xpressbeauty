import { Schema, model } from "mongoose";

const reviewSchema = new Schema(
  {
    browserId: { type: String, unique: true },
    userId: { type: String, default: null },
    productId: { type: String, default: null },
    review: { type: Object, default: null },
  },
  { timestamps: true }
);

export default model("reviews", reviewSchema);