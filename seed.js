/* eslint-disable @typescript-eslint/no-var-requires */
const final = require("./backups/file-7.json");
const { connect, connection, set } = require("mongoose");
const models = require("./model");
const Product = models.Product;
const Brand = models.Brand;
const Cart = models.Cart;
const Category = models.Category;
const categories = require("./backups/categories.json");
const brand_data = require("./backups/brands.json");
const Admin = models.Admin;
require("dotenv").config();
const NEXT_APP_MONGO_URL = process.env.VITE_QWIK_APP_MONGO_CONNECTION;
const Cryptr = require("cryptr");

const cryptr = new Cryptr(process.env.VITE_SECRET ?? "");

set("strictQuery", false);
const mongoUrl = NEXT_APP_MONGO_URL || "";
connect(mongoUrl, {
  // user: process.env.QWIK_APP_MONGO_USERNAME,
  // pass: process.env.QWIK_APP_MONGO_PWD,
})
  .then(() => {
    const seederDb = async () => {
      await Product.deleteMany({});
      await Product.insertMany(
        final.map((item) => {
          delete item["_id"];
          item.updatedAt = new Date(
            item.updatedAt ? item.updatedAt.$date : Date.now()
          );
          item.createdAt = new Date(
            item.createdAt ? item.createdAt.$date : Date.now()
          );
          return { ...item };
        })
      );
      await connection.db.dropCollection("carts");
      await connection.db.dropCollection("users");
      await Brand.deleteMany({});
      await Brand.insertMany(
        brand_data.map((item) => {
          return {
            name: item,
          };
        })
      );
      await Category.deleteMany({});
      await Category.insertMany(
        categories.map((item) => {
          return {
            name: item.name,
            main: item.main,
          };
        })
      );
      const password = "Xpressbeauty@23";
      const password_1 = "Xpressbeauty@21";
      const password_2 = "Xpressbeauty@22";
      const encryptedString = cryptr.encrypt(password);
      const encryptedString_1 = cryptr.encrypt(password_1);
      const encryptedString_2 = cryptr.encrypt(password_2);
      await Admin.insertMany({
        firstName: "admin",
        lastName: "xpressbeauty",
        email: "admin@xpressbeauty.com",
        password: encryptedString,
        role: "a",
      });
      await Admin.insertMany({
        firstName: "admin_1",
        lastName: "xpressbeauty",
        email: "admin@xpressbeauty_1.com",
        password: encryptedString_1,
        role: "a",
      });
      await Admin.insertMany({
        firstName: "admin_2",
        lastName: "xpressbeauty",
        email: "admin@xpressbeauty_2.com",
        password: encryptedString_2,
        role: "a",
      });
    };
    seederDb()
      .then(() => {
        connection.close();
        console.log("success");
      })
      .catch((err) => {
        connection.close();
        console.log(`The error: ${err}`);
      });
  })
  .catch((err) => {
    console.log("Not Connected to Database ERROR! ", err);
  });
