/* eslint-disable @typescript-eslint/no-var-requires */
const { connect, set } = require("mongoose");
const models = require("./model");
const Product = models.Product;
require("dotenv").config();
const NEXT_APP_MONGO_URL = process.env.VITE_QWIK_APP_MONGO_CONNECTION;

set("strictQuery", false);
const mongoUrl = NEXT_APP_MONGO_URL || "";

const changeCurrency = async () => {
  await connect(mongoUrl);
  const products = await Product.find({});
  for (const product of products) {
    if (product.priceType === "range") {
      for (const variant of product.variations) {
        variant.price = (
          Math.round(
            parseFloat(variant?.price?.toString()?.replace("$", "")) * 100
          ) / 100
        ).toFixed(2);
      }
      product.price.max = (
        Math.round(
          parseFloat(product?.price?.max?.toString()?.replace("$", "")) * 100
        ) / 100
      ).toFixed(2);
      product.price.min = (
        Math.round(
          parseFloat(product?.price?.min?.toString()?.replace("$", "")) * 100
        ) / 100
      ).toFixed(2);
    } else {
      product.price.regular = (
        Math.round(
          parseFloat(product?.price?.regular?.toString()?.replace("$", "")) *
            100
        ) / 100
      ).toFixed(2);
    }
    await product.save();
  }
  console.log("done");
  return;
  // conn.disconnect();
};

changeCurrency();
