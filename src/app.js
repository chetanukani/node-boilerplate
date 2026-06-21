import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import { createServer } from "http";
import { Server } from "socket.io";
import morganMiddleware from "./logger/morgan.logger.js";
import { ApiError } from "./utils/ApiError.js";
import { ApiResponse } from "./utils/ApiResponse.js";
import { StatusCodes } from "http-status-codes";
import versionMiddleware from "./middlewares/version.middlewares.js";
import appVersionRouter from "./routes/appVersion.routes.js";
// import { initializeSocketIO } from "./socket/index.js";

const app = express();
const httpServer = createServer(app);

// const io = new Server(httpServer, {
//   pingTimeout: 60000,
//   cors: {
//     origin: process.env.CORS_ORIGIN,
//     credentials: true,
//   },
// });

// using set method to mount the `io` instance on the app to avoid usage of `global`
// app.set("io", io);

// global middlewares
app.use(
  cors({
    origin:
      process.env.CORS_ORIGIN === "*"
        ? "*" // This might give CORS error for some origins due to credentials set to true
        : process.env.CORS_ORIGIN?.split(","),
    credentials: true,
  })
);

// Rate limiter to avoid misuse of the service and avoid cost spikes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Limit each IP to 500 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // keyGenerator: (req, res) => {
  //     return req.clientIp; // IP address from requestIp.mw(), as opposed to req.ip
  // },
  handler: (_, __, ___, options) => {
    throw new ApiError(
      options.statusCode || 500,
      `There are too many requests. You are only allowed ${
        options.max
      } requests per ${options.windowMs / 60000} minutes`
    );
  },
});

// Apply the rate limiting middleware to all requests
app.use(limiter);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(express.static("public")); // configure static file to save images locally
app.use(cookieParser());

app.use(morganMiddleware);

// api routes
import { errorHandler } from "./middlewares/error.middlewares.js";
import userRouter from "./routes/user.routes.js";
import categoryRouter from "./routes/category.routes.js";
import productRouter from "./routes/product.routes.js";

// * Root health check so that hitting "/" reports service health
app.get("/", (req, res) => {
  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, "OK", "Health check passed"));
});

// * App apis
// Admin / management endpoints for app version config (mounted before version checks)
app.use("/api/v1/app-versions", appVersionRouter);

// Version check for mobile apps (applies to all /api/v1 routes)
app.use("/api/v1", versionMiddleware);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/products", productRouter);

// * SocketIo Initialization
// initializeSocketIO(io);

// "Route not found" catch-all for any request that did not match a route above.
// Placed after all routes and Swagger so unmatched paths return a consistent JSON
// error via the central error handler instead of Express's default "Cannot GET".
app.use((req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
});

// common error handling middleware
app.use(errorHandler);

export { httpServer };
