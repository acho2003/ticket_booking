import type { AuthUser } from "@bhutan/shared";

import { prisma } from "../lib/prisma.js";
import { normalizeTwoClassPrices, resolveSeatPrice } from "../utils/pricing.js";
import { theatresService } from "./theatres.service.js";
import { HttpError } from "../utils/http-error.js";
import { decorateSeatsWithLayout, type ScreenLayoutConfig } from "../utils/screen-layout.js";
import { getShowtimeBookingState } from "../utils/showtime-state.js";

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

    return decorateSeatsWithLayout(screen.seats, screen.layoutConfig as ScreenLayoutConfig | null);
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

    const showtimeState = getShowtimeBookingState(showtime);
    const reservedSeatMap = new Map<string, "RESERVED" | "BOOKED">();

    for (const booking of showtime.bookings) {
      for (const bookingSeat of booking.bookingSeats) {
        reservedSeatMap.set(bookingSeat.seatId, booking.status === "CONFIRMED" ? "BOOKED" : "RESERVED");
      }
    }

    const priceLookup = normalizeTwoClassPrices({
      regularPrice: Number(showtime.regularPrice),
      vipPrice: Number(showtime.vipPrice),
      couplePrice: Number(showtime.couplePrice)
    });

    return decorateSeatsWithLayout(showtime.screen.seats, showtime.screen.layoutConfig as ScreenLayoutConfig | null).map((seat) => {
      const status =
        seat.isBlocked || seat.seatType === "BLOCKED"
          ? "BLOCKED"
          : reservedSeatMap.get(seat.id) ?? (showtimeState.canBook ? "AVAILABLE" : "BOOKED");

      return {
        ...seat,
        status,
        bookingStatus: showtimeState.bookingStatus,
        canBook: showtimeState.canBook,
        bookingClosesAt: showtimeState.bookingClosesAt,
        price: resolveSeatPrice(seat.seatType, priceLookup)
      };
    });
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
