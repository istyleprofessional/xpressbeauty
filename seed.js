/* eslint-disable @typescript-eslint/no-var-requires */
const final = require("./test_data.json");
const { connect, connection, set } = require("mongoose");
const models = require("./model");
const Product = models.Product;
const User = models.User;
require("dotenv").config();
const NEXT_APP_MONGO_URL = process.env.QWIK_APP_MONGO_CONNECTION;
const Cryptr = require("cryptr");

const cryptr = new Cryptr("myTotallySecretKey");

set("strictQuery", false);
connect(NEXT_APP_MONGO_URL || "")
  .then(() => {
    const seederDb = async () => {
      await Product.deleteMany({});
      await Product.insertMany(
        final.map((item) => {
          delete item["_id"];
          return { ...item };
        })
      );
      await User.deleteMany({});
      // Creating a unique salt for a particular user
      const password = "Xpressbeauty@23";
      const encryptedString = cryptr.encrypt(password);
      await User.insertMany({
        firstName: "admin",
        lastName: "xpressbeauty",
        email: "admin@xpressbeauty.com",
        password: encryptedString,
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
