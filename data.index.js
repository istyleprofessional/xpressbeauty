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
        variant.price = parseFloat(
          variant?.price?.toString()?.replace("$", "")
        );
      }
      product.price.max = parseFloat(
        product?.price?.max?.toString()?.replace("$", "")
      );
      product.price.min = parseFloat(
        product?.price?.min?.toString()?.replace("$", "")
      );
    } else {
      product.price.regular = parseFloat(
        product?.price?.regular?.toString()?.replace("$", "")
      );
      product.sale_price.sale = parseFloat(
        product?.price?.regular?.toString()?.replace("$", "")
      );
    }
    const updateProduct = await Product.findByIdAndUpdate(
      product._id,
      product,
      { new: true }
    );
  }
  console.log("done");
  await connection.close();
}

// changeCurrency();

async function updateCategory() {
  const json = require("./backups/file-7.json");
  const shopEmpireData = require("./shopEmpireData.json");
  const products = [...json, ...shopEmpireData];
  await connect(mongoUrl);
  for (const product of products) {
    const updateProduct = product.imgs.map((img) => {
      return img.replace("newProductsImages", "products-images-2");
    });
    await Product.findOneAndUpdate(
      { product_name: product.product_name },
      { imgs: updateProduct }
    );
    // console.log(updateProduct);
  }
  console.log("done");
  await connection.close();
}

// change quantity on hand to number
async function changeQuantity() {
  await connect(mongoUrl);
  const products = await Product.find({});
  for (const product of products) {
    product.quantity_on_hand = parseInt(product.quantity_on_hand);
    await Product.findByIdAndUpdate(product._id, product, { new: true });
  }
  console.log("done");
  await connection.close();
}
// changeQuantity()
// updateCategory()

async function updateQuantity() {
  await connect(mongoUrl);
  const products = await Product.find({});
  for (const product of products) {
    product.quantity_on_hand = parseInt(product.quantity_on_hand);
    await Product.findByIdAndUpdate(product._id, product, { new: true });
  }
  console.log("done");
  await connection.close();
}
// updateQuantity();

async function updateBabylissPrices() {
  await connect(mongoUrl);
  const products = await Product.find({});
  for (const product of products) {
    if (!product.companyName.name) continue;
    if (product.companyName.name.toLowerCase().includes("babyliss")) {
      for (const category of product.categories) {
        if (category.name === "Trimmers" || category.name === "Clippers") {
          product.price.regular =
            product.price.regular * 0.3 + product.price.regular;
          product.sale_price.sale =
            product.sale_price.sale * 0.3 + product.sale_price.sale;
          await Product.findByIdAndUpdate(product._id, product, { new: true });
          break;
        }
      }
    }
  }
  console.log("done");
  await connection.close();
}

updateBabylissPrices();
