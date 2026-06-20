import morgan from "morgan";

// Disable HTTP logs only when explicitly requested
const skip = () => process.env.DISABLE_HTTP_LOGS === "true";

// Use morgan to write to stdout (console). No file transports.
const morganMiddleware = morgan(
  ":remote-addr :method :url :status - :response-time ms",
  {
    skip,
    stream: process.stdout,
  }
);

export default morganMiddleware;
