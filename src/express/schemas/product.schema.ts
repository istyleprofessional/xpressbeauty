import { model, Schema } from "mongoose";

const productsSchema = new Schema(
  {
    product_name: { type: String },
    description: { type: String, default: null },
    item_no: { type: String },
    sale_price: { type: String, default: null },
    regular_price: { type: String },
    category: { type: String },
    image: { type: String },
    wholesale_price: { type: String },
    wholesale_sale_price: { type: String },
    quantity_on_hand: { type: String },
    sku: { type: String },
    manufacturer_part_number: { type: String },
    bar_code_value: { type: String },
    isDeleted: { type: Boolean, defaults: false },
    isHidden: { type: Boolean, defaults: false },
  },
  { timestamps: true }
);

export const Product = model("products", productsSchema);
