/* eslint-disable @typescript-eslint/no-var-requires */
const { mongoose } = require("mongoose");

const productsSchema = new mongoose.Schema(
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
    firstName: { type: String, default: null },
    lastName: { type: String, default: null },
    phoneNumber: { type: String },
    generalIPInfo: { type: Object },
    EmailVerifyToken: { type: String },
    PhoneVerifyToken: { type: String },
    userInfo: { type: Object },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
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

const cartSchema = new mongoose.Schema(
  {
    userId: { type: String, default: null },
    products: {
      type: Array,
    },
    totalQuantity: { type: Number, default: 0 },
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
  Cart: mongoose.model("carts", cartSchema),
};
