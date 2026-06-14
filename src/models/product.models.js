import mongoose, { Schema } from "mongoose";
import { type } from "os";

const productSchema = new Schema(
  {
    category: {
      ref: "Category",
      required: true,
      type: Schema.Types.ObjectId,
    },
    description: {
      required: true,
      type: String,
    },
    mainImage: {
      required: true,
      type: {
        url: String,
        localPath: String,
      },
    },
    name: {
      required: true,
      type: String,
    },
    price: {
      default: 0,
      type: Number,
    },
    stock: {
      default: 0,
      type: Number,
    },
    subImages: {
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

export const Product = mongoose.model("Product", productSchema);
