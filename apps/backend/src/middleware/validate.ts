import type { NextFunction, Request, Response } from "express";
import type { AnyZodObject } from "zod";

import { HttpError } from "../utils/http-error.js";

export const validate =
  (schema: AnyZodObject) => (request: Request, _response: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: request.body ?? {},
      query: request.query ?? {},
      params: request.params ?? {}
    });

    if (!result.success) {
      return next(
        new HttpError(400, "Validation failed", result.error.flatten())
      );
    }

    request.body = result.data.body;
    request.query = result.data.query;
    request.params = result.data.params;

    return next();
  };
