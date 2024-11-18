/* eslint-disable @typescript-eslint/no-var-requires */
const { connect, set, connection, default: mongoose } = require("mongoose");
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
const Order = models.Order;
const User = models.User;
const RatingReviews = models.RatingReviews;
// const OpenAI = require("openai");
const DummyUser = models.DummyUser;
const fs = require("fs");
const { S3 } = require("@aws-sdk/client-s3");

set("strictQuery", false);
const mongoUrl = NEXT_APP_MONGO_URL || "";

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
      if (product.description) productFound.description = product.description;
      await Product.findByIdAndUpdate({ _id: productFound._id }, productFound, {
        new: true,
      });
    }
  }
  await connection.close();
}

// updateLastProductsQuantity();

async function getProductsFromCanradWebPage() {
  const mainCatUrl = "https://canrad.com/categories";
  const response = await axios.get(mainCatUrl);
  const categories = response.data.Categories;
  const brands = require("./brands.json");
  const categoriesToCheck = brands.map((a) => a.name);

  await connect(mongoUrl);
  await doc.loadInfo();
  const productsToSave = [];
  for (const category of categories) {
    try {
      if (
        !categoriesToCheck.toLowerCase().includes(
          // regex of the category name
          category.Name.toLowerCase()
            .replace(/[^a-zA-Z0-9\s]/g, "")
            .trim()
        )
      ) {
        if ("SubCategories" in category && category.SubCategories.length > 0) {
          const subCategories = category.SubCategories;
          for (const subCategorie of subCategories) {
            if (subCategorie.Name.toLowerCase().includes("deal")) continue;
            const subUrl = `https://canrad.com/categories/${subCategorie.CategoryID}/ccrd/products`;
            const response = await axios.get(subUrl);
            const canradProducts = response.data.Products;
            if (!canradProducts || canradProducts.length === 0) continue;
            // console.log(canradProducts);

            for (const canradProduct of canradProducts) {
              const product = {
                "Product Name": canradProduct.ItemName,
                "Product Description": canradProduct.Description.replace(
                  /<[^>]*>?/gm,
                  ""
                ),
                categories: subCategorie.Name,
                brand: category.Name,
                "Product Price": canradProduct.Price,
                "Product Sale Price": canradProduct.SpecialPriceDiscount,
                "Product Quantity": canradProduct.OnHandQuantity,
                UPC: canradProduct.UPC,
                "Item ID": canradProduct.ItemID,
                imagelink: canradProduct.ImageURL,
                "Product Price": canradProduct.Price,
              };
              productsToSave.push(product);
            }
            await sleep(2000);
          }
        }
        console.log(productsToSave.length);
      }
    } catch (error) {
      console.log(error);
      await sleep(2000);
      if (!categoriesToCheck.includes(category.Name)) {
        if ("SubCategories" in category && category.SubCategories.length > 0) {
          const subCategories = category.SubCategories;
          for (const subCategorie of subCategories) {
            if (subCategorie.Name.toLowerCase().includes("deal")) continue;
            const subUrl = `https://canrad.com/categories/${subCategorie.CategoryID}/ccrd/products`;
            const response = await axios.get(subUrl);
            const canradProducts = response.data.Products;
            if (!canradProducts || canradProducts.length === 0) continue;
            // console.log(canradProducts);

            for (const canradProduct of canradProducts) {
              const product = {
                "Product Name": canradProduct.ItemName,
                "Product Description": canradProduct.Description.replace(
                  /<[^>]*>?/gm,
                  ""
                ),
                categories: subCategorie.Name,
                brand: category.Name,
                "Product Price": canradProduct.Price,
                "Product Sale Price": canradProduct.SpecialPriceDiscount,
                "Product Quantity": canradProduct.OnHandQuantity,
                UPC: canradProduct.UPC,
                "Item ID": canradProduct.ItemID,
                imagelink: canradProduct.ImageURL,
                "Product Price": canradProduct.Price,
              };
              productsToSave.push(product);
            }
            await sleep(2000);
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
                brand: category.Name,
                "Product Price": canradProduct.Price,
                "Product Sale Price": canradProduct.SpecialPriceDiscount,
                "Product Quantity": canradProduct.OnHandQuantity,
                UPC: canradProduct.UPC,
                "Item ID": canradProduct.ItemID,
                imagelink: canradProduct.ImageURL,
                "Product Price": canradProduct.Price,
              };
              productsToSave.push(product);
            }
          }
        }
        console.log(productsToSave.length);
      }
      continue;
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

// getProductsFromCanradWebPage();

async function addCanradProductsFromGoogleSheet() {
  await connect(mongoUrl);
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
  const sheet = doc.sheetsByIndex[0];
  const categories = await Category.find({});

  const rows = await sheet.getRows();
  // skip the first row
  for (let i = 1; i < rows.length; i++) {
    // check if mongodb is connected
    if (!(connection.readyState === 1 || connection.readyState === 2)) {
      await connect(mongoUrl);
    }
    // download the image and upload it to s3 and get the url and replace the image url
    const rowBefore = rows[i];
    const row = rowBefore.toObject();
    if (!row["Product Name"]) continue;
    if (!row["categories"]) continue;
    if (!row["brand"] || row["brand"] === "Canrad" || row["brand"] === "Barber")
      continue;
    if (!row["Product Price"] || row["Product Price"] === 0) continue;
    // check if product quantity is a number
    if (isNaN(parseInt(row["Product Quantity"]))) continue;

    const imageToBeInserted = `https://xpressbeauty.s3.ca-central-1.amazonaws.com/products-images-2/manage/${row[
      "Product Name"
    ]
      .replace(/[^a-zA-Z0-9]/g, "")
      .replace(/ /g, "")}.webp`;
    const product = {
      product_name: row["Product Name"],
      description: row["Product Description"].includes("IN STORE ONLY")
        ? ""
        : row["Product Description"],
      item_no: row["Item ID"],
      sale_price: {
        sale: 0,
      },
      price: {
        regular: parseFloat(row["Product Price"]) + 8,
      },
      quantity_on_hand: row["Product Quantity"],
      gtin: row["UPC"],
      sku: "",
      imgs: [imageToBeInserted],
      status: "NORMAL",
      isHidden: false,
      bar_code_value: "",
      manufacturer_part_number: "",
      companyName: { name: row["brand"] },
      categories: [
        {
          name: row["categories"],
          main:
            categories.filter((item) =>
              item.name?.toLowerCase().includes(row["categories"].toLowerCase())
            )[0]?.main ?? "",
        },
      ],
      perfix: row["Product Name"]
        .replace(/[^a-zA-Z0-9]/g, "")
        .replace(/ /g, ""),
      priceType: "single",
    };
    await Product.findOneAndUpdate(
      { product_name: product.product_name },
      product,
      { upsert: true }
    );
  }
  console.log("done");
  await connection.close();
}
// addCanradProductsFromGoogleSheet();

async function addFakeReviews() {
  await connect(mongoUrl);
  const products = await Product.find({});
  for (const product of products) {
    // pick a random number of reviews between 1 and 20
    const numberOfReviews = Math.floor(Math.random() * 6) + 1;
    const openai = new OpenAI();
    const oldReviews = [];
    for (let i = 0; i < numberOfReviews; i++) {
      try {
        const user = await User.create({
          // create a fake email with unique email
          email: `
          ${Math.random().toString(36).substring(2, 15)}@gmail.com`,
          password: "123456",
        });
        const completion = await openai.chat.completions.create({
          model: "gpt-4-0125-preview",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `You are a customer writing a review of a product. from 100 to 200 character and rating should be between 3.5, 4, 4.5 and 5 stars and return the result in json format {title: string, review: string, rating: number}
                do not include the product name in the review or title and do not be repetitive in the review or title. and use basic words.
                
                old reviews: ${JSON.stringify(oldReviews)}`,
            },
            {
              role: "user",
              content: `Write a review for ${product.product_name}`,
            },
          ],
          // prompt: `Write a review for ${product.product_name}`,
        });
        const response = completion.choices[0].message.content;
        const res = JSON.parse(response);
        oldReviews.push(res);
        const randomMilliseconds =
          Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000;

        // Create a new date object using the current date minus the random milliseconds
        const randomDate = new Date(new Date() - randomMilliseconds);
        const randomHours = Math.floor(Math.random() * 24);
        const randomMinutes = Math.floor(Math.random() * 60);
        const randomSeconds = Math.floor(Math.random() * 60);

        // Set the random time
        randomDate.setHours(randomHours, randomMinutes, randomSeconds);
        const ratingAndReview = {
          user_id: user._id,
          reviewTitle:
            // only first word is capitalized
            res.title.charAt(0).toUpperCase() +
            res.title.slice(1).toLowerCase(),
          reviewDescription: res.review,
          rating:
            // between 4 and 5
            Math.floor(Math.random() * 2) + 4,
          createdAt:
            // random date and time last 90 days
            randomDate,
        };
        await RatingReviews.findOneAndUpdate(
          { product_id: product._id },
          {
            $push: {
              ratings: ratingAndReview,
            },
          },
          { new: true, upsert: true }
        );
        console.log(product.perfix);
      } catch (error) {
        console.log(error);
        continue;
      }
    }
  }
  await connection.close();
  console.log(products.length);
}

