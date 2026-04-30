import cors from "cors";
import express from "express";
import morgan from "morgan";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { registerRoutes } from "./routes/index.js";
import { getDatabaseErrorResponse } from "./utils/prisma-errors.js";

const require = createRequire(import.meta.url);
const helmet = require("helmet");

const parseCorsOrigins = (value?: string) =>
  value
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];

export const createApp = () => {
  const app = express();
  const allowedOrigins = parseCorsOrigins(env.CORS_ORIGIN);
  const uploadDirectory = path.resolve(env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads"));

  fs.mkdirSync(uploadDirectory, { recursive: true });

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }
    })
  );
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error(`CORS blocked origin: ${origin}`));
      },
      credentials: true
    })
  );
  app.use(express.json({ limit: "5mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));
  app.use("/uploads", express.static(uploadDirectory));

  app.get("/health", (_request, response) => {
    response.json({
      data: {
        name: "Movi API",
        status: "ok",
        timestamp: new Date().toISOString()
      }
    });
  });

  app.get("/health/db", async (_request, response) => {
    try {
      await prisma.$queryRaw`SELECT 1`;

      response.json({
        data: {
          name: "Movi Database",
          status: "ok",
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      const databaseError = getDatabaseErrorResponse(error);

      response.status(databaseError?.statusCode ?? 503).json({
        error: databaseError?.body ?? {
          message: "Database health check failed",
          code: "DATABASE_HEALTH_CHECK_FAILED"
        }
      });
    }
  });

  registerRoutes(app);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
