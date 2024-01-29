import { Schema, model } from "mongoose";

const wishListSchema = new Schema(
  {
    userId: { type: String, unique: true },
    products: {
      type: Array,
    },
  },
  { timestamps: true }
);

const wishList = model("wishList", wishListSchema);
export default wishList;
