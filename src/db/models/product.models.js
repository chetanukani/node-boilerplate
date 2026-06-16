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
    toJSON: {
      transform: function (doc, ret) {
        attachS3Links(ret);
      },
    },
  }
);

/**
 * @description Attaches S3 URLs to document fields
 */
function attachS3Links(ret) {
  const buildUrl = (localPath) => {
    if (!localPath) return null;
    if (S3Service.isEnabled()) return S3Service.getUrl(localPath);
    return `${process.env.HOST_URL}/images/${localPath}`;
  };

  if (ret[TableFields.mainImage]?.localPath) {
    ret[TableFields.mainImage].url = buildUrl(
      ret[TableFields.mainImage].localPath
    );
  }

  if (ret[TableFields.subImages] && Array.isArray(ret[TableFields.subImages])) {
    ret[TableFields.subImages] = ret[TableFields.subImages].map((image) => ({
      ...image,
      url: buildUrl(image.localPath),
    }));
  }
}

export const Product = mongoose.model(TableNames.Product, productSchema);
