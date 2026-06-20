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
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      ValidationMessages.RecordNotFound
    );
  }

  req.uploadedFileKeys = [];

  // Check if user has uploaded a main image
  if (!req.files?.media || !req.files?.media.length) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      ValidationMessages.ImageRequired
    );
  }

  // Upload image
  const mediaFiles = await handleMultipleFilesUpload(
    req.files.media,
    "products",
    req
  );

  const product = await ProductService.addProduct({
    name,
    description,
    stock,
    price,
    category,
    media: mediaFiles,
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
