import { model, Schema } from "mongoose";

const messageSchema = new Schema(
  {
    
    phonenumber: { type: String, unique: true },
    profilename: { type: String },
    message: { type: Array },  
  },
  { timestamps: true }
);

export default model("products", messageSchema);