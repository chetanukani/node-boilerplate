import {
  ResponseMessages,
  ValidationMessages,
  TableFields,
} from "../../constants.js";
import CategoryService from "../../db/services/category.services.js";
import ProductService from "../../db/services/product.services.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { StatusCodes } from "http-status-codes";
import {
  handleFileUpload,
  handleMultipleFilesUpload,
} from "../../utils/fileUpload.js";

const createProduct = asyncHandler(async (req, res) => {
  const { name, description, category, price, stock } = req.body;

  const categoryToBeAdded = await CategoryService.getCategoryById(category)
    .withName()
    .execute();

  if (!categoryToBeAdded) {
    throw new ApiError(404, ValidationMessages.RecordNotFound);
  }

  req.uploadedFileKeys = [];

  // Check if user has uploaded a main image
  if (!req.files?.mainImage || !req.files?.mainImage.length) {
    throw new ApiError(400, ValidationMessages.ImageRequired);
  }

  // Upload main image
  const mainImageData = await handleFileUpload(
    req.files.mainImage[0],
    "products",
    req
  );

  // Upload sub images
  const subImagesData = req.files.subImages
    ? await handleMultipleFilesUpload(req.files.subImages, "products", req)
    : [];

  const product = await ProductService.addProduct({
    name,
    description,
    stock,
    price,
    mainImage: {
      url: mainImageData.url,
      localPath: mainImageData.localPath,
    },
    subImages: subImagesData.map((img) => ({
      url: img.url,
      localPath: img.localPath,
    })),
    category,
  });

  return res
    .status(StatusCodes.CREATED)
    .json(
      new ApiResponse(
        StatusCodes.CREATED,
        product,
        ResponseMessages.ProductCreatedSuccess
      )
    );
});

export { createProduct };