// addFakeReviews();

async function addAngelProductsFromJsonFile() {
  const json = require("./angel.json");
  await connect(mongoUrl);
  for (const product of json) {
    await Product.findOneAndUpdate(
      { product_name: product.product_name },
      product,
      { upsert: true }
    );
  }
  console.log("done");
  await connection.close();
}

// addAngelProductsFromJsonFile();

async function updateCanardProducts() {
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
  const sheet = doc.sheetsByIndex[0];

  const rows = await sheet.getRows();
  for (const row of rows) {
    try {
      await connect(mongoUrl);
      const rowObject = row.toObject();
      const id = rowObject["Item ID"];
      const quantityReq = await axios.get(
        `https://canrad.com/products/${id}/ccrd`
      );
      const quantity = quantityReq.data.Product.OnHandQuantity;
      const updateReq = await Product.findOneAndUpdate(
        { product_name: rowObject["Product Name"] },
        { quantity_on_hand: quantity },
        { new: true }
      );
      if (updateReq) {
        console.log(updateReq.product_name);
      }
      await connection.close();
    } catch (error) {
      await connection.close();
      console.log(error.message);
      continue;
    }
  }
  console.log("done");
}

// updateCanardProducts();

async function dumpAllUnkownCartAndUsers() {
  await connect(mongoUrl);
  const users = await User.find({});
  const dummyUsers = await DummyUser.find({});
  // if (users.length > 0) {
  //   for (const user of users) {
  //     if (!(user.firstName && user.lastName && user.phoneNumber)) {
  //       await User.findByIdAndDelete(user._id);
  //     }
  //   }
  // }
  if (dummyUsers.length > 0) {
    for (const dummyUser of dummyUsers) {
      if (
        !(
          dummyUser.firstName &&
          dummyUser.lastName &&
          dummyUser.phoneNumber &&
          dummyUser.email
        )
      ) {
        await DummyUser.findByIdAndDelete(dummyUser._id);
      }
    }
  }

  console.log("done");
  await connection.close();
}

