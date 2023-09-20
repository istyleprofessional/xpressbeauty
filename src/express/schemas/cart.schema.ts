import { Schema, model } from "mongoose";

const cartSchema = new Schema(
  {
    userId: { type: String, default: null },
    products: {
      type: Array,
    },
    totalQuantity: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default model("carts", cartSchema);
