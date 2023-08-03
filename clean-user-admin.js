const { connect, connection, set } = require("mongoose");
const models = require("./model");
const User = models.User;
const Admin = models.Admin;
const DummyUser = models.DummyUser;
require("dotenv").config();
const NEXT_APP_MONGO_URL = process.env.QWIK_APP_MONGO_CONNECTION;
const Cryptr = require("cryptr");

const cryptr = new Cryptr("myTotallySecretKey");

set("strictQuery", false);
const mongoUrl = NEXT_APP_MONGO_URL || "";
connect(mongoUrl, {
  user: process.env.QWIK_APP_MONGO_USERNAME,
  pass: process.env.QWIK_APP_MONGO_PWD,
})
  .then(() => {
    const seederDb = async () => {
      await User.deleteMany({});
      await DummyUser.deleteMany({});
      await Admin.deleteMany({});
      // Creating a unique salt for a particular user
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
