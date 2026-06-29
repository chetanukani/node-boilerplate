import mongoose, { Schema } from "mongoose";
import { TableFields, TableNames } from "../../constants.js";

const sessionSchema = new Schema(
  {
    [TableFields.user]: {
      type: Schema.Types.ObjectId,
      ref: TableNames.User,
      required: true,
      index: true,
    },
    [TableFields.jti]: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    [TableFields.tokenHash]: { type: String, required: true },
    [TableFields.deviceId]: { type: String },
    [TableFields.ip]: { type: String },
    [TableFields.userAgent]: { type: String },
    [TableFields.revoked]: { type: Boolean, default: false },
    [TableFields.expiresAt]: { type: Date },
  },
  { timestamps: true }
);

export const Session = mongoose.model(TableNames.Session, sessionSchema);
