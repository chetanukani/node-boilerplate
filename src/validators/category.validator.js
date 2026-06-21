import { z } from "zod";
import { mongoIdParamsValidator } from "./common.validator.js";

const categoryBodyValidator = z.object({
  name: z.string().trim().min(1, "Category name is required"),
});

export const createCategoryValidator = z.object({
  body: categoryBodyValidator,
});

export const updateCategoryValidator = z.object({
  params: mongoIdParamsValidator("categoryId"),
  body: categoryBodyValidator,
});

export const categoryIdParamsValidator = z.object({
  params: mongoIdParamsValidator("categoryId"),
});
