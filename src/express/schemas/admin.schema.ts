import { Schema, model } from "mongoose";

const adminSchema = new Schema(
  {
    firstName: { type: String },
    secondName: { type: String },
    email: { type: String },
    password: { type: String },
    role: { type: String },
  },
  { timestamps: true }
);

export default model("admins", adminSchema);
