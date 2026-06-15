import mongoose from "mongoose";
import logger from "../logger/winston.logger.js";

const registerConnectionEvents = () => {
  mongoose.connection.on("connected", () => {
    logger.info(`MongoDB connected! Db host: ${mongoose.connection.host}`);
  });

  mongoose.connection.on("disconnected", () => {
    logger.info("MongoDB connection disconnected");
  });

  mongoose.connection.on("reconnected", () => {
    logger.info("MongoDB connection re-established");
  });

  mongoose.connection.on("error", (error) => {
    logger.error("MongoDB runtime connection error: ", error);
  });
};

const connectDB = async () => {
  try {
    registerConnectionEvents();
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    logger.error("MongoDB connection error: ", error);
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
