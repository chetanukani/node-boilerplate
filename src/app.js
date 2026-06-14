import cookieParser from "cookie-parser";
import cors from 'cors'
import express from "express";
import { rateLimit } from 'express-rate-limit';
import session from "express-session";
import fs from 'fs';
import { createServer } from 'http';
import path from "path";
import passport from "passport";
import requestIp from "request-ip";
import { Server } from 'socket.io';
import swaggerUi from "swagger-ui-express";
import { fileURLToPath } from "url";
import YAML from "yaml";
import { DB_NAME } from "./constants.js";
import { dbInstance } from "./db/index.js";
import morganMiddleware from "./logger/morgan.logger.js";
// import { initializeSocketIO } from "./socket/index.js";
import { ApiError } from "./utils/ApiError.js";
import { ApiResponse } from "./utils/ApiResponse.js";
import { asyncHandler } from "./utils/asyncHandler.js";
import logger from "./logger/winston.logger.js";

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    },
})

// using set method to mount the `io` instance on the app to avoid usage of `global`
app.set("io", io);

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

app.use(requestIp.mw())

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
            `There are too many requests. You are only allowed ${options.max
            } requests per ${options.windowMs / 60000} minutes`
        );
    },
});

// Apply the rate limiting middleware to all requests
app.use(limiter);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public")); // configure static file to save images locally
app.use(cookieParser());

// required for passport
app.use(
    session({
        secret: process.env.EXPRESS_SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
    })
); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

app.use(morganMiddleware);

// api routes
import { errorHandler } from "./middlewares/error.middlewares.js";
import userRouter from './routes/user.routes.js'

// * Root health check so that hitting "/" reports service health
app.get("/", (req, res) => {
    return res.status(200).json(new ApiResponse(200, "OK", "Health check passed"));
});



// * App apis
app.use("/api/v1/users", userRouter);


// "Route not found" catch-all for any request that did not match a route above.
// Placed after all routes and Swagger so unmatched paths return a consistent JSON
// error via the central error handler instead of Express's default "Cannot GET".
app.use((req, res, next) => {
    next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
});

// common error handling middleware
app.use(errorHandler);

export { httpServer };