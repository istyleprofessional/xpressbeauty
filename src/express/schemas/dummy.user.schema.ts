import { Schema, model } from "mongoose";

const dummyUsersSchema = new Schema(
  {
    generalInfo: { type: Object, default: null },
    firstName: { type: String, default: null },
    lastName: { type: String, default: null },
    email: { type: String, default: null },
    phoneNumber: { type: String, default: null },
    billing: { type: Object, default: null },
    stripeCustomerId: { type: String, default: null },
  },
  { timestamps: true }
);
const dummyUsers = model("dummyUsers", dummyUsersSchema);
export default dummyUsers;
