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
const OpenAI = require("openai");
const DummyUser = models.DummyUser;

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

updateLastProductsQuantity();

async function getProductsFromCanradWebPage() {
  const mainCatUrl = "https://canrad.com/categories";
  const response = await axios.get(mainCatUrl);
  const categories = response.data.Categories;
  const brands = require("./brands.json");
  const categoriesToCheck = brands.map((a) => a.name);

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
  const productsToSave = [];
  for (const category of categories) {
    try {
      if (
        !categoriesToCheck.includes(
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

async function addCosmoOfferToGoogleSheet() {
  const json = require("./cosmo-offers-final-2.json");
  const auth = new JWT({
    email: process.env.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "",
    key: process.env.VITE_GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n") ?? "",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const doc = new GoogleSpreadsheet(
    "1m6vciiNYUJoGaDAlxJqsAF_IMjqMftjWa838dbhrmJc",
    auth
  );
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];
  const rows = [];
  for (const offer of json) {
    for (const product of offer.products) {
      const row = {};
      if (product.variation_type === "Single") {
        row["Product Name"] = product.name;
        row["Brand"] = product.brand;
        row["Product Price"] = product.price;
        row["Product Sale Price"] = product.sale_price;
        row["Product Quantity"] = product.quantity_on_hand;
        row["UPC"] = product.upc;
        row["Item ID"] = product.id;
        row["Image"] = `=image("${product.image}", 1)`;
        row["offer name"] = offer.name;
        rows.push(row);
      } else {
        for (const variation of product.variations) {
          // download image and save it in a folder

          row[
            "Product Name"
          ] = `${variation.name} - ${variation.variation_name}`;
          row["Brand"] = product.brand;
          row["Product Price"] = variation.price;
          row["Product Sale Price"] = variation.sale_price;
          row["Product Quantity"] = variation.quantity_on_hand;
          row["UPC"] = variation.upc;
          row["Item ID"] = variation.variation_id;
          row["Image"] = `=image("${variation.variation_image}", 1)`;
          row["offer name"] = offer.name;
          rows.push(row);
        }
      }
    }
  }

  // check if there is a duplicate product in the rows by product name
  const unique = [];
  const uniqueRows = [];
  for (const row of rows) {
    if (!unique.includes(row["Product Name"])) {
      if (row["Product Quantity"] < 10) continue;
      unique.push(row["Product Name"]);
      uniqueRows.push(row);
    }
  }
  for (const row of uniqueRows) {
    // replace =image() with the image url
    try {
      const imageName = row["Product Name"]
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/ /g, "+");
      const fileName = `https://salonbrandz.s3.ca-central-1.amazonaws.com/imageFolder/${imageName}.jpg`;
      row["Image"] = `=image("${fileName}", 1)`;
      row["Image Link"] = fileName;
    } catch (error) {
      continue;
    }
  }
  // increase row height to 100
  console.log(rows.length, uniqueRows.length);
  // delete all data from the sheet
  await sheet.clear();
  // add Headers to the sheet
  const headers = Object.keys(uniqueRows[0]);
  await sheet.setHeaderRow(headers);

  // add products to the sheet
  await sheet.addRows(uniqueRows);
  console.log("done");
}

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
            title: `${
              product.product_name?.includes("CR")
                ? product.product_name?.replace(/CR.*/, "")
                : product.product_name ?? ""
            } - ${variant?.variation_name}`,
            description: product?.description ?? "",
            link: `https://xpressbeauty.ca/products/${product.perfix}`,
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
          oldRow.price = `${product?.price?.regular} CAD` ?? "0";
          oldRow.shipping_label = "";
          oldRow.gtin =
            product?.gtin !== "" ? product?.gtin : oldRow?.gtin ?? "";
          oldRow["identifier exists"] =
            product?.gtin || oldRow?.gtin ? "yes" : "no";
          oldRow.availability =
            parseInt(product?.quantity_on_hand?.toString() ?? "0") > 0
              ? "in_stock"
              : "out_of_stock";
          oldRow.link = `https://xpressbeauty.ca/products/${product.perfix}`;
          newArray.push(oldRow);
        } else {
          const newRow = {
            id: product._id.toString(),
            title: product.product_name?.includes("CR")
              ? product.product_name?.replace(/CR.*/, "")
              : product.product_name ?? "",
            description: product?.description ?? "",
            link: `https://xpressbeauty.ca/products/${product.perfix}`,
            "image link": product?.imgs[0].includes("http")
              ? product?.imgs[0]
              : `https://xpressbeauty.ca${product?.imgs[0].replace(".", "")}`,
            availability:
              parseInt(product?.quantity_on_hand?.toString() ?? "0") > 0
                ? "in_stock"
                : "out_of_stock",
            price: `${product?.price?.regular} CAD` ?? "0",
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
// addProductsToGoogleSheet();

async function addFakeReviews() {
  await connect(mongoUrl);
  const orders = await Order.find({});
  // find all products in the orders
  const products = [];
  for (const order of orders) {
    for (const item of order.products) {
      const productFromDb = await Product.findOne({
        _id: item.id.includes(".") ? item.id.split(".")[0] : item.id,
      });
      if (productFromDb) {
        // check if the product is already in the products array
        if (
          !products.find((p) => p.product_name === productFromDb.product_name)
        ) {
          products.push(productFromDb);
        }
      }
    }
  }
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
  await connect(mongoUrl);
  const rows = await sheet.getRows();
  for (const row of rows) {
    try {
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
    } catch (error) {
      console.log(error.message);
      continue;
    }
  }
  console.log("done");
  await connection.close();
}

// updateCanardProducts();

async function dumpAllUnkownCartAndUsers() {
  await connect(mongoUrl);
  const users = await User.find({});
  const dummyUsers = await DummyUser.find({});
  if (users.length > 0) {
    for (const user of users) {
      if (!(user.firstName && user.lastName && user.phoneNumber)) {
        await User.findByIdAndDelete(user._id);
      }
    }
  }
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
        await User.findByIdAndDelete(dummyUser._id);
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
            The product name is ${
              product.product_name
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
