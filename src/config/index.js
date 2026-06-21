import dotenv from "dotenv";
import { parseEnv } from "./env.validator.js";

dotenv.config({ path: "./.env" });

/** Central typed config — import `env` instead of reading `process.env` directly. */
export const env = parseEnv();

export default env;
