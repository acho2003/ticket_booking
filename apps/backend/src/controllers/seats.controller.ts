import type { Request, Response } from "express";

import { seatsService } from "../services/seats.service.js";
import { getParam } from "../utils/params.js";
import { serialize } from "../utils/serialize.js";

export class SeatsController {
  async getScreenSeats(request: Request, response: Response) {
    const seats = await seatsService.getScreenSeats(getParam(request.params.screenId));
    response.json({ data: serialize(seats) });
  }

  async getShowtimeSeats(request: Request, response: Response) {
    const seats = await seatsService.getShowtimeSeats(getParam(request.params.id));
    response.json({ data: serialize(seats) });
  }

  async update(request: Request, response: Response) {
    const seat = await seatsService.updateSeat(request.user!, getParam(request.params.seatId), request.body);
    response.json({ data: serialize(seat) });
  }
}

export const seatsController = new SeatsController();
