import type { AuthUser } from "@bhutan/shared";

import { prisma } from "../lib/prisma.js";
import { resolveSeatPrice } from "../utils/seat-pricing.js";
import { theatresService } from "./theatres.service.js";
import { HttpError } from "../utils/http-error.js";

export class SeatsService {
  async getScreenSeats(screenId: string) {
    const screen = await prisma.screen.findUnique({
      where: { id: screenId },
      include: {
        seats: {
          orderBy: [{ rowLabel: "asc" }, { seatNumber: "asc" }]
        }
      }
    });

    if (!screen) {
      throw new HttpError(404, "Screen not found");
    }

    return screen.seats;
  }

  async getShowtimeSeats(showtimeId: string) {
    const showtime = await prisma.showtime.findUnique({
      where: { id: showtimeId },
      include: {
        screen: {
          include: {
            seats: {
              orderBy: [{ rowLabel: "asc" }, { seatNumber: "asc" }]
            }
          }
        },
        bookings: {
          where: {
            status: { in: ["RESERVED", "CONFIRMED"] }
          },
          include: {
            bookingSeats: true
          }
        }
      }
    });

    if (!showtime) {
      throw new HttpError(404, "Showtime not found");
    }

    const reservedSeatMap = new Map<string, "RESERVED" | "BOOKED">();

    for (const booking of showtime.bookings) {
      for (const bookingSeat of booking.bookingSeats) {
        reservedSeatMap.set(bookingSeat.seatId, booking.status === "CONFIRMED" ? "BOOKED" : "RESERVED");
      }
    }

    return showtime.screen.seats.map((seat) => ({
      ...seat,
      status: seat.isBlocked || seat.seatType === "BLOCKED" ? "BLOCKED" : reservedSeatMap.get(seat.id) ?? "AVAILABLE",
      price: resolveSeatPrice(seat.seatType, {
        regularPrice: Number(showtime.regularPrice),
        vipPrice: Number(showtime.vipPrice),
        couplePrice: Number(showtime.couplePrice)
      })
    }));
  }

  async updateSeat(
    user: AuthUser,
    seatId: string,
    data: { seatType?: "REGULAR" | "VIP" | "COUPLE" | "BLOCKED"; isBlocked?: boolean }
  ) {
    const seat = await prisma.seat.findUnique({
      where: { id: seatId },
      include: {
        screen: true
      }
    });

    if (!seat) {
      throw new HttpError(404, "Seat not found");
    }

    await theatresService.assertTheatreAccess(user, seat.screen.theatreId);

    return prisma.seat.update({
      where: { id: seatId },
      data: {
        seatType: data.seatType,
        isBlocked:
          typeof data.isBlocked === "boolean"
            ? data.isBlocked
            : data.seatType === "BLOCKED"
              ? true
              : undefined
      }
    });
  }
}

export const seatsService = new SeatsService();
