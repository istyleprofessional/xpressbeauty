const json = require("./backups/product-data-5.json");
const fs = require("fs");

// I want to write a fuction that will take in a json file and return a new json file with the following changes:
// 1. Change the key "category" to "categories" array
// 2. Remove the duplicates products by name and push the categories into the categories array

const adjustJsonProductFile = () => {
  const newProduct = {};
  json.forEach((product) => {
    if (!newProduct[product.product_name]) {
      newProduct[product.product_name] = product;
      newProduct[product.product_name].categories = [];
      newProduct[product.product_name].categories.push(product.category);
    } else {
      newProduct[product.product_name].categories.push(product.category);
    }
    delete newProduct[product.product_name]["category"];
  });

  fs.writeFile(
    "./backups/product-data-5.json",
    JSON.stringify(Object.values(newProduct)),
    (err) => {
      if (err) throw err;
      console.log("The file has been saved!");
    }
  );
};
// adjustJsonProductFile();

const adjustJsonPriceType = () => {
  json.forEach((product) => {
    if (product.priceType === "range") {
      const price = product.price.toString().replace("$", "").trim().split("-");
      const salePrice = product.sale_price
        ? product.sale_price.toString().replace("$", "").trim().split("-")
        : "";
      product.sale_price = {
        min: salePrice[0] ? salePrice[0] : "",
        max: salePrice[1] ? salePrice[1] : "",
      };
      product.price = {
        min: price[0],
        max: price[1],
      };
    } else {
      product.priceType = "single";
      const salePrice = product.sale_price ? product.sale_price : "";
      product.sale_price = {
        sale: salePrice.toString().replace("$", "").trim(),
      };
      product.price = {
        regular: product.price.toString().replace("$", "").trim(),
      };
    }
  });
  fs.writeFile("./backups/product-data-6.json", JSON.stringify(json), (err) => {
    if (err) throw err;
    console.log("The file has been saved!");
  });
};

adjustJsonPriceType();
