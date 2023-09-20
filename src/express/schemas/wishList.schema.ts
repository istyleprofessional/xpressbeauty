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

export default model("wishLists", wishListSchema);
