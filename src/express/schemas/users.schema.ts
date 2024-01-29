import { Schema, model, models } from "mongoose";

const userSchema = new Schema(
  {
    email: { type: String, unique: true, required: true },
    password: { type: String },
    firstName: { type: String, default: null },
    lastName: { type: String, default: null },
    phoneNumber: { type: String },
    generalInfo: { type: Object, default: null },
    EmailVerifyToken: { type: String },
    PhoneVerifyToken: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    stripeCustomerId: { type: String, default: null },
    paymentMethod: { type: Array, default: null },
    clientSecret: { type: String, default: null },
    cobone: { type: Array, default: null },
    billing: { type: Object, default: null },
  },
  { timestamps: true }
);

export const User = models.User || model("User", userSchema);