// dumpAllUnkownCartAndUsers();

async function aiCategorization() {
  mongoose.connect(mongoUrl);
  const products = await Product.find({ isHidden: { $ne: true } });
  try {
    await Category.create({
      name: "Hair Dryers",
      main: "Tools",
    });
    await Category.create({
      name: "Nail Polish",
      main: "Nails",
    });
  } catch (error) {
    console.log(error.message);
  }
  const dbCategories = await Category.find({});
  for (const product of products) {
    console.log(`${products.indexOf(product) + 1} out of ${products.length}.
    ---------------------------------
    product name: ${product.product_name} - id: ${product._id}`);
    let isProductCoropted = false;

    try {
      for (const category of product.categories) {
        if (category.name === "" || category.main === "") {
          isProductCoropted = true;
          break;
        }
      }
      if (isProductCoropted) {
        const openai = new OpenAI();
        const completion = await openai.chat.completions.create({
          messages: [
            {
              role: "system",
              content: `You are a helpful assistant designed to output JSON. I will provide a json object with the category and main category that I have in my database. 
              And I will also provide the product name and description of the product. Please return the main category and subcategory of the product. in json format {main: string, sub: string}.
              if you can't find the category in the database or you have a better sub category for it please return a new category and main category in json format {main: string, sub: string}`,
            },
            {
              role: "user",
              content: `
            All the categories and main categories that I have in my database are:
            ${dbCategories
                  .map((category) => `${category.name} - ${category.main}`)
                  .join("\n")}
            The product name is ${product.product_name
                } and the description is ${product.description}`,
            },
          ],
          model: "gpt-3.5-turbo-0125",
          response_format: { type: "json_object" },
        });
        const gbtCategory = completion.choices[0].message.content;
        const finalCategory = JSON.parse(gbtCategory);
        product.categories = [];
        product.categories.push({
          name: finalCategory.sub,
          main: finalCategory.main,
        });
        await Product.findByIdAndUpdate(
          product._id,
          { categories: product.categories },
          { new: true }
        );
      }
    } catch (error) {
      console.log(error.message);
      await Product.deleteOne({ _id: product._id });
      continue;
    }
  }
  // get Unique categories from the products
  const uniqueCategories = [];
  for (const product of products) {
    for (const category of product.categories) {
      if (!uniqueCategories.find((cat) => cat.name === category.name)) {
        uniqueCategories.push(category);
      }
    }
  }
  // add the unique categories to the database
  await Category.deleteMany({});
  for (const category of uniqueCategories) {
    try {
      await Category.create(category);
    } catch (error) {
      console.log(error.message);
    }
  }
  console.log("done");
  await connection.close();
}
// aiCategorization();

