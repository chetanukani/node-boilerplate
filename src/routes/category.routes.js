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
  categoryIdParamsSchema,
  createCategorySchema,
  updateCategorySchema,
} from "../schemas/category.schemas.js";

const router = Router();

router
  .route("/")
  .post(validateRequest(createCategorySchema), createCategory)
  .get(listCategories);

router
  .route("/:categoryId")
  .get(validateRequest(categoryIdParamsSchema), getCategoryById)
  .patch(validateRequest(updateCategorySchema), updateCategory)
  .delete(validateRequest(categoryIdParamsSchema), deleteCategory);

export default router;
