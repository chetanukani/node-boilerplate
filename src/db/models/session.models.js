import mongoose, { Schema } from "mongoose";
import { TableNames } from "../../constants.js";

const sessionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: TableNames.User,
      required: true,
      index: true,
    },
    jti: { type: String, required: true, index: true, unique: true },
    tokenHash: { type: String, required: true },
    deviceId: { type: String },
    ip: { type: String },
    userAgent: { type: String },
    revoked: { type: Boolean, default: false },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

export const Session = mongoose.model("sessions", sessionSchema);
