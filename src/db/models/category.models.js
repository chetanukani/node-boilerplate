import mongoose, { Schema } from "mongoose";
import { TableFields, TableNames } from "../../constants.js";
import S3Service from "../../utils/s3.js";

const categorySchema = new Schema(
  {
    [TableFields.name_]: {
      type: String,
      required: true,
      unique: true,
    },
    [TableFields.image]: {
      type: {
        url: String,
        localPath: String,
      },
      default: null,
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

function attachS3Links(ret) {
  const buildUrl = (localPath) => {
    if (!localPath) return null;
    if (S3Service.isEnabled()) return S3Service.getUrl(localPath);
    return `${process.env.HOST_URL}/images/${localPath}`;
  };

  if (ret[TableFields.image]?.localPath) {
    ret[TableFields.image].url = buildUrl(ret[TableFields.image].localPath);
  }
}

export const Category = mongoose.model(TableNames.Category, categorySchema);
