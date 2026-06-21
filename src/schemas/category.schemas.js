import { z } from "zod";
import { mongoIdParamsSchema } from "./common.schemas.js";

const categoryBodySchema = z.object({
  name: z.string().trim().min(1, "Category name is required"),
});

export const createCategorySchema = z.object({
  body: categoryBodySchema,
});

export const updateCategorySchema = z.object({
  params: mongoIdParamsSchema("categoryId"),
  body: categoryBodySchema,
});

export const categoryIdParamsSchema = z.object({
  params: mongoIdParamsSchema("categoryId"),
});
