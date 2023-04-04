import mongoose from "mongoose";

export const connect = () => {
  return new Promise((resolve, reject) => {
    // Connecting to the database
    if (
      mongoose.connection.readyState === 1 ||
      mongoose.connection.readyState === 2
    ) {
      console.log("already connected");
      resolve(undefined);
    } else {
      const mongoUrl = process.env.QWIK_APP_MONGO_CONNECTION || "";
      mongoose.set("strictQuery", false);
      mongoose
        .connect(mongoUrl)
        .then(() => {
          console.log("Connected to Database");
          resolve(undefined);
        })
        .catch((err) => {
          console.log(mongoUrl);
          reject();
          console.log("Not Connected to Database ERROR! ", err);
        });
    }
  });
};
