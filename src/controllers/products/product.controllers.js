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
  handleMultipleFilesUpload,
  attachIndexedFiles,
} from "../../utils/fileUpload.js";

const assertCategoriesExist = async (categoryIds) => {
  const uniqueCategoryIds = [...new Set(categoryIds.map(String))];

  const existingCategories = await CategoryService.getCategoryByIds(
    uniqueCategoryIds
  )
    .withName()
    .execute();

  if (existingCategories.length !== uniqueCategoryIds.length) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      ValidationMessages.RecordNotFound
    );
  }
};

const createProduct = asyncHandler(async (req, res) => {
  const { body, files } = req.validated;
  const { name, description, category, price, stock, tags } = body;

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

  const mediaFiles = await handleMultipleFilesUpload(
    files.media,
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
    ...(tags && { tags }),
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

const bulkCreateProducts = asyncHandler(async (req, res) => {
  const { body, files } = req.validated;
  const { products } = body;

  await assertCategoriesExist(products.map((product) => product.category));

  req.uploadedFileKeys = [];

  const productsToCreate = await attachIndexedFiles({
    items: products,
    files,
    fieldPrefix: "media_",
    folder: "products",
    req,
  });

  const createdProducts = await ProductService.addProducts(productsToCreate);

  return res
    .status(StatusCodes.CREATED)
    .json(
      new ApiResponse(
        StatusCodes.CREATED,
        createdProducts,
        ResponseMessages.ProductsBulkCreatedSuccess
      )
    );
});

export { createProduct, bulkCreateProducts };
