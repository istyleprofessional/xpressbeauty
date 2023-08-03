/* eslint-disable @typescript-eslint/no-var-requires */
const { mongoose } = require("mongoose");

const productsSchema = new mongoose.Schema(
  {
    product_name: { type: String },
    description: { type: String, default: null },
    item_no: { type: String },
    sale_price: { type: String, default: null },
    price: { type: String },
    id: { type: String, default: null },
    category: { type: String },
    quantity_on_hand: { type: String },
    sku: { type: String },
    manufacturer_part_number: { type: String },
    imgs: { type: Array },
    bar_code_value: { type: String },
    isDeleted: { type: Boolean, defaults: false },
    isHidden: { type: Boolean, defaults: false },
    variation_type: { type: String, default: null },
    variations: { type: Array, default: null },
    lineName: { type: String, default: null },
    companyName: { type: String, default: null },
    perfix: { type: String, default: null },
  },
  { timestamps: true }
);

const adminSchema = new mongoose.Schema(
  {
    firstName: { type: String },
    secondName: { type: String },
    email: { type: String },
    password: { type: String },
    role: { type: String },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },
    password: { type: String },
    cart: { type: String, default: null },
    orders: { type: String, default: null },
    wishlist: { type: String, default: null },
    generalIPInfo: { type: Object },
    userInfo: { type: Object },
    browserId: { type: String },
  },
  { timestamps: true }
);

const dummyUserSchema = new mongoose.Schema(
  {
    browserId: { type: String, unique: true },
    generalIPInfo: { type: Object, default: {} },
    cart: { type: String, default: null },
    wishlist: { type: String, default: null },
    orders: { type: String, default: null },
    generalInfo: { type: Object, default: {} },
  },
  { timestamps: true }
);

const brandSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true },
  },
  { timestamps: true }
);

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, unique: true },
    main: { type: String },
  },
  { timestamps: true }
);

module.exports = {
  Product: mongoose.model("products", productsSchema),
  Admin: mongoose.model("admins", adminSchema),
  User: mongoose.model("users", userSchema),
  DummyUser: mongoose.model("dummyUsers", dummyUserSchema),
  Brand: mongoose.model("brands", brandSchema),
  Category: mongoose.model("categories", categorySchema),
};
