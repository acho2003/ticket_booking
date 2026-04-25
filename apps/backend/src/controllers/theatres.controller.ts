import type { Request, Response } from "express";

import { theatresService } from "../services/theatres.service.js";
import { getParam } from "../utils/params.js";
import { serialize } from "../utils/serialize.js";

export class TheatresController {
  async list(request: Request, response: Response) {
    const theatres = await theatresService.list(request.query as { city?: string; search?: string });
    response.json({ data: serialize(theatres) });
  }

  async getById(request: Request, response: Response) {
    const theatre = await theatresService.getById(getParam(request.params.id));
    response.json({ data: serialize(theatre) });
  }

  async create(request: Request, response: Response) {
    const theatre = await theatresService.create(request.body);
    response.status(201).json({ data: serialize(theatre) });
  }

  async update(request: Request, response: Response) {
    const theatre = await theatresService.update(getParam(request.params.id), request.body);
    response.json({ data: serialize(theatre) });
  }

  async delete(request: Request, response: Response) {
    await theatresService.delete(getParam(request.params.id));
    response.status(204).send();
  }
}

export const theatresController = new TheatresController();
