import { Schema, model } from "mongoose";

const brandSchema = new Schema(
    {
        name: { type: String, unique: true },
    },
    { timestamps: true }
);

export default model("brand", brandSchema);
