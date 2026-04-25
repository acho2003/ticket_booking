import type { AuthUser } from "@bhutan/shared";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
