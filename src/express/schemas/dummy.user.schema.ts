import { Schema, model } from "mongoose";

const dummyUsersSchema = new Schema(
  {
    browserId: { type: String, unique: true },
    generalIPInfo: { type: Object, default: {} },
    cart: { type: Object, default: null },
    wishlist: { type: Object, default: null },
    orders: { type: Object, default: null },
    generalInfo: { type: Object, default: null },
  },
  { timestamps: true }
);

export default model("dummyUsers", dummyUsersSchema);