async function addLatestCosmoProducts() {
  const Brand = models.Brand;
  const products = require("./cosmoprof_products_details_with_variation_updated-3.json");
  await connect(mongoUrl);
  const brands = await Brand.find({});
  const standardBrands = brands.map((brand) => brand.name);
  for (const product of products) {
    await connect(mongoUrl);
    if (product.variation_type === "Color") {
      product.variations = product.variations.map((variation) => {
        return {
          variation_name: variation.variation_name,
          variation_image: variation.variation_image,
          quantity_on_hand: variation.quantity_on_hand,
          price: variation.price,
          sale_price: variation.sale_price,
          upc: variation.upc,
          variation_id: variation.variation_id,
        };
      });
    }
    // Standardize brand name dynamically
    if (product.companyName?.name) {
      const originalBrandName = product.companyName.name;
      const foundBrand = standardBrands.find(brand => originalBrandName.toLocaleLowerCase().includes(brand.toLocaleLowerCase()));
      product.companyName.name = foundBrand ? foundBrand.charAt(0).toUpperCase() + foundBrand.slice(1).toLowerCase() : originalBrandName.charAt(0).toUpperCase() + originalBrandName.slice(1).toLowerCase();
    }
    if (product.priceType === "range") {
      product.price = {
        min: product.price.min,
        max: product.price.max,
      };
    } else {
      if (
        // check if product price is a number
        parseFloat(product.price) !== NaN
      ) {
        product.price = {
          regular: product.price,
        };
      } else {
        product.price = {
          regular: product.price.regular,
        };
      }
    }
    await Product.findOneAndUpdate(
      { product_name: product.product_name },
      { ...product },
      { upsert: true }
    );
  }
  await connection.close();
  console.log("done");
}

async function adjustData() {
  await connect(mongoUrl);
  const products = await Product.find({});

  for (const product of products) {
    if (product.product_name.includes("CR")) {
      product.product_name = product.product_name.replace(/CR.*/, "");
    }
    if (product.companyName?.name) {
      product.companyName.name =
        // first letter is capitalized and the rest is lower case
        product.companyName.name.charAt(0).toUpperCase() +
        product.companyName.name.slice(1).toLowerCase();
      await Product.findByIdAndUpdate(product._id, product, { new: true });
    } else {
      await Product.findByIdAndDelete(product._id);
    }
  }
  console.log("done");
  await connection.close();
}

async function deleteProductPriceZero() {
  await connect(mongoUrl);
  const products = await Product.find({});
  for (const product of products) {
    if (!(product.price.regular || product.price.min || product.price.max)) {
      await Product.findByIdAndDelete(product._id);
    }
  }
}

