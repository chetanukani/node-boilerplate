import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { createServer } from "http";
// import { Server } from "socket.io";
import morganMiddleware from "./logger/morgan.logger.js";
import { ApiError } from "./utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import versionMiddleware from "./middlewares/version.middlewares.js";
import healthRouter from "./routes/health.routes.js";
import { env } from "./config/index.js";
import { initializeSocketIO } from "./socket/index.js";
import { errorHandler } from "./middlewares/error.middlewares.js";
import userRouter from "./routes/user.routes.js";
import adminRouter from "./routes/admin.routes.js";
import categoryRouter from "./routes/category.routes.js";
import productRouter from "./routes/product.routes.js";

const app = express();
const httpServer = createServer(app);

// const io = new Server(httpServer, {
//   pingTimeout: 60000,
//   cors: {
//     origin: env.CORS_ORIGIN,
//     credentials: true,
//   },
// });

//app.set("io", io); // using set method to mount the `io` instance on the app to avoid usage of `global`

if (env.TRUST_PROXY) {
  app.set("trust proxy", 1);
}

app.use(helmet());

app.use(
  cors({
    origin:
      env.CORS_ORIGIN === "*"
        ? "*"
        : env.CORS_ORIGIN.split(",").map((origin) => origin.trim()),
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_, __, ___, options) => {
    throw new ApiError(
      options.statusCode || StatusCodes.TOO_MANY_REQUESTS,
      `There are too many requests. You are only allowed ${options.max} requests per ${options.windowMs / 60000} minutes`
    );
  },
});

app.use(limiter);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(morganMiddleware);

app.use(healthRouter);

app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/products", productRouter);

app.use((req, res, next) => {
  next(
    new ApiError(
      StatusCodes.NOT_FOUND,
      `Route not found: ${req.method} ${req.originalUrl}`
    )
  );
});

//If Socket wants to use uncomment this below line
// initializeSocketIO(io);

app.use(errorHandler);

export { httpServer };
