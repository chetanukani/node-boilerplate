import mongoose, { Schema } from "mongoose";

const appVersionSchema = new Schema(
  {
    platform: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
      unique: true,
    },
    // semantic version string representing the server's current required version
    version: {
      type: String,
      required: true,
      default: "0.0.0",
    },
    // when true and client's version < `version`, client must force update
    forceUpdate: {
      type: Boolean,
      default: false,
    },
    maintenance: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const AppVersion = mongoose.model("app_versions", appVersionSchema);
