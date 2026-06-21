import mongoose from "mongoose";
import { z } from "zod";
import {
  coerceBooleanValue,
  coerceJsonFormField,
} from "../utils/parseFormBody.js";

export const objectIdValidator = (fieldName = "id") =>
  z
    .string()
    .trim()
    .refine((value) => mongoose.Types.ObjectId.isValid(value), {
      message: `Invalid ${fieldName}`,
    });

export const mongoIdParamsValidator = (paramName) =>
  z.object({
    [paramName]: objectIdValidator(paramName),
  });

/** Accepts boolean or form-data strings "true" / "false" */
export const booleanValidator = (message = "Must be a boolean") =>
  z.preprocess(coerceBooleanValue, z.boolean({ message }));

/**
 * Nested object field — accepts:
 * - bracket notation: tags[name]=A&tags[description]=B (multer → object)
 * - JSON string: tags='{"name":"A","description":"B"}'
 * - plain object (application/json)
 */
export const nestedObjectValidator = (shape) =>
  z.preprocess((value) => {
    if (typeof value === "string") {
      return coerceJsonFormField(value);
    }

    return value;
  }, shape);
