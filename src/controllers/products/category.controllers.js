import CategoryService from "../../db/services/category.services.js";
import { ResponseMessages, ValidationMessages } from "../../constants.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { StatusCodes } from "http-status-codes";

const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const category = await CategoryService.addCategory({ name });
  return res
    .status(StatusCodes.CREATED)
    .json(
      new ApiResponse(StatusCodes.CREATED, category, ResponseMessages.CREATED)
    );
});

const listCategories = asyncHandler(async (req, res) => {
  const categories = await CategoryService.listCategory(req.query)
    .withName()
    .withId()
    .execute();
  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(StatusCodes.OK, categories, ResponseMessages.FETCHED)
    );
});

const getCategoryById = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const category = await CategoryService.getCategoryById(categoryId)
    .withName()
    .withId()
    .execute();
  if (!category) {
    throw new ApiError(404, ValidationMessages.RecordNotFound);
  }
  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, category, ResponseMessages.FETCHED));
});

const updateCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const { name } = req.body;
  const category = await CategoryService.updateCategory(categoryId, { name });
  if (!category) {
    throw new ApiError(404, ValidationMessages.RecordNotFound);
  }

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, category, ResponseMessages.UPDATED));
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const category = await CategoryService.deleteCategory(categoryId);

  if (!category) {
    throw new ApiError(404, ValidationMessages.RecordNotFound);
  }

  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        { deletedCategory: category },
        ResponseMessages.DELETED
      )
    );
});

export {
  createCategory,
  listCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
