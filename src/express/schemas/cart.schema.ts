import { Schema, model, models } from "mongoose";

const cartSchema = new Schema(
  {
    userId: { type: String, default: null },
    products: {
      type: Array,
    },
    totalQuantity: { type: Number, default: 0 },
    currency: { type: String, default: null },
  },
  { timestamps: true }
);

export const cart = models.carts || model("carts", cartSchema);
