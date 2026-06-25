import { z } from "zod";
import { formatZodErrors } from "../utils/formatZodErrors.js";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(8080),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  ACCESS_TOKEN_SECRET: z.string().min(1, "ACCESS_TOKEN_SECRET is required"),
  REFRESH_TOKEN_SECRET: z.string().min(1, "REFRESH_TOKEN_SECRET is required"),
  ACCESS_TOKEN_EXPIRY: z.string().default("1d"),
  REFRESH_TOKEN_EXPIRY: z.string().default("10d"),
  REFRESH_TOKEN_EXPIRY_MS: z.coerce.number().optional(),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  HOST_URL: z.string().default("http://localhost:8080"),
  FRONTEND_URL: z.string().optional(),
  EXPRESS_SESSION_SECRET: z.string().optional(),
  TRUST_PROXY: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  DISABLE_HTTP_LOGS: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  USE_S3: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  AWS_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET_NAME: z.string().optional(),
  AWS_S3_ENDPOINT: z.string().optional(),
  AWS_S3_FORCE_PATH_STYLE: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_SENDER_NAME: z.string().default("Node Boilerplate"),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  APP_VERSION_CACHE_TTL_SECONDS: z.coerce.number().default(30),
  ENABLE_CRON: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  CRON_TIMEZONE: z.string().default("UTC"),
  CRON_CLEANUP_EXPIRED_SESSIONS_ENABLED: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  CRON_CLEANUP_EXPIRED_SESSIONS_SCHEDULE: z.string().default("0 * * * *"),
  ENABLE_STRIPE: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_DEFAULT_CURRENCY: z.string().default("usd"),
  STRIPE_CHECKOUT_SUCCESS_URL: z.string().optional(),
  STRIPE_CHECKOUT_CANCEL_URL: z.string().optional(),
});

export const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Invalid environment variables:");
    console.error(formatZodErrors(result.error));
    process.exit(1);
  }

  return result.data;
};
