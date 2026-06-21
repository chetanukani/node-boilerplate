import { Router } from "express";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "../utils/ApiResponse.js";
import { env } from "../config/index.js";

const router = Router();

router.get("/health", (req, res) => {
  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(StatusCodes.OK, { status: "ok" }, "Health check passed")
    );
});

router.get("/ready", (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;

  if (!dbReady) {
    return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
      success: false,
      statusCode: StatusCodes.SERVICE_UNAVAILABLE,
      message: "Database not ready",
      data: { status: "not_ready", database: mongoose.connection.readyState },
      errors: [],
    });
  }

  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        { status: "ready", database: "connected" },
        "Readiness check passed"
      )
    );
});

export default router;