async function addProductsToGoogleSheet() {
  await connect(mongoUrl);

  const productsDb = await Product.find({
    isHidden: { $ne: true },
  });
  const newArray = [];
  const auth = new JWT({
    email: process.env.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "",
    key: process.env.VITE_GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n") ?? "",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const doc = new GoogleSpreadsheet(
    "1S77P2yiRzHa6ThSOW-TWOG33MhU8w_I9cQZJ-iYC7to",
    auth
  );
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0]; // loads document properties and worksheets
  const rows = await sheet.getRows();
  for (const product of productsDb) {
    try {
      const row = rows.find((r) => r.toObject().id === product._id.toString());
      if (product?.variations?.length > 0) {
        for (const variant of product.variations) {
          const newRow = {
            id: `${product._id.toString()}-${variant?.variation_id}`,
            title: `${product.product_name?.includes("CR")
              ? product.product_name?.replace(/CR.*/, "")
              : product.product_name ?? ""
              } - ${variant?.variation_name}`,
            description: product?.description ?? "",
            link: `https://xpressbeauty.ca/products/${encodeURIComponent(
              product.product_name
                ?.replace(/[^a-zA-Z0-9 ]/g, "") // Exclude numbers from removal
                .replace(/ /g, "-")
                .toLowerCase() ?? ""
            )}-pid-${product._id}/`,
            "image link": product?.imgs[0].includes("http")
              ? product?.imgs[0]
              : `https://xpressbeauty.ca${product?.imgs[0].replace(".", "")}`,

            availability:
              parseInt(variant?.quantity_on_hand?.toString() ?? "0") > 0
                ? "in_stock"
                : "out_of_stock",
            price: `${variant?.price} CAD` ?? "0",
            brand: product?.companyName?.name ?? "Qwik City",
            condition: "new",
            gtin: variant?.upc ?? "",
            "identifier exists": variant?.upc ? "yes" : "no",
          };
          if (variant.variation_image) {
            if (product?.variation_type === "Color") {
              const src = product?.product_name?.replace(/[^A-Za-z0-9]+/g, "");
              const folder = `https://xpressbeauty.s3.ca-central-1.amazonaws.com/products-images-2/${src}/variation/variation-image-${
                // index of the variation
                product?.variations?.indexOf(variant)
                }.webp`;
              newRow["additional image link"] = folder;
            } else {
              newRow["additional image link"] = variant?.variation_image;
            }
          }
          newArray.push(newRow);
        }
      } else {
        if (row) {
          const oldRow = row.toObject();
          oldRow.availability = parseInt(
            product?.quantity_on_hand?.toString() ?? "0"
          );
          oldRow.title = oldRow.title?.includes("CR")
            ? oldRow.title?.replace(/CR.*/, "")
            : oldRow.title ?? "";
          oldRow.price = `${typeof (product?.price) === 'number' ? parseFloat(product?.price?.toString()).toFixed(2) : parseFloat(product?.price?.regular?.toString()).toFixed(2)} CAD` ?? "0",
            oldRow.shipping_label = "";
          oldRow.gtin =
            product?.gtin !== "" ? product?.gtin : oldRow?.gtin ?? "";
          oldRow["identifier exists"] =
            product?.gtin || oldRow?.gtin ? "yes" : "no";
          oldRow.availability =
            parseInt(product?.quantity_on_hand?.toString() ?? "0") > 0
              ? "in_stock"
              : "out_of_stock";
          oldRow.link = `https://xpressbeauty.ca/products/${encodeURIComponent(
            product.product_name
              ?.replace(/[^a-zA-Z0-9 ]/g, "") // Exclude numbers from removal
              .replace(/ /g, "-")
              .toLowerCase() ?? ""
          )}-pid-${product._id}/`;
          oldRow.price = `${typeof (product?.price) === 'number' ? parseFloat(product?.price?.toString()).toFixed(2) : parseFloat(product?.price?.regular?.toString()).toFixed(2)} CAD` ?? "0";
          newArray.push(oldRow);
        } else {
          const newRow = {
            id: product._id.toString(),
            title: product.product_name?.includes("CR")
              ? product.product_name?.replace(/CR.*/, "")
              : product.product_name ?? "",
            description: product?.description ?? "",
            link: `https://xpressbeauty.ca/products/${encodeURIComponent(
              product.product_name
                ?.replace(/[^a-zA-Z0-9 ]/g, "") // Exclude numbers from removal
                .replace(/ /g, "-")
                .toLowerCase() ?? ""
            )}-pid-${product._id}/`,
            "image link": product?.imgs[0].includes("http")
              ? product?.imgs[0]
              : `https://xpressbeauty.ca${product?.imgs[0].replace(".", "")}`,
            availability:
              parseInt(product?.quantity_on_hand?.toString() ?? "0") > 0
                ? "in_stock"
                : "out_of_stock",
            price: `${typeof (product?.price) === 'number' ? parseFloat(product?.price?.toString()).toFixed(2) : parseFloat(product?.price?.regular?.toString()).toFixed(2)} CAD` ?? "0",
            brand: product?.companyName?.name ?? "Qwik City",
            condition: "new",
            shipping_label: "",
            gtin: product?.gtin ?? "",
            "identifier exists": product?.gtin ? "yes" : "no",
          };
          newArray.push(newRow);
        }
      }
    } catch (error) {
      console.log(error);
      continue;
    }
  }
  try {
    // loads document properties and worksheets
    const auth1 = new JWT({
      email: process.env.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "",
      key: process.env.VITE_GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n") ?? "",
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const doc1 = new GoogleSpreadsheet(
      "1S77P2yiRzHa6ThSOW-TWOG33MhU8w_I9cQZJ-iYC7to",
      auth1
    );
    await doc1.loadInfo();
    const sheet1 = doc.sheetsByIndex[0]; // loads document properties and worksheets
    await sheet1.clear("A2:Z");
    await sheet1.addRows(newArray);
  } catch (error) {
    console.log(error);
  }
  await connection.close();
}

const getSchwarzkopfProducts = async () => {
  const products = require("./productsFinal6.json");
  const finalProducts = [];
  for (const product of products) {
    if (product?.companyName?.name?.includes("Schwarzkopf")) {
      finalProducts.push(product);
    }
  }
  console.log(finalProducts.length);
  fs.writeFileSync("schwarzkopf.json", JSON.stringify(finalProducts));
};

const downloadImagesAndUploadToS3 = async (imageUrl, imageName, bucketName) => {
  const s3 = new S3({
    region: "ca-central-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.AWS_SECRET_KEY ?? "",
    },
  });

  try {
    await s3.headBucket({ Bucket: bucketName });
  } catch (error) {
    if (error.name === "NotFound") {
      await s3.createBucket({
        Bucket: bucketName,
        CreateBucketConfiguration: {
          LocationConstraint: "ca-central-1",
        },
      });
      // Set bucket policy to make it public
      const bucketPolicyParams = {
        Bucket: bucketName,
        Policy: JSON.stringify({
          Version: "2012-10-17",
          Statement: [
            {
              Sid: "PublicReadGetObject",
              Effect: "Allow",
              Principal: "*",
              Action:
                // get and upload
                "s3:GetObject, s3:PutObject",
              Resource: `arn:aws:s3:::${bucketName}/*`,
            },
          ],
        }),
      };

      await s3.putBucketPolicy(bucketPolicyParams);

      // make bucket public
      const publicAccessBlockParams = {
        Bucket: bucketName,
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: false,
          IgnorePublicAcls: false,
          BlockPublicPolicy: false,
          RestrictPublicBuckets: false,
        },
      };

      await s3.putPublicAccessBlock(publicAccessBlockParams);
    } else {
      console.error("Error accessing bucket: ", error);
      return;
    }
  }
  // Upload image to S3
  try {
    const data = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      responseEncoding: "binary",
    });
    const arrayOfBuffer = data.data;
    if (!arrayOfBuffer) {
      return;
    }

    const params = {
      Bucket: bucketName,
      Key: `${bucketName}/${imageName.replace(/ /g, "-")}.webp`,
      Body: arrayOfBuffer,
      ContentType: "image/webp",
    };
    await s3.putObject(params);
    const newImg = `https://${bucketName}.s3.amazonaws.com/${bucketName}/${imageName.replace(
      / /g,
      "-"
    )}.webp`;
    return newImg;
  } catch (error) {
    console.error("Error downloading image: ", error);
  }
};

