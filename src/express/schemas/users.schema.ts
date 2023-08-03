import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    email: { type: String, unique: true, required: true },
    password: { type: String },
    firstName: { type: String, default: null },
    lastName: { type: String, default: null },
    phoneNumber: { type: String, default: null },
    generalIPInfo: { type: Object },
    EmailVerifyToken: { type: String },
    userInfo: { type: Object },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    browserId: { type: String },
  },
  { timestamps: true }
);

export default model("users", userSchema);
