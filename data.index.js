/* eslint-disable @typescript-eslint/no-var-requires */
const { connect, set, connection } = require("mongoose");
const models = require("./model");
const Product = models.Product;
require("dotenv").config();
const NEXT_APP_MONGO_URL = process.env.VITE_QWIK_APP_MONGO_CONNECTION;

set("strictQuery", false);
const mongoUrl = NEXT_APP_MONGO_URL || "";

async function changeCurrency() {
  await connect(mongoUrl);
  const products = await Product.find({});
  for (const product of products) {
    if (product.priceType === "range") {
      for (const variant of product.variations) {
        variant.price =
          parseFloat(variant?.price?.toString()?.replace("$", "")) *
          (100).toFixed(2);
      }
      product.price.max =
        parseFloat(product?.price?.max?.toString()?.replace("$", "")) *
        (100).toFixed(2);
      product.price.min = (
        parseFloat(product?.price?.min?.toString()?.replace("$", "")) * 100
      ).toFixed(2);
    } else {
      product.price.regular = parseFloat(
        product?.price?.regular?.toString()?.replace("$", "")
      ).toFixed(2);
    }
    await product.save();
  }
  await connection.close();
}

changeCurrency();
