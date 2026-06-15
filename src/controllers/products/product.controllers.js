import { ResponseMessages, ValidationMessages } from "../../constants.js";
import CategoryService from "../../db/services/category.services.js";
import ProductService from "../../db/services/product.services.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  getLocalPath,
  getStaticFilePath,
  removeLocalFile,
} from "../../utils/helpers.js";

const createProduct = asyncHandler(async (req, res) => {
  const { name, description, category, price, stock } = req.body;

  const categoryToBeAdded = await CategoryService.getCategoryById(category)
    .withName()
    .execute();

  if (!categoryToBeAdded) {
    throw new ApiError(404, ValidationMessages.RecordNotFound);
  }

  // Check if user has uploaded a main image
  if (!req.files?.mainImage || !req.files?.mainImage.length) {
    throw new ApiError(400, ValidationMessages.ImageRequired);
  }

  const mainImageUrl = getStaticFilePath(
    req,
    req.files?.mainImage[0]?.filename
  );
  const mainImageLocalPath = getLocalPath(req.files?.mainImage[0]?.filename);

  // Check if user has uploaded any subImages if yes then extract the file path
  // else assign an empty array
  /**
   * @type {{ url: string; localPath: string; }[]}
   */
  const subImages =
    req.files.subImages && req.files.subImages?.length
      ? req.files.subImages.map((image) => {
          const imageUrl = getStaticFilePath(req, image.filename);
          const imageLocalPath = getLocalPath(image.filename);
          return { url: imageUrl, localPath: imageLocalPath };
        })
      : [];

  const product = await ProductService.addProduct({
    name,
    description,
    stock,
    price,
    mainImage: {
      url: mainImageUrl,
      localPath: mainImageLocalPath,
    },
    subImages,
    category,
  });
  return res
    .status(201)
    .json(
      new ApiResponse(201, product, ResponseMessages.ProductCreatedSuccess)
    );
});

export { createProduct };
