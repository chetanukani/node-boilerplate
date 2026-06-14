import dotenv from "dotenv";
import { httpServer } from "./app.js";
import connectDB, { disconnectDB } from "./db/index.js";
import logger from "./logger/winston.logger.js";

dotenv.config({ path: "./.env" });

const startServer = () => {
  httpServer.listen(process.env.PORT || 8080, () => {
    logger.info("⚙️  Server is running on port: " + process.env.PORT);
  });

  // Prevent a crash on listen errors such as the port being already in use
  httpServer.on("error", (err) => {
    logger.error("HTTP server error: ", err);
    process.exit(1);
  });
};

/**
 * Gracefully shut down: stop accepting new connections, then exit.
 * Acts as a last-resort safety net so the process does not stay in a
 * corrupted state after a fatal error.
 */
const gracefulShutdown = (signalOrError, exitCode = 0) => {
  logger.info(`Shutting down server (${signalOrError})...`);
  httpServer.close(async () => {
    logger.info("HTTP server closed.");
    try {
      await disconnectDB();
    } catch (err) {
      logger.error("MongoDB disconnect error: ", err);
    }
    process.exit(exitCode);
  });

  // Force-exit if connections do not close within 10 seconds
  setTimeout(() => {
    logger.error("Could not close connections in time, forcing shutdown.");
    process.exit(exitCode);
  }, 10000).unref();
};

// Last-resort process-level safety nets to avoid silent crashes
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception: ", err);
  gracefulShutdown("uncaughtException", 1);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection: ", reason);
  gracefulShutdown("unhandledRejection", 1);
});

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => gracefulShutdown(signal, 0));
});

try {
  await connectDB();
  startServer();
} catch (err) {
  logger.error("Mongo db connect error: ", err);
}
