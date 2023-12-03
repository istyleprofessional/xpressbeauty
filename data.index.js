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

  console.log(products);
  for (const product of products) {
    if (product.priceType === "range") {
      for (const variant of product.variations) {
        variant.price = parseFloat(
          variant?.price?.toString()?.replace("$", "")
        ).toFixed(2);
      }
      product.price.max = parseFloat(
        product?.price?.max?.toString()?.replace("$", "")
      ).toFixed(2);
      product.price.min = parseFloat(
        product?.price?.min?.toString()?.replace("$", "")
      ).toFixed(2);
    } else {
      product.price.regular = parseFloat(
        product?.price?.regular?.toString()?.replace("$", "")
      ).toFixed(2);
      product.sale_price.sale = parseFloat(
        product?.price?.regular?.toString()?.replace("$", "")
      ).toFixed(2);
    }
    const updateProduct = await Product.findByIdAndUpdate(
      product._id,
      product,
      { new: true }
    );
    console.log(updateProduct);
  }
  await connection.close();
}

changeCurrency();
