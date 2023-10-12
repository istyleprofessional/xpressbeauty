import { Schema, model } from "mongoose";

const categorySchema = new Schema(
  {
    name: { type: String, unique: true },
    main: { type: String },
    isHidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model("category", categorySchema);
