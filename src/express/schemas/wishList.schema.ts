import { Schema, model, models } from "mongoose";

const wishListSchema = new Schema(
  {
    userId: { type: String, unique: true },
    products: {
      type: Array,
    },
  },
  { timestamps: true }
);

const wishList = models.wishList || model("wishList", wishListSchema);
export default wishList;
