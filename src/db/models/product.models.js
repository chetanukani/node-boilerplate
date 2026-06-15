import mongoose, { Schema } from "mongoose";
import { TableFields, TableNames } from "../../constants.js";

const productSchema = new Schema(
  {
    [TableFields.category]: {
      ref: TableNames.Category,
      required: true,
      type: Schema.Types.ObjectId,
    },
    [TableFields.description]: {
      required: true,
      type: String,
    },
    [TableFields.mainImage]: {
      required: true,
      type: {
        url: String,
        localPath: String,
      },
    },
    [TableFields.name_]: {
      required: true,
      type: String,
    },
    [TableFields.price]: {
      default: 0,
      type: Number,
    },
    [TableFields.stock]: {
      default: 0,
      type: Number,
    },
    [TableFields.subImages]: {
      type: [
        {
          url: String,
          localPath: String,
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model(TableNames.Product, productSchema);
