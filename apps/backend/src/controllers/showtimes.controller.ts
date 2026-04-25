import type { Request, Response } from "express";

import { showtimesService } from "../services/showtimes.service.js";
import { getParam } from "../utils/params.js";
import { serialize } from "../utils/serialize.js";

export class ShowtimesController {
  async list(request: Request, response: Response) {
    const showtimes = await showtimesService.list(request.query as { movieId?: string; theatreId?: string; date?: string });
    response.json({ data: serialize(showtimes) });
  }

  async getById(request: Request, response: Response) {
    const showtime = await showtimesService.getById(getParam(request.params.id));
    response.json({ data: serialize(showtime) });
  }

  async getByMovie(request: Request, response: Response) {
    const showtimes = await showtimesService.getByMovie(getParam(request.params.movieId), request.query as { theatreId?: string; date?: string });
    response.json({ data: serialize(showtimes) });
  }

  async create(request: Request, response: Response) {
    const showtime = await showtimesService.create(request.user!, request.body);
    response.status(201).json({ data: serialize(showtime) });
  }

  async update(request: Request, response: Response) {
    const showtime = await showtimesService.update(request.user!, getParam(request.params.id), request.body);
    response.json({ data: serialize(showtime) });
  }

  async delete(request: Request, response: Response) {
    await showtimesService.delete(request.user!, getParam(request.params.id));
    response.status(204).send();
  }
}

export const showtimesController = new ShowtimesController();
