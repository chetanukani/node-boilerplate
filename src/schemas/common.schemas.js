import mongoose from "mongoose";
import { z } from "zod";

export const objectIdSchema = (fieldName = "id") =>
  z
    .string()
    .trim()
    .refine((value) => mongoose.Types.ObjectId.isValid(value), {
      message: `Invalid ${fieldName}`,
    });

export const mongoIdParamsSchema = (paramName) =>
  z.object({
    [paramName]: objectIdSchema(paramName),
  });
