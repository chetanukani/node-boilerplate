import mongoose, { Schema } from "mongoose";
import { TableFields, TableNames } from "../../constants.js";
import S3Service from "../../utils/s3.js";

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
    [TableFields.media]: [
      {
        [TableFields.url]: String,
        [TableFields.mediaType]: Number,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        attachS3Links(ret);
      },
    },
  }
);

/**
 * @description Attaches URLs to document fields
 */
function attachS3Links(ret) {
  const buildUrl = (url) => {
    if (!url) return null;
    if (S3Service.isEnabled()) return S3Service.getUrl(url);
    return `${process.env.HOST_URL}/files/${url}`;
  };

  if (ret[TableFields.media] && Array.isArray(ret[TableFields.media])) {
    ret[TableFields.media].forEach((ele) => {
      if (ele[TableFields.url]) {
        ele[TableFields.url] = buildUrl(ele[TableFields.url]);
      }
    });
  }
}

export const Product = mongoose.model(TableNames.Product, productSchema);
