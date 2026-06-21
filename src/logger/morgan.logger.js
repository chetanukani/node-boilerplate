import morgan from "morgan";
import { env } from "../config/index.js";

const skip = () => env.DISABLE_HTTP_LOGS;

// Use morgan to write to stdout (console). No file transports.
const morganMiddleware = morgan(
  ":remote-addr :method :url :status - :response-time ms",
  {
    skip,
    stream: process.stdout,
  }
);

export default morganMiddleware;
