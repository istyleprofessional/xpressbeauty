import { Schema, model } from "mongoose";

const brandSchema = new Schema(
  {
    name: { type: String, unique: true },
    image: { type: String },
    isHidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model("brand", brandSchema);