async function adjustImages() {
  const products = require("./cosmoprof_products_details_with_variation_updated.json");
  // const products = await Product.find({});
  for (const product of products) {
    const imageUrl = await downloadImagesAndUploadToS3(
      product.product_image,
      // unique name for each product and clean the name from special characters to be image url friendly
      product.product_name
        .replace(/[^a-zA-Z0-9]/g, "")
        .replace(/\s+/g, " ")
        .replace(/ /g, "-"),
      "xpressbeauty"
    );
    // delete image from product img array and replace it with the new url
    product.img = [];
    product.img.push(imageUrl);
    delete product.product_image;
    if (product.variations && product.variations.length > 0) {
      for (let variant of product.variations) {
        const imageUrl = await downloadImagesAndUploadToS3(
          variant.variation_image,
          `${product.product_name
            .replace(/[^a-zA-Z0-9]/g, "")
            .replace(/\s+/g, " ")
            .replace(/ /g, "-")}-${variant.variation_name
              .replace(/[^a-zA-Z0-9]/g, "")
              .replace(/\s+/g, " ")
              .replace(/ /g, "-")}`,
          "xpressbeauty"
        );
        variant.variation_image = imageUrl;
      }
    }
    // await Product.findByIdAndUpdate
    //   (product._id, product, { new: true });
    console.log(`Product ${product.product_name} saved successfully`);
  }
  fs.appendFileSync(
    "cosmoprof_products_details_with_variation_updated-3.json",
    JSON.stringify(products) + ",\n"
  );
}

