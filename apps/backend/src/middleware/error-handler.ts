import type { NextFunction, Request, Response } from "express";

import { HttpError } from "../utils/http-error.js";
import { getDatabaseErrorResponse } from "../utils/prisma-errors.js";

export const notFoundHandler = (_request: Request, _response: Response, next: NextFunction) => {
  next(new HttpError(404, "Route not found"));
};

export const errorHandler = (error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  if (error instanceof HttpError) {
    return response.status(error.statusCode).json({
      error: {
        message: error.message,
        details: error.details
      }
    });
  }

  const databaseError = getDatabaseErrorResponse(error);
  if (databaseError) {
    return response.status(databaseError.statusCode).json({
      error: databaseError.body
    });
  }

  console.error(error);

  return response.status(500).json({
    error: {
      message: "Internal server error"
    }
  });
};
