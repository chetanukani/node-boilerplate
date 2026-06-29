import mongoose, { Schema } from "mongoose";
import { TableFields, TableNames } from "../../constants.js";

const cmsPageSchema = new Schema(
  {
    [TableFields.slug]: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    [TableFields.title]: {
      type: String,
      required: true,
      trim: true,
    },
    [TableFields.content]: {
      type: Map,
      of: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const CmsPage = mongoose.model(TableNames.CMSPages, cmsPageSchema);
