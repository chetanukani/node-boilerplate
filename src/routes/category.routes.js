import { Router } from "express";
import {
  createCategory,
  listCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/products/category.controllers.js";
import { validateRequest } from "../middlewares/zodValidate.middleware.js";
import {
  categoryIdParamsValidator,
  createCategoryValidator,
  updateCategoryValidator,
} from "../validators/category.validator.js";

const router = Router();

router
  .route("/")
  .post(validateRequest(createCategoryValidator), createCategory)
  .get(listCategories);

router
  .route("/:categoryId")
  .get(validateRequest(categoryIdParamsValidator), getCategoryById)
  .patch(validateRequest(updateCategoryValidator), updateCategory)
  .delete(validateRequest(categoryIdParamsValidator), deleteCategory);

export default router;
