import type { Request, Response } from "express";

import { authService } from "../services/auth.service.js";
import { serialize } from "../utils/serialize.js";

export class AuthController {
  async register(request: Request, response: Response) {
    const result = await authService.register(request.body);
    response.status(201).json({ data: serialize(result) });
  }

  async login(request: Request, response: Response) {
    const result = await authService.login(request.body);
    response.json({ data: serialize(result) });
  }

  async me(request: Request, response: Response) {
    response.json({ data: serialize(request.user) });
  }
}

export const authController = new AuthController();
