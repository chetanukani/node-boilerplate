import mongoose, { Schema } from "mongoose";
import { TableFields, TableNames } from "../../constants.js";

const appVersionSchema = new Schema(
  {
    [TableFields.platform]: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
      unique: true,
    },
    // semantic version string representing the server's current required version
    [TableFields.version]: {
      type: String,
      required: true,
      default: "0.0.0",
    },
    // when true and client's version < `version`, client must force update
    [TableFields.forceUpdate]: {
      type: Boolean,
      default: false,
    },
    [TableFields.maintenance]: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const AppVersion = mongoose.model(
  TableNames.AppVersion,
  appVersionSchema
);
