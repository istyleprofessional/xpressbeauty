import { model, Schema } from "mongoose";

const productsSchema = new Schema(
  {
    product_name: { type: String },
    description: { type: String, default: null },
    item_no: { type: String },
    sale_price: { type: Object, default: null },
    price: { type: Object },
    categories: { type: Array },
    imgs: { type: Array },
    quantity_on_hand: { type: String },
    sku: { type: String },
    manufacturer_part_number: { type: String },
    bar_code_value: { type: String },
    isDeleted: { type: Boolean, defaults: false },
    isHidden: { type: Boolean, defaults: false },
    status: { type: String, default: "NORMAL" },
    rating: { type: Number, default: 0 },
    variation_type: { type: String, default: null },
    variations: { type: Array, default: null },
    lineName: { type: String, default: null },
    companyName: { type: Object, default: null },
    perfix: { type: String, default: null },
    priceType: { type: String, default: null },
    updateQuickBooks: { type: Boolean, default: true },
    oldPerfix: { type: String, default: null },
    currency: { type: String, default: null },
  },
  { timestamps: true }
);

export default model("products", productsSchema);
