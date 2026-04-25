import type { Request, Response } from "express";

import { usersService } from "../services/users.service.js";
import { serialize } from "../utils/serialize.js";

export class UsersController {
  async overview(request: Request, response: Response) {
    const result = await usersService.getDashboardOverview(request.user!);
    response.json({ data: serialize(result) });
  }

  async listTheatreAdmins(request: Request, response: Response) {
    const result = await usersService.listTheatreAdmins(request.user!);
    response.json({ data: serialize(result) });
  }

  async createTheatreAdmin(request: Request, response: Response) {
    const result = await usersService.createTheatreAdmin(request.user!, request.body);
    response.status(201).json({ data: serialize(result) });
  }
}

export const usersController = new UsersController();
