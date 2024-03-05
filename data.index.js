/* eslint-disable @typescript-eslint/no-var-requires */
const { connect, set, connection } = require("mongoose");
const models = require("./model");
const Product = models.Product;
const Category = models.Category;
require("dotenv").config();
const NEXT_APP_MONGO_URL = process.env.VITE_QWIK_APP_MONGO_CONNECTION;
const stripe = require("stripe")(process.env.VITE_STRIPE_SECRET_KEY);
const axios = require("axios");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");
const cheerio = require("cheerio");
const Brand = models.Brand;

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

// updateBabylissPrices();

async function getPaymentDetails() {
  const payment = await stripe.paymentIntents.retrieve(
    "pi_3OlcPoENS3vWhi4P0lgMLuI6"
  );
  console.log(payment);
}

// getPaymentDetails();

async function updateLastProductsQuantity() {
  const json = require("./updated_cosmo_products.json");
  await connect(mongoUrl);
  for (const product of json) {
    const productFound = await Product.findOne({
      product_name: product.product_name,
    });
    if (productFound) {
      productFound.quantity_on_hand = product.quantity_on_hand;
      if (productFound.variations) {
        for (const variation of productFound.variations) {
          const variationFound = product.variations.find(
            (variant) => variant.variation_name === variation.variation_name
          );
          if (variationFound) {
            variation.quantity_on_hand = variationFound.quantity_on_hand;
            variation.price = variationFound.price;
          }
        }
      } else {
        productFound.quantity_on_hand = product.quantity_on_hand;
        productFound.price.regular = product.price;
      }
      await Product.findByIdAndUpdate({ _id: productFound._id }, productFound, {
        new: true,
      });
    }
  }
  // log done and close connection
  console.log("done");
  await connection.close();
}

// updateLastProductsQuantity();

async function getProductsFromCanradWebPage() {
  const mainCatUrl = "https://canrad.com/categories";
  const response = await axios.get(mainCatUrl);
  const categories = response.data.Categories;
  const categoriesToCheck = ["DESIGN.ME", "SCHWARZKOPF"];
  await connect(mongoUrl);
  const dbCategories = await Category.find({});
  const auth = new JWT({
    email: process.env.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "",
    key: process.env.VITE_GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n") ?? "",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const doc = new GoogleSpreadsheet(
    "1FLHOdsDGIH_gnXUjZ0SBYfc1dXYqpgxmfTnH4FEFMeg",
    auth
  );
  await doc.loadInfo();
  const productsToSave = [];
  for (const category of categories) {
    if (categoriesToCheck.includes(category.Name)) {
      if ("SubCategories" in category && category.SubCategories.length > 0) {
        const subCategories = category.SubCategories;
        for (const subCategorie of subCategories) {
          const subUrl = `https://canrad.com/categories/${subCategorie.CategoryID}/ccrd/products`;
          const response = await axios.get(subUrl);
          const canradProducts = response.data.Products;
          if (!canradProducts || canradProducts.length === 0) continue;

          for (const canradProduct of canradProducts) {
            const product = {
              "Product Name": canradProduct.ItemName,
              "Product Description": canradProduct.Description.replace(
                /<[^>]*>?/gm,
                ""
              ),
              "Product Price": canradProduct.Price,
              "Product Sale Price": canradProduct.SpecialPriceDiscount,
              "Product Quantity": canradProduct.OnHandQuantity,
              UPC: canradProduct.UPC,
              "Item ID": canradProduct.ItemID,
              "Product Price": canradProduct.Price,
            };
            productsToSave.push(product);
          }
        }
      } else {
        const canradProducts = response.data.Products;
        if (canradProducts && canradProducts.length > 0) {
          for (const canradProduct of canradProducts) {
            const product = {
              "Product Name": canradProduct.ItemName,
              "Product Description": canradProduct.Description.replace(
                /<[^>]*>?/gm,
                ""
              ),
              "Product Price": canradProduct.Price,
              "Product Sale Price": canradProduct.SpecialPriceDiscount,
              "Product Quantity": canradProduct.OnHandQuantity,
              UPC: canradProduct.UPC,
              "Item ID": canradProduct.ItemID,
              "Product Price": canradProduct.Price,
            };
            productsToSave.push(product);
          }
        }
      }
    }
  }
  // delete all data from the sheet

  const sheet = doc.sheetsByIndex[0];
  await sheet.clear();
  // add Headers to the sheet
  const headers = Object.keys(productsToSave[0]);
  await sheet.setHeaderRow(headers);
  // add products to the sheet
  await sheet.addRows(productsToSave);
  console.log("done");
  await connection.close();
}

getProductsFromCanradWebPage();

async function getProductsFromModernBeauty() {
  const request = await axios.get("https://www.modernbeauty.com/hair.html");
  const html = request.data;
  const $ = cheerio.load(html);
  // get all products from .product-layout
  const products = $(".product-layout");
  const productsToSave = [];
  for (const product of products) {
    // find the closest a tag
    const aTag = $(product).find("a");
    console.log(aTag.text());
  }
}
// getProductsFromModernBeauty();

async function adjustData() {
  await connect(mongoUrl);
  const products = await Product.find({});
  const regex = /[^a-zA-Z0-9\s]/g;
  for (const product of products) {
    if (regex.test(product.companyName.name)) {
      product.companyName.name = product.companyName.name.replace(regex, "");
      product.companyName.name = product.companyName.name.trim();
      await Product.findByIdAndUpdate(product._id, product, { new: true });
    }
  }
  const brands = await Brand.find({});
  for (const brand of brands) {
    if (regex.test(brand.name)) {
      brand.name = brand.name.replace(regex, "");
      brand.name = brand.name.trim();
      await Brand.findByIdAndUpdate(brand._id, brand, { new: true });
    }
  }

  console.log("done");
  await connection.close();
}
// adjustData();
