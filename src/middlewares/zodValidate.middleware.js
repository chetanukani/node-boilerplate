import { StatusCodes } from "http-status-codes";
import { ValidationMessages } from "../constants.js";
import { ApiError } from "../utils/ApiError.js";
import { formatZodErrors } from "../utils/formatZodErrors.js";
import { normalizeFormBody } from "../utils/parseFormBody.js";

/**
 * Generic request validator — works for any module.
 * Runs after route-level multer when the route accepts multipart/form-data.
 *
 * @template T
 * @param {import("zod").ZodSchema<T>} validator
 * @returns {import("express").RequestHandler}
 */
export const validateRequest = (validator) => (req, res, next) => {
  const result = validator.safeParse({
    body: normalizeFormBody(req.body),
    query: req.query,
    params: req.params,
    files: req.files,
  });

  if (!result.success) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      ValidationMessages.InvalidData,
      formatZodErrors(result.error)
    );
  }

  req.validated = result.data;
  next();
};
