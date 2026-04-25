import type { Request, Response } from "express";

import { moviesService } from "../services/movies.service.js";
import { getParam } from "../utils/params.js";
import { serialize } from "../utils/serialize.js";

export class MoviesController {
  async list(request: Request, response: Response) {
    const movies = await moviesService.list(request.query as { status?: "NOW_SHOWING" | "UPCOMING" | "ENDED"; search?: string });
    response.json({ data: serialize(movies) });
  }

  async getById(request: Request, response: Response) {
    const movie = await moviesService.getById(getParam(request.params.id));
    response.json({ data: serialize(movie) });
  }

  async create(request: Request, response: Response) {
    const movie = await moviesService.create(request.body);
    response.status(201).json({ data: serialize(movie) });
  }

  async update(request: Request, response: Response) {
    const movie = await moviesService.update(getParam(request.params.id), request.body);
    response.json({ data: serialize(movie) });
  }

  async delete(request: Request, response: Response) {
    await moviesService.delete(getParam(request.params.id));
    response.status(204).send();
  }
}

export const moviesController = new MoviesController();
