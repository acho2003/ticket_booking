import { createRequire } from "node:module";
import type { RequestHandler } from "express";

const require = createRequire(import.meta.url);

type SwaggerUiModule = {
  serve: RequestHandler[];
  setup: (spec: unknown) => RequestHandler;
};

type SwaggerBundle = {
  swaggerUi: SwaggerUiModule;
  swaggerSpec: unknown;
};

let cachedBundle: SwaggerBundle | null | undefined;

export const getSwaggerBundle = (): SwaggerBundle | null => {
  if (cachedBundle !== undefined) {
    return cachedBundle;
  }

  try {
    const swaggerJsdoc = require("swagger-jsdoc") as (options: unknown) => unknown;
    const swaggerUi = require("swagger-ui-express") as SwaggerUiModule;

    const swaggerSpec = swaggerJsdoc({
      definition: {
        openapi: "3.0.3",
        info: {
          title: "Movi API",
          version: "1.0.0",
          description: "REST API for customer booking flows, theatre administration, and super admin operations."
        },
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT"
            }
          }
        },
        security: [{ bearerAuth: [] }]
      },
      apis: ["./src/routes/*.ts"]
    });

    cachedBundle = { swaggerUi, swaggerSpec };
    return cachedBundle;
  } catch (error) {
    const details = error instanceof Error ? error.message : "Unknown error";
    console.warn(`[docs] Swagger docs disabled: ${details}`);
    cachedBundle = null;
    return cachedBundle;
  }
};
