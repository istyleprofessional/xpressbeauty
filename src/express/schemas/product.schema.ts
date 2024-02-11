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
    quantity_on_hand: { type: Number, default: 0 },
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
    gtin: { type: String, default: null },
    ingredients: { type: String, default: null },
    directions: { type: String, default: null },
  },
  { timestamps: true }
);

productsSchema.index({
  product_name: "text",
  description: "text",
  lineName: "text",
  "companyName.name": "text",
  "categories.main": "text",
  "categories.name": "text",
}, {
  name: "textScore", weights: {
    product_name: 10,
    description: 5,
    lineName: 5,
    "companyName.name": 5,
    "categories.main": 5,
    "categories.name": 5,
  },
});

const products = model("products", productsSchema);
export default products;
