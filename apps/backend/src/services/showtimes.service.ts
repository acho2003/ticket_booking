import { endOfDay, parseISO, startOfDay } from "date-fns";
import type { AuthUser } from "@bhutan/shared";

import { prisma } from "../lib/prisma.js";
import { theatresService } from "./theatres.service.js";
import { HttpError } from "../utils/http-error.js";
import { normalizeTwoClassPrices } from "../utils/pricing.js";
import { decorateShowtimeState } from "../utils/showtime-state.js";

export class ShowtimesService {
  async list(filters: { movieId?: string; theatreId?: string; date?: string }) {
    const start = filters.date ? startOfDay(parseISO(filters.date)) : undefined;
    const end = filters.date ? endOfDay(parseISO(filters.date)) : undefined;

    await this.completeEndedShows();

    const showtimes = await prisma.showtime.findMany({
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

    return this.withBookingState(showtimes);
  }

  async getById(id: string) {
    await this.completeEndedShows();

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

    return this.withBookingState(showtime);
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
      couplePrice?: number;
      status?: "ACTIVE" | "CANCELLED" | "COMPLETED";
    }
  ) {
    await theatresService.assertTheatreAccess(user, data.theatreId);
    await this.assertShowtimeIntegrity(data);
    await this.assertMovieExists(data.movieId);

    return prisma.showtime.create({
      data: {
        movieId: data.movieId,
        theatreId: data.theatreId,
        screenId: data.screenId,
        status: data.status,
        ...normalizeTwoClassPrices({
          regularPrice: data.regularPrice,
          vipPrice: data.vipPrice,
          couplePrice: data.couplePrice
        }),
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime)
      },
      include: {
        movie: true,
        theatre: true,
        screen: true
      }
    }).then((showtime) => this.withBookingState(showtime));
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
      couplePrice?: number;
      status: "ACTIVE" | "CANCELLED" | "COMPLETED";
      confirmTimeChangeWithBookings?: boolean;
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

    if (this.isTimeOrAssignmentChange(existing, payload)) {
      const bookingsCount = await prisma.booking.count({
        where: {
          showtimeId: id,
          status: { in: ["RESERVED", "CONFIRMED"] }
        }
      });

      if (bookingsCount > 0 && !data.confirmTimeChangeWithBookings) {
        throw new HttpError(
          409,
          "This showtime already has bookings. Confirm the time or screen change before saving."
        );
      }
    }

    await theatresService.assertTheatreAccess(user, payload.theatreId);
    await this.assertShowtimeIntegrity(payload, id);
    await this.assertMovieExists(payload.movieId);

    const priceData =
      data.regularPrice !== undefined || data.vipPrice !== undefined || data.couplePrice !== undefined
        ? normalizeTwoClassPrices({
            regularPrice: data.regularPrice ?? Number(existing.regularPrice),
            vipPrice: data.vipPrice ?? Number(existing.vipPrice),
            couplePrice: data.couplePrice ?? Number(existing.couplePrice)
          })
        : {};

    return prisma.showtime.update({
      where: { id },
      data: {
        movieId: data.movieId,
        theatreId: data.theatreId,
        screenId: data.screenId,
        status: data.status,
        ...priceData,
        startTime: data.startTime ? new Date(data.startTime) : undefined,
        endTime: data.endTime ? new Date(data.endTime) : undefined
      },
      include: {
        movie: true,
        theatre: true,
        screen: true
      }
    }).then((showtime) => this.withBookingState(showtime));
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

  private async assertMovieExists(movieId: string) {
    const movie = await prisma.movie.findUnique({
      where: { id: movieId }
    });

    if (!movie) {
      throw new HttpError(404, "Movie not found");
    }

    return movie;
  }

  private async completeEndedShows(now = new Date()) {
    await prisma.showtime.updateMany({
      where: {
        status: "ACTIVE",
        endTime: { lt: now }
      },
      data: {
        status: "COMPLETED"
      }
    });
  }

  private withBookingState<T extends { status: "ACTIVE" | "CANCELLED" | "COMPLETED"; startTime: Date; endTime: Date }>(
    showtime: T
  ): T & ReturnType<typeof decorateShowtimeState<T>>;
  private withBookingState<T extends { status: "ACTIVE" | "CANCELLED" | "COMPLETED"; startTime: Date; endTime: Date }>(
    showtime: T[]
  ): Array<T & ReturnType<typeof decorateShowtimeState<T>>>;
  private withBookingState<T extends { status: "ACTIVE" | "CANCELLED" | "COMPLETED"; startTime: Date; endTime: Date }>(
    showtime: T | T[]
  ) {
    const now = new Date();
    return Array.isArray(showtime)
      ? showtime.map((item) => decorateShowtimeState(item, now))
      : decorateShowtimeState(showtime, now);
  }

  private isTimeOrAssignmentChange(
    existing: {
      movieId: string;
      theatreId: string;
      screenId: string;
      startTime: Date;
      endTime: Date;
    },
    next: {
      movieId: string;
      theatreId: string;
      screenId: string;
      startTime: string;
      endTime: string;
    }
  ) {
    return (
      existing.movieId !== next.movieId ||
      existing.theatreId !== next.theatreId ||
      existing.screenId !== next.screenId ||
      existing.startTime.getTime() !== new Date(next.startTime).getTime() ||
      existing.endTime.getTime() !== new Date(next.endTime).getTime()
    );
  }
}

export const showtimesService = new ShowtimesService();
