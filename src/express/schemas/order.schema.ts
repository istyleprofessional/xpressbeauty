import { Schema, model } from "mongoose";

const orderSchema = new Schema(
  {
    userId: { type: String, default: null },
    products: { type: Array, default: [] },
    totalPrice: { type: Number, default: 0 },
    totalQuantity: { type: Number, default: 0 },
    paymentMethod: { type: String, default: null },
    paymentStatus: { type: String, default: null },
    shippingAddress: { type: Object, default: null },
    shippingName: { type: String, default: null },
    orderStatus: { type: String, default: null },
    paymentId: { type: String, default: null },
    order_number: { type: String, default: null },
  },
  { timestamps: true }
);

export default model("orders", orderSchema);
