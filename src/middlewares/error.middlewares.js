import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import {
  removeUnusedMulterImageFilesOnError,
  removeUnusedS3FileUploadsOnError,
} from "../utils/helpers.js";
import { ValidationMessages } from "../constants.js";
import { env } from "../config/index.js";

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || (error instanceof mongoose.Error ? 400 : 500);
    const message = error.message || ValidationMessages.SomethingWentWrong;
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  removeUnusedMulterImageFilesOnError(req);
  removeUnusedS3FileUploadsOnError(req);

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    data: null,
    errors: error.errors || [],
    ...(env.NODE_ENV === "development" ? { stack: error.stack } : {}),
  };

  if (req.requestId) {
    res.setHeader("x-request-id", req.requestId);
  }

  return res.status(error.statusCode).json(response);
};

export { errorHandler };
