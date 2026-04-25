import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import type { UserRole } from "@bhutan/shared";

import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../utils/http-error.js";

interface JwtPayload {
  userId: string;
  role: UserRole;
}

export const authenticate = async (request: Request, _response: Response, next: NextFunction) => {
  try {
    const header = request.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      throw new HttpError(401, "Authentication required");
    }

    const token = header.replace("Bearer ", "");
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true
      }
    });

    if (!user) {
      throw new HttpError(401, "User not found");
    }

    request.user = user;
    next();
  } catch (error) {
    next(error instanceof HttpError ? error : new HttpError(401, "Invalid or expired token"));
  }
};

export const requireRoles =
  (...roles: UserRole[]) =>
  (request: Request, _response: Response, next: NextFunction) => {
    if (!request.user) {
      return next(new HttpError(401, "Authentication required"));
    }

    if (!roles.includes(request.user.role)) {
      return next(new HttpError(403, "You do not have permission to access this resource"));
    }

    return next();
  };
