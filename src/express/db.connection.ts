import mongoose from "mongoose";

export const connect = () => {
  return new Promise((resolve, reject) => {
    // Connecting to the database
    if (
      mongoose.connection.readyState === 1 ||
      mongoose.connection.readyState === 2
    ) {
      resolve(undefined);
    } else {
      const mongoUrl = process.env.QWIK_APP_MONGO_CONNECTION || "";
      mongoose.set("strictQuery", false);
      mongoose
        .connect(mongoUrl)
        .then(() => {
          resolve(undefined);
        })
        .catch(() => {
          reject();
        });
    }
  });
};
