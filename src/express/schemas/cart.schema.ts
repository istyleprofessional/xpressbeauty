import { Schema, model } from "mongoose";

const cartSchema = new Schema(
  {
    browserId: { type: String, unique: true },
    userId: { type: String, default: null },
    products: {
      type: Array,
    },
  },
  { timestamps: true }
);

export default model("carts", cartSchema);
