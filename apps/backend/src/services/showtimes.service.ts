import { endOfDay, parseISO, startOfDay } from "date-fns";
import type { AuthUser } from "@bhutan/shared";

import { prisma } from "../lib/prisma.js";
import { theatresService } from "./theatres.service.js";
import { HttpError } from "../utils/http-error.js";

export class ShowtimesService {
  list(filters: { movieId?: string; theatreId?: string; date?: string }) {
    const start = filters.date ? startOfDay(parseISO(filters.date)) : undefined;
    const end = filters.date ? endOfDay(parseISO(filters.date)) : undefined;

    return prisma.showtime.findMany({
      where: {
        movieId: filters.movieId,
        theatreId: filters.theatreId,
        startTime: start && end ? { gte: start, lte: end } : undefined
      },
      include: {
        movie: true,
        theatre: true,
        screen: true
      },
      orderBy: { startTime: "asc" }
    });
  }

  async getById(id: string) {
    const showtime = await prisma.showtime.findUnique({
      where: { id },
      include: {
        movie: true,
        theatre: true,
        screen: true
      }
    });

    if (!showtime) {
      throw new HttpError(404, "Showtime not found");
    }

    return showtime;
  }

  getByMovie(movieId: string, filters: { theatreId?: string; date?: string }) {
    return this.list({
      movieId,
      theatreId: filters.theatreId,
      date: filters.date
    });
  }

  async create(
    user: AuthUser,
    data: {
      movieId: string;
      theatreId: string;
      screenId: string;
      startTime: string;
      endTime: string;
      regularPrice: number;
      vipPrice: number;
      couplePrice: number;
      status?: "ACTIVE" | "CANCELLED" | "COMPLETED";
    }
  ) {
    await theatresService.assertTheatreAccess(user, data.theatreId);
    await this.assertShowtimeIntegrity(data);

    return prisma.showtime.create({
      data: {
        ...data,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime)
      },
      include: {
        movie: true,
        theatre: true,
        screen: true
      }
    });
  }

  async update(
    user: AuthUser,
    id: string,
    data: Partial<{
      movieId: string;
      theatreId: string;
      screenId: string;
      startTime: string;
      endTime: string;
      regularPrice: number;
      vipPrice: number;
      couplePrice: number;
      status: "ACTIVE" | "CANCELLED" | "COMPLETED";
    }>
  ) {
    const existing = await this.getById(id);
    await theatresService.assertTheatreAccess(user, existing.theatreId);

    const payload = {
      movieId: data.movieId ?? existing.movieId,
      theatreId: data.theatreId ?? existing.theatreId,
      screenId: data.screenId ?? existing.screenId,
      startTime: data.startTime ?? existing.startTime.toISOString(),
      endTime: data.endTime ?? existing.endTime.toISOString(),
      regularPrice: data.regularPrice ?? Number(existing.regularPrice),
      vipPrice: data.vipPrice ?? Number(existing.vipPrice),
      couplePrice: data.couplePrice ?? Number(existing.couplePrice),
      status: data.status ?? existing.status
    };

    await theatresService.assertTheatreAccess(user, payload.theatreId);
    await this.assertShowtimeIntegrity(payload, id);

    return prisma.showtime.update({
      where: { id },
      data: {
        ...data,
        startTime: data.startTime ? new Date(data.startTime) : undefined,
        endTime: data.endTime ? new Date(data.endTime) : undefined
      },
      include: {
        movie: true,
        theatre: true,
        screen: true
      }
    });
  }

  async delete(user: AuthUser, id: string) {
    const showtime = await this.getById(id);
    await theatresService.assertTheatreAccess(user, showtime.theatreId);

    return prisma.showtime.delete({
      where: { id }
    });
  }

  private async assertShowtimeIntegrity(
    data: {
      movieId: string;
      theatreId: string;
      screenId: string;
      startTime: string;
      endTime: string;
    },
    showtimeId?: string
  ) {
    const screen = await prisma.screen.findUnique({
      where: { id: data.screenId }
    });

    if (!screen || screen.theatreId !== data.theatreId) {
      throw new HttpError(400, "Screen must belong to the selected theatre");
    }

    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    if (endTime <= startTime) {
      throw new HttpError(400, "End time must be after start time");
    }

    const overlappingShowtime = await prisma.showtime.findFirst({
      where: {
        id: showtimeId ? { not: showtimeId } : undefined,
        screenId: data.screenId,
        status: "ACTIVE",
        AND: [
          { startTime: { lt: endTime } },
          { endTime: { gt: startTime } }
        ]
      }
    });

    if (overlappingShowtime) {
      throw new HttpError(409, "This screen already has another active showtime in the selected time range");
    }
  }
}

export const showtimesService = new ShowtimesService();
