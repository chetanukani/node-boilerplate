import mongoose, { Schema } from "mongoose";
import { TableFields, TableNames } from "../../constants.js";

const categorySchema = new Schema(
  {
    [TableFields.name_]: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

export const Category = mongoose.model(TableNames.Category, categorySchema);