async function updateCategoryAndBrands() {
  await connect(mongoUrl);

  const products = await Product.find({});

  // await Category.deleteMany({});
  await Brand.deleteMany({});
  for (const product of products) {
    if (!product.companyName) continue;
    products.forEach(async (p) => {
      if (product.companyName.name.toLowerCase(p.companyName.name.toLowerCase())) {
        p.companyName.name = product.companyName.name;
        await Product.findByIdAndUpdate(p._id, p, { new: true });
      }
    });
    if (product.companyName.name) {
      const brandFound = await Brand.findOne({
        name: product.companyName.name,
      });
      if (!brandFound) {
        await Brand.findOneAndUpdate(
          { name: product.companyName.name },
          { name: product.companyName.name },
          { upsert: true }
        );
      }
    }
  }

  // check categories names against the  brand names
  const categories = await Category.find({});
  const brands = await Brand.find({});
  for (const category of categories) {
    if (
      brands.find(
        (brand) => brand.name.toLowerCase().includes(category.name.toLowerCase())
      )
    ) {
      await Category.findByIdAndDelete(category._id);
    }
  }
  console.log("done");
  await connection.close();
}

async function getGkHairProducts() {
  const products = require("./gk-hair-products.json");
  for (const product of products) {
    const oldImages = product.imgs;
    product.imgs = [];
    for (const img of oldImages) {
      const imageUrl = await downloadImagesAndUploadToS3(
        img.trim(),
        product.product_name
          .replace(/[^a-zA-Z0-9]/g, "")
          .replace(/\s+/g, " ")
          .replace(/ /g, "-"),
        "xpressbeauty"
      );
      product.imgs.push(imageUrl);
    }
  }
  fs.writeFileSync("gk-hair-products-updated.json", JSON.stringify(products));
}

async function addGkHairProductsToDb() {
  const products = require("./gk-hair-products-updated.json");
  await connect(mongoUrl);
  for (const product of products) {
    await Product.findOneAndUpdate(
      { product_name: product.product_name },
      product,
      { upsert: true }
    );
    await Brand.findOneAndUpdate(
      { name: product.companyName.name },
      { name: product.companyName.name },
      { upsert: true }
    );
  }
  console.log("done");
  await connection.close();
}

async function main() {
  await addProductsToGoogleSheet();
}

main();
