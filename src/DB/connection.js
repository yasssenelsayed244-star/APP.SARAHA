import mongoose from "mongoose";

const connectDB = async () => {
  const DB_URI = process.env.MONGODB_URI;

  await mongoose
    .connect(DB_URI)
    .then((conn) => {
      console.log(`Database Connected ${conn.connection.host}`);
    })
    .catch((err) => {
      console.error(`Database Error ${err}`);
    });
};

export default connectDB;
