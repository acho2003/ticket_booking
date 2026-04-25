import type { Request, Response } from "express";

import { screensService } from "../services/screens.service.js";
import { getParam } from "../utils/params.js";
import { serialize } from "../utils/serialize.js";

export class ScreensController {
  async listByTheatre(request: Request, response: Response) {
    const screens = await screensService.listByTheatre(request.user!, getParam(request.params.theatreId));
    response.json({ data: serialize(screens) });
  }

  async create(request: Request, response: Response) {
    const screen = await screensService.create(request.user!, getParam(request.params.theatreId), request.body);
    response.status(201).json({ data: serialize(screen) });
  }

  async update(request: Request, response: Response) {
    const screen = await screensService.update(request.user!, getParam(request.params.screenId), request.body);
    response.json({ data: serialize(screen) });
  }

  async delete(request: Request, response: Response) {
    await screensService.delete(request.user!, getParam(request.params.screenId));
    response.status(204).send();
  }

  async generateSeats(request: Request, response: Response) {
    const seats = await screensService.generateSeats(request.user!, getParam(request.params.screenId), request.body);
    response.json({ data: serialize(seats) });
  }
}

export const screensController = new ScreensController();
