import mongoose, { Schema } from "mongoose";
import { TableNames } from "../../constants.js";

const cmsPageSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: Map,
      of: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const CmsPage = mongoose.model(TableNames.CMSPages, cmsPageSchema);
