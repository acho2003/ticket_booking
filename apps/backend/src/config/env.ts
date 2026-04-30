import "dotenv/config";
import { z } from "zod";

const resolvedNodeEnv = process.env.NODE_ENV ?? "development";
const resolvedJwtSecret =
  process.env.JWT_SECRET ??
  (resolvedNodeEnv === "development" ? "dev-only-jwt-secret-change-me" : undefined);

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(8),
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  CORS_ORIGIN: z.string().optional(),
  PUBLIC_API_URL: z.string().url().optional(),
  UPLOAD_DIR: z.string().optional()
});

export const env = envSchema.parse({
  ...process.env,
  NODE_ENV: resolvedNodeEnv,
  JWT_SECRET: resolvedJwtSecret
});

if (resolvedNodeEnv === "development" && !process.env.JWT_SECRET) {
  console.warn("[config] JWT_SECRET was not set. Using a development fallback secret.");
}
