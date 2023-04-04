import { Schema, model } from "mongoose";

const usersSchema = new Schema(
  {
    firstName: { type: String },
    secondName: { type: String },
    email: { type: String },
    password: { type: String },
    role: { type: String },
  },
  { timestamps: true }
);

export const User = model("users", usersSchema);
