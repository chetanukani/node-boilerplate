import mongoose, { Schema } from "mongoose";
import { TableFields, TableNames } from "../../constants.js";

const notificationSchema = new Schema(
  {
    [TableFields.user]: {
      type: Schema.Types.ObjectId,
      ref: TableNames.User,
      required: true,
    },
    [TableFields.title]: { type: String },
    [TableFields.message]: { type: String },
    [TableFields.type]: { type: Number, default: null },
    [TableFields.metadata]: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({
  [TableFields.user]: 1,
  [TableFields.createdAt]: -1,
});

export const Notification = mongoose.model(
  TableNames.Notification,
  notificationSchema
);
