import "./config/index.js";
import { httpServer } from "./app.js";
import connectDB, { disconnectDB } from "./db/index.js";
import { env } from "./config/index.js";

const startServer = () => {
  httpServer.listen(env.PORT, () => {
    console.log(`⚙️  Server is running on port: ${env.PORT}`);
  });

  httpServer.on("error", (err) => {
    console.error("HTTP server error: ", err);
    process.exit(1);
  });
};

const gracefulShutdown = (signalOrError, exitCode = 0) => {
  console.log(`Shutting down server (${signalOrError})...`);
  httpServer.close(async () => {
    console.log("HTTP server closed.");
    try {
      await disconnectDB();
    } catch (err) {
      console.error("MongoDB disconnect error: ", err);
    }
    process.exit(exitCode);
  });

  setTimeout(() => {
    console.error("Could not close connections in time, forcing shutdown.");
    process.exit(exitCode);
  }, 10000).unref();
};

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception: ", err);
  gracefulShutdown("uncaughtException", 1);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection: ", reason);
  gracefulShutdown("unhandledRejection", 1);
});

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => gracefulShutdown(signal, 0));
});

try {
  await connectDB();
  startServer();
} catch (err) {
  console.error("Mongo db connect error: ", err);
  process.exit(1);
}
