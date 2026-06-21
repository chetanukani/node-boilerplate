import mongoose from "mongoose";
import { env } from "../config/index.js";

const registerConnectionEvents = () => {
  mongoose.connection.on("connected", () => {
    console.log(`MongoDB connected! Db host: ${mongoose.connection.host}`);
  });

  mongoose.connection.on("disconnected", () => {
    console.log("MongoDB connection disconnected");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("MongoDB connection re-established");
  });

  mongoose.connection.on("error", (error) => {
    console.error("MongoDB runtime connection error: ", error);
  });
};

const connectDB = async () => {
  try {
    registerConnectionEvents();
    await mongoose.connect(env.MONGODB_URI);
  } catch (error) {
    console.error("MongoDB connection error: ", error);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.connection.close();
};

class MongoUtil {
  static newObjectId() {
    return new mongoose.Types.ObjectId();
  }

  static toObjectId(stringId) {
    return new mongoose.Types.ObjectId(stringId);
  }

  static isValidObjectId(id) {
    return mongoose.isValidObjectId(id);
  }
}

export { disconnectDB, MongoUtil };

export default connectDB;
