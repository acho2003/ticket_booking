import type { Request, Response } from "express";

import { bookingsService } from "../services/bookings.service.js";
import { getParam } from "../utils/params.js";
import { serialize } from "../utils/serialize.js";

export class BookingsController {
  async create(request: Request, response: Response) {
    const booking = await bookingsService.create(request.user!, request.body);
    response.status(201).json({ data: serialize(booking) });
  }

  async myBookings(request: Request, response: Response) {
    const bookings = await bookingsService.listMine(request.user!);
    response.json({ data: serialize(bookings) });
  }

  async getById(request: Request, response: Response) {
    const booking = await bookingsService.getById(request.user!, getParam(request.params.id));
    response.json({ data: serialize(booking) });
  }

  async cancel(request: Request, response: Response) {
    const booking = await bookingsService.cancel(request.user!, getParam(request.params.id));
    response.json({ data: serialize(booking) });
  }

  async adminBookings(request: Request, response: Response) {
    const bookings = await bookingsService.listForAdmin(request.user!, request.query as { theatreId?: string; status?: "RESERVED" | "CONFIRMED" | "CANCELLED"; bookingCode?: string });
    response.json({ data: serialize(bookings) });
  }

  async adminConfirm(request: Request, response: Response) {
    const booking = await bookingsService.confirm(request.user!, getParam(request.params.id));
    response.json({ data: serialize(booking) });
  }

  async reports(request: Request, response: Response) {
    const report = await bookingsService.getReport(request.user!);
    response.json({ data: serialize(report) });
  }
}

export const bookingsController = new BookingsController();
